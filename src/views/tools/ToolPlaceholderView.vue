<template>
  <div class="tool-placeholder-view">
    <div class="container">
      <Breadcrumb :items="breadcrumbItems" />
      
      <div class="placeholder-content">
        <div class="placeholder-icon">🚧</div>
        <h1 class="placeholder-title">{{ toolName }}</h1>
        <p class="placeholder-description">
          该工具正在开发中，敬请期待！
        </p>
        <p class="placeholder-tip">
          我们正在努力完善这个功能，预计很快就能上线。
        </p>
        
        <div class="placeholder-actions">
          <el-button type="primary" @click="$router.push('/tools')">
            返回工具箱
          </el-button>
          <el-button @click="$router.push('/')">
            返回首页
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Breadcrumb from '@/components/Breadcrumb.vue'

const route = useRoute()

// 根据路由路径获取工具名称
const toolName = computed(() => {
  const path = route.path
  const toolMap: Record<string, string> = {
    '/tools/topic-analyzer': '话题分析工具',
    '/tools/competitor-analyzer': '竞品分析工具',
    '/tools/image-editor': '图片编辑器',
    '/tools/keyword-tool': 'SEO 关键词工具',
    '/tools/scheduler': '定时发布工具'
  }
  return toolMap[path] || '工具'
})

const breadcrumbItems = computed(() => [
  { label: '工具箱', path: '/tools' },
  { label: toolName.value, path: '' }
])
</script>

<style scoped>
.tool-placeholder-view {
  min-height: 100vh;
  background: #f9fafb;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 20px;
}

.container {
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
}

.placeholder-content {
  background: white;
  border-radius: 20px;
  padding: 64px 48px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.placeholder-icon {
  font-size: 5rem;
  margin-bottom: 24px;
}

.placeholder-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 16px 0;
}

.placeholder-description {
  font-size: 1.125rem;
  color: #6b7280;
  margin: 0 0 12px 0;
}

.placeholder-tip {
  font-size: 0.9375rem;
  color: #9ca3af;
  margin: 0 0 32px 0;
}

.placeholder-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .placeholder-content {
    padding: 48px 32px;
  }
  
  .placeholder-icon {
    font-size: 4rem;
  }
  
  .placeholder-title {
    font-size: 1.5rem;
  }
  
  .placeholder-actions {
    flex-direction: column;
  }
}
</style>

