<script lang="ts">
  import { browser } from "$app/environment";
  import Chart from "$lib/components/Chart.svelte";
  import StatsCard from "$lib/components/StatsCard.svelte";
  import RecentEntries from "$lib/components/RecentEntries.svelte";
  import CSVManager from "$lib/components/CSVManager.svelte";
  import PortfolioSelector from "$lib/components/PortfolioSelector.svelte";
  import {
    aggregateInvestments,
    calculatePortfolioStats,
    calculateFilteredPortfolioStats,
    formatCurrency,
    formatDate,
    type AggregationPeriod,
    type FilterPeriod,
    FILTER_OPTIONS,
  } from "$lib/utils";
  import {
    portfolioStore,
    portfolios,
    selectedPortfolio,
    portfolioIsLoading,
    portfolioError,
  } from "$lib/stores/portfolio";
  import type { PageData } from "./$types";
  import type { Portfolio } from "$lib/database";
  import { BarChart3, Calendar, TrendingUp, TrendingDown, AlertCircle } from "lucide-svelte";

  let { data }: { data: PageData } = $props();

  let selectedPeriod: AggregationPeriod = $state("daily");
  let selectedFilter: FilterPeriod = $state("7d"); // Default to first daily option
  let investments = $state<any[]>([]); // Start empty, will be loaded via API
  let isLoading = $state(true); // Start in loading state
  let investmentError = $state<string | null>(null);
  let displayInvestments = $derived(investments);
  let aggregatedData = $derived(aggregateInvestments(displayInvestments, selectedPeriod, selectedFilter));
  let portfolioStats = $derived(calculateFilteredPortfolioStats(aggregatedData));
  // For RecentEntries: always show daily entries for the filtered time period (regardless of view aggregation)
  let filteredDailyEntries = $derived(aggregateInvestments(displayInvestments, "daily", selectedFilter));
  let recentEntriesKey = $state(0); // Key to force refresh of RecentEntries
  let previousPeriod = $state<AggregationPeriod>("daily"); // Track previous period

  // Helper function to get default filter for each period
  function getDefaultFilter(period: AggregationPeriod): FilterPeriod {
    const defaultFilters = {
      daily: "7d",
      weekly: "4w",
      monthly: "3m",
    } as const;
    return defaultFilters[period];
  }

  // Set default filter ONLY when period actually changes (not on every reactive update)
  $effect(() => {
    if (selectedPeriod !== previousPeriod) {
      selectedFilter = getDefaultFilter(selectedPeriod);
      previousPeriod = selectedPeriod;
    }
  });

  // Load investments for a specific portfolio
  async function loadInvestmentsForPortfolio(portfolioId: number) {
    if (!browser) return; // Only run in browser

    isLoading = true;
    investmentError = null;

    try {
      const response = await fetch(`/api/portfolios/${portfolioId}/investments`, {
        credentials: "include",
      });

      if (response.ok) {
        investments = await response.json();
      } else {
        const errorData = await response.json();
        investmentError = errorData.error || `Failed to load investments: ${response.status}`;
        console.error("Failed to load investments:", response.status);
      }
    } catch (error) {
      investmentError = "Error loading investments";
      console.error("Error loading investments:", error);
    } finally {
      isLoading = false;
    }
  }

  // Backward compatible function for default portfolio
  async function loadInvestments() {
    if (!browser) return;

    // Use the main API endpoint for backward compatibility
    try {
      const response = await fetch("/api/investments", {
        credentials: "include",
      });

      if (response.ok) {
        investments = await response.json();
      } else {
        console.error("Failed to load investments:", response.status);
      }
    } catch (error) {
      console.error("Error loading investments:", error);
    } finally {
      isLoading = false;
    }
  }

  // Load portfolios when component mounts
  $effect(() => {
    if (browser) {
      portfolioStore.loadPortfolios();
    }
  });

  // Load investments when selected portfolio changes
  $effect(() => {
    if (browser && $selectedPortfolio) {
      loadInvestmentsForPortfolio($selectedPortfolio.id);
    } else if (browser && $selectedPortfolio === null && !$portfolioIsLoading && $portfolios.length === 0) {
      // Fallback to backward compatible loading if no portfolios exist
      loadInvestments();
    }
  });

  // Refresh data after CSV import
  function handleImportSuccess() {
    // Reload investments for current portfolio
    if ($selectedPortfolio) {
      loadInvestmentsForPortfolio($selectedPortfolio.id);
    } else {
      // Force page reload to refresh all data if no portfolio context
      window.location.reload();
    }
  }

  // Portfolio management handlers
  function handlePortfolioSelect(event: CustomEvent<Portfolio>) {
    portfolioStore.selectPortfolio(event.detail);
  }

  async function handlePortfolioCreate(event: CustomEvent<{ name: string }>) {
    const result = await portfolioStore.createPortfolio(event.detail.name);
    if (!result) {
      // Error is handled by the store, but we could show a toast here
      console.error("Failed to create portfolio");
    }
  }

  async function handlePortfolioRename(event: CustomEvent<{ portfolio: Portfolio; newName: string }>) {
    const success = await portfolioStore.renamePortfolio(event.detail.portfolio, event.detail.newName);
    if (!success) {
      console.error("Failed to rename portfolio");
    }
  }

  async function handlePortfolioDelete(event: CustomEvent<Portfolio>) {
    const success = await portfolioStore.deletePortfolio(event.detail);
    if (!success) {
      console.error("Failed to delete portfolio");
    }
  }

  const periodOptions = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
  ] as const;
</script>

