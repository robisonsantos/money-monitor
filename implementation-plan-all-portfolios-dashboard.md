# Implementation Plan for "All Portfolios" Dashboard Feature

## Overview
This document outlines the implementation plan for adding an "All Portfolios" dashboard feature to the Money Monitor application. This feature will allow users with multiple portfolios to view aggregated data from all their portfolios in a single dashboard view.

## Current Understanding of the Project

### Application Structure
- **Framework**: SvelteKit application for tracking investment portfolios
- **Database**: PostgreSQL with portfolios and investments tables
- **Frontend**: Svelte components with Tailwind CSS styling
- **State Management**: Svelte stores for portfolio and UI state
- **Data Flow**: Client-side data loading via API endpoints

### Key Components
- **Portfolio Management**: Users can create, rename, delete multiple portfolios
- **Dashboard View**: Currently shows data for a single selected portfolio
- **Portfolio Selector**: Dropdown component for switching between portfolios
- **Investment Data**: Date-value pairs associated with specific portfolios

### Current Data Flow
1. User logs in and selects a portfolio
2. Dashboard loads investments for the selected portfolio via API
3. Data is aggregated and displayed using chart and stats components
4. Portfolio switching updates the dashboard view

## Feature Requirements

1. **"All Portfolios" Dashboard**: New view aggregating data from all user portfolios
2. **Conditional Access**: Only available when user has more than one portfolio
3. **No Database Changes**: Aggregation performed in-memory, no schema changes needed
4. **Consistent UI**: Same layout and functionality as individual portfolio dashboards
5. **Data Integrity**: Accurate aggregation maintaining data relationships
6. **Performance**: Efficient handling of multiple portfolios with large datasets

## Implementation Plan

### Phase 1: Foundation (Backend Changes)

#### 1.1 Create Aggregated Data API Endpoint
**File to Create:** `src/routes/api/portfolios/all/investments/+server.ts`

**Implementation Details:**
- New GET endpoint to fetch investments from all user portfolios
- Aggregate data by date, summing values across portfolios for the same date
- Return data in the same format as individual portfolio endpoints
- Implement proper authentication using `locals.user`
- Add error handling for edge cases (no portfolios, no investments, etc.)

**Expected Response Format:**
```json
{
  "id": "aggregated-2023-01-01",
  "user_id": 123,
  "portfolio_id": "all",
  "date": "2023-01-01",
  "value": 15000.00,
  "created_at": "2023-01-01T00:00:00Z",
  "portfolio_count": 3,
  "portfolio_breakdown": [
    {"portfolio_id": 1, "value": 8000.00, "name": "Main Portfolio"},
    {"portfolio_id": 2, "value": 4500.00, "name": "Savings"},
    {"portfolio_id": 3, "value": 2500.00, "name": "Investments"}
  ]
}
```

**Code Implementation:**
```typescript
import { json } from '@sveltejs/kit';
import { portfolioDb, investmentDb } from '$lib/database';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
  try {
    if (!locals.user) {
      return json({ error: 'Authentication required' }, { status: 401 });
    }

    const userId = locals.user.id;
    const portfolios = await portfolioDb.getUserPortfolios(userId);
    
    if (portfolios.length === 0) {
      return json([], { status: 200 });
    }

    // Get investments from all portfolios
    const allInvestments = [];
    for (const portfolio of portfolios) {
      const portfolioInvestments = await investmentDb.getAllInvestmentsFromPortfolio(userId, portfolio.id);
      allInvestments.push(...portfolioInvestments.map(inv => ({
        ...inv,
        original_portfolio_id: portfolio.id,
        portfolio_name: portfolio.name
      })));
    }

    // Aggregate by date
    const aggregatedMap = new Map();
    
    allInvestments.forEach(investment => {
      const date = investment.date;
      if (!aggregatedMap.has(date)) {
        aggregatedMap.set(date, {
          id: `aggregated-${date}`,
          user_id: userId,
          portfolio_id: 'all',
          date: date,
          value: 0,
          created_at: investment.created_at,
          portfolio_count: 0,
          portfolio_breakdown: []
        });
      }
      
      const aggregated = aggregatedMap.get(date);
      aggregated.value += investment.value;
      aggregated.portfolio_count++;
      aggregated.portfolio_breakdown.push({
        portfolio_id: investment.original_portfolio_id,
        portfolio_name: investment.portfolio_name,
        value: investment.value
      });
    });

    const aggregatedInvestments = Array.from(aggregatedMap.values())
      .sort((a, b) => a.date.localeCompare(b.date));

    return json(aggregatedInvestments);
  } catch (error) {
    console.error('Error fetching aggregated investments:', error);
    return json({ error: 'Unable to retrieve aggregated investments' }, { status: 500 });
  }
};
```

