import {
    and,
    count,
    desc,
    eq,
    gte,
    lte,
    sql,
    sum,
} from "drizzle-orm";

import { db } from "../../db/index.js";

import {
    checkIns,
    challengeMembers,
    challenges,
    users,
} from "../../db/schema/schema.js";

import type {
    CreateCheckInInput,
    VerifyCheckInInput,
    RejectCheckInInput,
    CheckInListQuery,
    CheckInStatsQuery,
} from "./check-ins.validation.js";

/* =========================================================
   CONSTANTS
========================================================= */

const DAILY_COMPLETION_POINTS = 10;
const VERIFICATION_BONUS_POINTS = 5;

/* =========================================================
   HELPERS
========================================================= */

function startOfDay(date: Date): Date {
    const result = new Date(date);
    result.setUTCHours(0, 0, 0, 0);
    return result;
}

/* =========================================================
   CREATE CHECK-IN
========================================================= */

export async function createCheckIn(
    userId: string,
    challengeId: string,
    input: CreateCheckInInput
) {
    return db.transaction(async (tx) => {
        const checkInDate = startOfDay(
            input.checkInDate
        );

        /* ---------------------------------------------
           CHALLENGE
        --------------------------------------------- */

        const [challenge] = await tx
            .select({
                id: challenges.id,
                startDate: challenges.startDate,
                endDate: challenges.endDate,
                status: challenges.status,
            })
            .from(challenges)
            .where(
                eq(challenges.id, challengeId)
            )
            .limit(1);

        if (!challenge) {
            throw new Error("Challenge not found");
        }

        /* ---------------------------------------------
           MEMBERSHIP
        --------------------------------------------- */

        const [member] = await tx
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

        /* ---------------------------------------------
           DATE VALIDATION
        --------------------------------------------- */

        const challengeStart = startOfDay(
            challenge.startDate
        );

        const challengeEnd = startOfDay(
            challenge.endDate
        );

        if (
            checkInDate < challengeStart ||
            checkInDate > challengeEnd
        ) {
            throw new Error(
                "Check-in date must be within the challenge period"
            );
        }

        const today = startOfDay(new Date());

        if (checkInDate > today) {
            throw new Error(
                "You cannot create a future check-in"
            );
        }

        /* ---------------------------------------------
           ONE CHECK-IN PER DAY
        --------------------------------------------- */

        const [existingCheckIn] = await tx
            .select({
                id: checkIns.id,
            })
            .from(checkIns)
            .where(
                and(
                    eq(
                        checkIns.challengeId,
                        challengeId
                    ),
                    eq(
                        checkIns.userId,
                        userId
                    ),
                    eq(
                        checkIns.checkInDate,
                        checkInDate
                    )
                )
            )
            .limit(1);

        if (existingCheckIn) {
            throw new Error(
                "You have already checked in for this day"
            );
        }

        /* ---------------------------------------------
           CREATE
        --------------------------------------------- */

        const [createdCheckIn] = await tx
            .insert(checkIns)
            .values({
                id: crypto.randomUUID(),
                challengeId,
                userId,
                uploadId: input.proofUrl ?? null,
                checkInDate,
                note: input.note ?? null,
                status: "PENDING",
                pointsAwarded:
                    DAILY_COMPLETION_POINTS,
            })
            .returning();

        if (!createdCheckIn) {
            throw new Error(
                "Failed to create check-in"
            );
        }

        return createdCheckIn;
    });
}

/* =========================================================
   GET CHECK-IN BY ID
========================================================= */

