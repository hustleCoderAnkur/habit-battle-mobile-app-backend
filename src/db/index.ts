import "dotenv/config";

import pg from "../../node_modules/@types/pg/index.js";
import { drizzle } from "drizzle-orm/node-postgres";

import { env } from "../config/env.js";

const { Pool } = pg;

export const pool = new Pool({
    connectionString: env.DATABASE_URL,
});

export const db = drizzle(pool);