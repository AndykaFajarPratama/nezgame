import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../config/env.js";
import * as schema from "./schema.js";

// Connection pool
const client = postgres(env.DATABASE_URL, {
  max: env.isProduction ? 10 : 3,
  idle_timeout: 20,
  connect_timeout: 10,
});

// Drizzle instance with schema
export const db = drizzle(client, { schema });

export type Database = typeof db;
