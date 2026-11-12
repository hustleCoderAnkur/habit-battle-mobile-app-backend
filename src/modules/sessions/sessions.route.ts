import { Router } from "express";

import {
    getMySessionsController,
    getSessionController,
    revokeSessionController,
    revokeAllSessionsController,
} from "./sessions.controller.js";

import {
    sessionIdParamsSchema,
} from "./sessions.validation.js";

import { authenticate } from "../../middleware/auth/authenticate.js";

import { validate } from "../../middleware/validation.middleware.js";

const router = Router();

/* =========================================================
   AUTHENTICATION
========================================================= */

router.use(authenticate);

/* =========================================================
   GET MY SESSIONS
   GET /api/v1/sessions
========================================================= */

router.get(
    "/",
    getMySessionsController
);

/* =========================================================
   REVOKE ALL SESSIONS
   DELETE /api/v1/sessions
========================================================= */

router.delete(
    "/",
    revokeAllSessionsController
);

/* =========================================================
   GET SESSION
   GET /api/v1/sessions/:sessionId
========================================================= */

router.get(
    "/:sessionId",
    validate({
        params: sessionIdParamsSchema,
    }),
    getSessionController
);

/* =========================================================
   REVOKE SESSION
   DELETE /api/v1/sessions/:sessionId
========================================================= */

router.delete(
    "/:sessionId",
    validate({
        params: sessionIdParamsSchema,
    }),
    revokeSessionController
);

export default router;