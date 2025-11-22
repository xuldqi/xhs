<template>
  <div class="blog-view">
    <Breadcrumb />
    <div class="blog-header">
      <div class="header-badge">
        <el-tag type="danger" size="large">VIP专享</el-tag>
      </div>
      <h1>💎 涨粉秘籍</h1>
      <p>实战经验、独家技巧、深度解析，助你快速涨粉变现</p>
      <div class="header-tip" v-if="!userStore.isVIP">
        <el-icon><InfoFilled /></el-icon>
        <span>免费用户可阅读50%内容，开通会员解锁完整秘籍</span>
      </div>
    </div>

    <div class="blog-container">
      <div class="blog-list">
        <article
          v-for="post in blogPosts"
          :key="post.slug"
          class="blog-card"
          @click="goToPost(post.slug)"
        >
          <div class="blog-category">{{ post.category }}</div>
          <h2 class="blog-title">{{ post.title }}</h2>
          <p class="blog-excerpt">{{ post.excerpt }}</p>
          <div class="blog-meta">
            <span class="blog-date">{{ post.date }}</span>
            <span class="blog-read-time">{{ post.readTime }}分钟阅读</span>
          </div>
          <div class="blog-tags">
            <span v-for="tag in post.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
        </article>
      </div>

      <aside class="blog-sidebar">
        <div class="sidebar-card">
          <h3>热门文章</h3>
          <ul class="popular-list">
            <li v-for="post in popularPosts" :key="post.slug" @click="goToPost(post.slug)">
              {{ post.title }}
            </li>
          </ul>
        </div>

        <div class="sidebar-card">
          <h3>文章分类</h3>
          <ul class="category-list">
            <li v-for="cat in categories" :key="cat.name" @click="filterByCategory(cat.name)">
              {{ cat.name }} ({{ cat.count }})
            </li>
          </ul>
        </div>

        <div class="sidebar-card cta-card">
          <h3>🚀 免费生成涨粉指南</h3>
          <p>上传截图，5分钟获取专属方案</p>
          <el-button type="primary" @click="goToHome">立即开始</el-button>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { InfoFilled } from '@element-plus/icons-vue'
import Breadcrumb from '@/components/Breadcrumb.vue'

const router = useRouter()
const userStore = useUserStore()

interface BlogPost {
  slug: string
  title: string
  excerpt: string
  category: string
  date: string
  readTime: number
  tags: string[]
}

const blogPosts = ref<BlogPost[]>([
  {
    slug: 'xiaohongshu-account-cold-start-guide',
    title: '小红书账号冷启动完全指南 - 3天激活账号进入推荐池',
    excerpt: '详解小红书新账号冷启动的完整流程，包括大字报测试、账号类型选择、对标分析、极致细节观察等实战方法。',
    category: '新手入门',
    date: '2024-01-22',
    readTime: 12,
    tags: ['账号冷启动', '新手指南', '对标分析', '细节运营']
  },
  {
    slug: 'xiaohongshu-growth-strategy-from-zero',
    title: '小红书推荐算法很玄学？我用这套打法从0到2万粉',
    excerpt: '实战总结：跨领域通用的小红书涨粉打法，包括账号权重、内容调性、选题策略、内容结构设计等核心经验。',
    category: '涨粉策略',
    date: '2024-01-21',
    readTime: 15,
    tags: ['涨粉技巧', '实战经验', '内容策略', '账号运营']
  },
  {
    slug: 'xiaohongshu-beginner-guide-2024',
    title: '小红书新手完全指南2024 - 从0开始的涨粉之路',
    excerpt: '最全面的小红书新手教程，包含账号注册、定位、内容创作、涨粉技巧等完整流程。适合0基础新手，手把手教你起号。',
    category: '新手入门',
    date: '2024-01-20',
    readTime: 15,
    tags: ['新手教程', '起号指南', '账号定位']
  },
  {
    slug: 'xiaohongshu-algorithm-2024',
    title: '小红书算法解析2024 - 流量分发机制深度剖析',
    excerpt: '深度解析小红书最新算法机制，包括流量池分层、推荐逻辑、权重因素等核心内容，帮你掌握流量密码。',
    category: '算法解析',
    date: '2024-01-19',
    readTime: 12,
    tags: ['算法机制', '流量获取', '推荐逻辑']
  },
  {
    slug: '100-viral-title-templates',
    title: '100个爆款标题模板 - 直接套用的标题公式',
    excerpt: '精选100个经过验证的爆款标题模板，涵盖美妆、穿搭、美食、旅行等各类目，拿来即用，提升点击率。',
    category: '内容创作',
    date: '2024-01-18',
    readTime: 10,
    tags: ['标题技巧', '爆款公式', '文案模板']
  },
  {
    slug: 'cover-design-golden-rules',
    title: '封面设计黄金法则 - 3秒抓住用户眼球',
    excerpt: '封面是笔记的第一印象。本文详解封面设计的7大黄金法则，包括配色、构图、文字排版等实用技巧。',
    category: '内容创作',
    date: '2024-01-17',
    readTime: 8,
    tags: ['封面设计', '视觉优化', '点击率']
  },
  {
    slug: '0-to-1000-fans-complete-guide',
    title: '0到1000粉丝完整路径 - 60天涨粉实战方案',
    excerpt: '从0粉丝到1000粉丝的完整实战方案，包含每周计划、内容策略、数据复盘等详细步骤，已帮助500+博主成功起号。',
    category: '涨粉策略',
    date: '2024-01-16',
    readTime: 20,
    tags: ['涨粉路径', '实战方案', '起号计划']
  }
])

