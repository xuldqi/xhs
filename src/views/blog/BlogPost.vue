<template>
  <div class="blog-post-view">
    <div class="blog-post-container">
      <!-- 面包屑导航 -->
      <nav class="breadcrumb">
        <router-link to="/">首页</router-link>
        <span class="separator">/</span>
        <router-link to="/secrets">涨粉秘籍</router-link>
        <span class="separator">/</span>
        <span class="current">{{ post?.title }}</span>
      </nav>

      <!-- 文章头部 -->
      <header class="post-header">
        <div class="post-category">{{ post?.category }}</div>
        <h1 class="post-title">{{ post?.title }}</h1>
        <div class="post-meta">
          <span class="meta-item">
            <i class="icon">📅</i>
            {{ post?.date }}
          </span>
          <span class="meta-item">
            <i class="icon">⏱️</i>
            {{ post?.readTime }}分钟阅读
          </span>
          <span class="meta-item">
            <i class="icon">👁️</i>
            {{ post?.views }} 阅读
          </span>
        </div>
      </header>

      <!-- 文章内容 -->
      <article class="post-content">
        <div v-html="displayContent"></div>
        
        <!-- 付费墙 -->
        <PaywallOverlay v-if="showPaywall" />
      </article>

      <!-- CTA区域 -->
      <div class="post-cta">
        <div class="cta-content">
          <h3>🚀 准备好开始你的涨粉之旅了吗？</h3>
          <p>使用我们的AI涨粉指南生成器，5分钟获取专属方案</p>
          <el-button type="primary" size="large" @click="goToHome">
            立即免费生成指南
          </el-button>
        </div>
      </div>

      <!-- 相关文章 -->
      <section class="related-posts">
        <h2>相关阅读</h2>
        <div class="related-grid">
          <div
            v-for="related in relatedPosts"
            :key="related.slug"
            class="related-card"
            @click="goToPost(related.slug)"
          >
            <div class="related-category">{{ related.category }}</div>
            <h3>{{ related.title }}</h3>
            <p>{{ related.excerpt }}</p>
          </div>
        </div>
      </section>
    </div>

    <!-- 侧边栏 -->
    <aside class="post-sidebar">
      <div class="sidebar-card toc-card">
        <h3>目录</h3>
        <ul class="toc-list">
          <li v-for="heading in tableOfContents" :key="heading.id">
            <a :href="`#${heading.id}`">{{ heading.text }}</a>
          </li>
        </ul>
      </div>

      <div class="sidebar-card cta-card">
        <h3>💡 快速生成指南</h3>
        <p>上传截图，AI帮你分析</p>
        <el-button type="primary" @click="goToHome">开始使用</el-button>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { blogContent } from '@/content/blogContent'
import { useUserStore } from '@/stores/userStore'
import PaywallOverlay from '@/components/PaywallOverlay.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

interface BlogPost {
  slug: string
  title: string
  excerpt: string
  content: string
  category: string
  date: string
  readTime: number
  views: number
  tags: string[]
}

const slug = computed(() => route.params.slug as string)
const post = ref<BlogPost | null>(null)
const tableOfContents = ref<Array<{ id: string; text: string }>>([])
const relatedPosts = ref<BlogPost[]>([])

// 判断是否显示付费墙
const showPaywall = computed(() => {
  // 如果用户是月度会员或以上，不显示付费墙
  if (userStore.isVIP) {
    return false
  }
  return true
})

// 显示的内容（免费用户只显示50%）
const displayContent = computed(() => {
  if (!post.value?.content) return ''
  
  // VIP用户显示全部内容
  if (userStore.isVIP) {
    return post.value.content
  }
  
  // 免费用户只显示50%
  const content = post.value.content
  const paragraphs = content.split('</p>')
  const halfLength = Math.floor(paragraphs.length * 0.5)
  const freeContent = paragraphs.slice(0, halfLength).join('</p>')
  
  return freeContent + '</p>'
})

onMounted(() => {
  loadPost()
  generateTableOfContents()
  loadRelatedPosts()
})

const loadPost = () => {
  post.value = blogContent[slug.value] || null
  if (!post.value) {
    router.push('/blog')
  }
}

const generateTableOfContents = () => {
  // 从内容中提取标题生成目录
  if (post.value?.content) {
    const headings = post.value.content.match(/<h2[^>]*>(.*?)<\/h2>/g) || []
    tableOfContents.value = headings.map((h, index) => {
      const text = h.replace(/<[^>]*>/g, '')
      return {
        id: `heading-${index}`,
        text
      }
    })
  }
}

const loadRelatedPosts = () => {
  // 加载相关文章（同类别的其他文章）
  const allPosts = Object.values(blogContent)
  relatedPosts.value = allPosts
    .filter(p => p.category === post.value?.category && p.slug !== slug.value)
    .slice(0, 3)
}

