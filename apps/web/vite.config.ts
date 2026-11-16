import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5173 },
  // Pacotes do monorepo (ui-web, api-client) usam a mesma cópia destas bibliotecas que o app.
  resolve: { dedupe: ['react', 'react-dom', 'antd', '@tanstack/react-query'] },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router', '@tanstack/react-query'],
          'vendor-antd': ['antd', '@ant-design/icons'],
        },
      },
    },
    chunkSizeWarningLimit: 1200,
  },
});
