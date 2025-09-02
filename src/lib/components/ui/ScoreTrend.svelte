<!-- src/lib/components/ui/ScoreTrend.svelte -->
<script lang="ts">
	import { getScoreTrends, type TrendData } from '../../../routes/score-trends.remote.js';
	
	interface Props {
		days?: number;
		component?: 'total' | 'sleep' | 'habits' | 'mood' | 'workouts';
		title?: string;
	}
	
	let { days = 30, component = 'total', title }: Props = $props();
	
	// Fetch trend data
	const trendData = getScoreTrends({ days, component });
	
	// Component-specific styling
	const componentColors = {
		total: { stroke: '#3b82f6', fill: '#3b82f6', bg: 'bg-blue-50' },
		sleep: { stroke: '#8b5cf6', fill: '#8b5cf6', bg: 'bg-purple-50' },
		habits: { stroke: '#10b981', fill: '#10b981', bg: 'bg-emerald-50' },
		mood: { stroke: '#f59e0b', fill: '#f59e0b', bg: 'bg-amber-50' },
		workouts: { stroke: '#ef4444', fill: '#ef4444', bg: 'bg-red-50' }
	};
	
	const colors = componentColors[component];
	
	// Format component name for display
	function formatComponentName(comp: string): string {
		if (comp === 'total') return 'Overall Score';
		return comp.charAt(0).toUpperCase() + comp.slice(1);
	}
	
	// Format trend direction
	function formatTrend(trend: number): { text: string; icon: string; color: string } {
		if (trend > 0.5) return { text: 'Improving', icon: '↗', color: 'text-green-400' };
		if (trend < -0.5) return { text: 'Declining', icon: '↘', color: 'text-red-400' };
		return { text: 'Stable', icon: '→', color: '' };
	}
	
	// Format date for tooltip
	function formatDate(dateStr: string): string {
		const date = new Date(dateStr);
		return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
	}
	
	// Calculate average line Y position
	function calculateAvgY(average: number, minValue: number, maxValue: number): number {
		return 20 + (1 - (average - minValue) / Math.max(maxValue - minValue, 1)) * 80;
	}
</script>

