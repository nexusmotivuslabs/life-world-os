import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { metricsPlugin } from './vite-metrics-plugin'

export default defineConfig({
  plugins: [react(), metricsPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5002,
    host: '0.0.0.0', // Listen on all interfaces
    strictPort: false,
    hmr: {
      host: 'dev.lifeworld.com',
    },
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
  build: {
    sourcemap: process.env.NODE_ENV === 'development',
  },
})


