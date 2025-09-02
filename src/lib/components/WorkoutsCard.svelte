<!-- src/lib/components/WorkoutsCard.svelte -->
<script lang="ts">
	import { getTodayWorkouts, upsertWorkouts, type WorkoutResponse } from '../../routes/workout.remote.js';
	import { getTodayLocalDate } from '$lib/time/index.js';
	import { calculateWorkoutScore } from '$lib/scoring.js';
	import { Dumbbell, Zap, Activity } from '@lucide/svelte';
	import Panel from './ui/Panel.svelte';
	
	// Props
	let { localDate = getTodayLocalDate() } = $props();
	
	// State
	let errorMessage = $state('');
	let isSubmitting = $state(false);
	
	// Remote function queries
	const workoutsData = getTodayWorkouts({ localDate });
	
	// Handle workout toggle with optimistic UI
	async function handleToggleWorkout(workoutType: 'running' | 'calisthenics', currentCompleted: boolean) {
		if (isSubmitting) return;
		
		isSubmitting = true;
		errorMessage = '';
		
		try {
			const currentData = workoutsData.current;
			if (!currentData) return;
			
			// Create optimistic data for immediate UI feedback
			const optimisticRunning = workoutType === 'running' ? !currentCompleted : currentData.runningCompleted;
			const optimisticCalisthenics = workoutType === 'calisthenics' ? !currentCompleted : currentData.calisthenicsCompleted;
			const optimisticScore = calculateWorkoutScore(optimisticRunning, optimisticCalisthenics);
			
			const optimisticData: WorkoutResponse = {
				runningCompleted: optimisticRunning,
				calisthenicsCompleted: optimisticCalisthenics,
				score: optimisticScore,
				hasData: true
			};
			
			// Perform optimistic update with automatic rollback on failure
			await upsertWorkouts({
				localDate,
				runningCompleted: optimisticRunning,
				calisthenicsCompleted: optimisticCalisthenics
			}).updates(
				workoutsData.withOverride(() => optimisticData)
			);
			
		} catch (error) {
			// Error handling - optimistic update automatically rolled back
			console.error('Failed to update workout:', error);
			errorMessage = error instanceof Error ? error.message : 'Failed to update workout';
		} finally {
			isSubmitting = false;
		}
	}
	
	// Get workout type icon
	function getWorkoutIcon(workoutType: 'running' | 'calisthenics') {
		return workoutType === 'running' ? Zap : Dumbbell;
	}
	
	// Get workout type label
	function getWorkoutLabel(workoutType: 'running' | 'calisthenics'): string {
		return workoutType === 'running' ? 'CARDIO' : 'STRENGTH';
	}
	
	// Get completed workouts count
	function getCompletedCount(data: WorkoutResponse): number {
		let count = 0;
		if (data.runningCompleted) count++;
		if (data.calisthenicsCompleted) count++;
		return count;
	}
	
	// Get completed workouts list for display
	function getCompletedWorkouts(data: WorkoutResponse): string[] {
		const completed = [];
		if (data.runningCompleted) completed.push('Running');
		if (data.calisthenicsCompleted) completed.push('Calisthenics');
		return completed;
	}
</script>

<Panel
	title="Workouts"
	subtitle="Exercise"
	icon={Activity}
	value={workoutsData.current?.score}
	status={workoutsData.current?.score ? (workoutsData.current.score >= 80 ? 'success' : 'error') : undefined}
	loading={workoutsData.loading}
>
		
	{#if workoutsData.error}
		<div class="text-center py-4">
			<div class="cyber-text-secondary arasaka-subtitle">Error</div>
			<p class="arasaka-label mt-2">Unable to load workout data</p>
		</div>
	{:else}
		<!-- Workout toggle buttons -->
		<div class="space-y-4">
			{#each [
				{ type: 'running' as const, icon: getWorkoutIcon('running'), label: getWorkoutLabel('running'), completed: workoutsData.current?.runningCompleted },
				{ type: 'calisthenics' as const, icon: getWorkoutIcon('calisthenics'), label: getWorkoutLabel('calisthenics'), completed: workoutsData.current?.calisthenicsCompleted }
			] as workout}
				{@const IconComponent = workout.icon}
				<button
					class="arasaka-btn w-full flex items-center justify-between p-4 {workout.completed ? 'active' : ''}"
					onclick={() => handleToggleWorkout(workout.type, workout.completed || false)}
					disabled={isSubmitting}
				>
					<div class="flex items-center gap-3">
						<IconComponent size={18} class="text-gray-400" />
						<span class="arasaka-label text-sm">{workout.label}</span>
					</div>
					<div class="text-xl">
						{#if workout.completed}
							✓
						{:else}
							○
						{/if}
					</div>
				</button>
			{/each}
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