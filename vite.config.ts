import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'terminal-console',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/__log' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              const { level, args } = JSON.parse(body);
              console.log(`[Browser ${level}]`, ...args);
              res.end();
            });
          } else {
            next();
          }
        });
      }
    }
  ],
  resolve: {
    alias: {
      'fabric': path.resolve(__dirname, 'node_modules/fabric/dist/fabric.js'),
    },
  },
  define: {
    'global': 'globalThis',
  },
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('fabric')) return 'vendor.fabric';
            if (id.includes('lucide-react')) return 'vendor.icons';
            if (id.includes('canvas-confetti')) return 'vendor.confetti';
            return 'vendor';
          }
        }
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
    },
  },
});
