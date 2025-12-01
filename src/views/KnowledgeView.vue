<template>
  <div class="knowledge-view">
    <!-- 页面头部 -->
    <div class="knowledge-header">
      <div class="container">
        <Breadcrumb :items="breadcrumbItems" />
        
        <div class="header-content">
          <h1 class="page-title">知识库</h1>
          <p class="page-description">
            系统化的小红书运营知识，从新手入门到高级技巧，助你快速成长
          </p>
        </div>

        <!-- 搜索和筛选 -->
        <div class="search-filter-section">
          <div class="search-box">
            <el-input
              v-model="searchQuery"
              placeholder="搜索文章标题、内容..."
              size="large"
              clearable
              @input="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
          
          <div class="filter-tabs">
            <el-tabs v-model="activeCategory" @tab-change="handleCategoryChange">
              <el-tab-pane label="全部" name="all" />
              <el-tab-pane
                v-for="category in categories"
                :key="category.id"
                :label="category.name"
                :name="category.slug"
              />
            </el-tabs>
          </div>
          
          <div class="filter-controls">
            <el-select v-model="difficultyFilter" placeholder="难度" clearable>
              <el-option label="新手" value="beginner" />
              <el-option label="进阶" value="intermediate" />
              <el-option label="高级" value="advanced" />
            </el-select>
            
            <el-select v-model="sortBy" placeholder="排序">
              <el-option label="最新发布" value="publishedAt" />
              <el-option label="最多浏览" value="viewCount" />
              <el-option label="最多点赞" value="likeCount" />
            </el-select>
          </div>
        </div>
      </div>
    </div>

    <!-- 文章列表 -->
    <div class="knowledge-content">
      <div class="container">
        <div class="content-grid">
          <!-- 侧边栏 -->
          <aside class="sidebar">
            <div class="sidebar-section">
              <h3>热门标签</h3>
              <div class="tag-cloud">
                <el-tag
                  v-for="tag in popularTags"
                  :key="tag.name"
                  :type="selectedTags.includes(tag.name) ? 'primary' : ''"
                  class="tag-item"
                  @click="toggleTag(tag.name)"
                >
                  {{ tag.name }} ({{ tag.count }})
                </el-tag>
              </div>
            </div>
            
            <div class="sidebar-section">
              <h3>推荐阅读</h3>
              <div class="recommended-list">
                <div
                  v-for="article in recommendedArticles"
                  :key="article.id"
                  class="recommended-item"
                  @click="$router.push(`/knowledge/articles/${article.id}`)"
                >
                  <h4>{{ article.title }}</h4>
                  <div class="item-meta">
                    <span>{{ article.readingTime }}分钟阅读</span>
                    <span>{{ article.viewCount }}次浏览</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <!-- 主内容区 -->
          <main class="main-content">
            <div v-if="loading" class="loading-state">
              <el-skeleton :rows="5" animated />
            </div>
            
            <div v-else-if="articles.length === 0" class="empty-state">
              <el-empty description="暂无相关文章">
                <el-button type="primary" @click="clearFilters">清除筛选条件</el-button>
              </el-empty>
            </div>
            
            <div v-else class="articles-grid">
              <ArticleCard
                v-for="article in articles"
                :key="article.id"
                :article="article"
                @click="handleArticleClick(article)"
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
          </main>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import { contentService } from '@/services/contentService'
import { analytics } from '@/utils/analytics'
import type { Article, ContentCategory } from '@/types/content'
import Breadcrumb from '@/components/Breadcrumb.vue'
import ArticleCard from '@/components/knowledge/ArticleCard.vue'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const articles = ref<Article[]>([])
const categories = ref<ContentCategory[]>([])
const searchQuery = ref('')
const activeCategory = ref('all')
const difficultyFilter = ref('')
const sortBy = ref('publishedAt')
const selectedTags = ref<string[]>([])
const currentPage = ref(1)
const pageSize = ref(12)
const totalCount = ref(0)
const recommendedArticles = ref<Article[]>([])

// 计算属性
const breadcrumbItems = computed(() => [
  { label: '知识库', path: '/knowledge' }
])

const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value))

const popularTags = computed(() => [
  { name: '新手指南', count: 23 },
  { name: '涨粉攻略', count: 18 },
  { name: '内容创作', count: 15 },
  { name: '数据分析', count: 12 },
  { name: '变现技巧', count: 9 }
])

