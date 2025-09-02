<!-- src/lib/components/ui/Heatmap.svelte -->
<script lang="ts">
  import {
    getHistoricalScores,
    type HeatmapData,
    type HistoricalScore,
  } from '../../../routes/historical-scores.remote.js';
  import { getTodayLocalDate } from '$lib/time/index.js';
  import { Temporal } from '@js-temporal/polyfill';

  interface Props {
    days?: number;
  }

  let { days = 60 }: Props = $props();

  // Calculate date range using timezone-aware utilities
  const today = getTodayLocalDate();
  const startDate = Temporal.PlainDate.from(today)
    .subtract({ days: days - 1 })
    .toString();

  // Fetch historical data using the new remote function
  const historicalData = getHistoricalScores({ startDate, endDate: today });

  // Generate grid layout information
  function generateGridInfo(scores: HistoricalScore[]) {
    const todayDate = getTodayLocalDate();

    return scores.map((score) => {
      const scoreDate = Temporal.PlainDate.from(score.localDate);
      const todayObj = Temporal.PlainDate.from(todayDate);
      const comparison = Temporal.PlainDate.compare(scoreDate, todayObj);

      return {
        ...score,
        isToday: comparison === 0,
        isPast: comparison < 0,
        isFuture: comparison > 0,
        dayOfMonth: scoreDate.day,
        monthName: scoreDate.toLocaleString('en-US', { month: 'short' }),
      };
    });
  }

  // Get color based on score with premium color scheme
  function getScoreColor(
    score: number,
    hasData: boolean,
    isFuture: boolean,
  ): string {
    if (isFuture) return 'heatmap-future';
    if (!hasData) return 'heatmap-no-data';

    // Premium color scale based on score
    if (score >= 90) return 'heatmap-excellent';
    if (score >= 75) return 'heatmap-good';
    if (score >= 50) return 'heatmap-fair';
    if (score >= 25) return 'heatmap-poor';
    return 'heatmap-very-poor';
  }

  // Get intensity for CSS custom property (0-1 scale)
  function getIntensity(score: number, hasData: boolean): number {
    if (!hasData) return 0;
    return Math.max(0.1, score / 100); // Minimum 0.1 for visibility
  }

  // Format tooltip text
  function formatTooltip(
    gridItem: ReturnType<typeof generateGridInfo>[0],
  ): string {
    if (gridItem.isFuture) return `${gridItem.localDate}: Future`;
    if (!gridItem.hasData) return `${gridItem.localDate}: No data`;

    const breakdown = gridItem.breakdown;
    return `${gridItem.localDate}: ${gridItem.totalScore}/100
Sleep: ${breakdown.sleep}/100
Habits: ${breakdown.habits}/100  
Mood: ${breakdown.mood}/100
Workouts: ${breakdown.workouts}/100`;
  }
</script>

