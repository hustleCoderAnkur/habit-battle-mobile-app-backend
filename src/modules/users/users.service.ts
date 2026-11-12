import { and, desc, eq, ilike, inArray, ne, or, sql } from "drizzle-orm";

import { db } from "../../db/index.js";
import {
    friendships,
    profiles,
    sessions,
    users,
} from "../../db/schema/schema.js";
import { normalizePhone, phoneKey } from "../../utils/phone.js";

import type {
    AdminUpdateUserInput,
    ChangeUserRoleInput,
    ChangeUserStatusInput,
    UpdateProfileInput,
} from "./users.validation.js";

/* =========================================================
   GET CURRENT USER
========================================================= */

export async function getCurrentUser(userId: string) {
    const [result] = await db
        .select({
            id: users.id,
            email: users.email,
            username: users.username,
            phone: users.phone,
            role: users.role,
            status: users.status,
            emailVerified: users.emailVerified,
            lastLoginAt: users.lastLoginAt,
            createdAt: users.createdAt,

            profileId: profiles.id,
            name: profiles.name,
            bio: profiles.bio,
            avatarUrl: profiles.avatarUrl,
            totalPoints: profiles.totalPoints,
            currentStreak: profiles.currentStreak,
            longestStreak: profiles.longestStreak,
        })
        .from(users)
        .leftJoin(profiles, eq(profiles.userId, users.id))
        .where(eq(users.id, userId))
        .limit(1);

    if (!result) {
        throw new Error("User not found");
    }

    return {
        id: result.id,
        email: result.email,
        username: result.username,
        phone: result.phone,
        role: result.role,
        status: result.status,
        emailVerified: result.emailVerified,
        lastLoginAt: result.lastLoginAt,
        createdAt: result.createdAt,
        profile: {
            id: result.profileId,
            name: result.name,
            bio: result.bio,
            avatarUrl: result.avatarUrl,
            totalPoints: result.totalPoints,
            currentStreak: result.currentStreak,
            longestStreak: result.longestStreak,
        },
    };
}

/* =========================================================
   GET USER BY ID
========================================================= */

export async function getUserById(userId: string) {
    const [result] = await db
        .select({
            id: users.id,
            email: users.email,
            username: users.username,
            role: users.role,
            status: users.status,
            emailVerified: users.emailVerified,
            createdAt: users.createdAt,

            profileId: profiles.id,
            name: profiles.name,
            bio: profiles.bio,
            avatarUrl: profiles.avatarUrl,
            totalPoints: profiles.totalPoints,
            currentStreak: profiles.currentStreak,
            longestStreak: profiles.longestStreak,
        })
        .from(users)
        .leftJoin(profiles, eq(profiles.userId, users.id))
        .where(eq(users.id, userId))
        .limit(1);

    if (!result) {
        throw new Error("User not found");
    }

    return {
        id: result.id,
        email: result.email,
        username: result.username,
        role: result.role,
        status: result.status,
        emailVerified: result.emailVerified,
        createdAt: result.createdAt,
        profile: {
            id: result.profileId,
            name: result.name,
            bio: result.bio,
            avatarUrl: result.avatarUrl,
            totalPoints: result.totalPoints,
            currentStreak: result.currentStreak,
            longestStreak: result.longestStreak,
        },
    };
}

/* =========================================================
   UPDATE MY PROFILE
========================================================= */

export async function updateProfile(
    userId: string,
    input: UpdateProfileInput
) {
    const [profile] = await db
        .select({
            id: profiles.id,
        })
        .from(profiles)
        .where(eq(profiles.userId, userId))
        .limit(1);

    if (!profile) {
        throw new Error("Profile not found");
    }

    const [updated] = await db
        .update(profiles)
        .set({
            ...input,
            updatedAt: new Date(),
        })
        .where(eq(profiles.userId, userId))
        .returning();

    if (!updated) {
        throw new Error("Failed to update profile");
    }

    return updated;
}

/* =========================================================
   DELETE MY ACCOUNT
========================================================= */

export async function deleteMyAccount(
    userId: string
): Promise<void> {
    await db
        .update(users)
        .set({
            status: "DELETED",
            updatedAt: new Date(),
        })
        .where(eq(users.id, userId));

    await db
        .update(sessions)
        .set({
            revokedAt: new Date(),
        })
        .where(eq(sessions.userId, userId));
}

/* =========================================================
   ADMIN — LIST USERS
========================================================= */

