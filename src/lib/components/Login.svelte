<!-- src/lib/components/Login.svelte -->
<script lang="ts">
  import { Github } from '@lucide/svelte';
  import Button from './ui/Button.svelte';
  import { signInWithGithub } from '../../routes/login.remote';

  let isLoading = $state(false);
  let error = $state<string | null>(null);

  async function handleSignIn() {
    if (isLoading) return; // guard against double clicks
    isLoading = true;
    error = null;

    try {
      const result = await signInWithGithub({ redirectPath: '/dashboard' });

      if (!result?.ok || !result.url) {
        error = result?.error ?? 'Authentication failed to start';
        return;
      }

      // Redirect to Supabase OAuth URL
      window.location.assign(result.url);
    } catch (e) {
      console.error('Sign-in error:', e);
      error = 'Authentication failed';
    } finally {
      isLoading = false;
    }
  }

  // Optional: capture render/effect-time errors inside the panel subtree.
  // Note: boundaries do NOT catch event-handler errors like in handleSignIn.
  function onBoundaryError(e: unknown, reset: () => void) {
    console.error('Boundary render error:', e);
    // keep UI usable; let user reset
    // you could also report to Sentry/etc here
  }
</script>

<div class="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
  <svelte:boundary onerror={onBoundaryError}>
    <div class="arasaka-panel max-w-md w-full mx-4 relative z-10">
      <div class="p-8">
        {#if error}
          <div class="mb-6 p-4 rounded-lg border border-red-500/30 bg-red-500/10">
            <p class="text-red-300 text-sm mt-1">{error}</p>
          </div>
        {/if}

        <div class="space-y-4">
          <Button
            variant="primary"
            size="lg"
            loading={isLoading}
            icon={Github}
            onclick={handleSignIn}
            aria-label="Authenticate via GitHub"
          >
            {#if isLoading}
              Establishing Connection...
            {:else}
              Authenticate via GitHub
            {/if}
          </Button>
        </div>
      </div>
    </div>

    {#snippet failed(err, reset)}
      <div class="max-w-md w-full mx-4 p-6 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300">
        <p class="text-sm font-medium">Something went wrong rendering this section.</p>
        <p class="text-xs opacity-80 mt-1">
          {(err as Error)?.message ?? 'Unknown error'}
        </p>
        <div class="mt-4">
          <button
            class="text-xs underline underline-offset-2 hover:opacity-80"
            onclick={reset}
          >
            Retry
          </button>
        </div>
      </div>
    {/snippet}
  </svelte:boundary>
</div>
