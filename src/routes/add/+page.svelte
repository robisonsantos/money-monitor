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
        goto('/');
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

<div class="max-w-2xl mx-auto">
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-gray-900">
      {isEditMode ? 'Edit Investment Entry' : 'Add Investment Entry'}
    </h1>
    <p class="text-gray-600 mt-1">
      {isEditMode ? 'Update your portfolio value for this date' : 'Record your portfolio value for a specific date'}
    </p>
  </div>

  <div class="card">
    {#if isEditMode}
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div class="flex items-center">
          <Edit3 class="w-5 h-5 text-blue-600 mr-3" />
          <p class="text-blue-800 font-medium">Editing existing entry for {formatDate(date)}</p>
        </div>
        <p class="text-blue-700 text-sm mt-1">You can update the portfolio value below.</p>
      </div>
    {/if}

    {#if success}
      <div class="bg-success-50 border border-success-200 rounded-lg p-4 mb-6">
        <div class="flex items-center">
          <div class="w-5 h-5 text-success-600 mr-3">✓</div>
          <p class="text-success-800 font-medium">
            Investment entry {isEditMode ? 'updated' : 'saved'} successfully!
          </p>
        </div>
        <p class="text-success-700 text-sm mt-1">Redirecting to dashboard...</p>
      </div>
    {/if}

    {#if error}
      <div class="bg-danger-50 border border-danger-200 rounded-lg p-4 mb-6">
        <div class="flex items-center">
          <AlertCircle class="w-5 h-5 text-danger-600 mr-3" />
          <p class="text-danger-800 font-medium">{error}</p>
        </div>
      </div>
    {/if}

    <form onsubmit={handleSubmit} class="space-y-6">
      <div>
        <label for="date" class="block text-sm font-medium text-gray-700 mb-2">
          Date
        </label>
        <input
          id="date"
          type="date"
          bind:value={date}
          class="input {isEditMode ? 'bg-gray-100 cursor-not-allowed text-gray-600' : ''}"
          required
          disabled={isLoading || isEditMode}
          readonly={isEditMode}
        />
        {#if dateWarning}
          <p class="text-sm text-amber-600 mt-1 font-medium">
            {dateWarning}
          </p>
        {/if}
        <p class="text-sm text-gray-500 mt-1">
          {isEditMode ? 'Date cannot be changed when editing an existing entry' : 'Select the date for this investment value'}
        </p>
      </div>

      <div>
        <label for="value" class="block text-sm font-medium text-gray-700 mb-2">
          Portfolio Value ($)
        </label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span class="text-gray-500 sm:text-sm">$</span>
          </div>
          <input
            id="value"
            type="number"
            step="0.01"
            min="0"
            bind:value={value}
            class="input pl-7"
            placeholder={isLoading && isEditMode ? "Loading..." : "0.00"}
            required
            disabled={isLoading}
            onkeydown={handleKeydown}
          />
        </div>
        <p class="text-sm text-gray-500 mt-1">
          Enter the total value of your investment portfolio
        </p>
      </div>

      <div class="flex items-center space-x-4 pt-4">
        <button
          type="submit"
          class="btn-primary flex items-center space-x-2"
          disabled={isLoading || (!isEditMode && !!dateWarning)}
        >
          {#if isLoading}
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>{isEditMode ? 'Updating...' : 'Saving...'}</span>
          {:else if isEditMode}
            <Edit3 class="w-4 h-4" />
            <span>Update Entry</span>
          {:else}
            <Save class="w-4 h-4" />
            <span>Save Entry</span>
          {/if}
        </button>

        <a href="/" class="btn-secondary">
          Cancel
        </a>
      </div>

      {#if !isEditMode && dateWarning}
        <p class="text-sm text-amber-600 mt-2 flex items-center">
          <AlertCircle class="w-4 h-4 mr-2" />
          Please select a different date or use the edit functionality to update the existing entry.
        </p>
      {/if}
    </form>
  </div>

  <!-- Quick Tips -->
  <div class="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
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