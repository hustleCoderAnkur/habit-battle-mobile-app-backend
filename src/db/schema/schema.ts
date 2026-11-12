import {
    boolean,
    integer,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uniqueIndex,
    index,
} from "drizzle-orm/pg-core";

/* =========================================================
   ENUMS
========================================================= */

export const userRoleEnum = pgEnum("user_role", [
    "USER",
    "ADMIN",
    "SUPER_ADMIN",
]);

export const userStatusEnum = pgEnum("user_status", [
    "ACTIVE",
    "SUSPENDED",
    "DELETED",
]);

export const friendshipStatusEnum = pgEnum("friendship_status", [
    "PENDING",
    "ACCEPTED",
    "REJECTED",
    "BLOCKED",
]);

export const challengeStatusEnum = pgEnum("challenge_status", [
    "UPCOMING",
    "ACTIVE",
    "COMPLETED",
    "CANCELLED",
]);

export const challengeMemberRoleEnum = pgEnum("challenge_member_role", [
    "OWNER",
    "MEMBER",
]);

export const challengeMemberStatusEnum = pgEnum("challenge_member_status", [
    "INVITED",
    "ACTIVE",
    "LEFT",
    "REMOVED",
]);

export const inviteStatusEnum = pgEnum("invite_status", [
    "PENDING",
    "ACCEPTED",
    "REJECTED",
    "EXPIRED",
]);

export const checkInStatusEnum = pgEnum("check_in_status", [
    "PENDING",
    "VERIFIED",
    "REJECTED",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
    "FRIEND_REQUEST",
    "FRIEND_ACCEPTED",
    "CHALLENGE_INVITE",
    "CHALLENGE_JOINED",
    "CHECK_IN_VERIFICATION",
    "CHECK_IN_VERIFIED",
    "CHECK_IN_REJECTED",
    "STREAK_MILESTONE",
    "CHALLENGE_COMPLETED",
    "SYSTEM",
]);

export const devicePlatformEnum = pgEnum("device_platform", [
    "IOS",
    "ANDROID",
    "WEB",
]);

export const auditActionEnum = pgEnum("audit_action", [
    "USER_CREATED",
    "USER_UPDATED",
    "USER_SUSPENDED",
    "USER_UNSUSPENDED",
    "USER_DELETED",
    "ROLE_CHANGED",
    "FORCE_LOGOUT",
    "CHALLENGE_UPDATED",
    "CHALLENGE_DELETED",
    "CHECK_IN_VERIFIED",
    "CHECK_IN_REJECTED",
    "NOTIFICATION_SENT",
]);

/* =========================================================
   USERS
========================================================= */

export const users = pgTable(
    "users",
    {
        id: text("id").primaryKey(),

        email: text("email").notNull(),
        username: text("username").notNull(),

        passwordHash: text("password_hash").notNull(),

        // digits only (country code optional), e.g. "919876543210"
        phone: text("phone"),

        role: userRoleEnum("role").notNull().default("USER"),

        status: userStatusEnum("status").notNull().default("ACTIVE"),

        emailVerified: boolean("email_verified")
            .notNull()
            .default(false),

        lastLoginAt: timestamp("last_login_at"),

        createdAt: timestamp("created_at")
            .notNull()
            .defaultNow(),

        updatedAt: timestamp("updated_at")
            .notNull()
            .defaultNow(),
    },
    (table) => [
        uniqueIndex("users_email_unique").on(table.email),
        uniqueIndex("users_username_unique").on(table.username),
        uniqueIndex("users_phone_unique").on(table.phone),
        index("users_role_idx").on(table.role),
        index("users_status_idx").on(table.status),
    ]
);

/* =========================================================
   PROFILES
========================================================= */

export const profiles = pgTable(
    "profiles",
    {
        id: text("id").primaryKey(),

        userId: text("user_id")
            .notNull()
            .references(() => users.id, {
                onDelete: "cascade",
            }),

        name: text("name"),

        bio: text("bio"),

        avatarUrl: text("avatar_url"),

        totalPoints: integer("total_points")
            .notNull()
            .default(0),

        currentStreak: integer("current_streak")
            .notNull()
            .default(0),

        longestStreak: integer("longest_streak")
            .notNull()
            .default(0),

        createdAt: timestamp("created_at")
            .notNull()
            .defaultNow(),

        updatedAt: timestamp("updated_at")
            .notNull()
            .defaultNow(),
    },
    (table) => [
        uniqueIndex("profiles_user_unique").on(table.userId),
    ]
);

/* =========================================================
   SESSIONS
========================================================= */

export const sessions = pgTable(
    "sessions",
    {
        id: text("id").primaryKey(),

        userId: text("user_id")
            .notNull()
            .references(() => users.id, {
                onDelete: "cascade",
            }),

        refreshTokenHash: text("refresh_token_hash").notNull(),

        expiresAt: timestamp("expires_at").notNull(),

        revokedAt: timestamp("revoked_at"),

        userAgent: text("user_agent"),

        ipAddress: text("ip_address"),

        createdAt: timestamp("created_at")
            .notNull()
            .defaultNow(),
    },
    (table) => [
        index("sessions_user_idx").on(table.userId),
        index("sessions_expires_idx").on(table.expiresAt),
    ]
);

