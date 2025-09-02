<!-- src/lib/components/Login.svelte -->
<script lang="ts">
  import { Github } from '@lucide/svelte';
  import Button from './ui/Button.svelte';
  import { signInWithGithub } from '../../routes/login.remote';

  let isLoading = $state(false);
  let error = $state('');

  async function signInWithGitHub() {
    try {
      isLoading = true;
      error = '';
      const res = await signInWithGithub({ redirectPath: '/dashboard' });
      if (!res?.ok || !res.url) {
        error = res?.error ?? 'Authentication failed to start';
        return;
      }
      location.assign(res.url);
    } catch (e) {
      console.error(e);
      error = 'Authentication failed';
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
  <!-- Background Effects -->
  <div class="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
  <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,159,0.1),transparent_50%)]"></div>

  <!-- Grid Pattern -->
  <div class="absolute inset-0 opacity-20">
    <div
      class="absolute inset-0"
      style="background-image: linear-gradient(rgba(0,255,159,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,159,0.1) 1px, transparent 1px); background-size: 50px 50px;"
    ></div>
  </div>

  <div class="arasaka-panel max-w-md w-full mx-4 relative z-10">
    <div class="p-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="mb-4">
          <div
            class="w-16 h-16 mx-auto bg-gradient-to-br from-green-400 to-cyan-400 rounded-lg flex items-center justify-center mb-4"
          >
            <div class="w-8 h-8 bg-black rounded transform rotate-45"></div>
          </div>
        </div>
        <h1 class="arasaka-title text-3xl mb-2">ARASAKA</h1>
        <p class="arasaka-label">Neural Interface Access Protocol</p>
        <div class="mt-4 h-px bg-gradient-to-r from-transparent via-green-400 to-transparent opacity-30"></div>
      </div>

      <!-- Error Display -->
      {#if error}
        <div class="mb-6 p-4 rounded-lg border border-red-500/30 bg-red-500/10">
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
            <p class="cyber-text-secondary text-sm font-medium">ACCESS DENIED</p>
          </div>
          <p class="text-red-300 text-sm mt-1">{error}</p>
        </div>
      {/if}

      <!-- Authentication Button -->
      <div class="space-y-4">
        <Button
          variant="primary"
          size="lg"
          loading={isLoading}
          icon={Github}
          onclick={signInWithGitHub}
        >
          {#if isLoading}
            Establishing Connection...
          {:else}
            Authenticate via GitHub
          {/if}
        </Button>

        <!-- Security Notice -->
        <div class="text-center pt-4 border-t border-gray-800">
          <div class="flex items-center justify-center gap-2 mb-2">
            <div class="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
            <span class="arasaka-label">Secure OAuth 2.0 Protocol</span>
            <div class="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          <p class="text-xs text-gray-500">Encrypted end-to-end authentication</p>
        </div>
      </div>
    </div>
  </div>
</div>
