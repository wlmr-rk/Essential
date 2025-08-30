// src/lib/server/db/client.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '$env/dynamic/private';

const connectionString = env.SUPABASE_DATABASE_URL ?? env.DATABASE_URL;

if (!connectionString) {
	throw new Error('Missing SUPABASE_DATABASE_URL (pooled) or DATABASE_URL');
}

export const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client);
