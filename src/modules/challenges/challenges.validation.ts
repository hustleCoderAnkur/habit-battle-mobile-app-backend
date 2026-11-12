import { z } from "zod";

/* =========================================================
   CREATE CHALLENGE
========================================================= */

export const createChallengeSchema = z.object({
    name: z
        .string()
        .trim()
        .min(3, "Challenge name must be at least 3 characters")
        .max(100, "Challenge name must not exceed 100 characters"),

    description: z
        .string()
        .trim()
        .max(
            500,
            "Description must not exceed 500 characters"
        )
        .optional(),

    startDate: z.coerce.date(),

    endDate: z.coerce.date(),

    maxMembers: z
        .number()
        .int()
        .min(2, "Challenge must allow at least 2 members")
        .max(
            100,
            "Challenge cannot have more than 100 members"
        )
        .optional(),

}).refine(
    (data) => data.endDate > data.startDate,
    {
        message: "End date must be after start date",
        path: ["endDate"],
    }
);

/* =========================================================
   UPDATE CHALLENGE
========================================================= */

export const updateChallengeSchema = z.object({
    name: z
        .string()
        .trim()
        .min(3)
        .max(100)
        .optional(),

    description: z
        .string()
        .trim()
        .max(500)
        .nullable()
        .optional(),

    startDate: z
        .coerce
        .date()
        .optional(),

    endDate: z
        .coerce
        .date()
        .optional(),

    maxMembers: z
        .number()
        .int()
        .min(2)
        .max(100)
        .optional(),
});

/* =========================================================
   CHALLENGE ID PARAM
========================================================= */

export const challengeIdParamSchema = z.object({
    id: z
        .string()
        .uuid("Invalid challenge ID"),
});

/* =========================================================
   CHALLENGE LIST QUERY
========================================================= */

export const challengeListQuerySchema = z.object({
    status: z
        .enum([
            "UPCOMING",
            "ACTIVE",
            "COMPLETED",
            "CANCELLED",
        ])
        .optional(),

    search: z
        .string()
        .trim()
        .max(100)
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
   INVITE MEMBER
========================================================= */

export const inviteMemberSchema = z.object({
    userId: z
        .string()
        .uuid("Invalid user ID"),
});

/* =========================================================
   TYPES
========================================================= */

export type CreateChallengeInput = z.infer<
    typeof createChallengeSchema
>;

export type UpdateChallengeInput = z.infer<
    typeof updateChallengeSchema
>;

export type ChallengeListQuery = z.infer<
    typeof challengeListQuerySchema
>;

export type InviteMemberInput = z.infer<
    typeof inviteMemberSchema
>;