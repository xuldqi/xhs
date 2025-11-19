<template>
  <div v-if="hasError" class="error-boundary">
    <div class="error-container">
      <div class="error-icon">⚠️</div>
      <h2>出错了</h2>
      <p class="error-message">{{ errorMessage }}</p>
      
      <div class="error-actions">
        <el-button type="primary" @click="handleReload">
          刷新页面
        </el-button>
        <el-button @click="handleReset">
          返回首页
        </el-button>
      </div>
      
      <details v-if="isDev" class="error-details">
        <summary>错误详情（开发模式）</summary>
        <pre>{{ errorDetails }}</pre>
      </details>
    </div>
  </div>
  
  <slot v-else />
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'
import { useRouter } from 'vue-router'
import { errorHandler } from '@/utils/errorHandler'

const router = useRouter()
const hasError = ref(false)
const errorMessage = ref('')
const errorDetails = ref('')
const isDev = import.meta.env.DEV

// 捕获子组件错误
onErrorCaptured((error: any, instance, info) => {
  console.error('❌ Component Error:', error, info)
  
  // 处理错误
  const appError = errorHandler.handle(error, 'component')
  
  hasError.value = true
  errorMessage.value = appError.message
  errorDetails.value = JSON.stringify({
    error: error.toString(),
    stack: error.stack,
    info,
    component: instance?.$options.name || 'Unknown'
  }, null, 2)
  
  // 阻止错误继续传播
  return false
})

const handleReload = () => {
  window.location.reload()
}

const handleReset = () => {
  hasError.value = false
  router.push('/')
}
</script>

<style scoped>
.error-boundary {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.error-container {
  background: white;
  border-radius: 16px;
  padding: 40px;
  max-width: 600px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.error-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

h2 {
  font-size: 24px;
  color: #333;
  margin-bottom: 12px;
}

.error-message {
  color: #666;
  font-size: 16px;
  margin-bottom: 24px;
  line-height: 1.6;
}

.error-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 24px;
}

.error-details {
  text-align: left;
  margin-top: 24px;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 8px;
  cursor: pointer;
}

.error-details summary {
  font-weight: 600;
  color: #666;
  margin-bottom: 12px;
}

.error-details pre {
  font-size: 12px;
  color: #333;
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}

@media (max-width: 768px) {
  .error-container {
    padding: 24px;
  }
  
  .error-actions {
    flex-direction: column;
  }
  
  .error-actions .el-button {
    width: 100%;
  }
}
</style>
