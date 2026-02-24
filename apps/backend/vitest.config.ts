import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      // Critical areas with 85%+ coverage (config, core services, utils, types)
      include: [
        'src/config/structuralPillarsConfig.ts',
        'src/config/systemUniversalConceptConfig.ts',
        'src/services/energyService.ts',
        'src/services/balanceService.ts',
        'src/services/rankService.ts',
        'src/services/xpCalculator.ts',
        'src/utils/problemDetails.ts',
        'src/types/index.ts',
      ],
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.config.*',
        '**/__tests__/**',
        '**/*.test.*',
        '**/*.spec.*',
        'prisma/**',
        'src/index.ts',
        '**/scripts/**',
      ],
      thresholds: {
        lines: 85,
        statements: 85,
        functions: 70,
        branches: 70,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})

