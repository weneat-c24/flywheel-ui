import './styles/index.css'
import { createApp } from 'vue'
import { VueQueryPlugin } from '@tanstack/vue-query'
import router from './router/index'
import App from './App.vue'
import { isMockMode } from './utils/mockMode'

async function bootstrap() {
  if (isMockMode()) {
    const { worker } = await import('./mocks/browser')
    await worker.start({ onUnhandledRequest: 'bypass' })
  }

  const app = createApp(App)
  app.use(router)
  app.use(VueQueryPlugin)
  app.mount('#app')
}

bootstrap()
