/**
 * 工具箱列表数据（统一数据源，供 ToolsView 与首页等使用）
 */
export interface ToolItem {
  id: string
  name: string
  description: string
  category: string
  url: string
  isFree: boolean
  isRecommended: boolean
  rating: number
  features: string[]
  viewCount: number
  likeCount: number
  tags: string[]
}

export const toolsList: ToolItem[] = [
  {
    id: 'calendar',
    name: 'AI 内容日历',
    description: 'AI 生成 7 天或 30 天内容规划，包含标题、大纲、标签、建议发布时间',
    category: 'content-creation',
    url: '/calendar',
    isFree: true,
    isRecommended: true,
    rating: 4.9,
    features: ['30 天规划', '多类型内容', '品牌声定制', '导出 Markdown/PDF'],
    viewCount: 0,
    likeCount: 0,
    tags: ['内容规划', 'AI', '日历']
  },
  {
    id: 'multi-platform-content',
    name: '多平台内容生成器',
    description: '输入一个主题，自动生成小红书、Twitter、LinkedIn、博客版本，并附带图文视频素材包',
    category: 'content-creation',
    url: '/tools/multi-platform-content',
    isFree: false,
    isRecommended: true,
    rating: 5.0,
    features: ['4 平台改写', 'SEO 关键词', '图片提示词', '视频 / BGM 灵感'],
    viewCount: 18642,
    likeCount: 4280,
    tags: ['内容工厂', '多平台', '付费核心']
  },
  {
    id: 'viral-generator',
    name: '爆款生成器',
    description: '收编旧项目三步流：标题、封面文字、完整文案一口气生成',
    category: 'content-creation',
    url: '/tools/viral-generator',
    isFree: false,
    isRecommended: true,
    rating: 4.9,
    features: ['标题生成', '封面短句', '完整文案', '三步工作流'],
    viewCount: 13240,
    likeCount: 3188,
    tags: ['爆款', '小红书', '旧轮子复用']
  },
  {
    id: 'hot-words-insight',
    name: '热词洞察工具',
    description: '直接复用旧热词库，快速发现高潜力概念和热点切口',
    category: 'data-analysis',
    url: '/tools/hot-words-insight',
    isFree: true,
    isRecommended: true,
    rating: 4.7,
    features: ['热词搜索', '趋势切口', '一键带入生成器', '热点选题'],
    viewCount: 9246,
    likeCount: 2015,
    tags: ['热词', '趋势', '选题']
  },
  {
    id: 'topic-inspiration',
    name: '灵感话题库',
    description: '把旧项目的话题库接回来，直接拿现成切口生成内容',
    category: 'content-creation',
    url: '/tools/topic-inspiration',
    isFree: true,
    isRecommended: true,
    rating: 4.8,
    features: ['灵感话题', '高转化选题', '一键写稿', '新手友好'],
    viewCount: 10112,
    likeCount: 2436,
    tags: ['灵感', '选题', '内容']
  },
  {
    id: 'background-remover',
    name: '图片背景移除',
    description: '本地浏览器去背景，适合封面、商品图和视频素材处理',
    category: 'image-editing',
    url: '/tools/background-remover',
    isFree: false,
    isRecommended: false,
    rating: 4.6,
    features: ['本地处理', '隐私友好', '阈值调节', '透明 PNG 导出'],
    viewCount: 6330,
    likeCount: 1420,
    tags: ['图片', '去背景', '素材']
  },
  {
    id: 'manga-generator',
    name: '漫画风生成器',
    description: '把普通图片转成漫画风，给封面和短视频素材增加记忆点',
    category: 'image-editing',
    url: '/tools/manga-generator',
    isFree: false,
    isRecommended: false,
    rating: 4.5,
    features: ['漫画风格化', 'Halftone', '边缘描线', '导出成图'],
    viewCount: 5120,
    likeCount: 1188,
    tags: ['漫画风', '图生图', '封面']
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
    name: '话题分析工具',
    description: '分析热门话题趋势，找到最适合你的内容方向',
    category: 'data-analysis',
    url: '/tools/topic-analyzer',
    isFree: true,
    isRecommended: true,
    rating: 4.6,
    features: ['趋势分析', '热度预测', '竞品对比', '数据可视化'],
    viewCount: 12456,
    likeCount: 2876,
    tags: ['话题', '分析', '趋势']
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
  },
  {
    id: 'content-automation-history',
    name: '内容工厂执行历史',
    description: '查看自动化任务成功率、失败率、回写详情与产物链接，支持状态筛选与回放',
    category: 'automation',
    url: '/tools/content-automation-history',
    isFree: false,
    isRecommended: true,
    rating: 4.8,
    features: ['发布结果看板', '执行历史详情', '产物链接追踪', '错误回放'],
    viewCount: 3088,
    likeCount: 926,
    tags: ['内容工厂', '历史', '看板']
  }
]
