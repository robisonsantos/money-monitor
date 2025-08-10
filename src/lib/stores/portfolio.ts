import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import type { Portfolio } from '$lib/database';

// Portfolio state management
interface PortfolioState {
  portfolios: Portfolio[];
  selectedPortfolio: Portfolio | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: PortfolioState = {
  portfolios: [],
  selectedPortfolio: null,
  isLoading: false,
  error: null
};

// Create the main portfolio store
function createPortfolioStore() {
  const { subscribe, set, update } = writable<PortfolioState>(initialState);

  return {
    subscribe,

    // Load all portfolios for the current user
    async loadPortfolios() {
      if (!browser) return;

      update(state => ({ ...state, isLoading: true, error: null }));

      try {
        const response = await fetch('/api/portfolios', {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error(`Failed to load portfolios: ${response.status}`);
        }

        const portfolios: Portfolio[] = await response.json();

        update(state => {
          // If no portfolio is selected, select the Main Portfolio or the first one
          let selectedPortfolio = state.selectedPortfolio;
          if (!selectedPortfolio && portfolios.length > 0) {
            selectedPortfolio = portfolios.find(p => p.name === 'Main Portfolio') || portfolios[0];

            // Store selected portfolio in localStorage
            if (selectedPortfolio) {
              localStorage.setItem('selectedPortfolioId', selectedPortfolio.id.toString());
            }
          }

          return {
            ...state,
            portfolios,
            selectedPortfolio,
            isLoading: false
          };
        });
      } catch (error) {
        console.error('Error loading portfolios:', error);
        update(state => ({
          ...state,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to load portfolios'
        }));
      }
    },

    // Select a portfolio
    selectPortfolio(portfolio: Portfolio) {
      update(state => ({ ...state, selectedPortfolio: portfolio }));

      // Store in localStorage for persistence
      if (browser) {
        localStorage.setItem('selectedPortfolioId', portfolio.id.toString());
      }
    },

    // Create a new portfolio
    async createPortfolio(name: string) {
      if (!browser) return null;

      try {
        const response = await fetch('/api/portfolios', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({ name })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create portfolio');
        }

        const newPortfolio: Portfolio = await response.json();

        update(state => ({
          ...state,
          portfolios: [...state.portfolios, newPortfolio],
          selectedPortfolio: newPortfolio,
          error: null
        }));

        // Store new portfolio as selected
        if (browser) {
          localStorage.setItem('selectedPortfolioId', newPortfolio.id.toString());
        }

        return newPortfolio;
      } catch (error) {
        console.error('Error creating portfolio:', error);
        update(state => ({
          ...state,
          error: error instanceof Error ? error.message : 'Failed to create portfolio'
        }));
        return null;
      }
    },

    // Rename a portfolio
    async renamePortfolio(portfolio: Portfolio, newName: string) {
      if (!browser) return false;

      try {
        const response = await fetch(`/api/portfolios/${portfolio.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({ name: newName })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to rename portfolio');
        }

        const updatedPortfolio: Portfolio = await response.json();

        update(state => ({
          ...state,
          portfolios: state.portfolios.map(p =>
            p.id === portfolio.id ? updatedPortfolio : p
          ),
          selectedPortfolio: state.selectedPortfolio?.id === portfolio.id
            ? updatedPortfolio
            : state.selectedPortfolio,
          error: null
        }));

        return true;
      } catch (error) {
        console.error('Error renaming portfolio:', error);
        update(state => ({
          ...state,
          error: error instanceof Error ? error.message : 'Failed to rename portfolio'
        }));
        return false;
      }
    },

    // Delete a portfolio
    async deletePortfolio(portfolio: Portfolio) {
      if (!browser) return false;

      try {
        const response = await fetch(`/api/portfolios/${portfolio.id}`, {
          method: 'DELETE',
          credentials: 'include'
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete portfolio');
        }

        update(state => {
          const newPortfolios = state.portfolios.filter(p => p.id !== portfolio.id);

          // If the deleted portfolio was selected, select another one
          let newSelectedPortfolio = state.selectedPortfolio;
          if (state.selectedPortfolio?.id === portfolio.id) {
            newSelectedPortfolio = newPortfolios.find(p => p.name === 'Main Portfolio') || newPortfolios[0] || null;

            // Update localStorage
            if (newSelectedPortfolio) {
              localStorage.setItem('selectedPortfolioId', newSelectedPortfolio.id.toString());
            } else {
              localStorage.removeItem('selectedPortfolioId');
            }
          }

          return {
            ...state,
            portfolios: newPortfolios,
            selectedPortfolio: newSelectedPortfolio,
            error: null
          };
        });

        return true;
      } catch (error) {
        console.error('Error deleting portfolio:', error);
        update(state => ({
          ...state,
          error: error instanceof Error ? error.message : 'Failed to delete portfolio'
        }));
        return false;
      }
    },

    // Restore selected portfolio from localStorage
    restoreSelectedPortfolio() {
      if (!browser) return;

      const savedPortfolioId = localStorage.getItem('selectedPortfolioId');
      if (!savedPortfolioId) return;

      const portfolioId = parseInt(savedPortfolioId);
      if (isNaN(portfolioId)) return;

      update(state => {
        const savedPortfolio = state.portfolios.find(p => p.id === portfolioId);
        if (savedPortfolio) {
          return { ...state, selectedPortfolio: savedPortfolio };
        }
        return state;
      });
    },

    // Clear error
    clearError() {
      update(state => ({ ...state, error: null }));
    },

    // Reset store
    reset() {
      set(initialState);
      if (browser) {
        localStorage.removeItem('selectedPortfolioId');
      }
    }
  };
}

export const portfolioStore = createPortfolioStore();

// Derived stores for easier access
export const portfolios = derived(portfolioStore, $store => $store.portfolios);
export const selectedPortfolio = derived(portfolioStore, $store => $store.selectedPortfolio);
export const portfolioIsLoading = derived(portfolioStore, $store => $store.isLoading);
export const portfolioError = derived(portfolioStore, $store => $store.error);

// Helper to get selected portfolio ID
export const selectedPortfolioId = derived(selectedPortfolio, $portfolio => $portfolio?.id);
