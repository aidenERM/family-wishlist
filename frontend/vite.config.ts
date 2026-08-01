import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const BASE_PATH = process.env.VITE_BASE_PATH || '/family-wishlist/';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'autoUpdate',
      includeAssets: ['pwa/apple-touch-icon.png'],
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,png,jpg,jpeg,svg,ico,woff2}'],
      },
      manifest: {
        name: 'Lista de Deseos',
        short_name: 'Deseos',
        description: 'Lista de deseos y plan de ahorro de la familia',
        start_url: BASE_PATH,
        scope: BASE_PATH,
        display: 'standalone',
        background_color: '#0a0e27',
        theme_color: '#0a0e27',
        icons: [
          { src: 'pwa/icon-any-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'pwa/icon-any-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'pwa/icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: 'pwa/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  base: BASE_PATH,
});
