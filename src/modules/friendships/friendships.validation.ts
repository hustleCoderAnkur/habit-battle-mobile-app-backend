import { z } from "zod";

/* =========================================================
   SEND FRIEND REQUEST
========================================================= */

export const sendFriendRequestSchema = z.object({
    userId: z
        .string()
        .uuid("Invalid user ID"),
});

/* =========================================================
   FRIENDSHIP ID PARAM
========================================================= */

export const friendshipIdParamSchema = z.object({
    id: z
        .string()
        .uuid("Invalid friendship ID"),
});

/* =========================================================
   USER ID PARAM
========================================================= */

export const friendUserIdParamSchema = z.object({
    userId: z
        .string()
        .uuid("Invalid user ID"),
});

/* =========================================================
   TYPES
========================================================= */

export type SendFriendRequestInput = z.infer<
    typeof sendFriendRequestSchema
>;