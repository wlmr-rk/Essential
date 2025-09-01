<!-- src/lib/components/ui/Heatmap.svelte -->
<script lang="ts">
	import { getDayScore } from '../../../routes/day-score.remote.js';
	
	interface Props {
		days?: number;
	}
	
	let { days = 60 }: Props = $props();
	
	// Generate 60 days: 45 past days + today + 14 future days
	function generateDays() {
		const today = new Date();
		const startDate = new Date(today);
		startDate.setDate(today.getDate() - 45);
		
		const days = [];
		for (let i = 0; i < 60; i++) {
			const date = new Date(startDate);
			date.setDate(startDate.getDate() + i);
			days.push({
				date: date.toISOString().split('T')[0],
				dayOfMonth: date.getDate(),
				isCurrentMonth: date.getMonth() === today.getMonth(),
				isToday: date.toDateString() === today.toDateString(),
				isPast: date < today,
				isFuture: date > today
			});
		}
		return days;
	}
	
	function getScoreColor(score: number, isPast: boolean, isFuture: boolean): string {
		if (isFuture) return 'bg-gray-800 opacity-10'; // Future days
		if (score === 0) return 'bg-gray-800 opacity-20'; // No data
		if (score >= 80) return 'bg-green-500'; // High score
		if (score >= 60) return 'bg-yellow-500'; // Medium score
		return 'bg-red-500'; // Low score
	}
	
	function getScoreOpacity(score: number, isPast: boolean): string {
		if (!isPast) return '';
		if (score === 0) return 'opacity-20';
		if (score >= 80) return 'opacity-100';
		if (score >= 60) return 'opacity-75';
		return 'opacity-60';
	}
	
	const dayGrid = generateDays();
	
	// Get scores for all days (this will be empty for now, but structure is ready)
	const scorePromises = dayGrid.map(day => {
		if (day.isFuture) return Promise.resolve({ date: day.date, score: 0 });
		return getDayScore({ localDate: day.date }).then(result => ({
			date: day.date,
			score: result?.total || 0
		})).catch(() => ({ date: day.date, score: 0 }));
	});
</script>

<div class="arasaka-panel p-3">
	<div class="flex items-center justify-between mb-3">
		<h3 class="arasaka-subtitle text-sm">Activity</h3>
		<div class="flex items-center gap-1 text-xs">
			<span class="arasaka-label text-xs">Less</span>
			<div class="flex gap-0.5">
				<div class="w-2 h-2 bg-gray-800 opacity-20 rounded-sm"></div>
				<div class="w-2 h-2 bg-red-500 opacity-60 rounded-sm"></div>
				<div class="w-2 h-2 bg-yellow-500 opacity-75 rounded-sm"></div>
				<div class="w-2 h-2 bg-green-500 opacity-100 rounded-sm"></div>
			</div>
			<span class="arasaka-label text-xs">More</span>
		</div>
	</div>
	
	<div class="grid grid-cols-15 gap-0.5">
		{#each dayGrid as day}
			{@const score = 0} <!-- Will be populated with real data later -->
			<div 
				class="w-3 h-3 rounded-sm {getScoreColor(score, day.isPast, day.isFuture)} {getScoreOpacity(score, day.isPast)}
				       {day.isToday ? 'ring-1 ring-primary' : ''}"
				title="{day.date}: {score > 0 ? score + '/100' : day.isFuture ? 'Future' : 'No data'}"
			></div>
		{/each}
	</div>
	
	<div class="mt-2 text-center">
		<p class="arasaka-label text-xs">Last 60 days</p>
	</div>
</div>

<style>
	.grid-cols-15 {
		grid-template-columns: repeat(15, minmax(0, 1fr));
	}
</style>