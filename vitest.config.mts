import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-utils/setup.ts'],
    globals: true,
    exclude: ['e2e/**', 'node_modules/**', 'dist/**', '.next/**'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/__tests__/**',
        'src/messages/**',
        'src/app/**/*.test.tsx',
        'src/test-utils/**',
        'src/middleware.ts',
      ],
      reporter: ['text', 'json-summary'],
      thresholds: {
        lines: 40,
        functions: 40,
        branches: 40,
        statements: 40,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
