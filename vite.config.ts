import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [sveltekit()],
  build: {
    target: "node20",
  },
  server: {
    fs: {
      // Restrict file system access to project files only
      strict: true,
      allow: [".."],
    },
    watch: {
      // Ignore large directories to improve performance
      ignored: [
        "**/node_modules/**",
        "**/postgres_data/**",
        "**/coverage/**",
        "**/dist/**",
        "**/build/**",
        "**/.git/**",
        "**/*.log",
      ],
    },
  },
  optimizeDeps: {
    exclude: ["@sveltejs/kit", "svelte"],
  },
});
