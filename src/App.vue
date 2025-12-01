<template>
  <ErrorBoundary>
    <div id="app">
      <AppHeader />
      <PageLoader :loading="isLoading" message="加载中..." />
      <router-view v-slot="{ Component, route }">
        <PageTransition>
          <component :is="Component" :key="route.path" />
        </PageTransition>
      </router-view>
    </div>
  </ErrorBoundary>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import ErrorBoundary from '@/components/ErrorBoundary.vue'
import PageTransition from '@/components/PageTransition.vue'
import PageLoader from '@/components/PageLoader.vue'
import { errorHandler } from '@/utils/errorHandler'

const router = useRouter()
const isLoading = ref(false)

// 路由加载状态
router.beforeEach(() => {
  isLoading.value = true
})

router.afterEach(() => {
  setTimeout(() => {
    isLoading.value = false
  }, 300)
})

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
