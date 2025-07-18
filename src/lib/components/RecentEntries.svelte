<script lang="ts">
  import { onMount } from 'svelte';
  import { Edit3, Loader } from 'lucide-svelte';
  import { formatCurrency, formatDate, type AggregatedData } from '$lib/utils';

  // Accept filtered data from parent dashboard
  interface Props {
    filteredInvestments?: AggregatedData[];
    isLoading?: boolean;
  }
  
  let { filteredInvestments = [], isLoading = false }: Props = $props();

  let displayedEntries = $state<AggregatedData[]>([]);
  let isLoadingMore = $state(false);
  let hasMore = $state(true);
  let sentinelElement = $state<HTMLDivElement>();
  let scrollContainer = $state<HTMLDivElement>();

  const ITEMS_PER_PAGE = 20;

  // Export function to refresh entries (useful after adding/editing)
  export function refresh() {
    // Reload from server by refreshing the page or re-fetching initial data
    window.location.reload();
  }

  // Reset displayed entries when filtered data changes
  $effect(() => {
    if (filteredInvestments.length > 0) {
      // Sort by date descending (most recent first)
      const sorted = [...filteredInvestments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      displayedEntries = sorted.slice(0, ITEMS_PER_PAGE);
      hasMore = sorted.length > ITEMS_PER_PAGE;
    } else {
      displayedEntries = [];
      hasMore = false;
    }
  });

  function loadMoreEntries() {
    if (!hasMore || isLoadingMore || isLoading) return;

    isLoadingMore = true;
    
    // Simulate loading delay for smooth UX
    setTimeout(() => {
      const sorted = [...filteredInvestments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const currentLength = displayedEntries.length;
      const nextBatch = sorted.slice(currentLength, currentLength + ITEMS_PER_PAGE);
      
      displayedEntries = [...displayedEntries, ...nextBatch];
      hasMore = displayedEntries.length < sorted.length;
      
      isLoadingMore = false;
    }, 100);
  }

  function setupIntersectionObserver() {
    if (!sentinelElement || !scrollContainer) return;

    const observer = new IntersectionObserver(
      (observerEntries) => {
        const entry = observerEntries[0];
        if (entry.isIntersecting && hasMore && !isLoadingMore && !isLoading) {
          loadMoreEntries();
        }
      },
      {
        root: scrollContainer,
        rootMargin: '50px',
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
    if (sentinelElement && scrollContainer && displayedEntries.length > 0) {
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
  

  
  {#if isLoading && displayedEntries.length === 0}
    <div class="text-center py-8">
      <div class="flex items-center justify-center space-x-2">
        <Loader class="w-5 h-5 animate-spin text-primary-600" />
        <span class="text-gray-600">Loading entries...</span>
      </div>
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
          {#if displayedEntries.length === 0}
            <tr>
              <td colspan="5" class="py-8 text-center text-gray-500">
                No entries found for the selected filter
              </td>
            </tr>
          {:else}
            {#each displayedEntries as entry}
              <tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td class="py-3 px-4 text-gray-900">{formatDate(entry.date)}</td>
                <td class="py-3 px-4 text-right font-medium text-gray-900">
                  {formatCurrency(entry.value)}
                </td>
                <td class="py-3 px-4 text-right font-medium {
                  (entry.change ?? 0) >= 0 ? 'text-success-600' : 'text-danger-600'
                }">
                  {(entry.change ?? 0) !== 0 ? 
                    (((entry.change ?? 0) >= 0 ? '+' : '') + formatCurrency(entry.change ?? 0)) : 
                    '-'
                  }
                </td>
                <td class="py-3 px-4 text-right font-medium {
                  (entry.changePercent ?? 0) >= 0 ? 'text-success-600' : 'text-danger-600'
                }">
                  {(entry.changePercent ?? 0) !== 0 ? 
                    (((entry.changePercent ?? 0) >= 0 ? '+' : '') + (entry.changePercent ?? 0).toFixed(2) + '%') : 
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
      {#if displayedEntries.length > 0}
        <div bind:this={sentinelElement} class="py-4 bg-white">
          {#if isLoadingMore}
            <div class="flex items-center justify-center space-x-2">
              <Loader class="w-4 h-4 animate-spin text-primary-600" />
              <span class="text-sm text-gray-600">Loading more entries...</span>
            </div>
          {:else if !hasMore}
            <div class="text-center text-sm text-gray-500">
              {filteredInvestments.length === displayedEntries.length ? 
                `Showing all ${filteredInvestments.length} entries` :
                `You've reached the end of the filtered results (${displayedEntries.length} of ${filteredInvestments.length} entries)`
              }
            </div>
          {/if}
        </div>
      {/if}
    </div>
  {/if}
</div> 