import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';
import tailwindcss from '@tailwindcss/vite';

const isDevServer = process.argv.some((arg) => arg.includes('dev'));

export default defineConfig({
  site: 'https://bullwinkle.js.org',
  base: '/ShelfCheck',
  output: 'static',
  integrations: [react(), markdoc(), sitemap(), ...(isDevServer ? [keystatic()] : [])],
  vite: {
    plugins: [tailwindcss()],
  },
});