export async function getCheckInById(
    userId: string,
    checkInId: string
) {
    const [checkIn] = await db
        .select({
            id: checkIns.id,
            challengeId: checkIns.challengeId,
            userId: checkIns.userId,
            uploadId: checkIns.uploadId,
            checkInDate: checkIns.checkInDate,
            note: checkIns.note,
            status: checkIns.status,
            pointsAwarded:
                checkIns.pointsAwarded,
            verifiedBy: checkIns.verifiedBy,
            verifiedAt: checkIns.verifiedAt,
            createdAt: checkIns.createdAt,
            updatedAt: checkIns.updatedAt,
            username: users.username,
        })
        .from(checkIns)
        .innerJoin(
            users,
            eq(
                users.id,
                checkIns.userId
            )
        )
        .where(
            and(
                eq(checkIns.id, checkInId),
                eq(
                    checkIns.userId,
                    userId
                )
            )
        )
        .limit(1);

    if (!checkIn) {
        throw new Error("Check-in not found");
    }

    return checkIn;
}

/* =========================================================
   GET CHALLENGE CHECK-INS
========================================================= */

export async function getChallengeCheckIns(
    challengeId: string,
    query: CheckInListQuery
) {
    const conditions = [
        eq(
            checkIns.challengeId,
            challengeId
        ),
    ];

    if (query.status) {
        conditions.push(
            eq(
                checkIns.status,
                query.status
            )
        );
    }

    if (query.userId) {
        conditions.push(
            eq(
                checkIns.userId,
                query.userId
            )
        );
    }

    if (query.startDate) {
        conditions.push(
            gte(
                checkIns.checkInDate,
                startOfDay(query.startDate)
            )
        );
    }

    if (query.endDate) {
        conditions.push(
            lte(
                checkIns.checkInDate,
                startOfDay(query.endDate)
            )
        );
    }

    return db
        .select({
            id: checkIns.id,
            challengeId: checkIns.challengeId,
            userId: checkIns.userId,
            username: users.username,
            uploadId: checkIns.uploadId,
            checkInDate: checkIns.checkInDate,
            note: checkIns.note,
            status: checkIns.status,
            pointsAwarded:
                checkIns.pointsAwarded,
            verifiedBy:
                checkIns.verifiedBy,
            verifiedAt:
                checkIns.verifiedAt,
            createdAt:
                checkIns.createdAt,
        })
        .from(checkIns)
        .innerJoin(
            users,
            eq(
                users.id,
                checkIns.userId
            )
        )
        .where(and(...conditions))
        .orderBy(
            desc(checkIns.checkInDate)
        )
        .limit(query.limit)
        .offset(query.offset);
}

/* =========================================================
   GET MY CHECK-INS
========================================================= */

export async function getMyCheckIns(
    userId: string,
    challengeId: string,
    query: CheckInListQuery
) {
    return getChallengeCheckIns(
        challengeId,
        {
            ...query,
            userId,
        }
    );
}

/* =========================================================
   VERIFY CHECK-IN
========================================================= */