#### 1.2 Database Utility Functions
**File to Modify:** `src/lib/database.ts`

**Add new function for portfolio aggregation:**
```typescript
// Add to investmentDb object
getAllInvestmentsAggregated: async (userId: number) => {
  const portfolios = await portfolioDb.getUserPortfolios(userId);
  if (portfolios.length === 0) return [];

  const allInvestments = [];
  for (const portfolio of portfolios) {
    const portfolioInvestments = await investmentDb.getAllInvestmentsFromPortfolio(userId, portfolio.id);
    allInvestments.push(...portfolioInvestments);
  }

  // Aggregate by date
  const aggregatedMap = new Map();
  
  allInvestments.forEach(investment => {
    const date = investment.date;
    if (!aggregatedMap.has(date)) {
      aggregatedMap.set(date, {
        id: `aggregated-${date}`,
        user_id: userId,
        portfolio_id: 'all',
        date: date,
        value: 0,
        created_at: investment.created_at,
        portfolio_count: 0,
        portfolio_breakdown: []
      });
    }
    
    const aggregated = aggregatedMap.get(date);
    aggregated.value += investment.value;
    aggregated.portfolio_count++;
  });

  return Array.from(aggregatedMap.values())
    .sort((a, b) => a.date.localeCompare(b.date));
},
```

### Phase 2: Frontend Foundation (UI Components)

#### 2.1 Modify Portfolio Selector Component
**File to Modify:** `src/lib/components/PortfolioSelector.svelte`

**Changes Required:**
- Add "All Portfolios" option to dropdown when user has multiple portfolios
- Use "Layers" icon from lucide-svelte for visual distinction
- Update selection logic to handle "All" portfolio ID ('all')
- Add conditional styling for the "All" option

**Key Modifications:**
```svelte
<script lang="ts">
  // Add "All Portfolios" option
  let portfoliosWithAll = $derived([
    ...portfolios,
    ...(portfolios.length > 1 ? [{ id: 'all', name: 'All Portfolios', isAllPortfolios: true }] : [])
  ]);
</script>

<!-- Update the dropdown options -->
{#each portfoliosWithAll as portfolio (portfolio.id)}
  <div class="group relative">
    {#if isRenaming?.id === portfolio.id}
      <!-- Rename input for individual portfolios only -->
    {:else if portfolio.isAllPortfolios}
      <!-- Special "All Portfolios" option -->
      <div class="flex items-center hover:bg-background-secondary">
        <button
          onclick={() => selectPortfolio(portfolio)}
          class="flex-1 flex items-center px-3 py-2 text-sm cursor-pointer portfolio-item {selectedPortfolio?.id === portfolio.id ? 'selected' : ''}"
        >
          <Layers class="w-4 h-4 mr-3 text-blue-600 dark:text-blue-400" />
          <span class="truncate font-medium">{portfolio.name}</span>
          {#if selectedPortfolio?.id === 'all'}
            <span class="ml-auto text-blue-600 font-semibold">✓</span>
          {/if}
        </button>
      </div>
    {:else}
      <!-- Regular portfolio options -->
    {/if}
  </div>
{/each}
```

#### 2.2 Update Dashboard Header Component
**File to Modify:** `src/lib/components/DashboardHeader.svelte`

**Changes Required:**
- Handle "All Portfolios" selection in the main title dropdown
- Update portfolio count display for "All" view
- Hide portfolio management actions (rename, delete) when in "All" view
- Add appropriate messaging for aggregated view