export async function listUsers(options?: {
    search?: string;
    status?: "ACTIVE" | "SUSPENDED" | "DELETED";
    role?: "USER" | "ADMIN" | "SUPER_ADMIN";
    limit?: number;
    offset?: number;
}) {
    const limit = Math.min(
        Math.max(options?.limit ?? 20, 1),
        100
    );

    const offset = Math.max(options?.offset ?? 0, 0);

    const conditions = [];

    if (options?.status) {
        conditions.push(eq(users.status, options.status));
    }

    if (options?.role) {
        conditions.push(eq(users.role, options.role));
    }

    if (options?.search) {
        const search = `%${options.search}%`;

        conditions.push(
            or(
                ilike(users.username, search),
                ilike(users.email, search)
            )
        );
    }

    return db
        .select({
            id: users.id,
            email: users.email,
            username: users.username,
            role: users.role,
            status: users.status,
            emailVerified: users.emailVerified,
            lastLoginAt: users.lastLoginAt,
            createdAt: users.createdAt,

            name: profiles.name,
            avatarUrl: profiles.avatarUrl,
        })
        .from(users)
        .leftJoin(profiles, eq(profiles.userId, users.id))
        .where(
            conditions.length > 0
                ? and(...conditions)
                : undefined
        )
        .orderBy(desc(users.createdAt))
        .limit(limit)
        .offset(offset);
}

/* =========================================================
   ADMIN — UPDATE USER
========================================================= */

