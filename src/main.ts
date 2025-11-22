import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from './router'
import App from './App.vue'
import './style.css'
import './styles/guide-content.css'
import { useUserStore } from './stores/userStore'
import { analytics } from './utils/analytics'
import { inject } from '@vercel/analytics'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(ElementPlus)

// 初始化 Google Analytics
analytics.init()

// 初始化 Vercel Analytics（自动追踪页面浏览）
inject()

// 初始化用户状态（异步）
const userStore = useUserStore()
userStore.init().then(() => {
  console.log('✅ 用户状态初始化完成')
}).catch((error) => {
  console.error('❌ 用户状态初始化失败:', error)
})

app.mount('#app')
