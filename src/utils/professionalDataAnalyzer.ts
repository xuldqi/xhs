/**
 * 专业数据分析工具
 * 从账号数据中提取关键指标，生成专业的数据分析报告
 */

import type { AccountData } from '@/types'

export interface DataInsight {
  metric: string
  value: number | string
  trend?: 'up' | 'down' | 'stable'
  percentage?: number
  description?: string
}

export interface ChartData {
  type: 'pie' | 'bar' | 'line' | 'doughnut' | 'radar'
  title: string
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
    borderDash?: number[]
    tension?: number
  }[]
}

export interface ProfessionalReport {
  executiveSummary: string
  keyMetrics: DataInsight[]
  charts: ChartData[]
  swotAnalysis: {
    strengths: string[]
    weaknesses: string[]
    opportunities: string[]
    threats: string[]
  }
  recommendations: {
    priority: 'high' | 'medium' | 'low'
    title: string
    description: string
    expectedImpact: string
  }[]
}

/**
 * 分析账号数据，生成专业报告
 */
export function analyzeProfessionalData(accountData: AccountData): ProfessionalReport {
  const keyMetrics = generateKeyMetrics(accountData)
  const charts = generateCharts(accountData)
  const swotAnalysis = generateSWOTAnalysis(accountData)
  const recommendations = generateRecommendations(accountData)
  const executiveSummary = generateExecutiveSummary(accountData, keyMetrics)

  return {
    executiveSummary,
    keyMetrics,
    charts,
    swotAnalysis,
    recommendations
  }
}

/**
 * 生成关键指标
 */
function generateKeyMetrics(accountData: AccountData): DataInsight[] {
  const { followerCount, postCount, contentCategory } = accountData
  
  // 计算互动率（基于行业平均值）
  const engagementRate = calculateEngagementRate(followerCount)
  
  // 计算内容产出频率
  const postFrequency = calculatePostFrequency(postCount)
  
  // 计算账号成熟度
  const maturityScore = calculateMaturityScore(followerCount, postCount)
  
  // 计算增长潜力
  const growthPotential = calculateGrowthPotential(followerCount, postCount, contentCategory)

  return [
    {
      metric: '粉丝规模',
      value: followerCount,
      description: getFollowerScaleDescription(followerCount)
    },
    {
      metric: '内容产出',
      value: postCount,
      description: `已发布 ${postCount} 篇笔记`
    },
    {
      metric: '预估互动率',
      value: `${engagementRate}%`,
      trend: engagementRate > 3 ? 'up' : engagementRate > 1.5 ? 'stable' : 'down',
      description: getEngagementDescription(engagementRate)
    },
    {
      metric: '内容频率',
      value: postFrequency,
      description: '基于历史发布数据'
    },
    {
      metric: '账号成熟度',
      value: `${maturityScore}/100`,
      percentage: maturityScore,
      description: getMaturityDescription(maturityScore)
    },
    {
      metric: '增长潜力',
      value: growthPotential,
      description: '基于行业数据分析'
    }
  ]
}

/**
 * 生成图表数据
 */
function generateCharts(accountData: AccountData): ChartData[] {
  const charts: ChartData[] = []

  // 1. 账号发展阶段饼图
  charts.push({
    type: 'doughnut',
    title: '账号发展阶段分析',
    labels: ['已完成', '进行中', '待开发'],
    datasets: [{
      label: '发展进度',
      data: calculateDevelopmentStage(accountData),
      backgroundColor: ['#10b981', '#f59e0b', '#e5e7eb']
    }]
  })

  // 2. 内容表现预测柱状图
  charts.push({
    type: 'bar',
    title: '内容表现预测（未来30天）',
    labels: ['第1周', '第2周', '第3周', '第4周'],
    datasets: [{
      label: '预计曝光量',
      data: predictContentPerformance(accountData),
      backgroundColor: ['#3b82f6', '#3b82f6', '#3b82f6', '#3b82f6']
    }]
  })

  // 3. 竞争力雷达图
  charts.push({
    type: 'radar',
    title: '账号竞争力分析',
    labels: ['内容质量', '更新频率', '粉丝互动', '品牌影响力', '商业价值'],
    datasets: [{
      label: '当前水平',
      data: calculateCompetitiveness(accountData),
      backgroundColor: 'rgba(255, 36, 66, 0.2)',
      borderColor: '#ff2442'
    }]
  })

  // 4. 增长趋势预测线图
  charts.push({
    type: 'line',
    title: '粉丝增长趋势预测（90天）',
    labels: ['当前', '30天', '60天', '90天'],
    datasets: [{
      label: '预计粉丝数',
      data: predictGrowthTrend(accountData),
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)'
    }]
  })

  return charts
}

