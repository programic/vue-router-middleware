import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';
import Vue from '@vitejs/plugin-vue';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
  },

  resolve: {
    alias: {
      '~': resolve(__dirname, 'src'),
      '~/*': resolve(__dirname, 'src/*'),
    },
  },

  plugins: [
    Vue(),
  ],
});
