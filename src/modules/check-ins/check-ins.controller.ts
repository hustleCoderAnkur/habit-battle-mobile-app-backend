import type {
    NextFunction,
    Request,
    Response,
} from "express";

import {
    createCheckIn,
    deleteCheckIn,
    getChallengeCheckIns,
    getChallengeCheckInStats,
    getCheckInById,
    getCheckInStats,
    getMyCheckIns,
    rejectCheckIn,
    verifyCheckIn,
} from "./check-ins.service.js";

/* =========================================================
   PARAM HELPER
========================================================= */

function getParam(
    req: Request,
    name: string
): string {
    const value = req.params[name];

    if (typeof value !== "string") {
        throw new Error(
            `Invalid ${name} parameter`
        );
    }

    return value;
}

/* =========================================================
   CREATE CHECK-IN
   POST /challenges/:challengeId/check-ins
========================================================= */

export async function createCheckInController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user!.id;

        const challengeId = getParam(
            req,
            "challengeId"
        );

        const checkIn = await createCheckIn(
            userId,
            challengeId,
            req.body
        );

        return res.status(201).json({
            success: true,
            message: "Check-in created successfully",
            data: checkIn,
        });
    } catch (error) {
        next(error);
    }
}

/* =========================================================
   GET CHECK-IN BY ID
   GET /check-ins/:id
========================================================= */

export async function getCheckInByIdController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user!.id;

        const checkInId = getParam(
            req,
            "id"
        );

        const checkIn =
            await getCheckInById(
                userId,
                checkInId
            );

        return res.status(200).json({
            success: true,
            data: checkIn,
        });
    } catch (error) {
        next(error);
    }
}

/* =========================================================
   GET CHALLENGE CHECK-INS
   GET /challenges/:challengeId/check-ins
========================================================= */

export async function getChallengeCheckInsController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const challengeId = getParam(
            req,
            "challengeId"
        );

        const checkIns =
            await getChallengeCheckIns(
                challengeId,
                req.query as any
            );

        return res.status(200).json({
            success: true,
            data: checkIns,
        });
    } catch (error) {
        next(error);
    }
}

/* =========================================================
   GET MY CHECK-INS
   GET /challenges/:challengeId/check-ins/me
========================================================= */

export async function getMyCheckInsController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user!.id;

        const challengeId = getParam(
            req,
            "challengeId"
        );

        const checkIns =
            await getMyCheckIns(
                userId,
                challengeId,
                req.query as any
            );

        return res.status(200).json({
            success: true,
            data: checkIns,
        });
    } catch (error) {
        next(error);
    }
}

/* =========================================================
   VERIFY CHECK-IN
   PATCH /check-ins/:id/verify
========================================================= */

export async function verifyCheckInController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const verifierId =
            req.user!.id;

        const checkInId = getParam(
            req,
            "id"
        );

        const checkIn =
            await verifyCheckIn(
                verifierId,
                checkInId,
                req.body
            );

        return res.status(200).json({
            success: true,
            message:
                "Check-in verified successfully",
            data: checkIn,
        });
    } catch (error) {
        next(error);
    }
}

/* =========================================================
   REJECT CHECK-IN
   PATCH /check-ins/:id/reject
========================================================= */

export async function rejectCheckInController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const verifierId =
            req.user!.id;

        const checkInId = getParam(
            req,
            "id"
        );

        const checkIn =
            await rejectCheckIn(
                verifierId,
                checkInId,
                req.body
            );

        return res.status(200).json({
            success: true,
            message:
                "Check-in rejected successfully",
            data: checkIn,
        });
    } catch (error) {
        next(error);
    }
}

/* =========================================================
   DELETE CHECK-IN
   DELETE /check-ins/:id
========================================================= */

export async function deleteCheckInController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user!.id;

        const checkInId = getParam(
            req,
            "id"
        );

        await deleteCheckIn(
            userId,
            checkInId
        );

        return res.status(200).json({
            success: true,
            message:
                "Check-in deleted successfully",
        });
    } catch (error) {
        next(error);
    }
}

/* =========================================================
   GLOBAL CHECK-IN STATS
   GET /check-ins/stats
========================================================= */

export async function getCheckInStatsController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const stats =
            await getCheckInStats(
                req.query as any
            );

        return res.status(200).json({
            success: true,
            data: stats,
        });
    } catch (error) {
        next(error);
    }
}

/* =========================================================
   CHALLENGE CHECK-IN STATS
   GET /challenges/:challengeId/check-ins/stats
========================================================= */

export async function getChallengeCheckInStatsController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const challengeId = getParam(
            req,
            "challengeId"
        );

        const stats =
            await getChallengeCheckInStats(
                challengeId,
                req.query as any
            );

        return res.status(200).json({
            success: true,
            data: stats,
        });
    } catch (error) {
        next(error);
    }
}