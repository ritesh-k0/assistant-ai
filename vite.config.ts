import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  const currentSupabaseUrl =
    (process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_URL.includes('fupgnszofujkaslbawgq'))
      ? process.env.VITE_SUPABASE_URL.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '')
      : 'https://fupgnszofujkaslbawgq.supabase.co';

  const currentSupabaseKey =
    (process.env.VITE_SUPABASE_ANON_KEY && !process.env.VITE_SUPABASE_ANON_KEY.includes('MK4bTSrWsCx1GV9HzEEKIA'))
      ? process.env.VITE_SUPABASE_ANON_KEY
      : 'sb_publishable_1ADQDEdMzTFI27l1qjZ7Hw_vRCiUg2E';

  return {
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(currentSupabaseUrl),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(currentSupabaseKey),
      'process.env.VITE_SUPABASE_URL': JSON.stringify(currentSupabaseUrl),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(currentSupabaseKey),
      'process.env.SUPABASE_URL': JSON.stringify(currentSupabaseUrl),
      'process.env.SUPABASE_ANON_KEY': JSON.stringify(currentSupabaseKey),
    },
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
