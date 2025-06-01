// frontend/vite.config.js
// ——————————————————
// Tells Vite to forward any request starting with "/api" 
// over to your Flask server at localhost:5000.

// frontend/vite.config.js

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Any request that begins with /api will be forwarded
    proxy: {
      '/api': {
        target: 'http://localhost:5000',  // Flask backend
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
