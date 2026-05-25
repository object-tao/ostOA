import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    port: 5173,
    allowedHosts: ['1103ch984yp99.vicp.fun', 'm.ostoa.org'],
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
      },
    },
  },
  preview: {
    allowedHosts: ['1103ch984yp99.vicp.fun', 'm.ostoa.org'],
  },
});
