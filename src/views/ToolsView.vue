<template>
  <div class="tools-view">
    <!-- 页面头部 -->
    <div class="tools-header">
      <div class="container">
        <Breadcrumb :items="breadcrumbItems" />
        
        <div class="header-content">
          <h1 class="page-title">工具矩阵</h1>
          <p class="page-description">
            精选 AI 创作与运营工具，助力小红书账号高效增长
          </p>
        </div>

        <!-- 分类筛选 -->
        <div class="category-filter">
          <el-button
            v-for="category in categories"
            :key="category.value"
            :class="{ active: activeCategory === category.value }"
            class="filter-btn"
            @click="activeCategory = category.value"
          >
            <el-icon><component :is="category.icon" /></el-icon>
            {{ category.label }}
          </el-button>
        </div>
      </div>
    </div>

    <!-- 工具列表 -->
    <div class="tools-content">
      <div class="container">
        <div v-if="loading" class="loading-state">
          <el-skeleton :rows="5" animated />
        </div>
        
        <div v-else class="tools-grid">
          <ToolCard
            v-for="tool in filteredTools"
            :key="tool.id"
            :tool="tool"
            @click="handleToolClick(tool)"
          />
        </div>
        
        <div v-if="filteredTools.length === 0" class="empty-state">
          <el-empty description="暂无相关工具" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Edit, TrendCharts, DataAnalysis, Setting, Promotion } from '@element-plus/icons-vue'
import { analytics } from '@/utils/analytics'
import { toolsList, type ToolItem } from '@/data/toolsData'
import Breadcrumb from '@/components/Breadcrumb.vue'
import ToolCard from '@/components/tools/ToolCard.vue'

const router = useRouter()

// 分类定义
const categories = [
  { label: '全部', value: 'all', icon: Setting },
  { label: '内容创作', value: 'content-creation', icon: Edit },
  { label: '数据分析', value: 'data-analysis', icon: TrendCharts },
  { label: 'SEO优化', value: 'seo-optimization', icon: DataAnalysis },
  { label: '自动化', value: 'automation', icon: Setting },
  { label: '推广', value: 'promotion', icon: Promotion }
]

// 响应式数据（工具列表来自 data/toolsData，便于统一维护）
const loading = ref(false)
const activeCategory = ref('all')
const tools = ref<ToolItem[]>([...toolsList])

// 计算属性
const breadcrumbItems = computed(() => [
  { label: '首页', path: '/' },
  { label: '工具矩阵', path: '/tools' }
])

const filteredTools = computed(() => {
  if (activeCategory.value === 'all') {
    return tools.value
  }
  return tools.value.filter(tool => tool.category === activeCategory.value)
})

// 方法
const handleToolClick = (tool: any) => {
  analytics.track('tool_click', {
    toolId: tool.id,
    toolName: tool.name,
    category: tool.category
  })
  
  router.push(tool.url)
}

// 初始化
onMounted(() => {
  analytics.track('tools_page_view')
})
</script>

<style scoped>
.tools-view {
  min-height: 100vh;
  background: white;
}

.tools-header {
  background: white;
  color: var(--text-primary);
  padding: 60px 0 40px;
  border-bottom: 1px solid var(--color-gray-100);
}

.header-content {
  text-align: center;
  margin: 20px 0 40px;
}

.page-title {
  font-size: 3rem;
  font-weight: 800;
  margin: 0 0 16px 0;
  letter-spacing: -0.02em;
  color: var(--color-gray-900);
}

.page-description {
  font-size: 1.125rem;
  color: var(--color-gray-500);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.category-filter {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}

.filter-btn {
  background: var(--color-gray-50) !important;
  border: 1px solid transparent !important;
  color: var(--color-gray-600) !important;
  padding: 8px 20px !important;
  border-radius: var(--radius-base) !important;
  transition: all var(--transition-base) !important;
  font-weight: 500 !important;
}

.filter-btn:hover {
  background: var(--color-gray-100) !important;
  color: var(--color-gray-900) !important;
}

.filter-btn.active {
  background: white !important;
  color: var(--color-primary-500) !important;
  border-color: var(--color-primary-500) !important;
  box-shadow: var(--shadow-sm);
}

.tools-content {
  padding: 60px 0;
  background: var(--color-gray-50);
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 32px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-title {
    font-size: 2.25rem;
  }
  
  .tools-header {
    padding: 40px 0 30px;
  }
  
  .tools-grid {
    grid-template-columns: 1fr;
  }
}
</style>
