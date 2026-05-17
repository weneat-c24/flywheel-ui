import './styles/index.css'
import { createApp } from 'vue'
import { VueQueryPlugin } from '@tanstack/vue-query'
import router from './router/index'
import App from './App.vue'

async function bootstrap() {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    const { worker } = await import('./mocks/browser')
    await worker.start({ onUnhandledRequest: 'bypass' })
  }

  const app = createApp(App)
  app.use(router)
  app.use(VueQueryPlugin)
  app.mount('#app')
}

bootstrap()
