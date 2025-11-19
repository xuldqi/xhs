<template>
  <ErrorBoundary>
    <div id="app">
      <AppHeader />
      <router-view />
    </div>
  </ErrorBoundary>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import ErrorBoundary from '@/components/ErrorBoundary.vue'
import { errorHandler } from '@/utils/errorHandler'

// 全局错误处理
onMounted(() => {
  // 捕获未处理的Promise错误
  window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Unhandled Promise Rejection:', event.reason)
    errorHandler.handle(event.reason, 'promise')
    event.preventDefault()
  })
  
  // 捕获全局错误
  window.addEventListener('error', (event) => {
    console.error('❌ Global Error:', event.error)
    errorHandler.handle(event.error, 'global')
  })
})
</script>

<style scoped>
#app {
  width: 100%;
  min-height: 100vh;
  padding-top: 68px; /* 导航栏高度 */
}
</style>
