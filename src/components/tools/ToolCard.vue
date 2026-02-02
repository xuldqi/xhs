<template>
  <article class="tool-card" @click="handleClick">
    <!-- 工具图标 -->
    <div class="tool-icon">
      <div class="icon-wrapper" :class="`category-${tool.category}`">
        <el-icon class="icon">
          <component :is="getIcon(tool.category)" />
        </el-icon>
      </div>
    </div>

    <!-- 工具信息 -->
    <div class="tool-info">
      <div class="tool-header">
        <h3 class="tool-name">{{ tool.name }}</h3>
        <div class="tool-badges">
          <el-tag v-if="tool.isFree" type="success" size="small">免费</el-tag>
          <el-tag v-else type="warning" size="small">付费</el-tag>
          <el-tag v-if="tool.isRecommended" type="primary" size="small">
            <el-icon><Star /></el-icon>
            推荐
          </el-tag>
        </div>
      </div>
      
      <p class="tool-description">{{ tool.description }}</p>
      
      <!-- 工具特性 -->
      <div class="tool-features">
        <div
          v-for="feature in tool.features.slice(0, 3)"
          :key="feature"
          class="feature-item"
        >
          <el-icon><Check /></el-icon>
          <span>{{ feature }}</span>
        </div>
        <div v-if="tool.features.length > 3" class="more-features">
          +{{ tool.features.length - 3 }}个功能
        </div>
      </div>
    </div>

    <!-- 工具底部 -->
    <div class="tool-footer">
      <div class="tool-stats">
        <span class="stat-item">
          <el-icon><View /></el-icon>
          {{ formatNumber(tool.viewCount) }}
        </span>
        <span class="stat-item">
          <el-icon><Star /></el-icon>
          {{ formatNumber(tool.likeCount) }}
        </span>
        <span class="stat-item rating">
          <el-icon><Star /></el-icon>
          {{ tool.rating.toFixed(1) }}
        </span>
      </div>
      
      <el-button type="primary" size="small" :icon="Link">
        使用工具
      </el-button>
    </div>
  </article>
</template>

<script setup lang="ts">
import { Star, Check, View, Link, Edit, Camera, TrendCharts, DataAnalysis, Setting, Promotion } from '@element-plus/icons-vue'

interface Tool {
  id: string
  name: string
  description: string
  category: string
  url: string
  isFree: boolean
  isRecommended: boolean
  rating: number
  features: string[]
  viewCount: number
  likeCount: number
  tags: string[]
}

interface Props {
  tool: Tool
}

const props = defineProps<Props>()
const emit = defineEmits<{
  click: []
}>()

const getIcon = (category: string) => {
  const map: Record<string, any> = {
    'content-creation': Edit,
    'image-editing': Camera,
    'data-analysis': TrendCharts,
    'seo-optimization': DataAnalysis,
    'automation': Setting,
    'promotion': Promotion
  }
  return map[category] || Setting
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
</script>

<style scoped>
.tool-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 2px solid transparent;
}

.tool-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary-color);
}

.tool-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.icon-wrapper {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.category-content-creation {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.category-image-editing {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.category-data-analysis {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.category-seo-optimization {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.category-automation {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.category-promotion {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
}

.icon {
  font-size: 2rem;
  color: white;
}

.tool-info {
  flex: 1;
  margin-bottom: 20px;
}

.tool-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  gap: 12px;
}

.tool-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.4;
  flex: 1;
}

.tool-badges {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.tool-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0 0 16px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tool-features {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.feature-item .el-icon {
  color: #10b981;
  font-size: 0.875rem;
}

.more-features {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  font-style: italic;
  margin-left: 24px;
}

.tool-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

.tool-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.rating {
  color: #f59e0b;
}

.rating .el-icon {
  color: #f59e0b;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tool-card {
    padding: 20px;
  }
  
  .tool-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .tool-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .tool-stats {
    gap: 12px;
  }
}
</style>
