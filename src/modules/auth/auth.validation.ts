import { z } from "zod";

/* =========================================================
   REGISTER
========================================================= */

export const registerSchema = z.object({
    email: z
        .string()
        .trim()
        .toLowerCase()
        .email("Invalid email address"),

    username: z
        .string()
        .trim()
        .min(3, "Username must be at least 3 characters")
        .max(30, "Username must not exceed 30 characters")
        .regex(
            /^[a-zA-Z0-9_]+$/,
            "Username can only contain letters, numbers and underscores"
        ),

    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(128, "Password must not exceed 128 characters"),
    phone: z
        .string()
        .trim()
        .max(25, "Phone number is too long")
        .optional()
        .or(z.literal("")),
});

/* =========================================================
   LOGIN
========================================================= */

export const loginSchema = z.object({
    email: z
        .string()
        .trim()
        .toLowerCase()
        .email("Invalid email address"),

    password: z
        .string()
        .min(1, "Password is required"),
});

/* =========================================================
   REFRESH TOKEN
========================================================= */

export const refreshTokenSchema = z.object({
    refreshToken: z
        .string()
        .min(1, "Refresh token is required"),
});

/* =========================================================
   LOGOUT
========================================================= */

export const logoutSchema = z.object({
    refreshToken: z
        .string()
        .min(1, "Refresh token is required"),
});

/* =========================================================
   TYPES
========================================================= */

export type RegisterInput = z.infer<typeof registerSchema>;

export type LoginInput = z.infer<typeof loginSchema>;

export type RefreshTokenInput = z.infer<
    typeof refreshTokenSchema
>;

export type LogoutInput = z.infer<
    typeof logoutSchema
>;