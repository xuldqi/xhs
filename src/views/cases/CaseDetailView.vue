<template>
  <div class="case-detail-view">
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>
    
    <div v-else-if="caseStudy" class="case-container">
      <!-- 面包屑导航 -->
      <div class="breadcrumb-section">
        <div class="container">
          <Breadcrumb :items="breadcrumbItems" />
        </div>
      </div>

      <!-- 案例头部 -->
      <header class="case-header">
        <div class="container">
          <div class="header-tags">
            <el-tag type="success">{{ caseStudy.accountType }}</el-tag>
            <el-tag v-if="caseStudy.featured" type="warning">
              <el-icon><Star /></el-icon>
              精选案例
            </el-tag>
          </div>
          
          <h1 class="case-title">{{ caseStudy.title }}</h1>
          
          <p v-if="caseStudy.description" class="case-description">
            {{ caseStudy.description }}
          </p>
          
          <!-- 核心数据 -->
          <div class="core-stats">
            <div class="stat-card">
              <div class="stat-label">起始粉丝</div>
              <div class="stat-value">{{ formatNumber(caseStudy.followersBefore) }}</div>
            </div>
            <div class="stat-divider">
              <el-icon><Right /></el-icon>
            </div>
            <div class="stat-card">
              <div class="stat-label">当前粉丝</div>
              <div class="stat-value highlight">{{ formatNumber(caseStudy.followersAfter) }}</div>
            </div>
            <div class="stat-card growth">
              <div class="stat-label">增长率</div>
              <div class="stat-value success">+{{ caseStudy.growthRate }}%</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">增长周期</div>
              <div class="stat-value">{{ caseStudy.growthPeriod }}</div>
            </div>
          </div>
        </div>
      </header>

      <!-- 案例内容 -->
      <div class="case-body">
        <div class="container">
          <!-- 增长曲线图 -->
          <section class="section growth-chart-section">
            <h2 class="section-title">
              <el-icon><TrendCharts /></el-icon>
              增长曲线
            </h2>
            <div class="chart-container">
              <GrowthChart :timeline="caseStudy.timeline" />
            </div>
          </section>

          <!-- 时间线 -->
          <section class="section timeline-section">
            <h2 class="section-title">
              <el-icon><Clock /></el-icon>
              增长时间线
            </h2>
            <div class="timeline">
              <div
                v-for="(event, index) in caseStudy.timeline"
                :key="index"
                class="timeline-item"
              >
                <div class="timeline-marker"></div>
                <div class="timeline-content">
                  <div class="timeline-date">{{ formatDate(event.date) }}</div>
                  <h3 class="timeline-title">{{ event.title }}</h3>
                  <p class="timeline-description">{{ event.description }}</p>
                  <div v-if="event.metrics" class="timeline-metrics">
                    <span v-if="event.metrics.followers" class="metric">
                      粉丝: {{ formatNumber(event.metrics.followers) }}
                    </span>
                    <span v-if="event.metrics.engagement" class="metric">
                      互动率: {{ event.metrics.engagement }}%
                    </span>
                    <span v-if="event.metrics.posts" class="metric">
                      发布: {{ event.metrics.posts }}篇
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- 关键策略 -->
          <section class="section strategies-section">
            <h2 class="section-title">
              <el-icon><Opportunity /></el-icon>
              关键策略
            </h2>
            <div class="strategies-grid">
              <div
                v-for="(strategy, index) in caseStudy.keyStrategies"
                :key="index"
                class="strategy-card"
              >
                <div class="strategy-number">{{ index + 1 }}</div>
                <div class="strategy-content">{{ strategy }}</div>
              </div>
            </div>
          </section>

          <!-- 数据指标 -->
          <section class="section metrics-section">
            <h2 class="section-title">
              <el-icon><DataAnalysis /></el-icon>
              数据指标
            </h2>
            <div class="metrics-grid">
              <div class="metric-card">
                <div class="metric-label">总发布笔记</div>
                <div class="metric-value">{{ caseStudy.metrics.totalPosts }}</div>
              </div>
              <div class="metric-card">
                <div class="metric-label">平均互动率</div>
                <div class="metric-value">{{ caseStudy.metrics.avgEngagementRate }}%</div>
              </div>
              <div class="metric-card">
                <div class="metric-label">最佳笔记类型</div>
                <div class="metric-value">{{ caseStudy.metrics.topPerformingPostType }}</div>
              </div>
              <div class="metric-card">
                <div class="metric-label">最佳发布时间</div>
                <div class="metric-value">{{ caseStudy.metrics.bestPostingTime }}</div>
              </div>
            </div>
          </section>

          <!-- 案例正文 -->
          <section class="section content-section">
            <h2 class="section-title">
              <el-icon><Document /></el-icon>
              详细分析
            </h2>
            <div class="case-content" v-html="renderedContent"></div>
          </section>

          <!-- 互动按钮 -->
          <div class="case-actions">
            <el-button
              :type="isLiked ? 'primary' : 'default'"
              :icon="Star"
              size="large"
              @click="handleLike"
            >
              {{ isLiked ? '已收藏' : '收藏案例' }} ({{ likeCount }})
            </el-button>
            <el-button :icon="Share" size="large" @click="handleShare">
              分享案例
            </el-button>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="error-state">
      <el-empty description="案例不存在">
        <el-button type="primary" @click="$router.push('/cases')">
          返回案例库
        </el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Star, Share, Right, Clock, TrendCharts, Opportunity, DataAnalysis, Document } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { marked } from 'marked'
