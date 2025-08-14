<script lang="ts">
  import type { Portfolio } from "$lib/database";
  import { ChevronDown, Edit3, Folder, Plus, Trash2 } from "lucide-svelte";
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
    if (!trimmedName) {
      return;
    }

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

<div class="relative" bind:this={dropdownElement}>
  <button
    onclick={() => !disabled && (isDropdownOpen = !isDropdownOpen)}
    class="flex items-center justify-between w-full px-4 py-2 text-left bg-background-primary border border-border-primary rounded-lg shadow-sm hover:bg-background-secondary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors {disabled
      ? 'opacity-50 cursor-not-allowed'
      : 'cursor-pointer'}"
    class:ring-2={isDropdownOpen}
    class:ring-blue-500={isDropdownOpen}
    class:border-blue-500={isDropdownOpen}
    {disabled}
  >
    <div class="flex items-center min-w-0 flex-1">
      <Folder class="w-5 h-5 text-foreground-tertiary mr-3 flex-shrink-0" />
      <div class="min-w-0 flex-1">
        {#if isLoading}
          <div class="animate-pulse">
            <div class="h-4 bg-background-tertiary rounded w-24"></div>
          </div>
        {:else if selectedPortfolio}
          <span class="block text-sm font-medium text-foreground-primary truncate">
            {selectedPortfolio.name}
          </span>
        {:else}
          <span class="block text-sm text-foreground-tertiary">Select portfolio...</span>
        {/if}
      </div>
    </div>
    <ChevronDown
      class="w-4 h-4 text-foreground-tertiary ml-2 flex-shrink-0 transition-transform {isDropdownOpen
        ? 'rotate-180'
        : ''}"
    />
  </button>

  {#if isDropdownOpen}
    <div
      class="absolute z-50 w-full mt-1 bg-background-primary border border-border-primary rounded-lg shadow-lg dark:shadow-none dark:ring-1 dark:ring-white/10 dark:bg-gradient-to-br dark:from-slate-800/50 dark:to-slate-900/50 max-h-80 overflow-y-auto"
    >
      <div class="py-1">
        <!-- Existing portfolios -->
        {#each portfolios as portfolio (portfolio.id)}
          <div class="group relative">
            {#if isRenaming?.id === portfolio.id}
              <!-- Rename input -->
              <div class="px-3 py-2">
                <input
                  id="rename-input"
                  type="text"
                  bind:value={renameValue}
                  onkeydown={(e) => handleKeydown(e, "rename")}
                  onblur={saveRename}
                  class="w-full px-2 py-1 text-sm border border-border-primary rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background-primary text-foreground-primary"
                  placeholder="Portfolio name"
                />
              </div>
            {:else}
              <!-- Portfolio item -->
              <div class="flex items-center {selectedPortfolio?.id === portfolio.id ? '' : 'hover:bg-background-secondary'}">
                <button
                  onclick={() => selectPortfolio(portfolio)}
                  class="flex-1 flex items-center px-3 py-2 text-sm cursor-pointer portfolio-item {selectedPortfolio?.id === portfolio.id ? 'selected' : ''}"
                  class:text-foreground-secondary={selectedPortfolio?.id !== portfolio.id}
                >
                  <Folder class="w-4 h-4 mr-3 text-foreground-tertiary" />
                  <span class="truncate">{portfolio.name}</span>
                  {#if selectedPortfolio?.id === portfolio.id}
                    <span class="ml-auto text-blue-600 dark:text-blue-400">✓</span>
                  {/if}
                </button>

                <!-- Action buttons -->
                <div class="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onclick={(e) => {
                      e.stopPropagation();
                      startRenaming(portfolio);
                    }}
                    class="p-1 text-foreground-tertiary hover:text-foreground-secondary transition-colors"
                    title="Rename portfolio"
                  >
                    <Edit3 class="w-3 h-3" />
                  </button>
                 {#if portfolios.length > 1}
                    <button
                      onclick={(e) => {
                        e.stopPropagation();
                        deletePortfolio(portfolio);
                      }}
                      class="p-1 text-foreground-tertiary hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      title="Delete portfolio"
                    >
                      <Trash2 class="w-3 h-3" />
                    </button>
                  {/if}
                </div>
              </div>
            {/if}
          </div>
        {/each}

        <!-- Create new portfolio -->
        {#if isCreating}
          <div class="px-3 py-2 border-t border-border-secondary bg-background-secondary">
            <div class="space-y-2">
              <input
                id="new-portfolio-input"
                type="text"
                bind:value={newPortfolioName}
                onkeydown={(e) => handleKeydown(e, "create")}
                onclick={(e) => e.stopPropagation()}
                onmousedown={(e) => e.stopPropagation()}
                onfocus={(e) => e.stopPropagation()}
                class="w-full px-2 py-2 text-sm border border-border-primary rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background-primary text-foreground-primary"
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
                  class="flex-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save
                </button>
                <button
                  onclick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    isCreating = false;
                    newPortfolioName = "";
                  }}
                  class="flex-1 px-2 py-1 text-xs bg-background-tertiary text-foreground-secondary rounded hover:bg-border-primary transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        {:else}
          <div class="border-t border-border-secondary">
            <button
              onclick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                startCreating();
              }}
              class="w-full flex items-center px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors"
            >
              <Plus class="w-4 h-4 mr-3" />
              <span>Create new portfolio</span>
            </button>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  /* Ensure dropdown appears above other elements */
  .relative {
    z-index: 10;
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
