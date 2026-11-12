import type {
    NextFunction,
    Request,
    Response,
} from "express";
import type { ZodType } from "zod";

interface ValidationSchemas {
    body?: ZodType;
    params?: ZodType;
    query?: ZodType;
}

export function validate(
    schemas: ValidationSchemas
) {
    return (
        req: Request,
        res: Response,
        next: NextFunction
    ): void => {
        try {
            if (schemas.body) {
                req.body = schemas.body.parse(
                    req.body
                );
            }

            if (schemas.params) {
                const result =
                    schemas.params.parse(
                        req.params
                    );

                Object.assign(req.params, result);
            }

            if (schemas.query) {
                const result =
                    schemas.query.parse(
                        req.query
                    );

                Object.assign(req.query, result);
            }

            next();
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors:
                    error instanceof Error
                        ? error.message
                        : "Invalid request data",
            }) as unknown as void;
        }
    };
}