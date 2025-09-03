<!-- src/lib/components/HabitsCard.svelte -->
<script lang="ts">
	import { upsertHabits, type HabitsData } from '../../routes/habits.remote.js';
	import { getTodayLocalDate } from '$lib/time/index.js';
	import { CheckSquare, Square, Target } from '@lucide/svelte';
	import Panel from './ui/Panel.svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	// Props
	let {
		localDate = getTodayLocalDate(),
		data: habitsData
	} = $props<{ localDate: string; data: HabitsData | null }>();

	// State
	let errorMessage = $state('');
	let isSubmitting = $state(false);

	// Handle habit completion toggle
	async function handleToggleHabit(habitId: number, currentCompleted: boolean) {
		if (isSubmitting) return;

		isSubmitting = true;
		errorMessage = '';

		try {
			if (!habitsData) return;

			// Create a map of the new completion states
			const newCompletions = habitsData.habits.map((habit) => ({
				habitId: habit.id,
				completed: habit.id === habitId ? !currentCompleted : habit.completed
			}));

			const result = await upsertHabits({
				localDate,
				habitCompletions: newCompletions
			});

			if (result.ok) {
				dispatch('save');
			} else {
				errorMessage = result.error ?? 'Failed to update habit';
			}
		} catch (error) {
			console.error('Failed to update habit:', error);
			errorMessage = error instanceof Error ? error.message : 'Failed to update habit';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<Panel
	title="Habits"
	subtitle="Daily Goals"
	icon={Target}
	value={habitsData?.score}
	status={
		habitsData?.score
			? habitsData.score >= 80
				? 'success'
				: habitsData.score >= 50
					? 'warning'
					: 'error'
			: undefined
	}
>
	{#if habitsData && habitsData.habits.length > 0}
		<!-- Display habits list -->
		<div class="space-y-3">
			{#each habitsData.habits as habit (habit.id)}
				<div
					class="flex items-center justify-between p-4 rounded-lg bg-gray-900/20 border border-gray-800/50"
				>
					<div class="flex items-center gap-4">
						<button
							class="p-2 disabled:opacity-50"
							onclick={() => handleToggleHabit(habit.id, habit.completed)}
							disabled={isSubmitting}
						>
							{#if habit.completed}
								<CheckSquare size={16} class="text-teal-400" />
							{:else}
								<Square size={16} class="text-gray-400" />
							{/if}
						</button>

						<div>
							<span class="text-sm {habit.completed ? 'line-through text-gray-500' : 'text-white'}"
								>{habit.name}</span
							>
							{#if habit.weight > 1}
								<span class="text-xs text-gray-500 ml-2">({habit.weight}x)</span>
							{/if}
						</div>
					</div>

					<div class="font-mono text-sm text-teal-400">
						{habit.completed ? habit.weight : 0}/{habit.weight}
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<!-- Empty state -->
		<div class="text-center py-6">
			<Target size={24} class="mx-auto mb-2 text-gray-600" />
			<div class="text-lg font-medium text-gray-500">No Habits</div>
			<p class="text-sm text-gray-600 mt-1">Set up daily goals to track</p>
		</div>
	{/if}

	{#if errorMessage}
		<div class="p-3 rounded-lg border border-red-500/30 bg-red-500/10 mt-4">
			<p class="text-sm text-red-400">{errorMessage}</p>
		</div>
	{/if}
</Panel>