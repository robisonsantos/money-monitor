import { w as writable } from "./index.js";
const defaultState = {
  theme: "system",
  resolvedTheme: "light"
};
function createThemeStore() {
  const { subscribe, set, update } = writable(defaultState);
  const getSystemTheme = () => {
    return "light";
  };
  const resolveTheme = (theme) => {
    if (theme === "system") {
      return getSystemTheme();
    }
    return theme;
  };
  const setTheme = (newTheme) => {
    const resolvedTheme = resolveTheme(newTheme);
    update((state) => ({
      theme: newTheme,
      resolvedTheme
    }));
  };
  const toggleTheme = () => {
    update((state) => {
      let newTheme;
      if (state.theme === "system") {
        newTheme = state.resolvedTheme === "dark" ? "light" : "dark";
      } else if (state.theme === "light") {
        newTheme = "dark";
      } else {
        newTheme = "light";
      }
      const resolvedTheme = resolveTheme(newTheme);
      return {
        theme: newTheme,
        resolvedTheme
      };
    });
  };
  const initialize = () => {
    return;
  };
  return {
    subscribe,
    setTheme,
    toggleTheme,
    initialize,
    // Computed values
    get theme() {
      let currentTheme = "system";
      subscribe((state) => currentTheme = state.theme)();
      return currentTheme;
    },
    get resolvedTheme() {
      let currentResolvedTheme = "light";
      subscribe((state) => currentResolvedTheme = state.resolvedTheme)();
      return currentResolvedTheme;
    }
  };
}
const themeStore = createThemeStore();
const getThemeLabel = (theme) => {
  switch (theme) {
    case "light":
      return "Light mode";
    case "dark":
      return "Dark mode";
    case "system":
      return "System preference";
    default:
      return "Unknown theme";
  }
};
const getNextThemeLabel = (currentTheme, currentResolvedTheme) => {
  if (currentTheme === "system") {
    return currentResolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode";
  } else if (currentTheme === "light") {
    return "Switch to dark mode";
  } else {
    return "Switch to light mode";
  }
};
export {
  getThemeLabel as a,
  getNextThemeLabel as g,
  themeStore as t
};
