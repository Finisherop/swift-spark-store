import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Build configuration to ensure proper MIME types and asset handling
  build: {
    rollupOptions: {
      output: {
        // Ensure JS chunks have .js extension for proper MIME type detection
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          // CSS files get .css extension
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'assets/[name]-[hash].css';
          }
          // Other assets keep their original extensions
          return 'assets/[name]-[hash].[ext]';
        },
      },
    },
    // Generate manifest.json for preload optimization
    manifest: true,
    // Ensure source maps are generated for debugging
    sourcemap: mode === 'development',
  },
  // Preview server configuration for testing production builds
  preview: {
    host: "::",
    port: 4173,
  },
}));
