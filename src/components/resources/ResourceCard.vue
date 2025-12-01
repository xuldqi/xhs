<template>
  <article class="resource-card" @click="handleClick">
    <!-- 精选标签 -->
    <div v-if="resource.featured" class="featured-badge">
      <el-icon><Star /></el-icon>
      精选
    </div>
    
    <!-- 卡片头部 -->
    <div class="card-header">
      <div class="resource-icon" :class="`icon-${getCategoryClass(resource.category)}`">
        <el-icon><component :is="getCategoryIcon(resource.category)" /></el-icon>
      </div>
      <div class="resource-info">
        <div class="category-tag">{{ resource.category }}</div>
        <h3 class="resource-title">{{ resource.title }}</h3>
      </div>
    </div>

    <!-- 卡片内容 -->
    <div class="card-content">
      <p class="resource-description">{{ resource.description }}</p>
      
      <!-- 文件信息 -->
      <div class="file-info">
        <span class="file-format">{{ resource.fileFormat }}</span>
        <span class="file-size">{{ resource.fileSize }}</span>
      </div>
      
      <!-- 标签 -->
      <div v-if="resource.tags.length > 0" class="resource-tags">
        <el-tag
          v-for="tag in resource.tags.slice(0, 3)"
          :key="tag"
          size="small"
          type="info"
          effect="plain"
        >
          {{ tag }}
        </el-tag>
        <span v-if="resource.tags.length > 3" class="more-tags">
          +{{ resource.tags.length - 3 }}
        </span>
      </div>
    </div>

    <!-- 卡片底部 -->
    <div class="card-footer">
      <div class="resource-meta">
        <span class="meta-item">
          <el-icon><View /></el-icon>
          {{ formatNumber(resource.viewCount) }}
        </span>
        <span class="meta-item">
          <el-icon><Download /></el-icon>
          {{ formatNumber(resource.downloadCount) }}
        </span>
      </div>
      
      <el-button 
        type="primary" 
        size="small" 
        :icon="Download"
        @click.stop="handleDownload"
      >
        下载
      </el-button>
    </div>
  </article>
</template>

<script setup lang="ts">
import { Document, Folder, DataAnalysis, Tools, Collection, Star, View, Download } from '@element-plus/icons-vue'
import type { Resource } from '@/data/resourcesData'

interface Props {
  resource: Resource
}

const props = defineProps<Props>()
const emit = defineEmits<{
  click: []
  download: []
}>()

const getCategoryIcon = (category: string) => {
  const map: Record<string, any> = {
    '模板': Document,
    'SOP': Folder,
    '文档': Document,
    '数据': DataAnalysis,
    '工具': Tools
  }
  return map[category] || Collection
}

const getCategoryClass = (category: string) => {
  const map: Record<string, string> = {
    '模板': 'template',
    'SOP': 'sop',
    '文档': 'document',
    '数据': 'data',
    '工具': 'tool'
  }
  return map[category] || 'default'
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

const handleDownload = () => {
  emit('download')
}
</script>

<style scoped>
.resource-card {
  position: relative;
  background: white;
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}

.resource-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.featured-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 4px 12px;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: white;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 1;
}

.card-header {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.resource-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.icon-template {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.icon-sop {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.icon-document {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.icon-data {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.icon-tool {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.icon-default {
  background: var(--bg-secondary);
  color: var(--text-secondary);
}

.resource-info {
  flex: 1;
  min-width: 0;
}

.category-tag {
  display: inline-block;
  padding: 4px 8px;
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.resource-title {
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
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.resource-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.file-info {
  display: flex;
  gap: 12px;
  align-items: center;
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.file-format {
  padding: 4px 8px;
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
  font-weight: 500;
}

.file-size {
  color: var(--text-tertiary);
}

.resource-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.more-tags {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

.resource-meta {
  display: flex;
  gap: 16px;
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>


