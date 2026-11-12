import { Router } from "express";

import {
    createUploadController,
    getMyUploadsController,
    getUploadController,
    deleteUploadController,
} from "./uploads.controller.js";

import {
    createUploadSchema,
    uploadIdParamsSchema,
} from "./uploads.validation.js";

import { authenticate } from "../../middleware/auth/authenticate.js";
import { validate } from "../../middleware/validation.middleware.js";

const router = Router();

/* =========================================================
   AUTHENTICATION
========================================================= */

router.use(authenticate);

/* =========================================================
   CREATE UPLOAD
   POST /api/v1/uploads
========================================================= */

router.post(
    "/",
    validate({
        body: createUploadSchema,
    }),
    createUploadController
);

/* =========================================================
   GET MY UPLOADS
   GET /api/v1/uploads
========================================================= */

router.get(
    "/",
    getMyUploadsController
);

/* =========================================================
   GET UPLOAD
   GET /api/v1/uploads/:uploadId
========================================================= */

router.get(
    "/:uploadId",
    validate({
        params: uploadIdParamsSchema,
    }),
    getUploadController
);

/* =========================================================
   DELETE UPLOAD
   DELETE /api/v1/uploads/:uploadId
========================================================= */

router.delete(
    "/:uploadId",
    validate({
        params: uploadIdParamsSchema,
    }),
    deleteUploadController
);

export default router;