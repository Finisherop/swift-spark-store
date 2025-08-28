import { defineConfig } from 'vite';
import path from 'path';

// Minimal Vite config required by Lovable for preview only.
// This does NOT affect the Next.js runtime.
export default defineConfig({
  server: {
    host: '::',
    port: 8080,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
