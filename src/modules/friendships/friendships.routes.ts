import { Router } from "express";

import { authenticate } from "../../middleware/auth/authenticate.js";

import {
    acceptFriendRequestController,
    getFriendsController,
    getIncomingRequestsController,
    getOutgoingRequestsController,
    rejectFriendRequestController,
    removeFriendshipController,
    sendFriendRequestController,
} from "./friendships.controller.js";

const router = Router();

/* =========================================================
   FRIENDS
========================================================= */

// GET /api/friendships
router.get(
    "/",
    authenticate,
    getFriendsController
);

/* =========================================================
   FRIEND REQUESTS
========================================================= */

// POST /api/friendships/request
router.post(
    "/request",
    authenticate,
    sendFriendRequestController
);

// GET /api/friendships/requests/incoming
router.get(
    "/requests/incoming",
    authenticate,
    getIncomingRequestsController
);

// GET /api/friendships/requests/outgoing
router.get(
    "/requests/outgoing",
    authenticate,
    getOutgoingRequestsController
);

// POST /api/friendships/:id/accept
router.post(
    "/:id/accept",
    authenticate,
    acceptFriendRequestController
);

// POST /api/friendships/:id/reject
router.post(
    "/:id/reject",
    authenticate,
    rejectFriendRequestController
);

/* =========================================================
   REMOVE FRIEND
========================================================= */

// DELETE /api/friendships/:id
router.delete(
    "/:id",
    authenticate,
    removeFriendshipController
);

export default router;