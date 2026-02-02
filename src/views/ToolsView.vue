<template>
  <div class="tools-view">
    <!-- 页面头部 -->
    <div class="tools-header">
      <div class="container">
        <Breadcrumb :items="breadcrumbItems" />
        
        <div class="header-content">
          <h1 class="page-title">工具矩阵</h1>
          <p class="page-description">
            精选实用工具，提升小红书运营效率
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
  background: var(--bg-primary);
}

.tools-header {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  padding: 32px 0 48px;
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
}

.page-description {
  font-size: 1.125rem;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.category-filter {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.category-filter .el-button {
  display: flex;
  align-items: center;
  gap: 6px;
}

.tools-content {
  padding: 48px 0;
}

.loading-state,
.empty-state {
  padding: 48px 0;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
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
  
  .tools-grid {
    grid-template-columns: 1fr;
  }
  
  .tools-header {
    padding: 24px 0 32px;
  }
  
  .container {
    padding: 0 16px;
  }
}
</style>
