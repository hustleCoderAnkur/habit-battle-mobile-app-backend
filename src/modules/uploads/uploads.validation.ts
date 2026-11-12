import { z } from "zod";

/* =========================================================
   CREATE UPLOAD
========================================================= */

export const createUploadSchema = z.object({
    fileName: z
        .string()
        .min(1, "File name is required")
        .max(255),

    fileUrl: z
        .string()
        .url("Invalid file URL"),

    mimeType: z
        .string()
        .min(1, "MIME type is required")
        .max(100),

    fileSize: z
        .number()
        .int()
        .positive("File size must be greater than 0"),
});

/* =========================================================
   UPLOAD ID PARAMS
========================================================= */

export const uploadIdParamsSchema = z.object({
    uploadId: z
        .string()
        .min(1, "Upload ID is required"),
});

/* =========================================================
   TYPES
========================================================= */

export type CreateUploadInput =
    z.infer<typeof createUploadSchema>;

export type UploadIdParams =
    z.infer<typeof uploadIdParamsSchema>;