import {
    and,
    desc,
    eq,
} from "drizzle-orm";

import { db } from "../../db/index.js";

import {
    challengeInvites,
    challengeMembers,
    challenges,
    users,
} from "../../db/schema/schema.js";

import type {
    CreateChallengeInviteInput,
    ChallengeInviteListQuery,
} from "./challenge-invites.validation.js";

/* =========================================================
   CREATE INVITE
========================================================= */

export async function createChallengeInvite(
    senderId: string,
    input: CreateChallengeInviteInput
) {
    const [challenge] = await db
        .select({
            id: challenges.id,
            createdBy: challenges.createdBy,
            status: challenges.status,
            maxMembers: challenges.maxMembers,
        })
        .from(challenges)
        .where(eq(challenges.id, input.challengeId))
        .limit(1);

    if (!challenge) {
        throw new Error("Challenge not found");
    }

    if (challenge.createdBy !== senderId) {
        throw new Error(
            "Only the challenge owner can send invites"
        );
    }

    if (challenge.status !== "UPCOMING") {
        throw new Error(
            "Invites can only be sent for upcoming challenges"
        );
    }

    if (senderId === input.receiverId) {
        throw new Error(
            "You cannot invite yourself"
        );
    }

    const [receiver] = await db
        .select({
            id: users.id,
            status: users.status,
        })
        .from(users)
        .where(eq(users.id, input.receiverId))
        .limit(1);

    if (!receiver) {
        throw new Error("Receiver not found");
    }

    if (receiver.status !== "ACTIVE") {
        throw new Error(
            "Cannot invite an inactive user"
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
                    input.challengeId
                ),
                eq(
                    challengeMembers.userId,
                    input.receiverId
                )
            )
        )
        .limit(1);

    if (
        existingMember &&
        existingMember.status === "ACTIVE"
    ) {
        throw new Error(
            "User is already a member of this challenge"
        );
    }

    const [existingInvite] = await db
        .select({
            id: challengeInvites.id,
            status: challengeInvites.status,
        })
        .from(challengeInvites)
        .where(
            and(
                eq(
                    challengeInvites.challengeId,
                    input.challengeId
                ),
                eq(
                    challengeInvites.receiverId,
                    input.receiverId
                ),
                eq(
                    challengeInvites.status,
                    "PENDING"
                )
            )
        )
        .limit(1);

    if (existingInvite) {
        throw new Error(
            "A pending invite already exists"
        );
    }

    const [invite] = await db
        .insert(challengeInvites)
        .values({
            id: crypto.randomUUID(),
            challengeId: input.challengeId,
            senderId,
            receiverId: input.receiverId,
            status: "PENDING",
        })
        .returning();

    if (!invite) {
        throw new Error(
            "Failed to create challenge invite"
        );
    }

    return invite;
}

/* =========================================================
   GET INVITE
========================================================= */

export async function getChallengeInviteById(
    userId: string,
    inviteId: string
) {
    const [invite] = await db
        .select({
            id: challengeInvites.id,
            challengeId: challengeInvites.challengeId,
            senderId: challengeInvites.senderId,
            receiverId: challengeInvites.receiverId,
            status: challengeInvites.status,
            expiresAt: challengeInvites.expiresAt,
            createdAt: challengeInvites.createdAt,
            updatedAt: challengeInvites.updatedAt,
        })
        .from(challengeInvites)
        .where(
            and(
                eq(challengeInvites.id, inviteId),
                eq(
                    challengeInvites.receiverId,
                    userId
                )
            )
        )
        .limit(1);

    if (!invite) {
        throw new Error("Invite not found");
    }

    return invite;
}

/* =========================================================
   LIST RECEIVED INVITES
========================================================= */

export async function listChallengeInvites(
    userId: string,
    query: ChallengeInviteListQuery
) {
    const conditions = [
        eq(
            challengeInvites.receiverId,
            userId
        ),
    ];

    if (query.status) {
        conditions.push(
            eq(
                challengeInvites.status,
                query.status
            )
        );
    }

    return db
        .select({
            id: challengeInvites.id,
            challengeId: challengeInvites.challengeId,
            senderId: challengeInvites.senderId,
            senderUsername: users.username,
            status: challengeInvites.status,
            expiresAt: challengeInvites.expiresAt,
            createdAt: challengeInvites.createdAt,
            updatedAt: challengeInvites.updatedAt,
        })
        .from(challengeInvites)
        .innerJoin(
            users,
            eq(
                users.id,
                challengeInvites.senderId
            )
        )
        .where(and(...conditions))
        .orderBy(
            desc(challengeInvites.createdAt)
        )
        .limit(query.limit)
        .offset(query.offset);
}

/* =========================================================
   ACCEPT INVITE
========================================================= */