export async function adminUpdateUser(
    userId: string,
    input: AdminUpdateUserInput
) {
    if (input.email) {
        const [existingEmail] = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.email, input.email))
            .limit(1);

        if (existingEmail && existingEmail.id !== userId) {
            throw new Error("Email already exists");
        }
    }

    if (input.username) {
        const [existingUsername] = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.username, input.username))
            .limit(1);

        if (
            existingUsername &&
            existingUsername.id !== userId
        ) {
            throw new Error("Username already exists");
        }
    }

    const [updated] = await db
        .update(users)
        .set({
            ...input,
            updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning({
            id: users.id,
            email: users.email,
            username: users.username,
            role: users.role,
            status: users.status,
        });

    if (!updated) {
        throw new Error("User not found");
    }

    return updated;
}

/* =========================================================
   ADMIN — CHANGE STATUS
========================================================= */

export async function changeUserStatus(
    userId: string,
    input: ChangeUserStatusInput
) {
    const [updated] = await db
        .update(users)
        .set({
            status: input.status,
            updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning({
            id: users.id,
            status: users.status,
        });

    if (!updated) {
        throw new Error("User not found");
    }

    if (input.status === "SUSPENDED" || input.status === "DELETED") {
        await db
            .update(sessions)
            .set({
                revokedAt: new Date(),
            })
            .where(eq(sessions.userId, userId));
    }

    return updated;
}

/* =========================================================
   ADMIN — CHANGE ROLE
========================================================= */

export async function changeUserRole(
    userId: string,
    input: ChangeUserRoleInput
) {
    const [updated] = await db
        .update(users)
        .set({
            role: input.role,
            updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning({
            id: users.id,
            role: users.role,
        });

    if (!updated) {
        throw new Error("User not found");
    }

    return updated;
}

/* =========================================================
   ADMIN — FORCE LOGOUT
========================================================= */

export async function forceLogoutUser(
    userId: string
): Promise<void> {
    await db
        .update(sessions)
        .set({
            revokedAt: new Date(),
        })
        .where(eq(sessions.userId, userId));
}

/* =========================================================
   ADMIN — DELETE USER
========================================================= */

export async function adminDeleteUser(
    userId: string
): Promise<void> {
    const [updated] = await db
        .update(users)
        .set({
            status: "DELETED",
            updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning({
            id: users.id,
        });

    if (!updated) {
        throw new Error("User not found");
    }

    await db
        .update(sessions)
        .set({
            revokedAt: new Date(),
        })
        .where(eq(sessions.userId, userId));
}

/* =========================================================
   SEARCH USERS
========================================================= */

export async function searchUsers(
    query: string,
    currentUserId: string
) {
    const term = `%${query.trim()}%`;

    return db
        .select({
            id: users.id,
            username: users.username,
            name: profiles.name,
            avatarUrl: profiles.avatarUrl,
        })
        .from(users)
        .leftJoin(profiles, eq(profiles.userId, users.id))
        .where(
            and(
                eq(users.status, "ACTIVE"),
                ne(users.id, currentUserId),
                or(
                    ilike(users.username, term),
                    ilike(profiles.name, term)
                )
            )
        )
        .limit(20);
}

/* =========================================================
   FIND PEOPLE: lookup + contact matching
========================================================= */

export type Relationship =
    | "FRIEND"
    | "REQUEST_SENT"
    | "REQUEST_RECEIVED"
    | "NONE";

async function relationshipsWith(
    currentUserId: string,
    otherIds: string[]
): Promise<Map<string, Relationship>> {
    const result = new Map<string, Relationship>();

    if (otherIds.length === 0) return result;

    const rows = await db
        .select({
            senderId: friendships.senderId,
            receiverId: friendships.receiverId,
            status: friendships.status,
        })
        .from(friendships)
        .where(
            and(
                or(
                    and(
                        eq(friendships.senderId, currentUserId),
                        inArray(friendships.receiverId, otherIds)
                    ),
                    and(
                        eq(friendships.receiverId, currentUserId),
                        inArray(friendships.senderId, otherIds)
                    )
                ),
                or(
                    eq(friendships.status, "ACCEPTED"),
                    eq(friendships.status, "PENDING")
                )
            )
        );

    for (const row of rows) {
        const otherId =
            row.senderId === currentUserId ? row.receiverId : row.senderId;

        if (row.status === "ACCEPTED") {
            result.set(otherId, "FRIEND");
        } else {
            result.set(
                otherId,
                row.senderId === currentUserId
                    ? "REQUEST_SENT"
                    : "REQUEST_RECEIVED"
            );
        }
    }

    return result;
}

/** phone condition: last 10 digits for long numbers, exact for 8-9 digit ones */
function phoneCondition(phones: string[]) {
    const keys = new Set<string>();
    const exact = new Set<string>();

    for (const raw of phones) {
        const digits = normalizePhone(raw);
        if (!digits) continue;

        if (digits.length >= 10) keys.add(phoneKey(digits));
        else exact.add(digits);
    }

    const parts = [];

    if (keys.size > 0) {
        parts.push(
            sql`right(${users.phone}, 10) in (${sql.join(
                [...keys].map((key) => sql`${key}`),
                sql`, `
            )})`
        );
    }

    if (exact.size > 0) {
        parts.push(inArray(users.phone, [...exact]));
    }

    return { condition: parts.length ? or(...parts) : undefined, keys, exact };
}

const personColumns = {
    id: users.id,
    username: users.username,
    email: users.email,
    phone: users.phone,
    name: profiles.name,
    avatarUrl: profiles.avatarUrl,
};

/** GET /users/lookup?email= | ?phone=  ->  one person or null */
export async function lookupUser(
    input: { email?: string; phone?: string },
    currentUserId: string
) {
    let match;

    if (input.email) {
        match = eq(users.email, input.email.toLowerCase());
    } else {
        const { condition } = phoneCondition([input.phone ?? ""]);

        if (!condition) return null;
        match = condition;
    }

    const [row] = await db
        .select(personColumns)
        .from(users)
        .leftJoin(profiles, eq(profiles.userId, users.id))
        .where(
            and(
                eq(users.status, "ACTIVE"),
                ne(users.id, currentUserId),
                match
            )
        )
        .limit(1);

    if (!row) return null;

    const relationships = await relationshipsWith(currentUserId, [row.id]);

    return {
        id: row.id,
        username: row.username,
        name: row.name,
        avatarUrl: row.avatarUrl,
        relationship: relationships.get(row.id) ?? ("NONE" as Relationship),
    };
}

/**
 * POST /users/match-contacts
 * Which of these emails / phone numbers belong to registered users?
 * Nothing from the request is stored.
 */
export async function matchContacts(
    currentUserId: string,
    input: { emails: string[]; phones: string[] }
) {
    const emails = [...new Set(input.emails.map((e) => e.toLowerCase()))];
    const { condition: phoneCond, keys, exact } = phoneCondition(input.phones);

    const conditions = [];

    if (emails.length > 0) conditions.push(inArray(users.email, emails));
    if (phoneCond) conditions.push(phoneCond);

    if (conditions.length === 0) return [];

    const rows = await db
        .select(personColumns)
        .from(users)
        .leftJoin(profiles, eq(profiles.userId, users.id))
        .where(
            and(
                eq(users.status, "ACTIVE"),
                ne(users.id, currentUserId),
                or(...conditions)
            )
        )
        .limit(1000);

    const relationships = await relationshipsWith(
        currentUserId,
        rows.map((row) => row.id)
    );

    const emailSet = new Set(emails);

    return rows.map((row) => {
        const phoneDigits = row.phone ?? "";
        const matchedPhoneKeys: string[] = [];

        if (phoneDigits.length >= 10 && keys.has(phoneKey(phoneDigits))) {
            matchedPhoneKeys.push(phoneKey(phoneDigits));
        }
        if (exact.has(phoneDigits)) matchedPhoneKeys.push(phoneDigits);

        return {
            id: row.id,
            username: row.username,
            name: row.name,
            avatarUrl: row.avatarUrl,
            relationship: relationships.get(row.id) ?? ("NONE" as Relationship),
            matchedEmails: emailSet.has(row.email) ? [row.email] : [],
            matchedPhoneKeys,
        };
    });
}

/* =========================================================
   SET MY PHONE
========================================================= */

export async function setMyPhone(userId: string, rawPhone: string | null) {
    let phone: string | null = null;

    if (rawPhone && rawPhone.trim()) {
        phone = normalizePhone(rawPhone);

        if (!phone) throw new Error("Enter a valid mobile number");

        const [taken] = await db
            .select({ id: users.id })
            .from(users)
            .where(and(eq(users.phone, phone), ne(users.id, userId)))
            .limit(1);

        if (taken) throw new Error("Mobile number already in use");
    }

    await db
        .update(users)
        .set({ phone, updatedAt: new Date() })
        .where(eq(users.id, userId));

    return { phone };
}
