import { z } from "zod";

/* =========================================================
   REGISTER / UPDATE PUSH TOKEN
========================================================= */

export const registerDeviceSchema = z.object({
    pushToken: z
        .string()
        .min(1, "Push token is required"),

    platform: z.enum([
        "IOS",
        "ANDROID",
        "WEB",
    ]),

    deviceName: z
        .string()
        .min(1)
        .max(100)
        .optional(),
});

/* =========================================================
   DEVICE ID PARAMS
========================================================= */

export const deviceIdParamsSchema = z.object({
    deviceId: z
        .string()
        .min(1, "Device ID is required"),
});

/* =========================================================
   TYPES
========================================================= */

export type RegisterDeviceInput =
    z.infer<typeof registerDeviceSchema>;

export type DeviceIdParams =
    z.infer<typeof deviceIdParamsSchema>;