import { eq } from "drizzle-orm";

import { db } from "../../db/index.js";

import {
    notificationPreferences,
} from "../../db/schema/schema.js";

import type {
    UpdateNotificationPreferencesInput,
} from "./notification-preferences.validation.js";

/* =========================================================
   GET NOTIFICATION PREFERENCES
========================================================= */

export async function getNotificationPreferences(
    userId: string
) {
    const [preferences] = await db
        .select({
            id: notificationPreferences.id,

            userId: notificationPreferences.userId,

            friendRequests:
                notificationPreferences.friendRequests,

            challengeInvites:
                notificationPreferences.challengeInvites,

            checkIns:
                notificationPreferences.checkIns,

            streaks:
                notificationPreferences.streaks,

            system:
                notificationPreferences.system,

            pushEnabled:
                notificationPreferences.pushEnabled,

            updatedAt:
                notificationPreferences.updatedAt,
        })
        .from(notificationPreferences)
        .where(
            eq(
                notificationPreferences.userId,
                userId
            )
        )
        .limit(1);

    /*
     * If preferences don't exist yet,
     * create them with database defaults.
     */

    if (!preferences) {
        const [created] = await db
            .insert(notificationPreferences)
            .values({
                id: crypto.randomUUID(),
                userId,
            })
            .returning();

        if (!created) {
            throw new Error(
                "Failed to create notification preferences"
            );
        }

        return created;
    }

    return preferences;
}

/* =========================================================
   UPDATE NOTIFICATION PREFERENCES
========================================================= */

export async function updateNotificationPreferences(
    userId: string,
    input: UpdateNotificationPreferencesInput
) {
    /*
     * Make sure preferences exist.
     */

    const [existing] = await db
        .select({
            id: notificationPreferences.id,
        })
        .from(notificationPreferences)
        .where(
            eq(
                notificationPreferences.userId,
                userId
            )
        )
        .limit(1);

    /*
     * Create preferences if they don't exist.
     */

    if (!existing) {
        const [created] = await db
            .insert(notificationPreferences)
            .values({
                id: crypto.randomUUID(),
                userId,

                friendRequests:
                    input.friendRequests ?? true,

                challengeInvites:
                    input.challengeInvites ?? true,

                checkIns:
                    input.checkIns ?? true,

                streaks:
                    input.streaks ?? true,

                system:
                    input.system ?? true,

                pushEnabled:
                    input.pushEnabled ?? true,
            })
            .returning();

        if (!created) {
            throw new Error(
                "Failed to create notification preferences"
            );
        }

        return created;
    }

    /*
     * Update existing preferences.
     */

    const [updated] = await db
        .update(notificationPreferences)
        .set({
            ...input,
            updatedAt: new Date(),
        })
        .where(
            eq(
                notificationPreferences.userId,
                userId
            )
        )
        .returning();

    if (!updated) {
        throw new Error(
            "Failed to update notification preferences"
        );
    }

    return updated;
}

/* =========================================================
   RESET NOTIFICATION PREFERENCES
========================================================= */

export async function resetNotificationPreferences(
    userId: string
) {
    const [existing] = await db
        .select({
            id: notificationPreferences.id,
        })
        .from(notificationPreferences)
        .where(
            eq(
                notificationPreferences.userId,
                userId
            )
        )
        .limit(1);

    /*
     * If no preferences exist,
     * create them using database defaults.
     */

    if (!existing) {
        const [created] = await db
            .insert(notificationPreferences)
            .values({
                id: crypto.randomUUID(),
                userId,
            })
            .returning();

        if (!created) {
            throw new Error(
                "Failed to reset notification preferences"
            );
        }

        return created;
    }

    const [reset] = await db
        .update(notificationPreferences)
        .set({
            friendRequests: true,
            challengeInvites: true,
            checkIns: true,
            streaks: true,
            system: true,
            pushEnabled: true,
            updatedAt: new Date(),
        })
        .where(
            eq(
                notificationPreferences.userId,
                userId
            )
        )
        .returning();

    if (!reset) {
        throw new Error(
            "Failed to reset notification preferences"
        );
    }

    return reset;
}

/* =========================================================
   DELETE NOTIFICATION PREFERENCES
========================================================= */

export async function deleteNotificationPreferences(
    userId: string
): Promise<void> {
    const [existing] = await db
        .select({
            id: notificationPreferences.id,
        })
        .from(notificationPreferences)
        .where(
            eq(
                notificationPreferences.userId,
                userId
            )
        )
        .limit(1);

    if (!existing) {
        throw new Error(
            "Notification preferences not found"
        );
    }

    await db
        .delete(notificationPreferences)
        .where(
            eq(
                notificationPreferences.userId,
                userId
            )
        );
}