import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

export const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : null;

export const db = pool ? drizzle(pool, { schema }) : null;

export async function ensureAuthSchema(): Promise<void> {
  if (!pool) {
    console.warn("DATABASE_URL not set; using in-memory storage for auth.");
    return;
  }
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

export async function ensureAuthSchema(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(
      `alter table if exists users add column if not exists password_hash varchar`
    );
  } catch (error) {
    console.warn(
      "Skipping password_hash migration; database may be read-only or incompatible:",
      error,
    );
  } finally {
    client.release();
  }
}
