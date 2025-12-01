import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { analyticsService } from '@/services/analyticsService'
import { preloadRouteComponents } from '@/utils/lazyLoader'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue'),
    meta: {
      title: '小红书增长攻略生成器 - 专业的小红书运营工具',
      description: '一键生成专业的小红书账号增长攻略，提供数据分析、内容策略、运营建议等全方位服务',
      keywords: '小红书,增长攻略,运营工具,内容策略,数据分析'
    }
  },
  {
    path: '/platform',
    name: 'Platform',
    component: () => import('@/views/NewHomeView.vue'),
    meta: {
      title: '知识平台 - 小红书增长攻略',
      description: '小红书运营知识平台'
    }
  },
  {
    path: '/upload',
    redirect: '/'  // 老版本上传页面已废弃，重定向到首页
  },
  {
    path: '/analysis',
    name: 'Analysis',
    component: () => import('@/views/AnalysisView.vue')
  },
  {
    path: '/guide',
    name: 'Guide',
    component: () => import('@/views/GuideView.vue')
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/AboutView.vue')
  },
  {
    path: '/privacy',
    name: 'Privacy',
    component: () => import('@/views/PrivacyView.vue')
  },
  {
    path: '/terms',
    name: 'Terms',
    component: () => import('@/views/TermsView.vue'),
    meta: {
      title: '服务条款 - 小红书流量学院',
      description: '小红书流量学院服务条款和使用协议'
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue')
  },
  {
    path: '/pricing',
    name: 'Pricing',
    component: () => import('@/views/PricingView.vue')
  },
  {
    path: '/user-center',
    name: 'UserCenter',
    component: () => import('@/views/UserCenterView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/payment/return',
    name: 'PaymentReturn',
    component: () => import('@/views/PaymentReturnView.vue')
  },
  {
    path: '/share/:shareId',
    name: 'Share',
    component: () => import('@/views/ShareView.vue')
  },
  {
    path: '/secrets',
    name: 'Secrets',
    component: () => import('@/views/blog/BlogView.vue')
  },
  {
    path: '/secrets/:slug',
    name: 'SecretPost',
    component: () => import('@/views/blog/BlogPost.vue')
  },
  {
    path: '/knowledge',
    name: 'Knowledge',
    component: () => import('@/views/KnowledgeView.vue')
  },
  {
    path: '/knowledge/articles/:id',
    name: 'ArticleDetail',
    component: () => import('@/views/knowledge/ArticleDetailView.vue')
  },
  {
    path: '/cases',
    name: 'Cases',
    component: () => import('@/views/CasesView.vue')
  },
  {
    path: '/cases/:id',
    name: 'CaseDetail',
    component: () => import('@/views/cases/CaseDetailView.vue')
  },
  {
    path: '/intelligence',
    name: 'Intelligence',
    component: () => import('@/views/IntelligenceView.vue')
  },
  {
    path: '/intelligence/:id',
    name: 'IntelligenceDetail',
    component: () => import('@/views/intelligence/IntelligenceDetailView.vue')
  },
  {
    path: '/resources',
    name: 'Resources',
    component: () => import('@/views/ResourcesView.vue'),
    meta: {
      title: '资源库 - 模板、SOP和工具下载',
      description: '精选的小红书运营模板、SOP文档和工具资源'
    }
  },
  {
    path: '/resources/:id',
    name: 'ResourceDetail',
    component: () => import('@/views/resources/ResourceDetailView.vue')
  },
  {
    path: '/tools',
    name: 'Tools',
    component: () => import('@/views/ToolsView.vue')
  },
  {
    path: '/tools/title-generator',
    name: 'TitleGenerator',
    component: () => import('@/views/tools/TitleGeneratorView.vue')
  },
  {
    path: '/tools/viral-generator',
    name: 'ViralGenerator',
    component: () => import('@/views/tools/ViralGeneratorView.vue'),
    meta: {
      title: '爆款生成器 - 一站式生成爆款内容',
      description: '整合标题生成、封面文字建议和完整文案生成，一站式生成小红书爆款内容'
    }
  },
  {
    path: '/tools/topic-analyzer',
    name: 'TopicAnalyzer',
    component: () => import('@/views/tools/HotWordsInsightView.vue'),
    meta: {
      title: '热词洞察工具 - 发现热门概念和趋势词',
      description: '整合概念词典数据，发现热门概念和趋势词，为小红书内容提供选题灵感和关键词'
    }
  },
  {
    path: '/tools/topic-inspiration',
    name: 'TopicInspiration',
    component: () => import('@/views/tools/TopicInspirationView.vue'),
    meta: {
      title: '灵感话题库 - 发现第一次XX类选题灵感',
      description: '整合"人生第一次"数据，发现"第一次XX"类选题灵感，为小红书内容提供源源不断的创作素材'
    }
  },
  {
    path: '/tools/competitor-analyzer',
    name: 'CompetitorAnalyzer',
    component: () => import('@/views/tools/ToolPlaceholderView.vue')
  },
  {
    path: '/tools/image-editor',
    name: 'ImageEditor',
    component: () => import('@/views/tools/ToolPlaceholderView.vue')
  },
  {
    path: '/tools/background-remover',
    name: 'BackgroundRemover',
    component: () => import('@/views/tools/BackgroundRemoverView.vue'),
    meta: {
      title: '图片背景移除工具 - 一键抠图',
      description: '适用于纯色/近似纯色背景的图片，自动采样背景色，支持阈值微调，浏览器本地处理，保护隐私'
    }
  },
  {
    path: '/tools/manga-generator',
    name: 'MangaGenerator',
    component: () => import('@/views/tools/MangaGeneratorView.vue'),
    meta: {
      title: '漫画风生成器 - 一键生成漫画效果',
      description: '上传图片，一键生成漫画风效果：边缘描线、阈值、色调分级、网点（Halftone），并导出成图'
    }
  },
  {
    path: '/tools/keyword-tool',
    name: 'KeywordTool',
    component: () => import('@/views/tools/ToolPlaceholderView.vue')
  },
  {
    path: '/tools/scheduler',
    name: 'Scheduler',
    component: () => import('@/views/tools/ToolPlaceholderView.vue')
  },
  {
    path: '/community',
    name: 'Community',
    component: () => import('@/views/CommunityView.vue'),
    meta: {
      title: '社区问答 - 小红书运营交流',
      description: '与其他小红书运营者交流经验，分享心得，解决问题'
    }
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/NotFoundView.vue'),
    meta: {
      title: '页面未找到 - 404'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫：检查登录状态、设置页面标题、追踪页面浏览
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  // 检查登录状态
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
    return
  }
  
  // 设置页面标题
  if (to.meta.title) {
    document.title = to.meta.title as string
  }
  
  // 设置 meta 描述
  if (to.meta.description) {
    let metaDescription = document.querySelector('meta[name="description"]')
    if (!metaDescription) {
      metaDescription = document.createElement('meta')
      metaDescription.setAttribute('name', 'description')
      document.head.appendChild(metaDescription)
    }
    metaDescription.setAttribute('content', to.meta.description as string)
  }
  
  // 设置 meta 关键词
  if (to.meta.keywords) {
    let metaKeywords = document.querySelector('meta[name="keywords"]')
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta')
      metaKeywords.setAttribute('name', 'keywords')
      document.head.appendChild(metaKeywords)
    }
    metaKeywords.setAttribute('content', to.meta.keywords as string)
  }
  
  next()
})

// 路由后置守卫：追踪页面浏览
router.afterEach((to) => {
  // 追踪页面浏览
  analyticsService.trackPageView(to.path, to.meta.title as string || document.title)
  
  // 滚动到顶部
  window.scrollTo(0, 0)
  
  // 预加载相关路由组件
  if (to.name) {
    preloadRouteComponents(to.name as string)
  }
})

export default router
