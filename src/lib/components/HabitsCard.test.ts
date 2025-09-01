// src/lib/components/HabitsCard.test.ts
import { describe, it, expect } from 'vitest';
import { calculateHabitsScore } from '$lib/habits/scoring.js';
import type { HabitWithCompletion } from '$lib/habits/scoring.js';

describe('HabitsCard Logic', () => {
	it('calculates weighted habit scores correctly', () => {
		const habits: HabitWithCompletion[] = [
			{
				id: 1,
				name: 'Morning Exercise',
				weight: 3,
				completed: false,
				completedAt: null
			},
			{
				id: 2,
				name: 'Read for 30 minutes',
				weight: 2,
				completed: true,
				completedAt: new Date('2025-01-09T10:30:00Z')
			},
			{
				id: 3,
				name: 'Meditate',
				weight: 1,
				completed: false,
				completedAt: null
			}
		];

		const score = calculateHabitsScore(habits);
		
		// Expected: 2 completed weight out of 6 total weight = 33%
		expect(score).toBe(33);
	});

	it('returns 0 score when no habits are completed', () => {
		const habits: HabitWithCompletion[] = [
			{
				id: 1,
				name: 'Morning Exercise',
				weight: 3,
				completed: false,
				completedAt: null
			},
			{
				id: 2,
				name: 'Read for 30 minutes',
				weight: 2,
				completed: false,
				completedAt: null
			}
		];

		const score = calculateHabitsScore(habits);
		expect(score).toBe(0);
	});

	it('returns 100 score when all habits are completed', () => {
		const habits: HabitWithCompletion[] = [
			{
				id: 1,
				name: 'Morning Exercise',
				weight: 3,
				completed: true,
				completedAt: new Date()
			},
			{
				id: 2,
				name: 'Read for 30 minutes',
				weight: 2,
				completed: true,
				completedAt: new Date()
			}
		];

		const score = calculateHabitsScore(habits);
		expect(score).toBe(100);
	});

	it('returns 0 score for empty habits array', () => {
		const habits: HabitWithCompletion[] = [];
		const score = calculateHabitsScore(habits);
		expect(score).toBe(0);
	});

	it('handles single habit correctly', () => {
		const habits: HabitWithCompletion[] = [
			{
				id: 1,
				name: 'Morning Exercise',
				weight: 5,
				completed: true,
				completedAt: new Date()
			}
		];

		const score = calculateHabitsScore(habits);
		expect(score).toBe(100);
	});

	it('calculates partial completion with different weights', () => {
		const habits: HabitWithCompletion[] = [
			{
				id: 1,
				name: 'High Priority',
				weight: 5,
				completed: true,
				completedAt: new Date()
			},
			{
				id: 2,
				name: 'Medium Priority',
				weight: 3,
				completed: false,
				completedAt: null
			},
			{
				id: 3,
				name: 'Low Priority',
				weight: 2,
				completed: true,
				completedAt: new Date()
			}
		];

		const score = calculateHabitsScore(habits);
		
		// Expected: (5 + 2) completed weight out of (5 + 3 + 2) total weight = 7/10 = 70%
		expect(score).toBe(70);
	});
});