import express from "express";
import cors from "cors";
import helmet from "helmet";

import { env } from "./config/env.js";
import { pool } from "./db/index.js";

/* =========================================================
   ROUTES
========================================================= */

import authRoutes from "./modules/auth/auth.route.js";
import usersRoutes from "./modules/users/users.routes.js";
import profilesRoutes from "./modules/profiles/profiles.route.js";
import sessionsRoutes from "./modules/sessions/sessions.route.js";

import friendshipsRoutes from "./modules/friendships/friendships.routes.js";

import challengesRoutes from "./modules/challenges/challenges.routes.js";
import challengeInvitesRoutes from "./modules/challenge-invites/challenge-invites.route.js";

import checkInsRoutes, {
    challengeCheckInRouter,
} from "./modules/check-ins/check-ins.route.js";

import notificationsRoutes from "./modules/notifications/notifications.route.js";

import notificationPreferencesRoutes from "./modules/notification-preferences/notification-preferences.route.js";

import devicesRoutes from "./modules/devices/devices.route.js";
import uploadsRoutes from "./modules/uploads/uploads.route.js";
import adminRoutes from "./modules/admin/admin.route.js";
import auditLogsRoutes from "./modules/audit-logs/audit-logs.route.js";

/* =========================================================
   MIDDLEWARE
========================================================= */

import { errorMiddleware } from "./middleware/error.middleware.js";

const app = express();

/* =========================================================
   SECURITY
========================================================= */

app.use(helmet());

app.use(
    cors({
        origin: true,
        credentials: true,
    })
);

/* =========================================================
   BODY PARSING
========================================================= */

app.use(express.json({ limit: "10mb" }));

app.use(
    express.urlencoded({
        extended: true,
        limit: "10mb",
    })
);

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get("/health", (_req, res) => {
    res.status(200).json({
        success: true,
        message: "Habit Battle API is running",
    });
});

/* =========================================================
   DATABASE HEALTH CHECK
========================================================= */

app.get("/health/db", async (_req, res) => {
    try {
        const result = await pool.query(
            "SELECT NOW()"
        );

        res.status(200).json({
            success: true,
            message: "Database connected",
            time: result.rows[0].now,
        });
    } catch (error) {
        console.error(
            "Database connection failed:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Database connection failed",
        });
    }
});

/* =========================================================
   API ROUTES
========================================================= */

/* -------------------------
   AUTH
------------------------- */

app.use(
    "/api/auth",
    authRoutes
);

/* -------------------------
   USERS
------------------------- */

app.use(
    "/api/users",
    usersRoutes
);

/* -------------------------
   PROFILES
------------------------- */

app.use(
    "/api/profiles",
    profilesRoutes
);

/* -------------------------
   SESSIONS
------------------------- */

app.use(
    "/api/sessions",
    sessionsRoutes
);

/* -------------------------
   FRIENDSHIPS
------------------------- */

app.use(
    "/api/friendships",
    friendshipsRoutes
);

/* -------------------------
   CHALLENGES
------------------------- */

app.use(
    "/api/challenges",
    challengesRoutes
);

app.use(
    "/api/challenges",
    challengeCheckInRouter
);

/* -------------------------
   CHALLENGE INVITES
------------------------- */

app.use(
    "/api/challenge-invites",
    challengeInvitesRoutes
);

/* -------------------------
   CHECK-INS
------------------------- */

app.use(
    "/api/check-ins",
    checkInsRoutes
);

/* -------------------------
   NOTIFICATIONS
------------------------- */

app.use(
    "/api/notifications",
    notificationsRoutes
);

/* -------------------------
   NOTIFICATION PREFERENCES
------------------------- */

app.use(
    "/api/notification-preferences",
    notificationPreferencesRoutes
);

/* -------------------------
   DEVICES
------------------------- */

app.use(
    "/api/devices",
    devicesRoutes
);

/* -------------------------
   UPLOADS
------------------------- */

app.use(
    "/api/uploads",
    uploadsRoutes
);

/* -------------------------
   AUDIT LOGS
------------------------- */

app.use(
    "/api/audit-logs",
    auditLogsRoutes
);

app.use(
    "/api/admin",
    adminRoutes
);

/* =========================================================
   404 HANDLER
========================================================= */

app.use(
    (
        _req,
        res
    ) => {
        res.status(404).json({
            success: false,
            message: "Route not found",
        });
    }
);

/* =========================================================
   GLOBAL ERROR HANDLER
========================================================= */

app.use(errorMiddleware);

/* =========================================================
   START SERVER
========================================================= */

const server = app.listen(
    env.PORT,
    () => {
        console.log(
            `🚀 Server running on http://localhost:${env.PORT}`
        );
    }
);

/* =========================================================
   GRACEFUL SHUTDOWN
========================================================= */

async function shutdown(
    signal: string
) {
    console.log(
        `\n${signal} received. Shutting down...`
    );

    server.close(async () => {
        try {
            await pool.end();

            console.log(
                "Database connection closed."
            );

            process.exit(0);
        } catch (error) {
            console.error(
                "Error during shutdown:",
                error
            );

            process.exit(1);
        }
    });
}

process.on(
    "SIGTERM",
    () => {
        void shutdown("SIGTERM");
    }
);

process.on(
    "SIGINT",
    () => {
        void shutdown("SIGINT");
    }
);

export default server;