<script lang="ts">
  import '../app.css';
  

  let { data, children } = $props();

  const session = $derived(data.session);
</script>

<svelte:head />

  <div class="min-h-screen bg-black text-white">
    <main class="container mx-auto max-w-6xl p-6">
      {@render children?.()}
    </main>
  </div>
