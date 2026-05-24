import './styles/index.css'
import { createApp } from 'vue'
import { VueQueryPlugin } from '@tanstack/vue-query'
import router from './router/index'
import App from './App.vue'

const app = createApp(App)
app.use(router)
app.use(VueQueryPlugin)
app.mount('#app')
