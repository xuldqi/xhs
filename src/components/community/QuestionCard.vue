<template>
  <article class="question-card" @click="handleClick">
    <!-- 问题头部 -->
    <div class="question-header">
      <div class="user-info">
        <el-avatar :src="question.author.avatar" :size="40">
          {{ question.author.name.charAt(0) }}
        </el-avatar>
        <div class="user-details">
          <div class="user-name">{{ question.author.name }}</div>
          <div class="question-meta">
            <span>{{ formatDate(question.createdAt) }}</span>
            <span v-if="question.category" class="category">· {{ question.category }}</span>
          </div>
        </div>
      </div>
      
      <el-tag v-if="question.isResolved" type="success" size="small">
        <el-icon><Check /></el-icon>
        已解决
      </el-tag>
    </div>

    <!-- 问题内容 -->
    <div class="question-content">
      <h3 class="question-title">{{ question.title }}</h3>
      <p class="question-description">{{ question.description }}</p>
      
      <!-- 标签 -->
      <div v-if="question.tags.length > 0" class="question-tags">
        <el-tag
          v-for="tag in question.tags"
          :key="tag"
          size="small"
          type="info"
          effect="plain"
        >
          {{ tag }}
        </el-tag>
      </div>
    </div>

    <!-- 问题底部 -->
    <div class="question-footer">
      <div class="stats">
        <span class="stat-item">
          <el-icon><View /></el-icon>
          {{ formatNumber(question.viewCount) }}次浏览
        </span>
        <span class="stat-item">
          <el-icon><ChatDotRound /></el-icon>
          {{ question.answerCount }}个回答
        </span>
        <span class="stat-item">
          <el-icon><Star /></el-icon>
          {{ question.likeCount }}个赞
        </span>
      </div>
      
      <div class="actions">
        <el-button
          size="small"
          :icon="Star"
          :type="question.isLiked ? 'primary' : 'default'"
          @click.stop="handleLike"
        >
          {{ question.isLiked ? '已赞' : '点赞' }}
        </el-button>
        <el-button
          size="small"
          :icon="Collection"
          :type="question.isCollected ? 'warning' : 'default'"
          @click.stop="handleCollect"
        >
          {{ question.isCollected ? '已收藏' : '收藏' }}
        </el-button>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { Check, View, ChatDotRound, Star, Collection } from '@element-plus/icons-vue'

interface Question {
  id: string
  title: string
  description: string
  author: {
    id: string
    name: string
    avatar: string
  }
  category: string
  tags: string[]
  viewCount: number
  answerCount: number
  likeCount: number
  isResolved: boolean
  isLiked: boolean
  isCollected: boolean
  createdAt: string
}

interface Props {
  question: Question
}

const props = defineProps<Props>()
const emit = defineEmits<{
  click: []
  like: []
  collect: []
}>()

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 60) {
    return `${minutes}分钟前`
  } else if (hours < 24) {
    return `${hours}小时前`
  } else if (days < 30) {
    return `${days}天前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
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

const handleClick = () => {
  emit('click')
}

const handleLike = () => {
  emit('like')
}

const handleCollect = () => {
  emit('collect')
}
</script>

<style scoped>
.question-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);
  cursor: pointer;
  border: 1px solid var(--border-color);
}

.question-card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--primary-color);
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.user-info {
  display: flex;
  gap: 12px;
  align-items: center;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.question-meta {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.category {
  color: var(--primary-color);
}

.question-content {
  margin-bottom: 16px;
}

.question-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 12px 0;
  line-height: 1.5;
}

.question-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.question-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.question-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

.stats {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.actions {
  display: flex;
  gap: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .question-card {
    padding: 16px;
  }
  
  .question-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .stats {
    gap: 12px;
  }
  
  .actions {
    width: 100%;
  }
  
  .actions .el-button {
    flex: 1;
  }
}
</style>
