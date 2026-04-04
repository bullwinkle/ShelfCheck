import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://bullwinkle.js.org',
  base: '/ShelfCheck',
  integrations: [sitemap()],
  output: 'static',
});