**Key Modifications:**
```svelte
<script lang="ts">
  // Handle "All Portfolios" selection
  function selectPortfolio(portfolio: Portfolio) {
    if (disabled) return;
    
    if (portfolio.id === 'all') {
      // Special handling for "All Portfolios"
      dispatch("select", { 
        id: 'all', 
        name: 'All Portfolios',
        isAllPortfolios: true 
      });
    } else {
      dispatch("select", portfolio);
    }
    isDropdownOpen = false;
  }
</script>

<!-- Update main title display -->
{#if isLoading}
  <!-- Loading state -->
{:else if selectedPortfolio?.isAllPortfolios}
  <button
    onclick={() => !disabled && (isDropdownOpen = !isDropdownOpen)}
    class="group flex items-center gap-3 px-4 py-3 text-2xl lg:text-3xl font-bold text-foreground-primary hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
  >
    <Layers class="w-6 h-6 lg:w-7 lg:h-7 text-blue-600 dark:text-blue-400 flex-shrink-0" />
    <span class="truncate max-w-[250px] sm:max-w-[400px] lg:max-w-[500px]">All Portfolios</span>
    <ChevronDown class="w-5 h-5 text-blue-500 dark:text-blue-400 transition-transform duration-200" />
  </button>
{:else if selectedPortfolio}
  <!-- Regular portfolio display -->
{/if}

<!-- Update portfolio description -->
<p class="text-foreground-secondary mt-2 ml-0">
  {#if selectedPortfolio?.isAllPortfolios}
    Combined Investment Dashboard - View aggregated performance across all portfolios
  {:else if selectedPortfolio}
    Investment Dashboard - Track your portfolio performance over time
  {:else}
    Investment Dashboard - Select a portfolio to get started
  {/if}
</p>

<!-- Hide portfolio management actions for "All" view -->
{#if !selectedPortfolio?.isAllPortfolios}
  <!-- Portfolio action buttons (rename, delete) -->
{/if}
```

### Phase 3: State Management Updates

#### 3.1 Extend Portfolio Store
**File to Modify:** `src/lib/stores/portfolio.ts`

**Changes Required:**
- Add support for "All Portfolios" special case
- Add method to load aggregated data
- Update portfolio selection logic
- Add validation to ensure "All" option only appears with multiple portfolios

**Key Additions:**
```typescript
// Add to PortfolioState interface
interface PortfolioState {
  portfolios: Portfolio[];
  selectedPortfolio: Portfolio | null;
  isLoading: boolean;
  error: string | null;
  aggregatedData: Investment[]; // New field for aggregated investments
  isAggregatedView: boolean; // New flag for aggregated view
}

// Extend portfolio store with aggregated data loading
async loadAggregatedInvestments() {
  if (!browser) return;

  update((state) => ({ ...state, isLoading: true, error: null }));

  try {
    const response = await fetch("/api/portfolios/all/investments", {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Failed to load aggregated investments: ${response.status}`);
    }

    const aggregatedInvestments = await response.json();

    update((state) => ({
      ...state,
      aggregatedData: aggregatedInvestments,
      isLoading: false,
    }));

    return aggregatedInvestments;
  } catch (error) {
    console.error("Error loading aggregated investments:", error);
    update((state) => ({
      ...state,
      isLoading: false,
      error: error instanceof Error ? error.message : "Failed to load aggregated investments",
    }));
    return null;
  }
}

// Update selectPortfolio method
selectPortfolio(portfolio: Portfolio) {
  update((state) => {
    const newSelectedPortfolio = portfolio;
    const isAggregatedView = portfolio.id === 'all';
    
    return {
      ...state,
      selectedPortfolio: newSelectedPortfolio,
      isAggregatedView,
    };
  });

  // Store in localStorage for persistence
  if (browser) {
    if (portfolio.id === 'all') {
      localStorage.setItem("selectedPortfolioId", 'all');
    } else {
      localStorage.setItem("selectedPortfolioId", portfolio.id.toString());
    }
  }
  
  // Load appropriate data based on selection
  if (portfolio.id === 'all') {
    this.loadAggregatedInvestments();
  } else {
    this.loadInvestmentsForPortfolio(portfolio.id);
  }
},
```

#### 3.2 Update Derived Stores
**File to Modify:** `src/lib/stores/portfolio.ts`

**Add new derived stores:**
```typescript
// Derived store for aggregated investments
export const aggregatedInvestments = derived(portfolioStore, ($store) => $store.aggregatedData);

// Derived store for checking if "All" view is available
export const isAllPortfoliosAvailable = derived(portfolios, ($portfolios) => $portfolios.length > 1);

