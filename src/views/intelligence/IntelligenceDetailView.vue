<template>
  <div class="intelligence-detail-view">
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>
    
    <div v-else-if="intelligence" class="intelligence-container">
      <!-- 面包屑导航 -->
      <div class="breadcrumb-section">
        <div class="container">
          <Breadcrumb :items="breadcrumbItems" />
        </div>
      </div>

      <!-- 情报头部 -->
      <header class="intelligence-header" :class="`urgency-${intelligence.urgency}`">
        <div class="container">
          <div class="header-badges">
            <el-tag :type="getUrgencyType(intelligence.urgency)" size="large">
              {{ getUrgencyText(intelligence.urgency) }}
            </el-tag>
            <el-tag type="info" size="large">
              {{ getCategoryName(intelligence.category) }}
            </el-tag>
            <el-tag v-if="intelligence.isBreaking" type="danger" size="large">
              <el-icon><Bell /></el-icon>
              突发情报
            </el-tag>
          </div>
          
          <h1 class="intelligence-title">{{ intelligence.title }}</h1>
          
          <div class="intelligence-meta">
            <span class="meta-item">
              <el-icon><Calendar /></el-icon>
              {{ formatDate(intelligence.publishedAt) }}
            </span>
            <span v-if="intelligence.source" class="meta-item">
              <el-icon><Link /></el-icon>
              来源：{{ intelligence.source }}
            </span>
            <span class="meta-item">
              <el-icon><View /></el-icon>
              {{ intelligence.viewCount }}次浏览
            </span>
          </div>
        </div>
      </header>

      <!-- 情报内容 -->
      <div class="intelligence-body">
        <div class="container">
          <article class="main-content">
            <!-- 摘要 -->
            <div v-if="intelligence.description" class="intelligence-summary">
              <h2>摘要</h2>
              <p>{{ intelligence.description }}</p>
            </div>

            <!-- 正文 -->
            <div class="intelligence-content" v-html="renderedContent"></div>
            
            <!-- 标签 -->
            <div v-if="intelligence.tags.length > 0" class="intelligence-tags-section">
              <h3>相关标签</h3>
              <div class="tags-list">
                <el-tag
                  v-for="tag in intelligence.tags"
                  :key="tag"
                  size="large"
                  :type="getUrgencyType(intelligence.urgency)"
                  effect="plain"
                >
                  {{ tag }}
                </el-tag>
              </div>
            </div>

            <!-- 互动按钮 -->
            <div class="intelligence-actions">
              <el-button
                :type="isLiked ? 'primary' : 'default'"
                :icon="Star"
                size="large"
                @click="handleLike"
              >
                {{ isLiked ? '已收藏' : '收藏' }} ({{ likeCount }})
              </el-button>
              <el-button :icon="Share" size="large" @click="handleShare">
                分享
              </el-button>
            </div>
          </article>
        </div>
      </div>
    </div>
    
    <div v-else class="error-state">
      <el-empty description="情报不存在">
        <el-button type="primary" @click="$router.push('/intelligence')">
          返回情报局
        </el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Bell, Calendar, Link, View, Star, Share } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { marked } from 'marked'
import { contentService } from '@/services/contentService'
import { analytics } from '@/utils/analytics'
import type { IntelligencePost } from '@/types/content'
import Breadcrumb from '@/components/Breadcrumb.vue'

const route = useRoute()
const router = useRouter()

// 响应式数据
const loading = ref(true)
const intelligence = ref<IntelligencePost | null>(null)
const isLiked = ref(false)
const likeCount = ref(0)

// 计算属性
const breadcrumbItems = computed(() => {
  const items = [
    { label: '首页', path: '/' },
    { label: '情报局', path: '/intelligence' }
  ]
  
  if (intelligence.value) {
    items.push({ label: intelligence.value.title, path: '' })
  }
  
  return items
})

const renderedContent = computed(() => {
  if (!intelligence.value) return ''
  return marked(intelligence.value.content)
})

// 方法
const getCategoryName = (category: string) => {
  const map: Record<string, string> = {
    'platform-updates': '平台动态',
    'new-features': '新功能',
    'policy-changes': '政策变化',
    'trend-analysis': '趋势分析'
  }
  return map[category] || category
}

const getUrgencyText = (urgency: string) => {
  const map: Record<string, string> = {
    high: '高度关注',
    medium: '中度关注',
    low: '一般关注'
  }
  return map[urgency] || urgency
}

const getUrgencyType = (urgency: string) => {
  const map: Record<string, any> = {
    high: 'danger',
    medium: 'warning',
    low: 'info'
  }
  return map[urgency] || 'info'
}

