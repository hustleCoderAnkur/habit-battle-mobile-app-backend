import { z } from "zod";

/* =========================================================
   UPDATE MY PROFILE
========================================================= */

export const updateProfileSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name must not exceed 50 characters")
        .optional(),

    bio: z
        .string()
        .trim()
        .max(250, "Bio must not exceed 250 characters")
        .optional(),

    avatarUrl: z
        .string()
        .url("Invalid avatar URL")
        .nullable()
        .optional(),
});

/* =========================================================
   USER ID PARAM
========================================================= */

export const userIdParamSchema = z.object({
    id: z
        .string()
        .uuid("Invalid user ID"),
});

/* =========================================================
   ADMIN UPDATE USER
========================================================= */

export const adminUpdateUserSchema = z.object({
    email: z
        .string()
        .trim()
        .toLowerCase()
        .email("Invalid email address")
        .optional(),

    username: z
        .string()
        .trim()
        .min(3)
        .max(30)
        .regex(
            /^[a-zA-Z0-9_]+$/,
            "Username can only contain letters, numbers and underscores"
        )
        .optional(),
});

/* =========================================================
   ADMIN CHANGE STATUS
========================================================= */

export const changeUserStatusSchema = z.object({
    status: z.enum([
        "ACTIVE",
        "SUSPENDED",
        "DELETED",
    ]),
});

/* =========================================================
   ADMIN CHANGE ROLE
========================================================= */

export const changeUserRoleSchema = z.object({
    role: z.enum([
        "USER",
        "ADMIN",
        "SUPER_ADMIN",
    ]),
});

export const searchUsersQuerySchema = z.object({
    q: z
        .string()
        .trim()
        .min(1, "Search query is required")
        .max(50),
});

/* =========================================================
   TYPES
========================================================= */

export type UpdateProfileInput = z.infer<
    typeof updateProfileSchema
>;

export type AdminUpdateUserInput = z.infer<
    typeof adminUpdateUserSchema
>;

export type ChangeUserStatusInput = z.infer<
    typeof changeUserStatusSchema
>;

export type ChangeUserRoleInput = z.infer<
    typeof changeUserRoleSchema
>;

export type SearchUsersQuery = z.infer<
    typeof searchUsersQuerySchema
>;

/* =========================================================
   FIND PEOPLE (lookup by email / phone, match contacts)
========================================================= */

export const lookupUserQuerySchema = z
    .object({
        email: z.string().trim().toLowerCase().email("Invalid email address").optional(),
        phone: z.string().trim().min(1).max(25).optional(),
    })
    .refine((data) => Boolean(data.email) !== Boolean(data.phone), {
        message: "Provide either email or phone",
    });

export const matchContactsSchema = z.object({
    emails: z
        .array(z.string().trim().toLowerCase().email())
        .max(500, "Too many emails")
        .default([]),
    phones: z
        .array(z.string().trim().min(1).max(25))
        .max(500, "Too many phone numbers")
        .default([]),
});

export const updatePhoneSchema = z.object({
    phone: z.string().trim().max(25).nullable(),
});

export type LookupUserQuery = z.infer<typeof lookupUserQuerySchema>;
export type MatchContactsInput = z.infer<typeof matchContactsSchema>;
export type UpdatePhoneInput = z.infer<typeof updatePhoneSchema>;
