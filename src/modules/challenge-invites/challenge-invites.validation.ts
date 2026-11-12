import { z } from "zod";

export const createChallengeInviteSchema = z.object({
    challengeId: z.string().uuid(),
    receiverId: z.string().uuid(),
});

export const inviteIdParamSchema = z.object({
    id: z.string().uuid(),
});

export const challengeInviteListQuerySchema = z.object({
    status: z
        .enum([
            "PENDING",
            "ACCEPTED",
            "REJECTED",
            "EXPIRED",
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

export type CreateChallengeInviteInput = z.infer<
    typeof createChallengeInviteSchema
>;

export type ChallengeInviteListQuery = z.infer<
    typeof challengeInviteListQuerySchema
>;