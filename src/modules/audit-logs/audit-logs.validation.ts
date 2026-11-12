import { z } from "zod";

/* =========================================================
   AUDIT LOG ID PARAMS
========================================================= */

export const auditLogIdParamsSchema = z.object({
    auditLogId: z.string().min(1),
});

/* =========================================================
   AUDIT LOG LIST QUERY
========================================================= */

export const auditLogListQuerySchema =
    z.object({
        adminId: z.string().optional(),

        targetUserId: z
            .string()
            .optional(),

        action: z
            .string()
            .optional(),

        limit: z.coerce
            .number()
            .int()
            .min(1)
            .max(100)
            .default(50),

        offset: z.coerce
            .number()
            .int()
            .min(0)
            .default(0),
    });

/* =========================================================
   CREATE AUDIT LOG
========================================================= */

export const createAuditLogSchema =
    z.object({
        action: z.string().min(1),

        targetUserId: z
            .string()
            .nullable()
            .optional(),

        targetResourceId: z
            .string()
            .nullable()
            .optional(),

        metadata: z
            .string()
            .nullable()
            .optional(),

        ipAddress: z
            .string()
            .max(100)
            .nullable()
            .optional(),

        userAgent: z
            .string()
            .max(1000)
            .nullable()
            .optional(),
    });

/* =========================================================
   TYPES
========================================================= */

export type AuditLogListQuery =
    z.infer<
        typeof auditLogListQuerySchema
    >;

export type CreateAuditLogInput =
    z.infer<
        typeof createAuditLogSchema
    >;