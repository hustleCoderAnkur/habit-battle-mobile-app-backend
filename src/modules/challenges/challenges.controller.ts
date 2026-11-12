import type { Request, Response } from "express";

import {
    createChallenge,
    getChallengeById,
    getMyChallenges,
    listChallenges,
    updateChallenge,
    deleteChallenge,
    joinChallenge,
    leaveChallenge,
    getChallengeMembers,
} from "./challenges.service.js";

/* =========================================================
   CREATE CHALLENGE
   POST /challenges
========================================================= */

function getParam(
    value: string | string[] | undefined
): string {
    if (typeof value !== "string") {
        throw new Error("Invalid route parameter");
    }

    return value;
}

export async function createChallengeController(
    req: Request,
    res: Response
) {
    try {
        const userId = req.user!.id;

        const challenge = await createChallenge(
            userId,
            req.body
        );

        return res.status(201).json({
            success: true,
            message: "Challenge created successfully",
            data: challenge,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to create challenge",
        });
    }
}

/* =========================================================
   GET CHALLENGE
   GET /challenges/:id
========================================================= */

export async function getChallengeController(
    req: Request,
    res: Response
) {
    try {
        const challengeId = getParam(req.params.id);
        const challenge = await getChallengeById(challengeId);

        return res.status(200).json({
            success: true,
            data: challenge,
        });
    } catch (error) {
        return res.status(404).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Challenge not found",
        });
    }
}

/* =========================================================
   GET MY CHALLENGES
   GET /challenges/me
========================================================= */

export async function getMyChallengesController(
    req: Request,
    res: Response
) {
    try {
        const userId = req.user!.id;
        const challenges = await getMyChallenges(userId);

        return res.status(200).json({
            success: true,
            data: challenges,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to fetch your challenges",
        });
    }
}

/* =========================================================
   LIST CHALLENGES
   GET /challenges
========================================================= */

export async function listChallengesController(
    req: Request,
    res: Response
) {
    try {
        const query = {
            status:
                typeof req.query.status === "string"
                    ? req.query.status
                    : undefined,

            search:
                typeof req.query.search === "string"
                    ? req.query.search
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

        const challenges = await listChallenges(
            query as any
        );

        return res.status(200).json({
            success: true,
            data: challenges,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to fetch challenges",
        });
    }
}

/* =========================================================
   UPDATE CHALLENGE
   PATCH /challenges/:id
========================================================= */

export async function updateChallengeController(
    req: Request,
    res: Response
) {
    try {
        const userId = req.user!.id;

        const challengeId = getParam(req.params.id);
        const challenge = await updateChallenge(
            userId,
            challengeId,
            req.body
        );

        return res.status(200).json({
            success: true,
            message:
                "Challenge updated successfully",
            data: challenge,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to update challenge",
        });
    }
}

/* =========================================================
   CANCEL CHALLENGE
   DELETE /challenges/:id
========================================================= */

export async function deleteChallengeController(
    req: Request,
    res: Response
) {
    try {
        const userId = req.user!.id;

        const challengeId = req.params.id;

        if (typeof challengeId !== "string") {
            return res.status(400).json({
                success: false,
                message: "Invalid challenge ID",
            });
        }

        await deleteChallenge(
            userId,
            challengeId
        );

        return res.status(200).json({
            success: true,
            message:
                "Challenge cancelled successfully",
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to cancel challenge",
        });
    }
}

/* =========================================================
   JOIN CHALLENGE
   POST /challenges/:id/join
========================================================= */

export async function joinChallengeController(
    req: Request,
    res: Response
) {
    try {
        const userId = req.user!.id;

        const challengeId = req.params.id;

        if (typeof challengeId !== "string") {
            return res.status(400).json({
                success: false,
                message: "Invalid challenge ID",
            });
        }

        const member = await joinChallenge(
            userId,
            challengeId
        );

        return res.status(201).json({
            success: true,
            message:
                "Joined challenge successfully",
            data: member,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to join challenge",
        });
    }
}

/* =========================================================
   LEAVE CHALLENGE
   POST /challenges/:id/leave
========================================================= */

export async function leaveChallengeController(
    req: Request,
    res: Response
) {
    try {
        const userId = req.user!.id;

        const challengeId = req.params.id;

        if (typeof challengeId !== "string") {
            return res.status(400).json({
                success: false,
                message: "Invalid challenge ID",
            });
        }

        await leaveChallenge(
            userId,
            challengeId
        );

        return res.status(200).json({
            success: true,
            message:
                "Left challenge successfully",
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to leave challenge",
        });
    }
}

/* =========================================================
   GET MEMBERS
   GET /challenges/:id/members
========================================================= */

export async function getChallengeMembersController(
    req: Request,
    res: Response
) {
    try {
        const challengeId = req.params.id;

        if (typeof challengeId !== "string") {
            return res.status(400).json({
                success: false,
                message: "Invalid challenge ID",
            });
        }

        const members = await getChallengeMembers(
            challengeId
        );

        return res.status(200).json({
            success: true,
            data: members,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to fetch challenge members",
        });
    }
}