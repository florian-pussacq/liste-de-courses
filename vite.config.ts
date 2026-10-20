import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const themeColor = '#1a7f37';

export default defineConfig({
  base: '/liste-de-courses/',
  plugins: [
    svelte(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'Liste de courses',
        short_name: 'Courses',
        description: 'Rassemble les articles à acheter et les coche en magasin.',
        lang: 'fr',
        start_url: './',
        scope: './',
        display: 'standalone',
        theme_color: themeColor,
        background_color: themeColor,
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        // GET targets the app root: no service worker handler and no static-hosting routing needed.
        share_target: {
          action: './',
          method: 'GET',
          params: { title: 'title', text: 'text', url: 'url' },
        },
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
      },
    }),
  ],
});
