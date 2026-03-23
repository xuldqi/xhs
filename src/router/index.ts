import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { analyticsService } from '@/services/analyticsService'
import { preloadRouteComponents } from '@/utils/lazyLoader'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Platform',
    component: () => import('@/views/NewHomeView.vue'),
    meta: {
      title: '小红书增长专家 - 一站式运营平台',
      description: '从数据分析到内容策略，从工具矩阵到社区交流，助力你的小红书账号快速增长',
      keywords: '小红书,运营,增长,工具,平台,知识库,案例'
    }
  },
  {
    path: '/platform',
    redirect: '/'
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
  // Resources feature - to be implemented
  // {
  //   path: '/resources',
  //   name: 'Resources',
  //   component: () => import('@/views/ResourcesView.vue')
  // },
  // {
  //   path: '/resources/:id',
  //   name: 'ResourceDetail',
  //   component: () => import('@/views/resources/ResourceDetailView.vue')
  // },
  {
    path: '/calendar',
    name: 'Calendar',
    component: () => import('@/views/CalendarView.vue'),
    meta: {
      title: 'AI 内容日历 - 小红书运营',
      description: 'AI 生成 30 天内容日历，规划你的小红书发帖'
    }
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
    meta: { title: '爆款生成器 - 一站式生成标题、封面与文案' }
  },
  {
    path: '/tools/hot-words-insight',
    name: 'HotWordsInsight',
    component: () => import('@/views/tools/HotWordsInsightView.vue'),
    meta: { title: '热词洞察工具 - 热点选题与趋势词' }
  },
  {
    path: '/tools/topic-inspiration',
    name: 'TopicInspiration',
    component: () => import('@/views/tools/TopicInspirationView.vue'),
    meta: { title: '灵感话题库 - 高转化小红书选题' }
  },
  {
    path: '/tools/background-remover',
    name: 'BackgroundRemover',
    component: () => import('@/views/tools/BackgroundRemoverView.vue'),
    meta: { title: '图片背景移除工具 - 本地去背景' }
  },
  {
    path: '/tools/manga-generator',
    name: 'MangaGenerator',
    component: () => import('@/views/tools/MangaGeneratorView.vue'),
    meta: { title: '漫画风生成器 - 图片风格化处理' }
  },
  {
    path: '/tools/multi-platform-content',
    name: 'MultiPlatformContent',
    component: () => import('@/views/tools/MultiPlatformContentView.vue'),
    meta: {
      title: 'AI 多平台内容生成器 - 一键生成小红书 / Twitter / LinkedIn / 博客内容',
      description: '输入一个主题，自动生成多平台内容、SEO 关键词、图片提示词和短视频开场。'
    }
  },
  {
    path: '/tools/content-automation-history',
    name: 'ContentAutomationHistory',
    component: () => import('@/views/tools/AutomationHistoryView.vue'),
    meta: {
      title: '内容工厂执行历史 - 自动化任务回放',
      description: '查看内容工厂任务执行历史、回写结果、错误信息与产物链接。'
    }
  },
  {
    path: '/tools/topic-analyzer',
    name: 'TopicAnalyzer',
    component: () => import('@/views/tools/TopicAnalyzerView.vue'),
    meta: { title: '话题分析工具 - AI 分析热门趋势' }
  },
  {
    path: '/tools/competitor-analyzer',
    name: 'CompetitorAnalyzer',
    component: () => import('@/views/tools/CompetitorAnalyzerView.vue'),
    meta: { title: '竞品分析工具 - AI 深度分析竞品' }
  },
  {
    path: '/tools/image-editor',
    redirect: '/tools'
  },
  {
    path: '/tools/keyword-tool',
    name: 'KeywordTool',
    component: () => import('@/views/tools/KeywordToolView.vue'),
    meta: { title: 'SEO 关键词工具 - AI 挖掘热门关键词' }
  },
  {
    path: '/tools/scheduler',
    name: 'Scheduler',
    component: () => import('@/views/tools/SchedulerView.vue'),
    meta: { title: '定时发布计划 - 规划发帖时间' }
  },
  {
    path: '/tools/matrix-publisher',
    name: 'MatrixPublisher',
    component: () => import('@/views/tools/MatrixPublisherView.vue'),
    meta: {
      title: '矩阵发布台 - 多账号内容分发编排',
      description: '一个主题生成多份差异化小红书稿件，按账号人设、图片风格和时间窗编排发布队列。'
    }
  },
  {
    path: '/tools/matrix-review',
    name: 'MatrixReview',
    component: () => import('@/views/tools/MatrixReviewView.vue'),
    meta: {
      title: '矩阵审核台 - 待审任务与派发决策',
      description: '集中审核需要人工把关的矩阵任务，支持通过并保留定时或驳回重写。'
    }
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
    path: '/community/questions/:id',
    name: 'CommunityQuestionDetail',
    component: () => import('@/views/community/CommunityQuestionDetailView.vue'),
    meta: {
      title: '问题详情 - 社区问答',
      description: '查看问题与回答'
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
