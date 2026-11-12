import { z } from "zod";

/* =========================================================
   UPDATE PROFILE
========================================================= */

export const updateProfileSchema = z.object({
    name: z
        .string()
        .min(1)
        .max(100)
        .nullable()
        .optional(),

    bio: z
        .string()
        .max(500)
        .nullable()
        .optional(),

    avatarUrl: z
        .string()
        .url()
        .nullable()
        .optional(),
});

/* =========================================================
   PROFILE ID PARAMS
========================================================= */

export const profileIdParamsSchema = z.object({
    profileId: z.string().min(1),
});

/* =========================================================
   TYPES
========================================================= */

export type UpdateProfileInput =
    z.infer<typeof updateProfileSchema>;