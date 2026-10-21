import { fileURLToPath, URL } from 'node:url';
import vue from '@vitejs/plugin-vue';
import yaml from '@rollup/plugin-yaml';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [vue(), yaml()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./app', import.meta.url)),
    },
  },
});
