<!-- src/lib/components/MoodCard.svelte -->
<script lang="ts">
	import { upsertMood, type MoodResponse } from '../../routes/mood.remote.js';
	import { getTodayLocalDate } from '$lib/time/index.js';
	import { Heart, Frown, Meh, Smile, Laugh } from '@lucide/svelte';
	import Panel from './ui/Panel.svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	// Props
	let {
		localDate = getTodayLocalDate(),
		data: moodData
	} = $props<{ localDate: string; data: MoodResponse | null }>();

	// State
	let errorMessage = $state('');
	let isSubmitting = $state(false);

	// Handle mood rating selection
	async function handleRatingSelect(rating: number) {
		if (isSubmitting) return;

		isSubmitting = true;
		errorMessage = '';

		try {
			const result = await upsertMood({
				localDate,
				rating
			});

			if (result.ok) {
				dispatch('save');
			} else {
				errorMessage = result.error ?? 'Failed to update mood';
			}
		} catch (error) {
			console.error('Failed to update mood:', error);
			errorMessage = error instanceof Error ? error.message : 'Failed to update mood';
		} finally {
			isSubmitting = false;
		}
	}

	// Get mood icon based on rating
	function getMoodIcon(rating: number) {
		switch (rating) {
			case 1:
				return Frown;
			case 2:
				return Frown;
			case 3:
				return Meh;
			case 4:
				return Smile;
			case 5:
				return Laugh;
			default:
				return Meh;
		}
	}

	// Get mood label based on rating
	function getMoodLabel(rating: number): string {
		switch (rating) {
			case 1:
				return 'CRITICAL';
			case 2:
				return 'LOW';
			case 3:
				return 'STABLE';
			case 4:
				return 'GOOD';
			case 5:
				return 'OPTIMAL';
			default:
				return 'UNKNOWN';
		}
	}

	// Get color class based on rating
	function getRatingColorClass(rating: number): string {
		switch (rating) {
			case 1:
				return 'text-red-500';
			case 2:
				return 'text-red-400';
			case 3:
				return 'text-gray-400';
			case 4:
				return 'text-teal-400';
			case 5:
				return 'text-teal-300';
			default:
				return 'text-gray-400';
		}
	}
</script>

<Panel
	title="Mood"
	subtitle="How you feel"
	icon={Heart}
	value={moodData?.score}
	status={
		moodData?.score
			? moodData.score >= 75
				? 'success'
				: moodData.score >= 50
					? 'warning'
					: 'error'
			: undefined
	}
>
	<!-- Rating interface -->
	<div class="space-y-5">
		<!-- Rating scale buttons -->
		<div class="flex justify-center gap-2">
			{#each [1, 2, 3, 4, 5] as rating}
				{@const IconComponent = getMoodIcon(rating)}
				<button
					class="p-3 rounded-lg transition-colors {moodData?.rating === rating
						? 'bg-teal-500/20'
						: 'hover:bg-gray-800/50'}"
					onclick={() => handleRatingSelect(rating)}
					disabled={isSubmitting}
					title={getMoodLabel(rating)}
				>
					<IconComponent size={18} class={getRatingColorClass(rating)} />
				</button>
			{/each}
		</div>

		{#if moodData && moodData.hasData}
			<!-- Current mood display -->
			<div class="text-center p-4 rounded-lg bg-gray-900/20">
				<div class="text-sm text-gray-400">Current State</div>
				<div class="text-lg font-semibold mt-2 {getRatingColorClass(moodData.rating || 3)}">
					{getMoodLabel(moodData.rating || 3)}
				</div>
			</div>
		{:else}
			<!-- Empty state -->
			<div class="text-center py-6">
				<Heart size={28} class="mx-auto mb-3 text-gray-600" />
				<p class="text-sm text-gray-500">Rate your mood</p>
			</div>
		{/if}
	</div>

	{#if errorMessage}
		<div class="p-3 rounded-lg border border-red-500/30 bg-red-500/10 mt-4">
			<p class="text-sm text-red-400">{errorMessage}</p>
		</div>
	{/if}
</Panel>