
import { Router } from "express";

import { authenticate } from "../../middleware/auth/authenticate.js";
import { validate } from "../../middleware/validation.middleware.js";

import {
    createNotificationController,
    deleteNotificationController,
    getNotificationsController,
    getNotificationPreferencesController,
    getUnreadCountController,
    getUnreadNotificationsController,
    markAllNotificationsAsReadController,
    markNotificationAsReadController,
    updateNotificationPreferencesController,
} from "./notifications.controller.js";

import {
    createNotificationSchema,
    notificationIdParamsSchema,
    notificationListQuerySchema,
    updateNotificationPreferencesSchema,
} from "./notifications.validation.js";

const router = Router();

/* =========================================================
   AUTHENTICATION
   All notification routes require a logged-in user.
========================================================= */

router.use(authenticate);

/* =========================================================
   NOTIFICATION LIST
========================================================= */

/**
 * GET /notifications
 *
 * Get notifications for the authenticated user.
 *
 * Query:
 * - limit
 * - offset
 * - unreadOnly
 */
router.get(
    "/",
    validate({
        query: notificationListQuerySchema,
    }),
    getNotificationsController
);

/* =========================================================
   UNREAD NOTIFICATIONS
========================================================= */

/**
 * GET /notifications/unread
 *
 * Get all unread notifications.
 */
router.get(
    "/unread",
    getUnreadNotificationsController
);

/**
 * GET /notifications/unread/count
 *
 * Get unread notification count.
 *
 * Used by Home screen notification badge.
 */
router.get(
    "/unread/count",
    getUnreadCountController
);

/* =========================================================
   CREATE NOTIFICATION
========================================================= */

/**
 * POST /notifications
 *
 * Create a notification.
 *
 * IMPORTANT:
 * This endpoint should normally be used by trusted
 * backend/internal flows rather than directly by clients.
 */
router.post(
    "/",
    validate({
        body: createNotificationSchema,
    }),
    createNotificationController
);

/* =========================================================
   MARK AS READ
========================================================= */

/**
 * PATCH /notifications/read-all
 *
 * Mark all notifications of the authenticated user as read.
 *
 * IMPORTANT:
 * This route MUST come before /:notificationId/read.
 */
router.patch(
    "/read-all",
    markAllNotificationsAsReadController
);

/**
 * PATCH /notifications/:notificationId/read
 *
 * Mark one notification as read.
 */
router.patch(
    "/:notificationId/read",
    validate({
        params: notificationIdParamsSchema,
    }),
    markNotificationAsReadController
);

/* =========================================================
   DELETE NOTIFICATION
========================================================= */

/**
 * DELETE /notifications/:notificationId
 *
 * Delete one notification belonging to the authenticated user.
 */
router.delete(
    "/:notificationId",
    validate({
        params: notificationIdParamsSchema,
    }),
    deleteNotificationController
);

/* =========================================================
   NOTIFICATION PREFERENCES
========================================================= */

/**
 * GET /notifications/preferences
 *
 * Get notification preferences of the authenticated user.
 */
router.get(
    "/preferences",
    getNotificationPreferencesController
);

/**
 * PATCH /notifications/preferences
 *
 * Update notification preferences.
 */
router.patch(
    "/preferences",
    validate({
        body: updateNotificationPreferencesSchema,
    }),
    updateNotificationPreferencesController
);

export default router;
