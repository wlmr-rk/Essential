<script lang="ts">
	import '../app.css';
	import { user, loading } from '$lib/stores/auth';
	import Login from '$lib/components/Login.svelte';

	let { children } = $props();
</script>

<svelte:head />

{#if $loading}
	<!-- Loading state -->
	<div class="min-h-screen bg-black flex items-center justify-center">
		<div class="animate-spin h-8 w-8 border border-primary border-t-transparent rounded-full"></div>
	</div>
{:else if !$user}
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
					<section class="flex min-h-[60vh] flex-col items-center justify-center gap-4">
						<div class="animate-spin h-8 w-8 border border-primary border-t-transparent rounded-full"></div>
					</section>
				{/snippet}

				{#snippet failed(err)}
					<!-- Failed state: minimal error -->
					<section class="min-h-[40vh] flex items-center justify-center">
						<div class="cyber-card p-6 rounded">
							<p class="cyber-text-secondary">
								System Error
								{#if err && typeof err === 'object' && 'message' in err}
									: {String(err.message)}
								{/if}
							</p>
						</div>
					</section>
				{/snippet}
			</svelte:boundary>
		</main>
	</div>
{/if}