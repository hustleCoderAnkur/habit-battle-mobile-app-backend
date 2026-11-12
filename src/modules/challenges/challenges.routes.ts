import { Router } from "express";

import {
    createChallengeController,
    getChallengeController,
    getMyChallengesController,
    listChallengesController,
    updateChallengeController,
    deleteChallengeController,
    joinChallengeController,
    leaveChallengeController,
    getChallengeMembersController,
} from "./challenges.controller.js";

import { authenticate } from "../../middleware/auth/authenticate.js";
import { validate } from "../../middleware/validation.middleware.js";

import {
    createChallengeSchema,
    updateChallengeSchema,
    challengeListQuerySchema,
    challengeIdParamSchema,
} from "./challenges.validation.js";

const router = Router();

/* =========================================================
PUBLIC
========================================================= */

// GET /challenges
router.get(
    "/",
    validate({
        query: challengeListQuerySchema,
    }),
    listChallengesController
);

// GET /challenges/me
router.get(
    "/me",
    authenticate,
    getMyChallengesController
);

// GET /challenges/:id
router.get(
    "/:id",
    validate({
        params: challengeIdParamSchema,
    }),
    getChallengeController
);

/* =========================================================
AUTHENTICATED
========================================================= */

// POST /challenges
router.post(
    "/",
    authenticate,
    validate({
        body: createChallengeSchema,
    }),
    createChallengeController
);

// PATCH /challenges/:id
router.patch(
    "/:id",
    authenticate,
    validate({
        params: challengeIdParamSchema,
        body: updateChallengeSchema,
    }),
    updateChallengeController
);

// DELETE /challenges/:id
router.delete(
    "/:id",
    authenticate,
    validate({
        params: challengeIdParamSchema,
    }),
    deleteChallengeController
);

// POST /challenges/:id/join
router.post(
    "/:id/join",
    authenticate,
    validate({
        params: challengeIdParamSchema,
    }),
    joinChallengeController
);

// POST /challenges/:id/leave
router.post(
    "/:id/leave",
    authenticate,
    validate({
        params: challengeIdParamSchema,
    }),
    leaveChallengeController
);

// GET /challenges/:id/members
router.get(
    "/:id/members",
    authenticate,
    validate({
        params: challengeIdParamSchema,
    }),
    getChallengeMembersController
);

export default router;
