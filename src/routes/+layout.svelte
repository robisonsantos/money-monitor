<script lang="ts">
  import "../app.css";
  import { onMount } from "svelte";
  import { themeStore } from "$lib/stores/theme";

  // Initialize theme on app start
  onMount(() => {
    const cleanup = themeStore.initialize();
    return cleanup;
  });
</script>

<!-- Root layout - no navigation here since landing page and dashboard have their own layouts -->
<slot />
