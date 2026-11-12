import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";

import { db } from "../../db/index.js";
import { normalizePhone } from "../../utils/phone.js";
import {
    notificationPreferences,
    profiles,
    sessions,
    users,
} from "../../db/schema/schema.js";

import {
    comparePassword,
    hashPassword,
} from "../../utils/auth/password.js";

import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
} from "../../utils/auth/jwt.js";

import type {
    LoginInput,
    RegisterInput,
} from "./auth.validation.js";

/* =========================================================
   TYPES
========================================================= */

interface TokenResponse {
    accessToken: string;
    refreshToken: string;
}

/* =========================================================
   HELPERS
========================================================= */

function getRefreshTokenExpiry(): Date {
    const date = new Date();

    date.setDate(date.getDate() + 30);

    return date;
}

async function createSession(
    userId: string,
    role: "USER" | "ADMIN" | "SUPER_ADMIN",
    userAgent?: string,
    ipAddress?: string
): Promise<TokenResponse> {
    const sessionId = randomUUID();

    const accessToken = generateAccessToken({
        userId,
        role,
    });

    const refreshToken = generateRefreshToken({
        userId,
        sessionId,
    });

    const refreshTokenHash = await hashPassword(refreshToken);

    await db.insert(sessions).values({
        id: sessionId,
        userId,
        refreshTokenHash,
        expiresAt: getRefreshTokenExpiry(),
        userAgent: userAgent ?? null,
        ipAddress: ipAddress ?? null,
    });

    return {
        accessToken,
        refreshToken,
    };
}

/* =========================================================
   REGISTER
========================================================= */

export async function register(
    input: RegisterInput,
    userAgent?: string,
    ipAddress?: string
) {
    const existingUser = await db
        .select({
            id: users.id,
            email: users.email,
            username: users.username,
        })
        .from(users)
        .where(
            and(
                eq(users.email, input.email),
                eq(users.username, input.username)
            )
        )
        .limit(1);

    if (existingUser.length > 0) {
        throw new Error("Email or username already exists");
    }

    const existingEmail = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

    if (existingEmail.length > 0) {
        throw new Error("Email already exists");
    }

    const existingUsername = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.username, input.username))
        .limit(1);

    if (existingUsername.length > 0) {
        throw new Error("Username already exists");
    }

    let phone: string | null = null;

    if (input.phone) {
        phone = normalizePhone(input.phone);

        if (!phone) {
            throw new Error("Enter a valid mobile number");
        }

        const existingPhone = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.phone, phone))
            .limit(1);

        if (existingPhone.length > 0) {
            throw new Error("Mobile number already exists");
        }
    }

    const passwordHash = await hashPassword(input.password);

    const userId = randomUUID();

    const result = await db.transaction(async (tx) => {
        const [user] = await tx
            .insert(users)
            .values({
                id: userId,
                email: input.email,
                username: input.username,
                passwordHash,
                phone,
            })
            .returning({
                id: users.id,
                email: users.email,
                username: users.username,
                role: users.role,
                status: users.status,
            });

        if (!user) {
            throw new Error("Failed to create user");
        }

        await tx.insert(profiles).values({
            id: randomUUID(),
            userId: user.id,
        });

        await tx.insert(notificationPreferences).values({
            id: randomUUID(),
            userId: user.id,
        });

        return user;
    });

    const tokens = await createSession(
        result.id,
        result.role,
        userAgent,
        ipAddress
    );

    return {
        user: result,
        ...tokens,
    };
}

/* =========================================================
   LOGIN
========================================================= */

export async function login(
    input: LoginInput,
    userAgent?: string,
    ipAddress?: string
) {
    const [user] = await db
        .select({
            id: users.id,
            email: users.email,
            username: users.username,
            passwordHash: users.passwordHash,
            role: users.role,
            status: users.status,
        })
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

    if (!user) {
        throw new Error("Invalid email or password");
    }

    if (user.status !== "ACTIVE") {
        throw new Error("Account is not active");
    }

    const passwordValid = await comparePassword(
        input.password,
        user.passwordHash
    );

    if (!passwordValid) {
        throw new Error("Invalid email or password");
    }

    await db
        .update(users)
        .set({
            lastLoginAt: new Date(),
            updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));

    const tokens = await createSession(
        user.id,
        user.role,
        userAgent,
        ipAddress
    );

    return {
        user: {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
            status: user.status,
        },
        ...tokens,
    };
}

/* =========================================================
   REFRESH TOKEN
========================================================= */

export async function refreshAccessToken(
    refreshToken: string
): Promise<TokenResponse> {
    const payload = verifyRefreshToken(refreshToken);

    const [session] = await db
        .select({
            id: sessions.id,
            userId: sessions.userId,
            refreshTokenHash: sessions.refreshTokenHash,
            expiresAt: sessions.expiresAt,
            revokedAt: sessions.revokedAt,
        })
        .from(sessions)
        .where(
            and(
                eq(sessions.id, payload.sessionId),
                eq(sessions.userId, payload.userId)
            )
        )
        .limit(1);

    if (!session) {
        throw new Error("Session not found");
    }

    if (session.revokedAt) {
        throw new Error("Session has been revoked");
    }

    if (session.expiresAt.getTime() < Date.now()) {
        throw new Error("Refresh token expired");
    }

    const refreshTokenValid = await comparePassword(
        refreshToken,
        session.refreshTokenHash
    );

    if (!refreshTokenValid) {
        throw new Error("Invalid refresh token");
    }

    const [user] = await db
        .select({
            id: users.id,
            role: users.role,
            status: users.status,
        })
        .from(users)
        .where(eq(users.id, session.userId))
        .limit(1);

    if (!user) {
        throw new Error("User not found");
    }

    if (user.status !== "ACTIVE") {
        throw new Error("Account is not active");
    }

    /*
     * Refresh token rotation
     */
    const newAccessToken = generateAccessToken({
        userId: user.id,
        role: user.role,
    });

    const newRefreshToken = generateRefreshToken({
        userId: user.id,
        sessionId: session.id,
    });

    const newRefreshTokenHash =
        await hashPassword(newRefreshToken);

    await db
        .update(sessions)
        .set({
            refreshTokenHash: newRefreshTokenHash,
            expiresAt: getRefreshTokenExpiry(),
        })
        .where(eq(sessions.id, session.id));

    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
    };
}

/* =========================================================
   LOGOUT
========================================================= */

export async function logout(
    refreshToken: string
): Promise<void> {
    const payload = verifyRefreshToken(refreshToken);

    await db
        .update(sessions)
        .set({
            revokedAt: new Date(),
        })
        .where(
            and(
                eq(sessions.id, payload.sessionId),
                eq(sessions.userId, payload.userId)
            )
        );
}

/* =========================================================
   LOGOUT ALL DEVICES
========================================================= */

export async function logoutAllDevices(
    userId: string
): Promise<void> {
    await db
        .update(sessions)
        .set({
            revokedAt: new Date(),
        })
        .where(
            and(
                eq(sessions.userId, userId),
                // Only active sessions need to be revoked.
                eq(sessions.id, sessions.id)
            )
        );
}