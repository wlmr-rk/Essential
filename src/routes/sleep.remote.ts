// src/routes/sleep.remote.ts
import { command, query } from '$app/server';
import { db } from '$lib/server/db/client';
import { sleepLogs } from '$lib/server/db/schema';

import { calculateSleepDuration, localTimeToInstant } from '$lib/time/temporal';
import { calculateSleepScore, validateSleepTimes } from '$lib/scoring.js';
import { fail } from '@sveltejs/kit';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

// Validation schemas
const LocalDateSchema = z.object({
	localDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)')
});

const SleepDataSchema = z.object({
	localDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
	sleepStartLocal: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)'),
	wakeTimeLocal: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)')
});

// Types
export interface SleepData {
	id: number;
	localDate: string;
	sleepStartLocal: string;
	wakeTimeLocal: string;
	durationMins: number;
	score: number;
	createdAt: Date | null;
	updatedAt: Date | null;
}



/**
 * Query function to retrieve sleep data for a specific date
 */
export const getTodaySleep = query(LocalDateSchema, async ({ localDate }) => {
	// Since you're the only user, we'll use a fixed user ID
	const userId = 'single-user';
	
	const sleepRecord = await db
		.select()
		.from(sleepLogs)
		.where(and(
			eq(sleepLogs.userId, userId),
			eq(sleepLogs.localDate, localDate)
		))
		.limit(1);
	
	if (sleepRecord.length === 0) {
		return null;
	}
	
	const record = sleepRecord[0];
	const score = calculateSleepScore(record.durationMins);
	
	return {
		id: record.id,
		localDate: record.localDate,
		sleepStartLocal: record.sleepStartLocal,
		wakeTimeLocal: record.wakeTimeLocal,
		durationMins: record.durationMins,
		score,
		createdAt: record.createdAt,
		updatedAt: record.updatedAt
	} as SleepData;
});

/**
 * Command function to create or update sleep records
 */
export const upsertSleep = command(SleepDataSchema, async ({ localDate, sleepStartLocal, wakeTimeLocal }) => {
	// Since you're the only user, we'll use a fixed user ID
	const userId = 'single-user';
	
	// Validate sleep times - convert errors to fail() responses
	try {
		validateSleepTimes(sleepStartLocal, wakeTimeLocal);
	} catch (error) {
		throw fail(400, { message: error instanceof Error ? error.message : 'Invalid sleep times' });
	}
	
	// Calculate duration and timestamps
	const durationMins = calculateSleepDuration(sleepStartLocal, wakeTimeLocal, localDate);
	const sleepStartTs = localTimeToInstant(localDate, sleepStartLocal);
	
	// Calculate wake timestamp (handle crossing midnight)
	let wakeTs = localTimeToInstant(localDate, wakeTimeLocal);
	if (wakeTs.epochMilliseconds <= sleepStartTs.epochMilliseconds) {
		const nextDay = new Date(localDate);
		nextDay.setDate(nextDay.getDate() + 1);
		const nextDayStr = nextDay.toISOString().split('T')[0];
		wakeTs = localTimeToInstant(nextDayStr, wakeTimeLocal);
	}
	
	const sleepData = {
		userId,
		localDate,
		sleepStartLocal,
		wakeTimeLocal,
		sleepStartTs: new Date(sleepStartTs.epochMilliseconds),
		wakeTs: new Date(wakeTs.epochMilliseconds),
		durationMins,
		updatedAt: new Date()
	};
	
	// Try to update existing record first
	const updated = await db
		.update(sleepLogs)
		.set(sleepData)
		.where(and(
			eq(sleepLogs.userId, userId),
			eq(sleepLogs.localDate, localDate)
		))
		.returning();
	
	let record;
	if (updated.length === 0) {
		// No existing record, create new one
		const inserted = await db
			.insert(sleepLogs)
			.values({
				...sleepData,
				createdAt: new Date()
			})
			.returning();
		record = inserted[0];
	} else {
		record = updated[0];
	}
	
	const score = calculateSleepScore(record.durationMins);
	
	return {
		id: record.id,
		localDate: record.localDate,
		sleepStartLocal: record.sleepStartLocal,
		wakeTimeLocal: record.wakeTimeLocal,
		durationMins: record.durationMins,
		score,
		createdAt: record.createdAt,
		updatedAt: record.updatedAt
	} as SleepData;
});