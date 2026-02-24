import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const BASE = '/reality-intelligence/'

export default defineConfig({
  plugins: [
    react(),
    // Redirect /reality-intelligence (no slash) → /reality-intelligence/ so base path and @vite/client resolve
    {
      name: 'redirect-base',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/reality-intelligence' && !req.url.endsWith('/')) {
            res.statusCode = 302
            res.setHeader('Location', BASE)
            res.end()
            return
          }
          next()
        })
      },
    },
  ],
  base: BASE,
  server: {
    port: 5173,
    host: true,
  },
  preview: {
    port: 5173,
    host: true,
  },
})
