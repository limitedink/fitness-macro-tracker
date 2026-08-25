import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Relative asset paths so the build works from any sub-path, which is what
  // GitHub Pages serves a project site from (/<repo>/).
  base: './',
  build: {
    rollupOptions: {
      output: {
        // Keep the UI library in its own chunk so app edits do not force
        // visitors to re-download all of MUI.
        manualChunks: (id) =>
          id.includes('node_modules/@mui') || id.includes('node_modules/@emotion')
            ? 'ui'
            : undefined,
      },
    },
  },
  server: {
    port: 5173,
    // Calls to /api are proxied to the backend, so the browser sees a single
    // origin in development and CORS never enters the picture.
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY ?? 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.js',
  },
});