const formatDate = (dateString?: string) => {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const loadIntelligence = async () => {
  loading.value = true
  
  try {
    const intelligenceId = route.params.id as string
    intelligence.value = await contentService.getContentById<IntelligencePost>('intelligence', intelligenceId)
    likeCount.value = intelligence.value.likeCount
    
    // 追踪情报浏览
    analytics.track('intelligence_view', {
      intelligenceId: intelligence.value.id,
      title: intelligence.value.title,
      category: intelligence.value.category,
      urgency: intelligence.value.urgency
    })
  } catch (error) {
    console.error('Failed to load intelligence:', error)
    ElMessage.error('加载情报失败')
  } finally {
    loading.value = false
  }
}

const handleLike = async () => {
  if (!intelligence.value) return
  
  try {
    const result = await contentService.toggleLike('intelligence', intelligence.value.id)
    isLiked.value = result.liked
    likeCount.value = result.count
    
    analytics.track('intelligence_like', {
      intelligenceId: intelligence.value.id,
      liked: result.liked
    })
    
    ElMessage.success(result.liked ? '收藏成功' : '取消收藏')
  } catch (error) {
    console.error('Failed to toggle like:', error)
    ElMessage.error('操作失败')
  }
}

const handleShare = () => {
  if (!intelligence.value) return
  
  const url = window.location.href
  
  if (navigator.share) {
    navigator.share({
      title: intelligence.value.title,
      text: intelligence.value.description,
      url
    }).then(() => {
      analytics.track('intelligence_share', {
        intelligenceId: intelligence.value!.id,
        method: 'native'
      })
    }).catch(err => {
      console.error('Share failed:', err)
    })
  } else {
    navigator.clipboard.writeText(url).then(() => {
      ElMessage.success('链接已复制到剪贴板')
      analytics.track('intelligence_share', {
        intelligenceId: intelligence.value!.id,
        method: 'clipboard'
      })
    }).catch(err => {
      console.error('Copy failed:', err)
      ElMessage.error('复制失败')
    })
  }
}

// 初始化
onMounted(() => {
  loadIntelligence()
})
</script>

<style scoped>
.intelligence-detail-view {
  min-height: 100vh;
  background: var(--bg-primary);
}

.loading-container {
  max-width: var(--container-lg);
  margin: 0 auto;
  padding: 48px 20px;
}

.container {
  max-width: var(--container-lg);
  margin: 0 auto;
  padding: 0 20px;
}

.breadcrumb-section {
  padding: 24px 0;
  background: white;
  border-bottom: 1px solid var(--border-color);
}

.intelligence-header {
  padding: 48px 0;
  color: white;
}

.urgency-high {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.urgency-medium {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.urgency-low {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.header-badges {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.intelligence-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 24px 0;
  line-height: 1.3;
}

.intelligence-meta {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  opacity: 0.9;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
}

.intelligence-body {
  padding: 48px 0;
}

.main-content {
  background: white;
  border-radius: var(--radius-lg);
  padding: 48px;
  box-shadow: var(--shadow-sm);
}

.intelligence-summary {
  padding: 24px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  margin-bottom: 32px;
  border-left: 4px solid #f59e0b;
}

.intelligence-summary h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: var(--text-primary);
}

.intelligence-summary p {
  font-size: 1rem;
  line-height: 1.8;
  color: var(--text-secondary);
  margin: 0;
}

.intelligence-content {
  font-size: 1.0625rem;
  line-height: 1.8;
  color: var(--text-primary);
}

.intelligence-content :deep(h2),
.intelligence-content :deep(h3) {
  margin: 32px 0 16px;
  font-weight: 600;
}

.intelligence-content :deep(h2) {
  font-size: 1.5rem;
}

.intelligence-content :deep(h3) {
  font-size: 1.25rem;
}

.intelligence-content :deep(p) {
  margin: 16px 0;
}

.intelligence-content :deep(ul),
.intelligence-content :deep(ol) {
  margin: 16px 0;
  padding-left: 24px;
}

.intelligence-content :deep(li) {
  margin: 8px 0;
}

.intelligence-tags-section {
  margin-top: 48px;
  padding-top: 32px;
  border-top: 1px solid var(--border-color);
}

.intelligence-tags-section h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 16px 0;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.intelligence-actions {
  margin-top: 32px;
  display: flex;
  gap: 16px;
  justify-content: center;
}

.error-state {
  padding: 100px 20px;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .intelligence-title {
    font-size: 1.75rem;
  }
  
  .main-content {
    padding: 24px 16px;
  }
  
  .intelligence-content {
    font-size: 1rem;
  }
  
  .intelligence-meta {
    gap: 16px;
  }
}
</style>
