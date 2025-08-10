import adapter from "@sveltejs/adapter-netlify";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      // Enable edge functions for better performance
      edge: false,
      // Split routes for better caching
      split: true,
    }),
    // Enable CSRF protection in all environments for security
    csrf: {
      checkOrigin: true,
    },
  },
};

export default config;
