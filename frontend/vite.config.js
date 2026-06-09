import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  esbuild: {
    jsx: 'automatic',
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    include: ['src/**/*.test.{js,jsx,ts,tsx}'],
    fileParallelism: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: './coverage',
      exclude: ['src/test/**', 'src/main.jsx'],
      thresholds: {
        lines: 80,
        branches: 70,
        functions: 44,
        statements: 80,
      },
    },
  },
})
