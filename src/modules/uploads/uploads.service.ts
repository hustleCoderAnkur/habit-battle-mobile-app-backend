import {
    desc,
    eq,
} from "drizzle-orm";

import { db } from "../../db/index.js";

import {
    uploads,
} from "../../db/schema/schema.js";

import type {
    CreateUploadInput,
} from "./uploads.validation.js";

/* =========================================================
   CREATE UPLOAD METADATA
========================================================= */

export async function createUpload(
    userId: string,
    input: CreateUploadInput
) {
    const [upload] = await db
        .insert(uploads)
        .values({
            id: crypto.randomUUID(),
            userId,
            fileName: input.fileName,
            fileUrl: input.fileUrl,
            mimeType: input.mimeType,
            fileSize: input.fileSize,
        })
        .returning();

    if (!upload) {
        throw new Error(
            "Failed to create upload"
        );
    }

    return upload;
}

/* =========================================================
   GET MY UPLOADS
========================================================= */

export async function getMyUploads(
    userId: string
) {
    return db
        .select({
            id: uploads.id,
            fileName: uploads.fileName,
            fileUrl: uploads.fileUrl,
            mimeType: uploads.mimeType,
            fileSize: uploads.fileSize,
            createdAt: uploads.createdAt,
        })
        .from(uploads)
        .where(
            eq(uploads.userId, userId)
        )
        .orderBy(
            desc(uploads.createdAt)
        );
}

/* =========================================================
   GET UPLOAD BY ID
========================================================= */

export async function getUploadById(
    userId: string,
    uploadId: string
) {
    const [upload] = await db
        .select({
            id: uploads.id,
            userId: uploads.userId,
            fileName: uploads.fileName,
            fileUrl: uploads.fileUrl,
            mimeType: uploads.mimeType,
            fileSize: uploads.fileSize,
            createdAt: uploads.createdAt,
        })
        .from(uploads)
        .where(
            eq(uploads.id, uploadId)
        )
        .limit(1);

    if (!upload) {
        throw new Error(
            "Upload not found"
        );
    }

    if (upload.userId !== userId) {
        throw new Error(
            "You do not have access to this upload"
        );
    }

    return upload;
}

/* =========================================================
   DELETE UPLOAD
========================================================= */

export async function deleteUpload(
    userId: string,
    uploadId: string
): Promise<void> {
    const upload =
        await getUploadById(
            userId,
            uploadId
        );

    await db
        .delete(uploads)
        .where(
            eq(
                uploads.id,
                upload.id
            )
        );
}