<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { Plus, Save, AlertCircle, Edit3 } from 'lucide-svelte';
  import { format } from 'date-fns';
  import { formatDate } from '$lib/utils';
  import { onMount } from 'svelte';

  let date = $state(format(new Date(), 'yyyy-MM-dd'));
  let value = $state('');
  let isLoading = $state(false);
  let error = $state('');
  let success = $state(false);
  let isEditMode = $state(false);
  let originalDate = $state('');
  let dateWarning = $state('');

  // Reactive check for edit mode based on URL parameters
  $effect(() => {
    const editDate = $page.url.searchParams.get('edit');
    
    if (editDate && editDate !== originalDate) {
      isEditMode = true;
      originalDate = editDate;
      date = editDate;
      loadExistingData(editDate);
    } else if (!editDate && isEditMode) {
      // Reset to add mode if no edit parameter
      isEditMode = false;
      originalDate = '';
      date = format(new Date(), 'yyyy-MM-dd');
      value = '';
      error = '';
    }
  });

  // Real-time date validation for new entries
  $effect(() => {
    if (!isEditMode && date && date !== format(new Date(), 'yyyy-MM-dd')) {
      checkDateExists(date).then(dateExists => {
        if (dateExists) {
          dateWarning = `⚠️ An entry already exists for ${formatDate(date)}`;
        } else {
          dateWarning = '';
        }
      }).catch(() => {
        dateWarning = '';
      });
    } else {
      dateWarning = '';
    }
  });

  async function loadExistingData(editDate: string) {
    isLoading = true;
    error = '';
    
    try {
      const response = await fetch(`/api/investments`);
      if (!response.ok) {
        throw new Error('Failed to fetch investments');
      }
      
      const investments = await response.json();
      const existingInvestment = investments.find((inv: any) => inv.date === editDate);
      
      if (existingInvestment) {
        value = existingInvestment.value.toString();
      } else {
        error = 'Investment not found for this date';
      }
    } catch (err) {
      error = 'Failed to load investment data';
      console.error('Error loading investment data:', err);
    } finally {
      isLoading = false;
    }
  }

  async function checkDateExists(dateToCheck: string): Promise<boolean> {
    try {
      const response = await fetch('/api/investments');
      if (response.ok) {
        const investments = await response.json();
        return investments.some((inv: any) => inv.date === dateToCheck);
      }
    } catch (err) {
      console.error('Error checking existing dates:', err);
    }
    return false;
  }

  async function handleSubmit(event?: SubmitEvent) {
    event?.preventDefault();
    if (!date || !value) {
      error = 'Please fill in all fields';
      return;
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) {
      error = 'Please enter a valid positive number';
      return;
    }

    // Check for duplicate dates only when creating new entries
    if (!isEditMode) {
      const dateExists = await checkDateExists(date);
      if (dateExists) {
        error = `An investment entry already exists for ${formatDate(date)}. Please use the edit functionality to update it, or choose a different date.`;
        return;
      }
    }

    isLoading = true;
    error = '';

    try {
      const method = isEditMode ? 'PUT' : 'POST';
      const response = await fetch('/api/investments', {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date,
          value: numValue
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle specific conflict error (409) for duplicate dates
        if (response.status === 409) {
          error = `${errorData.error} Current value: $${errorData.existingValue?.toLocaleString() || 'N/A'}`;
        } else {
          throw new Error(errorData.error || `Failed to ${isEditMode ? 'update' : 'save'} investment`);
        }
        return;
      }

      success = true;
      
      if (!isEditMode) {
        // Reset form only for new entries
        value = '';
        date = format(new Date(), 'yyyy-MM-dd');
      }
      
      // Show success message briefly then redirect
      setTimeout(() => {
        goto('/dashboard');
      }, 1500);

    } catch (err) {
      error = err instanceof Error ? err.message : 'An error occurred';
    } finally {
      isLoading = false;
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  }
</script>

<svelte:head>
  <title>{isEditMode ? 'Edit Entry' : 'Add Entry'} - Money Monitor</title>
</svelte:head>

<!-- Enhanced layout with better spacing and background -->
<div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 -mx-4 -my-6 px-4 py-8 sm:px-6 sm:py-12">
  <div class="max-w-2xl mx-auto">
    <!-- Enhanced header section -->
    <div class="text-center mb-10">
      <div class="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
        {#if isEditMode}
          <Edit3 class="w-8 h-8 text-blue-600" />
        {:else}
          <Plus class="w-8 h-8 text-blue-600" />
        {/if}
      </div>
      <h1 class="text-4xl font-bold text-gray-900 mb-3">
        {isEditMode ? 'Edit Investment Entry' : 'Add Investment Entry'}
      </h1>
      <p class="text-lg text-gray-600 max-w-md mx-auto">
        {isEditMode ? 'Update your portfolio value for this date' : 'Record your portfolio value for a specific date'}
      </p>
    </div>

    <!-- Enhanced main form card -->
    <div class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">
      <!-- Form content with enhanced padding -->
      <div class="p-8 sm:p-10">
        {#if isEditMode}
          <div class="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <div class="flex items-center">
              <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <Edit3 class="w-5 h-5 text-blue-600" />
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
                  Investment entry {isEditMode ? 'updated' : 'saved'} successfully!
                </p>
                <p class="text-success-700 text-sm mt-1">Redirecting to dashboard...</p>
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

        <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-8">
          <div>
            <label for="date" class="block text-sm font-semibold text-gray-800 mb-3">
              Date
            </label>
            <input
              id="date"
              type="date"
              bind:value={date}
              class="w-full px-4 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all {isEditMode ? 'bg-gray-50 cursor-not-allowed text-gray-600' : 'bg-white'}"
              required
              disabled={isLoading || isEditMode}
              readonly={isEditMode}
            />
            {#if dateWarning}
              <p class="text-sm text-amber-600 mt-3 font-medium flex items-center">
                <AlertCircle class="w-4 h-4 mr-2" />
                {dateWarning}
              </p>
            {/if}
            <p class="text-sm text-gray-500 mt-3">
              {isEditMode ? 'Date cannot be changed when editing an existing entry' : 'Select the date for this investment value'}
            </p>
          </div>

          <div>
            <label for="value" class="block text-sm font-semibold text-gray-800 mb-3">
              Portfolio Value ($)
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span class="text-gray-500 text-lg font-medium">$</span>
              </div>
              <input
                id="value"
                type="number"
                step="0.01"
                min="0"
                bind:value={value}
                class="w-full pl-8 pr-4 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                placeholder={isLoading && isEditMode ? "Loading..." : "0.00"}
                required
                disabled={isLoading}
                onkeydown={handleKeydown}
              />
            </div>
            <p class="text-sm text-gray-500 mt-3">
              Enter the total value of your investment portfolio
            </p>
          </div>

          <div class="flex flex-col sm:flex-row items-center gap-4 pt-6">
            <button
              type="submit"
              class="w-full sm:w-auto btn-primary flex items-center justify-center space-x-3 px-8 py-4 text-lg font-semibold rounded-xl"
              disabled={isLoading || (!isEditMode && !!dateWarning)}
            >
              {#if isLoading}
                <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>{isEditMode ? 'Updating...' : 'Saving...'}</span>
              {:else if isEditMode}
                <Edit3 class="w-5 h-5" />
                <span>Update Entry</span>
              {:else}
                <Save class="w-5 h-5" />
                <span>Save Entry</span>
              {/if}
            </button>

            <a href="/dashboard" class="w-full sm:w-auto btn-secondary px-8 py-4 text-lg font-semibold rounded-xl text-center">
              Cancel
            </a>
          </div>

          {#if !isEditMode && dateWarning}
            <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-6">
              <p class="text-sm text-amber-800 flex items-center">
                <AlertCircle class="w-4 h-4 mr-2 flex-shrink-0" />
                Please select a different date or use the edit functionality to update the existing entry.
              </p>
            </div>
          {/if}
        </form>
      </div>
    </div>

    <!-- Enhanced Quick Tips -->
    <div class="bg-blue-50 border border-blue-200 rounded-xl p-6">
      <div class="flex items-start">
        <div class="w-6 h-6 text-blue-600 mr-3 mt-0.5">💡</div>
        <div>
          <h3 class="text-sm font-medium text-blue-900 mb-2">Tips for accurate tracking:</h3>
          <ul class="text-sm text-blue-800 space-y-1">
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