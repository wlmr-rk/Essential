<!-- src/routes/dashboard/+page.svelte -->
<script lang="ts">
  import SleepCard from '$lib/components/SleepCard.svelte';
  import HabitsCard from '$lib/components/HabitsCard.svelte';
  import MoodCard from '$lib/components/MoodCard.svelte';
  import WorkoutsCard from '$lib/components/WorkoutsCard.svelte';
  import Heatmap from '$lib/components/ui/Heatmap.svelte';
  import ScoreTrend from '$lib/components/ui/ScoreTrend.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { getDayScore } from '../day-score.remote.js';
  import { getTodayLocalDate } from '$lib/time/index.js';
  import { Power, TrendingUp } from '@lucide/svelte';
  import { signOut } from '../login.remote.js';

  // Get current date for display
  const today = getTodayLocalDate();

  // Get today's score
  const dayScoreData = getDayScore({ localDate: today });

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
        {#await dayScoreData then score}
          {#if score?.current}
            <div class="bg-zinc-900 border border-zinc-800 rounded-lg shadow-sm p-4">
              <div class="text-center">
                <div class="text-2xl font-bold text-white leading-tight">
                  {Math.round(score.current.total)}
                </div>
                <div class="text-xs text-zinc-500">Today</div>
              </div>
            </div>
          {/if}
        {/await}

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
        <SleepCard localDate={today} />
      </div>

      <!-- Mood Card - 1 column -->
      <div class="md:col-span-1 lg:col-span-1">
        <MoodCard localDate={today} />
      </div>

      <!-- Workouts Card - 1 column -->
      <div class="md:col-span-1 lg:col-span-1">
        <WorkoutsCard localDate={today} />
      </div>

      <!-- Habits Card - 2 columns -->
      <div class="md:col-span-2 lg:col-span-2 xl:col-span-2">
        <HabitsCard localDate={today} />
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
</div>
