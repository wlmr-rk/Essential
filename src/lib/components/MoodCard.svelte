<!-- src/lib/components/MoodCard.svelte -->
<script lang="ts">
	import { getTodayMood, upsertMood, type MoodResponse } from '../../routes/mood.remote.js';
	import { getTodayLocalDate } from '$lib/time/index.js';
	import { calculateMoodScore } from '$lib/scoring.js';
	import { Heart, Frown, Meh, Smile, Laugh } from '@lucide/svelte';
	import Panel from './ui/Panel.svelte';
	
	// Props
	let { localDate = getTodayLocalDate() } = $props();
	
	// State
	let errorMessage = $state('');
	let isSubmitting = $state(false);
	
	// Remote function queries
	const moodData = getTodayMood({ localDate });
	
	// Handle mood rating selection with optimistic UI
	async function handleRatingSelect(rating: number) {
		if (isSubmitting) return;
		
		isSubmitting = true;
		errorMessage = '';
		
		try {
			// Create optimistic data for immediate UI feedback
			const optimisticScore = calculateMoodScore(rating);
			const optimisticData: MoodResponse = {
				rating,
				score: optimisticScore,
				hasData: true
			};
			
			// Perform optimistic update with automatic rollback on failure
			await upsertMood({
				localDate,
				rating
			}).updates(
				moodData.withOverride(() => optimisticData)
			);
			
		} catch (error) {
			// Error handling - optimistic update automatically rolled back
			console.error('Failed to update mood:', error);
			errorMessage = error instanceof Error ? error.message : 'Failed to update mood';
		} finally {
			isSubmitting = false;
		}
	}
	
	// Get mood icon based on rating
	function getMoodIcon(rating: number) {
		switch (rating) {
			case 1: return Frown;
			case 2: return Frown;
			case 3: return Meh;
			case 4: return Smile;
			case 5: return Laugh;
			default: return Meh;
		}
	}
	
	// Get mood label based on rating
	function getMoodLabel(rating: number): string {
		switch (rating) {
			case 1: return 'CRITICAL';
			case 2: return 'LOW';
			case 3: return 'STABLE';
			case 4: return 'GOOD';
			case 5: return 'OPTIMAL';
			default: return 'UNKNOWN';
		}
	}
	
	// Get color class based on rating
	function getRatingColorClass(rating: number): string {
		switch (rating) {
			case 1: return 'cyber-text-secondary';
			case 2: return 'text-red-400';
			case 3: return 'text-gray-400';
			case 4: return 'cyber-text-accent';
			case 5: return 'cyber-text-primary';
			default: return 'text-gray-400';
		}
	}
</script>

<Panel
	title="Mood"
	subtitle="How you feel"
	icon={Heart}
	value={moodData.current?.score}
	status={moodData.current?.score ? (moodData.current.score >= 75 ? 'optimal' : moodData.current.score >= 50 ? 'warning' : 'critical') : undefined}
	loading={moodData.loading}
>
		
	{#if moodData.error}
		<div class="text-center py-4">
			<div class="cyber-text-secondary arasaka-subtitle">Error</div>
			<p class="arasaka-label mt-2">Unable to load mood data</p>
		</div>
	{:else}
		<!-- Rating interface -->
		<div class="space-y-4">
			<!-- Rating scale buttons -->
			<div class="flex justify-center gap-2">
				{#each [1, 2, 3, 4, 5] as rating}
					{@const IconComponent = getMoodIcon(rating)}
					<button
						class="arasaka-btn arasaka-btn-sm {moodData.current?.rating === rating ? 'active' : ''}"
						onclick={() => handleRatingSelect(rating)}
						disabled={isSubmitting}
						title={getMoodLabel(rating)}
					>
						<IconComponent size={16} class={getRatingColorClass(rating)} />
					</button>
				{/each}
			</div>
			
			{#if moodData.current && moodData.current.hasData}
				<!-- Current mood display -->
				<div class="text-center p-3 rounded-lg bg-gray-900/30">
					<div class="arasaka-label">Current State</div>
					<div class="arasaka-value mt-1 {getRatingColorClass(moodData.current.rating || 3)}">
						{getMoodLabel(moodData.current.rating || 3)}
					</div>
				</div>
			{:else}
				<!-- Empty state -->
				<div class="text-center py-4">
					<Heart size={24} class="mx-auto mb-2 text-gray-600" />
					<p class="arasaka-label">Rate your mood</p>
				</div>
			{/if}
		</div>
	{/if}

	{#if errorMessage}
		<div class="p-3 rounded-lg border border-red-500/30 bg-red-500/10 mt-4">
			<p class="cyber-text-secondary text-sm">{errorMessage}</p>
		</div>
	{/if}
	
	{#if isSubmitting}
		<div class="flex items-center justify-center mt-4">
			<div class="arasaka-loading"></div>
		</div>
	{/if}
</Panel>