import type { NextFunction, Request, Response } from "express";
import type { AuthenticatedRequest } from "./authenticate.js";

type Role = "USER" | "ADMIN" | "SUPER_ADMIN";

export function authorize(...allowedRoles: Role[]) {
    return (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const authReq = req as AuthenticatedRequest;

        if (!authReq.user) {
            res.status(401).json({
                success: false,
                message: "Authentication required",
            });
            return;
        }

        if (!allowedRoles.includes(authReq.user.role)) {
            res.status(403).json({
                success: false,
                message: "You do not have permission to perform this action",
            });
            return;
        }

        next();
    };
}