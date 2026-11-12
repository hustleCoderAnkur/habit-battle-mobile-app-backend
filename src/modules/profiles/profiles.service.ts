import {
    eq,
} from "drizzle-orm";

import { db } from "../../db/index.js";

import {
    profiles,
} from "../../db/schema/schema.js";

import type {
    UpdateProfileInput,
} from "./profiles.validation.js";

/* =========================================================
   GET MY PROFILE
========================================================= */

export async function getMyProfile(
    userId: string
) {
    const [profile] = await db
        .select({
            id: profiles.id,
            userId: profiles.userId,
            name: profiles.name,
            bio: profiles.bio,
            avatarUrl: profiles.avatarUrl,
            totalPoints: profiles.totalPoints,
            currentStreak: profiles.currentStreak,
            longestStreak: profiles.longestStreak,
            createdAt: profiles.createdAt,
            updatedAt: profiles.updatedAt,
        })
        .from(profiles)
        .where(
            eq(profiles.userId, userId)
        )
        .limit(1);

    if (!profile) {
        throw new Error(
            "Profile not found"
        );
    }

    return profile;
}

/* =========================================================
   GET PROFILE BY USER ID
========================================================= */

export async function getProfileByUserId(
    userId: string
) {
    const [profile] = await db
        .select({
            id: profiles.id,
            userId: profiles.userId,
            name: profiles.name,
            bio: profiles.bio,
            avatarUrl: profiles.avatarUrl,
            totalPoints: profiles.totalPoints,
            currentStreak: profiles.currentStreak,
            longestStreak: profiles.longestStreak,
            createdAt: profiles.createdAt,
            updatedAt: profiles.updatedAt,
        })
        .from(profiles)
        .where(
            eq(profiles.userId, userId)
        )
        .limit(1);

    if (!profile) {
        throw new Error(
            "Profile not found"
        );
    }

    return profile;
}

/* =========================================================
   UPDATE MY PROFILE
========================================================= */

export async function updateMyProfile(
    userId: string,
    input: UpdateProfileInput
) {
    const [existing] = await db
        .select({
            id: profiles.id,
        })
        .from(profiles)
        .where(
            eq(profiles.userId, userId)
        )
        .limit(1);

    if (!existing) {
        throw new Error(
            "Profile not found"
        );
    }

    const [updated] = await db
        .update(profiles)
        .set({
            ...input,
            updatedAt: new Date(),
        })
        .where(
            eq(profiles.userId, userId)
        )
        .returning();

    if (!updated) {
        throw new Error(
            "Failed to update profile"
        );
    }

    return updated;
}