import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import packageJson from './package.json';

export default defineConfig({
  plugins: [react(), sentryVitePlugin({
    org: "jemal-rm",
    project: "javascript-react",
    disable: import.meta.env.MODE !== 'production',
    release: {
      name: `expense-tracker@${pacakageJson.version}`,
      uploadSourceMaps: true,
    },
    sourcemaps: {
      assets: './dist/**',
      ignore: ['node_modules/**'],
    },
    cleanArtifacts: true,
    setCommits: {
        auto: true,
    },
  })],

  // Передаем версию в приложение через define
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(packageJson.version),
  },

  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    emptyOutDir: true,

    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },

    sourcemap: true
  },
  server: {
  port: 3000,
  open: true,
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
      secure: false,
      ws: true,
      configure: (proxy, _options) => {
        proxy.on('error', (err, _req, _res) => {
          console.log('proxy error', err);
        });
        proxy.on('proxyReq', (proxyReq, req, _res) => {
          console.log('Sending Request to the Target:', req.method, req.url);
        });
        proxy.on('proxyRes', (proxyRes, req, _res) => {
          console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
        });
      },
    },
  },
},
  optimizeDeps: {
  include: ['react', 'react-dom'],
},
});