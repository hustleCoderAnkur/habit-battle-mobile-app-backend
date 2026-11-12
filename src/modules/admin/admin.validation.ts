import { z } from "zod";

/* =========================================================
   USER LIST
========================================================= */

export const adminUserListQuerySchema = z.object({
    search: z.string().trim().optional(),

    status: z
        .enum([
            "ACTIVE",
            "SUSPENDED",
            "DELETED",
        ])
        .optional(),

    role: z
        .enum([
            "USER",
            "ADMIN",
        ])
        .optional(),

    limit: z.coerce
        .number()
        .int()
        .min(1)
        .max(100)
        .default(20),

    offset: z.coerce
        .number()
        .int()
        .min(0)
        .default(0),
});

export type AdminUserListQuery = z.infer<
    typeof adminUserListQuerySchema
>;

/* =========================================================
   USER ID PARAMS
========================================================= */

export const adminUserIdParamsSchema = z.object({
    userId: z.string().min(1),
});

export type AdminUserIdParams = z.infer<
    typeof adminUserIdParamsSchema
>;

/* =========================================================
   UPDATE USER STATUS
========================================================= */

export const updateUserStatusSchema = z.object({
    status: z.enum([
        "ACTIVE",
        "SUSPENDED",
        "DELETED",
    ]),
});

export type UpdateUserStatusInput = z.infer<
    typeof updateUserStatusSchema
>;

/* =========================================================
   UPDATE USER ROLE
========================================================= */

export const updateUserRoleSchema = z.object({
    role: z.enum([
        "USER",
        "ADMIN",
    ]),
});

export type UpdateUserRoleInput = z.infer<
    typeof updateUserRoleSchema
>;

/* =========================================================
   CHALLENGE LIST
========================================================= */

export const adminChallengeListQuerySchema =
    z.object({
        search: z.string().trim().optional(),

        status: z
            .enum([
                "UPCOMING",
                "ACTIVE",
                "COMPLETED",
                "CANCELLED",
            ])
            .optional(),

        limit: z.coerce
            .number()
            .int()
            .min(1)
            .max(100)
            .default(20),

        offset: z.coerce
            .number()
            .int()
            .min(0)
            .default(0),
    });

export type AdminChallengeListQuery = z.infer<
    typeof adminChallengeListQuerySchema
>;

/* =========================================================
   CHALLENGE ID
========================================================= */

export const adminChallengeIdParamsSchema =
    z.object({
        challengeId: z.string().min(1),
    });

export type AdminChallengeIdParams = z.infer<
    typeof adminChallengeIdParamsSchema
>;

/* =========================================================
   AUDIT LOG QUERY
========================================================= */

export const adminAuditLogQuerySchema = z.object({
    userId: z.string().min(1).optional(),

    action: z
        .enum([
            "USER_CREATED",
            "USER_UPDATED",
            "USER_SUSPENDED",
            "USER_UNSUSPENDED",
            "USER_DELETED",
            "ROLE_CHANGED",
            "FORCE_LOGOUT",
            "CHALLENGE_UPDATED",
            "CHALLENGE_DELETED",
            "CHECK_IN_VERIFIED",
            "CHECK_IN_REJECTED",
            "NOTIFICATION_SENT",
        ])
        .optional(),

    limit: z.coerce
        .number()
        .int()
        .min(1)
        .max(100)
        .default(50),

    offset: z.coerce
        .number()
        .int()
        .min(0)
        .default(0),
});

export type AdminAuditLogQuery = z.infer<
    typeof adminAuditLogQuerySchema
>;