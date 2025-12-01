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
import { Edit, Camera, TrendCharts, DataAnalysis, Setting, Promotion } from '@element-plus/icons-vue'
import { analytics } from '@/utils/analytics'
import Breadcrumb from '@/components/Breadcrumb.vue'
import ToolCard from '@/components/tools/ToolCard.vue'

const router = useRouter()

// 分类定义
const categories = [
  { label: '全部', value: 'all', icon: Setting },
  { label: '内容创作', value: 'content-creation', icon: Edit },
  { label: '图片编辑', value: 'image-editing', icon: Camera },
  { label: '数据分析', value: 'data-analysis', icon: TrendCharts },
  { label: 'SEO优化', value: 'seo-optimization', icon: DataAnalysis },
  { label: '自动化', value: 'automation', icon: Setting },
  { label: '推广', value: 'promotion', icon: Promotion }
]

// 响应式数据
const loading = ref(false)
const activeCategory = ref('all')

// 工具列表数据
const tools = ref([
  {
    id: '0',
    name: '爆款生成器',
    description: '一站式生成爆款内容：标题 + 封面文字 + 完整文案，让你的笔记轻松上热门',
    category: 'content-creation',
    url: '/tools/viral-generator',
    isFree: true,
    isRecommended: true,
    rating: 5.0,
    features: ['标题生成', '封面文字', '完整文案', '一站式服务'],
    viewCount: 23456,
    likeCount: 5678,
    tags: ['爆款', 'AI', '综合工具']
  },
  {
    id: '1',
    name: '标题生成器',
    description: '基于 AI 的标题生成工具，帮助你创作吸引眼球的标题',
    category: 'content-creation',
    url: '/tools/title-generator',
    isFree: true,
    isRecommended: true,
    rating: 4.8,
    features: ['AI 智能生成', '多种风格', '实时预览', '批量生成'],
    viewCount: 15234,
    likeCount: 3421,
    tags: ['标题', 'AI', '创作']
  },
  {
    id: '2',
    name: '热词洞察工具',
    description: '发现热门概念和趋势词，为你的小红书内容提供选题灵感和关键词',
    category: 'data-analysis',
    url: '/tools/topic-analyzer',
    isFree: true,
    isRecommended: true,
    rating: 4.8,
    features: ['热门概念', '趋势分析', '选题灵感', '关键词提取'],
    viewCount: 12456,
    likeCount: 2876,
    tags: ['热词', '概念', '选题', '趋势']
  },
  {
    id: '9',
    name: '灵感话题库',
    description: '发现"第一次XX"类选题灵感，为你的小红书内容提供源源不断的创作素材',
    category: 'content-creation',
    url: '/tools/topic-inspiration',
    isFree: true,
    isRecommended: true,
    rating: 4.9,
    features: ['话题搜索', '分类浏览', '精选推荐', '一键生成'],
    viewCount: 15678,
    likeCount: 3892,
    tags: ['话题', '灵感', '第一次', '选题']
  },
  {
    id: '3',
    name: '竞品分析工具',
    description: '深度分析竞品账号，学习优秀案例的成功经验',
    category: 'data-analysis',
    url: '/tools/competitor-analyzer',
    isFree: false,
    isRecommended: true,
    rating: 4.9,
    features: ['账号分析', '内容分析', '增长追踪', '报告导出'],
    viewCount: 9876,
    likeCount: 2345,
    tags: ['竞品', '分析', '学习']
  },
  {
    id: '4',
    name: '图片编辑器',
    description: '在线图片编辑工具，快速制作精美的小红书封面',
    category: 'image-editing',
    url: '/tools/image-editor',
    isFree: true,
    isRecommended: false,
    rating: 4.5,
    features: ['模板库', '滤镜效果', '文字添加', '尺寸调整'],
    viewCount: 18765,
    likeCount: 4123,
    tags: ['图片', '编辑', '封面']
  },
  {
    id: '7',
    name: '图片背景移除',
    description: '一键移除图片背景，适用于纯色/近似纯色背景，浏览器本地处理，保护隐私',
    category: 'image-editing',
    url: '/tools/background-remover',
    isFree: true,
    isRecommended: true,
    rating: 4.8,
    features: ['自动采样', '阈值调节', '本地处理', 'PNG导出'],
    viewCount: 21345,
    likeCount: 5234,
    tags: ['抠图', '背景移除', '图片处理']
  },
  {
    id: '8',
    name: '漫画风生成器',
    description: '上传图片，一键生成漫画风效果：边缘描线、阈值、色调分级、网点',
    category: 'image-editing',
    url: '/tools/manga-generator',
    isFree: true,
    isRecommended: true,
    rating: 4.7,
    features: ['边缘描线', '网点效果', '色调分级', '一键导出'],
    viewCount: 18923,
    likeCount: 4567,
    tags: ['漫画', '滤镜', '图片处理']
  },
  {
    id: '5',
    name: 'SEO 关键词工具',
    description: '挖掘高价值关键词，优化内容搜索排名',
    category: 'seo-optimization',
    url: '/tools/keyword-tool',
    isFree: false,
    isRecommended: false,
    rating: 4.7,
    features: ['关键词挖掘', '搜索量分析', '竞争度评估', '长尾词推荐'],
    viewCount: 7654,
    likeCount: 1876,
    tags: ['SEO', '关键词', '优化']
  },
  {
    id: '6',
    name: '定时发布工具',
    description: '自动化内容发布，在最佳时间触达用户',
    category: 'automation',
    url: '/tools/scheduler',
    isFree: false,
    isRecommended: false,
    rating: 4.4,
    features: ['定时发布', '批量管理', '最佳时间推荐', '发布记录'],
    viewCount: 5432,
    likeCount: 1234,
    tags: ['自动化', '发布', '管理']
  }
])

// 计算属性
const breadcrumbItems = computed(() => [
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
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 28px;
}

@media (min-width: 1400px) {
  .tools-grid {
    grid-template-columns: repeat(3, 1fr);
  }
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
