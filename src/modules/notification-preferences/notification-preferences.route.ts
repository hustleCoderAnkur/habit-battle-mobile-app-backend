import { Router } from "express";

import { authenticate } from "../../middleware/auth/authenticate.js";
import { validate } from "../../middleware/validation.middleware.js";

import {
    updateNotificationPreferencesSchema,
} from "./notification-preferences.validation.js";

import {
    getPreferences,
    updatePreferences,
    resetPreferences,
    deletePreferences,
} from "./notification-preferences.controller.js";

const router = Router();

/* =========================================================
   ALL ROUTES REQUIRE AUTHENTICATION
========================================================= */

router.use(authenticate);

/* =========================================================
   GET CURRENT USER PREFERENCES
   GET /notification-preferences
========================================================= */

router.get(
    "/",
    getPreferences
);

/* =========================================================
   UPDATE CURRENT USER PREFERENCES
   PATCH /notification-preferences
========================================================= */

router.patch(
    "/",
    validate({
        body: updateNotificationPreferencesSchema,
    }),
    updatePreferences
);

/* =========================================================
   RESET CURRENT USER PREFERENCES
   POST /notification-preferences/reset
========================================================= */

router.post(
    "/reset",
    resetPreferences
);

/* =========================================================
   DELETE CURRENT USER PREFERENCES
   DELETE /notification-preferences
========================================================= */

router.delete(
    "/",
    deletePreferences
);

export default router;