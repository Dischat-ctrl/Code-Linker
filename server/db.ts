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
    const result = await client.query(
      `select column_name
       from information_schema.columns
       where table_schema = 'public'
         and table_name = 'users'
         and column_name = 'password_hash'`
    );
    if (result.rows.length === 0) {
      await client.query(`alter table users add column password_hash varchar`);
    }
  } finally {
    client.release();
  }
}
