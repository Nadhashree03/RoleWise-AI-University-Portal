import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    watch: {
      ignored: [
        '**/server/**',
        '**/server/data/**',
        '**/*.db',
        '**/*.db-wal',
        '**/*.db-shm',
        '**/*.sqlite*',
        '**/scratch/**',
        '**/.system_generated/**',
        '**/.git/**',
        '**/*.log',
      ],
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})

