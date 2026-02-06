import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

export async function ensureAuthSchema(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(`alter table users add column if not exists password_hash varchar`);
  } catch (error) {
    console.warn(
      "Skipping password_hash migration; database may be read-only or incompatible:",
      error,
    );
  } finally {
    client.release();
  }
}
