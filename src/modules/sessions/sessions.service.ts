import {
    desc,
    eq,
} from "drizzle-orm";

import { db } from "../../db/index.js";

import {
    sessions,
} from "../../db/schema/schema.js";

import type {
    CreateSessionInput,
} from "./sessions.validation.js";

/* =========================================================
   CREATE SESSION
========================================================= */

export async function createSession(
    input: CreateSessionInput
) {
    const [session] = await db
        .insert(sessions)
        .values({
            id: crypto.randomUUID(),
            userId: input.userId,
            refreshTokenHash:
                input.refreshTokenHash,
            expiresAt: input.expiresAt,
            userAgent:
                input.userAgent ?? null,
            ipAddress:
                input.ipAddress ?? null,
        })
        .returning();

    if (!session) {
        throw new Error(
            "Failed to create session"
        );
    }

    return session;
}

/* =========================================================
   GET SESSION BY ID
========================================================= */

export async function getSessionById(
    userId: string,
    sessionId: string
) {
    const [session] = await db
        .select({
            id: sessions.id,
            userId: sessions.userId,
            expiresAt: sessions.expiresAt,
            revokedAt: sessions.revokedAt,
            userAgent: sessions.userAgent,
            ipAddress: sessions.ipAddress,
            createdAt: sessions.createdAt,
        })
        .from(sessions)
        .where(
            eq(sessions.id, sessionId)
        )
        .limit(1);

    if (!session) {
        throw new Error(
            "Session not found"
        );
    }

    if (session.userId !== userId) {
        throw new Error(
            "You do not have access to this session"
        );
    }

    return session;
}

/* =========================================================
   GET MY SESSIONS
========================================================= */

export async function getMySessions(
    userId: string
) {
    return db
        .select({
            id: sessions.id,
            expiresAt: sessions.expiresAt,
            revokedAt: sessions.revokedAt,
            userAgent: sessions.userAgent,
            ipAddress: sessions.ipAddress,
            createdAt: sessions.createdAt,
        })
        .from(sessions)
        .where(
            eq(sessions.userId, userId)
        )
        .orderBy(
            desc(sessions.createdAt)
        );
}

/* =========================================================
   REVOKE SESSION
========================================================= */

export async function revokeSession(
    userId: string,
    sessionId: string
): Promise<void> {
    await getSessionById(
        userId,
        sessionId
    );

    const [updated] = await db
        .update(sessions)
        .set({
            revokedAt: new Date(),
        })
        .where(
            eq(sessions.id, sessionId)
        )
        .returning({
            id: sessions.id,
        });

    if (!updated) {
        throw new Error(
            "Failed to revoke session"
        );
    }
}

/* =========================================================
   REVOKE ALL MY SESSIONS
========================================================= */

export async function revokeAllSessions(
    userId: string
): Promise<void> {
    await db
        .update(sessions)
        .set({
            revokedAt: new Date(),
        })
        .where(
            eq(sessions.userId, userId)
        );
}