// Derived store for checking if currently in "All" view
export const isAggregatedView = derived(portfolioStore, ($store) => $store.isAggregatedView);
```

### Phase 4: Dashboard Integration

#### 4.1 Update Dashboard Page Data Loading
**File to Modify:** `src/routes/dashboard/+page.svelte`

**Changes Required:**
- Modify data loading logic to handle "All" portfolio selection
- Update API calls based on selected portfolio
- Handle different data structures for aggregated vs individual portfolio data
- Ensure proper loading states and error handling

**Key Modifications:**
```svelte
<script lang="ts">
  // Update portfolio store imports
  import {
    portfolioStore,
    portfolios,
    selectedPortfolio,
    portfolioIsLoading,
    portfolioError,
    isAggregatedView,
    aggregatedInvestments,
    isAllPortfoliosAvailable
  } from "$lib/stores/portfolio";

  // Update data loading logic
  $effect(() => {
    if (browser) {
      portfolioStore.loadPortfolios();
    }
  });

  // Load investments when selected portfolio changes
  $effect(() => {
    if (browser && $selectedPortfolio) {
      if ($selectedPortfolio.id === 'all') {
        // Load aggregated data
        portfolioStore.loadAggregatedInvestments();
        investments = $aggregatedInvestments;
      } else {
        // Load specific portfolio data
        loadInvestmentsForPortfolio($selectedPortfolio.id);
      }
    }
  });

  // Update the loadInvestmentsForPortfolio function
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
</script>

<!-- Update Dashboard Header props -->
<DashboardHeader
  portfolios={$portfolios}
  selectedPortfolio={$selectedPortfolio}
  isLoading={$portfolioIsLoading}
  on:select={handlePortfolioSelect}
  on:create={handlePortfolioCreate}
  on:rename={handlePortfolioRename}
  on:delete={handlePortfolioDelete}
/>

