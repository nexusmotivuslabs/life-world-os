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
      // Critical areas: config (release, artifacts, skills map), components (skills, blog), pages, services, store, utils, hooks
      include: [
        'src/config/releaseStatus.ts',
        'src/config/artifactSystemConfig.ts',
        'src/config/skillsMapConfig.ts',
        'src/components/SkillLeverageModal.tsx',
        'src/components/SkillsMapChart.tsx',
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
        functions: 65,
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

