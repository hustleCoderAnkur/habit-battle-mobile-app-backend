import { z } from "zod";

export const notificationTypeSchema = z.enum([
    "FRIEND_REQUEST",
    "FRIEND_ACCEPTED",
    "CHALLENGE_INVITE",
    "CHALLENGE_JOINED",
    "CHECK_IN_VERIFICATION",
    "CHECK_IN_VERIFIED",
    "CHECK_IN_REJECTED",
    "STREAK_MILESTONE",
    "CHALLENGE_COMPLETED",
    "SYSTEM",
]);

export const createNotificationSchema = z.object({
    userId: z.string().min(1),
    type: notificationTypeSchema,
    title: z.string().min(1).max(200),
    message: z.string().min(1).max(1000),
    data: z.string().optional().nullable(),
});

export const notificationIdParamsSchema = z.object({
    notificationId: z.string().min(1),
});

export const notificationListQuerySchema = z.object({
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

    unreadOnly: z
        .enum(["true", "false"])
        .transform((value) => value === "true")
        .default(false),
});

export const updateNotificationPreferencesSchema =
    z.object({
        friendRequests: z.boolean().optional(),
        challengeInvites: z.boolean().optional(),
        checkIns: z.boolean().optional(),
        streaks: z.boolean().optional(),
        system: z.boolean().optional(),
        pushEnabled: z.boolean().optional(),
    });

export type CreateNotificationInput = z.infer<
    typeof createNotificationSchema
>;

export type NotificationListQuery = z.infer<
    typeof notificationListQuerySchema
>;

export type UpdateNotificationPreferencesInput =
    z.infer<
        typeof updateNotificationPreferencesSchema
    >;