// src/routes/day-score.remote.ts
import { query } from '$app/server';
import { db } from '$lib/server/db/client';
import { sleepLogs, habitLogs, habits, moodLogs, workoutLogs } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { calculateCompleteDayScore, type HabitWithCompletion } from '$lib/scoring.js';
import { z } from 'zod';

// Validation schema
const LocalDateSchema = z.object({
	localDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)')
});

/**
 * Query function to get daily score with component breakdown and tips
 */
export const getDayScore = query(LocalDateSchema, async ({ localDate }) => {
	// Since you're the only user, we'll use a fixed user ID
	const userId = 'single-user';
	
	// Fetch all data for the day in parallel
	const [sleepData, habitsData, habitLogsData, moodData, workoutData] = await Promise.all([
		// Sleep data
		db.select()
			.from(sleepLogs)
			.where(and(eq(sleepLogs.userId, userId), eq(sleepLogs.localDate, localDate)))
			.limit(1),
		
		// Habits data
		db.select()
			.from(habits)
			.where(eq(habits.userId, userId)),
		
		// Habit logs data
		db.select()
			.from(habitLogs)
			.where(and(eq(habitLogs.userId, userId), eq(habitLogs.localDate, localDate))),
		
		// Mood data
		db.select()
			.from(moodLogs)
			.where(and(eq(moodLogs.userId, userId), eq(moodLogs.localDate, localDate)))
			.limit(1),
		
		// Workout data
		db.select()
			.from(workoutLogs)
			.where(and(eq(workoutLogs.userId, userId), eq(workoutLogs.localDate, localDate)))
			.limit(1)
	]);
	
	// Process habits data to include completion status
	const habitsWithCompletion: HabitWithCompletion[] = habitsData.map(habit => {
		const habitLog = habitLogsData.find(log => log.habitId === habit.id);
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
		sleepDurationMins: sleepData[0]?.durationMins,
		habits: habitsWithCompletion.length > 0 ? habitsWithCompletion : undefined,
		moodRating: moodData[0]?.rating,
		runningCompleted: workoutData[0]?.runningCompleted ?? undefined,
		calisthenicsCompleted: workoutData[0]?.calisthenicsCompleted ?? undefined
	};
	
	return calculateCompleteDayScore(scoreInput);
});