import { Router } from "express";

import { authenticate } from "../../middleware/auth/authenticate.js";
import { authorize } from "../../middleware/auth/authroize.js";
import { validate } from "../../middleware/validation.middleware.js";

import {
    adminUserListQuerySchema,
    adminUserIdParamsSchema,
    updateUserStatusSchema,
    updateUserRoleSchema,
    adminChallengeListQuerySchema,
    adminChallengeIdParamsSchema,
    adminAuditLogQuerySchema,
} from "./admin.validation.js";

import {
    dashboard,
    listUsers,
    getUser,
    updateUserStatus,
    updateUserRole,
    listChallenges,
    cancelChallenge,
    challengeStats,
    auditLogs,
} from "./admin.controller.js";

const router = Router();

/* =========================================================
   ADMIN AUTH
========================================================= */

router.use(authenticate);
router.use(authorize("ADMIN"));

/* =========================================================
   DASHBOARD
========================================================= */

router.get(
    "/dashboard",
    dashboard
);

/* =========================================================
   USERS
========================================================= */

router.get(
    "/users",
    validate({
        query: adminUserListQuerySchema,
    }),
    listUsers
);

router.get(
    "/users/:userId",
    validate({
        params: adminUserIdParamsSchema,
    }),
    getUser
);

router.patch(
    "/users/:userId/status",
    validate({
        params: adminUserIdParamsSchema,
        body: updateUserStatusSchema,
    }),
    updateUserStatus
);

router.patch(
    "/users/:userId/role",
    validate({
        params: adminUserIdParamsSchema,
        body: updateUserRoleSchema,
    }),
    updateUserRole
);

/* =========================================================
   CHALLENGES
========================================================= */

router.get(
    "/challenges",
    validate({
        query: adminChallengeListQuerySchema,
    }),
    listChallenges
);

router.get(
    "/challenges/:challengeId/stats",
    validate({
        params: adminChallengeIdParamsSchema,
    }),
    challengeStats
);

router.patch(
    "/challenges/:challengeId/cancel",
    validate({
        params: adminChallengeIdParamsSchema,
    }),
    cancelChallenge
);

/* =========================================================
   AUDIT LOGS
========================================================= */

router.get(
    "/audit-logs",
    validate({
        query: adminAuditLogQuerySchema,
    }),
    auditLogs
);

export default router;