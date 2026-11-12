import { z } from "zod";

/* =========================================================
   UPDATE NOTIFICATION PREFERENCES
========================================================= */

export const updateNotificationPreferencesSchema = z
    .object({
        friendRequests: z.boolean().optional(),

        challengeInvites: z.boolean().optional(),

        checkIns: z.boolean().optional(),

        streaks: z.boolean().optional(),

        system: z.boolean().optional(),

        pushEnabled: z.boolean().optional(),
    })
    .refine(
        (data) => Object.keys(data).length > 0,
        {
            message:
                "At least one notification preference is required",
        }
    );

export type UpdateNotificationPreferencesInput =
    z.infer<
        typeof updateNotificationPreferencesSchema
    >;