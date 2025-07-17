<script lang="ts">
  import { onMount } from 'svelte';
  import Chart from '$lib/Chart.svelte';
  import StatsCard from '$lib/StatsCard.svelte';
  import { aggregateInvestments, calculatePortfolioStats, formatCurrency, formatDate, type AggregationPeriod, type FilterPeriod, FILTER_OPTIONS } from '$lib/utils';
  import type { PageData } from './$types';
  import { BarChart3, Calendar, TrendingUp, TrendingDown, Edit3 } from 'lucide-svelte';

  let { data }: { data: PageData } = $props();

  let selectedPeriod: AggregationPeriod = $state('daily');
  let selectedFilter: FilterPeriod = $state('all');
  let aggregatedData = $derived(aggregateInvestments(data.investments, selectedPeriod, selectedFilter));
  let portfolioStats = $derived(calculatePortfolioStats(data.investments));

  // Reset filter when period changes
  let prevPeriod: AggregationPeriod = $state(selectedPeriod);
  $effect(() => {
    if (prevPeriod !== selectedPeriod) {
      selectedFilter = 'all';
      prevPeriod = selectedPeriod;
    }
  });

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
        title="Current Value"
        value={portfolioStats.totalValue}
        change={portfolioStats.totalChange}
        changePercent={portfolioStats.totalChangePercent}
        icon="dollar"
      />
      
      <StatsCard
        title="Total Entries"
        value={portfolioStats.totalDays.toString()}
        icon="calendar"
        showChange={false}
      />
      
      {#if portfolioStats.bestDay}
        <StatsCard
          title="Best Day"
          value={formatDate(portfolioStats.bestDay.date)}
          change={portfolioStats.bestDay.change}
          changePercent={portfolioStats.bestDay.changePercent}
          icon="trending-up"
        />
      {/if}
      
      {#if portfolioStats.worstDay}
        <StatsCard
          title="Worst Day"
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

    <!-- Recent Entries -->
    <div class="card">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Recent Entries</h3>
        <a href="/add" class="text-primary-600 hover:text-primary-700 text-sm font-medium">
          Add New Entry
        </a>
      </div>
      
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
            {#each aggregatedData.slice(-10).reverse() as entry}
              <tr class="border-b border-gray-100 hover:bg-gray-50">
                <td class="py-3 px-4 text-gray-900">{formatDate(entry.date)}</td>
                <td class="py-3 px-4 text-right font-medium text-gray-900">
                  {formatCurrency(entry.value)}
                </td>
                <td class="py-3 px-4 text-right font-medium {
                  (entry.change || 0) >= 0 ? 'text-success-600' : 'text-danger-600'
                }">
                  {entry.change ? 
                    ((entry.change >= 0 ? '+' : '') + formatCurrency(entry.change)) : 
                    '-'
                  }
                </td>
                <td class="py-3 px-4 text-right font-medium {
                  (entry.changePercent || 0) >= 0 ? 'text-success-600' : 'text-danger-600'
                }">
                  {entry.changePercent !== undefined ? 
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
          </tbody>
        </table>
      </div>
    </div>
  {/if}
</div>