// 方法
const loadArticles = async () => {
  loading.value = true
  
  try {
    const filter = {
      category: activeCategory.value === 'all' ? undefined : activeCategory.value,
      difficulty: difficultyFilter.value || undefined,
      tags: selectedTags.value.length > 0 ? selectedTags.value : undefined,
      search: searchQuery.value || undefined,
      sortBy: sortBy.value,
      sortOrder: 'desc' as const,
      page: currentPage.value,
      limit: pageSize.value
    }
    
    const response = await contentService.getArticles(filter)
    articles.value = response.data
    totalCount.value = response.total
    
    // 追踪页面浏览
    analytics.track('knowledge_page_view', {
      category: activeCategory.value,
      search: searchQuery.value,
      page: currentPage.value
    })
  } catch (error) {
    console.error('Failed to load articles:', error)
  } finally {
    loading.value = false
  }
}

const loadCategories = async () => {
  try {
    categories.value = await contentService.getCategories()
  } catch (error) {
    console.error('Failed to load categories:', error)
  }
}

const loadRecommendedArticles = async () => {
  try {
    const response = await contentService.getArticles({
      limit: 5,
      sortBy: 'viewCount',
      sortOrder: 'desc'
    })
    recommendedArticles.value = response.data
  } catch (error) {
    console.error('Failed to load recommended articles:', error)
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadArticles()
}

const handleCategoryChange = () => {
  currentPage.value = 1
  loadArticles()
}

const handlePageChange = () => {
  loadArticles()
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const toggleTag = (tag: string) => {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tag)
  }
  currentPage.value = 1
  loadArticles()
}

const clearFilters = () => {
  searchQuery.value = ''
  activeCategory.value = 'all'
  difficultyFilter.value = ''
  selectedTags.value = []
  currentPage.value = 1
  loadArticles()
}

const handleArticleClick = (article: Article) => {
  // 增加浏览量
  contentService.incrementViewCount('articles', article.id)
  
  // 追踪点击
  analytics.track('article_click', {
    articleId: article.id,
    title: article.title,
    category: article.category
  })
  
  // 跳转到文章详情
  router.push(`/knowledge/articles/${article.id}`)
}

// 监听筛选条件变化
watch([difficultyFilter, sortBy], () => {
  currentPage.value = 1
  loadArticles()
})

// 初始化
onMounted(() => {
  loadCategories()
  loadArticles()
  loadRecommendedArticles()
})
</script>

<style scoped>
.knowledge-view {
  min-height: 100vh;
  background: var(--bg-primary);
}

.knowledge-header {
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

.search-filter-section {
  max-width: 800px;
  margin: 0 auto;
}

.search-box {
  margin-bottom: 24px;
}

.filter-tabs {
  margin-bottom: 20px;
}

.filter-tabs :deep(.el-tabs__header) {
  margin: 0;
}

.filter-tabs :deep(.el-tabs__nav-wrap::after) {
  display: none;
}

.filter-tabs :deep(.el-tabs__item) {
  color: #6b7280;
  border-bottom: 2px solid transparent;
}

.filter-tabs :deep(.el-tabs__item.is-active) {
  color: #1a1a1a;
  border-bottom-color: #667eea;
}

.filter-controls {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.knowledge-content {
  padding: 48px 0;
}

.content-grid {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 48px;
}

.sidebar {
  position: sticky;
  top: 100px;
  height: fit-content;
}

.sidebar-section {
  background: white;
  border-radius: var(--radius-lg);
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: var(--shadow-sm);
}

.sidebar-section h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: var(--text-primary);
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  cursor: pointer;
  transition: all var(--transition-fast);
}

.tag-item:hover {
  transform: translateY(-1px);
}

.recommended-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.recommended-item {
  cursor: pointer;
  padding: 12px;
  border-radius: var(--radius-md);
  transition: background var(--transition-fast);
}

.recommended-item:hover {
  background: var(--bg-secondary);
}

.recommended-item h4 {
  font-size: 0.875rem;
  font-weight: 500;
  margin: 0 0 8px 0;
  color: var(--text-primary);
  line-height: 1.4;
}

.item-meta {
  display: flex;
  gap: 12px;
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.main-content {
  min-height: 600px;
}

.loading-state,
.empty-state {
  padding: 48px 0;
}

.articles-grid {
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
@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
    gap: 32px;
  }
  
  .sidebar {
    position: static;
    order: 2;
  }
  
  .main-content {
    order: 1;
  }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }
  
  .filter-controls {
    flex-direction: column;
  }
  
  .articles-grid {
    grid-template-columns: 1fr;
  }
  
  .knowledge-header {
    padding: 24px 0 32px;
  }
  
  .container {
    padding: 0 16px;
  }
}
</style>
