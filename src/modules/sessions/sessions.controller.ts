import type {
    NextFunction,
    Request,
    Response,
} from "express";

import {
    getSessionById,
    getMySessions,
    revokeSession,
    revokeAllSessions,
} from "./sessions.service.js";

/* =========================================================
   GET MY SESSIONS
========================================================= */

export async function getMySessionsController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user!.id;

        const result =
            await getMySessions(userId);

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

/* =========================================================
   GET SESSION BY ID
========================================================= */

export async function getSessionController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user!.id;

        const sessionId =
            req.params.sessionId;

        if (
            typeof sessionId !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid session ID",
            });
        }

        const session =
            await getSessionById(
                userId,
                sessionId
            );

        return res.status(200).json({
            success: true,
            data: session,
        });
    } catch (error) {
        next(error);
    }
}

/* =========================================================
   REVOKE SESSION
========================================================= */

export async function revokeSessionController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user!.id;

        const sessionId =
            req.params.sessionId;

        if (
            typeof sessionId !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid session ID",
            });
        }

        await revokeSession(
            userId,
            sessionId
        );

        return res.status(200).json({
            success: true,
            message:
                "Session revoked successfully",
        });
    } catch (error) {
        next(error);
    }
}

/* =========================================================
   REVOKE ALL SESSIONS
========================================================= */

export async function revokeAllSessionsController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user!.id;

        await revokeAllSessions(userId);

        return res.status(200).json({
            success: true,
            message:
                "All sessions revoked successfully",
        });
    } catch (error) {
        next(error);
    }
}