import { Router } from "express";

import { authenticate } from "../../middleware/auth/authenticate.js";
import { rateLimit } from "../../middleware/rate-limit.middleware.js";
import { validate } from "../../middleware/validation.middleware.js";
import {
    lookupUserController,
    matchContactsController,
    updateMyPhoneController,
} from "./users.controller.js";
import {
    lookupUserQuerySchema,
    matchContactsSchema,
    updatePhoneSchema,
} from "./users.validation.js";
import { authorize } from "../../middleware/auth/authroize.js";

import {
    adminDeleteUserController,
    adminGetUserController,
    adminUpdateUserController,
    changeUserRoleController,
    changeUserStatusController,
    deleteMeController,
    forceLogoutUserController,
    getMeController,
    getUserByIdController,
    listUsersController,
    searchUsersController,
    updateMeController,
} from "./users.controller.js";

const router = Router();

/* =========================================================
   USER ROUTES
========================================================= */

// GET /api/users/search
router.get(
    "/search",
    authenticate,
    searchUsersController
);

// GET /api/users/me
router.get(
    "/me",
    authenticate,
    getMeController
);

/* FIND PEOPLE (must stay above "/:id") */

router.get(
    "/lookup",
    authenticate,
    rateLimit({ windowMs: 60_000, max: 30 }),
    validate({ query: lookupUserQuerySchema }),
    lookupUserController
);

router.post(
    "/match-contacts",
    authenticate,
    rateLimit({ windowMs: 60_000, max: 6 }),
    validate({ body: matchContactsSchema }),
    matchContactsController
);

router.patch(
    "/me/phone",
    authenticate,
    validate({ body: updatePhoneSchema }),
    updateMyPhoneController
);

// PATCH /api/users/me
router.patch(
    "/me",
    authenticate,
    updateMeController
);

// DELETE /api/users/me
router.delete(
    "/me",
    authenticate,
    deleteMeController
);

// GET /api/users/:id
router.get(
    "/:id",
    authenticate,
    getUserByIdController
);

/* =========================================================
   ADMIN ROUTES
========================================================= */

// GET /api/admin/users
router.get(
    "/admin/users",
    authenticate,
    authorize("ADMIN", "SUPER_ADMIN"),
    listUsersController
);

// GET /api/admin/users/:id
router.get(
    "/admin/users/:id",
    authenticate,
    authorize("ADMIN", "SUPER_ADMIN"),
    adminGetUserController
);

// PATCH /api/admin/users/:id
router.patch(
    "/admin/users/:id",
    authenticate,
    authorize("ADMIN", "SUPER_ADMIN"),
    adminUpdateUserController
);

// PATCH /api/admin/users/:id/status
router.patch(
    "/admin/users/:id/status",
    authenticate,
    authorize("ADMIN", "SUPER_ADMIN"),
    changeUserStatusController
);

// PATCH /api/admin/users/:id/role
router.patch(
    "/admin/users/:id/role",
    authenticate,
    authorize("SUPER_ADMIN"),
    changeUserRoleController
);

// POST /api/admin/users/:id/force-logout
router.post(
    "/admin/users/:id/force-logout",
    authenticate,
    authorize("ADMIN", "SUPER_ADMIN"),
    forceLogoutUserController
);

// DELETE /api/admin/users/:id
router.delete(
    "/admin/users/:id",
    authenticate,
    authorize("ADMIN", "SUPER_ADMIN"),
    adminDeleteUserController
);

export default router;