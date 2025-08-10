<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { ChevronDown, Plus, Edit3, Trash2, Folder, Settings } from "lucide-svelte";
  import type { Portfolio } from "$lib/database";

  interface Props {
    portfolios: Portfolio[];
    selectedPortfolio: Portfolio | null;
    isLoading?: boolean;
    disabled?: boolean;
  }

  let { portfolios, selectedPortfolio, isLoading = false, disabled = false }: Props = $props();

  const dispatch = createEventDispatcher<{
    select: Portfolio;
    create: { name: string };
    rename: { portfolio: Portfolio; newName: string };
    delete: Portfolio;
  }>();

  let isDropdownOpen = $state(false);
  let isCreating = $state(false);
  let isRenaming = $state<Portfolio | null>(null);
  let newPortfolioName = $state("");
  let renameValue = $state("");
  let dropdownElement: HTMLDivElement;

  // Close dropdown when clicking outside
  function handleClickOutside(event: MouseEvent) {
    if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
      isDropdownOpen = false;
      if (!isCreating && !isRenaming) {
        isCreating = false;
        isRenaming = null;
      }
    }
  }

  function selectPortfolio(portfolio: Portfolio) {
    if (disabled) return;
    dispatch("select", portfolio);
    isDropdownOpen = false;
  }

  function startCreating() {
    if (disabled) return;
    isCreating = true;
    newPortfolioName = "";
    isRenaming = null;

    // Focus input after DOM update
    setTimeout(() => {
      const input = dropdownElement.querySelector("#new-portfolio-input") as HTMLInputElement;
      input?.focus();
    }, 0);
  }

  function createPortfolio() {
    const trimmedName = newPortfolioName.trim();
    if (!trimmedName) return;

    dispatch("create", { name: trimmedName });
    isCreating = false;
    newPortfolioName = "";
  }

  function startRenaming(portfolio: Portfolio) {
    if (disabled) return;
    isRenaming = portfolio;
    renameValue = portfolio.name;
    isCreating = false;

    // Focus input after DOM update
    setTimeout(() => {
      const input = dropdownElement.querySelector("#rename-input") as HTMLInputElement;
      input?.focus();
      input?.select();
    }, 0);
  }

  function saveRename() {
    if (!isRenaming) return;

    const trimmedName = renameValue.trim();
    if (!trimmedName || trimmedName === isRenaming.name) {
      isRenaming = null;
      return;
    }

    dispatch("rename", { portfolio: isRenaming, newName: trimmedName });
    isRenaming = null;
  }

  function deletePortfolio(portfolio: Portfolio) {
    if (disabled) return;

    if (confirm(`Are you sure you want to delete "${portfolio.name}"? This action cannot be undone.`)) {
      dispatch("delete", portfolio);
    }
    isDropdownOpen = false;
  }

  function handleKeydown(event: KeyboardEvent, action: "create" | "rename") {
    if (event.key === "Enter") {
      event.preventDefault();
      if (action === "create") {
        createPortfolio();
      } else {
        saveRename();
      }
    } else if (event.key === "Escape") {
      if (action === "create") {
        isCreating = false;
        newPortfolioName = "";
      } else {
        isRenaming = null;
      }
    }
  }
</script>

<svelte:window on:click={handleClickOutside} />

