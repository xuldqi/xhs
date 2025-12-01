<template>
  <div class="resources-view">
    <!-- 页面头部 -->
    <div class="resources-header">
      <div class="container">
        <Breadcrumb :items="breadcrumbItems" />
        
        <div class="header-content">
          <h1 class="page-title">资源库</h1>
          <p class="page-description">
            精选模板、SOP文档和工具资源，助力小红书运营效率提升
          </p>
        </div>

        <!-- 分类筛选 -->
        <div class="category-filter">
          <el-button
            v-for="category in categories"
            :key="category.value"
            :type="activeCategory === category.value ? 'primary' : 'default'"
            @click="activeCategory = category.value"
          >
            <el-icon><component :is="category.icon" /></el-icon>
            {{ category.label }}
          </el-button>
        </div>
      </div>
    </div>

    <!-- 资源列表 -->
    <div class="resources-content">
      <div class="container">
        <div v-if="loading" class="loading-state">
          <el-skeleton :rows="5" animated />
        </div>
        
        <div v-else-if="filteredResources.length === 0" class="empty-state">
          <el-empty description="暂无相关资源">
            <el-button type="primary" @click="clearFilters">清除筛选条件</el-button>
          </el-empty>
        </div>
        
        <div v-else class="resources-grid">
          <ResourceCard
            v-for="resource in filteredResources"
            :key="resource.id"
            :resource="resource"
            @click="handleResourceClick(resource)"
            @download="handleDownload(resource)"
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Document, Folder, DataAnalysis, Tools, Collection } from '@element-plus/icons-vue'
import { analytics } from '@/utils/analytics'
import { resources, resourceCategories, getResourcesByCategory } from '@/data/resourcesData'
import type { Resource } from '@/data/resourcesData'
import Breadcrumb from '@/components/Breadcrumb.vue'
import ResourceCard from '@/components/resources/ResourceCard.vue'

const router = useRouter()

// 分类定义
const categories = [
  { label: '全部', value: 'all', icon: Collection },
  { label: '模板', value: '模板', icon: Document },
  { label: 'SOP', value: 'SOP', icon: Folder },
  { label: '文档', value: '文档', icon: Document },
  { label: '数据', value: '数据', icon: DataAnalysis },
  { label: '工具', value: '工具', icon: Tools }
]

// 响应式数据
const loading = ref(false)
const activeCategory = ref('all')
const currentPage = ref(1)
const pageSize = ref(12)
const totalCount = ref(0)

// 计算属性
const breadcrumbItems = computed(() => [
  { label: '资源库', path: '/resources' }
])

const filteredResources = computed(() => {
  let filtered = getResourcesByCategory(activeCategory.value)
  
  // 应用分页
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  totalCount.value = filtered.length
  
  return filtered.slice(start, end)
})

const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value))

// 方法
const clearFilters = () => {
  activeCategory.value = 'all'
  currentPage.value = 1
}

const handlePageChange = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleResourceClick = (resource: Resource) => {
  analytics.track('resource_click', {
    resourceId: resource.id,
    title: resource.title,
    category: resource.category
  })
  
  router.push(`/resources/${resource.id}`)
}

const handleDownload = (resource: Resource) => {
  analytics.track('resource_download', {
    resourceId: resource.id,
    title: resource.title,
    fileFormat: resource.fileFormat
  })
  
  // 这里可以添加实际的下载逻辑
  // 暂时使用模拟下载
  window.open(resource.downloadUrl, '_blank')
}

// 初始化
onMounted(() => {
  totalCount.value = resources.length
  analytics.track('resources_page_view')
})
</script>

<style scoped>
.resources-view {
  min-height: 100vh;
  background: var(--bg-primary);
}

.resources-header {
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

.category-filter {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 32px;
}

.category-filter .el-button {
  display: flex;
  align-items: center;
  gap: 6px;
}

.resources-content {
  padding: 48px 0;
}

.loading-state,
.empty-state {
  padding: 48px 0;
}

.resources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
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
  
  .category-filter {
    gap: 8px;
  }
  
  .category-filter .el-button {
    font-size: 0.875rem;
    padding: 8px 12px;
  }
  
  .resources-grid {
    grid-template-columns: 1fr;
  }
  
  .resources-header {
    padding: 24px 0 32px;
  }
  
  .container {
    padding: 0 16px;
  }
}
</style>

