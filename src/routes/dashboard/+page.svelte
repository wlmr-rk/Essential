<!-- src/routes/dashboard/+page.svelte -->
<script lang="ts">
	import SleepCard from '$lib/components/SleepCard.svelte';
	import HabitsCard from '$lib/components/HabitsCard.svelte';
	import MoodCard from '$lib/components/MoodCard.svelte';
	import WorkoutsCard from '$lib/components/WorkoutsCard.svelte';
	import Heatmap from '$lib/components/ui/Heatmap.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { getDayScore } from '../day-score.remote.js';
	import { getTodayLocalDate } from '$lib/time/index.js';
	import { signOut } from '$lib/stores/auth';
	import { LogOut, Power, TrendingUp } from '@lucide/svelte';
	
	// Get current date for display
	const today = getTodayLocalDate();
	
	// Get today's score
	const dayScoreData = getDayScore({ localDate: today });
</script>

<svelte:head>
	<title>QSelf Dashboard</title>
</svelte:head>

<div class="min-h-screen bg-black relative overflow-hidden">
	<!-- Background Effects -->
	<div class="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
	<div class="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(0,255,159,0.05),transparent_50%)]"></div>
	<div class="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(0,212,255,0.05),transparent_50%)]"></div>
	
	<!-- Grid Pattern -->
	<div class="absolute inset-0 opacity-10">
		<div class="absolute inset-0" style="background-image: linear-gradient(rgba(0,255,159,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,159,0.1) 1px, transparent 1px); background-size: 100px 100px;"></div>
	</div>
	
	<div class="relative z-10 p-6 space-y-6">
		<!-- Header with compact score -->
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-4">
				<div class="w-10 h-10 bg-gradient-to-br from-green-400 to-cyan-400 rounded-lg flex items-center justify-center">
					<TrendingUp size={20} class="text-black" />
				</div>
				<div>
					<h1 class="arasaka-title text-2xl">QSelf Dashboard</h1>
					<p class="arasaka-label">Personal Wellness Tracking</p>
				</div>
			</div>
			
			<div class="flex items-center gap-4">
				<!-- Compact Daily Score -->
				{#if dayScoreData.current}
					<div class="arasaka-panel px-4 py-2">
						<div class="flex items-center gap-3">
							<div class="text-center">
								<div class="arasaka-value text-lg cyber-text-primary">
									{Math.round(dayScoreData.current.total)}
								</div>
								<div class="arasaka-label text-xs">Today</div>
							</div>
						</div>
					</div>
				{/if}
				
				<Button
					variant="danger"
					size="sm"
					icon={Power}
					iconOnly
					onclick={signOut}
				/>
			</div>
		</div>

		<!-- Bento Grid Layout -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 auto-rows-min">
			<!-- Sleep Card - spans 2 columns -->
			<div class="lg:col-span-2">
				<SleepCard localDate={today} />
			</div>
			
			<!-- Mood Card - compact, 1 column -->
			<div class="lg:col-span-1">
				<MoodCard localDate={today} />
			</div>
			
			<!-- Workouts Card - compact, 1 column -->
			<div class="lg:col-span-1">
				<WorkoutsCard localDate={today} />
			</div>
			
			<!-- Habits Card - spans 2 columns -->
			<div class="lg:col-span-2">
				<HabitsCard localDate={today} />
			</div>
			
			<!-- Heatmap - spans full width on large screens -->
			<div class="lg:col-span-4 xl:col-span-6">
				<Heatmap />
			</div>
		</div>
		
		<!-- Status Bar -->
		<div class="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-lg border-t border-gray-800 p-4">
			<div class="flex items-center justify-between max-w-7xl mx-auto">
				<div class="flex items-center gap-4">
					<div class="flex items-center gap-2">
						<div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
						<span class="arasaka-label">System Online</span>
					</div>
					<div class="h-4 w-px bg-gray-700"></div>
					<span class="arasaka-label">
						{new Date().toLocaleDateString('en-US', { 
							weekday: 'long',
							year: 'numeric', 
							month: 'long', 
							day: 'numeric' 
						})}
					</span>
				</div>
				
				<div class="flex items-center gap-2">
					<span class="arasaka-label">ARASAKA CORP</span>
					<div class="w-1 h-1 bg-green-400 rounded-full"></div>
				</div>
			</div>
		</div>
	</div>
</div>
