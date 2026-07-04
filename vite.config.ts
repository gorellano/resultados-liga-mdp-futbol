import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'autoUpdate',
      injectManifest: {
        injectionPoint: undefined
      },
      includeAssets: ['favicon.svg', 'logo_costa_y_gol.png'],
      manifest: {
        name: 'Costa y Gol',
        short_name: 'Costa y Gol',
        description: 'Resultados, fixtures y posiciones de la Liga Marplatense de Fútbol.',
        theme_color: '#16a34a',
        icons: [
          {
            src: 'logo_costa_y_gol.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logo_costa_y_gol.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/lib/**', 'src/pages/**'],
      exclude: ['src/lib/supabase.ts'],
    },
  },
})
