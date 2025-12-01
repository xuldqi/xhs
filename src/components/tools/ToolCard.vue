<template>
  <article 
    class="tool-card" 
    :class="{ 'recommended': tool.isRecommended }"
    @click="handleClick"
  >
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
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid #e5e7eb;
  position: relative;
  overflow: hidden;
}

.tool-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  opacity: 0;
  transition: opacity 0.3s;
}

.tool-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  border-color: #667eea;
}

.tool-card:hover::before {
  opacity: 1;
}

.tool-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.icon-wrapper {
  width: 72px;
  height: 72px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s;
}

.tool-card:hover .icon-wrapper {
  transform: scale(1.1) rotate(5deg);
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

/* 为推荐工具添加特殊样式 */
.tool-card.recommended {
  border: 2px solid #667eea;
}

.tool-card.recommended::before {
  opacity: 1;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
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
  font-size: 1.375rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  line-height: 1.4;
  flex: 1;
  transition: color 0.3s;
}

.tool-card:hover .tool-name {
  color: #667eea;
}

.tool-badges {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
  flex-wrap: wrap;
}

.tool-badges .el-tag {
  font-weight: 500;
  border-radius: 12px;
  padding: 4px 10px;
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
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
}

.feature-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8125rem;
  color: #4b5563;
  background: #f3f4f6;
  padding: 6px 12px;
  border-radius: 12px;
  transition: all 0.2s;
}

.tool-card:hover .feature-item {
  background: #e0e7ff;
  color: #4338ca;
}

.feature-item .el-icon {
  color: #10b981;
  font-size: 0.875rem;
  flex-shrink: 0;
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
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
  margin-top: auto;
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

.tool-footer .el-button {
  font-weight: 500;
  border-radius: 10px;
  padding: 8px 20px;
  transition: all 0.3s;
}

.tool-card:hover .tool-footer .el-button {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
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
