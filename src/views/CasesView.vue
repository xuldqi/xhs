<template>
  <div class="cases-view">
    <!-- 页面头部 -->
    <div class="cases-header">
      <div class="container">
        <Breadcrumb :items="breadcrumbItems" />
        
        <div class="header-content">
          <h1 class="page-title">案例库</h1>
          <p class="page-description">
            真实的小红书账号增长案例，学习成功经验，复制增长路径
          </p>
        </div>

        <!-- 筛选区域 -->
        <div class="filter-section">
          <div class="filter-controls">
            <el-select v-model="categoryFilter" placeholder="账号类型" clearable>
              <el-option label="美妆博主" value="beauty" />
              <el-option label="时尚穿搭" value="fashion" />
              <el-option label="美食探店" value="food" />
              <el-option label="生活方式" value="lifestyle" />
              <el-option label="知识分享" value="knowledge" />
            </el-select>
            
            <el-select v-model="followersFilter" placeholder="粉丝量级" clearable>
              <el-option label="0-1万" value="0-10000" />
              <el-option label="1-5万" value="10000-50000" />
              <el-option label="5-10万" value="50000-100000" />
              <el-option label="10万+" value="100000+" />
            </el-select>
            
            <el-select v-model="growthFilter" placeholder="增长速度" clearable>
              <el-option label="快速增长 (>500%)" value="fast" />
              <el-option label="稳定增长 (100-500%)" value="steady" />
              <el-option label="缓慢增长 (<100%)" value="slow" />
            </el-select>
            
            <el-select v-model="sortBy" placeholder="排序">
              <el-option label="最新发布" value="publishedAt" />
              <el-option label="增长率最高" value="growthRate" />
              <el-option label="最多浏览" value="viewCount" />
            </el-select>
          </div>
        </div>
      </div>
    </div>

    <!-- 案例列表 -->
    <div class="cases-content">
      <div class="container">
        <div v-if="loading" class="loading-state">
          <el-skeleton :rows="5" animated />
        </div>
        
        <div v-else-if="cases.length === 0" class="empty-state">
          <el-empty description="暂无相关案例">
            <el-button type="primary" @click="clearFilters">清除筛选条件</el-button>
          </el-empty>
        </div>
        
        <div v-else class="cases-grid">
          <CaseCard
            v-for="caseStudy in cases"
            :key="caseStudy.id"
            :case-study="caseStudy"
            @click="handleCaseClick(caseStudy)"
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
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { contentService } from '@/services/contentService'
import { analytics } from '@/utils/analytics'
import type { CaseStudy } from '@/types/content'
import Breadcrumb from '@/components/Breadcrumb.vue'
import CaseCard from '@/components/cases/CaseCard.vue'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const cases = ref<CaseStudy[]>([])
const categoryFilter = ref('')
const followersFilter = ref('')
const growthFilter = ref('')
const sortBy = ref('growthRate')
const currentPage = ref(1)
const pageSize = ref(12)
const totalCount = ref(0)

// 计算属性
const breadcrumbItems = computed(() => [
  { label: '案例库', path: '/cases' }
])

const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value))

// 方法
const loadCases = async () => {
  loading.value = true
  
  try {
    const filter: any = {
      sortBy: sortBy.value,
      sortOrder: 'desc' as const,
      page: currentPage.value,
      limit: pageSize.value
    }
    
    // 应用筛选条件
    if (categoryFilter.value) {
      filter.accountType = categoryFilter.value
    }
    
    if (followersFilter.value) {
      const [min, max] = followersFilter.value.split('-')
      filter.followersMin = parseInt(min)
      if (max !== '+') {
        filter.followersMax = parseInt(max)
      }
    }
    
    if (growthFilter.value) {
      switch (growthFilter.value) {
        case 'fast':
          filter.growthRateMin = 500
          break
        case 'steady':
          filter.growthRateMin = 100
          filter.growthRateMax = 500
          break
        case 'slow':
          filter.growthRateMax = 100
          break
      }
    }
    
    const response = await contentService.getCaseStudies(filter)
    cases.value = response.data
    totalCount.value = response.total
    
    // 追踪页面浏览
    analytics.track('cases_page_view', {
      category: categoryFilter.value,
      page: currentPage.value
    })
  } catch (error) {
    console.error('Failed to load cases:', error)
  } finally {
    loading.value = false
  }
}

const clearFilters = () => {
  categoryFilter.value = ''
  followersFilter.value = ''
  growthFilter.value = ''
  currentPage.value = 1
  loadCases()
}

const handlePageChange = () => {
  loadCases()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleCaseClick = (caseStudy: CaseStudy) => {
  // 增加浏览量
  contentService.incrementViewCount('case-studies', caseStudy.id)
  
  // 追踪点击
  analytics.track('case_click', {
    caseId: caseStudy.id,
    title: caseStudy.title,
    accountType: caseStudy.accountType
  })
  
  // 跳转到案例详情
  router.push(`/cases/${caseStudy.id}`)
}

// 监听筛选条件变化
watch([categoryFilter, followersFilter, growthFilter, sortBy], () => {
  currentPage.value = 1
  loadCases()
})

// 初始化
onMounted(() => {
  loadCases()
})
</script>

<style scoped>
.cases-view {
  min-height: 100vh;
  background: var(--bg-primary);
}

.cases-header {
  background: #ffffff;
  color: #1a1a1a;
  padding: 32px 0 48px;
  border-bottom: 1px solid #e5e7eb;
}

.container {
  max-width: var(--container-xl);
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
  color: #1a1a1a;
}

.page-description {
  font-size: 1.125rem;
  color: #6b7280;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.filter-section {
  max-width: 900px;
  margin: 0 auto;
}

.filter-controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.cases-content {
  padding: 48px 0;
}

.loading-state,
.empty-state {
  padding: 48px 0;
}

.cases-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 24px;
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
    grid-template-columns: 1fr;
  }
  
  .cases-grid {
    grid-template-columns: 1fr;
  }
  
  .cases-header {
    padding: 24px 0 32px;
  }
  
  .container {
    padding: 0 16px;
  }
}
</style>
