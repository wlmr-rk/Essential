// src/routes/mood.remote.ts
import { command, query } from '$app/server';
import { db } from '$lib/server/db/client';
import { moodLogs } from '$lib/server/db/schema';
import { calculateMoodScore, validateMoodRating } from '$lib/scoring.js';
import { fail } from '@sveltejs/kit';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

// Validation schemas
const LocalDateSchema = z.object({
	localDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)')
});

const MoodSchema = z.object({
	localDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
	rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5')
});

// Types
export interface MoodResponse {
	rating: number | null;
	score: number;
	hasData: boolean;
}

/**
 * Query function to retrieve mood rating for a specific date
 */
export const getTodayMood = query(LocalDateSchema, async ({ localDate }) => {
	// Since you're the only user, we'll use a fixed user ID
	const userId = 'single-user';
	
	// Get mood log for the specific date
	const moodLog = await db
		.select()
		.from(moodLogs)
		.where(and(
			eq(moodLogs.userId, userId),
			eq(moodLogs.localDate, localDate)
		))
		.limit(1);
	
	if (moodLog.length === 0) {
		return {
			rating: null,
			score: 0,
			hasData: false
		} as MoodResponse;
	}
	
	const rating = moodLog[0].rating;
	const score = calculateMoodScore(rating);
	
	return {
		rating,
		score,
		hasData: true
	} as MoodResponse;
});

import { upsert } from '$lib/server/db/upsert';

/**
 * Command function to create or update mood record with 1-5 scale validation
 */
export const upsertMood = command(MoodSchema, async ({ localDate, rating }) => {
	// Since you're the only user, we'll use a fixed user ID
	const userId = 'single-user';

	// Validate mood rating
	try {
		validateMoodRating(rating);
	} catch (error) {
		throw fail(400, { message: error instanceof Error ? error.message : 'Invalid mood rating' });
	}

	const now = new Date();
	const moodData = {
		userId,
		localDate,
		rating,
		createdAt: now,
		updatedAt: now
	};

	const record = await upsert(moodLogs, moodData, [moodLogs.userId, moodLogs.localDate]);

	const score = calculateMoodScore(record.rating);

	return {
		rating: record.rating,
		score,
		hasData: true
	} as MoodResponse;
});