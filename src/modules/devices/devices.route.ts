import { Router } from "express";

import {
    registerDeviceController,
    getDevicesController,
    getDeviceController,
    deleteDeviceController,
} from "./devices.controller.js";

import {
    registerDeviceSchema,
    deviceIdParamsSchema,
} from "./devices.validation.js";

import { authenticate } from "../../middleware/auth/authenticate.js";
import { validate } from "../../middleware/validation.middleware.js";

const router = Router();

/* =========================================================
   ALL DEVICE ROUTES REQUIRE AUTHENTICATION
========================================================= */

router.use(authenticate);

/* =========================================================
   REGISTER / UPDATE PUSH TOKEN
   POST /api/v1/devices/push-token
========================================================= */

router.post(
    "/push-token",
    validate({
        body: registerDeviceSchema,
    }),
    registerDeviceController
);

/* =========================================================
   GET MY DEVICES
   GET /api/v1/devices
========================================================= */

router.get(
    "/",
    getDevicesController
);

/* =========================================================
   GET DEVICE
   GET /api/v1/devices/:deviceId
========================================================= */

router.get(
    "/:deviceId",
    validate({
        params: deviceIdParamsSchema,
    }),
    getDeviceController
);

/* =========================================================
   DELETE DEVICE
   DELETE /api/v1/devices/:deviceId
========================================================= */

router.delete(
    "/:deviceId",
    validate({
        params: deviceIdParamsSchema,
    }),
    deleteDeviceController
);

export default router;