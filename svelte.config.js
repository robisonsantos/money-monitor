import adapter from '@sveltejs/adapter-netlify';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			// Split API routes into separate Netlify Functions
			split: true
		}),
		// Enable CSRF protection in all environments for security
		csrf: {
			checkOrigin: true
		}
	}
};

export default config;