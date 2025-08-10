<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { ChevronDown, Plus, Edit3, Trash2, Folder } from "lucide-svelte";
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
      console.log("Clicking outside, closing dropdown");
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
    console.log("startCreating called, disabled:", disabled);
    if (disabled) return;

    isCreating = true;
    newPortfolioName = "";
    isRenaming = null;

    console.log("Setting isCreating to true");

    // Focus input after DOM update
    setTimeout(() => {
      const input = dropdownElement.querySelector("#new-portfolio-input") as HTMLInputElement;
      console.log("Attempting to focus input:", input);
      input?.focus();
    }, 0);
  }

  function createPortfolio() {
    const trimmedName = newPortfolioName.trim();
    console.log("createPortfolio called with:", trimmedName);
    if (!trimmedName) {
      console.log("Empty portfolio name, returning");
      return;
    }

    console.log("Dispatching create event");
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
    class="flex items-center justify-between w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors {disabled
      ? 'opacity-50 cursor-not-allowed'
      : 'cursor-pointer'}"
    class:ring-2={isDropdownOpen}
    class:ring-blue-500={isDropdownOpen}
    class:border-blue-500={isDropdownOpen}
    {disabled}
  >
    <div class="flex items-center min-w-0 flex-1">
      <Folder class="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
      <div class="min-w-0 flex-1">
        {#if isLoading}
          <div class="animate-pulse">
            <div class="h-4 bg-gray-200 rounded w-24"></div>
          </div>
        {:else if selectedPortfolio}
          <span class="block text-sm font-medium text-gray-900 truncate">
            {selectedPortfolio.name}
          </span>
          <span class="block text-xs text-gray-500 truncate"> Portfolio </span>
        {:else}
          <span class="block text-sm text-gray-500">Select portfolio...</span>
        {/if}
      </div>
    </div>
    <ChevronDown
      class="w-4 h-4 text-gray-400 ml-2 flex-shrink-0 transition-transform {isDropdownOpen ? 'rotate-180' : ''}"
    />
  </button>

  {#if isDropdownOpen}
    <div
      class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto"
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
                  class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Portfolio name"
                />
              </div>
            {:else}
              <!-- Portfolio item -->
              <div class="flex items-center">
                <button
                  onclick={() => selectPortfolio(portfolio)}
                  class="flex-1 flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                  class:bg-blue-50={selectedPortfolio?.id === portfolio.id}
                  class:text-blue-700={selectedPortfolio?.id === portfolio.id}
                >
                  <Folder class="w-4 h-4 mr-3 text-gray-400" />
                  <span class="truncate">{portfolio.name}</span>
                  {#if selectedPortfolio?.id === portfolio.id}
                    <span class="ml-auto text-blue-600">✓</span>
                  {/if}
                </button>

                <!-- Action buttons -->
                <div class="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onclick={(e) => {
                      e.stopPropagation();
                      startRenaming(portfolio);
                    }}
                    class="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Rename portfolio"
                  >
                    <Edit3 class="w-3 h-3" />
                  </button>
                  {#if portfolios.length > 1 && portfolio.name !== "Main Portfolio"}
                    <button
                      onclick={(e) => {
                        e.stopPropagation();
                        deletePortfolio(portfolio);
                      }}
                      class="p-1 text-gray-400 hover:text-red-600 transition-colors"
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
          <div class="px-3 py-2 border-t border-gray-100 bg-gray-50">
            <div class="space-y-2">
              <input
                id="new-portfolio-input"
                type="text"
                bind:value={newPortfolioName}
                onkeydown={(e) => handleKeydown(e, "create")}
                onclick={(e) => e.stopPropagation()}
                onmousedown={(e) => e.stopPropagation()}
                onfocus={(e) => e.stopPropagation()}
                class="w-full px-2 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter portfolio name"
              />
              <div class="flex space-x-2">
                <button
                  onclick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("Save portfolio button clicked, name:", newPortfolioName);
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
                  class="flex-1 px-2 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        {:else}
          <div class="border-t border-gray-100">
            <button
              onclick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("Create new portfolio button clicked");
                startCreating();
              }}
              class="w-full flex items-center px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 cursor-pointer"
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
</style>
