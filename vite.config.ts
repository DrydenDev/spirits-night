import { defineConfig } from 'vite';
import { reactRouter } from '@react-router/dev/vite';
import tsconfigPaths from 'vite-plugin-tsconfig-paths';
import yaml from '@rollup/plugin-yaml';

export default defineConfig({
  plugins: [
    reactRouter(),
    tsconfigPaths(),
    yaml(),
  ],
});