<div class="trend-container">
	{#await trendData}
		<!-- Elegant loading state -->
		<div class="trend-loading">
			<div class="flex items-center justify-between mb-4">
				<div class="h-5 rounded animate-pulse w-32" style="background-color: var(--color-gray-700)"></div>
				<div class="h-4 rounded animate-pulse w-20" style="background-color: var(--color-gray-700)"></div>
			</div>
			
			<div class="trend-chart-skeleton">
				<div class="h-32 rounded animate-pulse" style="background-color: var(--color-gray-700)"></div>
			</div>
			
			<div class="flex justify-between mt-3">
				<div class="h-3 rounded animate-pulse w-16" style="background-color: var(--color-gray-700)"></div>
				<div class="h-3 rounded animate-pulse w-16" style="background-color: var(--color-gray-700)"></div>
			</div>
		</div>
	{:then data}
		<div class="trend-content">
			<div class="flex items-center justify-between mb-4">
				<h3 class="text-lg font-semibold text-white">
					{title || `${formatComponentName(component)} Trend`}
				</h3>
				{#if data.trend !== undefined}
					{@const trendInfo = formatTrend(data.trend)}
					<div class="flex items-center gap-2">
						<span class="text-sm {trendInfo.color}" style="{trendInfo.color ? '' : `color: var(--color-gray-400)`}">{trendInfo.icon}</span>
						<span class="text-sm" style="color: var(--color-gray-300)">{trendInfo.text}</span>
					</div>
				{/if}
			</div>
			
			{#if data.dataPoints.length === 0}
				<!-- No data state -->
				<div class="trend-no-data">
					<div class="text-center py-8">
						<div class="mb-2" style="color: var(--color-gray-500)">
							<svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
							</svg>
						</div>
						<p class="text-sm" style="color: var(--color-gray-400)">No data available for trend analysis</p>
						<p class="text-xs mt-1" style="color: var(--color-gray-500)">Start tracking to see your progress over time</p>
					</div>
				</div>
			{:else}
				<!-- Trend chart -->
				<div class="trend-chart">
					<svg viewBox="0 0 400 120" class="w-full h-32">
						<!-- Grid lines -->
						<defs>
							<pattern id="grid" width="40" height="24" patternUnits="userSpaceOnUse">
								<path d="M 40 0 L 0 0 0 24" fill="none" stroke="#3f3f46" stroke-width="1"/>
							</pattern>
						</defs>
						<rect width="400" height="120" fill="url(#grid)" />
						
						<!-- Trend line -->
						{#if data.points}
							<polyline 
								points={data.points}
								fill="none" 
								stroke={colors.stroke}
								stroke-width="2.5"
								stroke-linecap="round"
								stroke-linejoin="round"
								class="trend-line"
							/>
						{/if}
						
						<!-- Data points -->
						{#each data.dataPoints as point, i}
							<circle 
								cx={point.x} 
								cy={point.y} 
								r="4"
								fill={colors.fill}
								stroke="white"
								stroke-width="2"
								class="trend-point"
								data-tooltip="{formatDate(point.date)}: {point.value}%"
							/>
						{/each}
						
						<!-- Average line -->
						<line 
							x1="20" 
							y1={calculateAvgY(data.average, data.minValue, data.maxValue)} 
							x2="380" 
							y2={calculateAvgY(data.average, data.minValue, data.maxValue)}
							stroke={colors.stroke}
							stroke-width="1"
							stroke-dasharray="4,4"
							opacity="0.5"
						/>
					</svg>
				</div>
				
				<!-- Statistics -->
				<div class="trend-stats">
					<div class="flex justify-between items-center text-sm">
						<div class="flex items-center gap-4">
							<span style="color: var(--color-gray-400)">
								Avg: <span class="font-medium text-white">{data.average}%</span>
							</span>
							<span style="color: var(--color-gray-400)">
								Range: <span class="font-medium text-white">{data.minValue}% - {data.maxValue}%</span>
							</span>
						</div>
						<span style="color: var(--color-gray-400)">
							{data.dataPoints.length} days
						</span>
					</div>
				</div>
			{/if}
		</div>
	{:catch error}
		<!-- Graceful error state -->
		<div class="trend-error">
			<div class="text-center space-y-3">
				<div class="text-red-400">
					<svg class="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
					</svg>
				</div>
				<p class="text-sm" style="color: var(--color-gray-300)">Failed to load trend data</p>
				<p class="text-xs" style="color: var(--color-gray-400)">{error.message}</p>
				<button 
					class="text-xs text-blue-400 hover:text-blue-300 hover:underline transition-colors"
					onclick={() => location.reload()}
				>
					Retry
				</button>
			</div>
		</div>
	{/await}
</div>

<style>
	.trend-container {
		background-color: var(--color-gray-900);
		border: 1px solid var(--color-gray-800);
		border-radius: 0.75rem;
		padding: 1.5rem;
	}
	
	.trend-loading,
	.trend-content {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	
	.trend-chart {
		position: relative;
	}
	
	.trend-chart svg {
		filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
	}
	
	.trend-line {
		filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
	}
	
	.trend-point {
		cursor: pointer;
		transition: all 150ms ease;
		filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
	}
	
	.trend-point:hover {
		r: 6;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4));
	}
	
	.trend-stats {
		padding-top: 0.75rem;
		border-top: 1px solid var(--color-gray-800);
	}
	
	.trend-no-data {
		background-color: var(--color-gray-800);
		border-radius: 0.5rem;
	}
	
	.trend-error {
		background-color: #450a0a;
		border: 1px solid #991b1b;
		border-radius: 0.5rem;
		padding: 1.5rem;
	}
	
	.trend-chart-skeleton {
		animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}
	
	/* Tooltip styles (if you want to add tooltip functionality later) */
	.trend-point[data-tooltip]:hover::after {
		content: attr(data-tooltip);
		background-color: var(--color-gray-800);
		border: 1px solid var(--color-gray-700);
		position: absolute;
		color: white;
		font-size: 0.75rem;
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
		pointer-events: none;
		bottom: 100%;
		left: 50%;
		transform: translateX(-50%);
		margin-bottom: 4px;
		z-index: 10;
	}
</style>