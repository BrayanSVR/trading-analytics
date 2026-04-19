// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy: redirige /api al backend Express en :4000
    // Así no tienes problemas de CORS en desarrollo
    proxy: {
      '/api': {
        target:       'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
