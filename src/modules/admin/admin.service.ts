import {
    and,
    count,
    desc,
    eq,
    ilike,
    or,
} from "drizzle-orm";

import { db } from "../../db/index.js";

import {
    users,
    challenges,
    challengeMembers,
    checkIns,
    auditLogs,
} from "../../db/schema/schema.js";

import type {
    AdminUserListQuery,
    UpdateUserStatusInput,
    UpdateUserRoleInput,
    AdminChallengeListQuery,
    AdminAuditLogQuery,
} from "./admin.validation.js";

/* =========================================================
   USERS
========================================================= */

export async function getAdminUsers(
    query: AdminUserListQuery
) {
    const conditions = [];

    if (query.status) {
        conditions.push(
            eq(users.status, query.status)
        );
    }

    if (query.role) {
        conditions.push(
            eq(users.role, query.role)
        );
    }

    if (query.search) {
        const search = `%${query.search}%`;

        conditions.push(
            or(
                ilike(users.email, search),
                ilike(users.username, search)
            )
        );
    }

    return db
        .select({
            id: users.id,
            email: users.email,
            username: users.username,
            role: users.role,
            status: users.status,
            emailVerified: users.emailVerified,
            lastLoginAt: users.lastLoginAt,
            createdAt: users.createdAt,
            updatedAt: users.updatedAt,
        })
        .from(users)
        .where(
            conditions.length > 0
                ? and(...conditions)
                : undefined
        )
        .orderBy(desc(users.createdAt))
        .limit(query.limit)
        .offset(query.offset);
}

/* =========================================================
   GET USER
========================================================= */

export async function getAdminUserById(
    userId: string
) {
    const [user] = await db
        .select({
            id: users.id,
            email: users.email,
            username: users.username,
            role: users.role,
            status: users.status,
            emailVerified: users.emailVerified,
            lastLoginAt: users.lastLoginAt,
            createdAt: users.createdAt,
            updatedAt: users.updatedAt,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

    if (!user) {
        throw new Error("User not found");
    }

    return user;
}

/* =========================================================
   UPDATE USER STATUS
========================================================= */

export async function updateAdminUserStatus(
    userId: string,
    input: UpdateUserStatusInput
) {
    const [user] = await db
        .update(users)
        .set({
            status: input.status,
            updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning({
            id: users.id,
            email: users.email,
            username: users.username,
            role: users.role,
            status: users.status,
            updatedAt: users.updatedAt,
        });

    if (!user) {
        throw new Error("User not found");
    }

    return user;
}

/* =========================================================
   UPDATE USER ROLE
========================================================= */

export async function updateAdminUserRole(
    userId: string,
    input: UpdateUserRoleInput
) {
    const [user] = await db
        .update(users)
        .set({
            role: input.role,
            updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning({
            id: users.id,
            email: users.email,
            username: users.username,
            role: users.role,
            status: users.status,
            updatedAt: users.updatedAt,
        });

    if (!user) {
        throw new Error("User not found");
    }

    return user;
}

/* =========================================================
   CHALLENGES
========================================================= */

export async function getAdminChallenges(
    query: AdminChallengeListQuery
) {
    const conditions = [];

    if (query.status) {
        conditions.push(
            eq(challenges.status, query.status)
        );
    }

    if (query.search) {
        const search = `%${query.search}%`;

        conditions.push(
            or(
                ilike(challenges.name, search),
                ilike(
                    challenges.description,
                    search
                )
            )
        );
    }

    return db
        .select({
            id: challenges.id,
            name: challenges.name,
            description: challenges.description,
            createdBy: challenges.createdBy,
            startDate: challenges.startDate,
            endDate: challenges.endDate,
            maxMembers: challenges.maxMembers,
            status: challenges.status,
            createdAt: challenges.createdAt,
            updatedAt: challenges.updatedAt,
        })
        .from(challenges)
        .where(
            conditions.length > 0
                ? and(...conditions)
                : undefined
        )
        .orderBy(desc(challenges.createdAt))
        .limit(query.limit)
        .offset(query.offset);
}

/* =========================================================
   CANCEL CHALLENGE
========================================================= */

export async function cancelAdminChallenge(
    challengeId: string
) {
    const [challenge] = await db
        .update(challenges)
        .set({
            status: "CANCELLED",
            updatedAt: new Date(),
        })
        .where(eq(challenges.id, challengeId))
        .returning({
            id: challenges.id,
            name: challenges.name,
            status: challenges.status,
            updatedAt: challenges.updatedAt,
        });

    if (!challenge) {
        throw new Error("Challenge not found");
    }

    return challenge;
}

/* =========================================================
   CHALLENGE STATISTICS
========================================================= */

export async function getAdminChallengeStats(
    challengeId: string
) {
    const [challenge] = await db
        .select({
            id: challenges.id,
            name: challenges.name,
            status: challenges.status,
        })
        .from(challenges)
        .where(eq(challenges.id, challengeId))
        .limit(1);

    if (!challenge) {
        throw new Error("Challenge not found");
    }

    const [members] = await db
        .select({
            total: count(challengeMembers.id),
        })
        .from(challengeMembers)
        .where(
            eq(
                challengeMembers.challengeId,
                challengeId
            )
        );

    const [checkInStats] = await db
        .select({
            total: count(checkIns.id),
        })
        .from(checkIns)
        .where(
            eq(
                checkIns.challengeId,
                challengeId
            )
        );

    return {
        challenge,

        members: Number(
            members?.total ?? 0
        ),

        checkIns: Number(
            checkInStats?.total ?? 0
        ),
    };
}

/* =========================================================
   AUDIT LOGS
========================================================= */

export async function getAdminAuditLogs(
    query: AdminAuditLogQuery
) {
    const conditions = [];

    if (query.userId) {
        conditions.push(
            eq(
                auditLogs.targetUserId,
                query.userId
            )
        );
    }

    if (query.action) {
        conditions.push(
            eq(
                auditLogs.action,
                query.action
            )
        );
    }

    return db
        .select({
            id: auditLogs.id,
            adminId: auditLogs.adminId,
            action: auditLogs.action,
            targetUserId:
                auditLogs.targetUserId,
            targetResourceId:
                auditLogs.targetResourceId,
            metadata: auditLogs.metadata,
            ipAddress:
                auditLogs.ipAddress,
            userAgent:
                auditLogs.userAgent,
            createdAt:
                auditLogs.createdAt,
        })
        .from(auditLogs)
        .where(
            conditions.length > 0
                ? and(...conditions)
                : undefined
        )
        .orderBy(
            desc(auditLogs.createdAt)
        )
        .limit(query.limit)
        .offset(query.offset);
}

/* =========================================================
   DASHBOARD STATS
========================================================= */

export async function getAdminDashboardStats() {
    const [userStats] = await db
        .select({
            total: count(users.id),
        })
        .from(users);

    const [challengeStats] = await db
        .select({
            total: count(challenges.id),
        })
        .from(challenges);

    const [checkInStats] = await db
        .select({
            total: count(checkIns.id),
        })
        .from(checkIns);

    return {
        users: Number(
            userStats?.total ?? 0
        ),

        challenges: Number(
            challengeStats?.total ?? 0
        ),

        checkIns: Number(
            checkInStats?.total ?? 0
        ),
    };
}