import { db } from './client';
import type { PgTable } from 'drizzle-orm/pg-core';
import type { SQL } from 'drizzle-orm';

export async function upsert<T extends PgTable>(
  table: T,
  data: any,
  conflictTarget: SQL | SQL[]
) {
  const result = await db
    .insert(table)
    .values(data)
    .onConflictDoUpdate({
      target: conflictTarget,
      set: data
    })
    .returning();

  return result[0];
}
