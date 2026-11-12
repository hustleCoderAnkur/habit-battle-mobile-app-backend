import type {
    Request,
    Response,
} from "express";

import {
    createChallengeInvite,
    getChallengeInviteById,
    listChallengeInvites,
    acceptChallengeInvite,
    rejectChallengeInvite,
    cancelChallengeInvite,
} from "./challenge-invites.service.js";

/* =========================================================
   CREATE INVITE
========================================================= */

export async function createChallengeInviteController(
    req: Request,
    res: Response
) {
    try {
        const userId = req.user!.id;

        const invite =
            await createChallengeInvite(
                userId,
                req.body
            );

        return res.status(201).json({
            success: true,
            message:
                "Challenge invite sent successfully",
            data: invite,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to send challenge invite",
        });
    }
}

/* =========================================================
   GET INVITE
========================================================= */

export async function getChallengeInviteController(
    req: Request,
    res: Response
) {
    try {
        const userId = req.user!.id;
        const inviteId = req.params.id;

        if (typeof inviteId !== "string") {
            return res.status(400).json({
                success: false,
                message: "Invalid invite ID",
            });
        }

        const invite =
            await getChallengeInviteById(
                userId,
                inviteId
            );

        return res.status(200).json({
            success: true,
            data: invite,
        });
    } catch (error) {
        return res.status(404).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Invite not found",
        });
    }
}

/* =========================================================
   LIST INVITES
========================================================= */

export async function listChallengeInvitesController(
    req: Request,
    res: Response
) {
    try {
        const userId = req.user!.id;

        const query = {
            status:
                typeof req.query.status === "string"
                    ? req.query.status
                    : undefined,

            limit:
                typeof req.query.limit === "string"
                    ? Number(req.query.limit)
                    : 20,

            offset:
                typeof req.query.offset === "string"
                    ? Number(req.query.offset)
                    : 0,
        };

        const invites =
            await listChallengeInvites(
                userId,
                query as any
            );

        return res.status(200).json({
            success: true,
            data: invites,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to fetch invites",
        });
    }
}

/* =========================================================
   ACCEPT INVITE
========================================================= */

export async function acceptChallengeInviteController(
    req: Request,
    res: Response
) {
    try {
        const userId = req.user!.id;
        const inviteId = req.params.id;

        if (typeof inviteId !== "string") {
            return res.status(400).json({
                success: false,
                message: "Invalid invite ID",
            });
        }

        const member =
            await acceptChallengeInvite(
                userId,
                inviteId
            );

        return res.status(200).json({
            success: true,
            message:
                "Challenge invite accepted successfully",
            data: member,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to accept invite",
        });
    }
}

/* =========================================================
   REJECT INVITE
========================================================= */

export async function rejectChallengeInviteController(
    req: Request,
    res: Response
) {
    try {
        const userId = req.user!.id;
        const inviteId = req.params.id;

        if (typeof inviteId !== "string") {
            return res.status(400).json({
                success: false,
                message: "Invalid invite ID",
            });
        }

        await rejectChallengeInvite(
            userId,
            inviteId
        );

        return res.status(200).json({
            success: true,
            message:
                "Challenge invite rejected successfully",
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to reject invite",
        });
    }
}

/* =========================================================
   CANCEL SENT INVITE
========================================================= */

export async function cancelChallengeInviteController(
    req: Request,
    res: Response
) {
    try {
        const userId = req.user!.id;
        const inviteId = req.params.id;

        if (typeof inviteId !== "string") {
            return res.status(400).json({
                success: false,
                message: "Invalid invite ID",
            });
        }

        await cancelChallengeInvite(
            userId,
            inviteId
        );

        return res.status(200).json({
            success: true,
            message:
                "Challenge invite cancelled successfully",
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to cancel invite",
        });
    }
}