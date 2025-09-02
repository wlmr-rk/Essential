<!-- src/lib/components/HabitsCard.svelte -->
<script lang="ts">
	import { getTodayHabits, upsertHabits, type HabitsData } from '../../routes/habits.remote.js';
	import { getTodayLocalDate } from '$lib/time/index.js';
	import type { HabitWithCompletion } from '$lib/scoring.js';
	import { CheckSquare, Square, Target } from '@lucide/svelte';
	import Panel from './ui/Panel.svelte';
	
	// Props
	let { localDate = getTodayLocalDate() } = $props();
	
	// State
	let errorMessage = $state('');
	let isSubmitting = $state(false);
	
	// Remote function queries
	const habitsData = getTodayHabits({ localDate });
	
	// Handle habit completion toggle with optimistic UI
	async function handleToggleHabit(habitId: number, currentCompleted: boolean) {
		if (isSubmitting) return;
		
		isSubmitting = true;
		errorMessage = '';
		
		try {
			const currentData = habitsData.current;
			if (!currentData) return;
			
			// Create optimistic data for immediate UI feedback
			const optimisticHabits = currentData.habits.map(habit => 
				habit.id === habitId 
					? { ...habit, completed: !currentCompleted, completedAt: !currentCompleted ? new Date() : null }
					: habit
			);
			
			// Calculate optimistic scores
			const optimisticCompletedWeight = optimisticHabits
				.filter(habit => habit.completed)
				.reduce((sum, habit) => sum + habit.weight, 0);
			
			const optimisticScore = currentData.totalWeight > 0 
				? Math.round((optimisticCompletedWeight / currentData.totalWeight) * 100)
				: 0;
			
			const optimisticData: HabitsData = {
				habits: optimisticHabits,
				score: optimisticScore,
				totalWeight: currentData.totalWeight,
				completedWeight: optimisticCompletedWeight
			};
			
			// Prepare habit completions data for the command
			const habitCompletions = optimisticHabits.map(habit => ({
				habitId: habit.id,
				completed: habit.completed
			}));
			
			// Perform optimistic update with automatic rollback on failure
			await upsertHabits({
				localDate,
				habitCompletions
			}).updates(
				habitsData.withOverride(() => optimisticData)
			);
			
		} catch (error) {
			// Error handling - optimistic update automatically rolled back
			console.error('Failed to update habit:', error);
			errorMessage = error instanceof Error ? error.message : 'Failed to update habit';
		} finally {
			isSubmitting = false;
		}
	}
	
	// Calculate completion percentage for display
	function getCompletionPercentage(data: HabitsData): number {
		return data.totalWeight > 0 ? Math.round((data.completedWeight / data.totalWeight) * 100) : 0;
	}
	
	// Get weight display text
	function getWeightText(weight: number): string {
		return weight === 1 ? '' : `(${weight}x)`;
	}
</script>

<Panel
	title="Habits"
	subtitle="Daily Goals"
	icon={Target}
	value={habitsData.current?.score}
	status={habitsData.current?.score ? (habitsData.current.score >= 80 ? 'success' : habitsData.current.score >= 50 ? 'warning' : 'error') : undefined}
	loading={habitsData.loading}
>
		
	{#if habitsData.error}
		<div class="text-center py-4">
			<div class="cyber-text-secondary arasaka-subtitle">Error</div>
			<p class="arasaka-label mt-2">Unable to load habits data</p>
		</div>
	{:else if habitsData.current && habitsData.current.habits.length > 0}
		<!-- Display habits list -->
		<div class="space-y-3">
			{#each habitsData.current.habits as habit (habit.id)}
				<div class="flex items-center justify-between p-4 rounded-lg bg-gray-900/20 border border-gray-800/50">
					<div class="flex items-center gap-4">
						<button
							class="arasaka-btn arasaka-btn-sm p-2 {habit.completed ? 'active' : ''}"
							onclick={() => handleToggleHabit(habit.id, habit.completed)}
							disabled={isSubmitting}
						>
							{#if habit.completed}
								<CheckSquare size={16} class="cyber-text-primary" />
							{:else}
								<Square size={16} class="text-gray-400" />
							{/if}
						</button>
						
						<div>
							<span class="arasaka-label text-sm {habit.completed ? 'line-through text-gray-500' : ''}">{habit.name}</span>
							{#if habit.weight > 1}
								<span class="text-xs text-gray-500 ml-2">({habit.weight}x)</span>
							{/if}
						</div>
					</div>
					
					<div class="arasaka-value cyber-text-primary">
						{habit.completed ? habit.weight : 0}/{habit.weight}
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<!-- Empty state -->
		<div class="text-center py-6">
			<Target size={24} class="mx-auto mb-2 text-gray-600" />
			<div class="arasaka-subtitle text-gray-500">No Habits</div>
			<p class="arasaka-label mt-1">Set up daily goals to track</p>
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