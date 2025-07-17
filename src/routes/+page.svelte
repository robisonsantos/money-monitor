<script lang="ts">
  import { onMount } from 'svelte';
  import Chart from '$lib/Chart.svelte';
  import StatsCard from '$lib/StatsCard.svelte';
  import RecentEntries from '$lib/RecentEntries.svelte';
  import CSVManager from '$lib/CSVManager.svelte';
  import { aggregateInvestments, calculatePortfolioStats, calculateFilteredPortfolioStats, formatCurrency, formatDate, type AggregationPeriod, type FilterPeriod, FILTER_OPTIONS } from '$lib/utils';
  import type { PageData } from './$types';
  import { BarChart3, Calendar, TrendingUp, TrendingDown } from 'lucide-svelte';

  let { data }: { data: PageData } = $props();

  let selectedPeriod: AggregationPeriod = $state('daily');
  let selectedFilter: FilterPeriod = $state('7d'); // Default to first daily option
  let aggregatedData = $derived(aggregateInvestments(data.investments, selectedPeriod, selectedFilter));
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

<svelte:head>
  <title>Dashboard - Money Monitor</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold text-gray-900">Investment Dashboard</h1>
      <p class="text-gray-600 mt-1">Track your portfolio performance over time</p>
    </div>
    
    {#if data.investments.length > 0}
      <div class="flex items-center space-x-4">
        <div class="flex items-center space-x-2">
          <label for="period" class="text-sm font-medium text-gray-700">View:</label>
          <select 
            id="period"
            bind:value={selectedPeriod}
            class="input w-auto min-w-[120px]"
          >
            {#each periodOptions as option}
              <option value={option.value}>{option.label}</option>
            {/each}
          </select>
        </div>
        
        <div class="flex items-center space-x-2">
          <label for="filter" class="text-sm font-medium text-gray-700">Period:</label>
          <select 
            id="filter"
            bind:value={selectedFilter}
            class="input w-auto min-w-[140px]"
          >
            {#each FILTER_OPTIONS[selectedPeriod] as option}
              <option value={option.value}>{option.label}</option>
            {/each}
          </select>
        </div>
        <CSVManager
          selectedPeriod={selectedPeriod}
          selectedFilter={selectedFilter}
          onImportSuccess={handleImportSuccess}
        />
      </div>
    {/if}
  </div>

  {#if data.investments.length === 0}
    <!-- Empty State -->
    <div class="text-center py-12">
      <BarChart3 class="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h2 class="text-xl font-semibold text-gray-900 mb-2">No investment data yet</h2>
      <p class="text-gray-600 mb-6">Start tracking your investments by adding your first entry.</p>
      <a href="/add" class="btn-primary">Add First Entry</a>
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