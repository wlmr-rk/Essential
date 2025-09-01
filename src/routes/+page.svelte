<!-- src/routes/+page.svelte -->
<script lang="ts">
	// No authentication needed - single user setup
</script>

<svelte:head>
	<title>QSelf Dashboard - Track Your Life</title>
</svelte:head>

<!-- This page will be handled by the auth layout -->
<div class="min-h-screen bg-black flex items-center justify-center">
	<div class="text-center">
		<h1 class="text-4xl font-bold cyber-text-primary mb-4">ARASAKA</h1>
		<p class="text-gray-400 mb-8">Neural Interface Loading...</p>
		<div class="animate-spin h-8 w-8 border border-primary border-t-transparent rounded-full mx-auto"></div>
	</div>
</div>