import { contentService } from '@/services/contentService'
import { analytics } from '@/utils/analytics'
import type { CaseStudy } from '@/types/content'
import Breadcrumb from '@/components/Breadcrumb.vue'
import GrowthChart from '@/components/cases/GrowthChart.vue'

const route = useRoute()
const router = useRouter()

// 响应式数据
const loading = ref(true)
const caseStudy = ref<CaseStudy | null>(null)
const isLiked = ref(false)
const likeCount = ref(0)

// 计算属性
const breadcrumbItems = computed(() => {
  const items = [
    { label: '首页', path: '/' },
    { label: '案例库', path: '/cases' }
  ]
  
  if (caseStudy.value) {
    items.push({ label: caseStudy.value.title, path: '' })
  }
  
  return items
})

const renderedContent = computed(() => {
  if (!caseStudy.value) return ''
  return marked(caseStudy.value.content)
})

// 方法
const formatNumber = (num: number) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const loadCase = async () => {
  loading.value = true
  
  try {
    const caseId = route.params.id as string
    caseStudy.value = await contentService.getContentById<CaseStudy>('case_studies', caseId)
    likeCount.value = caseStudy.value.likeCount
    
    // 追踪案例浏览
    analytics.track('case_view', {
      caseId: caseStudy.value.id,
      title: caseStudy.value.title,
      accountType: caseStudy.value.accountType
    })
  } catch (error) {
    console.error('Failed to load case:', error)
    ElMessage.error('加载案例失败')
  } finally {
    loading.value = false
  }
}

const handleLike = async () => {
  if (!caseStudy.value) return
  
  try {
    const result = await contentService.toggleLike('case_studies', caseStudy.value.id)
    isLiked.value = result.liked
    likeCount.value = result.count
    
    analytics.track('case_like', {
      caseId: caseStudy.value.id,
      liked: result.liked
    })
    
    ElMessage.success(result.liked ? '收藏成功' : '取消收藏')
  } catch (error) {
    console.error('Failed to toggle like:', error)
    ElMessage.error('操作失败')
  }
}

const handleShare = () => {
  if (!caseStudy.value) return
  
  const url = window.location.href
  
  if (navigator.share) {
    navigator.share({
      title: caseStudy.value.title,
      text: caseStudy.value.description,
      url
    }).then(() => {
      analytics.track('case_share', {
        caseId: caseStudy.value!.id,
        method: 'native'
      })
    }).catch(err => {
      console.error('Share failed:', err)
    })
  } else {
    navigator.clipboard.writeText(url).then(() => {
      ElMessage.success('链接已复制到剪贴板')
      analytics.track('case_share', {
        caseId: caseStudy.value!.id,
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
  loadCase()
})
</script>

<style scoped>
.case-detail-view {
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

.case-header {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 48px 0;
}

.header-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}

.case-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 16px 0;
  line-height: 1.3;
}

.case-description {
  font-size: 1.125rem;
  opacity: 0.9;
  margin: 0 0 32px 0;
  line-height: 1.6;
}

.core-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 24px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 32px;
  border-radius: var(--radius-lg);
}

.stat-card {
  text-align: center;
}

.stat-label {
  font-size: 0.875rem;
  opacity: 0.8;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
}

.stat-value.highlight {
  color: #fbbf24;
}

.stat-value.success {
  color: #34d399;
}

.stat-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  opacity: 0.5;
}

.case-body {
  padding: 48px 0;
}

.section {
  background: white;
  border-radius: var(--radius-lg);
  padding: 32px;
  margin-bottom: 32px;
  box-shadow: var(--shadow-sm);
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 24px 0;
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text-primary);
}

.chart-container {
  min-height: 400px;
}

.timeline {
  position: relative;
  padding-left: 40px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 15px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--border-color);
}

.timeline-item {
  position: relative;
  padding-bottom: 32px;
}

.timeline-marker {
  position: absolute;
  left: -32px;
  top: 4px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #10b981;
  border: 3px solid white;
  box-shadow: 0 0 0 2px #10b981;
}

.timeline-content {
  background: var(--bg-secondary);
  padding: 20px;
  border-radius: var(--radius-md);
}

.timeline-date {
  font-size: 0.875rem;
  color: var(--text-tertiary);
  margin-bottom: 8px;
}

.timeline-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: var(--text-primary);
}

.timeline-description {
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0 0 12px 0;
}

.timeline-metrics {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.metric {
  font-size: 0.875rem;
  color: var(--text-secondary);
  padding: 4px 12px;
  background: white;
  border-radius: var(--radius-sm);
}

.strategies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
}

.strategy-card {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  align-items: center;
}

.strategy-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #10b981;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.125rem;
  flex-shrink: 0;
}

.strategy-content {
  flex: 1;
  font-size: 0.9375rem;
  color: var(--text-primary);
  line-height: 1.5;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
}

.metric-card {
  text-align: center;
  padding: 24px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.metric-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.metric-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

.case-content {
  font-size: 1.0625rem;
  line-height: 1.8;
  color: var(--text-primary);
}

.case-content :deep(h2),
.case-content :deep(h3) {
  margin: 32px 0 16px;
  font-weight: 600;
}

.case-content :deep(p) {
  margin: 16px 0;
}

.case-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  padding: 32px 0;
}

.error-state {
  padding: 100px 20px;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .case-title {
    font-size: 1.75rem;
  }
  
  .core-stats {
    grid-template-columns: 1fr;
    padding: 24px;
  }
  
  .stat-divider {
    display: none;
  }
  
  .section {
    padding: 24px 16px;
  }
  
  .timeline {
    padding-left: 32px;
  }
  
  .strategies-grid {
    grid-template-columns: 1fr;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
