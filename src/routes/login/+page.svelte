<script lang="ts">
  import { Github } from '@lucide/svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { enhance } from '$app/forms';

  let isLoading = false;
</script>

<div class="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
  <div class="arasaka-panel max-w-md w-full mx-4 relative z-10">
    <div class="p-8">
      <form method="POST" use:enhance={() => {
        isLoading = true;
        return async ({ update }) => {
          await update();
          isLoading = false;
        };
      }}>
        <Button
          variant="primary"
          size="lg"
          loading={isLoading}
          icon={Github}
          type="submit"
          aria-label="Authenticate via GitHub"
        >
          {#if isLoading}
            Establishing Connection...
          {:else}
            Authenticate via GitHub
          {/if}
        </Button>
      </form>
    </div>
  </div>
</div>
