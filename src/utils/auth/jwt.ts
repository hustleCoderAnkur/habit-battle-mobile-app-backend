import jwt from "jsonwebtoken";

import { env } from "../../config/env.js";

export interface AccessTokenPayload {
    userId: string;
    role: "USER" | "ADMIN" | "SUPER_ADMIN";
    type: "access";
}

export interface RefreshTokenPayload {
    userId: string;
    sessionId: string;
    type: "refresh";
}

export function generateAccessToken(
    payload: Omit<AccessTokenPayload, "type">
): string {
    return jwt.sign(
        {
            ...payload,
            type: "access",
        },
        env.JWT_ACCESS_SECRET,
        {
            expiresIn: "15m",
        }
    );
}

export function generateRefreshToken(
    payload: Omit<RefreshTokenPayload, "type">
): string {
    return jwt.sign(
        {
            ...payload,
            type: "refresh",
        },
        env.JWT_REFRESH_SECRET,
        {
            expiresIn: "30d",
        }
    );
}

export function verifyAccessToken(
    token: string
): AccessTokenPayload {
    const decoded = jwt.verify(
        token,
        env.JWT_ACCESS_SECRET
    );

    if (
        typeof decoded !== "object" ||
        decoded === null ||
        decoded.type !== "access" ||
        typeof decoded.userId !== "string" ||
        !["USER", "ADMIN", "SUPER_ADMIN"].includes(decoded.role)
    ) {
        throw new Error("Invalid access token");
    }

    return decoded as AccessTokenPayload;
}

export function verifyRefreshToken(
    token: string
): RefreshTokenPayload {
    const decoded = jwt.verify(
        token,
        env.JWT_REFRESH_SECRET
    );

    if (
        typeof decoded !== "object" ||
        decoded === null ||
        decoded.type !== "refresh" ||
        typeof decoded.userId !== "string" ||
        typeof decoded.sessionId !== "string"
    ) {
        throw new Error("Invalid refresh token");
    }

    return decoded as RefreshTokenPayload;
}