/* =========================================================
   FRIENDSHIPS
========================================================= */

export const friendships = pgTable(
    "friendships",
    {
        id: text("id").primaryKey(),

        senderId: text("sender_id")
            .notNull()
            .references(() => users.id, {
                onDelete: "cascade",
            }),

        receiverId: text("receiver_id")
            .notNull()
            .references(() => users.id, {
                onDelete: "cascade",
            }),

        status: friendshipStatusEnum("status")
            .notNull()
            .default("PENDING"),

        createdAt: timestamp("created_at")
            .notNull()
            .defaultNow(),

        updatedAt: timestamp("updated_at")
            .notNull()
            .defaultNow(),
    },
    (table) => [
        index("friendships_sender_idx").on(table.senderId),
        index("friendships_receiver_idx").on(table.receiverId),
        uniqueIndex("friendships_sender_receiver_unique").on(
            table.senderId,
            table.receiverId
        ),
    ]
);

/* =========================================================
   CHALLENGES
========================================================= */

export const challenges = pgTable(
    "challenges",
    {
        id: text("id").primaryKey(),

        name: text("name").notNull(),

        description: text("description"),

        createdBy: text("created_by")
            .notNull()
            .references(() => users.id, {
                onDelete: "cascade",
            }),

        startDate: timestamp("start_date").notNull(),

        endDate: timestamp("end_date").notNull(),

        maxMembers: integer("max_members"),

        status: challengeStatusEnum("status")
            .notNull()
            .default("UPCOMING"),

        createdAt: timestamp("created_at")
            .notNull()
            .defaultNow(),

        updatedAt: timestamp("updated_at")
            .notNull()
            .defaultNow(),
    },
    (table) => [
        index("challenges_created_by_idx").on(table.createdBy),
        index("challenges_status_idx").on(table.status),
        index("challenges_start_date_idx").on(table.startDate),
    ]
);

/* =========================================================
   CHALLENGE MEMBERS
========================================================= */

export const challengeMembers = pgTable(
    "challenge_members",
    {
        id: text("id").primaryKey(),

        challengeId: text("challenge_id")
            .notNull()
            .references(() => challenges.id, {
                onDelete: "cascade",
            }),

        userId: text("user_id")
            .notNull()
            .references(() => users.id, {
                onDelete: "cascade",
            }),

        role: challengeMemberRoleEnum("role")
            .notNull()
            .default("MEMBER"),

        status: challengeMemberStatusEnum("status")
            .notNull()
            .default("ACTIVE"),

        points: integer("points")
            .notNull()
            .default(0),

        currentStreak: integer("current_streak")
            .notNull()
            .default(0),

        longestStreak: integer("longest_streak")
            .notNull()
            .default(0),

        joinedAt: timestamp("joined_at")
            .notNull()
            .defaultNow(),

        updatedAt: timestamp("updated_at")
            .notNull()
            .defaultNow(),
    },
    (table) => [
        uniqueIndex("challenge_members_unique").on(
            table.challengeId,
            table.userId
        ),
        index("challenge_members_challenge_idx").on(
            table.challengeId
        ),
        index("challenge_members_user_idx").on(table.userId),
    ]
);

/* =========================================================
   CHALLENGE INVITES
========================================================= */

export const challengeInvites = pgTable(
    "challenge_invites",
    {
        id: text("id").primaryKey(),

        challengeId: text("challenge_id")
            .notNull()
            .references(() => challenges.id, {
                onDelete: "cascade",
            }),

        senderId: text("sender_id")
            .notNull()
            .references(() => users.id, {
                onDelete: "cascade",
            }),

        receiverId: text("receiver_id")
            .notNull()
            .references(() => users.id, {
                onDelete: "cascade",
            }),

        status: inviteStatusEnum("status")
            .notNull()
            .default("PENDING"),

        expiresAt: timestamp("expires_at"),

        createdAt: timestamp("created_at")
            .notNull()
            .defaultNow(),

        updatedAt: timestamp("updated_at")
            .notNull()
            .defaultNow(),
    },
    (table) => [
        index("challenge_invites_challenge_idx").on(
            table.challengeId
        ),
        index("challenge_invites_receiver_idx").on(
            table.receiverId
        ),
    ]
);

/* =========================================================
   UPLOADS
========================================================= */

export const uploads = pgTable(
    "uploads",
    {
        id: text("id").primaryKey(),

        userId: text("user_id")
            .notNull()
            .references(() => users.id, {
                onDelete: "cascade",
            }),

        fileUrl: text("file_url").notNull(),

        fileName: text("file_name"),

        mimeType: text("mime_type"),

        fileSize: integer("file_size"),

        createdAt: timestamp("created_at")
            .notNull()
            .defaultNow(),
    },
    (table) => [
        index("uploads_user_idx").on(table.userId),
    ]
);

/* =========================================================
   CHECK-INS
========================================================= */

