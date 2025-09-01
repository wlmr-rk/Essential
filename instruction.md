# QSelf Dashboard Implementation Prompt

You are an expert SvelteKit developer implementing a quantified-self dashboard using SvelteKit Remote Functions and optimistic UI patterns. Follow these patterns exactly:

## Project Requirements

Build a personal QSelf dashboard with these features:
- **Sleep tracking**: bedtime, wake time, duration scoring
- **Habit tracking**: weighted habits with daily completion
- **Mood logging**: 1-5 scale with score mapping
- **Workout presence**: running/calisthenics toggle
- **Day scoring**: weighted component breakdown (Sleep 30%, Habits 30%, Mood 20%, Workouts 20%)

## Technology Stack (EXACT)

- **Frontend**: SvelteKit 5 + TypeScript + Tailwind v4 + daisyUI v5
- **Backend**: Supabase (Postgres + Auth + RLS)  
- **DB Access**: Drizzle ORM (complex queries) + supabase-js (simple CRUD)
- **Time**: Temporal API with Asia/Manila timezone
- **Deploy**: Vercel (Node runtime)
- **Dev**: Bun for local development

## Required svelte.config.js Settings

```javascript
export default {
  compilerOptions: {
    experimental: {
      async: true  // Enable Async Svelte
    }
  },
  kit: {
    experimental: {
      remoteFunctions: true  // Enable Remote Functions
    }
  }
};
```

## Architecture Patterns (CRITICAL)

### 1. Remote Functions Pattern
```typescript
// routes/sleep.remote.ts
import { query, command } from '$app/server';
import { requireUser } from '$lib/server/auth';

export const getTodaySleep = query(async (event) => {
  const user = await requireUser(event);
  // Return sleep data or null
});

export const upsertSleep = command(schema, async (data, event) => {
  const user = await requireUser(event);
  const result = await db.insert(sleepLogs).values(data).onConflictDoUpdate();
  
  // Single-flight updates: refresh related queries on server
  getTodaySleep().refresh();
  getDayScore().refresh();
  
  return result;
});
```

### 2. Optimistic UI Pattern (USE NATIVE withOverride)
```svelte
<script lang="ts">
  import { getTodaySleep, upsertSleep } from './sleep.remote';
  
  const sleepData = getTodaySleep();
  let isEditing = $state(false);
  
  async function handleSave(newData) {
    try {
      // Native optimistic update with automatic rollback
      await upsertSleep(newData).updates(
        sleepData.withOverride(() => newData)
      );
      isEditing = false;
    } catch (e) {
      // Override automatically released - no manual rollback!
      showError('Failed to save');
    }
  }
</script>

<!-- Use sleepData.current for latest value -->
{#if sleepData.current}
  <div>Duration: {sleepData.current.duration}h</div>
{:else if sleepData.loading}
  <div class="skeleton">Loading...</div>
{:else}
  <button onclick={() => isEditing = true}>Add Sleep Data</button>
{/if}
```

### 3. Async Svelte + Boundary Pattern
```svelte
<!-- +layout.svelte -->
<svelte:boundary>
  {@render children()}
  
  {#snippet pending()}
    <div class="skeleton w-full h-32"></div>
  {/snippet}
  
  {#snippet failed(error)}
    <div class="alert alert-error">{error.message}</div>
  {/snippet}
</svelte:boundary>
```

## Database Schema (Drizzle + RLS)

```typescript
// src/lib/server/db/schema.ts
export const sleepLogs = pgTable('sleep_logs', {
  userId: text('user_id').notNull(),
  localDate: text('local_date').notNull(),
  sleepStartLocal: text('sleep_start_local').notNull(),
  wakeTimeLocal: text('wake_time_local').notNull(),
  sleepStartTs: timestamp('sleep_start_ts', { withTimezone: true }).notNull(),
  wakeTs: timestamp('wake_ts', { withTimezone: true }).notNull(),
  durationMins: integer('duration_mins').notNull(),
  // ... timestamps
}, (table) => ({
  userDateUnique: unique().on(table.userId, table.localDate)
}));

// Enable RLS on ALL tables:
-- SQL migration
ALTER TABLE "sleep_logs" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own sleep" ON "sleep_logs"
  FOR ALL TO authenticated 
  USING (auth.uid()::text = user_id);
```

