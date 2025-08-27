import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    include: ['tests/**/*.spec.ts', 'tests/**/*.test.ts'],
    exclude: ['tests/**/renderer/**', 'tests/**/preload/**'],

    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',

      include: ['src/main/**/*.ts', 'src/contracts/**/*.ts'],

      exclude: [
        'src/renderer/**',
        'src/preload/**',
        'tests/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/node_modules/**'
      ],

      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },

    environment: 'node',

    testTimeout: 10000,

    setupFiles: [],

    globals: true
  },

  resolve: {
    alias: {
      '@contracts': resolve('src/contracts/index.ts'),
      '@hexagon': resolve('src/main/hexagon'),
      '@main': resolve('src/main')
    }
  }
})
