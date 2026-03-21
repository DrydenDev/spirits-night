import { defineConfig } from 'vite';
import { reactRouter } from '@react-router/dev/vite';
import { vercelPreset } from '@vercel/react-router/vite';
import tsconfigPaths from 'vite-plugin-tsconfig-paths';

export default defineConfig({
  plugins: [
    reactRouter({
      presets: [vercelPreset()],
    }),
    tsconfigPaths(),
  ],
});
