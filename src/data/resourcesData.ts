// 资源库数据
export interface Resource {
  id: string
  title: string
  slug: string
  category: string
  description: string
  fileFormat: string
  fileSize: string
  downloadUrl: string
  previewImage?: string
  tags: string[]
  downloadCount: number
  viewCount: number
  featured: boolean
  publishDate: string
  author?: string
}

export const resources: Resource[] = [
  {
    id: '1',
    title: '小红书标题模板库（100+模板）',
    slug: 'title-templates',
    category: '模板',
    description: '收集了100+个经过验证的小红书标题模板，涵盖各种场景和风格，直接套用即可',
    fileFormat: 'PDF',
    fileSize: '2.5MB',
    downloadUrl: '/resources/downloads/title-templates.pdf',
    previewImage: '/images/resources/title-templates.jpg',
    tags: ['标题', '模板', '文案'],
    downloadCount: 15234,
    viewCount: 23456,
    featured: true,
    publishDate: '2024-11-20',
    author: '运营团队'
  },
  {
    id: '2',
    title: '小红书运营SOP标准流程',
    slug: 'operation-sop',
    category: 'SOP',
    description: '完整的小红书运营标准操作流程，包含内容规划、发布流程、数据分析等各个环节',
    fileFormat: 'DOCX',
    fileSize: '1.8MB',
    downloadUrl: '/resources/downloads/operation-sop.docx',
    previewImage: '/images/resources/operation-sop.jpg',
    tags: ['SOP', '流程', '运营'],
    downloadCount: 12345,
    viewCount: 18900,
    featured: true,
    publishDate: '2024-11-18',
    author: '运营团队'
  },
  {
    id: '3',
    title: '小红书封面设计模板（PSD）',
    slug: 'cover-templates',
    category: '模板',
    description: '50+个小红书封面设计PSD模板，包含各种风格和尺寸，可直接编辑使用',
    fileFormat: 'ZIP',
    fileSize: '125MB',
    downloadUrl: '/resources/downloads/cover-templates.zip',
    previewImage: '/images/resources/cover-templates.jpg',
    tags: ['封面', '设计', 'PSD'],
    downloadCount: 9876,
    viewCount: 15678,
    featured: true,
    publishDate: '2024-11-15',
    author: '设计团队'
  },
  {
    id: '4',
    title: '小红书数据分析表格模板',
    slug: 'data-analysis-template',
    category: '模板',
    description: 'Excel格式的数据分析表格，包含阅读量、互动率、涨粉数等关键指标追踪',
    fileFormat: 'XLSX',
    fileSize: '0.5MB',
    downloadUrl: '/resources/downloads/data-analysis-template.xlsx',
    previewImage: '/images/resources/data-analysis.jpg',
    tags: ['数据分析', 'Excel', '表格'],
    downloadCount: 8765,
    viewCount: 12345,
    featured: false,
    publishDate: '2024-11-12',
    author: '运营团队'
  },
  {
    id: '5',
    title: '小红书内容规划表',
    slug: 'content-planning',
    category: '模板',
    description: '月度内容规划表格，帮助你有条理地规划每周的发布内容',
    fileFormat: 'XLSX',
    fileSize: '0.3MB',
    downloadUrl: '/resources/downloads/content-planning.xlsx',
    previewImage: '/images/resources/content-planning.jpg',
    tags: ['内容规划', '表格', '计划'],
    downloadCount: 6543,
    viewCount: 9876,
    featured: false,
    publishDate: '2024-11-10',
    author: '运营团队'
  },
  {
    id: '6',
    title: '小红书账号定位分析表',
    slug: 'account-positioning',
    category: '模板',
    description: '帮助分析账号定位的表格模板，包含用户画像、内容方向、差异化分析等',
    fileFormat: 'DOCX',
    fileSize: '0.8MB',
    downloadUrl: '/resources/downloads/account-positioning.docx',
    previewImage: '/images/resources/account-positioning.jpg',
    tags: ['账号定位', '分析', '模板'],
    downloadCount: 5432,
    viewCount: 8765,
    featured: false,
    publishDate: '2024-11-08',
    author: '运营团队'
  },
  {
    id: '7',
    title: '小红书爆款内容公式合集',
    slug: 'viral-formulas',
    category: '文档',
    description: '整理了50+个经过验证的爆款内容公式，包含标题公式、内容结构、互动技巧等',
    fileFormat: 'PDF',
    fileSize: '3.2MB',
    downloadUrl: '/resources/downloads/viral-formulas.pdf',
    previewImage: '/images/resources/viral-formulas.jpg',
    tags: ['爆款', '公式', '技巧'],
    downloadCount: 11234,
    viewCount: 18900,
    featured: true,
    publishDate: '2024-11-05',
    author: '运营团队'
  },
  {
    id: '8',
    title: '小红书关键词库（5000+词）',
    slug: 'keyword-library',
    category: '数据',
    description: '收集了5000+个小红书热门关键词，按类别分类，包含搜索量和竞争度数据',
    fileFormat: 'XLSX',
    fileSize: '1.2MB',
    downloadUrl: '/resources/downloads/keyword-library.xlsx',
    previewImage: '/images/resources/keyword-library.jpg',
    tags: ['关键词', 'SEO', '数据'],
    downloadCount: 9876,
    viewCount: 14567,
    featured: false,
    publishDate: '2024-11-03',
    author: '运营团队'
  },
  {
    id: '9',
    title: '直播带货脚本与控场话术大全',
    slug: 'live-script-pack',
    category: '文档',
    description: '涵盖开场、转场、福利释放、成交催单等40+种直播话术模板，并附带控场节奏表与数据复盘表单。',
    fileFormat: 'PDF',
    fileSize: '4.1MB',
    downloadUrl: '/resources/downloads/live-script-pack.pdf',
    previewImage: '/images/resources/live-script-pack.jpg',
    tags: ['直播', '话术', '脚本'],
    downloadCount: 8643,
    viewCount: 16789,
    featured: true,
    publishDate: '2024-11-21',
    author: '直播研究室'
  },
  {
    id: '10',
    title: '内容选题灵感日历（2025 Q1）',
    slug: 'content-calendar-2025q1',
    category: '模板',
    description: '基于平台热点、节气、消费节点整理的90天选题日历，每天3-5个灵感点，附话题标签与口播提示。',
    fileFormat: 'XLSX',
    fileSize: '0.9MB',
    downloadUrl: '/resources/downloads/content-calendar-2025q1.xlsx',
    previewImage: '/images/resources/content-calendar.jpg',
    tags: ['选题', '日历', '灵感'],
    downloadCount: 7345,
    viewCount: 15432,
    featured: true,
    publishDate: '2024-11-24',
    author: '内容策略研究所'
  },
  {
    id: '11',
    title: '小红书品牌合作报价表（行业对标）',
    slug: 'brand-pricing-benchmark',
    category: '数据',
    description: '对50+细分品类的博主合作价位进行统计，涵盖粉丝段位、互动率、内容形态差异，帮助你合理定价。',
    fileFormat: 'XLSX',
    fileSize: '1.4MB',
    downloadUrl: '/resources/downloads/brand-pricing-benchmark.xlsx',
    previewImage: '/images/resources/brand-pricing.jpg',
    tags: ['品牌合作', '报价', '数据'],
    downloadCount: 6231,
    viewCount: 13890,
    featured: false,
    publishDate: '2024-11-22',
    author: '商业化团队'
  },
  {
    id: '12',
    title: 'AI创作效率工具箱',
    slug: 'ai-creation-toolkit',
    category: '工具',
    description: '集合20+款小红书创作常用的AI工具，包含标题生成、图片修复、脚本辅助、翻译润色等使用指南与案例。',
    fileFormat: 'PDF',
    fileSize: '5.6MB',
    downloadUrl: '/resources/downloads/ai-creation-toolkit.pdf',
    previewImage: '/images/resources/ai-toolkit.jpg',
    tags: ['AI', '工具箱', '效率'],
    downloadCount: 7021,
    viewCount: 16002,
    featured: true,
    publishDate: '2024-11-23',
    author: 'AIGC实验室'
  },
  {
    id: '13',
    title: '小红书矩阵运营实操手册',
    slug: 'matrix-operation-manual',
    category: 'SOP',
    description: '基于真实案例整理的矩阵运营实操手册，包含账号规划、内容分发、账号管理、数据监控等完整流程和工具推荐。',
    fileFormat: 'PDF',
    fileSize: '3.2MB',
    downloadUrl: '/resources/downloads/matrix-operation-manual.pdf',
    previewImage: '/images/resources/matrix-manual.jpg',
    tags: ['矩阵运营', 'SOP', '多账号管理'],
    downloadCount: 8234,
    viewCount: 15678,
    featured: true,
    publishDate: '2024-12-05',
    author: '运营团队'
  },
  {
    id: '14',
    title: '小红书CES评分计算器',
    slug: 'ces-score-calculator',
    category: '工具',
    description: 'Excel工具，自动计算小红书内容的CES评分，帮助创作者了解内容质量评分，优化内容策略。',
    fileFormat: 'XLSX',
    fileSize: '0.5MB',
    downloadUrl: '/resources/downloads/ces-score-calculator.xlsx',
    previewImage: '/images/resources/ces-calculator.jpg',
    tags: ['CES评分', '数据分析', '工具'],
    downloadCount: 5678,
    viewCount: 12345,
    featured: false,
    publishDate: '2024-12-05',
    author: '数据分析团队'
  },
  {
    id: '15',
    title: '小红书发布时间优化工具',
    slug: 'publishing-time-optimizer',
    category: '工具',
    description: '根据内容类型和用户活跃时间，自动推荐最佳发布时间，帮助创作者在最佳时间发布内容，提升初始流量池。',
    fileFormat: 'XLSX',
    fileSize: '0.8MB',
    downloadUrl: '/resources/downloads/publishing-time-optimizer.xlsx',
    previewImage: '/images/resources/time-optimizer.jpg',
    tags: ['发布时间', '工具', '优化'],
    downloadCount: 6789,
    viewCount: 14567,
    featured: false,
    publishDate: '2024-12-05',
    author: '运营策略团队'
  }
]

// 按分类获取资源
export function getResourcesByCategory(category: string): Resource[] {
  if (category === 'all') {
    return resources
  }
  return resources.filter(r => r.category === category)
}

// 获取精选资源
export function getFeaturedResources(): Resource[] {
  return resources.filter(r => r.featured)
}

// 根据slug获取资源
export function getResourceBySlug(slug: string): Resource | undefined {
  return resources.find(r => r.slug === slug)
}

// 资源分类
export const resourceCategories = [
  '模板',
  'SOP',
  '文档',
  '数据',
  '工具'
]

