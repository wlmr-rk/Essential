<!-- src/lib/components/SleepCard.svelte -->
<script lang="ts">
	import { getTodaySleep, upsertSleep, type SleepData } from '../../routes/sleep.remote.js';
	import { getTodayLocalDate, formatDuration } from '$lib/time/index.js';
	import { Moon, Edit3, Save, X } from '@lucide/svelte';
	import Panel from './ui/Panel.svelte';
	import Button from './ui/Button.svelte';
	import Input from './ui/Input.svelte';
	import ProgressBar from './ui/ProgressBar.svelte';
	
	// Props
	let { localDate = getTodayLocalDate() } = $props();
	
	// State
	let isEditing = $state(false);
	let sleepStartLocal = $state('');
	let wakeTimeLocal = $state('');
	let errorMessage = $state('');
	let isSubmitting = $state(false);
	
	// Remote function queries
	const sleepData = getTodaySleep({ localDate });
	
	// Sync form inputs with current sleep data using $effect
	$effect(() => {
		const data = sleepData.current;
		if (data && !isEditing) {
			sleepStartLocal = data.sleepStartLocal;
			wakeTimeLocal = data.wakeTimeLocal;
		}
	});
	
	// Form validation
	function validateForm(): boolean {
		errorMessage = '';
		
		if (!sleepStartLocal || !wakeTimeLocal) {
			errorMessage = 'Both sleep start and wake time are required';
			return false;
		}
		
		// Basic time format validation
		const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
		if (!timeRegex.test(sleepStartLocal)) {
			errorMessage = 'Invalid sleep start time format (use HH:MM)';
			return false;
		}
		
		if (!timeRegex.test(wakeTimeLocal)) {
			errorMessage = 'Invalid wake time format (use HH:MM)';
			return false;
		}
		
		return true;
	}
	
	// Handle form submission with optimistic UI
	async function handleSave(event: SubmitEvent) {
		event.preventDefault();
		if (!validateForm()) return;
		
		isSubmitting = true;
		errorMessage = '';
		
		try {
			// Create optimistic data for immediate UI feedback
			const optimisticData: SleepData = {
				id: sleepData.current?.id || 0,
				localDate,
				sleepStartLocal,
				wakeTimeLocal,
				durationMins: calculateOptimisticDuration(),
				score: calculateOptimisticScore(),
				createdAt: sleepData.current?.createdAt || new Date(),
				updatedAt: new Date()
			};
			
			// Perform optimistic update with automatic rollback on failure
			await upsertSleep({
				localDate,
				sleepStartLocal,
				wakeTimeLocal
			}).updates(
				sleepData.withOverride(() => optimisticData)
			);
			
			// Success - exit edit mode
			isEditing = false;
		} catch (error) {
			// Error handling - optimistic update automatically rolled back
			console.error('Failed to save sleep data:', error);
			errorMessage = error instanceof Error ? error.message : 'Failed to save sleep data';
		} finally {
			isSubmitting = false;
		}
	}
	
	// Calculate optimistic duration for immediate feedback
	function calculateOptimisticDuration(): number {
		try {
			const [sleepHour, sleepMin] = sleepStartLocal.split(':').map(Number);
			const [wakeHour, wakeMin] = wakeTimeLocal.split(':').map(Number);
			
			let sleepMinutes = sleepHour * 60 + sleepMin;
			let wakeMinutes = wakeHour * 60 + wakeMin;
			
			// Handle crossing midnight
			if (wakeMinutes <= sleepMinutes) {
				wakeMinutes += 24 * 60; // Add 24 hours
			}
			
			return wakeMinutes - sleepMinutes;
		} catch {
			return 0;
		}
	}
	
	// Calculate optimistic score for immediate feedback
	function calculateOptimisticScore(): number {
		const duration = calculateOptimisticDuration();
		const hours = duration / 60;
		
		// Simplified scoring logic for optimistic updates
		if (hours >= 7 && hours <= 9) return 100;
		if (hours >= 6 && hours < 7) return 80;
		if (hours >= 5 && hours < 6) return 60;
		if (hours >= 4 && hours < 5) return 40;
		if (hours > 9 && hours <= 10) return 80;
		if (hours > 10) return 60;
		return 20;
	}
	
	// Handle edit mode toggle
	function handleEdit() {
		isEditing = true;
		errorMessage = '';
		// Form inputs are already synced via $effect
	}
	
	// Handle cancel edit
	function handleCancel() {
		isEditing = false;
		errorMessage = '';
		// Reset form to current data
		const data = sleepData.current;
		if (data) {
			sleepStartLocal = data.sleepStartLocal;
			wakeTimeLocal = data.wakeTimeLocal;
		} else {
			sleepStartLocal = '';
			wakeTimeLocal = '';
		}
	}
