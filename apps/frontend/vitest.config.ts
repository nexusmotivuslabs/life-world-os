import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      // Critical areas: config (release, artifacts), choose-plane & blogs, blog/error services, navigation store, currency, hooks, release types
      include: [
        'src/config/releaseStatus.ts',
        'src/config/artifactSystemConfig.ts',
        'src/pages/PlaneChoice.tsx',
        'src/pages/BlogsPage.tsx',
        'src/services/blogApi.ts',
        'src/services/errorHandler.ts',
        'src/store/useNavigationStore.ts',
        'src/utils/currency.ts',
        'src/utils/realityNodeDisplay.ts',
        'src/hooks/usePageDataLoader.ts',
        'src/hooks/useNavigation.tsx',
        'src/types/release.ts',
      ],
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.config.*',
        '**/__tests__/**',
        '**/*.test.*',
        '**/*.spec.*',
        'src/test/**',
        '**/index.ts',
      ],
      thresholds: {
        lines: 90,
        statements: 90,
        functions: 70,
        branches: 65,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})

