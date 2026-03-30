import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',      allowedHosts: ['erlinda-piratelike-chandler.ngrok-free.dev'],    },    build: {
      // Code splitting configuration
      rollupOptions: {
        output: {
          // Separate chunks for better caching
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-ui': ['lucide-react', 'motion/react'],
            'vendor-forms': ['react-helmet-async'],
          },
        },
      },
      // Increase chunk warning threshold
      chunkSizeWarningLimit: 1000,
      // Minify with esbuild
      minify: 'esbuild',
    },  };
});