export async function verifyCheckIn(
    verifierId: string,
    checkInId: string,
    input: VerifyCheckInInput
) {
    return db.transaction(async (tx) => {
        /* ---------------------------------------------
           GET CHECK-IN
        --------------------------------------------- */

        const [checkIn] = await tx
            .select({
                id: checkIns.id,
                challengeId:
                    checkIns.challengeId,
                userId: checkIns.userId,
                status: checkIns.status,
            })
            .from(checkIns)
            .where(
                eq(
                    checkIns.id,
                    checkInId
                )
            )
            .limit(1);

        if (!checkIn) {
            throw new Error(
                "Check-in not found"
            );
        }

        if (checkIn.status !== "PENDING") {
            throw new Error(
                "Only pending check-ins can be verified"
            );
        }

        /* ---------------------------------------------
           VERIFYING USER MUST BE MEMBER
        --------------------------------------------- */

        const [verifier] = await tx
            .select({
                id: challengeMembers.id,
            })
            .from(challengeMembers)
            .where(
                and(
                    eq(
                        challengeMembers.challengeId,
                        checkIn.challengeId
                    ),
                    eq(
                        challengeMembers.userId,
                        verifierId
                    ),
                    eq(
                        challengeMembers.status,
                        "ACTIVE"
                    )
                )
            )
            .limit(1);

        if (!verifier) {
            throw new Error(
                "Only active challenge members can verify check-ins"
            );
        }

        /* ---------------------------------------------
           NO SELF VERIFICATION
        --------------------------------------------- */

        if (
            checkIn.userId === verifierId
        ) {
            throw new Error(
                "You cannot verify your own check-in"
            );
        }

        /* ---------------------------------------------
           POINTS
        --------------------------------------------- */

        const bonus =
            input.points ??
            VERIFICATION_BONUS_POINTS;

        const totalPoints =
            DAILY_COMPLETION_POINTS +
            bonus;

        /* ---------------------------------------------
           UPDATE CHECK-IN
        --------------------------------------------- */

        const [updatedCheckIn] =
            await tx
                .update(checkIns)
                .set({
                    status: "VERIFIED",
                    pointsAwarded:
                        totalPoints,
                    verifiedBy:
                        verifierId,
                    verifiedAt:
                        new Date(),
                    updatedAt:
                        new Date(),
                })
                .where(
                    eq(
                        checkIns.id,
                        checkInId
                    )
                )
                .returning();

        if (!updatedCheckIn) {
            throw new Error(
                "Failed to verify check-in"
            );
        }

        /* ---------------------------------------------
           UPDATE MEMBER POINTS
        --------------------------------------------- */

        const [member] = await tx
            .select({
                id: challengeMembers.id,
                points:
                    challengeMembers.points,
            })
            .from(challengeMembers)
            .where(
                and(
                    eq(
                        challengeMembers.challengeId,
                        checkIn.challengeId
                    ),
                    eq(
                        challengeMembers.userId,
                        checkIn.userId
                    )
                )
            )
            .limit(1);

        if (!member) {
            throw new Error(
                "Challenge membership not found"
            );
        }

        await tx
            .update(challengeMembers)
            .set({
                points:
                    member.points +
                    totalPoints,
                updatedAt:
                    new Date(),
            })
            .where(
                eq(
                    challengeMembers.id,
                    member.id
                )
            );

        return updatedCheckIn;
    });
}

/* =========================================================
   REJECT CHECK-IN
========================================================= */

export async function rejectCheckIn(
    verifierId: string,
    checkInId: string,
    _input: RejectCheckInInput
) {
    return db.transaction(async (tx) => {
        /* ---------------------------------------------
           GET CHECK-IN
        --------------------------------------------- */

        const [checkIn] = await tx
            .select({
                id: checkIns.id,
                challengeId:
                    checkIns.challengeId,
                userId: checkIns.userId,
                status: checkIns.status,
            })
            .from(checkIns)
            .where(
                eq(
                    checkIns.id,
                    checkInId
                )
            )
            .limit(1);

        if (!checkIn) {
            throw new Error(
                "Check-in not found"
            );
        }

        if (checkIn.status !== "PENDING") {
            throw new Error(
                "Only pending check-ins can be rejected"
            );
        }

        /* ---------------------------------------------
           VERIFY MEMBER
        --------------------------------------------- */

        const [verifier] = await tx
            .select({
                id: challengeMembers.id,
            })
            .from(challengeMembers)
            .where(
                and(
                    eq(
                        challengeMembers.challengeId,
                        checkIn.challengeId
                    ),
                    eq(
                        challengeMembers.userId,
                        verifierId
                    ),
                    eq(
                        challengeMembers.status,
                        "ACTIVE"
                    )
                )
            )
            .limit(1);

        if (!verifier) {
            throw new Error(
                "Only active challenge members can reject check-ins"
            );
        }

        if (
            checkIn.userId === verifierId
        ) {
            throw new Error(
                "You cannot reject your own check-in"
            );
        }

        /* ---------------------------------------------
           REJECT
        --------------------------------------------- */

        const [updatedCheckIn] =
            await tx
                .update(checkIns)
                .set({
                    status: "REJECTED",
                    pointsAwarded: 0,
                    updatedAt:
                        new Date(),
                })
                .where(
                    eq(
                        checkIns.id,
                        checkInId
                    )
                )
                .returning();

        if (!updatedCheckIn) {
            throw new Error(
                "Failed to reject check-in"
            );
        }

        return updatedCheckIn;
    });
}

