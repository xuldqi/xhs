<template>
  <div class="intelligence-view">
    <!-- 页面头部 -->
    <div class="intelligence-header">
      <div class="container">
        <Breadcrumb :items="breadcrumbItems" />
        
        <div class="header-content">
          <h1 class="page-title">情报局</h1>
          <p class="page-description">
            第一时间掌握小红书平台动态、新功能、政策变化和趋势分析
          </p>
        </div>

        <!-- 筛选区域 -->
        <div class="filter-section">
          <el-tabs v-model="activeCategory" @tab-change="handleCategoryChange">
            <el-tab-pane label="全部" name="all" />
            <el-tab-pane label="平台动态" name="platform-updates" />
            <el-tab-pane label="新功能" name="new-features" />
            <el-tab-pane label="政策变化" name="policy-changes" />
            <el-tab-pane label="趋势分析" name="trend-analysis" />
          </el-tabs>
          
          <div class="filter-controls">
            <el-select v-model="urgencyFilter" placeholder="紧急程度" clearable>
              <el-option label="高" value="high" />
              <el-option label="中" value="medium" />
              <el-option label="低" value="low" />
            </el-select>
            
            <el-button :icon="Rss" @click="handleSubscribe">
              RSS 订阅
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 情报列表 -->
    <div class="intelligence-content">
      <div class="container">
        <!-- 突发情报 -->
        <div v-if="breakingNews.length > 0" class="breaking-section">
          <h2 class="section-title">
            <el-icon><Bell /></el-icon>
            突发情报
          </h2>
          <div class="breaking-grid">
            <IntelligenceCard
              v-for="item in breakingNews"
              :key="item.id"
              :intelligence="item"
              @click="handleIntelligenceClick(item)"
            />
          </div>
        </div>

        <!-- 最新情报 -->
        <div class="latest-section">
          <h2 class="section-title">最新情报</h2>
          
          <div v-if="loading" class="loading-state">
            <el-skeleton :rows="5" animated />
          </div>
          
          <div v-else-if="intelligence.length === 0" class="empty-state">
            <el-empty description="暂无相关情报">
              <el-button type="primary" @click="clearFilters">清除筛选条件</el-button>
            </el-empty>
          </div>
          
          <div v-else class="intelligence-list">
            <IntelligenceCard
              v-for="item in intelligence"
              :key="item.id"
              :intelligence="item"
              @click="handleIntelligenceClick(item)"
            />
          </div>
          
          <!-- 分页 -->
          <div v-if="totalPages > 1" class="pagination-wrapper">
            <el-pagination
              v-model:current-page="currentPage"
              :page-size="pageSize"
              :total="totalCount"
              layout="prev, pager, next, jumper"
              @current-change="handlePageChange"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Bell, Link } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { contentService } from '@/services/contentService'
import { analytics } from '@/utils/analytics'
import type { IntelligencePost } from '@/types/content'
import Breadcrumb from '@/components/Breadcrumb.vue'
import IntelligenceCard from '@/components/intelligence/IntelligenceCard.vue'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const intelligence = ref<IntelligencePost[]>([])
const breakingNews = ref<IntelligencePost[]>([])
const activeCategory = ref('all')
const urgencyFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const totalCount = ref(0)

// 计算属性
const breadcrumbItems = computed(() => [
  { label: '首页', path: '/' },
  { label: '情报局', path: '/intelligence' }
])

const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value))

// 方法
const loadIntelligence = async () => {
  loading.value = true
  
  try {
    const filter: any = {
      sortBy: 'publishedAt',
      sortOrder: 'desc' as const,
      page: currentPage.value,
      limit: pageSize.value
    }
    
    if (activeCategory.value !== 'all') {
      filter.category = activeCategory.value
    }
    
    if (urgencyFilter.value) {
      filter.urgency = urgencyFilter.value
    }
    
    const response = await contentService.getIntelligence(filter)
    intelligence.value = response.data
    totalCount.value = response.total
    
    // 追踪页面浏览
    analytics.track('intelligence_page_view', {
      category: activeCategory.value,
      page: currentPage.value
    })
  } catch (error) {
    console.error('Failed to load intelligence:', error)
  } finally {
    loading.value = false
  }
}

