import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5678,
    proxy: {
      '/api': {
        target: 'http://localhost:5679',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:5679',
        ws: true,
      },
    },
  },
})