/* =========================================================
   DELETE CHECK-IN
========================================================= */

export async function deleteCheckIn(
    userId: string,
    checkInId: string
): Promise<void> {
    const [checkIn] = await db
        .select({
            id: checkIns.id,
            userId: checkIns.userId,
            status: checkIns.status,
        })
        .from(checkIns)
        .where(
            eq(
                checkIns.id,
                checkInId
            )
        )
        .limit(1);

    if (!checkIn) {
        throw new Error(
            "Check-in not found"
        );
    }

    if (checkIn.userId !== userId) {
        throw new Error(
            "You can only delete your own check-in"
        );
    }

    if (checkIn.status === "VERIFIED") {
        throw new Error(
            "Verified check-in cannot be deleted"
        );
    }

    await db
        .delete(checkIns)
        .where(
            eq(
                checkIns.id,
                checkInId
            )
        );
}

/* =========================================================
   GLOBAL CHECK-IN STATS
========================================================= */

export async function getCheckInStats(
    query: CheckInStatsQuery
) {
    const conditions = [];

    if (query.startDate) {
        conditions.push(
            gte(
                checkIns.checkInDate,
                startOfDay(
                    query.startDate
                )
            )
        );
    }

    if (query.endDate) {
        conditions.push(
            lte(
                checkIns.checkInDate,
                startOfDay(
                    query.endDate
                )
            )
        );
    }

    const [stats] = await db
        .select({
            total: count(
                checkIns.id
            ),

            pending: sql<number>`
                count(*) filter (
                    where ${checkIns.status} = 'PENDING'
                )
            `,

            verified: sql<number>`
                count(*) filter (
                    where ${checkIns.status} = 'VERIFIED'
                )
            `,

            rejected: sql<number>`
                count(*) filter (
                    where ${checkIns.status} = 'REJECTED'
                )
            `,

            totalPoints:
                sum(
                    checkIns.pointsAwarded
                ),
        })
        .from(checkIns)
        .where(
            conditions.length
                ? and(...conditions)
                : undefined
        );

    return {
        total: Number(
            stats?.total ?? 0
        ),
        pending: Number(
            stats?.pending ?? 0
        ),
        verified: Number(
            stats?.verified ?? 0
        ),
        rejected: Number(
            stats?.rejected ?? 0
        ),
        totalPoints: Number(
            stats?.totalPoints ?? 0
        ),
    };
}

/* =========================================================
   CHALLENGE CHECK-IN STATS
========================================================= */

export async function getChallengeCheckInStats(
    challengeId: string,
    query: CheckInStatsQuery
) {
    const conditions = [
        eq(
            checkIns.challengeId,
            challengeId
        ),
    ];

    if (query.startDate) {
        conditions.push(
            gte(
                checkIns.checkInDate,
                startOfDay(
                    query.startDate
                )
            )
        );
    }

    if (query.endDate) {
        conditions.push(
            lte(
                checkIns.checkInDate,
                startOfDay(
                    query.endDate
                )
            )
        );
    }

    const [stats] = await db
        .select({
            total: count(
                checkIns.id
            ),

            pending: sql<number>`
                count(*) filter (
                    where ${checkIns.status} = 'PENDING'
                )
            `,

            verified: sql<number>`
                count(*) filter (
                    where ${checkIns.status} = 'VERIFIED'
                )
            `,

            rejected: sql<number>`
                count(*) filter (
                    where ${checkIns.status} = 'REJECTED'
                )
            `,

            totalPoints:
                sum(
                    checkIns.pointsAwarded
                ),
        })
        .from(checkIns)
        .where(
            and(...conditions)
        );

    return {
        challengeId,
        total: Number(
            stats?.total ?? 0
        ),
        pending: Number(
            stats?.pending ?? 0
        ),
        verified: Number(
            stats?.verified ?? 0
        ),
        rejected: Number(
            stats?.rejected ?? 0
        ),
        totalPoints: Number(
            stats?.totalPoints ?? 0
        ),
    };
}