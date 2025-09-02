// src/routes/score-trends.remote.ts
import { query } from '$app/server';
import { getHistoricalScores } from './historical-scores.remote.js';
import { getTodayLocalDate } from '$lib/time/index.js';
import { Temporal } from '@js-temporal/polyfill';
import { z } from 'zod';

// Validation schema
const ScoreTrendsSchema = z.object({
	days: z.number().min(7).max(365).default(30),
	component: z.enum(['total', 'sleep', 'habits', 'mood', 'workouts']).default('total')
});

export interface TrendDataPoint {
	date: string;
	value: number;
	x: number;
	y: number;
}

export interface TrendData {
	dataPoints: TrendDataPoint[];
	points: string; // SVG polyline points
	average: number;
	trend: number; // Positive = improving, negative = declining, 0 = stable
	minValue: number;
	maxValue: number;
}

/**
 * Query function to get score trends over a specified period
 * Generates SVG-compatible data points for trend visualization
 */
export const getScoreTrends = query(ScoreTrendsSchema, async ({ days, component }): Promise<TrendData> => {
	const today = getTodayLocalDate();
	const startDate = Temporal.PlainDate.from(today).subtract({ days: days - 1 }).toString();
	
	// Get historical scores for the period
	const historicalData = await getHistoricalScores({ startDate, endDate: today });
	
	// Filter to only include days with data and extract the relevant component
	const dataWithScores = historicalData.scores
		.filter(score => score.hasData)
		.map(score => ({
			date: score.localDate,
			value: component === 'total' ? score.totalScore : score.breakdown[component]
		}));
	
	if (dataWithScores.length === 0) {
		// Return empty trend data if no data available
		return {
			dataPoints: [],
			points: '',
			average: 0,
			trend: 0,
			minValue: 0,
			maxValue: 100
		};
	}
	
	// Calculate statistics
	const values = dataWithScores.map(d => d.value);
	const minValue = Math.min(...values);
	const maxValue = Math.max(...values);
	const average = Math.round(values.reduce((sum, val) => sum + val, 0) / values.length);
	
	// Calculate trend (simple linear regression slope)
	const n = dataWithScores.length;
	let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
	
	dataWithScores.forEach((point, index) => {
		sumX += index;
		sumY += point.value;
		sumXY += index * point.value;
		sumXX += index * index;
	});
	
	const slope = n > 1 ? (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX) : 0;
	const trend = Math.round(slope * 10) / 10; // Round to 1 decimal place
	
	// Generate SVG coordinates (400x120 viewBox)
	const chartWidth = 400;
	const chartHeight = 120;
	const padding = 20;
	const plotWidth = chartWidth - 2 * padding;
	const plotHeight = chartHeight - 2 * padding;
	
	// Scale values to fit the chart
	const valueRange = maxValue - minValue || 1; // Avoid division by zero
	
	const dataPoints: TrendDataPoint[] = dataWithScores.map((point, index) => {
		const x = padding + (index / Math.max(n - 1, 1)) * plotWidth;
		const y = padding + (1 - (point.value - minValue) / valueRange) * plotHeight;
		
		return {
			date: point.date,
			value: point.value,
			x: Math.round(x * 10) / 10,
			y: Math.round(y * 10) / 10
		};
	});
	
	// Generate SVG polyline points string
	const points = dataPoints.map(p => `${p.x},${p.y}`).join(' ');
	
	return {
		dataPoints,
		points,
		average,
		trend,
		minValue,
		maxValue
	};
});