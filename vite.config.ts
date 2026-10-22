import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig, type Plugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const themeColor = '#1a7f37';

// Nothing the user captures may leave the device: the browser itself forbids any
// request to another origin. Build only, since the dev server injects inline styles.
const contentSecurityPolicy = [
  "default-src 'self'",
  "connect-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

const contentSecurityPolicyMeta = (): Plugin => ({
  name: 'content-security-policy-meta',
  apply: 'build',
  transformIndexHtml: () => [
    {
      tag: 'meta',
      attrs: { 'http-equiv': 'Content-Security-Policy', content: contentSecurityPolicy },
      injectTo: 'head-prepend',
    },
  ],
});

export default defineConfig({
  base: '/liste-de-courses/',
  plugins: [
    svelte(),
    contentSecurityPolicyMeta(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
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
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest,woff2}'],
      },
    }),
  ],
});
