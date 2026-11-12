import type {
    Request,
    Response,
    NextFunction,
} from "express";

import {
    getNotificationPreferences,
    updateNotificationPreferences,
    resetNotificationPreferences,
    deleteNotificationPreferences,
} from "./notification-preferences.service.js";

/* =========================================================
   GET PREFERENCES
========================================================= */

export async function getPreferences(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user!.id;

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

export async function updatePreferences(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user!.id;

        const preferences =
            await updateNotificationPreferences(
                userId,
                req.body
            );

        return res.status(200).json({
            success: true,
            message:
                "Notification preferences updated successfully",
            data: preferences,
        });
    } catch (error) {
        next(error);
    }
}

/* =========================================================
   RESET PREFERENCES
========================================================= */

export async function resetPreferences(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user!.id;

        const preferences =
            await resetNotificationPreferences(
                userId
            );

        return res.status(200).json({
            success: true,
            message:
                "Notification preferences reset successfully",
            data: preferences,
        });
    } catch (error) {
        next(error);
    }
}

/* =========================================================
   DELETE PREFERENCES
========================================================= */

export async function deletePreferences(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user!.id;

        await deleteNotificationPreferences(
            userId
        );

        return res.status(200).json({
            success: true,
            message:
                "Notification preferences deleted successfully",
        });
    } catch (error) {
        next(error);
    }
}