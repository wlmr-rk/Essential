// src/routes/historical-scores.remote.ts
import { query } from '$app/server';
import { db } from '$lib/server/db/client';
import { sleepLogs, habitLogs, habits, moodLogs, workoutLogs } from '$lib/server/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { calculateCompleteDayScore, type HabitWithCompletion } from '$lib/scoring.js';
import { Temporal } from '@js-temporal/polyfill';
import { MANILA_TZ } from '$lib/time/index.js';
import { z } from 'zod';

// Validation schema
const HistoricalScoresSchema = z.object({
	startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid start date format (YYYY-MM-DD)'),
	endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid end date format (YYYY-MM-DD)')
});

export interface HistoricalScore {
	localDate: string;
	totalScore: number;
	breakdown: {
		sleep: number;
		habits: number;
		mood: number;
		workouts: number;
	};
	hasData: boolean;
}

export interface HeatmapData {
	scores: HistoricalScore[];
	dateRange: {
		start: string;
		end: string;
	};
	maxScore: number;
}

/**
 * Query function to get historical daily scores for a date range
 * Properly aggregates component scores for accurate historical data calculation
 */
export const getHistoricalScores = query(HistoricalScoresSchema, async ({ startDate, endDate }): Promise<HeatmapData> => {
	// Since you're the only user, we'll use a fixed user ID
	const userId = 'single-user';
	
	// Validate date range
	const startDateObj = Temporal.PlainDate.from(startDate);
	const endDateObj = Temporal.PlainDate.from(endDate);
	
	if (Temporal.PlainDate.compare(startDateObj, endDateObj) > 0) {
		throw new Error('Start date must be before or equal to end date');
	}
	
	// Fetch all component data for the date range in parallel
	const [sleepData, habitsData, habitLogsData, moodData, workoutData] = await Promise.all([
		// Sleep data for date range
		db.select()
			.from(sleepLogs)
			.where(and(
				eq(sleepLogs.userId, userId),
				gte(sleepLogs.localDate, startDate),
				lte(sleepLogs.localDate, endDate)
			)),
		
		// All user habits (needed for scoring calculation)
		db.select()
			.from(habits)
			.where(eq(habits.userId, userId)),
		
		// Habit logs for date range
		db.select()
			.from(habitLogs)
			.where(and(
				eq(habitLogs.userId, userId),
				gte(habitLogs.localDate, startDate),
				lte(habitLogs.localDate, endDate)
			)),
		
		// Mood data for date range
		db.select()
			.from(moodLogs)
			.where(and(
				eq(moodLogs.userId, userId),
				gte(moodLogs.localDate, startDate),
				lte(moodLogs.localDate, endDate)
			)),
		
		// Workout data for date range
		db.select()
			.from(workoutLogs)
			.where(and(
				eq(workoutLogs.userId, userId),
				gte(workoutLogs.localDate, startDate),
				lte(workoutLogs.localDate, endDate)
			))
	]);
	
	// Create maps for efficient lookup
	const sleepMap = new Map(sleepData.map(s => [s.localDate, s]));
	const moodMap = new Map(moodData.map(m => [m.localDate, m]));
	const workoutMap = new Map(workoutData.map(w => [w.localDate, w]));
	
	// Group habit logs by date
	const habitLogsMap = new Map<string, typeof habitLogsData>();
	habitLogsData.forEach(log => {
		if (!habitLogsMap.has(log.localDate)) {
			habitLogsMap.set(log.localDate, []);
		}
		habitLogsMap.get(log.localDate)!.push(log);
	});
	
	// Generate complete date range and calculate scores
	const scores: HistoricalScore[] = [];
	let currentDate = startDateObj;
	let maxScore = 0;
	
	while (Temporal.PlainDate.compare(currentDate, endDateObj) <= 0) {
		const dateStr = currentDate.toString();
		
		// Get data for this date
		const sleepRecord = sleepMap.get(dateStr);
		const moodRecord = moodMap.get(dateStr);
		const workoutRecord = workoutMap.get(dateStr);
		const habitLogsForDate = habitLogsMap.get(dateStr) || [];
		
		// Process habits data to include completion status
		const habitsWithCompletion: HabitWithCompletion[] = habitsData.map(habit => {
			const habitLog = habitLogsForDate.find(log => log.habitId === habit.id);
			return {
				id: habit.id,
				name: habit.name,
				weight: habit.weight || 1,
				completed: habitLog?.completed || false,
				completedAt: habitLog?.completedAt || null
			};
		});
		
		// Prepare input for score calculation
		const scoreInput = {
			sleepDurationMins: sleepRecord?.durationMins,
			habits: habitsWithCompletion.length > 0 ? habitsWithCompletion : undefined,
			moodRating: moodRecord?.rating,
			runningCompleted: workoutRecord?.runningCompleted ?? undefined,
			calisthenicsCompleted: workoutRecord?.calisthenicsCompleted ?? undefined
		};
		
		// Check if any data exists for this date
		const hasData = !!(
			sleepRecord || 
			moodRecord || 
			workoutRecord || 
			habitLogsForDate.length > 0
		);
		
		// Calculate score if any data exists
		const dayScore = hasData ? calculateCompleteDayScore(scoreInput) : null;
		
		const historicalScore: HistoricalScore = {
			localDate: dateStr,
			totalScore: dayScore?.total || 0,
			breakdown: dayScore?.breakdown || { sleep: 0, habits: 0, mood: 0, workouts: 0 },
			hasData
		};
		
		scores.push(historicalScore);
		
		// Track max score for visualization scaling
		if (dayScore?.total && dayScore.total > maxScore) {
			maxScore = dayScore.total;
		}
		
		// Move to next day
		currentDate = currentDate.add({ days: 1 });
	}
	
	return {
		scores,
		dateRange: { start: startDate, end: endDate },
		maxScore: maxScore || 100 // Default to 100 if no scores exist
	};
});