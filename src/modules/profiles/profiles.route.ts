import { Router } from "express";

import {
    getMyProfileController,
    getProfileController,
    updateMyProfileController,
} from "./profiles.controller.js";

import {
    updateProfileSchema,
} from "./profiles.validation.js";

import { authenticate } from "../../middleware/auth/authenticate.js";

import { validate } from "../../middleware/validation.middleware.js";

const router = Router();

/* =========================================================
   AUTHENTICATION
========================================================= */

router.use(authenticate);

/* =========================================================
   MY PROFILE
========================================================= */

router.get(
    "/me",
    getMyProfileController
);

router.patch(
    "/me",
    validate({
        body: updateProfileSchema,
    }),
    updateMyProfileController
);

/* =========================================================
   USER PROFILE
========================================================= */

router.get(
    "/user/:userId",
    getProfileController
);

export default router;