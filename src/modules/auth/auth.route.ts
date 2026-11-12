import { Router } from "express";

import {
    loginController,
    logoutController,
    refreshTokenController,
    registerController,
} from "./auth.controller.js";

const router = Router();

/*
 * POST /api/auth/register
 */
router.post("/register", registerController);

/*
 * POST /api/auth/login
 */
router.post("/login", loginController);

/*
 * POST /api/auth/refresh
 */
router.post("/refresh", refreshTokenController);

/*
 * POST /api/auth/logout
 */
router.post("/logout", logoutController);

export default router;