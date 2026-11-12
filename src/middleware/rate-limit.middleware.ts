import type { NextFunction, Request, Response } from "express";

import type { AuthenticatedRequest } from "./auth/authenticate.js";

/**
 * Tiny in-memory rate limiter (per user, per limiter instance).
 * Good enough for a single server; use Redis if you scale out.
 */
export function rateLimit({
    windowMs,
    max,
}: {
    windowMs: number;
    max: number;
}) {
    const hits = new Map<string, number[]>();

    return (req: Request, res: Response, next: NextFunction): void => {
        const key =
            (req as AuthenticatedRequest).user?.id ?? req.ip ?? "anonymous";

        const now = Date.now();
        const recent = (hits.get(key) ?? []).filter(
            (time) => now - time < windowMs
        );

        if (recent.length >= max) {
            hits.set(key, recent);
            res.status(429).json({
                success: false,
                message: "Too many requests. Please try again in a minute.",
            });
            return;
        }

        recent.push(now);
        hits.set(key, recent);
        next();
    };
}
