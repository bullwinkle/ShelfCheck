/// <reference types="vitest" />

import { defineConfig } from 'vite';
import analog from '@analogjs/platform';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  publicDir: 'public',
  build: {
    target: ['es2020'],
  },
  resolve: {
    mainFields: ['module'],
  },
  plugins: [
    analog({
      ssr: false,
      static: true,
      prerender: {
        routes: async () => [
          '/',
          '/daily-digest',
          '/brands',
          '/deep-dives',
          '/about',
          '/support',
        ],
        sitemap: {
          host: 'https://shelfcheck.bullwinkle.space',
        },
      },
    }),
  ],
}));
