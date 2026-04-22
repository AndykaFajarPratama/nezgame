import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    sourcemap: false, // Menyembunyikan source code asli dari inspect element
    minify: 'esbuild',
  },
  esbuild: {
    drop: ['console', 'debugger'], // Menghapus semua console.log di production
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:3000', // ✅ Pakai env
        changeOrigin: true,
      }
    }
  }
})