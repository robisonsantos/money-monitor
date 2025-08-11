/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  darkMode: "class", // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Semantic color system for light/dark mode
        background: {
          primary: "rgb(var(--color-background-primary) / <alpha-value>)",
          secondary: "rgb(var(--color-background-secondary) / <alpha-value>)",
          tertiary: "rgb(var(--color-background-tertiary) / <alpha-value>)",
        },
        foreground: {
          primary: "rgb(var(--color-foreground-primary) / <alpha-value>)",
          secondary: "rgb(var(--color-foreground-secondary) / <alpha-value>)",
          tertiary: "rgb(var(--color-foreground-tertiary) / <alpha-value>)",
        },
        border: {
          primary: "rgb(var(--color-border-primary) / <alpha-value>)",
          secondary: "rgb(var(--color-border-secondary) / <alpha-value>)",
        },
        accent: {
          primary: "rgb(var(--color-accent-primary) / <alpha-value>)",
          secondary: "rgb(var(--color-accent-secondary) / <alpha-value>)",
        },
        // Keep existing color palette for specific use cases
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },
        success: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
          950: "#052e16",
        },
        danger: {
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
          800: "#991b1b",
          900: "#7f1d1d",
          950: "#450a0a",
        },
        warning: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
          950: "#451a03",
        },
        // Chart colors that work in both modes
        chart: {
          1: "rgb(var(--color-chart-1) / <alpha-value>)",
          2: "rgb(var(--color-chart-2) / <alpha-value>)",
          3: "rgb(var(--color-chart-3) / <alpha-value>)",
          4: "rgb(var(--color-chart-4) / <alpha-value>)",
          5: "rgb(var(--color-chart-5) / <alpha-value>)",
        },
      },
      animation: {
        "theme-transition": "theme-transition 0.2s ease-in-out",
      },
      keyframes: {
        "theme-transition": {
          "0%": { opacity: "0.8" },
          "100%": { opacity: "1" },
        },
      },
      screens: {
        "reduce-motion": { raw: "(prefers-reduced-motion: reduce)" },
        "high-contrast": { raw: "(prefers-contrast: high)" },
      },
    },
  },
  plugins: [
    // Plugin for better typography support
    require("@tailwindcss/typography"),
  ],
};