export async function acceptChallengeInvite(
    userId: string,
    inviteId: string
) {
    return db.transaction(async (tx) => {
        const [invite] = await tx
            .select({
                id: challengeInvites.id,
                challengeId:
                    challengeInvites.challengeId,
                receiverId:
                    challengeInvites.receiverId,
                status: challengeInvites.status,
                expiresAt:
                    challengeInvites.expiresAt,
            })
            .from(challengeInvites)
            .where(
                and(
                    eq(
                        challengeInvites.id,
                        inviteId
                    ),
                    eq(
                        challengeInvites.receiverId,
                        userId
                    )
                )
            )
            .limit(1);

        if (!invite) {
            throw new Error("Invite not found");
        }

        if (invite.status !== "PENDING") {
            throw new Error(
                "This invite is no longer pending"
            );
        }

        if (
            invite.expiresAt &&
            invite.expiresAt < new Date()
        ) {
            await tx
                .update(challengeInvites)
                .set({
                    status: "EXPIRED",
                    updatedAt: new Date(),
                })
                .where(
                    eq(
                        challengeInvites.id,
                        inviteId
                    )
                );

            throw new Error("Invite has expired");
        }

        const [challenge] = await tx
            .select({
                id: challenges.id,
                status: challenges.status,
                maxMembers:
                    challenges.maxMembers,
            })
            .from(challenges)
            .where(
                eq(
                    challenges.id,
                    invite.challengeId
                )
            )
            .limit(1);

        if (!challenge) {
            throw new Error(
                "Challenge not found"
            );
        }

        if (challenge.status !== "UPCOMING") {
            throw new Error(
                "Challenge is no longer accepting members"
            );
        }

        const [existingMember] = await tx
            .select({
                id: challengeMembers.id,
                status: challengeMembers.status,
            })
            .from(challengeMembers)
            .where(
                and(
                    eq(
                        challengeMembers.challengeId,
                        invite.challengeId
                    ),
                    eq(
                        challengeMembers.userId,
                        userId
                    )
                )
            )
            .limit(1);

        if (
            existingMember &&
            existingMember.status === "ACTIVE"
        ) {
            throw new Error(
                "You are already a member of this challenge"
            );
        }

        if (
            challenge.maxMembers !== null
        ) {
            const members = await tx
                .select({
                    id: challengeMembers.id,
                })
                .from(challengeMembers)
                .where(
                    and(
                        eq(
                            challengeMembers.challengeId,
                            invite.challengeId
                        ),
                        eq(
                            challengeMembers.status,
                            "ACTIVE"
                        )
                    )
                );

            if (
                members.length >=
                challenge.maxMembers
            ) {
                throw new Error(
                    "Challenge is full"
                );
            }
        }

        let member;

        if (existingMember) {
            const [updatedMember] = await tx
                .update(challengeMembers)
                .set({
                    status: "ACTIVE",
                    updatedAt: new Date(),
                })
                .where(
                    eq(
                        challengeMembers.id,
                        existingMember.id
                    )
                )
                .returning();

            member = updatedMember;
        } else {
            const [createdMember] = await tx
                .insert(challengeMembers)
                .values({
                    id: crypto.randomUUID(),
                    challengeId:
                        invite.challengeId,
                    userId,
                    role: "MEMBER",
                    status: "ACTIVE",
                })
                .returning();

            member = createdMember;
        }

        await tx
            .update(challengeInvites)
            .set({
                status: "ACCEPTED",
                updatedAt: new Date(),
            })
            .where(
                eq(
                    challengeInvites.id,
                    inviteId
                )
            );

        if (!member) {
            throw new Error(
                "Failed to join challenge"
            );
        }

        return member;
    });
}

/* =========================================================
   REJECT INVITE
========================================================= */

export async function rejectChallengeInvite(
    userId: string,
    inviteId: string
): Promise<void> {
    const [invite] = await db
        .select({
            id: challengeInvites.id,
            status: challengeInvites.status,
        })
        .from(challengeInvites)
        .where(
            and(
                eq(
                    challengeInvites.id,
                    inviteId
                ),
                eq(
                    challengeInvites.receiverId,
                    userId
                )
            )
        )
        .limit(1);

    if (!invite) {
        throw new Error("Invite not found");
    }

    if (invite.status !== "PENDING") {
        throw new Error(
            "This invite is no longer pending"
        );
    }

    await db
        .update(challengeInvites)
        .set({
            status: "REJECTED",
            updatedAt: new Date(),
        })
        .where(
            eq(
                challengeInvites.id,
                inviteId
            )
        );
}

/* =========================================================
   CANCEL SENT INVITE
========================================================= */

export async function cancelChallengeInvite(
    userId: string,
    inviteId: string
): Promise<void> {
    const [invite] = await db
        .select({
            id: challengeInvites.id,
            senderId: challengeInvites.senderId,
            status: challengeInvites.status,
        })
        .from(challengeInvites)
        .where(
            and(
                eq(
                    challengeInvites.id,
                    inviteId
                ),
                eq(
                    challengeInvites.senderId,
                    userId
                )
            )
        )
        .limit(1);

    if (!invite) {
        throw new Error("Invite not found");
    }

    if (invite.status !== "PENDING") {
        throw new Error(
            "Only pending invites can be cancelled"
        );
    }

    await db
        .update(challengeInvites)
        .set({
            status: "REJECTED",
            updatedAt: new Date(),
        })
        .where(
            eq(
                challengeInvites.id,
                inviteId
            )
        );
}