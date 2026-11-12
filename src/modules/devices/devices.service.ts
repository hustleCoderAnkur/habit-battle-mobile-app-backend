import { desc, eq } from "drizzle-orm";

import { db } from "../../db/index.js";

import {
    devices,
} from "../../db/schema/schema.js";

import type {
    RegisterDeviceInput,
} from "./devices.validation.js";

/* =========================================================
   REGISTER / UPDATE PUSH TOKEN
========================================================= */

export async function registerDevice(
    userId: string,
    input: RegisterDeviceInput
) {
    const now = new Date();

    /*
     * pushToken is unique.
     * If the token already exists, update that device.
     */

    const [device] = await db
        .insert(devices)
        .values({
            id: crypto.randomUUID(),
            userId,
            pushToken: input.pushToken,
            platform: input.platform,
            deviceName: input.deviceName ?? null,
            isActive: true,
            lastUsedAt: now,
        })
        .onConflictDoUpdate({
            target: devices.pushToken,
            set: {
                userId,
                platform: input.platform,
                deviceName:
                    input.deviceName ?? null,
                isActive: true,
                lastUsedAt: now,
                updatedAt: now,
            },
        })
        .returning();

    if (!device) {
        throw new Error(
            "Failed to register device"
        );
    }

    return device;
}

/* =========================================================
   GET MY DEVICES
========================================================= */

export async function getUserDevices(
    userId: string
) {
    return db
        .select({
            id: devices.id,
            pushToken: devices.pushToken,
            platform: devices.platform,
            deviceName: devices.deviceName,
            isActive: devices.isActive,
            lastUsedAt: devices.lastUsedAt,
            createdAt: devices.createdAt,
            updatedAt: devices.updatedAt,
        })
        .from(devices)
        .where(
            eq(devices.userId, userId)
        )
        .orderBy(
            desc(devices.createdAt)
        );
}

/* =========================================================
   GET DEVICE BY ID
========================================================= */

export async function getDeviceById(
    userId: string,
    deviceId: string
) {
    const [device] = await db
        .select({
            id: devices.id,
            userId: devices.userId,
            pushToken: devices.pushToken,
            platform: devices.platform,
            deviceName: devices.deviceName,
            isActive: devices.isActive,
            lastUsedAt: devices.lastUsedAt,
            createdAt: devices.createdAt,
            updatedAt: devices.updatedAt,
        })
        .from(devices)
        .where(
            eq(devices.id, deviceId)
        )
        .limit(1);

    if (!device) {
        throw new Error(
            "Device not found"
        );
    }

    if (device.userId !== userId) {
        throw new Error(
            "You do not have access to this device"
        );
    }

    return device;
}

/* =========================================================
   DELETE DEVICE
========================================================= */

export async function deleteDevice(
    userId: string,
    deviceId: string
): Promise<void> {
    const device =
        await getDeviceById(
            userId,
            deviceId
        );

    await db
        .delete(devices)
        .where(
            eq(
                devices.id,
                device.id
            )
        );
}