/**
 * 生成 SWOT 分析
 */
function generateSWOTAnalysis(accountData: AccountData): ProfessionalReport['swotAnalysis'] {
  const { followerCount, postCount, contentCategory } = accountData

  const strengths: string[] = []
  const weaknesses: string[] = []
  const opportunities: string[] = []
  const threats: string[] = []

  // 优势分析
  if (followerCount > 10000) {
    strengths.push('已建立稳定的粉丝基础，具备一定影响力')
  }
  if (postCount > 50) {
    strengths.push('内容积累丰富，创作经验充足')
  }
  strengths.push(`${contentCategory}领域定位明确，垂直度高`)

  // 劣势分析
  if (followerCount < 1000) {
    weaknesses.push('粉丝基数较小，需要加强账号曝光')
  }
  if (postCount < 20) {
    weaknesses.push('内容积累不足，需要提高发布频率')
  }
  weaknesses.push('品牌认知度有待提升，需要强化个人IP')

  // 机会分析
  opportunities.push(`${contentCategory}赛道仍有较大增长空间`)
  opportunities.push('平台算法持续优化，优质内容获得更多流量支持')
  opportunities.push('用户对专业内容需求增加，垂直领域创作者受青睐')

  // 威胁分析
  threats.push('同类账号竞争激烈，需要差异化定位')
  threats.push('用户注意力分散，内容需要更强吸引力')
  threats.push('平台规则变化可能影响流量获取')

  return { strengths, weaknesses, opportunities, threats }
}

/**
 * 生成建议
 */
function generateRecommendations(accountData: AccountData): ProfessionalReport['recommendations'] {
  const { followerCount, postCount } = accountData

  const recommendations: ProfessionalReport['recommendations'] = []

  // 根据账号阶段给出不同建议
  if (followerCount < 1000) {
    recommendations.push({
      priority: 'high',
      title: '快速突破冷启动期',
      description: '采用"3-3-3"策略：每天发布3条优质内容，参与3个热门话题，互动30条评论',
      expectedImpact: '预计30天内粉丝增长至1000+'
    })
  }

  if (postCount < 30) {
    recommendations.push({
      priority: 'high',
      title: '建立内容资产库',
      description: '制定内容日历，确保每周至少发布3-5篇笔记，建立稳定的更新节奏',
      expectedImpact: '提升账号权重，增加推荐概率'
    })
  }

  recommendations.push({
    priority: 'medium',
    title: '优化内容结构',
    description: '采用"封面+标题+正文+互动"四要素模型，提高内容完播率和互动率',
    expectedImpact: '互动率提升50%以上'
  })

  recommendations.push({
    priority: 'medium',
    title: '建立用户社群',
    description: '创建粉丝群或话题标签，培养核心用户，提高用户粘性',
    expectedImpact: '用户留存率提升30%'
  })

  recommendations.push({
    priority: 'low',
    title: '探索商业变现',
    description: '在粉丝达到5000+后，可以尝试品牌合作、知识付费等变现方式',
    expectedImpact: '开启商业化路径'
  })

  return recommendations
}

/**
 * 生成执行摘要
 */
function generateExecutiveSummary(accountData: AccountData, metrics: DataInsight[]): string {
  const { username, followerCount, contentCategory } = accountData
  
  const maturityMetric = metrics.find(m => m.metric === '账号成熟度')
  const maturityScore = maturityMetric?.percentage || 0

  return `
本报告针对"${username}"小红书账号进行全面分析。该账号定位于${contentCategory}领域，
当前粉丝规模为${followerCount.toLocaleString()}，账号成熟度评分${maturityScore}/100。

通过数据分析发现，该账号${getStageDescription(followerCount)}，
${getGrowthPotentialDescription(followerCount, contentCategory)}。

建议采取系统化运营策略，重点关注内容质量提升、发布频率优化和用户互动增强，
预计在未来90天内实现${calculateExpectedGrowth(followerCount)}的增长目标。
  `.trim()
}

