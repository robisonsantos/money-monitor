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

  let entries = $state<EnrichedInvestment[]>([]);
  let isLoading = $state(false);
  let isLoadingMore = $state(false);
  let hasMore = $state(true);
  let error = $state('');
  let sentinelElement: HTMLDivElement;

  const ITEMS_PER_PAGE = 20;

  // Export function to refresh entries (useful after adding/editing)
  export function refresh() {
    loadEntries(0, false);
  }

  async function loadEntries(offset = 0, append = false) {
    const loading = offset === 0 ? 'isLoading' : 'isLoadingMore';
    if (offset === 0) {
      isLoading = true;
      entries = [];
    } else {
      isLoadingMore = true;
    }
    
    error = '';

    try {
      const response = await fetch(`/api/investments/recent?limit=${ITEMS_PER_PAGE}&offset=${offset}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch recent entries');
      }

      const data = await response.json();
      const newEntries = data.investments as EnrichedInvestment[];
      const pagination = data.pagination as PaginationInfo;

      if (append) {
        entries = [...entries, ...newEntries];
      } else {
        entries = newEntries;
      }

      hasMore = pagination.hasMore;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load entries';
      console.error('Error loading recent entries:', err);
    } finally {
      isLoading = false;
      isLoadingMore = false;
    }
  }

  function setupIntersectionObserver() {
    if (!sentinelElement) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && hasMore && !isLoadingMore && !isLoading) {
          const currentOffset = entries.length;
          loadEntries(currentOffset, true);
        }
      },
      {
        rootMargin: '100px', // Start loading when 100px away from the sentinel
        threshold: 0.1
      }
    );

    observer.observe(sentinelElement);

    return () => {
      observer.disconnect();
    };
  }

  onMount(() => {
    loadEntries();
    
    // Set up intersection observer after initial load
    setTimeout(() => {
      if (sentinelElement) {
        return setupIntersectionObserver();
      }
    }, 100);
  });

  // Re-setup observer when sentinel element changes
  $effect(() => {
    if (sentinelElement && entries.length > 0) {
      return setupIntersectionObserver();
    }
  });
</script>

<div class="card">
  <div class="flex items-center justify-between mb-4">
    <h3 class="text-lg font-semibold text-gray-900">Recent Entries</h3>
    <a href="/add" class="text-primary-600 hover:text-primary-700 text-sm font-medium">
      Add New Entry
    </a>
  </div>
  
  {#if error && entries.length === 0}
    <div class="text-center py-8">
      <p class="text-red-600 mb-4">{error}</p>
      <button 
        onclick={() => loadEntries()} 
        class="btn-secondary"
      >
        Try Again
      </button>
    </div>
  {:else}
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
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
                    href="/add?edit={entry.date}" 
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
    </div>

    <!-- Infinite scroll sentinel and loading indicator -->
    {#if entries.length > 0}
      <div bind:this={sentinelElement} class="py-4">
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
  {/if}
</div> 