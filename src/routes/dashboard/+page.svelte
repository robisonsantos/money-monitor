<script lang="ts">
  import { onMount } from 'svelte';
  import Chart from '$lib/components/Chart.svelte';
  import StatsCard from '$lib/components/StatsCard.svelte';
  import RecentEntries from '$lib/components/RecentEntries.svelte';
  import CSVManager from '$lib/components/CSVManager.svelte';
  import { aggregateInvestments, calculatePortfolioStats, calculateFilteredPortfolioStats, formatCurrency, formatDate, type AggregationPeriod, type FilterPeriod, FILTER_OPTIONS } from '$lib/utils';
  import type { PageData } from './$types';
  import { BarChart3, Calendar, TrendingUp, TrendingDown } from 'lucide-svelte';

  let { data }: { data: PageData } = $props();

  let selectedPeriod: AggregationPeriod = $state('daily');
  let selectedFilter: FilterPeriod = $state('7d'); // Default to first daily option
  let investments = $state([]); // Start with empty array, load on demand
  let isLoadingInvestments = $state(false);
  let aggregatedData = $derived(aggregateInvestments(investments, selectedPeriod, selectedFilter));
  let portfolioStats = $derived(calculateFilteredPortfolioStats(aggregatedData));
  let recentEntriesKey = $state(0); // Key to force refresh of RecentEntries

  // Helper function to get default filter for each period
  function getDefaultFilter(period: AggregationPeriod): FilterPeriod {
    const defaultFilters = {
      daily: '7d',
      weekly: '4w', 
      monthly: '3m'
    } as const;
    return defaultFilters[period];
  }

  // Set default filter when period changes
  $effect(() => {
    const period = selectedPeriod;
    selectedFilter = getDefaultFilter(period);
  });

  // Load investments data on demand
  async function loadInvestments() {
    if (isLoadingInvestments) return;
    
    isLoadingInvestments = true;
    try {
      const response = await fetch('/api/investments', {
        credentials: 'include'
      });
      if (response.ok) {
        investments = await response.json();
        console.log(`Loaded ${investments.length} investments`);
      } else {
        console.error('Failed to load investments:', response.status, await response.text());
      }
    } catch (error) {
      console.error('Failed to load investments:', error);
    } finally {
      isLoadingInvestments = false;
    }
  }

  // Load investments when component mounts
  onMount(() => {
    loadInvestments();
  });

  // Refresh data after CSV import
  function handleImportSuccess() {
    // Force page reload to refresh all data
    window.location.reload();
  }

  const periodOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' }
  ] as const;
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
    <div class="flex-shrink-0">
      <h1 class="text-2xl lg:text-3xl font-bold text-gray-900">Investment Dashboard</h1>
      <p class="text-gray-600 mt-1">Track your portfolio performance over time</p>
    </div>
    
    {#if investments.length > 0}
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
        <!-- Filter Controls -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
          <div class="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
            <label for="period" class="text-sm font-medium text-gray-700 whitespace-nowrap">View:</label>
            <select 
              id="period"
              bind:value={selectedPeriod}
              class="input w-full sm:w-auto sm:min-w-[120px]"
            >
              {#each periodOptions as option}
                <option value={option.value}>{option.label}</option>
              {/each}
            </select>
          </div>
          
          <div class="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
            <label for="filter" class="text-sm font-medium text-gray-700 whitespace-nowrap">Period:</label>
            <select 
              id="filter"
              bind:value={selectedFilter}
              class="input w-full sm:w-auto sm:min-w-[140px]"
            >
              {#each FILTER_OPTIONS[selectedPeriod] as option}
                <option value={option.value}>{option.label}</option>
              {/each}
            </select>
          </div>
        </div>
        
        <!-- CSV Controls -->
        <div class="w-full sm:w-auto sm:flex-shrink-0">
          <CSVManager
            selectedPeriod={selectedPeriod}
            selectedFilter={selectedFilter}
            onImportSuccess={handleImportSuccess}
          />
        </div>
      </div>
    {/if}
  </div>

  {#if isLoadingInvestments}
    <!-- Loading State -->
    <div class="text-center py-12">
      <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <h2 class="text-xl font-semibold text-gray-900 mb-2">Loading your investments...</h2>
      <p class="text-gray-600">Please wait while we fetch your data.</p>
    </div>
  {:else if investments.length === 0}
    <!-- Empty State -->
    <div class="text-center py-12">
      <BarChart3 class="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h2 class="text-xl font-semibold text-gray-900 mb-2">No investment data yet</h2>
      <p class="text-gray-600 mb-6">Start tracking your investments by adding your first entry or importing from a CSV file.</p>
      
      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-sm mx-auto sm:max-w-none">
        <a href="/dashboard/add" class="btn-primary w-full sm:w-auto">Add First Entry</a>
        <span class="text-gray-400 hidden sm:block">or</span>
        <div class="w-full sm:w-auto">
          <CSVManager
            selectedPeriod="daily"
            selectedFilter="all"
            onImportSuccess={handleImportSuccess}
            importOnly={true}
          />
        </div>
      </div>
    </div>
  {:else}
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard
        title={selectedFilter === 'all' ? "Current Value" : "Latest Value"}
        value={portfolioStats.totalValue}
        change={portfolioStats.totalChange}
        changePercent={portfolioStats.totalChangePercent}
        icon="dollar"
      />
      
      <StatsCard
        title={selectedFilter === 'all' ? "Total Entries" : `${periodOptions.find(p => p.value === selectedPeriod)?.label} Entries`}
        value={portfolioStats.totalDays.toString()}
        icon="calendar"
        showChange={false}
      />
      
      {#if portfolioStats.bestDay}
        <StatsCard
          title={selectedFilter === 'all' ? "Best Day" : `Best ${selectedPeriod === 'daily' ? 'Day' : selectedPeriod === 'weekly' ? 'Week' : 'Month'}`}
          value={formatDate(portfolioStats.bestDay.date)}
          change={portfolioStats.bestDay.change}
          changePercent={portfolioStats.bestDay.changePercent}
          icon="trending-up"
        />
      {/if}

      {#if portfolioStats.worstDay}
        <StatsCard
          title={selectedFilter === 'all' ? "Worst Day" : `Worst ${selectedPeriod === 'daily' ? 'Day' : selectedPeriod === 'weekly' ? 'Week' : 'Month'}`}
          value={formatDate(portfolioStats.worstDay.date)}
          change={portfolioStats.worstDay.change}
          changePercent={portfolioStats.worstDay.changePercent}
          icon="trending-down"
        />
      {/if}
    </div>

    <!-- Chart -->
    <Chart 
      data={aggregatedData} 
      title={`Portfolio Performance (${periodOptions.find(p => p.value === selectedPeriod)?.label}${selectedFilter !== 'all' ? ` - ${FILTER_OPTIONS[selectedPeriod].find(f => f.value === selectedFilter)?.label}` : ''})`}
      height={400}
    />

    <!-- Recent Entries with Infinite Scroll -->
    <RecentEntries initialEntries={data.recentEntries} />
  {/if}
</div> 