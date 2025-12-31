import { browser } from "$app/environment";
import type { Portfolio } from "$lib/database";
import { derived, writable } from "svelte/store";

// Portfolio state management
interface PortfolioState {
  portfolios: Portfolio[];
  selectedPortfolio: Portfolio | null;
  selectedPortfolioId: number | null;
  isLoading: boolean;
  error: string | null;
  aggregatedInvestments: any[];
  aggregatedData: any[];
  isAggregatedLoading: boolean;
  isAllPortfoliosSelected: boolean;
}

const initialState: PortfolioState = {
  portfolios: [],
  selectedPortfolio: null,
  selectedPortfolioId: null,
  isLoading: false,
  error: null,
  aggregatedInvestments: [],
  aggregatedData: [],
  isAggregatedLoading: false,
  isAllPortfoliosSelected: false,
};

// Create the main portfolio store
function createPortfolioStore() {
  const { subscribe, set, update } = writable<PortfolioState>(initialState);

  return {
    subscribe,

    // Load all portfolios for the current user
    async loadPortfolios() {
      if (!browser) return;

      update((state) => ({ ...state, isLoading: true, error: null }));

      try {
        const response = await fetch("/api/portfolios", {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`Failed to load portfolios: ${response.status}`);
        }

        const portfolios: Portfolio[] = await response.json();

        update((state) => {
          // If no portfolio is selected, select the first one
          let selectedPortfolio = state.selectedPortfolio;
          if (!selectedPortfolio && portfolios.length > 0) {
            selectedPortfolio = portfolios[0];

            // Store selected portfolio in localStorage
            if (selectedPortfolio) {
              localStorage.setItem(
                "selectedPortfolioId",
                selectedPortfolio.id.toString(),
              );
            }
          }

          return {
            ...state,
            portfolios,
            selectedPortfolio,
            isLoading: false,
          };
        });
      } catch (error) {
        console.error("Error loading portfolios:", error);
        update((state) => ({
          ...state,
          isLoading: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to load portfolios",
        }));
      }
    },

    // Select a portfolio or "All Portfolios"
    selectPortfolio(portfolio: Portfolio | null) {
      update((state) => ({
        ...state,
        selectedPortfolio: portfolio,
        selectedPortfolioId: portfolio?.id || null,
        isAllPortfoliosSelected: portfolio === null,
      }));

      // Store in localStorage for persistence
      if (browser) {
        if (portfolio) {
          localStorage.setItem("selectedPortfolioId", portfolio.id.toString());
          localStorage.setItem("isAllPortfoliosSelected", "false");
        } else {
          localStorage.setItem("selectedPortfolioId", "");
          localStorage.setItem("isAllPortfoliosSelected", "true");
        }
      }
    },

    // Create a new portfolio
    async createPortfolio(name: string) {
      if (!browser) {
        console.log("Portfolio creation: Not in browser context");
        return null;
      }

      console.log("Creating portfolio with name:", name);

      try {
        const response = await fetch("/api/portfolios", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ name }),
        });

        console.log(
          "Portfolio creation response:",
          response.status,
          response.statusText,
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Portfolio creation error response:", errorData);
          throw new Error(errorData.error || "Failed to create portfolio");
        }

        const newPortfolio: Portfolio = await response.json();
        console.log("Portfolio created successfully:", newPortfolio);

        update((state) => ({
          ...state,
          portfolios: [...state.portfolios, newPortfolio],
          selectedPortfolio: newPortfolio,
          error: null,
        }));

        // Store new portfolio as selected
        if (browser) {
          localStorage.setItem(
            "selectedPortfolioId",
            newPortfolio.id.toString(),
          );
        }

        return newPortfolio;
      } catch (error) {
        console.error("Error creating portfolio:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to create portfolio";
        console.error("Portfolio creation final error message:", errorMessage);

        update((state) => ({
          ...state,
          error: errorMessage,
        }));
        return null;
      }
    },

    // Rename a portfolio
    async renamePortfolio(portfolio: Portfolio, newName: string) {
      if (!browser) return false;

      try {
        const response = await fetch(`/api/portfolios/${portfolio.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ name: newName }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to rename portfolio");
        }

        const updatedPortfolio: Portfolio = await response.json();

        update((state) => ({
          ...state,
          portfolios: state.portfolios.map((p) =>
            p.id === portfolio.id ? updatedPortfolio : p,
          ),
          selectedPortfolio:
            state.selectedPortfolio?.id === portfolio.id
              ? updatedPortfolio
              : state.selectedPortfolio,
          error: null,
        }));

        return true;
      } catch (error) {
        console.error("Error renaming portfolio:", error);
        update((state) => ({
          ...state,
          error:
            error instanceof Error
              ? error.message
              : "Failed to rename portfolio",
        }));
        return false;
      }
    },

    // Delete a portfolio
    async deletePortfolio(portfolio: Portfolio) {
      if (!browser) return false;

      try {
        const response = await fetch(`/api/portfolios/${portfolio.id}`, {
          method: "DELETE",
          credentials: "include",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete portfolio");
        }

        update((state) => {
          const newPortfolios = state.portfolios.filter(
            (p) => p.id !== portfolio.id,
          );

          // If the deleted portfolio was selected, select another one
          let newSelectedPortfolio = state.selectedPortfolio;
          if (state.selectedPortfolio?.id === portfolio.id) {
            newSelectedPortfolio = newPortfolios[0] || null;

            // Update localStorage
            if (newSelectedPortfolio) {
              localStorage.setItem(
                "selectedPortfolioId",
                newSelectedPortfolio.id.toString(),
              );
            } else {
              localStorage.removeItem("selectedPortfolioId");
            }
          }

          return {
            ...state,
            portfolios: newPortfolios,
            selectedPortfolio: newSelectedPortfolio,
            error: null,
          };
        });

        return true;
      } catch (error) {
        console.error("Error deleting portfolio:", error);
        update((state) => ({
          ...state,
          error:
            error instanceof Error
              ? error.message
              : "Failed to delete portfolio",
        }));
        return false;
      }
    },

    // Load aggregated investments data
    async loadAggregatedInvestments() {
      if (!browser) return;

      update((state) => ({ ...state, isAggregatedLoading: true, error: null }));

      try {
        const response = await fetch("/api/portfolios/all/investments", {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(
            `Failed to load aggregated investments: ${response.status}`,
          );
        }

        const aggregatedInvestments = await response.json();

        update((state) => ({
          ...state,
          aggregatedInvestments,
          isAggregatedLoading: false,
        }));
      } catch (error) {
        console.error("Error loading aggregated investments:", error);
        update((state) => ({
          ...state,
          isAggregatedLoading: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to load aggregated investments",
        }));
      }
    },

    // Load aggregated data with portfolio breakdown
    async loadAggregatedData() {
      if (!browser) return;

      update((state) => ({ ...state, isAggregatedLoading: true, error: null }));

      try {
        const response = await fetch("/api/portfolios/all/investments", {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`Failed to load aggregated data: ${response.status}`);
        }

        const aggregatedData = await response.json();

        update((state) => ({
          ...state,
          aggregatedData,
          isAggregatedLoading: false,
        }));
      } catch (error) {
        console.error("Error loading aggregated data:", error);
        update((state) => ({
          ...state,
          isAggregatedLoading: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to load aggregated data",
        }));
      }
    },

    // Select "All Portfolios" view
    selectAllPortfolios() {
      this.selectPortfolio(null);
    },

    // Restore selected portfolio from localStorage
    restoreSelectedPortfolio() {
      if (!browser) return;

      const savedPortfolioId = localStorage.getItem("selectedPortfolioId");
      const isAllPortfoliosSelected =
        localStorage.getItem("isAllPortfoliosSelected") === "true";

      if (isAllPortfoliosSelected) {
        update((state) => ({
          ...state,
          selectedPortfolio: null,
          selectedPortfolioId: null,
          isAllPortfoliosSelected: true,
        }));
        return;
      }

      if (!savedPortfolioId) return;

      const portfolioId = parseInt(savedPortfolioId);
      if (isNaN(portfolioId)) return;

      update((state) => {
        const savedPortfolio = state.portfolios.find(
          (p) => p.id === portfolioId,
        );
        if (savedPortfolio) {
          return {
            ...state,
            selectedPortfolio: savedPortfolio,
            selectedPortfolioId: savedPortfolio.id,
            isAllPortfoliosSelected: false,
          };
        }
        return state;
      });
    },

    // Clear error
    clearError() {
      update((state) => ({ ...state, error: null }));
    },

    // Reset store
    reset() {
      set(initialState);
      if (browser) {
        localStorage.removeItem("selectedPortfolioId");
        localStorage.removeItem("isAllPortfoliosSelected");
      }
    },
  };
}

export const portfolioStore = createPortfolioStore();

// Derived stores for easier access
export const portfolios = derived(
  portfolioStore,
  ($store) => $store.portfolios,
);
export const selectedPortfolio = derived(
  portfolioStore,
  ($store) => $store.selectedPortfolio,
);
export const portfolioIsLoading = derived(
  portfolioStore,
  ($store) => $store.isLoading,
);
export const portfolioError = derived(portfolioStore, ($store) => $store.error);

// Helper to get selected portfolio ID
export const selectedPortfolioId = derived(
  selectedPortfolio,
  ($portfolio) => $portfolio?.id,
);

// Derived stores for aggregated data
export const aggregatedInvestments = derived(
  portfolioStore,
  ($store) => $store.aggregatedInvestments,
);
export const aggregatedData = derived(
  portfolioStore,
  ($store) => $store.aggregatedData,
);
export const isAggregatedLoading = derived(
  portfolioStore,
  ($store) => $store.isAggregatedLoading,
);
export const isAllPortfoliosSelected = derived(
  portfolioStore,
  ($store) => $store.isAllPortfoliosSelected,
);

// Helper to check if all portfolios view is available
export const isAllPortfoliosAvailable = derived(
  portfolios,
  ($portfolios) => $portfolios.length > 1,
);
