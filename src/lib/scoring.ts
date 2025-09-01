// src/lib/scoring.ts - Consolidated scoring system
import { calculateSleepDuration, getTodayLocalDate } from '$lib/time/index.js';

// ============================================================================
// INTERFACES
// ============================================================================

export interface HabitWithCompletion {
	id: number;
	name: string;
	weight: number;
	completed: boolean;
	completedAt: Date | null;
}

export interface ComponentScores {
	sleep: number;
	habits: number;
	mood: number;
	workouts: number;
}

export interface DayScore {
	total: number;
	breakdown: ComponentScores;
	tips: string[];
}

export interface DayScoreInput {
	sleepDurationMins?: number;
	habits?: HabitWithCompletion[];
	moodRating?: number;
	runningCompleted?: boolean;
	calisthenicsCompleted?: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const SCORE_WEIGHTS = {
	sleep: 0.3,    // 30%
	habits: 0.3,   // 30%
	mood: 0.2,     // 20%
	workouts: 0.2  // 20%
} as const;

// ============================================================================
// SLEEP SCORING
// ============================================================================

export function calculateSleepScore(durationMins: number): number {
	const hours = durationMins / 60;
	
	// Optimal range: 7-9 hours
	if (hours >= 7 && hours <= 9) return 100;
	if (hours >= 6 && hours < 7) return 80;
	if (hours >= 5 && hours < 6) return 60;
	if (hours >= 4 && hours < 5) return 40;
	if (hours > 9 && hours <= 10) return 80;
	if (hours > 10) return 60;
	
	return 20; // Less than 4 hours
}

export function validateSleepTimes(sleepStart: string, wakeTime: string): void {
	const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
	
	if (!timeRegex.test(sleepStart)) {
		throw new Error('Invalid sleep start time format. Use HH:MM (24-hour format)');
	}
	
	if (!timeRegex.test(wakeTime)) {
		throw new Error('Invalid wake time format. Use HH:MM (24-hour format)');
	}
	
	const testDate = getTodayLocalDate();
	const duration = calculateSleepDuration(sleepStart, wakeTime, testDate);
	
	if (duration < 60) {
		throw new Error('Sleep duration must be at least 1 hour');
	}
	
	if (duration > 960) {
		throw new Error('Sleep duration cannot exceed 16 hours');
	}
}

// ============================================================================
// HABITS SCORING
// ============================================================================

export function calculateHabitsScore(habits: HabitWithCompletion[]): number {
	if (habits.length === 0) return 0;
	
	const totalWeight = habits.reduce((sum, habit) => sum + habit.weight, 0);
	const completedWeight = habits
		.filter(habit => habit.completed)
		.reduce((sum, habit) => sum + habit.weight, 0);
	
	if (totalWeight === 0) return 0;
	
	return Math.round((completedWeight / totalWeight) * 100);
}

export function validateHabitCompletions(habitCompletions: Array<{ habitId: number; completed: boolean }>): void {
	if (!Array.isArray(habitCompletions)) {
		throw new Error('Habit completions must be an array');
	}
	
	for (const completion of habitCompletions) {
		if (typeof completion.habitId !== 'number' || completion.habitId <= 0) {
			throw new Error('Habit ID must be a positive number');
		}
		
		if (typeof completion.completed !== 'boolean') {
			throw new Error('Completed status must be a boolean');
		}
	}
}

// ============================================================================
// MOOD SCORING
// ============================================================================

export function calculateMoodScore(rating: number): number {
	if (rating < 1 || rating > 5) {
		throw new Error('Mood rating must be between 1 and 5');
	}
	
	// Convert 1-5 scale to 0-100 percentage
	return Math.round(((rating - 1) / 4) * 100);
}

export function validateMoodRating(rating: number): void {
	if (!Number.isInteger(rating)) {
		throw new Error('Mood rating must be an integer');
	}
	
	if (rating < 1 || rating > 5) {
		throw new Error('Mood rating must be between 1 and 5');
	}
}

// ============================================================================
// WORKOUT SCORING
// ============================================================================

export function calculateWorkoutScore(runningCompleted: boolean, calisthenicsCompleted: boolean): number {
	// Full points for any completed workout
	if (runningCompleted || calisthenicsCompleted) {
		return 100;
	}
	
	return 0;
}

export function validateWorkoutCompletion(workoutData: { runningCompleted: boolean; calisthenicsCompleted: boolean }): void {
	if (typeof workoutData.runningCompleted !== 'boolean') {
		throw new Error('Running completion status must be a boolean');
	}
	
	if (typeof workoutData.calisthenicsCompleted !== 'boolean') {
		throw new Error('Calisthenics completion status must be a boolean');
	}
}

// ============================================================================
// DAILY SCORING
// ============================================================================

export function calculateComponentScores(input: DayScoreInput): ComponentScores {
	const sleepScore = input.sleepDurationMins !== undefined 
		? calculateSleepScore(input.sleepDurationMins) 
		: 0;
	
	const habitsScore = input.habits && input.habits.length > 0
		? calculateHabitsScore(input.habits)
		: 0;
	
	const moodScore = input.moodRating !== undefined
		? calculateMoodScore(input.moodRating)
		: 0;
	
	const workoutsScore = (input.runningCompleted !== undefined && input.calisthenicsCompleted !== undefined)
		? calculateWorkoutScore(input.runningCompleted, input.calisthenicsCompleted)
		: 0;
	
	return {
		sleep: sleepScore,
		habits: habitsScore,
		mood: moodScore,
		workouts: workoutsScore
	};
}

export function calculateDayScore(components: ComponentScores): number {
	return Math.round(
		components.sleep * SCORE_WEIGHTS.sleep +
		components.habits * SCORE_WEIGHTS.habits +
		components.mood * SCORE_WEIGHTS.mood +
		components.workouts * SCORE_WEIGHTS.workouts
	);
}

export function generateTips(components: ComponentScores): string[] {
	const tips: string[] = [];
	
	// Sleep tips
	if (components.sleep === 0) {
		tips.push("Log your sleep to track your rest quality");
	} else if (components.sleep < 60) {
		tips.push("Try to get 7-9 hours of sleep for optimal recovery");
	} else if (components.sleep === 100) {
		tips.push("Great sleep! You're in the optimal 7-9 hour range");
	}
	
	// Habits tips
	if (components.habits === 0) {
		tips.push("Start completing your daily habits to build consistency");
	} else if (components.habits < 50) {
		tips.push("Focus on completing more of your important habits");
	} else if (components.habits >= 80) {
		tips.push("Excellent habit consistency! Keep up the great work");
	}
	
	// Mood tips
	if (components.mood === 0) {
		tips.push("Track your mood to understand your emotional patterns");
	} else if (components.mood < 50) {
		tips.push("Consider activities that boost your mood and well-being");
	} else if (components.mood >= 75) {
		tips.push("Your mood is looking great today!");
	}
	
	// Workouts tips
	if (components.workouts === 0) {
		tips.push("Add some physical activity to boost your energy");
	} else if (components.workouts === 100) {
		tips.push("Awesome! You completed your workout today");
	}
	
	return tips;
}

export function calculateCompleteDayScore(input: DayScoreInput): DayScore {
	const breakdown = calculateComponentScores(input);
	const total = calculateDayScore(breakdown);
	const tips = generateTips(breakdown);
	
	return {
		total,
		breakdown,
		tips
	};
}