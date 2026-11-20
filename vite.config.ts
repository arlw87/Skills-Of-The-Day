import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `base: './'` keeps the build portable (GitHub Pages, Netlify, any sub-path).
export default defineConfig({
  plugins: [react()],
  base: './',
});
