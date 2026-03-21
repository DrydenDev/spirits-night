import { defineConfig } from 'vite';
import { reactRouter } from '@react-router/dev/vite';
import tsconfigPaths from 'vite-plugin-tsconfig-paths';

export default defineConfig({
  plugins: [
    reactRouter(),
    tsconfigPaths(),
  ],
  ssr: {
    // Pre-bundle MUI + Emotion with esbuild for SSR. These packages ship CJS and
    // Vite's ESM module runner can't evaluate CJS `require()` calls inline.
    // esbuild handles CJS→ESM interop correctly, so the pre-bundled versions have
    // proper default exports (icons resolve as React components, not plain objects).
    optimizeDeps: {
      include: [
        '@mui/material',
        '@mui/icons-material',
        '@mui/system',
        '@mui/base',
        '@mui/utils',
        '@emotion/react',
        '@emotion/styled',
        '@emotion/cache',
      ],
    },
  },
});
