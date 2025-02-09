import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      // Enable React Fast Refresh
      fastRefresh: true,
      // Enable React optimizations
      jsxRuntime: 'automatic',
      babel: {
        // Disable Babel's auto-detection
        babelrc: false,
        configFile: false,
        // Provide minimal Babel config
        plugins: [],
        presets: []
      }
    })
  ],
  build: {
    sourcemap: true,
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-date': ['luxon'],
          'vendor-ui': ['react-hot-toast', 'lucide-react'],
          'vendor-utils': ['uuid']
        },
        // Limit chunk size to 1MB
        chunkFileNames: (chunkInfo) => {
          const id = chunkInfo.facadeModuleId || chunkInfo.moduleIds[0];
          const name = id ? id.split('/').pop()?.split('.')[0] : 'chunk';
          return `assets/${name}-[hash].js`;
        },
        manualChunkSizeThreshold: 1000000 // 1MB in bytes
      },
    },
    // Set chunk size warning limit to 1MB
    chunkSizeWarningLimit: 1000,
    // Enable minification optimizations
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  // Optimize dev server
  server: {
    hmr: {
      overlay: true,
    },
    // Enable compression
    compress: true,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      'luxon',
      'uuid',
      'react-hot-toast',
      'lucide-react'
    ],
    exclude: ['@supabase/supabase-js']
  },
  // Enable caching
  cacheDir: '.vite',
});