<script lang="ts">
  import { Upload, Download, FileText, AlertCircle, CheckCircle, X } from 'lucide-svelte';
  import type { AggregationPeriod, FilterPeriod } from '$lib/utils';

  interface Props {
    selectedPeriod: AggregationPeriod;
    selectedFilter: FilterPeriod;
    onImportSuccess?: () => void;
  }

  let { selectedPeriod, selectedFilter, onImportSuccess }: Props = $props();

  let fileInput: HTMLInputElement;
  let isImporting = $state(false);
  let isExporting = $state(false);
  let importResult = $state<{ success: boolean; message: string; errors?: string[] } | null>(null);
  let showImportDialog = $state(false);

  async function handleFileImport(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    
    if (!file) return;

    isImporting = true;
    importResult = null;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/investments/import', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        importResult = {
          success: true,
          message: result.message
        };
        onImportSuccess?.();
      } else {
        importResult = {
          success: false,
          message: result.error,
          errors: result.errors
        };
      }
    } catch (error) {
      importResult = {
        success: false,
        message: 'Failed to import CSV file'
      };
    } finally {
      isImporting = false;
      // Clear the file input
      if (fileInput) {
        fileInput.value = '';
      }
    }
  }

  async function handleExport() {
    isExporting = true;

    try {
      const params = new URLSearchParams({
        period: selectedPeriod,
        filter: selectedFilter
      });

      const response = await fetch(`/api/investments/export?${params}`);

      if (response.ok) {
        // Get the filename from the Content-Disposition header
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = 'investments.csv';
        
        if (contentDisposition) {
          const match = contentDisposition.match(/filename="(.+)"/);
          if (match) {
            filename = match[1];
          }
        }

        // Download the file
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
      } else {
        const error = await response.json();
        alert(`Export failed: ${error.error}`);
      }
    } catch (error) {
      alert('Failed to export CSV file');
    } finally {
      isExporting = false;
    }
  }

  function closeImportDialog() {
    showImportDialog = false;
    importResult = null;
  }
</script>

<div class="flex items-center space-x-4">
  <!-- Export Button -->
  <button
    onclick={handleExport}
    disabled={isExporting}
    class="btn-secondary flex items-center space-x-2"
    title="Export current filtered data to CSV"
  >
    <Download class="w-4 h-4" />
    <span>{isExporting ? 'Exporting...' : 'Export CSV'}</span>
  </button>

  <!-- Import Button -->
  <button
    onclick={() => showImportDialog = true}
    class="btn-primary flex items-center space-x-2"
    title="Import investments from CSV file"
  >
    <Upload class="w-4 h-4" />
    <span>Import CSV</span>
  </button>
</div>

<!-- Import Dialog -->
{#if showImportDialog}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Import CSV File</h3>
        <button
          onclick={closeImportDialog}
          class="text-gray-400 hover:text-gray-600"
        >
          <X class="w-6 h-6" />
        </button>
      </div>

      <div class="mb-4">
        <p class="text-sm text-gray-600 mb-3">
          Upload a CSV file with investment data. The file should have two columns: Date (YYYY-MM-DD) and Value.
        </p>
        
        <div class="bg-gray-50 rounded-md p-3 mb-3">
          <p class="text-xs text-gray-500 mb-1">Example format:</p>
          <code class="text-xs text-gray-700">
            Date,Value<br>
            2024-01-01,254000<br>
            2024-01-02,255500
          </code>
        </div>

        <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <FileText class="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <input
            bind:this={fileInput}
            type="file"
            accept=".csv"
            onchange={handleFileImport}
            disabled={isImporting}
            class="hidden"
            id="csv-file-input"
          />
          <label
            for="csv-file-input"
            class="cursor-pointer text-blue-600 hover:text-blue-800 font-medium"
          >
            {isImporting ? 'Processing...' : 'Choose CSV file'}
          </label>
          <p class="text-xs text-gray-500 mt-1">Maximum file size: 5MB</p>
        </div>
      </div>

      <!-- Import Result -->
      {#if importResult}
        <div class="mb-4">
          {#if importResult.success}
            <div class="bg-green-50 border border-green-200 rounded-md p-3">
              <div class="flex items-center">
                <CheckCircle class="w-5 h-5 text-green-600 mr-2" />
                <p class="text-sm text-green-800">{importResult.message}</p>
              </div>
            </div>
          {:else}
            <div class="bg-red-50 border border-red-200 rounded-md p-3">
              <div class="flex items-start">
                <AlertCircle class="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p class="text-sm text-red-800 mb-1">{importResult.message}</p>
                  {#if importResult.errors && importResult.errors.length > 0}
                    <div class="text-xs text-red-700">
                      <p class="font-medium mb-1">Errors:</p>
                      <ul class="list-disc list-inside space-y-1 max-h-32 overflow-y-auto">
                        {#each importResult.errors as error}
                          <li>{error}</li>
                        {/each}
                      </ul>
                    </div>
                  {/if}
                </div>
              </div>
            </div>
          {/if}
        </div>
      {/if}

      <div class="flex justify-end space-x-3">
        <button
          onclick={closeImportDialog}
          class="btn-secondary"
        >
          Close
        </button>
      </div>
    </div>
  </div>
{/if} 