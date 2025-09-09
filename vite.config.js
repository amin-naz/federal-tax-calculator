// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// Use the repo base path on CI so assets resolve at
// https://amin-naz.github.io/federal-tax-calculator/
const isCI = process.env.GITHUB_ACTIONS === 'true'

export default defineConfig({
  base: isCI ? '/federal-tax-calculator/' : '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})
