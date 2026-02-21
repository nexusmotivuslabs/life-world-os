import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.config.*',
        '**/__tests__/**',
        '**/*.test.*',
        '**/*.spec.*',
        'prisma/**',
        'src/index.ts',
        '**/scripts/seed*.ts',
        '**/scripts/*Data.ts',
        '**/scripts/*AgentData.ts',
        '**/scripts/setAdminUsers.ts',
        '**/scripts/migrate*.ts',
        '**/scripts/sync*.ts',
      ],
      // Target: 85% for reliability. Raise thresholds as coverage increases.
      thresholds: {
        lines: 3,
        functions: 8,
        branches: 27,
        statements: 3,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})

