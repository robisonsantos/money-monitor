<script lang="ts">
  import { page } from "$app/stores";
  import { ChevronRight, Home, Plus, Folder, AlertCircle, Edit3 } from "lucide-svelte";
  import type { Portfolio } from "$lib/database";

  interface Props {
    selectedPortfolio?: Portfolio | null;
  }

  let { selectedPortfolio }: Props = $props();

  // Check if we're in edit mode based on URL parameters
  let isEditMode = $derived(() => {
    return $page.url.pathname === "/dashboard/add" && $page.url.searchParams.has("edit");
  });
</script>

<nav class="flex mb-4 sm:mb-6" aria-label="Breadcrumb">
  <ol class="inline-flex items-center space-x-1 md:space-x-3 text-sm">
    <!-- Dashboard link -->
    <li class="inline-flex items-center">
      {#if $page.url.pathname === "/dashboard" && !selectedPortfolio}
        <span class="inline-flex items-center space-x-1 font-medium text-foreground-secondary">
          <Home class="w-4 h-4" />
          <span>Dashboard</span>
        </span>
      {:else}
        <a
          href="/dashboard"
          class="inline-flex items-center space-x-1 font-medium text-foreground-primary hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <Home class="w-4 h-4" />
          <span>Dashboard</span>
        </a>
      {/if}
    </li>

    <!-- Portfolio context -->
    {#if selectedPortfolio}
      <li class="inline-flex items-center">
        <ChevronRight class="w-4 h-4 text-foreground-tertiary mx-1 md:mx-2" />
        {#if $page.url.pathname === "/dashboard"}
          <span class="inline-flex items-center space-x-1 font-medium text-foreground-secondary">
            <Folder class="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <div class="flex flex-col">
              <span>{selectedPortfolio.name}</span>
            </div>
          </span>
        {:else}
          <a
            href="/dashboard"
            class="inline-flex items-center space-x-1 font-medium text-foreground-primary hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <Folder class="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <div class="flex flex-col">
              <span>{selectedPortfolio.name}</span>
            </div>
          </a>
        {/if}
      </li>
    {:else if $page.url.pathname !== "/dashboard"}
      <!-- Show warning when on sub-pages without portfolio -->
      <li class="inline-flex items-center">
        <ChevronRight class="w-4 h-4 text-foreground-tertiary mx-1 md:mx-2" />
        <span class="inline-flex items-center space-x-1 font-medium text-amber-600 dark:text-amber-400">
          <AlertCircle class="w-4 h-4" />
          <div class="flex flex-col">
            <span>No Portfolio Selected</span>
            <span class="text-xs text-amber-500 dark:text-amber-400 hidden sm:block"
              >Select a portfolio to continue</span
            >
          </div>
        </span>
      </li>
    {/if}

    <!-- Add/Edit Entry page -->
    {#if $page.url.pathname === "/dashboard/add"}
      <li class="inline-flex items-center">
        <ChevronRight class="w-4 h-4 text-foreground-tertiary mx-1 md:mx-2" />
        <span class="inline-flex items-center space-x-1 font-medium text-foreground-primary">
          {#if isEditMode()}
            <Edit3 class="w-4 h-4" />
          {:else}
            <Plus class="w-4 h-4" />
          {/if}
          <div class="flex flex-col">
            <span>{isEditMode() ? "Edit Entry" : "Add Entry"}</span>
          </div></span
        >
      </li>
    {/if}
  </ol>
</nav>
