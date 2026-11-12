import type {
    NextFunction,
    Request,
    Response,
} from "express";

import {
    getAuditLogById,
    listAuditLogs,
} from "./audit-logs.service.js";

import type {
    AuditLogListQuery,
} from "./audit-logs.validation.js";

/* =========================================================
   GET AUDIT LOG BY ID
========================================================= */

export async function getAuditLogController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const auditLogId =
            req.params.auditLogId;

        if (
            typeof auditLogId !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid audit log ID",
            });
        }

        const log =
            await getAuditLogById(
                auditLogId
            );

        return res.status(200).json({
            success: true,
            data: log,
        });
    } catch (error) {
        next(error);
    }
}

/* =========================================================
   LIST AUDIT LOGS
========================================================= */

export async function listAuditLogsController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const query =
            req.query as unknown as AuditLogListQuery;

        const logs =
            await listAuditLogs(query);

        return res.status(200).json({
            success: true,
            data: logs,
        });
    } catch (error) {
        next(error);
    }
}