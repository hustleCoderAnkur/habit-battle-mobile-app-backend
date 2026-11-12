import { Router } from "express";

import {
    createChallengeInviteController,
    getChallengeInviteController,
    listChallengeInvitesController,
    acceptChallengeInviteController,
    rejectChallengeInviteController,
    cancelChallengeInviteController,
} from "./challenge-invites.controller.js";

import { authenticate } from "../../middleware/auth/authenticate.js";

import { validate } from "../../middleware/validation.middleware.js";

import {
    createChallengeInviteSchema,
    inviteIdParamSchema,
    challengeInviteListQuerySchema,
} from "./challenge-invites.validation.js";

const router = Router();

/* =========================================================
   ALL INVITE ROUTES REQUIRE AUTHENTICATION
========================================================= */

router.use(authenticate);

/* =========================================================
   CREATE INVITE
   POST /challenge-invites
========================================================= */

router.post(
    "/",
    validate({
        body: createChallengeInviteSchema,
    }),
    createChallengeInviteController
);

/* =========================================================
   LIST RECEIVED INVITES
   GET /challenge-invites
========================================================= */

router.get(
    "/",
    validate({
        query: challengeInviteListQuerySchema,
    }),
    listChallengeInvitesController
);

/* =========================================================
   GET SINGLE INVITE
   GET /challenge-invites/:id
========================================================= */

router.get(
    "/:id",
    validate({
        params: inviteIdParamSchema,
    }),
    getChallengeInviteController
);

/* =========================================================
   ACCEPT INVITE
   POST /challenge-invites/:id/accept
========================================================= */

router.post(
    "/:id/accept",
    validate({
        params: inviteIdParamSchema,
    }),
    acceptChallengeInviteController
);

/* =========================================================
   REJECT INVITE
   POST /challenge-invites/:id/reject
========================================================= */

router.post(
    "/:id/reject",
    validate({
        params: inviteIdParamSchema,
    }),
    rejectChallengeInviteController
);

/* =========================================================
   CANCEL SENT INVITE
   DELETE /challenge-invites/:id
========================================================= */

router.delete(
    "/:id",
    validate({
        params: inviteIdParamSchema,
    }),
    cancelChallengeInviteController
);

export default router;