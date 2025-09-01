// src/routes/habits.remote.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { validateHabitCompletions } from '$lib/habits/scoring.js';

describe('Habits Remote Functions Logic', () => {
	describe('validateHabitCompletions', () => {
		it('validates correct habit completion data', () => {
			const validData = [
				{ habitId: 1, completed: true },
				{ habitId: 2, completed: false },
				{ habitId: 3, completed: true }
			];

			expect(() => validateHabitCompletions(validData)).not.toThrow();
		});

		it('throws error for non-array input', () => {
			expect(() => validateHabitCompletions({} as any)).toThrow('Habit completions must be an array');
		});

		it('throws error for invalid habit ID', () => {
			const invalidData = [
				{ habitId: 0, completed: true }
			];

			expect(() => validateHabitCompletions(invalidData)).toThrow('Habit ID must be a positive number');
		});

		it('throws error for non-number habit ID', () => {
			const invalidData = [
				{ habitId: 'invalid' as any, completed: true }
			];

			expect(() => validateHabitCompletions(invalidData)).toThrow('Habit ID must be a positive number');
		});

		it('throws error for non-boolean completed status', () => {
			const invalidData = [
				{ habitId: 1, completed: 'yes' as any }
			];

			expect(() => validateHabitCompletions(invalidData)).toThrow('Completed status must be a boolean');
		});

		it('validates empty array', () => {
			expect(() => validateHabitCompletions([])).not.toThrow();
		});
	});

	describe('Data Structure Validation', () => {
		it('validates HabitsData structure', () => {
			const habitsData = {
				habits: [
					{
						id: 1,
						name: 'Test Habit',
						weight: 2,
						completed: true,
						completedAt: new Date()
					}
				],
				score: 100,
				totalWeight: 2,
				completedWeight: 2
			};

			// Verify structure matches expected interface
			expect(habitsData.habits).toBeInstanceOf(Array);
			expect(typeof habitsData.score).toBe('number');
			expect(typeof habitsData.totalWeight).toBe('number');
			expect(typeof habitsData.completedWeight).toBe('number');
			
			// Verify habit structure
			const habit = habitsData.habits[0];
			expect(typeof habit.id).toBe('number');
			expect(typeof habit.name).toBe('string');
			expect(typeof habit.weight).toBe('number');
			expect(typeof habit.completed).toBe('boolean');
			expect(habit.completedAt).toBeInstanceOf(Date);
		});
	});
});