## Component Structure

### Dashboard Page
```svelte
<!-- src/routes/+page.svelte -->
<script lang="ts">
  import SleepCard from '$lib/components/dashboard/SleepCard.svelte';
  import HabitsCard from '$lib/components/dashboard/HabitsCard.svelte';
  // ... other cards
  
  import { getTodayLocalDate } from '$lib/time/temporal';
  const today = getTodayLocalDate();
</script>

<div class="min-h-screen bg-base-200 p-8">
  <div class="mx-auto max-w-4xl space-y-6">
    <h1 class="text-4xl font-bold text-primary text-center">QSelf</h1>
    
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <!-- Each card handles its own async data loading -->
      <DayScoreCard {today} />
      <SleepCard {today} />
      <HabitsCard {today} />
      <MoodCard {today} />
      <WorkoutsCard {today} />
    </div>
  </div>
</div>
```

### Card Pattern (FOLLOW EXACTLY)
```svelte
<!-- src/lib/components/dashboard/SleepCard.svelte -->
<script lang="ts">
  import { getTodaySleep, upsertSleep } from '../../routes/sleep.remote';
  import { getDayScore } from '../../routes/score.remote';
  
  let { today }: { today: string } = $props();
  
  // Direct query calls - no state management needed
  const sleepData = getTodaySleep(today);
  const dayScore = getDayScore(today);
  
  let isEditing = $state(false);
  let sleepStart = $state('23:00');
  let wakeTime = $state('07:00');
  let error = $state<string | null>(null);
  
  async function handleSave() {
    if (!sleepStart || !wakeTime) return;
    
    const data = {
      localDate: today,
      sleepStartLocal: sleepStart,
      wakeTimeLocal: wakeTime
    };
    
    try {
      error = null;
      // Optimistic update with single-flight refresh
      await upsertSleep(data).updates(
        sleepData.withOverride(() => data),
        dayScore.withOverride((score) => ({ 
          ...score, 
          sleep: calculateOptimisticSleepScore(data)
        }))
      );
      isEditing = false;
    } catch (e) {
      error = e instanceof Error ? e.message : 'Save failed';
      // Overrides auto-released on error
    }
  }
  
  // Sync form with current data
  $effect(() => {
    if (sleepData.current) {
      sleepStart = sleepData.current.sleepStartLocal;
      wakeTime = sleepData.current.wakeTimeLocal;
    }
  });
</script>

<div class="card bg-base-100 shadow-sm">
  <div class="card-body">
    <h3 class="card-title">😴 Sleep</h3>
    
    {#if error}
      <div class="alert alert-error alert-sm">
        <span>{error}</span>
      </div>
    {/if}
    
    {#if isEditing}
      <!-- Edit form -->
      <div class="space-y-4">
        <div>
          <label class="label label-text">Sleep Start</label>
          <input 
            type="time" 
            bind:value={sleepStart}
            class="input input-sm input-bordered w-full"
          />
        </div>
        <div>
          <label class="label label-text">Wake Time</label>
          <input 
            type="time" 
            bind:value={wakeTime}
            class="input input-sm input-bordered w-full"
          />
        </div>
        <div class="flex gap-2">
          <button 
            class="btn btn-sm btn-primary" 
            onclick={handleSave}
            disabled={sleepData.loading}
          >
            {sleepData.loading ? 'Saving...' : 'Save'}
          </button>
          <button 
            class="btn btn-sm btn-ghost" 
            onclick={() => isEditing = false}
          >
            Cancel
          </button>
        </div>
      </div>
    {:else if sleepData.current}
      <!-- Display mode -->
      <div class="space-y-2">
        <div class="text-sm">
          <span class="text-base-content/60">Sleep:</span> 
          {sleepData.current.sleepStartLocal}
        </div>
        <div class="text-sm">
          <span class="text-base-content/60">Wake:</span> 
          {sleepData.current.wakeTimeLocal}
        </div>
        <div class="text-sm">
          <span class="text-base-content/60">Duration:</span> 
          {Math.floor(sleepData.current.durationMins / 60)}h {sleepData.current.durationMins % 60}m
        </div>
        <button 
          class="btn btn-sm btn-outline mt-2" 
          onclick={() => isEditing = true}
        >
          Edit
        </button>
      </div>
    {:else}
      <!-- Empty state -->
      <div class="text-center py-4">
        <p class="text-base-content/60 text-sm mb-2">No sleep data today</p>
        <button 
          class="btn btn-sm btn-primary" 
          onclick={() => isEditing = true}
        >
          Add Sleep Data
        </button>
      </div>
    {/if}
  </div>
</div>
```

