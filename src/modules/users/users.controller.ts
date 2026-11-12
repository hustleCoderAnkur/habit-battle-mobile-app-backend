import type { NextFunction, Request, Response } from "express";

import {
    lookupUser,
    matchContacts,
    setMyPhone,
} from "./users.service.js";
import {
    lookupUserQuerySchema,
    matchContactsSchema,
    updatePhoneSchema,
} from "./users.validation.js";

import type { AuthenticatedRequest } from "../../middleware/auth/authenticate.js";

import {
    adminUpdateUserSchema,
    changeUserRoleSchema,
    changeUserStatusSchema,
    searchUsersQuerySchema,
    updateProfileSchema,
    userIdParamSchema,
} from "./users.validation.js";

import {
    adminDeleteUser,
    adminUpdateUser,
    changeUserRole,
    changeUserStatus,
    deleteMyAccount,
    forceLogoutUser,
    getCurrentUser,
    getUserById,
    listUsers,
    searchUsers,
    updateProfile,
} from "./users.service.js";

/* =========================================================
   GET /api/users/me
========================================================= */

export async function getMeController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { id } = (req as AuthenticatedRequest).user;

        const user = await getCurrentUser(id);

        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
}

/* =========================================================
   GET /api/users/search
========================================================= */

export async function searchUsersController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { id } = (req as AuthenticatedRequest).user;
        const { q } = searchUsersQuerySchema.parse(req.query);

        const results = await searchUsers(q, id);

        res.status(200).json({
            success: true,
            data: results,
        });
    } catch (error) {
        next(error);
    }
}

/* =========================================================
   PATCH /api/users/me
========================================================= */

export async function updateMeController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { id } = (req as AuthenticatedRequest).user;

        const input = updateProfileSchema.parse(req.body);

        const profile = await updateProfile(id, input);

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: profile,
        });
    } catch (error) {
        next(error);
    }
}

/* =========================================================
   DELETE /api/users/me
========================================================= */

export async function deleteMeController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { id } = (req as AuthenticatedRequest).user;

        await deleteMyAccount(id);

        res.status(200).json({
            success: true,
            message: "Account deleted successfully",
        });
    } catch (error) {
        next(error);
    }
}

/* =========================================================
   GET /api/users/:id
========================================================= */

export async function getUserByIdController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { id } = userIdParamSchema.parse(req.params);

        const user = await getUserById(id);

        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
}

/* =========================================================
   ADMIN — GET USERS
   GET /api/admin/users
========================================================= */

export async function listUsersController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const limit = req.query.limit
            ? Number(req.query.limit)
            : undefined;

        const offset = req.query.offset
            ? Number(req.query.offset)
            : undefined;

        const status =
            typeof req.query.status === "string"
                ? (req.query.status as
                    | "ACTIVE"
                    | "SUSPENDED"
                    | "DELETED")
                : undefined;

        const role =
            typeof req.query.role === "string"
                ? (req.query.role as
                    | "USER"
                    | "ADMIN"
                    | "SUPER_ADMIN")
                : undefined;

        const search =
            typeof req.query.search === "string"
                ? req.query.search
                : undefined;

        const users = await listUsers({
            search,
            status,
            role,
            limit,
            offset,
        });

        res.status(200).json({
            success: true,
            data: users,
            pagination: {
                limit: limit ?? 20,
                offset: offset ?? 0,
                count: users.length,
            },
        });
    } catch (error) {
        next(error);
    }
}

/* =========================================================
   ADMIN — GET ANY USER
   GET /api/admin/users/:id
========================================================= */

export async function adminGetUserController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { id } = userIdParamSchema.parse(req.params);

        const user = await getUserById(id);

        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
}

/* =========================================================
   ADMIN — UPDATE USER
   PATCH /api/admin/users/:id
========================================================= */

export async function adminUpdateUserController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { id } = userIdParamSchema.parse(req.params);

        const input = adminUpdateUserSchema.parse(req.body);

        const user = await adminUpdateUser(id, input);

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: user,
        });
    } catch (error) {
        next(error);
    }
}

/* =========================================================
   ADMIN — CHANGE STATUS
   PATCH /api/admin/users/:id/status
========================================================= */

export async function changeUserStatusController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { id } = userIdParamSchema.parse(req.params);

        const input = changeUserStatusSchema.parse(req.body);

        const user = await changeUserStatus(id, input);

        res.status(200).json({
            success: true,
            message: "User status updated successfully",
            data: user,
        });
    } catch (error) {
        next(error);
    }
}

/* =========================================================
   ADMIN — CHANGE ROLE
   PATCH /api/admin/users/:id/role
========================================================= */

export async function changeUserRoleController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { id } = userIdParamSchema.parse(req.params);

        const input = changeUserRoleSchema.parse(req.body);

        const user = await changeUserRole(id, input);

        res.status(200).json({
            success: true,
            message: "User role updated successfully",
            data: user,
        });
    } catch (error) {
        next(error);
    }
}

/* =========================================================
   ADMIN — FORCE LOGOUT
   POST /api/admin/users/:id/force-logout
========================================================= */

export async function forceLogoutUserController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { id } = userIdParamSchema.parse(req.params);

        await forceLogoutUser(id);

        res.status(200).json({
            success: true,
            message: "User logged out from all devices",
        });
    } catch (error) {
        next(error);
    }
}

/* =========================================================
   ADMIN — DELETE USER
   DELETE /api/admin/users/:id
========================================================= */

export async function adminDeleteUserController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { id } = userIdParamSchema.parse(req.params);

        await adminDeleteUser(id);

        res.status(200).json({
            success: true,
            message: "User deleted successfully",
        });
    } catch (error) {
        next(error);
    }
}

/* =========================================================
   FIND PEOPLE
========================================================= */

/** GET /api/users/lookup?email=...  or  ?phone=... */
export async function lookupUserController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { id } = (req as AuthenticatedRequest).user;
        const query = lookupUserQuerySchema.parse(req.query);

        const user = await lookupUser(query, id);

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
}

/** POST /api/users/match-contacts  { emails: [], phones: [] } */
export async function matchContactsController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { id } = (req as AuthenticatedRequest).user;
        const input = matchContactsSchema.parse(req.body);

        const matches = await matchContacts(id, input);

        res.status(200).json({ success: true, data: matches });
    } catch (error) {
        next(error);
    }
}

/** PATCH /api/users/me/phone  { phone: string | null } */
export async function updateMyPhoneController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { id } = (req as AuthenticatedRequest).user;
        const { phone } = updatePhoneSchema.parse(req.body);

        const result = await setMyPhone(id, phone);

        res.status(200).json({
            success: true,
            message: "Mobile number updated",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}
