// 内容相关的类型定义

// 文章类型
export interface Article {
  id: string
  title: string
  slug: string
  category: string
  description?: string
  excerpt?: string
  content: string
  author: string
  readingTime: number
  publishedAt: string
  updatedAt?: string
  tags: string[]
  featured: boolean
  viewCount: number
  likeCount: number
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  coverImage?: string | null
}

// 案例研究类型
export interface CaseStudy {
  id: string
  title: string
  slug: string
  category: string
  accountType?: string
  description?: string
  excerpt?: string
  content: string
  coverImage?: string
  accountName: string
  followersBefore: number
  followersAfter: number
  growthPeriod: string
  growthRate: string
  keyStrategies: string[]
  timeline?: TimelineEvent[]
  dataPoints?: DataPoint[]
  lessons?: string[]
  publishDate: string
  featured: boolean
  viewCount: number
  likeCount: number
  author?: string
}

// 时间线事件
export interface TimelineEvent {
  date: string
  milestone: string
  description: string
  followers: number
}

// 数据点
export interface DataPoint {
  metric: string
  value: string
  change: string
}

// 情报类型
export interface Intelligence {
  id: string
  title: string
  slug: string
  category: string
  description?: string
  content: string
  publishedAt: string
  isBreaking?: boolean
  urgency: 'high' | 'medium' | 'low'
  tags: string[]
  viewCount: number
  likeCount: number
  source?: string
}

// 模板类型
export interface Template {
  id: string
  title: string
  description: string
  templateType: string
  fileFormat: string
  downloadUrl: string
  previewImage?: string
  tags: string[]
  viewCount: number
  downloadCount: number
}

// 内容分类
export interface ContentCategory {
  id: string
  name: string
  slug: string
  description?: string
}

// 情报类型（别名，用于兼容）
export type IntelligencePost = Intelligence


