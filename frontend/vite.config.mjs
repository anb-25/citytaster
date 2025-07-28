import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://citytaster-backend:5000', // Use backend container name!
        changeOrigin: true,
        secure: false,
      },
    },
  },
})

