import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Repassa todas as chamadas /api para o servidor Flask
      '/api': {
        target: 'http://localhost:6000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
