<!-- src/lib/components/WorkoutsCard.svelte -->
<script lang="ts">
	import { upsertWorkouts, type WorkoutResponse } from '../../routes/workout.remote.js';
	import { getTodayLocalDate } from '$lib/time/index.js';
	import { Dumbbell, Zap, Activity } from '@lucide/svelte';
	import Panel from './ui/Panel.svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	// Props
	let {
		localDate = getTodayLocalDate(),
		data: workoutsData
	} = $props<{ localDate: string; data: WorkoutResponse | null }>();

	// State
	let errorMessage = $state('');
	let isSubmitting = $state(false);

	// Handle workout toggle
	async function handleToggleWorkout(workoutType: 'running' | 'calisthenics') {
		if (isSubmitting) return;

		isSubmitting = true;
		errorMessage = '';

		try {
			const currentRunning = workoutsData?.runningCompleted ?? false;
			const currentCalisthenics = workoutsData?.calisthenicsCompleted ?? false;

			const result = await upsertWorkouts({
				localDate,
				runningCompleted: workoutType === 'running' ? !currentRunning : currentRunning,
				calisthenicsCompleted:
					workoutType === 'calisthenics' ? !currentCalisthenics : currentCalisthenics
			});

			if (result.ok) {
				dispatch('save');
			} else {
				errorMessage = result.error ?? 'Failed to update workout';
			}
		} catch (error) {
			console.error('Failed to update workout:', error);
			errorMessage = error instanceof Error ? error.message : 'Failed to update workout';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<Panel
	title="Workouts"
	subtitle="Exercise"
	icon={Activity}
	value={workoutsData?.score}
	status={
		workoutsData?.score
			? workoutsData.score >= 80
				? 'success'
				: 'error'
			: undefined
	}
>
	<!-- Workout toggle buttons -->
	<div class="space-y-4">
		{#each [
			{ type: 'running' as const, icon: Zap, label: 'CARDIO', completed: workoutsData?.runningCompleted },
			{
				type: 'calisthenics' as const,
				icon: Dumbbell,
				label: 'STRENGTH',
				completed: workoutsData?.calisthenicsCompleted
			}
		] as workout}
			{@const IconComponent = workout.icon}
			<button
				class="w-full flex items-center justify-between p-4 rounded-lg transition-colors {workout.completed
					? 'bg-teal-500/20'
					: 'hover:bg-gray-800/50'}"
				onclick={() => handleToggleWorkout(workout.type)}
				disabled={isSubmitting}
			>
				<div class="flex items-center gap-3">
					<IconComponent size={18} class="text-gray-400" />
					<span class="text-sm text-white">{workout.label}</span>
				</div>
				<div
					class="text-xl font-bold {workout.completed ? 'text-teal-400' : 'text-gray-600'}"
				>
					{workout.completed ? '✓' : '○'}
				</div>
			</button>
		{/each}
	</div>

	{#if errorMessage}
		<div class="p-3 rounded-lg border border-red-500/30 bg-red-500/10 mt-4">
			<p class="text-sm text-red-400">{errorMessage}</p>
		</div>
	{/if}
</Panel>