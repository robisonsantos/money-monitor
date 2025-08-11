<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { Plus, Save, AlertCircle, Edit3, Calendar, Folder } from "lucide-svelte";
  import { format, getDay, addDays } from "date-fns";
  import { formatDate } from "$lib/utils";
  import { onMount } from "svelte";
  import PortfolioSelector from "$lib/components/PortfolioSelector.svelte";
  import {
    portfolioStore,
    portfolios,
    selectedPortfolio,
    portfolioIsLoading,
    portfolioError,
  } from "$lib/stores/portfolio";
  import type { Portfolio } from "$lib/database";

  let date = $state(format(new Date(), "yyyy-MM-dd"));
  let value = $state("");
  let isLoading = $state(false);
  let error = $state("");
  let success = $state(false);
  let isEditMode = $state(false);
  let originalDate = $state("");
  let dateWarning = $state("");
  let carryOverWeekend = $state(false);
  let weekendCarryOverInfo = $state("");
  let currentPortfolio = $state<Portfolio | null>(null);

  // Reactive check for Friday
  const isFriday = $derived(() => {
    if (!date) return false;
    const selectedDate = new Date(date + "T00:00:00");
    return getDay(selectedDate) === 5; // 5 = Friday
  });

  // Weekend dates for display
  const weekendDates = $derived(() => {
    if (!isFriday()) return { saturday: "", sunday: "" };
    const fridayDate = new Date(date + "T00:00:00");
    const saturday = addDays(fridayDate, 1);
    const sunday = addDays(fridayDate, 2);
    return {
      saturday: format(saturday, "yyyy-MM-dd"),
      sunday: format(sunday, "yyyy-MM-dd"),
    };
  });

  // Load portfolios on mount
  $effect(() => {
    portfolioStore.loadPortfolios();
  });

  // Set current portfolio when selected portfolio changes
  $effect(() => {
    if ($selectedPortfolio) {
      currentPortfolio = $selectedPortfolio;
    }
  });

  // Reactive check for edit mode based on URL parameters
  $effect(() => {
    const editDate = $page.url.searchParams.get("edit");

    if (editDate && editDate !== originalDate) {
      isEditMode = true;
      originalDate = editDate;
      date = editDate;
      loadExistingData(editDate);
    } else if (!editDate && isEditMode) {
      // Reset to add mode if no edit parameter
      isEditMode = false;
      originalDate = "";
      date = format(new Date(), "yyyy-MM-dd");
      value = "";
      error = "";
    }
  });

  // Real-time date validation for new entries
  $effect(() => {
    if (!isEditMode && date && date !== format(new Date(), "yyyy-MM-dd")) {
      checkDateExists(date)
        .then((dateExists) => {
          if (dateExists) {
            dateWarning = `⚠️ An entry already exists for ${formatDate(date)}`;
          } else {
            dateWarning = "";
          }
        })
        .catch(() => {
          dateWarning = "";
        });
    } else {
      dateWarning = "";
    }
  });

  async function loadExistingData(editDate: string) {
    isLoading = true;
    error = "";

    try {
      // Use portfolio-specific endpoint if portfolio is selected
      const apiUrl = currentPortfolio ? `/api/portfolios/${currentPortfolio.id}/investments` : "/api/investments";
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch investments");
      }

      const investments = await response.json();
      const existingInvestment = investments.find((inv: any) => inv.date === editDate);

      if (existingInvestment) {
        value = existingInvestment.value.toString();
      } else {
        error = "Investment not found for this date";
      }
    } catch (err) {
      error = "Failed to load investment data";
      console.error("Error loading investment data:", err);
    } finally {
      isLoading = false;
    }
  }

  async function checkDateExists(dateToCheck: string): Promise<boolean> {
    try {
      // Use portfolio-specific endpoint if portfolio is selected
      const apiUrl = currentPortfolio ? `/api/portfolios/${currentPortfolio.id}/investments` : "/api/investments";
      const response = await fetch(apiUrl);
      if (response.ok) {
        const investments = await response.json();
        return investments.some((inv: any) => inv.date === dateToCheck);
      }
    } catch (err) {
      console.error("Error checking existing dates:", err);
    }
    return false;
  }

  async function handleSubmit(event?: SubmitEvent) {
    event?.preventDefault();
    if (!date || !value) {
      error = "Please fill in all fields";
      return;
    }

    if (!currentPortfolio && $portfolios.length > 0) {
      error = "Please select a portfolio";
      return;
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) {
      error = "Please enter a valid positive number";
      return;
    }

    // Check for duplicate dates only when creating new entries
    if (!isEditMode) {
      const dateExists = await checkDateExists(date);
      if (dateExists) {
        error = `An investment entry already exists for ${formatDate(date)}. Please use the edit functionality to update it, or choose a different date.`;
        return;
      }

      // Check weekend dates if carry-over is enabled
      if (carryOverWeekend && isFriday()) {
        const saturdayExists = await checkDateExists(weekendDates().saturday);
        const sundayExists = await checkDateExists(weekendDates().sunday);

        if (saturdayExists || sundayExists) {
          const existingDays = [];
          if (saturdayExists) existingDays.push("Saturday");
          if (sundayExists) existingDays.push("Sunday");
          error = `Cannot carry over to weekend: entries already exist for ${existingDays.join(" and ")}. Please edit those entries individually if needed.`;
          return;
        }
      }
    }

    isLoading = true;
    error = "";

    try {
      const method = isEditMode ? "PUT" : "POST";

      // Prepare request body - include weekend carry-over info if applicable
      const requestBody: any = {
        date,
        value: numValue,
      };

      if (!isEditMode && carryOverWeekend && isFriday()) {
        requestBody.carryOverWeekend = true;
        requestBody.weekendDates = weekendDates();
      }

      // Use portfolio-specific endpoint if portfolio is selected
      const apiUrl = currentPortfolio ? `/api/portfolios/${currentPortfolio.id}/investments` : "/api/investments";

      const response = await fetch(apiUrl, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Handle specific conflict error (409) for duplicate dates
        if (response.status === 409) {
          error = `${errorData.error} Current value: $${errorData.existingValue?.toLocaleString() || "N/A"}`;
        } else {
          throw new Error(errorData.error || `Failed to ${isEditMode ? "update" : "save"} investment`);
        }
        return;
      }

      const responseData = await response.json();
      success = true;

      // Store weekend carry-over info for success message
      if (responseData.weekendCarryOver) {
        weekendCarryOverInfo = ` Also saved for ${formatDate(responseData.weekendCarryOver.saturday)} and ${formatDate(responseData.weekendCarryOver.sunday)}.`;
      } else {
        weekendCarryOverInfo = "";
      }

      if (!isEditMode) {
        // Reset form only for new entries
        value = "";
        date = format(new Date(), "yyyy-MM-dd");
        carryOverWeekend = false;
        weekendCarryOverInfo = "";
      }

      // Show success message briefly then redirect
      setTimeout(() => {
        goto("/dashboard");
      }, 1500);
    } catch (err) {
      error = err instanceof Error ? err.message : "An error occurred";
    } finally {
      isLoading = false;
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  }
</script>

<svelte:head>
  <title>{isEditMode ? "Edit Entry" : "Add Entry"} - Money Monitor</title>
</svelte:head>

<!-- Enhanced layout with better spacing and background -->
<div
  class="min-h-screen bg-gradient-to-br from-background-secondary via-background-primary to-blue-50 dark:to-blue-900/20 -mx-4 -my-6 px-4 py-8 sm:px-6 sm:py-12"
>
  <div class="max-w-2xl mx-auto">
    <!-- Enhanced header section -->
    <div class="text-center mb-10">
      <div class="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-4">
        {#if isEditMode}
          <Edit3 class="w-8 h-8 text-blue-600 dark:text-blue-400" />
        {:else}
          <Plus class="w-8 h-8 text-blue-600 dark:text-blue-400" />
        {/if}
      </div>
      <h1 class="text-4xl font-bold text-foreground-primary mb-3">
        {isEditMode ? "Edit Investment Entry" : "Add Investment Entry"}
      </h1>
      <p class="text-lg text-foreground-secondary max-w-md mx-auto">Record your portfolio value for a specific date</p>
    </div>

    <!-- Enhanced main form card -->
    <div class="bg-background-primary rounded-2xl shadow-xl dark:shadow-none dark:ring-1 dark:ring-white/10 dark:bg-gradient-to-br dark:from-slate-800/50 dark:to-slate-900/50 border border-border-primary overflow-hidden mb-8">
      <!-- Form content with enhanced padding -->
      <div class="p-8 sm:p-10">
        {#if isEditMode}
          <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-8">
            <div class="flex items-center">
              <div class="w-10 h-10 bg-blue-100 dark:bg-blue-800/30 rounded-lg flex items-center justify-center mr-4">
                <Edit3 class="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p class="text-blue-900 font-semibold text-lg">Editing existing entry for {formatDate(date)}</p>
                <p class="text-blue-700 text-sm mt-1">You can update the portfolio value below.</p>
              </div>
            </div>
          </div>
        {/if}

        {#if success}
          <div class="bg-success-50 border border-success-200 rounded-xl p-6 mb-8">
            <div class="flex items-center">
              <div class="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center mr-4">
                <div class="w-6 h-6 text-success-600 font-bold">✓</div>
              </div>
              <div>
                <p class="text-success-900 font-semibold text-lg">
                  Investment entry {isEditMode ? "updated" : "saved"} successfully!
                </p>
                <p class="text-success-700 text-sm mt-1">
                  {#if weekendCarryOverInfo}
                    {weekendCarryOverInfo}
                  {/if}
                  Redirecting to dashboard...
                </p>
              </div>
            </div>
          </div>
        {/if}

        {#if error}
          <div class="bg-danger-50 border border-danger-200 rounded-xl p-6 mb-8">
            <div class="flex items-center">
              <div class="w-10 h-10 bg-danger-100 rounded-lg flex items-center justify-center mr-4">
                <AlertCircle class="w-5 h-5 text-danger-600" />
              </div>
              <div>
                <p class="text-danger-900 font-semibold text-lg">{error}</p>
              </div>
            </div>
          </div>
        {/if}

        <form
          onsubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          class="space-y-8"
        >
          <!-- Portfolio Selection -->
          <div>
            <label class="block text-sm font-semibold text-foreground-primary mb-3">
              <Folder class="w-4 h-4 inline mr-1" />
              Portfolio
            </label>
            {#if $portfolioIsLoading}
              <div class="animate-pulse">
                <div class="h-12 bg-background-tertiary rounded-xl"></div>
              </div>
            {:else if $portfolios.length > 0}
              <PortfolioSelector
                portfolios={$portfolios}
                selectedPortfolio={currentPortfolio}
                disabled={isLoading}
                on:select={(e) => {
                  currentPortfolio = e.detail;
                }}
                on:create={async (e) => {
                  const result = await portfolioStore.createPortfolio(e.detail.name);
                  if (result) currentPortfolio = result;
                }}
                on:rename={(e) => portfolioStore.renamePortfolio(e.detail.portfolio, e.detail.newName)}
                on:delete={(e) => portfolioStore.deletePortfolio(e.detail)}
              />
              {#if $portfolioError}
                <p class="text-sm text-danger-600 dark:text-danger-400 mt-2">
                  <AlertCircle class="w-4 h-4 inline mr-1" />
                  {$portfolioError}
                </p>
              {/if}
            {:else}
              <div
                class="bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-xl p-4"
              >
                <p class="text-warning-800 dark:text-warning-300 text-sm">
                  <AlertCircle class="w-4 h-4 inline mr-1" />
                  No portfolios found. Create a portfolio first to add investments.
                </p>
              </div>
            {/if}
            <p class="text-sm text-foreground-tertiary mt-3">Select the portfolio to add this investment entry to</p>
          </div>

          <div>
            <label for="date" class="block text-sm font-semibold text-foreground-primary mb-3">Date</label>
            <input
              id="date"
              type="date"
              bind:value={date}
              class="w-full px-4 py-4 text-lg border border-border-primary rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-background-primary text-foreground-primary {isEditMode
                ? 'bg-background-secondary cursor-not-allowed text-foreground-tertiary'
                : ''}"
              required
              disabled={isLoading || isEditMode}
              readonly={isEditMode}
            />
            {#if dateWarning}
              <p class="text-sm text-warning-600 dark:text-warning-400 mt-3 font-medium flex items-center">
                <AlertCircle class="w-4 h-4 mr-2" />
                {dateWarning}
              </p>
            {/if}
            <p class="text-sm text-foreground-tertiary mt-3">
              {isEditMode
                ? "Date cannot be changed when editing an existing entry"
                : "Select the date for this investment value"}
            </p>
          </div>

          <div>
            <label for="value" class="block text-sm font-semibold text-foreground-primary mb-3">
              Portfolio Value ($)
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span class="text-foreground-tertiary text-lg font-medium">$</span>
              </div>
              <input
                id="value"
                type="number"
                step="0.01"
                min="0"
                bind:value
                class="w-full pl-10 pr-4 py-4 text-lg border border-border-primary rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-background-primary text-foreground-primary"
                placeholder="0.00"
                required
                disabled={isLoading}
                onkeydown={handleKeydown}
              />
            </div>
            <p class="text-sm text-foreground-tertiary mt-3">Enter the total value of your investment portfolio</p>
          </div>

          {#if !isEditMode && isFriday()}
            <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
              <div class="flex items-start">
                <div class="flex items-center h-5 mr-4 mt-0.5">
                  <input
                    id="carryOverWeekend"
                    type="checkbox"
                    bind:checked={carryOverWeekend}
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={isLoading}
                  />
                </div>
                <div class="flex-1">
                  <label
                    for="carryOverWeekend"
                    class="block text-sm font-medium text-blue-900 dark:text-blue-100 mb-2 cursor-pointer"
                  >
                    <Calendar class="w-4 h-4 inline mr-2" />
                    Copy this value to weekend days
                  </label>
                  <p class="text-sm text-blue-700 dark:text-blue-200 mb-3">
                    Since markets are closed on weekends, this will also save the same value for:
                  </p>
                  <div class="flex flex-col sm:flex-row gap-2 text-sm">
                    <span
                      class="bg-blue-100 dark:bg-blue-800/30 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-lg font-medium"
                    >
                      📅 Saturday: {formatDate(weekendDates().saturday)}
                    </span>
                    <span
                      class="bg-blue-100 dark:bg-blue-800/30 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-lg font-medium"
                    >
                      📅 Sunday: {formatDate(weekendDates().sunday)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          {/if}

          <div class="flex flex-col sm:flex-row items-center gap-4 pt-6">
            <button
              type="submit"
              class="w-full sm:w-auto btn-primary flex items-center justify-center space-x-3 px-8 py-4 text-lg font-semibold rounded-xl"
              disabled={isLoading || (!isEditMode && !!dateWarning)}
            >
              {#if isLoading}
                <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>{isEditMode ? "Updating..." : "Saving..."}</span>
              {:else if isEditMode}
                <Edit3 class="w-5 h-5" />
                <span>Update Entry</span>
              {:else}
                <Save class="w-5 h-5" />
                <span>Save Entry</span>
              {/if}
            </button>

            <a
              href="/dashboard"
              class="w-full sm:w-auto btn-secondary px-8 py-4 text-lg font-semibold rounded-xl text-center"
            >
              Cancel
            </a>
          </div>

          {#if !isEditMode && dateWarning}
            <div
              class="bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-xl p-4 mt-6"
            >
              <p class="text-sm text-warning-800 dark:text-warning-300 flex items-center">
                <AlertCircle class="w-4 h-4 mr-2 flex-shrink-0" />
                Entry for this date already exists and will be updated
              </p>
            </div>
          {/if}
        </form>
      </div>
    </div>

    <!-- Enhanced Quick Tips -->
    <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 dark:bg-gradient-to-br dark:from-slate-800/40 dark:to-slate-900/40 dark:ring-1 dark:ring-white/10">
      <div class="flex items-start">
        <div class="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3 mt-0.5">💡</div>
        <div>
          <h3 class="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">Tips for accurate tracking:</h3>
          <ul class="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Record values at market close for consistency</li>
            <li>• Include all investment accounts in your total</li>
            <li>• Update regularly for better trend analysis</li>
            <li>• Use the same valuation method each time</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</div>
