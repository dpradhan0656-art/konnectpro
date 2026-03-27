import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifestFilename: 'manifest.json',
      includeAssets: [
        'favicon.ico',
        'icons/icon-192.svg',
        'icons/icon-512.svg',
        'icons/apple-touch-icon.svg',
      ],
      manifest: {
        name: 'Kshatryx Technologies',
        short_name: 'Kshatryx',
        description: 'India\'s Most Trusted Home Services App',
        theme_color: '#0d9488',
        background_color: '#0f172a',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'portrait-primary',
        categories: ['lifestyle', 'utilities'],
        icons: [
          { src: 'icons/icon-192.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any maskable' },
          { src: 'icons/icon-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'unsplash-images', expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 } }
          },
          {
            // Supabase Auth + REST: NEVER cache for admin/state-changing traffic
            // This covers https://<project>.supabase.co/auth/v1/* and /rest/v1/* etc.
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkOnly',
            options: { cacheName: 'supabase-api-live' }
          }
        ]
      }
    })
  ],
})