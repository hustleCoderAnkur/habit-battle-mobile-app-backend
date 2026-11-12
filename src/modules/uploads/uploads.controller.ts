import type {
    NextFunction,
    Request,
    Response,
} from "express";

import {
    createUpload,
    getMyUploads,
    getUploadById,
    deleteUpload,
} from "./uploads.service.js";

import type {
    CreateUploadInput,
} from "./uploads.validation.js";

/* =========================================================
   CREATE UPLOAD
========================================================= */

export async function createUploadController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user!.id;

        const upload =
            await createUpload(
                userId,
                req.body as CreateUploadInput
            );

        return res.status(201).json({
            success: true,
            message:
                "Upload created successfully",
            data: upload,
        });
    } catch (error) {
        next(error);
    }
}

/* =========================================================
   GET MY UPLOADS
========================================================= */

export async function getMyUploadsController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user!.id;

        const uploads =
            await getMyUploads(userId);

        return res.status(200).json({
            success: true,
            data: uploads,
        });
    } catch (error) {
        next(error);
    }
}

/* =========================================================
   GET UPLOAD BY ID
========================================================= */

export async function getUploadController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user!.id;

        const uploadId =
            req.params.uploadId;

        if (
            typeof uploadId !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid upload ID",
            });
        }

        const upload =
            await getUploadById(
                userId,
                uploadId
            );

        return res.status(200).json({
            success: true,
            data: upload,
        });
    } catch (error) {
        next(error);
    }
}

/* =========================================================
   DELETE UPLOAD
========================================================= */

export async function deleteUploadController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user!.id;

        const uploadId =
            req.params.uploadId;

        if (
            typeof uploadId !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid upload ID",
            });
        }

        await deleteUpload(
            userId,
            uploadId
        );

        return res.status(200).json({
            success: true,
            message:
                "Upload deleted successfully",
        });
    } catch (error) {
        next(error);
    }
}