const goToPost = (postSlug: string) => {
  router.push(`/blog/${postSlug}`)
  window.scrollTo(0, 0)
}

const goToHome = () => {
  router.push('/')
}
</script>

<style scoped>
.blog-post-view {
  min-height: 100vh;
  background: #f9fafb;
  padding: 40px 20px;
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 40px;
  max-width: 1400px;
  margin: 0 auto;
}

.blog-post-container {
  max-width: 800px;
}

.breadcrumb {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 32px;
}

.breadcrumb a {
  color: #FF2442;
  text-decoration: none;
}

.breadcrumb a:hover {
  text-decoration: underline;
}

.separator {
  margin: 0 8px;
}

.current {
  color: #1f2937;
}

.post-header {
  margin-bottom: 48px;
}

.post-category {
  display: inline-block;
  padding: 6px 16px;
  background: #e0f2fe;
  color: #0369a1;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 16px;
}

.post-title {
  font-size: 2.5rem;
  color: #1f2937;
  margin: 0 0 24px 0;
  font-weight: 700;
  line-height: 1.2;
}

.post-meta {
  display: flex;
  gap: 24px;
  font-size: 0.9375rem;
  color: #6b7280;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.post-content {
  background: white;
  border-radius: 16px;
  padding: 48px;
  margin-bottom: 48px;
  line-height: 1.8;
  font-size: 1.0625rem;
  color: #374151;
}

.post-content :deep(h2) {
  font-size: 1.875rem;
  color: #1f2937;
  margin: 48px 0 24px 0;
  font-weight: 600;
  padding-bottom: 12px;
  border-bottom: 2px solid #e5e7eb;
}

.post-content :deep(h3) {
  font-size: 1.5rem;
  color: #1f2937;
  margin: 36px 0 16px 0;
  font-weight: 600;
}

.post-content :deep(p) {
  margin: 16px 0;
}

.post-content :deep(ul),
.post-content :deep(ol) {
  margin: 16px 0;
  padding-left: 28px;
}

.post-content :deep(li) {
  margin: 8px 0;
}

.post-content :deep(strong) {
  color: #1f2937;
  font-weight: 600;
}

.post-content :deep(code) {
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.9em;
}

.post-content :deep(blockquote) {
  border-left: 4px solid #FF2442;
  padding-left: 20px;
  margin: 24px 0;
  color: #6b7280;
  font-style: italic;
}

.post-cta {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 48px;
  text-align: center;
  color: white;
  margin-bottom: 48px;
}

.cta-content h3 {
  font-size: 1.75rem;
  margin: 0 0 16px 0;
}

.cta-content p {
  font-size: 1.125rem;
  margin: 0 0 24px 0;
  opacity: 0.95;
}

.related-posts {
  background: white;
  border-radius: 16px;
  padding: 48px;
}

.related-posts h2 {
  font-size: 1.75rem;
  color: #1f2937;
  margin: 0 0 32px 0;
  font-weight: 600;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}

.related-card {
  padding: 24px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.related-card:hover {
  border-color: #FF2442;
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.related-category {
  font-size: 0.8125rem;
  color: #0369a1;
  font-weight: 500;
  margin-bottom: 8px;
}

.related-card h3 {
  font-size: 1.125rem;
  color: #1f2937;
  margin: 0 0 8px 0;
  font-weight: 600;
}

.related-card p {
  font-size: 0.9375rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

.post-sidebar {
  position: sticky;
  top: 40px;
  height: fit-content;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.sidebar-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
}

.sidebar-card h3 {
  font-size: 1.125rem;
  color: #1f2937;
  margin: 0 0 16px 0;
  font-weight: 600;
}

.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.toc-list li {
  margin: 8px 0;
}

.toc-list a {
  color: #6b7280;
  text-decoration: none;
  font-size: 0.9375rem;
  transition: color 0.2s;
}

.toc-list a:hover {
  color: #FF2442;
}

.cta-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
}

.cta-card h3 {
  color: white;
}

.cta-card p {
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 16px;
  font-size: 0.9375rem;
}

@media (max-width: 1024px) {
  .blog-post-view {
    grid-template-columns: 1fr;
  }

  .post-sidebar {
    position: static;
  }

  .post-title {
    font-size: 2rem;
  }

  .post-content {
    padding: 32px;
  }
}

@media (max-width: 640px) {
  .post-title {
    font-size: 1.75rem;
  }

  .post-content {
    padding: 24px;
  }

  .post-cta {
    padding: 32px 24px;
  }

  .related-posts {
    padding: 32px 24px;
  }
}
</style>
