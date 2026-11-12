import {
    and,
    desc,
    eq,
    ilike,
    or,
} from "drizzle-orm";

import { db } from "../../db/index.js";
import {
    challengeMembers,
    challenges,
    users,
} from "../../db/schema/schema.js";

import type {
    ChallengeListQuery,
    CreateChallengeInput,
    UpdateChallengeInput,
} from "./challenges.validation.js";

/* =========================================================
   CREATE CHALLENGE
========================================================= */

export async function createChallenge(
    userId: string,
    input: CreateChallengeInput
) {
    const result = await db.transaction(async (tx) => {
        const [challenge] = await tx
            .insert(challenges)
            .values({
                id: crypto.randomUUID(),
                name: input.name,
                description: input.description ?? null,
                createdBy: userId,
                startDate: input.startDate,
                endDate: input.endDate,
                maxMembers: input.maxMembers ?? null,
                status: "UPCOMING",
            })
            .returning();

        if (!challenge) {
            throw new Error("Failed to create challenge");
        }

        // Creator automatically becomes the first member
        const [member] = await tx
            .insert(challengeMembers)
            .values({
                id: crypto.randomUUID(),
                challengeId: challenge.id,
                userId,
                role: "OWNER",
                status: "ACTIVE",
            })
            .returning();

        if (!member) {
            throw new Error(
                "Failed to add creator to challenge"
            );
        }

        return {
            challenge,
            member,
        };
    });

    return result;
}

/* =========================================================
   GET CHALLENGE BY ID
========================================================= */

export async function getChallengeById(
    challengeId: string
) {
    const [challenge] = await db
        .select({
            id: challenges.id,
            name: challenges.name,
            description: challenges.description,
            createdBy: challenges.createdBy,
            startDate: challenges.startDate,
            endDate: challenges.endDate,
            maxMembers: challenges.maxMembers,
            status: challenges.status,
            createdAt: challenges.createdAt,
            updatedAt: challenges.updatedAt,
        })
        .from(challenges)
        .where(eq(challenges.id, challengeId))
        .limit(1);

    if (!challenge) {
        throw new Error("Challenge not found");
    }

    return challenge;
}

/* =========================================================
   LIST CHALLENGES
========================================================= */

export async function listChallenges(
    query: ChallengeListQuery
) {
    const conditions = [];

    if (query.status) {
        conditions.push(
            eq(challenges.status, query.status)
        );
    }

    if (query.search) {
        const search = `%${query.search}%`;

        conditions.push(
            or(
                ilike(challenges.name, search),
                ilike(challenges.description, search)
            )
        );
    }

    return db
        .select({
            id: challenges.id,
            name: challenges.name,
            description: challenges.description,
            createdBy: challenges.createdBy,
            startDate: challenges.startDate,
            endDate: challenges.endDate,
            maxMembers: challenges.maxMembers,
            status: challenges.status,
            createdAt: challenges.createdAt,
        })
        .from(challenges)
        .where(
            conditions.length > 0
                ? and(...conditions)
                : undefined
        )
        .orderBy(desc(challenges.createdAt))
        .limit(query.limit)
        .offset(query.offset);
}

/* =========================================================
   GET MY CHALLENGES
========================================================= */

export async function getMyChallenges(userId: string) {
    return db
        .select({
            id: challenges.id,
            name: challenges.name,
            description: challenges.description,
            createdBy: challenges.createdBy,
            startDate: challenges.startDate,
            endDate: challenges.endDate,
            maxMembers: challenges.maxMembers,
            status: challenges.status,
            createdAt: challenges.createdAt,
            updatedAt: challenges.updatedAt,
            memberRole: challengeMembers.role,
            memberStatus: challengeMembers.status,
            points: challengeMembers.points,
            currentStreak: challengeMembers.currentStreak,
        })
        .from(challengeMembers)
        .innerJoin(
            challenges,
            eq(challenges.id, challengeMembers.challengeId)
        )
        .where(
            and(
                eq(challengeMembers.userId, userId),
                eq(challengeMembers.status, "ACTIVE")
            )
        )
        .orderBy(desc(challenges.createdAt));
}

/* =========================================================
   UPDATE CHALLENGE
========================================================= */

export async function updateChallenge(
    userId: string,
    challengeId: string,
    input: UpdateChallengeInput
) {
    const [challenge] = await db
        .select({
            id: challenges.id,
            createdBy: challenges.createdBy,
            status: challenges.status,
        })
        .from(challenges)
        .where(eq(challenges.id, challengeId))
        .limit(1);

    if (!challenge) {
        throw new Error("Challenge not found");
    }

    if (challenge.createdBy !== userId) {
        throw new Error(
            "Only the challenge creator can update it"
        );
    }

    if (
        challenge.status === "COMPLETED" ||
        challenge.status === "CANCELLED"
    ) {
        throw new Error(
            "This challenge can no longer be updated"
        );
    }

    const [updated] = await db
        .update(challenges)
        .set({
            ...input,
            updatedAt: new Date(),
        })
        .where(eq(challenges.id, challengeId))
        .returning();

    if (!updated) {
        throw new Error(
            "Failed to update challenge"
        );
    }

    return updated;
}

/* =========================================================
   CANCEL CHALLENGE
========================================================= */

