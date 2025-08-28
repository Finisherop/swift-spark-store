import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// Minimal Vite config for Lovable plugin support only
// This project primarily uses Next.js for optimization
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@/components": resolve(__dirname, "./src/components"), 
      "@/lib": resolve(__dirname, "./src/lib"),
      "@/hooks": resolve(__dirname, "./src/hooks"),
      "@/integrations": resolve(__dirname, "./src/integrations"),
      "@/app": resolve(__dirname, "./src/app")
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable for faster builds
    rollupOptions: {
      external: ['next', 'next/router', 'next/navigation'] // Exclude Next.js from bundling
    }
  }
})