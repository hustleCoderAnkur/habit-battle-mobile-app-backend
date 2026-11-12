import type {
    Request,
    Response,
    NextFunction,
} from "express";

import {
    registerDevice,
    getUserDevices,
    getDeviceById,
    deleteDevice,
} from "./devices.service.js";

import type {
    RegisterDeviceInput,
} from "./devices.validation.js";

/* =========================================================
   REGISTER DEVICE
========================================================= */

export async function registerDeviceController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user!.id;

        const device =
            await registerDevice(
                userId,
                req.body as RegisterDeviceInput
            );

        return res.status(201).json({
            success: true,
            message: "Device registered successfully",
            data: device,
        });
    } catch (error) {
        next(error);
    }
}

/* =========================================================
   GET MY DEVICES
========================================================= */

export async function getDevicesController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user!.id;

        const devices =
            await getUserDevices(userId);

        return res.status(200).json({
            success: true,
            data: devices,
        });
    } catch (error) {
        next(error);
    }
}

/* =========================================================
   GET DEVICE BY ID
========================================================= */

export async function getDeviceController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user!.id;

        const deviceId =
            req.params.deviceId;

        if (
            typeof deviceId !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid device ID",
            });
        }

        const device =
            await getDeviceById(
                userId,
                deviceId
            );

        return res.status(200).json({
            success: true,
            data: device,
        });
    } catch (error) {
        next(error);
    }
}

/* =========================================================
   DELETE DEVICE
========================================================= */

export async function deleteDeviceController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user!.id;

        const deviceId =
            req.params.deviceId;

        if (
            typeof deviceId !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid device ID",
            });
        }

        await deleteDevice(
            userId,
            deviceId
        );

        return res.status(200).json({
            success: true,
            message:
                "Device deleted successfully",
        });
    } catch (error) {
        next(error);
    }
}