const loadBreakingNews = async () => {
  try {
    const response = await contentService.getIntelligence({
      isBreaking: true,
      limit: 3,
      sortBy: 'publishedAt',
      sortOrder: 'desc'
    })
    breakingNews.value = response.data
  } catch (error) {
    console.error('Failed to load breaking news:', error)
  }
}

const handleCategoryChange = () => {
  currentPage.value = 1
  loadIntelligence()
}

const clearFilters = () => {
  activeCategory.value = 'all'
  urgencyFilter.value = ''
  currentPage.value = 1
  loadIntelligence()
}

const handlePageChange = () => {
  loadIntelligence()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleIntelligenceClick = (item: IntelligencePost) => {
  // 增加浏览量
  contentService.incrementViewCount('intelligence', item.id)
  
  // 追踪点击
  analytics.track('intelligence_click', {
    intelligenceId: item.id,
    title: item.title,
    category: item.category
  })
  
  // 跳转到情报详情
  router.push(`/intelligence/${item.id}`)
}

const handleSubscribe = () => {
  // 生成 RSS 订阅链接
  const rssUrl = `${window.location.origin}/api/intelligence/rss`
  
  // 复制到剪贴板
  navigator.clipboard.writeText(rssUrl).then(() => {
    ElMessage.success('RSS 订阅链接已复制到剪贴板')
    
    analytics.track('intelligence_rss_subscribe', {
      url: rssUrl
    })
  }).catch(err => {
    console.error('Copy failed:', err)
    ElMessage.error('复制失败')
  })
}

// 监听筛选条件变化
watch(urgencyFilter, () => {
  currentPage.value = 1
  loadIntelligence()
})

// 初始化
onMounted(() => {
  loadBreakingNews()
  loadIntelligence()
})
</script>

<style scoped>
.intelligence-view {
  min-height: 100vh;
  background: var(--bg-primary);
}

.intelligence-header {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  padding: 32px 0 48px;
}

.container {
  max-width: var(--container-lg);
  margin: 0 auto;
  padding: 0 20px;
}

.header-content {
  text-align: center;
  margin: 32px 0;
}

.page-title {
  font-size: 3rem;
  font-weight: 700;
  margin: 0 0 16px 0;
}

.page-description {
  font-size: 1.125rem;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.filter-section {
  max-width: 800px;
  margin: 0 auto;
}

.filter-section :deep(.el-tabs__header) {
  margin: 0 0 20px 0;
}

.filter-section :deep(.el-tabs__nav-wrap::after) {
  display: none;
}

.filter-section :deep(.el-tabs__item) {
  color: rgba(255, 255, 255, 0.8);
  border-bottom: 2px solid transparent;
}

.filter-section :deep(.el-tabs__item.is-active) {
  color: white;
  border-bottom-color: white;
}

.filter-controls {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.intelligence-content {
  padding: 48px 0;
}

.breaking-section {
  margin-bottom: 48px;
  padding: 24px;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-radius: var(--radius-lg);
  border: 2px solid #fbbf24;
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

.breaking-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.latest-section {
  margin-bottom: 48px;
}

.loading-state,
.empty-state {
  padding: 48px 0;
}

.intelligence-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 48px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 32px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }
  
  .filter-controls {
    flex-direction: column;
  }
  
  .breaking-grid {
    grid-template-columns: 1fr;
  }
  
  .breaking-section {
    padding: 16px;
  }
  
  .intelligence-header {
    padding: 24px 0 32px;
  }
  
  .container {
    padding: 0 16px;
  }
}
</style>