<!-- Add "All Portfolios" indicator when in aggregated view -->
{#if $isAggregatedView}
  <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
    <div class="flex items-center space-x-2">
      <Layers class="w-5 h-5 text-blue-600 dark:text-blue-400" />
      <span class="text-sm font-medium text-blue-700 dark:text-blue-300">
        Viewing combined data from all {$portfolios.length} portfolios
      </span>
    </div>
  </div>
{/if}
```

#### 4.2 Update Navigation and Breadcrumbs
**File to Modify:** `src/lib/components/Breadcrumb.svelte`

**Changes Required:**
- Update breadcrumb to show "All Portfolios" when active
- Ensure proper navigation between portfolio views
- Add appropriate styling for aggregated view

**Key Modifications:**
```svelte
<script lang="ts">
  // Import Layers icon
  import { Layers } from "lucide-svelte";
</script>

<!-- Update breadcrumb navigation -->
{#if selectedPortfolio?.isAllPortfolios}
  <li class="inline-flex items-center">
    <ChevronRight class="w-4 h-4 text-foreground-tertiary mx-1 md:mx-2" />
    <span class="inline-flex items-center space-x-1 font-medium text-foreground-secondary">
      <Layers class="w-4 h-4 text-blue-600 dark:text-blue-400" />
      <div class="flex flex-col">
        <span>All Portfolios</span>
      </div>
    </span>
  </li>
{:else if selectedPortfolio}
  <!-- Existing portfolio breadcrumb -->
{/if}
```

### Phase 5: Portfolio-Specific Actions

#### 5.1 Update CSV Manager Component
**File to Modify:** `src/lib/components/CSVManager.svelte`

**Changes Required:**
- Modify CSV import/export for "All" view
- Update portfolio context handling
- Ensure proper error handling for aggregated data

**Key Modifications:**
```svelte
<script lang="ts">
  // Add prop for aggregated view
  interface Props {
    selectedPortfolio: Portfolio | null;
    isAggregatedView?: boolean; // New prop
    // ... other props
  }

  let { selectedPortfolio, isAggregatedView = false }: Props = $props();

  // Update import handling
  async function handleImport(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    try {
      const content = await file.text();
      const result = parseCSV(content);

      if (!result.isValid) {
        throw new Error(`CSV validation failed: ${result.errors.join(', ')}`);
      }

      // Handle import based on view
      if (isAggregatedView) {
        // For "All" view, import to the currently selected individual portfolio
        // or show dialog to choose target portfolio
        await importToSpecificPortfolio(result.data);
      } else {
        // Import to selected portfolio
        await importToPortfolio(selectedPortfolio!.id, result.data);
      }

      onImportSuccess();
    } catch (error) {
      console.error('Import error:', error);
      setError(error instanceof Error ? error.message : 'Import failed');
    }
  }
</script>
```

#### 5.2 Hide Portfolio Management in "All" View
**File to Modify:** `src/routes/dashboard/+page.svelte`

**Changes Required:**
- Hide portfolio management actions (rename, delete) when in "All" view
- Update "Add Entry" functionality to work with portfolio context
- Show appropriate messaging for aggregated view

**Key Modifications:**
```svelte
<!-- Hide portfolio actions in "All" view -->
{#if !$isAggregatedView}
  <div class="portfolio-actions">
    <!-- Portfolio management buttons -->
  </div>
{:else}
  <div class="aggregated-view-notice">
    <p class="text-sm text-foreground-secondary">
      Portfolio management is not available in "All Portfolios" view. 
      Select a specific portfolio to manage individual portfolios.
    </p>
  </div>
{/if}

<!-- Update "Add Entry" button context -->
{#if $isAggregatedView}
  <p class="text-sm text-foreground-tertiary">
    Adding entries requires selecting a specific portfolio. Please choose a portfolio from the dropdown above.
  </p>
{/if}

<a 
  href={$isAggregatedView ? "#" : "/dashboard/add"} 
  class="btn-primary"
  class:opacity-50={$isAggregatedView}
  class:cursor-not-allowed={$isAggregatedView}
  onclick={$isAggregatedView ? (e) => e.preventDefault() : undefined}
>
  Add Entry
</a>
```

### Phase 6: Utility Functions and Data Processing

#### 6.1 Add Portfolio Aggregation Utilities
**File to Modify:** `src/lib/utils.ts`

**Changes Required:**
- Add utility functions for portfolio aggregation
- Ensure stats calculations work with aggregated data
- Handle edge cases in data processing

**Key Additions:**
```typescript
// Add to utils.ts
export interface AggregatedInvestment extends Investment {
  portfolio_count: number;
  portfolio_breakdown: Array<{
    portfolio_id: number;
    portfolio_name: string;
    value: number;
  }>;
}

export function aggregatePortfolioInvestments(
  investments: Investment[], 
  portfolioNames: Record<number, string>
): AggregatedInvestment[] {
  const aggregatedMap = new Map<string, AggregatedInvestment>();
  
  investments.forEach(investment => {
    const date = typeof investment.date === 'string' 
      ? investment.date 
      : investment.date.toISOString().split('T')[0];
    
    if (!aggregatedMap.has(date)) {
      aggregatedMap.set(date, {
        id: `aggregated-${date}`,
        user_id: investment.user_id,
        portfolio_id: 'all',
        date,
        value: 0,
        created_at: investment.created_at,
        portfolio_count: 0,
        portfolio_breakdown: []
      });
    }
    
    const aggregated = aggregatedMap.get(date)!;
    aggregated.value += investment.value;
    aggregated.portfolio_count++;
    
    if (investment.portfolio_id && portfolioNames[investment.portfolio_id]) {
      aggregated.portfolio_breakdown.push({
        portfolio_id: investment.portfolio_id,
        portfolio_name: portfolioNames[investment.portfolio_id],
        value: investment.value
      });
    }
  });
  
  return Array.from(aggregatedMap.values())
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function calculateAggregatedPortfolioStats(
  aggregatedData: AggregatedInvestment[],
  period: AggregationPeriod,
  filter: FilterPeriod
) {
  // Use existing stats calculation with aggregated data
  const stats = calculateFilteredPortfolioStats(aggregatedData);
  
  // Add portfolio-specific information
  return {
    ...stats,
    totalPortfolios: aggregatedData.length > 0 ? aggregatedData[0].portfolio_count : 0,
    averagePortfolioValue: aggregatedData.length > 0 
      ? stats.totalValue / aggregatedData[0].portfolio_count 
      : 0
  };
}
```

### Phase 7: Error Handling and Edge Cases

#### 7.1 Comprehensive Error Handling
**Files to Modify:** Various components

**Considerations:**
- User has 0 portfolios
- User has 1 portfolio (should not see "All" option)
- Portfolio has no investment data
- Date range filtering with aggregated data
- Performance with many portfolios and large datasets
- Authentication for new API endpoint

**Implementation:**
```typescript
// Add validation before showing "All" option
{#if $portfolios.length > 1}
  <!-- Show "All" portfolio option -->
{:else}
  <!-- Hide "All" option with single or no portfolios -->
{/if}

// Handle empty aggregated data
{#if $isAggregatedView && $aggregatedInvestments.length === 0}
  <div class="empty-state text-center py-12">
    <BarChart3 class="w-16 h-16 text-foreground-tertiary mx-auto mb-4" />
    <h2 class="text-xl font-semibold text-foreground-primary mb-2">No investment data found</h2>
    <p class="text-foreground-secondary mb-6">
      No investment data was found across any of your portfolios.
    </p>
    <a href="/dashboard/add" class="btn-primary">Add First Entry</a>
  </div>
{/if}

// Handle loading states
{#if $isAggregatedView && $portfolioIsLoading}
  <div class="loading-state">
    <div class="animate-pulse space-y-4">
      <div class="h-8 bg-background-tertiary rounded w-1/3"></div>
      <div class="h-4 bg-background-tertiary rounded w-2/3"></div>
    </div>
  </div>
{/if}
```

### Phase 8: Testing Strategy

#### 8.1 Unit Tests
**Files to Create:**
- `src/lib/utils.test.ts` - Test portfolio aggregation utilities
- `src/lib/stores/portfolio.test.ts` - Test portfolio store functionality

**Test Cases:**
```typescript
// Example test cases
describe('Portfolio Aggregation', () => {
  test('should aggregate investments by date correctly', () => {
    const investments = [
      { id: 1, portfolio_id: 1, date: '2023-01-01', value: 1000 },
      { id: 2, portfolio_id: 2, date: '2023-01-01', value: 2000 },
      { id: 3, portfolio_id: 1, date: '2023-01-02', value: 1500 }
    ];
    
    const result = aggregatePortfolioInvestments(investments, {
      1: 'Portfolio 1',
      2: 'Portfolio 2'
    });
    
    expect(result).toHaveLength(2);
    expect(result[0].value).toBe(3000); // 1000 + 2000 for 2023-01-01
    expect(result[0].portfolio_count).toBe(2);
  });
  
  test('should handle empty investments array', () => {
    const result = aggregatePortfolioInvestments([], {});
    expect(result).toEqual([]);
  });
});
```

#### 8.2 Integration Tests
**Test Scenarios:**
1. User with 0 portfolios - should not see "All" option
2. User with 1 portfolio - should not see "All" option
3. User with multiple portfolios - should see "All" option
4. Aggregated data accuracy across different date ranges
5. Performance with many portfolios and large datasets
6. Authentication and authorization for new endpoint
7. UI responsiveness with aggregated data
8. Edge cases (empty data, missing dates, etc.)

#### 8.3 End-to-End Tests
**Test Flow:**
1. Create multiple portfolios
2. Add investments to different portfolios
3. Switch to "All Portfolios" view
4. Verify aggregated data accuracy
5. Test portfolio management actions are hidden
6. Test CSV import/export functionality
7. Test navigation between views

### Phase 9: Performance Optimization

#### 9.1 Caching Strategy
**Implementation:**
```typescript
// Add to portfolio store
interface PortfolioState {
  // ... existing fields
  aggregatedCache: {
    data: AggregatedInvestment[];
    timestamp: number;
    ttl: number; // Time to live in milliseconds
  } | null;
}

// Add caching to aggregated data loading
async loadAggregatedInvestments(forceRefresh = false) {
  const cache = this.aggregatedCache;
  const now = Date.now();
  
  if (!forceRefresh && cache && (now - cache.timestamp) < cache.ttl) {
    return cache.data;
  }
  
  // Fetch fresh data and update cache
  const data = await this.fetchAggregatedInvestments();
  this.aggregatedCache = {
    data,
    timestamp: now,
    ttl: 5 * 60 * 1000 // 5 minutes
  };
  
  return data;
}
```

#### 9.2 Lazy Loading
**Implementation:**
```typescript
// Only load aggregated data when needed
$effect(() => {
  if ($selectedPortfolio?.id === 'all' && !$aggregatedInvestments.length) {
    // Trigger data loading
    portfolioStore.loadAggregatedInvestments();
  }
});
```

### Phase 10: Documentation Updates

#### 10.1 API Documentation
**File to Create:** `docs/api/portfolios-all.md`

**Content:**
```markdown
# Get All Portfolio Investments (Aggregated)

## Endpoint
`GET /api/portfolios/all/investments`

## Description
Returns aggregated investment data from all portfolios for the authenticated user.

## Authentication
Requires valid user session.

## Response Format
```json
[
  {
    "id": "aggregated-2023-01-01",
    "user_id": 123,
    "portfolio_id": "all",
    "date": "2023-01-01",
    "value": 15000.00,
    "created_at": "2023-01-01T00:00:00Z",
    "portfolio_count": 3,
    "portfolio_breakdown": [
      {
        "portfolio_id": 1,
        "portfolio_name": "Main Portfolio",
        "value": 8000.00
      }
    ]
  }
]
```

## Error Responses
- `401 Unauthorized`: User not authenticated
- `500 Internal Server Error`: Server error processing request
```

#### 10.2 User Guide Updates
**File to Update:** `docs/user-guide.md`

**Add section:**
```markdown
# All Portfolios View

The "All Portfolios" dashboard provides a combined view of all your portfolios in a single dashboard.

## When is it Available?
The "All Portfolios" option appears in the portfolio selector when you have more than one portfolio.

## Features
- Combined investment data from all portfolios
- Same chart and statistics as individual portfolios
- Aggregated performance metrics
- Portfolio breakdown information

## Limitations
- Portfolio management actions (rename, delete) are not available in this view
- Adding new entries requires selecting a specific portfolio
- CSV operations work with the currently selected individual portfolio
```

#### 10.3 Developer Documentation
**File to Create:** `docs/development/portfolio-aggregation.md`

**Content:**
```markdown
# Portfolio Aggregation Implementation

## Overview
The portfolio aggregation feature allows users to view combined data from all their portfolios in a single dashboard view.

## Architecture
- Backend: New API endpoint `/api/portfolios/all/investments`
- Frontend: Extended portfolio store with aggregation support
- UI: Modified portfolio selector to include "All" option
- State: New store fields for aggregated data management

## Data Flow
1. User selects "All Portfolios" in dropdown
2. Portfolio store triggers aggregated data loading
3. API endpoint fetches and aggregates data from all portfolios
4. Data is cached and provided to dashboard components
5. UI updates to show aggregated view

## Key Components
- `portfolioStore.loadAggregatedInvestments()`: Loads aggregated data
- `isAggregatedView` derived store: Tracks current view state
- `PortfolioSelector.svelte`: Includes "All" option when appropriate
- Dashboard components: Handle aggregated data display
```

## Implementation Timeline

### Week 1: Backend Foundation
- [ ] Create aggregated data API endpoint
- [ ] Add database utility functions
- [ ] Implement basic error handling
- [ ] Add authentication and authorization

### Week 2: Frontend Foundation
- [ ] Modify portfolio selector components
- [ ] Update dashboard header component
- [ ] Extend portfolio store with aggregation support
- [ ] Add derived stores for aggregated data

### Week 3: Integration and UI
- [ ] Update dashboard page data loading
- [ ] Modify breadcrumb navigation
- [ ] Update portfolio-specific actions
- [ ] Add utility functions for data processing

### Week 4: Polish and Testing
- [ ] Implement comprehensive error handling
- [ ] Add performance optimizations
- [ ] Create unit and integration tests
- [ ] Update documentation
- [ ] Final testing and bug fixes

## Risk Mitigation

### Potential Risks
1. **Performance Issues**: Large datasets with many portfolios
   - **Mitigation**: Implement caching and lazy loading
   
2. **User Confusion**: Unclear difference between individual and aggregated views
   - **Mitigation**: Clear UI indicators and user guidance
   
3. **Data Integrity**: Complex aggregation logic
   - **Mitigation**: Comprehensive testing and validation
   
4. **Testing Complexity**: Multiple portfolio scenarios
   - **Mitigation**: Automated test suite with various configurations

### Success Criteria
- [ ] Users with multiple portfolios can view aggregated data
- [ ] "All Portfolios" option only appears when appropriate
- [ ] Dashboard performance remains acceptable with multiple portfolios
- [ ] Data aggregation is accurate and consistent
- [ ] All existing functionality continues to work
- [ ] UI is responsive and accessible
- [ ] Comprehensive test coverage
- [ ] Documentation is complete and accurate

## Conclusion

This implementation plan provides a comprehensive roadmap for adding the "All Portfolios" feature while maintaining the application's existing functionality and user experience. The feature will be implemented in phases to ensure stability and allow for proper testing at each stage.

The key principle is to aggregate data on-the-fly without requiring database schema changes, ensuring the feature can be deployed alongside existing functionality without disruption.