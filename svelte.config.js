import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter(),
		// In development, disable CSRF for easier API testing
		// In production, you should enable this and handle CSRF tokens properly
		csrf: {
			checkOrigin: process.env.NODE_ENV === 'production'
		}
	}
};

export default config;