<div class="space-y-6">
  <!-- Header with Portfolio Selector -->
  <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 lg:gap-6">
    <div class="flex-shrink-0">
      <h1 class="text-2xl lg:text-3xl font-bold text-gray-900">Investment Dashboard</h1>
      <p class="text-gray-600 mt-1">Track your portfolio performance over time</p>
    </div>

    <!-- Portfolio Selector -->
    <div class="lg:w-80">
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700"> Portfolio </label>
        <PortfolioSelector
          portfolios={$portfolios}
          selectedPortfolio={$selectedPortfolio}
          isLoading={$portfolioIsLoading}
          on:select={handlePortfolioSelect}
          on:create={handlePortfolioCreate}
          on:rename={handlePortfolioRename}
          on:delete={handlePortfolioDelete}
        />
        {#if $portfolioError}
          <div class="flex items-center text-sm text-red-600">
            <AlertCircle class="w-4 h-4 mr-1" />
            {$portfolioError}
          </div>
        {/if}
      </div>
    </div>
  </div>

  <!-- Investment Data Error -->
  {#if investmentError}
    <div class="card border-red-200 bg-red-50">
      <div class="flex items-center text-red-700">
        <AlertCircle class="w-5 h-5 mr-2" />
        <span>{investmentError}</span>
      </div>
    </div>
  {/if}

  <!-- Controls (only show when we have data and a portfolio) -->
  {#if displayInvestments.length > 0 && !isLoading && $selectedPortfolio}
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
        <!-- Filter Controls -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
          <div class="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
            <label for="period" class="text-sm font-medium text-gray-700 whitespace-nowrap">View:</label>
            <select id="period" bind:value={selectedPeriod} class="input w-full sm:w-auto sm:min-w-[120px]">
              {#each periodOptions as option}
                <option value={option.value}>{option.label}</option>
              {/each}
            </select>
          </div>

          <div class="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
            <label for="filter" class="text-sm font-medium text-gray-700 whitespace-nowrap">Period:</label>
            <select id="filter" bind:value={selectedFilter} class="input w-full sm:w-auto sm:min-w-[140px]">
              {#each FILTER_OPTIONS[selectedPeriod] as option}
                <option value={option.value}>{option.label}</option>
              {/each}
            </select>
          </div>
        </div>

        <!-- CSV Controls -->
        <div class="w-full sm:w-auto sm:flex-shrink-0">
          <CSVManager {selectedPeriod} {selectedFilter} onImportSuccess={handleImportSuccess} />
        </div>
      </div>
    </div>
  {/if}

  {#if isLoading || $portfolioIsLoading}
    <!-- Skeleton Loading State -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {#each Array(4) as _, i}
        <div class="card">
          <div class="animate-pulse">
            <div class="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div class="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div class="h-3 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      {/each}
    </div>

    <!-- Chart Skeleton -->
    <div class="card">
      <div class="animate-pulse">
        <div class="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div class="h-96 bg-gray-100 rounded"></div>
      </div>
    </div>

    <!-- Recent Entries Skeleton -->
    <div class="card">
      <div class="animate-pulse">
        <div class="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div class="space-y-3">
          {#each Array(10) as _, i}
            <div class="flex justify-between items-center py-2">
              <div class="h-4 bg-gray-200 rounded w-1/6"></div>
              <div class="h-4 bg-gray-200 rounded w-1/8"></div>
              <div class="h-4 bg-gray-200 rounded w-1/8"></div>
              <div class="h-4 bg-gray-200 rounded w-1/8"></div>
              <div class="h-4 bg-gray-200 rounded w-1/12"></div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  {:else if displayInvestments.length === 0}
    <!-- Empty State -->
    <div class="text-center py-12">
      <BarChart3 class="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h2 class="text-xl font-semibold text-gray-900 mb-2">No investment data yet</h2>
      <p class="text-gray-600 mb-6">
        Start tracking your investments by adding your first entry or importing from a CSV file.
      </p>

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
        title={selectedFilter === "all" ? "Current Value" : "Latest Value"}
        value={portfolioStats.totalValue}
        change={portfolioStats.totalChange}
        changePercent={portfolioStats.totalChangePercent}
        icon="dollar"
      />

      <StatsCard
        title={selectedFilter === "all"
          ? "Total Entries"
          : `${periodOptions.find((p) => p.value === selectedPeriod)?.label} Entries`}
        value={portfolioStats.totalDays.toString()}
        icon="calendar"
        showChange={false}
      />

      {#if portfolioStats.bestDay}
        <StatsCard
          title={selectedFilter === "all"
            ? "Best Day"
            : `Best ${selectedPeriod === "daily" ? "Day" : selectedPeriod === "weekly" ? "Week" : "Month"}`}
          value={formatDate(portfolioStats.bestDay.date)}
          change={portfolioStats.bestDay.change}
          changePercent={portfolioStats.bestDay.changePercent}
          icon="trending-up"
        />
      {/if}

      {#if portfolioStats.worstDay}
        <StatsCard
          title={selectedFilter === "all"
            ? "Worst Day"
            : `Worst ${selectedPeriod === "daily" ? "Day" : selectedPeriod === "weekly" ? "Week" : "Month"}`}
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
      title={`Portfolio Performance (${periodOptions.find((p) => p.value === selectedPeriod)?.label}${selectedFilter !== "all" ? ` - ${FILTER_OPTIONS[selectedPeriod].find((f) => f.value === selectedFilter)?.label}` : ""})`}
      height={400}
    />

    <!-- Recent Entries with Infinite Scroll -->
    <RecentEntries filteredInvestments={filteredDailyEntries} {isLoading} />
  {/if}
</div>
