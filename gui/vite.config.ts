import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      port: 5173,
      host: '0.0.0.0',
      allowedHosts: [
        'localhost',
        '127.0.0.1',
        '.manus.computer',
        '5173-idi1e8kymvxksuj0jnkcm-1df655df.us2.manus.computer',
      ],
      proxy: {
        // LangGraph backend
        '/api': {
          target: 'http://localhost:2024',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        // Vercel API proxy
        '/vercel-api': {
          target: 'https://api.vercel.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/vercel-api/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              if (env.VERCEL_API_TOKEN) {
                proxyReq.setHeader('Authorization', `Bearer ${env.VERCEL_API_TOKEN}`);
              }
            });
          },
        },
      },
    },
    // Expose VERCEL_API_TOKEN to client (only for checking if configured)
    define: {
      'import.meta.env.VITE_VERCEL_CONFIGURED': JSON.stringify(!!env.VERCEL_API_TOKEN),
    },
  };
});