</script>

<Panel
	title="Sleep"
	subtitle="Rest & Recovery"
	icon={Moon}
	value={sleepData.current?.score}
	status={sleepData.current?.score ? (sleepData.current.score >= 80 ? 'success' : sleepData.current.score >= 60 ? 'warning' : 'error') : undefined}
	loading={sleepData.loading}
>
	{#if !isEditing && !sleepData.loading}
		<div class="absolute top-6 right-6">
			<Button
				variant="ghost"
				size="sm"
				icon={Edit3}
				iconOnly
				onclick={handleEdit}
			/>
		</div>
	{/if}
		
	{#if sleepData.error}
		<div class="text-center py-6">
			<div class="text-error text-subtitle">Error</div>
			<p class="text-caption mt-2">Unable to load sleep data</p>
		</div>
	{:else if isEditing}
		<!-- Edit mode -->
		<form onsubmit={handleSave} class="space-y-5">
			<div class="grid grid-cols-2 gap-4">
				<Input
					type="time"
					label="Sleep Start"
					bind:value={sleepStartLocal}
					disabled={isSubmitting}
					required
					id="sleep-start-input"
				/>
				
				<Input
					type="time"
					label="Wake Time"
					bind:value={wakeTimeLocal}
					disabled={isSubmitting}
					required
					id="wake-time-input"
				/>
			</div>
			
			{#if sleepStartLocal && wakeTimeLocal}
				<div class="p-4 rounded-lg bg-zinc-800 border border-zinc-700">
					<div class="flex justify-between items-center">
						<span class="text-xs font-medium text-zinc-500 uppercase tracking-wide">Duration</span>
						<span class="text-lg font-semibold text-white">{formatDuration(calculateOptimisticDuration())}</span>
					</div>
					<div class="flex justify-between items-center mt-2">
						<span class="text-xs font-medium text-zinc-500 uppercase tracking-wide">Projected Score</span>
						<span class="text-lg font-semibold text-white">{calculateOptimisticScore()}/100</span>
					</div>
				</div>
			{/if}
			
			{#if errorMessage}
				<div class="p-4 rounded-lg bg-red-900/20 border border-red-500">
					<p class="text-red-400 text-sm">{errorMessage}</p>
				</div>
			{/if}
			
			<div class="flex gap-3">
				<Button
					variant="primary"
					size="sm"
					icon={Save}
					loading={isSubmitting}
					onclick={() => {}}
				>
					Save
				</Button>
				<Button
					variant="ghost"
					size="sm"
					icon={X}
					onclick={handleCancel}
					disabled={isSubmitting}
				>
					Cancel
				</Button>
			</div>
		</form>
	{:else if sleepData.current}
		<!-- Display mode with data -->
		<div class="space-y-6">
			<div class="grid grid-cols-2 gap-4">
				<div class="text-center p-4 rounded-lg bg-zinc-800">
					<div class="text-xs font-medium text-zinc-500 uppercase tracking-wide">Sleep Start</div>
					<div class="text-lg font-semibold text-white mt-2">{sleepData.current.sleepStartLocal}</div>
				</div>
				<div class="text-center p-4 rounded-lg bg-zinc-800">
					<div class="text-xs font-medium text-zinc-500 uppercase tracking-wide">Wake Time</div>
					<div class="text-lg font-semibold text-white mt-2">{sleepData.current.wakeTimeLocal}</div>
				</div>
			</div>
			
			<div class="text-center p-6 rounded-lg bg-zinc-800 border border-zinc-700">
				<div class="text-xs font-medium text-zinc-500 uppercase tracking-wide">Total Duration</div>
				<div class="text-2xl font-bold text-white mt-3">{formatDuration(sleepData.current.durationMins)}</div>
			</div>
		</div>
	{:else}
		<!-- Empty state -->
		<div class="text-center py-8">
			<Moon size={32} class="mx-auto mb-4 text-zinc-500" />
			<div class="text-lg font-medium text-zinc-500">No Sleep Data</div>
			<p class="text-xs text-zinc-600 mt-2 mb-4">Track your sleep to see patterns</p>
			<Button
				variant="primary"
				size="sm"
				onclick={handleEdit}
			>
				Log Sleep
			</Button>
		</div>
	{/if}
</Panel>