export async function deleteChallenge(
    userId: string,
    challengeId: string
): Promise<void> {
    const [challenge] = await db
        .select({
            id: challenges.id,
            createdBy: challenges.createdBy,
            status: challenges.status,
        })
        .from(challenges)
        .where(eq(challenges.id, challengeId))
        .limit(1);

    if (!challenge) {
        throw new Error("Challenge not found");
    }

    if (challenge.createdBy !== userId) {
        throw new Error(
            "Only the challenge creator can cancel it"
        );
    }

    if (challenge.status === "COMPLETED") {
        throw new Error(
            "Completed challenge cannot be cancelled"
        );
    }

    await db
        .update(challenges)
        .set({
            status: "CANCELLED",
            updatedAt: new Date(),
        })
        .where(eq(challenges.id, challengeId));
}

/* =========================================================
   JOIN CHALLENGE
========================================================= */

export async function joinChallenge(
    userId: string,
    challengeId: string
) {
    const [challenge] = await db
        .select({
            id: challenges.id,
            status: challenges.status,
            maxMembers: challenges.maxMembers,
        })
        .from(challenges)
        .where(eq(challenges.id, challengeId))
        .limit(1);

    if (!challenge) {
        throw new Error("Challenge not found");
    }

    if (challenge.status !== "UPCOMING") {
        throw new Error(
            "This challenge is not open for joining"
        );
    }

    const [existingMember] = await db
        .select({
            id: challengeMembers.id,
            status: challengeMembers.status,
        })
        .from(challengeMembers)
        .where(
            and(
                eq(
                    challengeMembers.challengeId,
                    challengeId
                ),
                eq(
                    challengeMembers.userId,
                    userId
                )
            )
        )
        .limit(1);

    if (existingMember) {
        throw new Error(
            "You are already associated with this challenge"
        );
    }

    if (challenge.maxMembers !== null) {
        const members = await db
            .select({
                id: challengeMembers.id,
            })
            .from(challengeMembers)
            .where(
                and(
                    eq(
                        challengeMembers.challengeId,
                        challengeId
                    ),
                    eq(
                        challengeMembers.status,
                        "ACTIVE"
                    )
                )
            );

        if (
            members.length >= challenge.maxMembers
        ) {
            throw new Error("Challenge is full");
        }
    }

    const [member] = await db
        .insert(challengeMembers)
        .values({
            id: crypto.randomUUID(),
            challengeId,
            userId,
            role: "MEMBER",
            status: "ACTIVE",
        })
        .returning();

    if (!member) {
        throw new Error(
            "Failed to join challenge"
        );
    }

    return member;
}

/* =========================================================
   LEAVE CHALLENGE
========================================================= */

export async function leaveChallenge(
    userId: string,
    challengeId: string
): Promise<void> {
    const [challenge] = await db
        .select({
            createdBy: challenges.createdBy,
            status: challenges.status,
        })
        .from(challenges)
        .where(eq(challenges.id, challengeId))
        .limit(1);

    if (!challenge) {
        throw new Error("Challenge not found");
    }

    if (challenge.createdBy === userId) {
        throw new Error(
            "Challenge creator cannot leave the challenge"
        );
    }

    if (challenge.status === "COMPLETED") {
        throw new Error(
            "Cannot leave a completed challenge"
        );
    }

    const [member] = await db
        .select({
            id: challengeMembers.id,
        })
        .from(challengeMembers)
        .where(
            and(
                eq(
                    challengeMembers.challengeId,
                    challengeId
                ),
                eq(
                    challengeMembers.userId,
                    userId
                ),
                eq(
                    challengeMembers.status,
                    "ACTIVE"
                )
            )
        )
        .limit(1);

    if (!member) {
        throw new Error(
            "You are not an active member of this challenge"
        );
    }

    await db
        .update(challengeMembers)
        .set({
            status: "LEFT",
            updatedAt: new Date(),
        })
        .where(
            eq(
                challengeMembers.id,
                member.id
            )
        );
}

/* =========================================================
   GET CHALLENGE MEMBERS
========================================================= */

export async function getChallengeMembers(
    challengeId: string
) {
    return db
        .select({
            membershipId: challengeMembers.id,
            userId: users.id,
            username: users.username,
            email: users.email,

            role: challengeMembers.role,
            status: challengeMembers.status,

            points: challengeMembers.points,
            currentStreak:
                challengeMembers.currentStreak,
            longestStreak:
                challengeMembers.longestStreak,

            joinedAt: challengeMembers.joinedAt,
        })
        .from(challengeMembers)
        .innerJoin(
            users,
            eq(
                users.id,
                challengeMembers.userId
            )
        )
        .where(
            eq(
                challengeMembers.challengeId,
                challengeId
            )
        )
        .orderBy(
            desc(challengeMembers.points),
            desc(challengeMembers.longestStreak),
            desc(challengeMembers.joinedAt)
        );
}

/* =========================================================
   CHECK MEMBERSHIP
========================================================= */

export async function isChallengeMember(
    userId: string,
    challengeId: string
): Promise<boolean> {
    const [member] = await db
        .select({
            id: challengeMembers.id,
        })
        .from(challengeMembers)
        .where(
            and(
                eq(
                    challengeMembers.challengeId,
                    challengeId
                ),
                eq(
                    challengeMembers.userId,
                    userId
                ),
                eq(
                    challengeMembers.status,
                    "ACTIVE"
                )
            )
        )
        .limit(1);

    return Boolean(member);
}