// src/routes/historical-scores.remote.ts
import { query } from '$app/server';
import { db } from '$lib/server/db/client';
import { sleepLogs, habitLogs, habits, moodLogs, workoutLogs } from '$lib/server/db/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import { SCORE_WEIGHTS } from '$lib/scoring.ts';
import { Temporal } from '@js-temporal/polyfill';
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
 * This function is optimized to perform all calculations in the database
 */
export const getHistoricalScores = query(
	HistoricalScoresSchema,
	async ({ startDate, endDate }): Promise<HeatmapData> => {
		const userId = 'single-user';

		// Validate date range
		const startDateObj = Temporal.PlainDate.from(startDate);
		const endDateObj = Temporal.PlainDate.from(endDate);
		if (Temporal.PlainDate.compare(startDateObj, endDateObj) > 0) {
			throw new Error('Start date must be before or equal to end date');
		}

		const queryResult = await db.execute(sql`
      WITH date_series AS (
        SELECT generate_series(
          ${startDate}::date,
          ${endDate}::date,
          '1 day'::interval
        )::date AS local_date
      ),
      sleep_scores AS (
        SELECT
          local_date,
          CASE
            WHEN duration_mins / 60.0 >= 7 AND duration_mins / 60.0 <= 9 THEN 100
            WHEN duration_mins / 60.0 >= 6 AND duration_mins / 60.0 < 7 THEN 80
            WHEN duration_mins / 60.0 > 9 AND duration_mins / 60.0 <= 10 THEN 80
            WHEN duration_mins / 60.0 >= 5 AND duration_mins / 60.0 < 6 THEN 60
            WHEN duration_mins / 60.0 > 10 THEN 60
            WHEN duration_mins / 60.0 >= 4 AND duration_mins / 60.0 < 5 THEN 40
            ELSE 20
          END AS score
        FROM ${sleepLogs}
        WHERE user_id = ${userId} AND local_date BETWEEN ${startDate} AND ${endDate}
      ),
      habits_scores AS (
        SELECT
          hl.local_date,
          (SUM(CASE WHEN hl.completed THEN h.weight ELSE 0 END) * 100.0 / SUM(h.weight))::int AS score
        FROM ${habitLogs} hl
        JOIN ${habits} h ON hl.habit_id = h.id
        WHERE hl.user_id = ${userId} AND hl.local_date BETWEEN ${startDate} AND ${endDate}
        GROUP BY hl.local_date
      ),
      mood_scores AS (
        SELECT
          local_date,
          (((rating - 1) / 4.0) * 100)::int AS score
        FROM ${moodLogs}
        WHERE user_id = ${userId} AND local_date BETWEEN ${startDate} AND ${endDate}
      ),
      workout_scores AS (
        SELECT
          local_date,
          CASE WHEN running_completed OR calisthenics_completed THEN 100 ELSE 0 END AS score
        FROM ${workoutLogs}
        WHERE user_id = ${userId} AND local_date BETWEEN ${startDate} AND ${endDate}
      )
      SELECT
        d.local_date::text,
        COALESCE(ss.score, 0) AS sleep_score,
        COALESCE(hs.score, 0) AS habits_score,
        COALESCE(ms.score, 0) AS mood_score,
        COALESCE(ws.score, 0) AS workout_score,
        (ss.score IS NOT NULL OR hs.score IS NOT NULL OR ms.score IS NOT NULL OR ws.score IS NOT NULL) AS has_data
      FROM date_series d
      LEFT JOIN sleep_scores ss ON d.local_date = ss.local_date::date
      LEFT JOIN habits_scores hs ON d.local_date = hs.local_date::date
      LEFT JOIN mood_scores ms ON d.local_date = ms.local_date::date
      LEFT JOIN workout_scores ws ON d.local_date = ws.local_date::date
      ORDER BY d.local_date
    `);

		let maxScore = 0;
		const scores = (queryResult as any[]).map((row) => {
			const breakdown = {
				sleep: row.sleep_score,
				habits: row.habits_score,
				mood: row.mood_score,
				workouts: row.workout_score
			};
			const totalScore = Math.round(
				breakdown.sleep * SCORE_WEIGHTS.sleep +
					breakdown.habits * SCORE_WEIGHTS.habits +
					breakdown.mood * SCORE_WEIGHTS.mood +
					breakdown.workouts * SCORE_WEIGHTS.workouts
			);

			if (totalScore > maxScore) {
				maxScore = totalScore;
			}

			return {
				localDate: row.local_date,
				totalScore,
				breakdown,
				hasData: row.has_data
			};
		});

		return {
			scores,
			dateRange: { start: startDate, end: endDate },
			maxScore: maxScore || 100 // Default to 100 if no scores exist
		};
	}
);