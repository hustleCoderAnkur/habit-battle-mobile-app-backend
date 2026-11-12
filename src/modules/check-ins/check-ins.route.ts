import { Router } from "express";

import {
    createCheckInController,
    deleteCheckInController,
    getChallengeCheckInStatsController,
    getChallengeCheckInsController,
    getCheckInByIdController,
    getCheckInStatsController,
    getMyCheckInsController,
    rejectCheckInController,
    verifyCheckInController,
} from "./check-ins.controller.js";

import { authenticate } from "../../middleware/auth/authenticate.js";

import { validate } from "../../middleware/validation.middleware.js";

import {
    createCheckInSchema,
    verifyCheckInSchema,
    rejectCheckInSchema,
    checkInListQuerySchema,
    checkInStatsQuerySchema,
    checkInIdParamsSchema,
    challengeIdParamsSchema,
} from "./check-ins.validation.js";

const router = Router();

/* =========================================================
   ALL CHECK-IN ROUTES REQUIRE AUTHENTICATION
========================================================= */

router.use(authenticate);

/* =========================================================
   GLOBAL STATS
   GET /check-ins/stats
========================================================= */

router.get(
    "/stats",
    validate({
        query: checkInStatsQuerySchema,
    }),
    getCheckInStatsController
);

/* =========================================================
   CHECK-IN BY ID
   GET /check-ins/:id
========================================================= */

router.get(
    "/:id",
    validate({
        params: checkInIdParamsSchema,
    }),
    getCheckInByIdController
);

/* =========================================================
   VERIFY CHECK-IN
   PATCH /check-ins/:id/verify
========================================================= */

router.patch(
    "/:id/verify",
    validate({
        params: checkInIdParamsSchema,
        body: verifyCheckInSchema,
    }),
    verifyCheckInController
);

/* =========================================================
   REJECT CHECK-IN
   PATCH /check-ins/:id/reject
========================================================= */

router.patch(
    "/:id/reject",
    validate({
        params: checkInIdParamsSchema,
        body: rejectCheckInSchema,
    }),
    rejectCheckInController
);

/* =========================================================
   DELETE CHECK-IN
   DELETE /check-ins/:id
========================================================= */

router.delete(
    "/:id",
    validate({
        params: checkInIdParamsSchema,
    }),
    deleteCheckInController
);

/* =========================================================
   CHALLENGE CHECK-INS
   GET /challenges/:challengeId/check-ins
========================================================= */

export const challengeCheckInRouter =
    Router();

challengeCheckInRouter.use(
    authenticate
);

/* =========================================================
   CHALLENGE STATS
   GET /challenges/:challengeId/check-ins/stats
========================================================= */

challengeCheckInRouter.get(
    "/:challengeId/check-ins/stats",
    validate({
        params:
            challengeIdParamsSchema,
        query:
            checkInStatsQuerySchema,
    }),
    getChallengeCheckInStatsController
);

/* =========================================================
   MY CHECK-INS
   GET /challenges/:challengeId/check-ins/me
========================================================= */

challengeCheckInRouter.get(
    "/:challengeId/check-ins/me",
    validate({
        params:
            challengeIdParamsSchema,
        query:
            checkInListQuerySchema,
    }),
    getMyCheckInsController
);

/* =========================================================
   ALL CHALLENGE CHECK-INS
   GET /challenges/:challengeId/check-ins
========================================================= */

challengeCheckInRouter.get(
    "/:challengeId/check-ins",
    validate({
        params:
            challengeIdParamsSchema,
        query:
            checkInListQuerySchema,
    }),
    getChallengeCheckInsController
);

/* =========================================================
   CREATE CHECK-IN
   POST /challenges/:challengeId/check-ins
========================================================= */

challengeCheckInRouter.post(
    "/:challengeId/check-ins",
    validate({
        params:
            challengeIdParamsSchema,
        body:
            createCheckInSchema,
    }),
    createCheckInController
);

export default router;