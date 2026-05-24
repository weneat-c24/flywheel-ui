import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  base: '/flywheel-ui/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    allowedHosts: [
      '62e4-2401-4900-8f6d-ee56-d462-44b8-d8f4-afff.ngrok-free.app',
      '.ngrok-free.app'
    ]
  }
})
