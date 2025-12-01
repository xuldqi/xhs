<template>
  <div class="article-detail-view">
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>
    
    <div v-else-if="article" class="article-container">
      <!-- 面包屑导航 -->
      <div class="breadcrumb-section">
        <div class="container">
          <Breadcrumb :items="breadcrumbItems" />
        </div>
      </div>

      <!-- 文章头部 -->
      <header class="article-header">
        <div class="container">
          <div class="header-tags">
            <el-tag type="info">{{ getCategoryName(article.category) }}</el-tag>
            <el-tag :type="getDifficultyType(article.difficulty)">
              {{ getDifficultyText(article.difficulty) }}
            </el-tag>
            <el-tag v-if="article.featured" type="warning">
              <el-icon><Star /></el-icon>
              精选
            </el-tag>
          </div>
          
          <h1 class="article-title">{{ article.title }}</h1>
          
          <p v-if="article.description" class="article-description">
            {{ article.description }}
          </p>
          
          <div class="article-meta">
            <span class="meta-item">
              <el-icon><User /></el-icon>
              {{ article.author }}
            </span>
            <span class="meta-item">
              <el-icon><Clock /></el-icon>
              {{ article.readingTime }}分钟阅读
            </span>
            <span class="meta-item">
              <el-icon><Calendar /></el-icon>
              {{ formatDate(article.publishedAt) }}
            </span>
            <span class="meta-item">
              <el-icon><View /></el-icon>
              {{ article.viewCount }}次浏览
            </span>
          </div>
        </div>
      </header>

      <!-- 封面图片 -->
      <div v-if="article.coverImage" class="article-cover">
        <div class="container">
          <LazyImage
            :src="article.coverImage"
            :alt="article.title"
            aspect-ratio="21/9"
          />
        </div>
      </div>

      <!-- 文章内容 -->
      <div class="article-body">
        <div class="container">
          <div class="content-grid">
            <!-- 主内容 -->
            <article class="main-article">
              <div class="article-content" v-html="renderedContent"></div>
              
              <!-- 文章标签 -->
              <div class="article-tags-section">
                <h3>相关标签</h3>
                <div class="tags-list">
                  <el-tag
                    v-for="tag in article.tags"
                    :key="tag"
                    size="large"
                    type="info"
                    effect="plain"
                  >
                    {{ tag }}
                  </el-tag>
                </div>
              </div>
              
              <!-- 互动按钮 -->
              <div class="article-actions">
                <el-button
                  :type="isLiked ? 'primary' : 'default'"
                  :icon="Star"
                  @click="handleLike"
                >
                  {{ isLiked ? '已点赞' : '点赞' }} ({{ likeCount }})
                </el-button>
                <el-button :icon="Share" @click="handleShare">
                  分享
                </el-button>
              </div>
            </article>

            <!-- 侧边栏 -->
            <aside class="article-sidebar">
              <!-- 目录 -->
              <div v-if="tableOfContents.length > 0" class="sidebar-section toc-section">
                <h3>目录</h3>
                <nav class="table-of-contents">
                  <a
                    v-for="item in tableOfContents"
                    :key="item.id"
                    :href="`#${item.id}`"
                    :class="['toc-item', `toc-level-${item.level}`]"
                    @click.prevent="scrollToHeading(item.id)"
                  >
                    {{ item.text }}
                  </a>
                </nav>
              </div>
              
              <!-- 相关文章 -->
              <div v-if="relatedArticles.length > 0" class="sidebar-section">
                <h3>相关文章</h3>
                <div class="related-articles">
                  <div
                    v-for="related in relatedArticles"
                    :key="related.id"
                    class="related-item"
                    @click="navigateToArticle(related.id)"
                  >
                    <h4>{{ related.title }}</h4>
                    <div class="related-meta">
                      <span>{{ related.readingTime }}分钟</span>
                      <span>{{ related.viewCount }}浏览</span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="error-state">
      <el-empty description="文章不存在">
        <el-button type="primary" @click="$router.push('/knowledge')">
          返回知识库
        </el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Star, Share, User, Clock, Calendar, View } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { marked } from 'marked'
