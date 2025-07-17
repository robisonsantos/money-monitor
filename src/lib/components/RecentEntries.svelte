<script lang="ts">
  import { onMount } from 'svelte';
  import { Edit3, Loader } from 'lucide-svelte';
  import { formatCurrency, formatDate } from '$lib/utils';

  interface EnrichedInvestment {
    id: number;
    date: string;
    value: number;
    change: number;
    changePercent: number;
    created_at: string;
    updated_at: string;
  }

  interface PaginationInfo {
    limit: number;
    offset: number;
    totalCount: number;
    hasMore: boolean;
  }

  // Accept initial data from server
  interface Props {
    initialEntries?: EnrichedInvestment[];
  }
  
  let { initialEntries = [] }: Props = $props();

  let entries = $state<EnrichedInvestment[]>(initialEntries);
  let isLoading = $state(false);
  let isLoadingMore = $state(false);
  let hasMore = $state(true);
  let error = $state('');
  let sentinelElement = $state<HTMLDivElement>();
  let scrollContainer = $state<HTMLDivElement>();
  // Remove debug status for production
  // let debugStatus = $state(`Server loaded ${initialEntries.length} entries`);



  const ITEMS_PER_PAGE = 20;

  // Export function to refresh entries (useful after adding/editing)
  export function refresh() {
    // Reload from server by refreshing the page or re-fetching initial data
    window.location.reload();
  }

  async function loadMoreEntries(offset: number) {
    isLoadingMore = true;
    error = '';

    try {
      const url = `/api/investments/recent?limit=${ITEMS_PER_PAGE}&offset=${offset}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch recent entries: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const newEntries = data.investments as EnrichedInvestment[];
      const pagination = data.pagination as PaginationInfo;

      // Always append to existing entries
      entries = [...entries, ...newEntries];
      hasMore = pagination.hasMore;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load entries';
    } finally {
      isLoadingMore = false;
    }
  }

  function setupIntersectionObserver() {
    if (!sentinelElement || !scrollContainer) return;

    const observer = new IntersectionObserver(
      (observerEntries) => {
        const entry = observerEntries[0];
        if (entry.isIntersecting && hasMore && !isLoadingMore && !isLoading) {
          // Load more entries starting from current length
          const currentOffset = entries.length;
          loadMoreEntries(currentOffset);
        }
      },
      {
        root: scrollContainer, // Use the scroll container as the root instead of viewport
        rootMargin: '50px', // Start loading when 50px away from the sentinel
        threshold: 0.1
      }
    );

    observer.observe(sentinelElement);

    return () => {
      observer.disconnect();
    };
  }

  // Set up intersection observer for infinite scroll
  $effect(() => {
    if (sentinelElement && scrollContainer) {
      return setupIntersectionObserver();
    }
  });

  // Re-setup observer when sentinel element changes
  $effect(() => {
    if (sentinelElement && scrollContainer && entries.length > 0) {
      return setupIntersectionObserver();
    }
  });
</script>

<div class="card">
  <div class="flex items-center justify-between mb-4">
    <h3 class="text-lg font-semibold text-gray-900">Recent Entries</h3>
    <a href="/dashboard/add" class="text-primary-600 hover:text-primary-700 text-sm font-medium">
      Add New Entry
    </a>
  </div>
  

  
  {#if error && entries.length === 0}
    <div class="text-center py-8">
      <p class="text-red-600 mb-4">{error}</p>
      <button 
        onclick={() => window.location.reload()} 
        class="btn-secondary"
      >
        Try Again
      </button>
    </div>
  {:else}
    <!-- Fixed height scrollable container -->
    <div 
      bind:this={scrollContainer}
      class="h-96 overflow-y-auto overflow-x-auto border border-gray-200 rounded-lg"
    >
      <table class="w-full">
        <thead class="bg-gray-50 sticky top-0">
          <tr class="border-b border-gray-200">
            <th class="text-left py-3 px-4 font-medium text-gray-700">Date</th>
            <th class="text-right py-3 px-4 font-medium text-gray-700">Value</th>
            <th class="text-right py-3 px-4 font-medium text-gray-700">Change</th>
            <th class="text-right py-3 px-4 font-medium text-gray-700">Change %</th>
            <th class="text-center py-3 px-4 font-medium text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#if isLoading}
            <tr>
              <td colspan="5" class="py-8 text-center">
                <div class="flex items-center justify-center space-x-2">
                  <Loader class="w-5 h-5 animate-spin text-primary-600" />
                  <span class="text-gray-600">Loading entries...</span>
                </div>
              </td>
            </tr>
          {:else if entries.length === 0}
            <tr>
              <td colspan="5" class="py-8 text-center text-gray-500">
                No entries found
              </td>
            </tr>
          {:else}
            {#each entries as entry (entry.id)}
              <tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td class="py-3 px-4 text-gray-900">{formatDate(entry.date)}</td>
                <td class="py-3 px-4 text-right font-medium text-gray-900">
                  {formatCurrency(entry.value)}
                </td>
                <td class="py-3 px-4 text-right font-medium {
                  entry.change >= 0 ? 'text-success-600' : 'text-danger-600'
                }">
                  {entry.change !== 0 ? 
                    ((entry.change >= 0 ? '+' : '') + formatCurrency(entry.change)) : 
                    '-'
                  }
                </td>
                <td class="py-3 px-4 text-right font-medium {
                  entry.changePercent >= 0 ? 'text-success-600' : 'text-danger-600'
                }">
                  {entry.changePercent !== 0 ? 
                    ((entry.changePercent >= 0 ? '+' : '') + entry.changePercent.toFixed(2) + '%') : 
                    '-'
                  }
                </td>
                <td class="py-3 px-4 text-center">
                  <a 
                    href="/dashboard/add?edit={entry.date}" 
                    class="inline-flex items-center justify-center w-8 h-8 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title="Edit entry"
                  >
                    <Edit3 class="w-4 h-4" />
                  </a>
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>

      <!-- Infinite scroll sentinel and loading indicator inside the scroll container -->
      {#if entries.length > 0}
        <div bind:this={sentinelElement} class="py-4 bg-white">
          {#if isLoadingMore}
            <div class="flex items-center justify-center space-x-2">
              <Loader class="w-4 h-4 animate-spin text-primary-600" />
              <span class="text-sm text-gray-600">Loading more entries...</span>
            </div>
          {:else if !hasMore}
            <div class="text-center text-sm text-gray-500">
              You've reached the end of your investment history
            </div>
          {/if}
        </div>
      {/if}
    </div>
  {/if}
</div> 