<div class="heatmap-container">
  {#await historicalData}
    <!-- Elegant loading state -->
    <div class="heatmap-loading">
      <div class="flex items-center justify-between mb-4">
        <div
          class="h-5 rounded animate-pulse w-32"
          style="background-color: var(--color-gray-700)"
        ></div>
        <div class="flex items-center gap-2">
          <div
            class="h-3 rounded animate-pulse w-8"
            style="background-color: var(--color-gray-700)"
          ></div>
          <div class="flex gap-1">
            {#each Array(4) as _}
              <div
                class="w-2 h-2 rounded-sm animate-pulse"
                style="background-color: var(--color-gray-700)"
              ></div>
            {/each}
          </div>
          <div
            class="h-3 rounded animate-pulse w-8"
            style="background-color: var(--color-gray-700)"
          ></div>
        </div>
      </div>

      <div class="heatmap-grid">
        {#each Array(days) as _}
          <div class="heatmap-cell heatmap-skeleton"></div>
        {/each}
      </div>

      <div class="mt-3 text-center">
        <div
          class="h-3 rounded animate-pulse w-20 mx-auto"
          style="background-color: var(--color-gray-700)"
        ></div>
      </div>
    </div>
  {:then data}
    {@const gridItems = generateGridInfo(data.scores)}

    <div class="heatmap-content">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-white">Activity Heatmap</h3>
        <div class="heatmap-legend">
          <span class="text-xs" style="color: var(--color-gray-400)">Less</span>
          <div class="legend-scale">
            {#each [0, 0.25, 0.5, 0.75, 1] as intensity}
              <div class="legend-cell" style="--intensity: {intensity}"></div>
            {/each}
          </div>
          <span class="text-xs" style="color: var(--color-gray-400)">More</span>
        </div>
      </div>

      <div class="heatmap-grid">
        {#each gridItems as gridItem}
          <div
            class="heatmap-cell {getScoreColor(gridItem.totalScore, gridItem.hasData, gridItem.isFuture)}"
            class:heatmap-today={gridItem.isToday}
            style="--intensity: {getIntensity(gridItem.totalScore, gridItem.hasData)}"
            title={formatTooltip(gridItem)}
          ></div>
        {/each}
      </div>

      <div class="mt-3 text-center">
        <p class="text-xs" style="color: var(--color-gray-400)">
          Last {days} days • {data.scores.filter((s) => s.hasData).length} days
          with data
        </p>
      </div>
    </div>
  {:catch error}
    <!-- Graceful error state -->
    <div class="heatmap-error">
      <div class="text-center space-y-3">
        <div class="text-red-400">
          <svg
            class="w-8 h-8 mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
        </div>
        <p class="text-sm" style="color: var(--color-gray-300)">
          Failed to load heatmap data
        </p>
        <p class="text-xs" style="color: var(--color-gray-400)">{error.message}</p>
        <button
          class="text-xs text-blue-400 hover:text-blue-300 hover:underline transition-colors"
          onclick={() => location.reload()}
        >
          Retry
        </button>
      </div>
    </div>
  {/await}
</div>

<style>
  /*
    Tailwind v4 + Svelte: style blocks are processed in isolation.
    Using @apply here requires a reference to your main Tailwind CSS entry.
    Fix build error "Cannot apply unknown utility class `w-6`" by:
    - Replacing @apply w-6 h-6 with plain CSS (rem values) for this small override, OR
    - Adding @reference to your global Tailwind CSS file.
    We'll do the simplest: remove @apply and use raw sizes.
  */

  /* If you rely on @apply elsewhere in this block, uncomment this line and point it
     to your global Tailwind entry (e.g., src/app.css) that contains `@import "tailwindcss";`
     This makes Tailwind utilities visible to this isolated stylesheet.
     @reference "../../app.css";
  */

  .heatmap-container {
    background-color: var(--color-gray-900);
    border: 1px solid var(--color-gray-800);
    border-radius: 0.75rem;
    padding: 1.5rem;
  }

  .heatmap-loading,
  .heatmap-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .heatmap-grid {
    display: grid;
    grid-template-columns: repeat(10, 1fr);
    gap: 2px;
    max-width: 320px;
    margin: 0 auto;
  }

  .heatmap-cell {
    width: 1.75rem;
    height: 1.75rem;
    border-radius: 0.25rem;
    transition: all 150ms ease;
    cursor: pointer;
    aspect-ratio: 1;
  }

  .heatmap-cell:hover {
    transform: scale(1.1);
    box-shadow: 0 0 0 2px var(--color-gray-400),
      0 0 0 3px var(--color-gray-900);
    z-index: 10;
  }

  /* Dark mode premium color scheme */
  .heatmap-future {
    background-color: var(--color-gray-800);
    border: 1px solid var(--color-gray-700);
  }

  .heatmap-no-data {
    background-color: var(--color-gray-800);
    opacity: 0.5;
    border: 1px solid var(--color-gray-700);
  }

  .heatmap-very-poor {
    background-color: hsl(0, 60%, calc(25% + var(--intensity) * 25%));
  }

  .heatmap-poor {
    background-color: hsl(25, 60%, calc(25% + var(--intensity) * 25%));
  }

  .heatmap-fair {
    background-color: hsl(45, 60%, calc(25% + var(--intensity) * 25%));
  }

  .heatmap-good {
    background-color: hsl(120, 60%, calc(25% + var(--intensity) * 25%));
  }

  .heatmap-excellent {
    background-color: hsl(142, 60%, calc(25% + var(--intensity) * 25%));
  }

  .heatmap-today {
    box-shadow: 0 0 0 2px #60a5fa, 0 0 0 3px var(--color-gray-900);
  }

  .heatmap-skeleton {
    background-color: var(--color-gray-700);
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  .heatmap-legend {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .legend-scale {
    display: flex;
    gap: 0.25rem;
  }

  .legend-cell {
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 0.125rem;
    background-color: hsl(
      142,
      calc(var(--intensity) * 60%),
      calc(25% + var(--intensity) * 25%)
    );
  }

  .heatmap-error {
    background-color: #450a0a;
    border: 1px solid #991b1b;
    border-radius: 0.5rem;
    padding: 1.5rem;
  }

  /* Responsive adjustments */
  @media (max-width: 640px) {
    .heatmap-grid {
      grid-template-columns: repeat(8, 1fr);
      max-width: 280px;
    }

    /* Replace Tailwind @apply w-6 h-6 to avoid v4 @reference requirement */
    .heatmap-cell {
      width: 1.5rem; /* w-6 */
      height: 1.5rem; /* h-6 */
    }
  }
</style>