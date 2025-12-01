<template>
  <article class="article-card" @click="handleClick">
    <!-- 封面图片 -->
    <div class="card-image">
      <LazyImage
        v-if="article.coverImage"
        :src="article.coverImage"
        :alt="article.title"
        aspect-ratio="16/9"
      />
      <div v-else class="placeholder-image">
        <el-icon class="placeholder-icon"><Document /></el-icon>
      </div>
      
      <!-- 难度标签 -->
      <div class="difficulty-badge" :class="`difficulty-${article.difficulty}`">
        {{ getDifficultyText(article.difficulty) }}
      </div>
      
      <!-- 特色标签 -->
      <div v-if="article.featured" class="featured-badge">
        <el-icon><Star /></el-icon>
        精选
      </div>
    </div>

    <!-- 卡片内容 -->
    <div class="card-content">
      <!-- 分类标签 -->
      <div class="category-tag">
        {{ getCategoryName(article.category) }}
      </div>
      
      <!-- 标题 -->
      <h3 class="article-title">{{ article.title }}</h3>
      
      <!-- 描述 -->
      <p class="article-description">{{ article.description }}</p>
      
      <!-- 标签 -->
      <div class="article-tags">
        <el-tag
          v-for="tag in article.tags.slice(0, 3)"
          :key="tag"
          size="small"
          type="info"
          effect="plain"
        >
          {{ tag }}
        </el-tag>
        <span v-if="article.tags.length > 3" class="more-tags">
          +{{ article.tags.length - 3 }}
        </span>
      </div>
    </div>

    <!-- 卡片底部 -->
    <div class="card-footer">
      <div class="article-meta">
        <span class="meta-item">
          <el-icon><Clock /></el-icon>
          {{ article.readingTime }}分钟阅读
        </span>
        <span class="meta-item">
          <el-icon><View /></el-icon>
          {{ formatNumber(article.viewCount) }}
        </span>
        <span class="meta-item">
          <el-icon><Star /></el-icon>
          {{ formatNumber(article.likeCount) }}
        </span>
      </div>
      
      <div class="article-date">
        {{ formatDate(article.publishedAt) }}
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Document, Star, Clock, View } from '@element-plus/icons-vue'
import type { Article } from '@/types/content'
import LazyImage from '@/components/LazyImage.vue'

interface Props {
  article: Article
}

const props = defineProps<Props>()
const emit = defineEmits<{
  click: []
}>()

// 难度文本映射
const getDifficultyText = (difficulty: string) => {
  const map: Record<string, string> = {
    beginner: '新手',
    intermediate: '进阶',
    advanced: '高级'
  }
  return map[difficulty] || difficulty
}

// 分类名称映射（简化版，实际应该从分类数据中获取）
const getCategoryName = (category: string) => {
  const map: Record<string, string> = {
    beginner: '新手入门',
    content: '内容创作',
    traffic: '流量获取',
    data: '数据分析',
    monetization: '变现指南',
    'platform-updates': '平台动态',
    'tools-templates': '工具模板'
  }
  return map[category] || category
}

// 格式化数字
const formatNumber = (num: number) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}

// 格式化日期
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
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const handleClick = () => {
  emit('click')
}
</script>

<style scoped>
.article-card {
  background: white;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.article-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.card-image {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  overflow: hidden;
  background: var(--bg-secondary);
}

.placeholder-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.placeholder-icon {
  font-size: 3rem;
  color: white;
  opacity: 0.5;
}

.difficulty-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 500;
  backdrop-filter: blur(8px);
}

.difficulty-beginner {
  background: rgba(16, 185, 129, 0.9);
  color: white;
}

.difficulty-intermediate {
  background: rgba(245, 158, 11, 0.9);
  color: white;
}

.difficulty-advanced {
  background: rgba(239, 68, 68, 0.9);
  color: white;
}

.featured-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 500;
  background: rgba(251, 191, 36, 0.9);
  color: white;
  display: flex;
  align-items: center;
  gap: 4px;
  backdrop-filter: blur(8px);
}

.card-content {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.category-tag {
  display: inline-block;
  width: fit-content;
  padding: 4px 12px;
  border-radius: var(--radius-md);
  font-size: 0.75rem;
  font-weight: 500;
  background: var(--bg-secondary);
  color: var(--text-secondary);
}

.article-title {
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

.article-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.more-tags {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.card-footer {
  padding: 16px 20px;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.article-meta {
  display: flex;
  gap: 16px;
  align-items: center;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.meta-item .el-icon {
  font-size: 0.875rem;
}

.article-date {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .card-content {
    padding: 16px;
  }
  
  .card-footer {
    padding: 12px 16px;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .article-meta {
    gap: 12px;
  }
}
</style>