<div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
  <!-- Portfolio Title & Selector -->
  <div class="flex-shrink-0 relative" bind:this={dropdownElement}>
    <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
      <!-- Portfolio Name as Main Title with Dropdown -->
      {#if isLoading}
        <div class="animate-pulse">
          <div class="h-8 lg:h-10 bg-gray-200 rounded w-64"></div>
        </div>
      {:else if selectedPortfolio}
        <button
          onclick={() => !disabled && (isDropdownOpen = !isDropdownOpen)}
          class="group flex items-center gap-3 px-4 py-3 text-2xl lg:text-3xl font-bold text-gray-900 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200 {disabled
            ? 'opacity-50 cursor-not-allowed'
            : 'cursor-pointer'}"
          class:bg-blue-50={isDropdownOpen}
          class:text-blue-700={isDropdownOpen}
          {disabled}
        >
          <Folder class="w-6 h-6 lg:w-7 lg:h-7 text-blue-600 flex-shrink-0" />
          <span class="truncate max-w-[250px] sm:max-w-[400px] lg:max-w-[500px]">{selectedPortfolio.name}</span>
          <ChevronDown
            class="w-5 h-5 text-blue-500 transition-transform duration-200 {isDropdownOpen ? 'rotate-180' : ''}"
          />
        </button>
      {:else}
        <button
          onclick={() => !disabled && (isDropdownOpen = !isDropdownOpen)}
          class="flex items-center gap-3 px-4 py-3 text-2xl lg:text-3xl font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200 {disabled
            ? 'opacity-50 cursor-not-allowed'
            : 'cursor-pointer'}"
          {disabled}
        >
          <Folder class="w-6 h-6 lg:w-7 lg:h-7" />
          <span>Select Portfolio</span>
          <ChevronDown class="w-5 h-5 transition-transform duration-200 {isDropdownOpen ? 'rotate-180' : ''}" />
        </button>
      {/if}
    </div>

    <!-- Portfolio Description -->
    <p class="text-gray-600 mt-2 ml-0">
      {#if selectedPortfolio}
        Investment Dashboard - Track your portfolio performance over time
      {:else}
        Investment Dashboard - Select a portfolio to get started
      {/if}
    </p>

    <!-- Dropdown Menu -->
    {#if isDropdownOpen}
      <div
        class="absolute z-50 w-full min-w-[300px] mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-80 overflow-y-auto"
        style="top: 100%;"
      >
        <div class="py-2">
          <!-- Header -->
          <div class="px-4 py-2 border-b border-gray-100">
            <h3 class="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Settings class="w-4 h-4" />
              Portfolio Management
            </h3>
          </div>

          <!-- Existing portfolios -->
          <div class="max-h-48 overflow-y-auto">
            {#each portfolios as portfolio (portfolio.id)}
              <div class="group relative">
                {#if isRenaming?.id === portfolio.id}
                  <!-- Rename input -->
                  <div class="px-4 py-3">
                    <input
                      id="rename-input"
                      type="text"
                      bind:value={renameValue}
                      onkeydown={(e) => handleKeydown(e, "rename")}
                      onblur={saveRename}
                      class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Portfolio name"
                    />
                  </div>
                {:else}
                  <!-- Portfolio item -->
                  <div class="flex items-center hover:bg-gray-50">
                    <button
                      onclick={() => selectPortfolio(portfolio)}
                      class="flex-1 flex items-center px-4 py-3 text-sm text-gray-700 cursor-pointer"
                      class:bg-blue-50={selectedPortfolio?.id === portfolio.id}
                      class:text-blue-700={selectedPortfolio?.id === portfolio.id}
                    >
                      <Folder
                        class="w-4 h-4 mr-3 {selectedPortfolio?.id === portfolio.id
                          ? 'text-blue-500'
                          : 'text-gray-400'}"
                      />
                      <span class="truncate font-medium">{portfolio.name}</span>
                      {#if selectedPortfolio?.id === portfolio.id}
                        <span class="ml-auto text-blue-600 font-semibold">✓</span>
                      {/if}
                    </button>

                    <!-- Action buttons -->
                    <div class="flex items-center pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onclick={(e) => {
                          e.stopPropagation();
                          startRenaming(portfolio);
                        }}
                        class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Rename portfolio"
                      >
                        <Edit3 class="w-4 h-4" />
                      </button>
                      {#if portfolios.length > 1 && portfolio.name !== "Main Portfolio"}
                        <button
                          onclick={(e) => {
                            e.stopPropagation();
                            deletePortfolio(portfolio);
                          }}
                          class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete portfolio"
                        >
                          <Trash2 class="w-4 h-4" />
                        </button>
                      {/if}
                    </div>
                  </div>
                {/if}
              </div>
            {/each}
          </div>

          <!-- Create new portfolio -->
          <div class="border-t border-gray-100 mt-2">
            {#if isCreating}
              <div class="px-4 py-3 bg-gray-50">
                <div class="space-y-3">
                  <input
                    id="new-portfolio-input"
                    type="text"
                    bind:value={newPortfolioName}
                    onkeydown={(e) => handleKeydown(e, "create")}
                    onclick={(e) => e.stopPropagation()}
                    onmousedown={(e) => e.stopPropagation()}
                    onfocus={(e) => e.stopPropagation()}
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter portfolio name"
                  />
                  <div class="flex space-x-2">
                    <button
                      onclick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        createPortfolio();
                      }}
                      disabled={!newPortfolioName.trim()}
                      class="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Create Portfolio
                    </button>
                    <button
                      onclick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        isCreating = false;
                        newPortfolioName = "";
                      }}
                      class="flex-1 px-3 py-2 text-sm bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            {:else}
              <button
                onclick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  startCreating();
                }}
                class="w-full flex items-center px-4 py-3 text-sm text-blue-600 hover:bg-blue-50 cursor-pointer transition-colors"
              >
                <Plus class="w-4 h-4 mr-3" />
                <span class="font-medium">Create New Portfolio</span>
              </button>
            {/if}
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  /* Ensure dropdown appears above other elements */
  .relative {
    z-index: 20;
  }
</style>
