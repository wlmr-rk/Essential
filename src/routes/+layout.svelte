<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head />

<svelte:boundary>
	{@render children?.()}

	{#snippet pending()}
		<div class="min-h-screen bg-gray-900 p-8 text-gray-100">
			<div class="mx-auto max-w-2xl">
				<div class="py-8 text-center text-gray-400">
					<div class="loading loading-lg loading-spinner"></div>
					<p class="mt-4">Loading...</p>
				</div>
			</div>
		</div>
	{/snippet}

	{#snippet failed(err)}
		<div class="min-h-screen bg-gray-900 p-8 text-gray-100">
			<div class="mx-auto max-w-2xl">
				<div class="mb-4 rounded border border-red-500 bg-red-900/50 px-4 py-3 text-red-200">
					<h2 class="mb-2 text-xl font-semibold">Something went wrong</h2>
					<p>{err.message}</p>
					<button class="btn mt-3 btn-outline btn-sm" onclick={() => window.location.reload()}>
						Reload page
					</button>
				</div>
			</div>
		</div>
	{/snippet}
</svelte:boundary>