export const checkIns = pgTable(
    "check_ins",
    {
        id: text("id").primaryKey(),

        challengeId: text("challenge_id")
            .notNull()
            .references(() => challenges.id, {
                onDelete: "cascade",
            }),

        userId: text("user_id")
            .notNull()
            .references(() => users.id, {
                onDelete: "cascade",
            }),

        uploadId: text("upload_id").references(
            () => uploads.id,
            {
                onDelete: "set null",
            }
        ),

        checkInDate: timestamp("check_in_date").notNull(),

        note: text("note"),

        status: checkInStatusEnum("status")
            .notNull()
            .default("PENDING"),

        pointsAwarded: integer("points_awarded")
            .notNull()
            .default(0),

        verifiedBy: text("verified_by").references(
            () => users.id,
            {
                onDelete: "set null",
            }
        ),

        verifiedAt: timestamp("verified_at"),

        createdAt: timestamp("created_at")
            .notNull()
            .defaultNow(),

        updatedAt: timestamp("updated_at")
            .notNull()
            .defaultNow(),
    },
    (table) => [
        uniqueIndex("check_ins_user_challenge_date_unique").on(
            table.userId,
            table.challengeId,
            table.checkInDate
        ),
        index("check_ins_challenge_idx").on(table.challengeId),
        index("check_ins_user_idx").on(table.userId),
        index("check_ins_status_idx").on(table.status),
    ]
);

/* =========================================================
   NOTIFICATIONS
========================================================= */

export const notifications = pgTable(
    "notifications",
    {
        id: text("id").primaryKey(),

        userId: text("user_id")
            .notNull()
            .references(() => users.id, {
                onDelete: "cascade",
            }),

        type: notificationTypeEnum("type").notNull(),

        title: text("title").notNull(),

        message: text("message").notNull(),

        data: text("data"),

        isRead: boolean("is_read")
            .notNull()
            .default(false),

        readAt: timestamp("read_at"),

        createdAt: timestamp("created_at")
            .notNull()
            .defaultNow(),
    },
    (table) => [
        index("notifications_user_idx").on(table.userId),
        index("notifications_unread_idx").on(
            table.userId,
            table.isRead
        ),
    ]
);

/* =========================================================
   NOTIFICATION PREFERENCES
========================================================= */

export const notificationPreferences = pgTable(
    "notification_preferences",
    {
        id: text("id").primaryKey(),

        userId: text("user_id")
            .notNull()
            .references(() => users.id, {
                onDelete: "cascade",
            }),

        friendRequests: boolean("friend_requests")
            .notNull()
            .default(true),

        challengeInvites: boolean("challenge_invites")
            .notNull()
            .default(true),

        checkIns: boolean("check_ins")
            .notNull()
            .default(true),

        streaks: boolean("streaks")
            .notNull()
            .default(true),

        system: boolean("system")
            .notNull()
            .default(true),

        pushEnabled: boolean("push_enabled")
            .notNull()
            .default(true),

        updatedAt: timestamp("updated_at")
            .notNull()
            .defaultNow(),
    },
    (table) => [
        uniqueIndex("notification_preferences_user_unique").on(
            table.userId
        ),
    ]
);

/* =========================================================
   DEVICES
========================================================= */

export const devices = pgTable(
    "devices",
    {
        id: text("id").primaryKey(),

        userId: text("user_id")
            .notNull()
            .references(() => users.id, {
                onDelete: "cascade",
            }),

        pushToken: text("push_token").notNull(),

        platform: devicePlatformEnum("platform").notNull(),

        deviceName: text("device_name"),

        isActive: boolean("is_active")
            .notNull()
            .default(true),

        lastUsedAt: timestamp("last_used_at"),

        createdAt: timestamp("created_at")
            .notNull()
            .defaultNow(),

        updatedAt: timestamp("updated_at")
            .notNull()
            .defaultNow(),
    },
    (table) => [
        uniqueIndex("devices_push_token_unique").on(
            table.pushToken
        ),
        index("devices_user_idx").on(table.userId),
    ]
);

/* =========================================================
   AUDIT LOGS
========================================================= */

export const auditLogs = pgTable(
    "audit_logs",
    {
        id: text("id").primaryKey(),

        adminId: text("admin_id")
            .notNull()
            .references(() => users.id, {
                onDelete: "restrict",
            }),

        action: auditActionEnum("action").notNull(),

        targetUserId: text("target_user_id").references(
            () => users.id,
            {
                onDelete: "set null",
            }
        ),

        targetResourceId: text("target_resource_id"),

        metadata: text("metadata"),

        ipAddress: text("ip_address"),

        userAgent: text("user_agent"),

        createdAt: timestamp("created_at")
            .notNull()
            .defaultNow(),
    },
    (table) => [
        index("audit_logs_admin_idx").on(table.adminId),
        index("audit_logs_target_user_idx").on(
            table.targetUserId
        ),
        index("audit_logs_action_idx").on(table.action),
        index("audit_logs_created_at_idx").on(table.createdAt),
    ]
);