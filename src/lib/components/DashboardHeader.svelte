<script lang="ts">
  import type { Portfolio } from "$lib/database";
  import { ChevronDown, Edit3, Folder, Plus, Settings, Trash2 } from "lucide-svelte";
  import { createEventDispatcher } from "svelte";

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
          <div class="h-8 lg:h-10 bg-background-tertiary rounded w-64"></div>
        </div>
      {:else if selectedPortfolio}
        <button
          onclick={() => !disabled && (isDropdownOpen = !isDropdownOpen)}
          class="group flex items-center gap-3 px-4 py-3 text-2xl lg:text-3xl font-bold text-foreground-primary hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 {disabled
            ? 'opacity-50 cursor-not-allowed'
            : 'cursor-pointer'} {isDropdownOpen ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : ''}"
          {disabled}
        >
          <Folder class="w-6 h-6 lg:w-7 lg:h-7 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span class="truncate max-w-[250px] sm:max-w-[400px] lg:max-w-[500px]">{selectedPortfolio.name}</span>
          <ChevronDown
            class="w-5 h-5 text-blue-500 dark:text-blue-400 transition-transform duration-200 {isDropdownOpen
              ? 'rotate-180'
              : ''}"
          />
        </button>
      {:else}
        <button
          onclick={() => !disabled && (isDropdownOpen = !isDropdownOpen)}
          class="flex items-center gap-3 px-4 py-3 text-2xl lg:text-3xl font-bold text-foreground-tertiary hover:text-foreground-secondary hover:bg-background-secondary rounded-lg transition-all duration-200 {disabled
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
    <p class="text-foreground-secondary mt-2 ml-0">
      {#if selectedPortfolio}
        Investment Dashboard - Track your portfolio performance over time
      {:else}
        Investment Dashboard - Select a portfolio to get started
      {/if}
    </p>

    <!-- Dropdown Menu -->
    {#if isDropdownOpen}
      <div
        class="absolute z-50 w-full min-w-[300px] mt-2 bg-background-primary border border-border-primary rounded-xl shadow-lg dark:shadow-none dark:ring-1 dark:ring-white/10 dark:bg-gradient-to-br dark:from-slate-800/50 dark:to-slate-900/50 max-h-80 overflow-y-auto"
        style="top: 100%;"
      >
        <div class="py-2">
          <!-- Header -->
          <div class="px-4 py-2 border-b border-border-secondary">
            <h3 class="text-sm font-semibold text-foreground-primary flex items-center gap-2">
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
                      class="w-full px-3 py-2 text-sm border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-background-primary text-foreground-primary"
                      placeholder="Portfolio name"
                    />
                  </div>
                {:else}
                  <!-- Portfolio item -->
                  <div class="flex items-center {selectedPortfolio?.id === portfolio.id ? '' : 'hover:bg-background-secondary'}">
                    <button
                      onclick={() => selectPortfolio(portfolio)}
                      class="flex-1 flex items-center px-4 py-3 text-sm cursor-pointer portfolio-item {selectedPortfolio?.id === portfolio.id ? 'selected' : ''}"
                      class:text-foreground-secondary={selectedPortfolio?.id !== portfolio.id}
                    >
                      <Folder
                        class="w-4 h-4 mr-3 {selectedPortfolio?.id === portfolio.id
                          ? 'text-blue-500'
                          : 'text-foreground-tertiary'}"
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
                        class="p-2 text-foreground-tertiary hover:text-foreground-secondary hover:bg-background-tertiary rounded-lg transition-colors"
                        title="Rename portfolio"
                      >
                        <Edit3 class="w-4 h-4" />
                      </button>
                     {#if portfolios.length > 1}
                        <button
                          onclick={(e) => {
                            e.stopPropagation();
                            deletePortfolio(portfolio);
                          }}
                          class="p-2 text-foreground-tertiary hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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
          <div class="border-t border-border-secondary mt-2">
            {#if isCreating}
              <div class="px-4 py-3 bg-background-secondary">
                <div class="space-y-3">
                  <input
                    id="new-portfolio-input"
                    type="text"
                    bind:value={newPortfolioName}
                    onkeydown={(e) => handleKeydown(e, "create")}
                    onclick={(e) => e.stopPropagation()}
                    onmousedown={(e) => e.stopPropagation()}
                    onfocus={(e) => e.stopPropagation()}
                    class="w-full px-3 py-2 text-sm border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-background-primary text-foreground-primary"
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
                      class="flex-1 px-3 py-2 text-sm bg-background-tertiary text-foreground-secondary rounded-lg hover:bg-border-primary transition-colors"
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
                class="w-full flex items-center px-4 py-3 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors"
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

  /* Direct CSS for selected portfolio items */
  button.portfolio-item.selected {
    background-color: rgb(239, 246, 255) !important; /* Light blue for light mode */
    color: rgb(29, 78, 216) !important; /* Dark blue text for light mode */
  }

  /* Dark mode override with higher specificity */
  :global(.dark) button.portfolio-item.selected {
    background-color: rgb(51, 65, 85) !important; /* Dark gray for dark mode */
    color: rgb(147, 197, 253) !important; /* Light blue text for dark mode */
  }

  /* Ensure hover maintains selected colors */
  button.portfolio-item.selected:hover {
    background-color: rgb(239, 246, 255) !important;
    color: rgb(29, 78, 216) !important;
  }

  :global(.dark) button.portfolio-item.selected:hover {
    background-color: rgb(51, 65, 85) !important;
    color: rgb(147, 197, 253) !important;
  }
</style>