## Critical Implementation Rules

### 1. Query Pattern
- Use `const data = getQuery()` - NOT `let data = $state(await getQuery())`
- Access latest value via `data.current`
- Check loading state via `data.loading`
- Each card owns its queries independently

### 2. Optimistic Updates  
- ALWAYS use `withOverride()` for optimistic updates
- Use `updates()` to refresh multiple queries in single-flight
- Never manually manage rollback - overrides auto-release on error

### 3. Error Handling
- Let `<svelte:boundary>` handle loading/error states globally
- Handle specific errors in components only when needed
- Use daisyUI alert classes for error display

### 4. Time Management
```typescript
// src/lib/time/temporal.ts
import { Temporal } from '@js-temporal/polyfill';

export const MANILA_TZ = 'Asia/Manila';

export function getTodayLocalDate(): string {
  return Temporal.Now.plainDateISO(MANILA_TZ).toString();
}

export function localTimeToInstant(localDate: string, localTime: string): Temporal.Instant {
  const plainDateTime = Temporal.PlainDateTime.from(`${localDate}T${localTime}`);
  return plainDateTime.toZonedDateTime(MANILA_TZ).toInstant();
}
```

### 5. Auth Pattern
```typescript
// src/lib/server/auth.ts
export async function requireUser(event: RequestEvent) {
  const supabase = createSupabaseServerClient(event);
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    throw error(401, 'Authentication required');
  }
  
  return user;
}
```

## Scoring Algorithm (Fixed Weights v1)

```typescript
// routes/score.remote.ts
export const getDayScore = query(async (localDate: string, event) => {
  const user = await requireUser(event);
  
  // Fetch all data in parallel
  const [sleep, habits, mood, workouts] = await Promise.all([
    getSleepScore(user.id, localDate),
    getHabitsScore(user.id, localDate), 
    getMoodScore(user.id, localDate),
    getWorkoutsScore(user.id, localDate)
  ]);
  
  const totalScore = Math.round(
    sleep * 0.3 + habits * 0.3 + mood * 0.2 + workouts * 0.2
  );
  
  return {
    total: totalScore,
    breakdown: { sleep, habits, mood, workouts },
    tips: generateTips({ sleep, habits, mood, workouts })
  };
});
```

## File Structure Template
```
src/
├── routes/
│   ├── +layout.svelte          # Boundary + global styles
│   ├── +page.svelte            # Dashboard with cards
│   ├── sleep.remote.ts         # Sleep remote functions
│   ├── habits.remote.ts        # Habits remote functions  
│   ├── mood.remote.ts          # Mood remote functions
│   ├── workouts.remote.ts      # Workouts remote functions
│   └── score.remote.ts         # Day scoring remote functions
├── lib/
│   ├── components/dashboard/   # Card components
│   ├── server/
│   │   ├── auth.ts            # requireUser helper
│   │   └── db/
│   │       ├── client.ts      # Drizzle client
│   │       └── schema.ts      # Table schemas
│   └── time/
│       └── temporal.ts        # Timezone helpers
```

Implement exactly as shown - this architecture provides optimal performance with minimal complexity using SvelteKit Remote Functions' native capabilities.