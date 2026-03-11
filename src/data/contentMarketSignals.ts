export interface MarketSignal {
  id: string
  toolName: string
  platformFocus: string
  demandAngle: string
  description: string
  url: string
  source: string
}

export const marketSignals: MarketSignal[] = [
  {
    id: 'postwise',
    toolName: 'Postwise',
    platformFocus: 'Twitter / LinkedIn',
    demandAngle: '写作 + 排期 + 增长一体化',
    description: 'AI-powered tool to write, schedule, and grow on Twitter and LinkedIn.',
    url: 'https://postwise.ai',
    source: 'seai importedToolsBatch'
  },
  {
    id: 'scripe',
    toolName: 'Scripe',
    platformFocus: 'LinkedIn',
    demandAngle: '爆款 LinkedIn 内容生成',
    description: 'AI-powered LinkedIn content creation tool for personalized and viral posts.',
    url: 'https://scripe.io/',
    source: 'seai importedToolsBatch'
  },
  {
    id: 'viralgen',
    toolName: 'Viralgen',
    platformFocus: 'LinkedIn',
    demandAngle: '职业平台高互动帖子',
    description: 'AI-powered LinkedIn post generator for viral content and increased engagement.',
    url: 'https://viralgen.io',
    source: 'seai importedToolsBatch'
  },
  {
    id: 'saaslink',
    toolName: 'Saaslink',
    platformFocus: 'LinkedIn',
    demandAngle: 'SaaS 获客内容转化',
    description: 'AI-powered LinkedIn content generation for SaaS companies to convert leads.',
    url: 'https://saaslink.pro',
    source: 'seai importedToolsBatch'
  },
  {
    id: 'tweetai',
    toolName: 'TweetAI',
    platformFocus: 'Twitter / X',
    demandAngle: '推文与回复生成',
    description: 'AI-powered tool for generating tweets and replies to boost engagement on Twitter / X.',
    url: 'https://TweetAI.com',
    source: 'seai importedToolsBatch'
  },
  {
    id: 'beast',
    toolName: 'Beast',
    platformFocus: 'Twitter / X',
    demandAngle: '自动排期与增长',
    description: 'AI-powered tweet scheduler for automated X (Twitter) account growth.',
    url: 'https://xbeast.io',
    source: 'seai importedToolsBatch'
  },
  {
    id: 'x-topics',
    toolName: 'X Topics',
    platformFocus: 'Twitter / Threads',
    demandAngle: '主题发现与趋势选题',
    description: 'X Topics analyzes your tweets to suggest engaging topics for X/Twitter and Threads.',
    url: 'https://xtopics.co',
    source: 'seai importedToolsBatch'
  },
  {
    id: 'lumeo',
    toolName: 'Lumeo',
    platformFocus: 'LinkedIn',
    demandAngle: '帖子 + 轮播设计一体化',
    description: 'AI-powered LinkedIn carousel and post generator with formatting and design tools.',
    url: 'https://lumeo.me',
    source: 'seai importedToolsBatch'
  },
  {
    id: 'scriptu',
    toolName: 'Scriptu',
    platformFocus: 'LinkedIn',
    demandAngle: '内容生成 + 排程 + 优化',
    description: 'AI-powered LinkedIn content creation, scheduling, and optimization tool.',
    url: 'https://www.scriptu.io',
    source: 'seai importedToolsBatch'
  },
  {
    id: 'blogbutler',
    toolName: 'Blogbutler AI',
    platformFocus: '博客 / 多平台',
    demandAngle: '博客自动化 + 多平台发布',
    description: 'AI-powered blog automation tool for content creation, idea generation, and multi-platform publishing.',
    url: 'https://blogbutler.ai',
    source: 'seai importedToolsBatch'
  }
]
