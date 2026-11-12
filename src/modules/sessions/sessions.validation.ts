import { z } from "zod";

/* =========================================================
   SESSION ID PARAMS
========================================================= */

export const sessionIdParamsSchema = z.object({
    sessionId: z.string().min(1),
});

/* =========================================================
   CREATE SESSION
========================================================= */

export const createSessionSchema = z.object({
    userId: z.string().min(1),

    refreshTokenHash: z
        .string()
        .min(1),

    expiresAt: z.coerce.date(),

    userAgent: z
        .string()
        .max(1000)
        .optional(),

    ipAddress: z
        .string()
        .max(100)
        .optional(),
});

/* =========================================================
   SESSION LIST QUERY
========================================================= */

export const sessionListQuerySchema = z.object({
    userId: z.string().optional(),
});

/* =========================================================
   TYPES
========================================================= */

export type CreateSessionInput =
    z.infer<typeof createSessionSchema>;

export type SessionListQuery =
    z.infer<typeof sessionListQuerySchema>;