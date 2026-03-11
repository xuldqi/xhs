import { createApp } from 'vue'
import { createPinia } from 'pinia'
import 'element-plus/dist/index.css'
import 'element-plus/es/components/message/style/css'
import 'element-plus/es/components/message-box/style/css'
import router from './router'
import App from './App.vue'
import './style.css'
import './styles/design-tokens.css'
import './styles/guide-content.css'
import { useUserStore } from './stores/userStore'
import { analytics } from './utils/analytics'

import { mobileOptimizer } from './utils/mobileOptimizer'
import { performanceOptimizer } from './utils/performanceOptimizer'
import { preloadCriticalComponents } from './utils/lazyLoader'

// 全局错误捕获（用于调试白屏问题）
window.onerror = function (message, source, lineno, colno, error) {
  console.error('全局错误:', message, error)
  // 仅在生产环境显示，避免开发环境烦人
  if (import.meta.env.PROD) {
    const errorMsg = `页面加载出错: ${message}\n位置: ${source}:${lineno}:${colno}`
    // 创建一个临时的 DOM 元素显示错误，防止 alert 阻塞或被拦截
    const div = document.createElement('div')
    div.style.position = 'fixed'
    div.style.top = '0'
    div.style.left = '0'
    div.style.width = '100%'
    div.style.backgroundColor = '#ffebee'
    div.style.color = '#c62828'
    div.style.padding = '20px'
    div.style.zIndex = '999999'
    div.style.borderBottom = '1px solid #ef5350'
    div.style.fontFamily = 'monospace'
    div.style.whiteSpace = 'pre-wrap'
    div.innerText = errorMsg + '\n\n请截图发送给开发者调试'
    document.body.appendChild(div)
  }
}

const app = createApp(App)
app.config.errorHandler = (err, instance, info) => {
  console.error('Vue 错误:', err, info)
  if (import.meta.env.PROD) {
    // 同样显示 Vue 错误
    const div = document.createElement('div')
    div.style.position = 'fixed'
    div.style.bottom = '0'
    div.style.left = '0'
    div.style.width = '100%'
    div.style.backgroundColor = '#fff3e0'
    div.style.color = '#e65100'
    div.style.padding = '10px'
    div.style.zIndex = '999999'
    div.style.fontSize = '12px'
    div.innerText = `组件错误: ${err}`
    document.body.appendChild(div)
  }
}

const pinia = createPinia()

app.use(pinia)
app.use(router)

// 初始化 Google Analytics
analytics.init()

// 初始化 Vercel Analytics（自动追踪页面浏览）


// 初始化性能优化
performanceOptimizer.init()
performanceOptimizer.preloadCriticalRoutes()
performanceOptimizer.optimizeFontLoading()

// 预加载关键组件
preloadCriticalComponents()

// 初始化移动端优化
mobileOptimizer.init()

// 初始化用户状态（异步）
const userStore = useUserStore()
userStore.init().then(() => {
  console.log('✅ 用户状态初始化完成')
}).catch((error) => {
  console.error('❌ 用户状态初始化失败:', error)
})

app.mount('#app')

// 性能监控（开发环境）
if (import.meta.env.DEV) {
  setTimeout(() => {
    const report = performanceOptimizer.generatePerformanceReport()
    console.log('📊 性能报告:', report)
  }, 5000)
}
