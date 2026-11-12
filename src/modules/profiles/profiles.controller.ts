import type {
    NextFunction,
    Request,
    Response,
} from "express";

import {
    getMyProfile,
    getProfileByUserId,
    updateMyProfile,
} from "./profiles.service.js";

import type {
    UpdateProfileInput,
} from "./profiles.validation.js";

/* =========================================================
   GET MY PROFILE
========================================================= */

export async function getMyProfileController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user!.id;

        const profile =
            await getMyProfile(userId);

        return res.status(200).json({
            success: true,
            data: profile,
        });
    } catch (error) {
        next(error);
    }
}

/* =========================================================
   GET USER PROFILE
========================================================= */

export async function getProfileController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId =
            req.params.userId;

        if (
            typeof userId !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID",
            });
        }

        const profile =
            await getProfileByUserId(
                userId
            );

        return res.status(200).json({
            success: true,
            data: profile,
        });
    } catch (error) {
        next(error);
    }
}

/* =========================================================
   UPDATE MY PROFILE
========================================================= */

export async function updateMyProfileController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user!.id;

        const profile =
            await updateMyProfile(
                userId,
                req.body as UpdateProfileInput
            );

        return res.status(200).json({
            success: true,
            message:
                "Profile updated successfully",
            data: profile,
        });
    } catch (error) {
        next(error);
    }
}