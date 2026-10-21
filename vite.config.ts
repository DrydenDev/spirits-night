import { fileURLToPath, URL } from 'node:url';
import vue from '@vitejs/plugin-vue';
import yaml from '@rollup/plugin-yaml';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [vue(), yaml(), tailwindcss()],
  resolve: {
    alias: { '~': fileURLToPath(new URL('./app', import.meta.url)) },
  },
});
