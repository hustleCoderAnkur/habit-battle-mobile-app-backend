import {
    and,
    desc,
    eq,
    sql,
} from "drizzle-orm";

import { db } from "../../db/index.js";

import {
    notifications,
    notificationPreferences,
} from "../../db/schema/schema.js";

import type {
    CreateNotificationInput,
    NotificationListQuery,
    UpdateNotificationPreferencesInput,
} from "./notifications.validation.js";

/* =========================================================
   CREATE NOTIFICATION
========================================================= */

export async function createNotification(
    input: CreateNotificationInput
) {
    const [notification] = await db
        .insert(notifications)
        .values({
            id: crypto.randomUUID(),
            userId: input.userId,
            type: input.type,
            title: input.title,
            message: input.message,
            data: input.data ?? null,
            isRead: false,
            readAt: null,
        })
        .returning();

    if (!notification) {
        throw new Error(
            "Failed to create notification"
        );
    }

    return notification;
}

/* =========================================================
   GET MY NOTIFICATIONS
========================================================= */

export async function getMyNotifications(
    userId: string,
    query: NotificationListQuery
) {
    const conditions = [
        eq(notifications.userId, userId),
    ];

    if (query.unreadOnly) {
        conditions.push(
            eq(notifications.isRead, false)
        );
    }

    return db
        .select({
            id: notifications.id,
            type: notifications.type,
            title: notifications.title,
            message: notifications.message,
            data: notifications.data,
            isRead: notifications.isRead,
            readAt: notifications.readAt,
            createdAt: notifications.createdAt,
        })
        .from(notifications)
        .where(and(...conditions))
        .orderBy(
            desc(notifications.createdAt)
        )
        .limit(query.limit)
        .offset(query.offset);
}

/* =========================================================
   GET UNREAD NOTIFICATIONS
========================================================= */

export async function getUnreadNotifications(
    userId: string
) {
    return db
        .select({
            id: notifications.id,
            type: notifications.type,
            title: notifications.title,
            message: notifications.message,
            data: notifications.data,
            isRead: notifications.isRead,
            readAt: notifications.readAt,
            createdAt: notifications.createdAt,
        })
        .from(notifications)
        .where(
            and(
                eq(notifications.userId, userId),
                eq(notifications.isRead, false)
            )
        )
        .orderBy(
            desc(notifications.createdAt)
        );
}

/* =========================================================
   MARK ONE AS READ
========================================================= */

export async function markNotificationAsRead(
    userId: string,
    notificationId: string
) {
    const [notification] = await db
        .update(notifications)
        .set({
            isRead: true,
            readAt: new Date(),
        })
        .where(
            and(
                eq(
                    notifications.id,
                    notificationId
                ),
                eq(
                    notifications.userId,
                    userId
                )
            )
        )
        .returning();

    if (!notification) {
        throw new Error(
            "Notification not found"
        );
    }

    return notification;
}

/* =========================================================
   MARK ALL AS READ
========================================================= */

export async function markAllNotificationsAsRead(
    userId: string
): Promise<void> {
    await db
        .update(notifications)
        .set({
            isRead: true,
            readAt: new Date(),
        })
        .where(
            and(
                eq(
                    notifications.userId,
                    userId
                ),
                eq(
                    notifications.isRead,
                    false
                )
            )
        );
}

/* =========================================================
   DELETE NOTIFICATION
========================================================= */

export async function deleteNotification(
    userId: string,
    notificationId: string
): Promise<void> {
    const deleted = await db
        .delete(notifications)
        .where(
            and(
                eq(
                    notifications.id,
                    notificationId
                ),
                eq(
                    notifications.userId,
                    userId
                )
            )
        )
        .returning({
            id: notifications.id,
        });

    if (deleted.length === 0) {
        throw new Error(
            "Notification not found"
        );
    }
}

/* =========================================================
   GET NOTIFICATION PREFERENCES
========================================================= */

export async function getNotificationPreferences(
    userId: string
) {
    let [preferences] = await db
        .select()
        .from(notificationPreferences)
        .where(
            eq(
                notificationPreferences.userId,
                userId
            )
        )
        .limit(1);

    if (!preferences) {
        [preferences] = await db
            .insert(notificationPreferences)
            .values({
                id: crypto.randomUUID(),
                userId,
                friendRequests: true,
                challengeInvites: true,
                checkIns: true,
                streaks: true,
                system: true,
                pushEnabled: true,
            })
            .returning();
    }

    if (!preferences) {
        throw new Error(
            "Failed to load notification preferences"
        );
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
    const existing =
        await getNotificationPreferences(userId);

    const [updated] = await db
        .update(notificationPreferences)
        .set({
            ...input,
            updatedAt: new Date(),
        })
        .where(
            eq(
                notificationPreferences.id,
                existing.id
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
   UNREAD COUNT
========================================================= */

export async function getUnreadNotificationCount(
    userId: string
) {
    const [result] = await db
        .select({
            count: sql<number>`count(*)`,
        })
        .from(notifications)
        .where(
            and(
                eq(
                    notifications.userId,
                    userId
                ),
                eq(
                    notifications.isRead,
                    false
                )
            )
        );

    return {
        count: Number(result?.count ?? 0),
    };
}