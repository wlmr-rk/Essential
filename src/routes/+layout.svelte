<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import '../app.css';
  import Login from '$lib/components/Login.svelte';
  import { getSession } from './login.remote';

  let { children } = $props();

  // Remote query — starts immediately and is cached while used
  const session = getSession();
</script>

<svelte:head />

{#if session.error}
  <!-- Error state -->
  <div class="min-h-screen bg-black flex items-center justify-center">
    <div class="cyber-card p-6 rounded">
      <p class="cyber-text-secondary">
        Authentication Error:
        {typeof session.error === 'object' &&
        session.error !== null &&
        'message' in session.error
          ? String(session.error.message)
          : String(session.error ?? 'Unknown error')}
      </p>
    </div>
  </div>
{:else if session.loading}
  <!-- Loading state -->
  <div class="min-h-screen bg-black flex items-center justify-center">
    <div
      class="animate-spin h-8 w-8 border border-primary border-t-transparent rounded-full"
    ></div>
  </div>
{:else}
  {#if !session.current?.session}
    <!-- Not authenticated - show login -->
    <Login />
  {:else}
    <!-- Authenticated - show app -->
    <div class="min-h-screen bg-black text-white">
      <main class="container mx-auto max-w-6xl p-6">
        <svelte:boundary>
          {@render children?.()}

          {#snippet pending()}
            <!-- Pending state: minimal loading -->
            <section
              class="flex min-h-[60vh] flex-col items-center justify-center gap-4"
            >
              <div
                class="animate-spin h-8 w-8 border border-primary border-t-transparent rounded-full"
              ></div>
            </section>
          {/snippet}

          {#snippet failed(err, reset)}
            <!-- Failed state: minimal error with retry -->
            <section class="min-h-[40vh] flex items-center justify-center">
              <div class="cyber-card p-6 rounded">
                <p class="cyber-text-secondary">
                  System Error
                  {#if err && typeof err === 'object' && 'message' in err}
                    : {String(err.message)}
                  {/if}
                </p>
                <button
                  class="mt-3 text-xs underline underline-offset-2 hover:opacity-80"
                  onclick={reset}
                >
                  Retry
                </button>
              </div>
            </section>
          {/snippet}
        </svelte:boundary>
      </main>
    </div>
  {/if}
{/if}
