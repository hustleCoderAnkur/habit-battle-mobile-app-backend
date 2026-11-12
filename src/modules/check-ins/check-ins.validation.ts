import { z } from "zod";

/* =========================================================
   CREATE CHECK-IN
========================================================= */

export const createCheckInSchema = z.object({
    checkInDate: z.coerce.date(),

    proofUrl: z
        .string()
        .url()
        .optional(),

    note: z
        .string()
        .trim()
        .max(1000)
        .optional(),
});

/* =========================================================
   CHECK-IN ID PARAM
========================================================= */

export const checkInIdParamSchema = z.object({
    checkInId: z.string().uuid(),
});

/* =========================================================
   CHALLENGE ID PARAM
========================================================= */

export const challengeIdParamSchema = z.object({
    challengeId: z.string().uuid(),
});

/* =========================================================
   CHALLENGE + CHECK-IN PARAM
========================================================= */

export const challengeCheckInParamSchema =
    z.object({
        challengeId: z.string().uuid(),
        checkInId: z.string().uuid().optional(),
    });

/* =========================================================
   VERIFY CHECK-IN
========================================================= */

export const verifyCheckInSchema = z.object({
    points: z
        .number()
        .int()
        .min(0)
        .max(100)
        .optional(),
});

/* =========================================================
   REJECT CHECK-IN
========================================================= */

export const rejectCheckInSchema = z.object({
    rejectionReason: z
        .string()
        .trim()
        .min(1)
        .max(500),
});

/* =========================================================
   CHECK-IN LIST QUERY
========================================================= */

export const checkInListQuerySchema = z.object({
    status: z
        .enum([
            "PENDING",
            "VERIFIED",
            "REJECTED",
        ])
        .optional(),

    userId: z
        .string()
        .uuid()
        .optional(),

    startDate: z
        .coerce
        .date()
        .optional(),

    endDate: z
        .coerce
        .date()
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

/* =========================================================
   STATS QUERY
========================================================= */

export const checkInStatsQuerySchema = z.object({
    startDate: z
        .coerce
        .date()
        .optional(),

    endDate: z
        .coerce
        .date()
        .optional(),
});

export const checkInIdParamsSchema = z.object({
    id: z.string().min(1),
});

export const challengeIdParamsSchema = z.object({
    challengeId: z.string().min(1),
});

/* =========================================================
   TYPES
========================================================= */

export type CreateCheckInInput = z.infer<
    typeof createCheckInSchema
>;

export type VerifyCheckInInput = z.infer<
    typeof verifyCheckInSchema
>;

export type RejectCheckInInput = z.infer<
    typeof rejectCheckInSchema
>;

export type CheckInListQuery = z.infer<
    typeof checkInListQuerySchema
>;

export type CheckInStatsQuery = z.infer<
    typeof checkInStatsQuerySchema
    >;

