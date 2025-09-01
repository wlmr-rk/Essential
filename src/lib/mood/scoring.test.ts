// src/lib/mood/scoring.test.ts
import { describe, it, expect } from 'vitest';
import { calculateMoodScore, validateMoodRating } from './scoring';

describe('Mood Scoring', () => {
	describe('calculateMoodScore', () => {
		it('should map rating 1 to score 0', () => {
			expect(calculateMoodScore(1)).toBe(0);
		});

		it('should map rating 2 to score 25', () => {
			expect(calculateMoodScore(2)).toBe(25);
		});

		it('should map rating 3 to score 50', () => {
			expect(calculateMoodScore(3)).toBe(50);
		});

		it('should map rating 4 to score 75', () => {
			expect(calculateMoodScore(4)).toBe(75);
		});

		it('should map rating 5 to score 100', () => {
			expect(calculateMoodScore(5)).toBe(100);
		});

		it('should throw error for rating below 1', () => {
			expect(() => calculateMoodScore(0)).toThrow('Mood rating must be between 1 and 5');
			expect(() => calculateMoodScore(-1)).toThrow('Mood rating must be between 1 and 5');
		});

		it('should throw error for rating above 5', () => {
			expect(() => calculateMoodScore(6)).toThrow('Mood rating must be between 1 and 5');
			expect(() => calculateMoodScore(10)).toThrow('Mood rating must be between 1 and 5');
		});

		it('should handle edge cases correctly', () => {
			// Test exact boundaries
			expect(calculateMoodScore(1)).toBe(0);
			expect(calculateMoodScore(5)).toBe(100);
		});
	});

	describe('validateMoodRating', () => {
		it('should accept valid ratings 1-5', () => {
			expect(() => validateMoodRating(1)).not.toThrow();
			expect(() => validateMoodRating(2)).not.toThrow();
			expect(() => validateMoodRating(3)).not.toThrow();
			expect(() => validateMoodRating(4)).not.toThrow();
			expect(() => validateMoodRating(5)).not.toThrow();
		});

		it('should reject non-integer ratings', () => {
			expect(() => validateMoodRating(1.5)).toThrow('Mood rating must be an integer');
			expect(() => validateMoodRating(3.7)).toThrow('Mood rating must be an integer');
			expect(() => validateMoodRating(4.1)).toThrow('Mood rating must be an integer');
		});

		it('should reject ratings below 1', () => {
			expect(() => validateMoodRating(0)).toThrow('Mood rating must be between 1 and 5');
			expect(() => validateMoodRating(-1)).toThrow('Mood rating must be between 1 and 5');
			expect(() => validateMoodRating(-10)).toThrow('Mood rating must be between 1 and 5');
		});

		it('should reject ratings above 5', () => {
			expect(() => validateMoodRating(6)).toThrow('Mood rating must be between 1 and 5');
			expect(() => validateMoodRating(10)).toThrow('Mood rating must be between 1 and 5');
			expect(() => validateMoodRating(100)).toThrow('Mood rating must be between 1 and 5');
		});

		it('should handle edge cases', () => {
			// Test exact boundaries
			expect(() => validateMoodRating(1)).not.toThrow();
			expect(() => validateMoodRating(5)).not.toThrow();
		});
	});
});