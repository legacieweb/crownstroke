import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills(),
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
      'perf_hooks': path.resolve(__dirname, 'src/perf-hooks-polyfill.ts'),
    },
  },
  define: {
    'global': 'globalThis',
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
