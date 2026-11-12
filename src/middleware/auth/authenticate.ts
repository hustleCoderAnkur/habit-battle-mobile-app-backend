import type { NextFunction, Request, Response } from "express";

import { verifyAccessToken } from "../../utils/auth/jwt.js";

export interface AuthenticatedRequest extends Request {
    user: {
        id: string;
        role: "USER" | "ADMIN" | "SUPER_ADMIN";
    };
}

export function authenticate(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const authorization = req.headers.authorization;

        if (!authorization?.startsWith("Bearer ")) {
            res.status(401).json({
                success: false,
                message: "Authentication required",
            });
            return;
        }

        const token = authorization.slice(7).trim();

        if (!token) {
            res.status(401).json({
                success: false,
                message: "Access token required",
            });
            return;
        }

        const payload = verifyAccessToken(token);

        (req as AuthenticatedRequest).user = {
            id: payload.userId,
            role: payload.role,
        };

        next();
    } catch {
        res.status(401).json({
            success: false,
            message: "Invalid or expired access token",
        });
    }
}