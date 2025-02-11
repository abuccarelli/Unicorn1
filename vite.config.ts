import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-date': ['luxon'],
          'vendor-ui': ['react-hot-toast', 'lucide-react'],
          'vendor-utils': ['uuid']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
});