const popularPosts = ref([
  { slug: '0-to-1000-fans-complete-guide', title: '0到1000粉丝完整路径' },
  { slug: '100-viral-title-templates', title: '100个爆款标题模板' },
  { slug: 'xiaohongshu-algorithm-2024', title: '小红书算法解析2024' }
])

const categories = ref([
  { name: '新手入门', count: 8 },
  { name: '算法解析', count: 5 },
  { name: '内容创作', count: 12 },
  { name: '涨粉策略', count: 10 },
  { name: '数据分析', count: 6 },
  { name: '变现指南', count: 7 }
])

const goToPost = (slug: string) => {
  router.push(`/secrets/${slug}`)
}

const filterByCategory = (category: string) => {
  // TODO: 实现分类筛选
  console.log('Filter by:', category)
}

const goToHome = () => {
  router.push('/')
}
</script>

<style scoped>
.blog-view {
  min-height: 100vh;
  background: #f9fafb;
  padding: 40px 20px;
}

.blog-header {
  text-align: center;
  max-width: 800px;
  margin: 0 auto 60px;
}

.header-badge {
  margin-bottom: 16px;
}

.blog-header h1 {
  font-size: 2.5rem;
  color: #1f2937;
  margin-bottom: 16px;
  font-weight: 700;
}

.blog-header p {
  font-size: 1.125rem;
  color: #6b7280;
  margin-bottom: 20px;
}

.header-tip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 8px;
  color: #856404;
  font-size: 14px;
}

.blog-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 40px;
}

.blog-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.blog-card {
  background: white;
  border-radius: 16px;
  padding: 32px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.blog-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
  border-color: #409EFF;
}

.blog-category {
  display: inline-block;
  padding: 4px 12px;
  background: #e0f2fe;
  color: #0369a1;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 16px;
}

.blog-title {
  font-size: 1.5rem;
  color: #1f2937;
  margin: 0 0 12px 0;
  font-weight: 600;
  line-height: 1.4;
}

.blog-excerpt {
  font-size: 1rem;
  color: #6b7280;
  line-height: 1.6;
  margin: 0 0 16px 0;
}

.blog-meta {
  display: flex;
  gap: 16px;
  font-size: 0.875rem;
  color: #9ca3af;
  margin-bottom: 12px;
}

.blog-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  padding: 4px 10px;
  background: #f3f4f6;
  color: #6b7280;
  border-radius: 4px;
  font-size: 0.8125rem;
}

.blog-sidebar {
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

.popular-list,
.category-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.popular-list li,
.category-list li {
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  color: #4b5563;
  transition: color 0.2s;
}

.popular-list li:hover,
.category-list li:hover {
  color: #409EFF;
}

.popular-list li:last-child,
.category-list li:last-child {
  border-bottom: none;
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
}

@media (max-width: 968px) {
  .blog-container {
    grid-template-columns: 1fr;
  }

  .blog-sidebar {
    order: -1;
  }

  .blog-header h1 {
    font-size: 2rem;
  }
}

@media (max-width: 640px) {
  .blog-card {
    padding: 24px;
  }

  .blog-title {
    font-size: 1.25rem;
  }
}
</style>
