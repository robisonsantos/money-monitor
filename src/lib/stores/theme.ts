import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
}

// Default state
const defaultState: ThemeState = {
  theme: 'system',
  resolvedTheme: 'light'
};

// Create the store
function createThemeStore() {
  const { subscribe, set, update } = writable<ThemeState>(defaultState);

  // System theme detection
  const getSystemTheme = (): 'light' | 'dark' => {
    if (!browser) return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  // Resolve theme based on current setting
  const resolveTheme = (theme: Theme): 'light' | 'dark' => {
    if (theme === 'system') {
      return getSystemTheme();
    }
    return theme;
  };

  // Apply theme to document
  const applyTheme = (resolvedTheme: 'light' | 'dark') => {
    if (!browser) return;

    const root = document.documentElement;

    // Remove existing theme classes
    root.classList.remove('light', 'dark');

    // Add new theme class
    root.classList.add(resolvedTheme);

    // Update CSS custom properties for semantic colors
    if (resolvedTheme === 'dark') {
      root.style.setProperty('--color-background-primary', '15 23 42'); // slate-900
      root.style.setProperty('--color-background-secondary', '30 41 59'); // slate-800
      root.style.setProperty('--color-background-tertiary', '51 65 85'); // slate-700

      root.style.setProperty('--color-foreground-primary', '248 250 252'); // slate-50
      root.style.setProperty('--color-foreground-secondary', '226 232 240'); // slate-200
      root.style.setProperty('--color-foreground-tertiary', '148 163 184'); // slate-400

      root.style.setProperty('--color-border-primary', '71 85 105'); // slate-600
      root.style.setProperty('--color-border-secondary', '100 116 139'); // slate-500

      root.style.setProperty('--color-accent-primary', '59 130 246'); // blue-500
      root.style.setProperty('--color-accent-secondary', '37 99 235'); // blue-600

      // Chart colors for dark mode
      root.style.setProperty('--color-chart-1', '34 197 94'); // green-500
      root.style.setProperty('--color-chart-2', '59 130 246'); // blue-500
      root.style.setProperty('--color-chart-3', '168 85 247'); // purple-500
      root.style.setProperty('--color-chart-4', '245 158 11'); // amber-500
      root.style.setProperty('--color-chart-5', '239 68 68'); // red-500
    } else {
      root.style.setProperty('--color-background-primary', '255 255 255'); // white
      root.style.setProperty('--color-background-secondary', '248 250 252'); // slate-50
      root.style.setProperty('--color-background-tertiary', '241 245 249'); // slate-100

      root.style.setProperty('--color-foreground-primary', '15 23 42'); // slate-900
      root.style.setProperty('--color-foreground-secondary', '51 65 85'); // slate-700
      root.style.setProperty('--color-foreground-tertiary', '100 116 139'); // slate-500

      root.style.setProperty('--color-border-primary', '226 232 240'); // slate-200
      root.style.setProperty('--color-border-secondary', '203 213 225'); // slate-300

      root.style.setProperty('--color-accent-primary', '37 99 235'); // blue-600
      root.style.setProperty('--color-accent-secondary', '29 78 216'); // blue-700

      // Chart colors for light mode
      root.style.setProperty('--color-chart-1', '22 163 74'); // green-600
      root.style.setProperty('--color-chart-2', '37 99 235'); // blue-600
      root.style.setProperty('--color-chart-3', '147 51 234'); // purple-600
      root.style.setProperty('--color-chart-4', '217 119 6'); // amber-600
      root.style.setProperty('--color-chart-5', '220 38 38'); // red-600
    }

    // Update meta theme-color for mobile browsers
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', resolvedTheme === 'dark' ? '#0f172a' : '#ffffff');
    }
  };

  // Save theme to localStorage
  const saveTheme = (theme: Theme) => {
    if (!browser) return;
    try {
      localStorage.setItem('money-monitor-theme', theme);
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
  };

  // Load theme from localStorage
  const loadTheme = (): Theme => {
    if (!browser) return 'system';
    try {
      const saved = localStorage.getItem('money-monitor-theme');
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        return saved;
      }
    } catch (error) {
      console.warn('Failed to load theme preference:', error);
    }
    return 'system';
  };

  // Set theme and update everything
  const setTheme = (newTheme: Theme) => {
    const resolvedTheme = resolveTheme(newTheme);

    update(state => ({
      theme: newTheme,
      resolvedTheme
    }));

    applyTheme(resolvedTheme);
    saveTheme(newTheme);
  };

  // Toggle between light and dark (respects system preference)
  const toggleTheme = () => {
    update(state => {
      let newTheme: Theme;

      if (state.theme === 'system') {
        // If on system, switch to opposite of current resolved theme
        newTheme = state.resolvedTheme === 'dark' ? 'light' : 'dark';
      } else if (state.theme === 'light') {
        newTheme = 'dark';
      } else {
        newTheme = 'light';
      }

      const resolvedTheme = resolveTheme(newTheme);
      applyTheme(resolvedTheme);
      saveTheme(newTheme);

      return {
        theme: newTheme,
        resolvedTheme
      };
    });
  };

  // Initialize theme on app start
  const initialize = () => {
    if (!browser) return;

    const savedTheme = loadTheme();
    const resolvedTheme = resolveTheme(savedTheme);

    set({
      theme: savedTheme,
      resolvedTheme
    });

    applyTheme(resolvedTheme);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      update(state => {
        if (state.theme === 'system') {
          const newResolvedTheme = getSystemTheme();
          applyTheme(newResolvedTheme);
          return {
            ...state,
            resolvedTheme: newResolvedTheme
          };
        }
        return state;
      });
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleSystemThemeChange);
    }

    // Return cleanup function
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleSystemThemeChange);
      } else {
        mediaQuery.removeListener(handleSystemThemeChange);
      }
    };
  };

  return {
    subscribe,
    setTheme,
    toggleTheme,
    initialize,
    // Computed values
    get theme() {
      let currentTheme: Theme = 'system';
      subscribe(state => currentTheme = state.theme)();
      return currentTheme;
    },
    get resolvedTheme() {
      let currentResolvedTheme: 'light' | 'dark' = 'light';
      subscribe(state => currentResolvedTheme = state.resolvedTheme)();
      return currentResolvedTheme;
    }
  };
}

export const themeStore = createThemeStore();

// Accessibility helpers
export const getThemeIcon = (theme: Theme, resolvedTheme: 'light' | 'dark') => {
  if (theme === 'system') {
    return resolvedTheme === 'dark' ? '🌙' : '☀️';
  }
  return theme === 'dark' ? '🌙' : '☀️';
};

export const getThemeLabel = (theme: Theme) => {
  switch (theme) {
    case 'light':
      return 'Light mode';
    case 'dark':
      return 'Dark mode';
    case 'system':
      return 'System preference';
    default:
      return 'Unknown theme';
  }
};

export const getNextThemeLabel = (currentTheme: Theme, currentResolvedTheme: 'light' | 'dark') => {
  if (currentTheme === 'system') {
    return currentResolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
  } else if (currentTheme === 'light') {
    return 'Switch to dark mode';
  } else {
    return 'Switch to light mode';
  }
};
