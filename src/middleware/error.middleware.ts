import type {
    NextFunction,
    Request,
    Response,
} from "express";

/* =========================================================
   GLOBAL ERROR MIDDLEWARE
========================================================= */

export function errorMiddleware(
    error: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
) {
    console.error(" Error:", error);

    /* ---------------------------------------------
       Error object
    --------------------------------------------- */

    if (error instanceof Error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }

    /* ---------------------------------------------
       Unknown error
    --------------------------------------------- */

    return res.status(500).json({
        success: false,
        message: "Internal server error",
    });
}