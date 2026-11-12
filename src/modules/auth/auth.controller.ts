import type { Request, Response, NextFunction } from "express";

import {
    loginSchema,
    logoutSchema,
    refreshTokenSchema,
    registerSchema,
} from "./auth.validation.js";

import {
    login,
    logout,
    refreshAccessToken,
    register,
} from "./auth.service.js";

/* =========================================================
   REGISTER
========================================================= */

export async function registerController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const input = registerSchema.parse(req.body);

        const result = await register(
            input,
            req.get("user-agent"),
            req.ip
        );

        res.status(201).json({
            success: true,
            message: "Account created successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

/* =========================================================
   LOGIN
========================================================= */

export async function loginController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const input = loginSchema.parse(req.body);

        const result = await login(
            input,
            req.get("user-agent"),
            req.ip
        );

        res.status(200).json({
            success: true,
            message: "Login successful",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

/* =========================================================
   REFRESH TOKEN
========================================================= */

export async function refreshTokenController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const input = refreshTokenSchema.parse(req.body);

        const tokens = await refreshAccessToken(
            input.refreshToken
        );

        res.status(200).json({
            success: true,
            message: "Token refreshed successfully",
            data: tokens,
        });
    } catch (error) {
        next(error);
    }
}

/* =========================================================
   LOGOUT
========================================================= */

export async function logoutController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const input = logoutSchema.parse(req.body);

        await logout(input.refreshToken);

        res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });
    } catch (error) {
        next(error);
    }
}