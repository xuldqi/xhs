export interface WorkflowBlueprint {
  id: string
  title: string
  source: string
  description: string
  cadence: string
  outputs: string[]
  steps: string[]
  premiumOnly?: boolean
  downloadPath: string
  coreProviders: string[]
}

export const workflowBlueprints: WorkflowBlueprint[] = [
  {
    id: 'trend-scraper',
    title: '趋势抓取流水线',
    source: '收编自 pmsaveself / intelligent-scraper',
    description: '从内容源抓取高热话题，提炼出适合二次创作的主题、摘要和平台切口。',
    cadence: '按小时轮询 / 手动触发',
    outputs: ['热点主题', '原始内容摘要', '平台来源', '可写角度'],
    steps: ['抓取内容源', '过滤低质量结果', '聚合同类主题', '沉淀为可生成选题'],
    downloadPath: '/workflows/intelligent-scraper.json',
    coreProviders: ['deepseek', 'twitter', 'xiaohongshu']
  },
  {
    id: 'multi-platform-remix',
    title: '多平台改写流水线',
    source: '收编自 pmsaveself / multi-platform-publisher',
    description: '把同一个主题按平台长度、语气和 CTA 重新格式化，一次产出多平台版本。',
    cadence: '生成后立即执行',
    outputs: ['小红书稿', 'Twitter / X 版本', 'LinkedIn 版本', '微信/博客长文'],
    steps: ['主稿生成', '按平台格式拆分', '附加标签与摘要', '进入发布或人工审核'],
    downloadPath: '/workflows/multi-platform-publisher.json',
    coreProviders: ['twitter', 'weibo', 'xiaohongshu']
  },
  {
    id: 'auto-content-engine',
    title: '自动内容生产流水线',
    source: '收编自 pmsaveself / auto-content-generation',
    description: '把内容抓取、AI 生成、配图和发布时间规则串成一条自动生产线。',
    cadence: '每 6 小时自动运行',
    outputs: ['新文章', '配图建议', '发布时间检查', '多平台发布任务'],
    steps: ['取内容样本', 'AI 生成新稿', '补图与标签', '按时间窗发布'],
    downloadPath: '/workflows/auto-content-generation.json',
    coreProviders: ['deepseek', 'unsplash', 'twitter', 'weibo']
  },
  {
    id: 'image-video-factory',
    title: '图像 / 视频资产工厂',
    source: '收编自旧项目隐藏工具能力',
    description: '在文案生成之后，补上封面、图像处理、短视频开场和 BGM 灵感。',
    cadence: '随内容包一起生成',
    outputs: ['封面提示词', '去背景素材', '漫画/风格化图', '短视频开场', '音乐氛围建议'],
    steps: ['封面文案提炼', '图片处理', '镜头钩子生成', '视频氛围增强'],
    premiumOnly: true,
    downloadPath: '/workflows/auto-content-generation.json',
    coreProviders: ['image-model', 'video-model', 'music-model']
  }
]
