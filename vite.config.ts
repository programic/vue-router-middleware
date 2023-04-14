import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import Vue from '@vitejs/plugin-vue';

export default defineConfig({
  resolve: {
    alias: {
      '~': resolve(__dirname, 'src'),
      '~/*': resolve(__dirname, 'src/*'),
    },
  },

  build: {
    emptyOutDir: true,
    sourcemap: false,
    cssCodeSplit: false,
    minify: 'esbuild',
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'index',
      fileName: 'index',
      formats: ['cjs', 'es'],
    },
    rollupOptions: {
      external: [
        'vue',
      ],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
  },

  plugins: [
    Vue(),
  ],
});
