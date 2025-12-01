<template>
  <article class="intelligence-card" :class="urgencyClass" @click="handleClick">
    <!-- 紧急标签 -->
    <div v-if="intelligence.isBreaking" class="breaking-badge">
      <el-icon><Bell /></el-icon>
      突发
    </div>
    
    <!-- 新标签 -->
    <div v-if="isNew" class="new-badge">NEW</div>
    
    <!-- 卡片头部 -->
    <div class="card-header">
      <div class="urgency-indicator" :class="`urgency-${intelligence.urgency}`"></div>
      <div class="header-content">
        <div class="meta-info">
          <span class="category">{{ getCategoryName(intelligence.category) }}</span>
          <span class="divider">•</span>
          <span class="date">{{ formatDate(intelligence.publishedAt) }}</span>
          <span v-if="intelligence.source" class="divider">•</span>
          <span v-if="intelligence.source" class="source">{{ intelligence.source }}</span>
        </div>
        <h3 class="intelligence-title">{{ intelligence.title }}</h3>
      </div>
    </div>

    <!-- 卡片内容 -->
    <div class="card-content">
      <p class="intelligence-description">{{ intelligence.description }}</p>
      
      <!-- 标签 -->
      <div v-if="intelligence.tags.length > 0" class="intelligence-tags">
        <el-tag
          v-for="tag in intelligence.tags.slice(0, 3)"
          :key="tag"
          size="small"
          :type="getTagType(intelligence.urgency)"
        >
          {{ tag }}
        </el-tag>
      </div>
    </div>

    <!-- 卡片底部 -->
    <div class="card-footer">
      <div class="footer-meta">
        <span class="meta-item">
          <el-icon><View /></el-icon>
          {{ formatNumber(intelligence.viewCount) }}
        </span>
        <span class="meta-item">
          <el-icon><Star /></el-icon>
          {{ formatNumber(intelligence.likeCount) }}
        </span>
      </div>
      
      <el-button type="primary" size="small" text :icon="ArrowRight">
        查看详情
      </el-button>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Bell, View, Star, ArrowRight } from '@element-plus/icons-vue'
import type { IntelligencePost } from '@/types/content'

interface Props {
  intelligence: IntelligencePost
}

const props = defineProps<Props>()
const emit = defineEmits<{
  click: []
}>()

// 计算是否为新情报（24小时内）
const isNew = computed(() => {
  if (!props.intelligence.publishedAt) return false
  const publishDate = new Date(props.intelligence.publishedAt)
  const now = new Date()
  const diff = now.getTime() - publishDate.getTime()
  return diff < 24 * 60 * 60 * 1000
})

// 紧急程度样式类
const urgencyClass = computed(() => {
  return `urgency-level-${props.intelligence.urgency}`
})

const getCategoryName = (category: string) => {
  const map: Record<string, string> = {
    'platform-updates': '平台动态',
    'new-features': '新功能',
    'policy-changes': '政策变化',
    'trend-analysis': '趋势分析'
  }
  return map[category] || category
}

const getTagType = (urgency: string) => {
  const map: Record<string, any> = {
    high: 'danger',
    medium: 'warning',
    low: 'info'
  }
  return map[urgency] || 'info'
}

const formatNumber = (num: number) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}

const formatDate = (dateString?: string) => {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 60) {
    return `${minutes}分钟前`
  }
  if (hours < 24) {
    return `${hours}小时前`
  }
  if (days < 7) {
    return `${days}天前`
  }
  
  return date.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit'
  })
}

const handleClick = () => {
  emit('click')
}
</script>

<style scoped>
.intelligence-card {
  position: relative;
  background: white;
  border-radius: var(--radius-lg);
  padding: 20px;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);
  cursor: pointer;
  border-left: 4px solid transparent;
}

.intelligence-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.urgency-level-high {
  border-left-color: #ef4444;
}

.urgency-level-medium {
  border-left-color: #f59e0b;
}

.urgency-level-low {
  border-left-color: #3b82f6;
}

.breaking-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 4px 12px;
  background: #ef4444;
  color: white;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.new-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 2px 8px;
  background: #10b981;
  color: white;
  border-radius: var(--radius-sm);
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.card-header {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.urgency-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;
}

.urgency-high {
  background: #ef4444;
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.5);
}

.urgency-medium {
  background: #f59e0b;
  box-shadow: 0 0 8px rgba(245, 158, 11, 0.5);
}

.urgency-low {
  background: #3b82f6;
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.5);
}

.header-content {
  flex: 1;
  min-width: 0;
}

.meta-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  color: var(--text-tertiary);
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.category {
  color: var(--text-secondary);
  font-weight: 500;
}

.divider {
  color: var(--text-tertiary);
}

.source {
  color: var(--text-tertiary);
}

.intelligence-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-content {
  margin-bottom: 16px;
}

.intelligence-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.intelligence-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

.footer-meta {
  display: flex;
  gap: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .intelligence-card {
    padding: 16px;
  }
  
  .card-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
