import { Router } from "express";

import {
    getAuditLogController,
    listAuditLogsController,
} from "./audit-logs.controller.js";

import {
    auditLogIdParamsSchema,
    auditLogListQuerySchema,
} from "./audit-logs.validation.js";

import { authenticate } from "../../middleware/auth/authenticate.js";

import { validate } from "../../middleware/validation.middleware.js";

const router = Router();

/* =========================================================
   AUTHENTICATION
========================================================= */

router.use(authenticate);

/* =========================================================
   LIST AUDIT LOGS
   GET /api/v1/audit-logs
========================================================= */

router.get(
    "/",
    validate({
        query: auditLogListQuerySchema,
    }),
    listAuditLogsController
);

/* =========================================================
   GET AUDIT LOG
   GET /api/v1/audit-logs/:auditLogId
========================================================= */

router.get(
    "/:auditLogId",
    validate({
        params: auditLogIdParamsSchema,
    }),
    getAuditLogController
);

export default router;