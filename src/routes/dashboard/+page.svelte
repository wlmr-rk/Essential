<!-- src/routes/dashboard/+page.svelte -->
<script lang="ts">
  import SleepCard from '$lib/components/SleepCard.svelte';
  import HabitsCard from '$lib/components/HabitsCard.svelte';
  import MoodCard from '$lib/components/MoodCard.svelte';
  import WorkoutsCard from '$lib/components/WorkoutsCard.svelte';
  import Heatmap from '$lib/components/ui/Heatmap.svelte';
  import ScoreTrend from '$lib/components/ui/ScoreTrend.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { getDashboardData } from '../dashboard.remote.js';
  import { getTodayLocalDate } from '$lib/time/index.js';
  import { Power, TrendingUp, RefreshCw } from '@lucide/svelte';
  import { signOut } from '../login.remote';
  import { calculateCompleteDayScore, type DayScoreInput } from '$lib/scoring.ts';

  // Get current date for display
  const today = getTodayLocalDate();

  // Get all dashboard data in one call
  let dashboardDataPromise = getDashboardData({ localDate: today });

  function refetchDashboardData() {
    dashboardDataPromise = getDashboardData({ localDate: today });
  }

  async function handleSignOut() {
    try {
      const result = await signOut({});

      // Even if signOut fails, force a reload to clear client state
      // because the source of truth is server cookies.
      if (!result?.ok) {
        console.error('Sign-out error:', result?.error);
      }

      // Redirect to home page
      window.location.href = '/';
    } catch (error) {
      console.error('Sign-out error:', error);
      // Force reload anyway
      window.location.href = '/';
    }
  }
</script>

<svelte:head>
  <title>QSelf - Personal Wellness Dashboard</title>
</svelte:head>

<div class="min-h-screen bg-zinc-950">
  {#await dashboardDataPromise}
    <div class="flex items-center justify-center h-screen">
      <p class="text-white">Loading dashboard...</p>
    </div>
  {:then data}
    {@const dayScoreInput: DayScoreInput = {
      sleepDurationMins: data.sleep?.durationMins,
      habits: data.habits?.habits,
      moodRating: data.mood?.rating,
      runningCompleted: data.workouts?.runningCompleted,
      calisthenicsCompleted: data.workouts?.calisthenicsCompleted
    }}
    {@const dayScore = calculateCompleteDayScore(dayScoreInput)}
    <div class="max-w-7xl mx-auto px-6 py-8 space-y-8">
      <!-- Header -->
      <header class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div
            class="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-teal-500 to-blue-500"
          >
            <TrendingUp size={24} class="text-white" />
          </div>
          <div>
            <h1 class="text-2xl font-semibold text-white leading-tight">QSelf</h1>
            <p class="text-base text-zinc-400">Personal wellness tracking</p>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <!-- Today's Score -->
          {#if dayScore}
            <div class="bg-zinc-900 border border-zinc-800 rounded-lg shadow-sm p-4">
              <div class="text-center">
                <div class="text-2xl font-bold text-white leading-tight">
                  {Math.round(dayScore.total)}
                </div>
                <div class="text-xs text-zinc-500">Today</div>
              </div>
            </div>
          {/if}

          <Button
            variant="ghost"
            size="sm"
            icon={Power}
            iconOnly
            onclick={handleSignOut}
          />
        </div>
      </header>

      <!-- Main Content Grid -->
      <main
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6 auto-rows-min"
      >
        <!-- Sleep Card - 2 columns -->
        <div class="md:col-span-2 lg:col-span-2">
          <SleepCard
            localDate={today}
            data={data.sleep}
            on:save={refetchDashboardData}
          />
        </div>

        <!-- Mood Card - 1 column -->
        <div class="md:col-span-1 lg:col-span-1">
          <MoodCard
            localDate={today}
            data={data.mood}
            on:save={refetchDashboardData}
          />
        </div>

        <!-- Workouts Card - 1 column -->
        <div class="md:col-span-1 lg:col-span-1">
          <WorkoutsCard
            localDate={today}
            data={data.workouts}
            on:save={refetchDashboardData}
          />
        </div>

        <!-- Habits Card - 2 columns -->
        <div class="md:col-span-2 lg:col-span-2 xl:col-span-2">
          <HabitsCard
            localDate={today}
            data={data.habits}
            on:save={refetchDashboardData}
          />
        </div>

        <!-- Heatmap - 2 columns -->
        <div class="md:col-span-2 lg:col-span-2 xl:col-span-2">
          <Heatmap />
        </div>

        <!-- Score Trend - 2 columns -->
        <div class="md:col-span-2 lg:col-span-2 xl:col-span-2">
          <ScoreTrend days={30} component="total" />
        </div>
      </main>
    </div>
  {:catch error}
    <div class="flex flex-col items-center justify-center h-screen">
      <p class="text-white text-lg mb-4">Error loading dashboard</p>
      <p class="text-red-400 mb-6">{error.message}</p>
      <Button variant="primary" onclick={refetchDashboardData} icon={RefreshCw}>
        Try Again
      </Button>
    </div>
  {/await}
</div>
