import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: './index.html', // Shri Sai Ram Financials (default)
        accounting: './accounting.html',
        portfolio: './portfolio.html',
      },
    },
  },
  define: {
    // Ensure environment variables are available
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL),
  }
})