import { contentService } from '@/services/contentService'
import { analytics } from '@/utils/analytics'
import type { Article } from '@/types/content'
import Breadcrumb from '@/components/Breadcrumb.vue'
import LazyImage from '@/components/LazyImage.vue'

const route = useRoute()
const router = useRouter()

// 响应式数据
const loading = ref(true)
const article = ref<Article | null>(null)
const relatedArticles = ref<Article[]>([])
const isLiked = ref(false)
const likeCount = ref(0)
const tableOfContents = ref<Array<{ id: string; text: string; level: number }>>([])

// 计算属性
const breadcrumbItems = computed(() => {
  const items = [
    { label: '首页', path: '/' },
    { label: '知识库', path: '/knowledge' }
  ]
  
  if (article.value) {
    items.push({ label: article.value.title, path: '' })
  }
  
  return items
})

const renderedContent = computed(() => {
  if (!article.value) return ''
  return marked(article.value.content)
})

// 方法
const getCategoryName = (category: string) => {
  const map: Record<string, string> = {
    beginner: '新手入门',
    content: '内容创作',
    traffic: '流量获取',
    data: '数据分析',
    monetization: '变现指南',
    'platform-updates': '平台动态',
    'tools-templates': '工具模板'
  }
  return map[category] || category
}

const getDifficultyText = (difficulty: string) => {
  const map: Record<string, string> = {
    beginner: '新手',
    intermediate: '进阶',
    advanced: '高级'
  }
  return map[difficulty] || difficulty
}

const getDifficultyType = (difficulty: string) => {
  const map: Record<string, any> = {
    beginner: 'success',
    intermediate: 'warning',
    advanced: 'danger'
  }
  return map[difficulty] || 'info'
}

