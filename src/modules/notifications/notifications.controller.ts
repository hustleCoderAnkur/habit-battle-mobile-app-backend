import type {
    NextFunction,
    Request,
    Response,
} from "express";

import {
    createNotification,
    deleteNotification,
    getMyNotifications,
    getNotificationPreferences,
    getUnreadNotificationCount,
    getUnreadNotifications,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    updateNotificationPreferences,
} from "./notifications.service.js";

function getUserId(req: Request): string {
    const user = (
        req as Request & {
            user?: {
                id: string;
            };
        }
    ).user;

    if (!user?.id) {
        throw new Error(
            "Authenticated user not found"
        );
    }

    return user.id;
}

/* =========================================================
   GET NOTIFICATIONS
========================================================= */

export async function getNotificationsController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = getUserId(req);

        const notifications =
            await getMyNotifications(
                userId,
                req.query as never
            );

        return res.status(200).json({
            success: true,
            data: notifications,
        });
    } catch (error) {
        next(error);
    }
}

/* =========================================================
   GET UNREAD NOTIFICATIONS
========================================================= */

export async function getUnreadNotificationsController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = getUserId(req);

        const notifications =
            await getUnreadNotifications(
                userId
            );

        return res.status(200).json({
            success: true,
            data: notifications,
        });
    } catch (error) {
        next(error);
    }
}

/* =========================================================
   GET UNREAD COUNT
========================================================= */

export async function getUnreadCountController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = getUserId(req);

        const result =
            await getUnreadNotificationCount(
                userId
            );

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

/* =========================================================
   CREATE NOTIFICATION
========================================================= */

export async function createNotificationController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const notification =
            await createNotification(
                req.body
            );

        return res.status(201).json({
            success: true,
            data: notification,
        });
    } catch (error) {
        next(error);
    }
}

/* =========================================================
   MARK ONE AS READ
========================================================= */

export async function markNotificationAsReadController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = getUserId(req);

        const notificationId = req.params.notificationId;

        if (typeof notificationId !== "string") {
            return res.status(400).json({
                success: false,
                message: "Invalid notification ID",
            });
        }

        const notification = await markNotificationAsRead(
            userId,
            notificationId
        );

        return res.status(200).json({
            success: true,
            data: notification,
        });
    } catch (error) {
        next(error);
    }
}

/* =========================================================
   MARK ALL AS READ
========================================================= */

export async function markAllNotificationsAsReadController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = getUserId(req);

        await markAllNotificationsAsRead(
            userId
        );

        return res.status(200).json({
            success: true,
            message:
                "All notifications marked as read",
        });
    } catch (error) {
        next(error);
    }
}

/* =========================================================
   DELETE NOTIFICATION
========================================================= */

export async function deleteNotificationController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = getUserId(req);

        const notificationId = req.params.notificationId;

        if (typeof notificationId !== "string") {
            return res.status(400).json({
                success: false,
                message: "Invalid notification ID",
            });
        }

        await deleteNotification(
            userId,
            notificationId
        );

        return res.status(200).json({
            success: true,
            message: "Notification deleted",
        });
    } catch (error) {
        next(error);
    }
}

/* =========================================================
   GET PREFERENCES
========================================================= */

export async function getNotificationPreferencesController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = getUserId(req);

        const preferences =
            await getNotificationPreferences(
                userId
            );

        return res.status(200).json({
            success: true,
            data: preferences,
        });
    } catch (error) {
        next(error);
    }
}

/* =========================================================
   UPDATE PREFERENCES
========================================================= */

export async function updateNotificationPreferencesController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = getUserId(req);

        const preferences =
            await updateNotificationPreferences(
                userId,
                req.body
            );

        return res.status(200).json({
            success: true,
            data: preferences,
        });
    } catch (error) {
        next(error);
    }
}