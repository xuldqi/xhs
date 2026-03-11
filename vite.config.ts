import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    vue(),
    visualizer({ open: false, gzipSize: true, brotliSize: true }),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  css: {
    // Avoid parent-directory PostCSS config discovery in restricted environments.
    postcss: {
      plugins: [],
    },
  },
  build: {
    target: 'es2015',
    minify: 'terser',
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalized = id.replace(/\\/g, '/')
          if (id.includes('node_modules')) {
            if (normalized.includes('@element-plus/icons-vue')) return 'ui-ep-icons'
            if (normalized.includes('element-plus')) return 'ui-element-plus-core'
            if (normalized.includes('vue') || normalized.includes('pinia') || normalized.includes('vue-router')) return 'framework-vue'
            if (normalized.includes('html2canvas') || normalized.includes('jspdf')) return 'export-pdf'
            if (normalized.includes('marked') || normalized.includes('dompurify')) return 'content-render'
            if (normalized.includes('@supabase')) return 'supabase-client'

            const segment = normalized.split('node_modules/')[1] || ''
            const parts = segment.split('/')
            const pkgName = parts[0]?.startsWith('@') ? `${parts[0]}/${parts[1] || ''}` : parts[0]
            if (pkgName) {
              if (pkgName === 'lodash-unified') return undefined
              const sanitized = pkgName.replace('@', '').replace('/', '-')
              return `vendor-${sanitized}`
            }
            return 'vendor-misc'
          }
          return undefined
        }
      }
    }
  }
})