const formatDate = (dateString?: string) => {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const loadArticle = async () => {
  loading.value = true
  
  try {
    const articleId = route.params.id as string
    article.value = await contentService.getContentById<Article>('articles', articleId)
    likeCount.value = article.value.likeCount
    
    // 生成目录
    generateTableOfContents()
    
    // 加载相关文章
    loadRelatedArticles()
    
    // 追踪文章浏览
    analytics.track('article_view', {
      articleId: article.value.id,
      title: article.value.title,
      category: article.value.category
    })
  } catch (error) {
    console.error('Failed to load article:', error)
    ElMessage.error('加载文章失败')
  } finally {
    loading.value = false
  }
}

const generateTableOfContents = () => {
  if (!article.value) return
  
  const content = article.value.content
  const headingRegex = /^(#{1,3})\s+(.+)$/gm
  const toc: Array<{ id: string; text: string; level: number }> = []
  
  let match
  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length
    const text = match[2].trim()
    const id = text.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    
    toc.push({ id, text, level })
  }
  
  tableOfContents.value = toc
}

const loadRelatedArticles = async () => {
  if (!article.value) return
  
  try {
    relatedArticles.value = await contentService.getRelatedContent<Article>(
      article.value.id,
      'articles',
      5
    )
  } catch (error) {
    console.error('Failed to load related articles:', error)
  }
}

const handleLike = async () => {
  if (!article.value) return
  
  try {
    const result = await contentService.toggleLike('articles', article.value.id)
    isLiked.value = result.liked
    likeCount.value = result.count
    
    analytics.track('article_like', {
      articleId: article.value.id,
      liked: result.liked
    })
    
    ElMessage.success(result.liked ? '点赞成功' : '取消点赞')
  } catch (error) {
    console.error('Failed to toggle like:', error)
    ElMessage.error('操作失败')
  }
}

const handleShare = () => {
  if (!article.value) return
  
  const url = window.location.href
  
  if (navigator.share) {
    navigator.share({
      title: article.value.title,
      text: article.value.description,
      url
    }).then(() => {
      analytics.track('article_share', {
        articleId: article.value!.id,
        method: 'native'
      })
    }).catch(err => {
      console.error('Share failed:', err)
    })
  } else {
    // 复制链接到剪贴板
    navigator.clipboard.writeText(url).then(() => {
      ElMessage.success('链接已复制到剪贴板')
      analytics.track('article_share', {
        articleId: article.value!.id,
        method: 'clipboard'
      })
    }).catch(err => {
      console.error('Copy failed:', err)
      ElMessage.error('复制失败')
    })
  }
}

const scrollToHeading = (id: string) => {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const navigateToArticle = (id: string) => {
  router.push(`/knowledge/articles/${id}`)
  // 重新加载文章
  loadArticle()
}

// 初始化
onMounted(() => {
  loadArticle()
})
</script>

<style scoped>
.article-detail-view {
  min-height: 100vh;
  background: var(--bg-primary);
}

.loading-container {
  max-width: var(--container-lg);
  margin: 0 auto;
  padding: 48px 20px;
}

.container {
  max-width: var(--container-xl);
  margin: 0 auto;
  padding: 0 20px;
}

.breadcrumb-section {
  padding: 24px 0;
  background: white;
  border-bottom: 1px solid var(--border-color);
}

.article-header {
  background: white;
  padding: 48px 0;
  text-align: center;
}

.header-tags {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-bottom: 24px;
}

.article-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 16px 0;
  line-height: 1.3;
}

.article-description {
  font-size: 1.125rem;
  color: var(--text-secondary);
  max-width: 800px;
  margin: 0 auto 32px;
  line-height: 1.6;
}

.article-meta {
  display: flex;
  gap: 24px;
  justify-content: center;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
  color: var(--text-tertiary);
}

.article-cover {
  background: white;
  padding: 0 0 48px;
}

.article-body {
  padding: 48px 0;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 48px;
}

.main-article {
  background: white;
  border-radius: var(--radius-lg);
  padding: 48px;
  box-shadow: var(--shadow-sm);
}

.article-content {
  font-size: 1.0625rem;
  line-height: 1.8;
  color: var(--text-primary);
}

.article-content :deep(h1),
.article-content :deep(h2),
.article-content :deep(h3) {
  margin: 32px 0 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.article-content :deep(h1) {
  font-size: 2rem;
}

.article-content :deep(h2) {
  font-size: 1.5rem;
}

.article-content :deep(h3) {
  font-size: 1.25rem;
}

.article-content :deep(p) {
  margin: 16px 0;
}

.article-content :deep(ul),
.article-content :deep(ol) {
  margin: 16px 0;
  padding-left: 24px;
}

.article-content :deep(li) {
  margin: 8px 0;
}

.article-content :deep(code) {
  background: var(--bg-secondary);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
}

.article-content :deep(pre) {
  background: var(--bg-secondary);
  padding: 16px;
  border-radius: var(--radius-md);
  overflow-x: auto;
  margin: 16px 0;
}

.article-tags-section {
  margin-top: 48px;
  padding-top: 32px;
  border-top: 1px solid var(--border-color);
}

.article-tags-section h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 16px 0;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.article-actions {
  margin-top: 32px;
  display: flex;
  gap: 16px;
  justify-content: center;
}

.article-sidebar {
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

.table-of-contents {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.toc-item {
  color: var(--text-secondary);
  text-decoration: none;
  padding: 6px 0;
  transition: color var(--transition-fast);
  font-size: 0.875rem;
  line-height: 1.4;
}

.toc-item:hover {
  color: var(--primary-color);
}

.toc-level-2 {
  padding-left: 16px;
}

.toc-level-3 {
  padding-left: 32px;
}

.related-articles {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.related-item {
  cursor: pointer;
  padding: 12px;
  border-radius: var(--radius-md);
  transition: background var(--transition-fast);
}

.related-item:hover {
  background: var(--bg-secondary);
}

.related-item h4 {
  font-size: 0.875rem;
  font-weight: 500;
  margin: 0 0 8px 0;
  color: var(--text-primary);
  line-height: 1.4;
}

.related-meta {
  display: flex;
  gap: 12px;
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.error-state {
  padding: 100px 20px;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
  
  .article-sidebar {
    position: static;
  }
  
  .toc-section {
    display: none;
  }
}

@media (max-width: 768px) {
  .article-title {
    font-size: 1.75rem;
  }
  
  .main-article {
    padding: 24px;
  }
  
  .article-content {
    font-size: 1rem;
  }
  
  .article-meta {
    gap: 16px;
  }
}
</style>
