// src/routes/sleep.remote.test.ts
import { describe, it, expect } from 'vitest';
import { calculateSleepScore, validateSleepTimes } from '$lib/sleep/scoring';
import { calculateSleepDuration } from '$lib/time/temporal';

describe('Sleep Logic Functions', () => {
	describe('calculateSleepScore', () => {
		it('should return 100 for optimal sleep duration (7-9 hours)', () => {
			expect(calculateSleepScore(420)).toBe(100); // 7 hours
			expect(calculateSleepScore(480)).toBe(100); // 8 hours
			expect(calculateSleepScore(540)).toBe(100); // 9 hours
		});

		it('should return 80 for good sleep duration (6-7 hours or 9-10 hours)', () => {
			expect(calculateSleepScore(360)).toBe(80); // 6 hours
			expect(calculateSleepScore(390)).toBe(80); // 6.5 hours
			expect(calculateSleepScore(570)).toBe(80); // 9.5 hours
			expect(calculateSleepScore(600)).toBe(80); // 10 hours
		});

		it('should return 60 for moderate sleep duration (5-6 hours or 10+ hours)', () => {
			expect(calculateSleepScore(300)).toBe(60); // 5 hours
			expect(calculateSleepScore(330)).toBe(60); // 5.5 hours
			expect(calculateSleepScore(660)).toBe(60); // 11 hours
			expect(calculateSleepScore(720)).toBe(60); // 12 hours
		});

		it('should return 40 for poor sleep duration (4-5 hours)', () => {
			expect(calculateSleepScore(240)).toBe(40); // 4 hours
			expect(calculateSleepScore(270)).toBe(40); // 4.5 hours
		});

		it('should return 20 for very poor sleep duration (less than 4 hours)', () => {
			expect(calculateSleepScore(180)).toBe(20); // 3 hours
			expect(calculateSleepScore(120)).toBe(20); // 2 hours
			expect(calculateSleepScore(60)).toBe(20);  // 1 hour
		});

		it('should handle edge cases correctly', () => {
			expect(calculateSleepScore(419)).toBe(80);  // Just under 7 hours
			expect(calculateSleepScore(421)).toBe(100); // Just over 7 hours
			expect(calculateSleepScore(539)).toBe(100); // Just under 9 hours
			expect(calculateSleepScore(541)).toBe(80);  // Just over 9 hours
		});
	});

	describe('validateSleepTimes', () => {
		it('should accept valid time formats', () => {
			expect(() => validateSleepTimes('23:00', '07:00')).not.toThrow();
			expect(() => validateSleepTimes('22:30', '06:30')).not.toThrow();
			expect(() => validateSleepTimes('00:00', '08:00')).not.toThrow();
			expect(() => validateSleepTimes('01:15', '09:45')).not.toThrow();
		});

		it('should reject invalid time formats', () => {
			expect(() => validateSleepTimes('25:00', '07:00')).toThrow('Invalid sleep start time format');
			expect(() => validateSleepTimes('23:00', '25:00')).toThrow('Invalid wake time format');
			expect(() => validateSleepTimes('23:60', '07:00')).toThrow('Invalid sleep start time format');
			expect(() => validateSleepTimes('23:00', '07:60')).toThrow('Invalid wake time format');
			expect(() => validateSleepTimes('abc', '07:00')).toThrow('Invalid sleep start time format');
			expect(() => validateSleepTimes('23:00', 'xyz')).toThrow('Invalid wake time format');
		});

		it('should reject sleep durations that are too short', () => {
			expect(() => validateSleepTimes('07:00', '07:30')).toThrow('Sleep duration must be at least 1 hour');
			expect(() => validateSleepTimes('10:00', '10:45')).toThrow('Sleep duration must be at least 1 hour');
		});

		it('should accept reasonable sleep durations', () => {
			expect(() => validateSleepTimes('23:00', '07:00')).not.toThrow(); // 8 hours
			expect(() => validateSleepTimes('22:00', '06:00')).not.toThrow(); // 8 hours
			expect(() => validateSleepTimes('01:00', '07:00')).not.toThrow(); // 6 hours
		});

		it('should handle sleep that crosses midnight', () => {
			expect(() => validateSleepTimes('23:30', '07:30')).not.toThrow(); // 8 hours crossing midnight
			expect(() => validateSleepTimes('00:30', '08:30')).not.toThrow(); // 8 hours same day
		});

		it('should reject extremely long sleep durations', () => {
			// This test might be tricky because crossing midnight logic affects it
			// Let's test a case that would be clearly too long
			expect(() => validateSleepTimes('08:00', '07:00')).toThrow('Sleep duration cannot exceed 16 hours');
		});
	});

	describe('Integration tests for sleep scoring', () => {
		it('should calculate scores correctly for common sleep patterns', () => {
			const testCases = [
				{ sleepStart: '23:00', wakeTime: '07:00', expectedScore: 100 }, // 8 hours - optimal
				{ sleepStart: '22:00', wakeTime: '06:00', expectedScore: 100 }, // 8 hours - optimal
				{ sleepStart: '00:00', wakeTime: '07:00', expectedScore: 100 }, // 7 hours - optimal
				{ sleepStart: '01:00', wakeTime: '07:00', expectedScore: 80 },  // 6 hours - good
				{ sleepStart: '02:00', wakeTime: '07:00', expectedScore: 60 },  // 5 hours - moderate
				{ sleepStart: '03:00', wakeTime: '07:00', expectedScore: 40 },  // 4 hours - poor
				{ sleepStart: '04:00', wakeTime: '07:00', expectedScore: 20 },  // 3 hours - very poor
			];

			testCases.forEach(({ sleepStart, wakeTime, expectedScore }) => {
				// First validate the times are acceptable
				expect(() => validateSleepTimes(sleepStart, wakeTime)).not.toThrow();
				
				// Calculate duration using the actual function
				const testDate = '2024-01-15'; // Use a fixed test date
				const duration = calculateSleepDuration(sleepStart, wakeTime, testDate);
				
				const score = calculateSleepScore(duration);
				expect(score).toBe(expectedScore);
			});
		});
	});
});