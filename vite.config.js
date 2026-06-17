import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('recharts') || id.includes('d3-')) return 'charts'
            if (id.includes('@supabase')) return 'supabase'
            if (id.includes('react-router')) return 'react-vendor'
            if (id.includes('/react-dom/') || id.includes('/react/')) return 'react-vendor'
          }
        },
      },
    },
  },
})
