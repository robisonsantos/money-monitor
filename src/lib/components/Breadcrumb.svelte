<script lang="ts">
  import { page } from "$app/stores";
  import { ChevronRight, Home, Plus, Folder, AlertCircle } from "lucide-svelte";
  import type { Portfolio } from "$lib/database";

  interface Props {
    selectedPortfolio?: Portfolio | null;
  }

  let { selectedPortfolio }: Props = $props();
</script>

<nav class="flex mb-4 sm:mb-6" aria-label="Breadcrumb">
  <ol class="inline-flex items-center space-x-1 md:space-x-3 text-sm">
    <!-- Dashboard link -->
    <li class="inline-flex items-center">
      {#if $page.url.pathname === "/dashboard" && !selectedPortfolio}
        <span class="inline-flex items-center space-x-1 font-medium text-gray-500">
          <Home class="w-4 h-4" />
          <span>Dashboard</span>
        </span>
      {:else}
        <a
          href="/dashboard"
          class="inline-flex items-center space-x-1 font-medium text-gray-700 hover:text-blue-600 transition-colors"
        >
          <Home class="w-4 h-4" />
          <span>Dashboard</span>
        </a>
      {/if}
    </li>

    <!-- Portfolio context -->
    {#if selectedPortfolio}
      <li class="inline-flex items-center">
        <ChevronRight class="w-4 h-4 text-gray-400 mx-1 md:mx-2" />
        {#if $page.url.pathname === "/dashboard"}
          <span class="inline-flex items-center space-x-1 font-medium text-gray-500">
            <Folder class="w-4 h-4 text-blue-600" />
            <div class="flex flex-col">
              <span>{selectedPortfolio.name}</span>
            </div>
          </span>
        {:else}
          <a
            href="/dashboard"
            class="inline-flex items-center space-x-1 font-medium text-gray-700 hover:text-blue-600 transition-colors"
          >
            <Folder class="w-4 h-4 text-blue-600" />
            <div class="flex flex-col">
              <span>{selectedPortfolio.name}</span>
            </div>
          </a>
        {/if}
      </li>
    {:else if $page.url.pathname !== "/dashboard"}
      <!-- Show warning when on sub-pages without portfolio -->
      <li class="inline-flex items-center">
        <ChevronRight class="w-4 h-4 text-gray-400 mx-1 md:mx-2" />
        <span class="inline-flex items-center space-x-1 font-medium text-amber-600">
          <AlertCircle class="w-4 h-4" />
          <div class="flex flex-col">
            <span>No Portfolio Selected</span>
            <span class="text-xs text-amber-500 hidden sm:block">Select a portfolio to continue</span>
          </div>
        </span>
      </li>
    {/if}

    <!-- Add Entry page -->
    {#if $page.url.pathname === "/dashboard/add"}
      <li class="inline-flex items-center">
        <ChevronRight class="w-4 h-4 text-gray-400 mx-1 md:mx-2" />
        <span class="inline-flex items-center space-x-1 font-medium text-gray-500">
          <Plus class="w-4 h-4" />
          <div class="flex flex-col">
            <span>Add Entry</span>
          </div>
        </span>
      </li>
    {/if}
  </ol>
</nav>