// ============ 辅助计算函数 ============

function calculateEngagementRate(followers: number): number {
  // 基于行业数据的互动率估算
  if (followers < 1000) return 5.0
  if (followers < 5000) return 3.5
  if (followers < 10000) return 2.5
  if (followers < 50000) return 2.0
  return 1.5
}

function calculatePostFrequency(posts: number): string {
  if (posts < 10) return '低频（需提升）'
  if (posts < 30) return '中频（可优化）'
  if (posts < 100) return '高频（良好）'
  return '超高频（优秀）'
}

function calculateMaturityScore(followers: number, posts: number): number {
  const followerScore = Math.min((followers / 10000) * 40, 40)
  const postScore = Math.min((posts / 100) * 30, 30)
  const consistencyScore = posts > 0 ? 30 : 0
  return Math.round(followerScore + postScore + consistencyScore)
}

function calculateGrowthPotential(followers: number, posts: number, category: string): string {
  const score = (followers / 1000) + (posts / 10)
  if (score < 5) return '高潜力'
  if (score < 20) return '中等潜力'
  return '稳定增长'
}

function getFollowerScaleDescription(followers: number): string {
  if (followers < 1000) return '初创期账号，处于冷启动阶段'
  if (followers < 5000) return '成长期账号，具备基础影响力'
  if (followers < 10000) return '发展期账号，影响力逐步扩大'
  if (followers < 50000) return '成熟期账号，具备较强影响力'
  return '头部账号，行业领先地位'
}

function getEngagementDescription(rate: number): string {
  if (rate > 3) return '互动表现优秀，用户粘性强'
  if (rate > 1.5) return '互动表现良好，有提升空间'
  return '互动率偏低，需要优化内容策略'
}

function getMaturityDescription(score: number): string {
  if (score < 30) return '账号处于早期阶段，需要快速积累'
  if (score < 60) return '账号发展中等，具备一定基础'
  return '账号较为成熟，可以探索深度运营'
}

function calculateDevelopmentStage(accountData: AccountData): number[] {
  const { followerCount, postCount } = accountData
  const completed = Math.min((followerCount / 10000) * 30 + (postCount / 100) * 20, 50)
  const inProgress = Math.min(30, 100 - completed - 20)
  const pending = 100 - completed - inProgress
  return [completed, inProgress, pending]
}

function predictContentPerformance(accountData: AccountData): number[] {
  const base = accountData.followerCount * 2
  return [
    Math.round(base * 1.0),
    Math.round(base * 1.2),
    Math.round(base * 1.5),
    Math.round(base * 1.8)
  ]
}

function calculateCompetitiveness(accountData: AccountData): number[] {
  const { followerCount, postCount } = accountData
  return [
    Math.min((postCount / 50) * 100, 100), // 内容质量
    Math.min((postCount / 100) * 100, 100), // 更新频率
    Math.min((followerCount / 5000) * 100, 100), // 粉丝互动
    Math.min((followerCount / 10000) * 100, 100), // 品牌影响力
    Math.min((followerCount / 20000) * 100, 100) // 商业价值
  ]
}

function predictGrowthTrend(accountData: AccountData): number[] {
  const current = accountData.followerCount
  const growthRate = current < 1000 ? 1.5 : current < 5000 ? 1.3 : 1.2
  return [
    current,
    Math.round(current * growthRate),
    Math.round(current * Math.pow(growthRate, 2)),
    Math.round(current * Math.pow(growthRate, 3))
  ]
}

function getStageDescription(followers: number): string {
  if (followers < 1000) return '处于冷启动阶段，需要快速积累初始用户'
  if (followers < 5000) return '处于成长期，正在建立品牌认知'
  if (followers < 10000) return '处于发展期，影响力稳步提升'
  return '已进入成熟期，具备稳定的用户基础'
}

function getGrowthPotentialDescription(followers: number, category: string): string {
  if (followers < 1000) {
    return `在${category}领域仍有巨大增长空间，建议采取积极的内容策略`
  }
  return `在${category}领域已建立一定优势，建议深化内容价值，提升用户粘性`
}

function calculateExpectedGrowth(followers: number): string {
  if (followers < 1000) return '300-500%'
  if (followers < 5000) return '100-200%'
  if (followers < 10000) return '50-100%'
  return '30-50%'
}
