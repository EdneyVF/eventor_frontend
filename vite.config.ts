import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy para o backend em desenvolvimento
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3001', // URL do backend
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  // Configuração para variáveis de ambiente
  define: {
    'process.env': {}
  },
  // Configuração de build
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    // Configuração para garantir que os caminhos dos assets sejam relativos
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  // Configuração base para o router
  base: '/',
  // Configuração para copiar arquivos da pasta public
  publicDir: 'public'
})
