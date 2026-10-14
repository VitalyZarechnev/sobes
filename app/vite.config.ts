import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

const WIKI_ROOT = fileURLToPath(new URL('..', import.meta.url));

export default defineConfig({
  base: './',
  publicDir: false,
  plugins: [react(), viteSingleFile()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    port: 5180,
    fs: { allow: [WIKI_ROOT] },
  },
  build: {
    outDir: WIKI_ROOT,
    emptyOutDir: false,
    chunkSizeWarningLimit: 8000,
  },
});
