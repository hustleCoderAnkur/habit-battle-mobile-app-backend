import { and, eq, or } from "drizzle-orm";

import { db } from "../../db/index.js";
import { friendships, users } from "../../db/schema/schema.js";

import type {
    SendFriendRequestInput,
} from "./friendships.validation.js";

/* =========================================================
   SEND FRIEND REQUEST
========================================================= */

export async function sendFriendRequest(
    senderId: string,
    input: SendFriendRequestInput
) {
    const receiverId = input.userId;

    if (senderId === receiverId) {
        throw new Error(
            "You cannot send a friend request to yourself"
        );
    }

    const [receiver] = await db
        .select({
            id: users.id,
            status: users.status,
        })
        .from(users)
        .where(eq(users.id, receiverId))
        .limit(1);

    if (!receiver) {
        throw new Error("User not found");
    }

    if (receiver.status !== "ACTIVE") {
        throw new Error("User account is not active");
    }

    // Check both directions
    const [existing] = await db
        .select({
            id: friendships.id,
            status: friendships.status,
        })
        .from(friendships)
        .where(
            or(
                and(
                    eq(friendships.senderId, senderId),
                    eq(friendships.receiverId, receiverId)
                ),
                and(
                    eq(friendships.senderId, receiverId),
                    eq(friendships.receiverId, senderId)
                )
            )
        )
        .limit(1);

    if (existing) {
        throw new Error(
            `Friendship already exists with status: ${existing.status}`
        );
    }

    const [friendship] = await db
        .insert(friendships)
        .values({
            id: crypto.randomUUID(),
            senderId,
            receiverId,
            status: "PENDING",
        })
        .returning();

    if (!friendship) {
        throw new Error("Failed to send friend request");
    }

    return friendship;
}

/* =========================================================
   ACCEPT FRIEND REQUEST
========================================================= */

export async function acceptFriendRequest(
    userId: string,
    friendshipId: string
) {
    const [friendship] = await db
        .select()
        .from(friendships)
        .where(
            and(
                eq(friendships.id, friendshipId),
                eq(friendships.receiverId, userId),
                eq(friendships.status, "PENDING")
            )
        )
        .limit(1);

    if (!friendship) {
        throw new Error("Friend request not found");
    }

    const [updated] = await db
        .update(friendships)
        .set({
            status: "ACCEPTED",
            updatedAt: new Date(),
        })
        .where(eq(friendships.id, friendshipId))
        .returning();

    if (!updated) {
        throw new Error(
            "Failed to accept friend request"
        );
    }

    return updated;
}

/* =========================================================
   REJECT FRIEND REQUEST
========================================================= */

export async function rejectFriendRequest(
    userId: string,
    friendshipId: string
) {
    const [friendship] = await db
        .select()
        .from(friendships)
        .where(
            and(
                eq(friendships.id, friendshipId),
                eq(friendships.receiverId, userId),
                eq(friendships.status, "PENDING")
            )
        )
        .limit(1);

    if (!friendship) {
        throw new Error("Friend request not found");
    }

    const [updated] = await db
        .update(friendships)
        .set({
            status: "REJECTED",
            updatedAt: new Date(),
        })
        .where(eq(friendships.id, friendshipId))
        .returning();

    if (!updated) {
        throw new Error(
            "Failed to reject friend request"
        );
    }

    return updated;
}

/* =========================================================
   REMOVE FRIENDSHIP
========================================================= */

export async function removeFriendship(
    userId: string,
    friendshipId: string
): Promise<void> {
    const [friendship] = await db
        .select({
            id: friendships.id,
            senderId: friendships.senderId,
            receiverId: friendships.receiverId,
        })
        .from(friendships)
        .where(
            and(
                eq(friendships.id, friendshipId),
                or(
                    eq(friendships.senderId, userId),
                    eq(friendships.receiverId, userId)
                )
            )
        )
        .limit(1);

    if (!friendship) {
        throw new Error("Friendship not found");
    }

    await db
        .delete(friendships)
        .where(eq(friendships.id, friendshipId));
}

/* =========================================================
   GET MY FRIENDS
========================================================= */

export async function getFriends(userId: string) {
    const relationships = await db
        .select({
            friendshipId: friendships.id,
            senderId: friendships.senderId,
            receiverId: friendships.receiverId,
            status: friendships.status,
            createdAt: friendships.createdAt,
        })
        .from(friendships)
        .where(
            and(
                or(
                    eq(friendships.senderId, userId),
                    eq(friendships.receiverId, userId)
                ),
                eq(friendships.status, "ACCEPTED")
            )
        );

    if (relationships.length === 0) {
        return [];
    }

    const friendIds = relationships.map((friendship) =>
        friendship.senderId === userId
            ? friendship.receiverId
            : friendship.senderId
    );

    const friendUsers = await db
        .select({
            id: users.id,
            username: users.username,
            email: users.email,
        })
        .from(users)
        .where(
            or(
                ...friendIds.map((id) =>
                    eq(users.id, id)
                )
            )
        );

    const userMap = new Map(
        friendUsers.map((user) => [user.id, user])
    );

    return relationships.map((friendship) => {
        const friendId =
            friendship.senderId === userId
                ? friendship.receiverId
                : friendship.senderId;

        const friend = userMap.get(friendId);

        return {
            friendshipId: friendship.friendshipId,
            userId: friendId,
            username: friend?.username ?? null,
            email: friend?.email ?? null,
            status: friendship.status,
            createdAt: friendship.createdAt,
        };
    });
}

/* =========================================================
   GET INCOMING REQUESTS
========================================================= */

export async function getIncomingRequests(
    userId: string
) {
    return db
        .select({
            friendshipId: friendships.id,
            userId: users.id,
            username: users.username,
            email: users.email,
            createdAt: friendships.createdAt,
        })
        .from(friendships)
        .innerJoin(
            users,
            eq(users.id, friendships.senderId)
        )
        .where(
            and(
                eq(friendships.receiverId, userId),
                eq(friendships.status, "PENDING")
            )
        );
}

/* =========================================================
   GET OUTGOING REQUESTS
========================================================= */

export async function getOutgoingRequests(
    userId: string
) {
    return db
        .select({
            friendshipId: friendships.id,
            userId: users.id,
            username: users.username,
            email: users.email,
            createdAt: friendships.createdAt,
        })
        .from(friendships)
        .innerJoin(
            users,
            eq(users.id, friendships.receiverId)
        )
        .where(
            and(
                eq(friendships.senderId, userId),
                eq(friendships.status, "PENDING")
            )
        );
}