import type {
    Request,
    Response,
    NextFunction,
} from "express";

import {
    getAdminUsers,
    getAdminUserById,
    updateAdminUserStatus,
    updateAdminUserRole,
    getAdminChallenges,
    cancelAdminChallenge,
    getAdminChallengeStats,
    getAdminAuditLogs,
    getAdminDashboardStats,
} from "./admin.service.js";

/* =========================================================
   DASHBOARD
========================================================= */

export async function dashboard(
    _req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const stats =
            await getAdminDashboardStats();

        res.status(200).json({
            success: true,
            data: stats,
        });
    } catch (error) {
        next(error);
    }
}

/* =========================================================
   USERS
========================================================= */

export async function listUsers(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const users =
            await getAdminUsers(
                req.query as any
            );

        res.status(200).json({
            success: true,
            data: users,
        });
    } catch (error) {
        next(error);
    }
}

export async function getUser(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const user =
            await getAdminUserById(
                req.params.userId as string
            );

        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
}

export async function updateUserStatus(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const user =
            await updateAdminUserStatus(
                req.params.userId as string,
                req.body
            );

        res.status(200).json({
            success: true,
            message: "User status updated",
            data: user,
        });
    } catch (error) {
        next(error);
    }
}

export async function updateUserRole(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const user =
            await updateAdminUserRole(
                req.params.userId as string,
                req.body
            );

        res.status(200).json({
            success: true,
            message: "User role updated",
            data: user,
        });
    } catch (error) {
        next(error);
    }
}

/* =========================================================
   CHALLENGES
========================================================= */

export async function listChallenges(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const challenges =
            await getAdminChallenges(
                req.query as any
            );

        res.status(200).json({
            success: true,
            data: challenges,
        });
    } catch (error) {
        next(error);
    }
}

export async function cancelChallenge(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const challenge =
            await cancelAdminChallenge(
                req.params.challengeId as string
            );

        res.status(200).json({
            success: true,
            message: "Challenge cancelled",
            data: challenge,
        });
    } catch (error) {
        next(error);
    }
}

export async function challengeStats(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const stats =
            await getAdminChallengeStats(
                req.params.challengeId as string
            );

        res.status(200).json({
            success: true,
            data: stats,
        });
    } catch (error) {
        next(error);
    }
}

/* =========================================================
   AUDIT LOGS
========================================================= */

export async function auditLogs(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const logs =
            await getAdminAuditLogs(
                req.query as any
            );

        res.status(200).json({
            success: true,
            data: logs,
        });
    } catch (error) {
        next(error);
    }
}