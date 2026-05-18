import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const apiProxyTarget = process.env.VITE_PROXY_API_TARGET || 'http://localhost:5679'
const wsProxyTarget = process.env.VITE_PROXY_WS_TARGET || 'ws://localhost:5679'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5678,
    proxy: {
      '/api': {
        target: apiProxyTarget,
        changeOrigin: true,
      },
      '/ws': {
        target: wsProxyTarget,
        ws: true,
      },
    },
  },
})
