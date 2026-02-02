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
  }
]
