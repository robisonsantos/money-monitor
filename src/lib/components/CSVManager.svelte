<script lang="ts">
  import { Upload, Download, FileText, AlertCircle, CheckCircle, X } from "lucide-svelte";
  import type { AggregationPeriod, FilterPeriod } from "$lib/utils";
  import type { Portfolio } from "$lib/database";

  interface Props {
    selectedPeriod: AggregationPeriod;
    selectedFilter: FilterPeriod;
    selectedPortfolio?: Portfolio | null;
    isAllPortfoliosSelected?: boolean;
    onImportSuccess?: () => void;
    importOnly?: boolean; // Show only import button (for empty states)
  }

  let { selectedPeriod, selectedFilter, selectedPortfolio, isAllPortfoliosSelected = false, onImportSuccess, importOnly = false }: Props = $props();

  let fileInput: HTMLInputElement | undefined = $state();
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
      formData.append("file", file);

      // Add portfolio ID if available (not allowed when All Portfolios is selected)
      if (selectedPortfolio && !isAllPortfoliosSelected) {
        formData.append("portfolioId", selectedPortfolio.id.toString());
      }

      // Check if we can import (must have a specific portfolio selected)
      if (isAllPortfoliosSelected) {
        importResult = {
          success: false,
          message: "Please select a specific portfolio to import data. You cannot import to the 'All Portfolios' view.",
        };
        isImporting = false;
        return;
      }

      const response = await fetch("/api/investments/import", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const result = await response.json();

      if (response.ok) {
        importResult = {
          success: true,
          message: result.message,
        };
        onImportSuccess?.();
      } else {
        importResult = {
          success: false,
          message: result.error,
          errors: result.errors,
        };
      }
    } catch (error) {
      console.error("CSV import error:", error);
      importResult = {
        success: false,
        message: `Failed to import CSV file: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    } finally {
      isImporting = false;
      // Clear the file input
      if (fileInput) {
        fileInput.value = "";
      }
    }
  }

  async function handleExport() {
    isExporting = true;

    try {
      const params = new URLSearchParams({
        period: selectedPeriod,
        filter: selectedFilter,
      });

      // Add portfolio ID if available (not allowed when All Portfolios is selected)
      if (selectedPortfolio && !isAllPortfoliosSelected) {
        params.set("portfolioId", selectedPortfolio.id.toString());
      }

      // Check if we can export (must have a specific portfolio selected)
      if (isAllPortfoliosSelected) {
        alert("Please select a specific portfolio to export data. You cannot export from the 'All Portfolios' view.");
        isExporting = false;
        return;
      }

      const response = await fetch(`/api/investments/export?${params}`, {
        credentials: "include",
      });

      if (response.ok) {
        // Get the filename from the Content-Disposition header
        const contentDisposition = response.headers.get("Content-Disposition");
        let filename = "investments.csv";

        if (contentDisposition) {
          const match = contentDisposition.match(/filename="(.+)"/);
          if (match) {
            filename = match[1];
          }
        }

        // Download the file
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
      } else {
        const error = await response.json();
        alert(`Export failed: ${error.error}`);
      }
    } catch (error) {
      alert("Failed to export CSV file");
    } finally {
      isExporting = false;
    }
  }

  function closeImportDialog() {
    showImportDialog = false;
    importResult = null;
  }
</script>

<div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
  <!-- Export Button (hidden in import-only mode) -->
  {#if !importOnly}
    <button
      onclick={handleExport}
      disabled={isExporting || isAllPortfoliosSelected}
      class="btn-secondary flex items-center justify-center space-x-2 w-full sm:w-auto {isAllPortfoliosSelected ? 'opacity-50 cursor-not-allowed' : ''}"
      title={isAllPortfoliosSelected ? "Export not available in All Portfolios view. Select a specific portfolio." : "Export current filtered data to CSV"}
    >
      <Download class="w-4 h-4" />
      <span>{isExporting ? "Exporting..." : isAllPortfoliosSelected ? "Export (Select Portfolio)" : "Export CSV"}</span>
    </button>
  {/if}

  <!-- Import Button -->
  <button
    onclick={() => (showImportDialog = true)}
    disabled={isAllPortfoliosSelected}
    class="btn-primary flex items-center justify-center space-x-2 w-full sm:w-auto {isAllPortfoliosSelected ? 'opacity-50 cursor-not-allowed' : ''}"
    title={isAllPortfoliosSelected ? "Import not available in All Portfolios view. Select a specific portfolio." : "Import investments from CSV file"}
  >
    <Upload class="w-4 h-4" />
    <span>{isAllPortfoliosSelected ? "Import (Select Portfolio)" : "Import CSV"}</span>
  </button>
</div>

<!-- Import Dialog -->
{#if showImportDialog}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-background-primary rounded-lg p-6 max-w-md w-full mx-4 border border-border-primary shadow-xl dark:shadow-none dark:ring-1 dark:ring-white/10 dark:bg-gradient-to-br dark:from-slate-800/50 dark:to-slate-900/50">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-foreground-primary">Import CSV File</h3>
        <button onclick={closeImportDialog} class="text-foreground-tertiary hover:text-foreground-secondary">
          <X class="w-6 h-6" />
        </button>
      </div>

      <div class="mb-4">
        <p class="text-sm text-foreground-secondary mb-3">
          Upload a CSV file with investment data. The file should have two columns: Date (YYYY-MM-DD) and Value.
          {#if isAllPortfoliosSelected}
            <br /><span class="text-amber-600 dark:text-amber-400 font-medium">⚠️ Please select a specific portfolio to import data.</span>
          {:else if selectedPortfolio}
            <br /><strong>Importing to:</strong> {selectedPortfolio.name}
          {:else}
            <br /><span class="text-amber-600 dark:text-amber-400 font-medium">⚠️ Please select a portfolio to import data.</span>
          {/if}
        </p>

        <div class="bg-background-secondary rounded-md p-3 mb-3">
          <p class="text-xs text-foreground-tertiary mb-1">Example format:</p>
          <code class="text-xs text-foreground-secondary">
            Date,Value<br />
            2024-01-01,254000<br />
            2024-01-02,255500
          </code>
        </div>

        <div class="border-2 border-dashed border-border-secondary rounded-lg p-6 text-center">
          <FileText class="w-8 h-8 text-foreground-tertiary mx-auto mb-2" />
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
            class="{isAllPortfoliosSelected ? 'cursor-not-allowed text-foreground-tertiary' : 'cursor-pointer text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'} font-medium"
          >
            {isImporting ? "Processing..." : isAllPortfoliosSelected ? "Select Portfolio First" : "Choose CSV file"}
          </label>
          <p class="text-xs text-foreground-tertiary mt-1">Maximum file size: 5MB</p>
        </div>
      </div>

      <!-- Import Result -->
      {#if importResult}
        <div class="mb-4">
          {#if importResult.success}
            <div
              class="bg-success-50 border border-success-200 rounded-md p-3 dark:bg-success-900/20 dark:border-success-800"
            >
              <div class="flex items-center">
                <CheckCircle class="w-5 h-5 text-success-600 dark:text-success-400 mr-2" />
                <p class="text-sm text-success-800 dark:text-success-300">{importResult.message}</p>
              </div>
            </div>
          {:else}
            <div
              class="bg-danger-50 border border-danger-200 rounded-md p-3 dark:bg-danger-900/20 dark:border-danger-800"
            >
              <div class="flex items-start">
                <AlertCircle class="w-5 h-5 text-danger-600 dark:text-danger-400 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p class="text-sm text-danger-800 dark:text-danger-300 mb-1">{importResult.message}</p>
                  {#if importResult.errors && importResult.errors.length > 0}
                    <div class="text-xs text-danger-700 dark:text-danger-400">
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
        <button onclick={closeImportDialog} class="btn-secondary"> Close </button>
      </div>
    </div>
  </div>
{/if}
