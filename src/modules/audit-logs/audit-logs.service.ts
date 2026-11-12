import {
    and,
    desc,
    eq,
} from "drizzle-orm";

import { db } from "../../db/index.js";

import {
    auditLogs,
    users,
} from "../../db/schema/schema.js";

import type {
    AuditLogListQuery,
    CreateAuditLogInput,
} from "./audit-logs.validation.js";

/* =========================================================
   CREATE AUDIT LOG
========================================================= */

export async function createAuditLog(
    adminId: string,
    input: CreateAuditLogInput
) {
    const [log] = await db
        .insert(auditLogs)
        .values({
            id: crypto.randomUUID(),

            adminId,

            action:
                input.action as typeof auditLogs.$inferInsert.action,

            targetUserId:
                input.targetUserId ?? null,

            targetResourceId:
                input.targetResourceId ?? null,

            metadata:
                input.metadata ?? null,

            ipAddress:
                input.ipAddress ?? null,

            userAgent:
                input.userAgent ?? null,
        })
        .returning();

    if (!log) {
        throw new Error(
            "Failed to create audit log"
        );
    }

    return log;
}

/* =========================================================
   GET AUDIT LOG BY ID
========================================================= */

export async function getAuditLogById(
    auditLogId: string
) {
    const [log] = await db
        .select({
            id: auditLogs.id,
            adminId: auditLogs.adminId,
            action: auditLogs.action,
            targetUserId:
                auditLogs.targetUserId,
            targetResourceId:
                auditLogs.targetResourceId,
            metadata: auditLogs.metadata,
            ipAddress: auditLogs.ipAddress,
            userAgent: auditLogs.userAgent,
            createdAt: auditLogs.createdAt,
        })
        .from(auditLogs)
        .where(
            eq(auditLogs.id, auditLogId)
        )
        .limit(1);

    if (!log) {
        throw new Error(
            "Audit log not found"
        );
    }

    return log;
}

/* =========================================================
   LIST AUDIT LOGS
========================================================= */

export async function listAuditLogs(
    query: AuditLogListQuery
) {
    const conditions = [];

    if (query.adminId) {
        conditions.push(
            eq(
                auditLogs.adminId,
                query.adminId
            )
        );
    }

    if (query.targetUserId) {
        conditions.push(
            eq(
                auditLogs.targetUserId,
                query.targetUserId
            )
        );
    }

    if (query.action) {
        conditions.push(
            eq(
                auditLogs.action,
                query.action as typeof auditLogs.$inferSelect.action
            )
        );
    }

    return db
        .select({
            id: auditLogs.id,
            adminId: auditLogs.adminId,
            adminUsername: users.username,
            action: auditLogs.action,
            targetUserId:
                auditLogs.targetUserId,
            targetResourceId:
                auditLogs.targetResourceId,
            metadata: auditLogs.metadata,
            ipAddress: auditLogs.ipAddress,
            userAgent: auditLogs.userAgent,
            createdAt: auditLogs.createdAt,
        })
        .from(auditLogs)
        .innerJoin(
            users,
            eq(users.id, auditLogs.adminId)
        )
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