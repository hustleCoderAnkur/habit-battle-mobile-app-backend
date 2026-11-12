import type { NextFunction, Request, Response } from "express";

import type { AuthenticatedRequest } from "../../middleware/auth/authenticate.js";

import {
    friendUserIdParamSchema,
    friendshipIdParamSchema,
    sendFriendRequestSchema,
} from "./friendships.validation.js";

import {
    acceptFriendRequest,
    getFriends,
    getIncomingRequests,
    getOutgoingRequests,
    rejectFriendRequest,
    removeFriendship,
    sendFriendRequest,
} from "./friendships.service.js";

/* =========================================================
   SEND FRIEND REQUEST
   POST /api/friendships/request
========================================================= */

export async function sendFriendRequestController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { id: userId } =
            (req as AuthenticatedRequest).user;

        const input = sendFriendRequestSchema.parse(req.body);

        const friendship = await sendFriendRequest(
            userId,
            input
        );

        res.status(201).json({
            success: true,
            message: "Friend request sent successfully",
            data: friendship,
        });
    } catch (error) {
        next(error);
    }
}

/* =========================================================
   ACCEPT FRIEND REQUEST
   POST /api/friendships/:id/accept
========================================================= */

export async function acceptFriendRequestController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { id: userId } =
            (req as AuthenticatedRequest).user;

        const { id: friendshipId } =
            friendshipIdParamSchema.parse(req.params);

        const friendship = await acceptFriendRequest(
            userId,
            friendshipId
        );

        res.status(200).json({
            success: true,
            message: "Friend request accepted",
            data: friendship,
        });
    } catch (error) {
        next(error);
    }
}

/* =========================================================
   REJECT FRIEND REQUEST
   POST /api/friendships/:id/reject
========================================================= */

export async function rejectFriendRequestController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { id: userId } =
            (req as AuthenticatedRequest).user;

        const { id: friendshipId } =
            friendshipIdParamSchema.parse(req.params);

        const friendship = await rejectFriendRequest(
            userId,
            friendshipId
        );

        res.status(200).json({
            success: true,
            message: "Friend request rejected",
            data: friendship,
        });
    } catch (error) {
        next(error);
    }
}

/* =========================================================
   REMOVE FRIENDSHIP
   DELETE /api/friendships/:id
========================================================= */

export async function removeFriendshipController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { id: userId } =
            (req as AuthenticatedRequest).user;

        const { id: friendshipId } =
            friendshipIdParamSchema.parse(req.params);

        await removeFriendship(
            userId,
            friendshipId
        );

        res.status(200).json({
            success: true,
            message: "Friendship removed successfully",
        });
    } catch (error) {
        next(error);
    }
}

/* =========================================================
   GET MY FRIENDS
   GET /api/friendships
========================================================= */

export async function getFriendsController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { id: userId } =
            (req as AuthenticatedRequest).user;

        const friends = await getFriends(userId);

        res.status(200).json({
            success: true,
            data: friends,
        });
    } catch (error) {
        next(error);
    }
}

/* =========================================================
   GET INCOMING REQUESTS
   GET /api/friendships/requests/incoming
========================================================= */

export async function getIncomingRequestsController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { id: userId } =
            (req as AuthenticatedRequest).user;

        const requests =
            await getIncomingRequests(userId);

        res.status(200).json({
            success: true,
            data: requests,
        });
    } catch (error) {
        next(error);
    }
}

/* =========================================================
   GET OUTGOING REQUESTS
   GET /api/friendships/requests/outgoing
========================================================= */

export async function getOutgoingRequestsController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { id: userId } =
            (req as AuthenticatedRequest).user;

        const requests =
            await getOutgoingRequests(userId);

        res.status(200).json({
            success: true,
            data: requests,
        });
    } catch (error) {
        next(error);
    }
}

/* =========================================================
   GET USER FRIENDSHIP
   GET /api/friendships/user/:userId
========================================================= */

export async function getUserFriendshipController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { userId } =
            friendUserIdParamSchema.parse(req.params);

        const friends = await getFriends(userId);

        res.status(200).json({
            success: true,
            data: friends,
        });
    } catch (error) {
        next(error);
    }
}