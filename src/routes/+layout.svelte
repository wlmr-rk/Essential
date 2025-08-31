<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head />

<!-- Layout shell with a simple navbar -->
<div class="min-h-screen bg-base-200 text-base-content">
	<main class="container mx-auto max-w-2xl p-6">
		<svelte:boundary>
			{@render children?.()}

			{#snippet pending()}
				<!-- Pending state: centered spinner + optional skeleton -->
				<section class="flex min-h-[60vh] flex-col items-center justify-center gap-4">
					<div class="w-full space-y-3 rounded-box bg-base-100 p-4">
						<div class="h-8 w-1/3 skeleton"></div>
						<div class="h-12 w-full skeleton"></div>
						<div class="h-12 w-full skeleton"></div>
						<div class="h-12 w-2/3 skeleton"></div>
					</div>
				</section>
			{/snippet}

			{#snippet failed(err)}
				<!-- Failed state: alert-error with retry -->
				<section class="min-h-[40vh]">
					<div class="alert alert-error">
						<span>
							<span class="font-semibold">Something went wrong.</span>
							{#if err?.message}
								<span class="ml-1 opacity-80">{err.message}</span>
							{/if}
						</span>
					</div>
				</section>
			{/snippet}
		</svelte:boundary>
	</main>
</div>
