import { aiService } from './aiService'

export type PlatformKey = 'xiaohongshu' | 'twitter' | 'linkedin' | 'blog'

export interface TrendSignal {
  id: string
  label: string
  source: string
  momentum: string
  angle: string
  keyword: string
}

export interface MultiPlatformGenerationInput {
  topic: string
  audience: string
  goal: string
  tone: string
  offer?: string
  callToAction?: string
  trendSignal?: TrendSignal | null
  platforms: PlatformKey[]
  premium: boolean
  languageMode: 'zh' | 'bilingual'
  includeSeoKeywords: boolean
  includeImagePrompts: boolean
  includeVideoHooks: boolean
  includeMusicIdeas: boolean
}

export interface PlatformDraft {
  key: PlatformKey
  title: string
  hook: string
  body: string[]
  hashtags: string[]
  cta: string
  formatTips: string[]
  coverLines: string[]
}

export interface MultiPlatformPack {
  source: 'ai' | 'mock'
  trendSignal: TrendSignal | null
  strategy: {
    campaignAngle: string
    audienceLens: string
    trendSummary: string
    seoFocus: string
    translationNote: string
    monetizationHint: string
  }
  assets: {
    seoKeywords: string[]
    imagePrompts: string[]
    videoHooks: string[]
    musicIdeas: string[]
  }
  platforms: PlatformDraft[]
}

const ALLOW_MOCK_FALLBACK = import.meta.env.VITE_ALLOW_MOCK_FALLBACK === 'true'

export const PLATFORM_META: Record<PlatformKey, {
  label: string
  language: string
  premium: boolean
  description: string
}> = {
  xiaohongshu: {
    label: '小红书',
    language: '中文',
    premium: false,
    description: '标题、正文、标签、封面短句一次生成'
  },
  twitter: {
    label: 'Twitter / X',
    language: '英文',
    premium: true,
    description: '自动改写为 thread 与高传播短句'
  },
  linkedin: {
    label: 'LinkedIn',
    language: '英文',
    premium: true,
    description: '更专业、更可信的职业表达'
  },
  blog: {
    label: '博客长文',
    language: '中文',
    premium: true,
    description: '扩展成 SEO 友好的结构化长文'
  }
}

export const TREND_SIGNALS: TrendSignal[] = [
  {
    id: 'ai-solopreneur',
    label: 'AI 个体创业',
    source: 'Twitter 热门方向（预置快照）',
    momentum: '爆发期',
    angle: '强调 AI 如何替代多人团队，提高内容生产效率',
    keyword: 'AI 个体创业内容工厂'
  },
  {
    id: 'local-growth',
    label: '本地商家获客',
    source: '搜索需求信号（预置快照）',
    momentum: '升温中',
    angle: '突出低预算、强转化、可复制的内容获客打法',
    keyword: '本地商家内容获客'
  },
  {
    id: 'creator-systems',
    label: '创作者系统化运营',
    source: 'LinkedIn 讨论点（预置快照）',
    momentum: '稳定高热',
    angle: '聚焦 SOP、复用、批量产出和团队协同',
    keyword: '创作者内容系统化'
  },
  {
    id: 'personal-brand',
    label: '个人品牌变现',
    source: 'SEO 需求词（预置快照）',
    momentum: '持续上升',
    angle: '从观点输出切到产品成交，强化信任和成交闭环',
    keyword: '个人品牌变现内容'
  }
]

const platformAliases: Record<PlatformKey, string[]> = {
  xiaohongshu: ['xiaohongshu', 'xhs', 'littleRedBook'],
  twitter: ['twitter', 'x', 'twitterX'],
  linkedin: ['linkedin', 'linkedIn'],
  blog: ['blog', 'article', 'longform']
}

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => normalizeString(item))
      .filter(Boolean)
  }

  if (typeof value === 'string') {
    return value
      .split(/\n+/)
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return []
}

function uniqueStrings(values: string[], max = values.length): string[] {
  return [...new Set(values.map((item) => item.trim()).filter(Boolean))].slice(0, max)
}

function extractRawText(response: any): string {
  if (typeof response === 'string') return response
  return response?.choices?.[0]?.message?.content || response?.content || response?.data || ''
}

function extractJsonObject(text: string): any | null {
  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    const startIndex = text.indexOf('{')
    const endIndex = text.lastIndexOf('}')
    if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
      return null
    }

    try {
      return JSON.parse(text.slice(startIndex, endIndex + 1))
    } catch {
      return null
    }
  }
}

function getPlatformPayload(platforms: Record<string, any>, key: PlatformKey) {
  for (const alias of platformAliases[key]) {
    if (platforms?.[alias]) {
      return platforms[alias]
    }
  }
  return null
}

function buildStarterHashtags(topic: string, key: PlatformKey): string[] {
  const sanitizedTopic = topic.replace(/^#/, '').trim()
  const chineseTopic = `#${sanitizedTopic}`

  if (key === 'twitter') {
    return uniqueStrings([
      '#CreatorEconomy',
      '#ContentMarketing',
      '#GrowthStrategy'
    ], 3)
  }

  if (key === 'linkedin') {
    return uniqueStrings([
      '#PersonalBrand',
      '#MarketingStrategy',
      '#CreatorBusiness'
    ], 3)
  }

  if (key === 'blog') {
    return uniqueStrings([
      sanitizedTopic,
      '内容营销',
      '增长策略'
    ], 3)
  }

  return uniqueStrings([
    chineseTopic,
    '#小红书运营',
    '#内容创作',
    '#涨粉方法'
  ], 4)
}

function buildFallbackBody(key: PlatformKey, input: MultiPlatformGenerationInput): string[] {
  const topic = input.topic.trim()
  const trendLabel = input.trendSignal?.label
  const trendSentence = trendLabel ? `再结合「${trendLabel}」这个趋势切口，内容会更容易被用户记住。` : '把内容写到用户真正卡住的那一步，比空泛讲道理更有转化。'

  if (key === 'twitter') {
    return [
      `Most people create content around features. The better move is to create around one sharp outcome: ${topic}.`,
      `Start with the user pain, show the fastest win, and remove one hidden objection in the second line.`,
      `Then turn the same idea into a repeatable content system: hook, proof, framework, CTA.`,
      trendLabel ? `Right now the ${trendLabel} conversation gives this angle extra momentum.` : 'This works especially well when the category is noisy and trust is low.',
      `Save this and turn it into a 5-post thread before your competitors do.`
    ]
  }

  if (key === 'linkedin') {
    return [
      `If you want ${topic} to drive real business results, stop publishing isolated ideas and start building a repeatable narrative.`,
      `The strongest posts usually combine one clear point of view, one proof point, and one operational takeaway the audience can use immediately.`,
      trendLabel
        ? `The current ${trendLabel} wave makes this especially relevant because decision-makers are actively looking for practical playbooks.`
        : 'This is where professional audiences respond best: less hype, more signal, clearer context.',
      `A simple structure works well: situation → insight → framework → next action.`
    ]
  }

  if (key === 'blog') {
    return [
      `先说核心结论：围绕「${topic}」做内容，最有效的不是一味堆量，而是先确定一个最容易成交的切入场景。`,
      `第一部分要解决“为什么现在就该做”。用户通常不是缺信息，而是缺一个能马上执行的路径。`,
      `第二部分要提供结构化方法，例如拆成选题、表达、分发、转化四个动作，让内容从灵感变成流程。`,
      trendSentence,
      `最后一定要给出明确 CTA，例如收藏、评论关键词、私信领取清单，让内容真正带来线索和成交。`
    ]
  }

  return [
    `如果你也在做「${topic}」，先别急着发一堆内容，先把用户最想解决的那个问题写清楚。`,
    `好内容不是“我知道很多”，而是“我知道你现在最卡哪一步”。`,
    `正文可以按“问题 → 误区 → 方法 → 立刻执行”四段来写，读者更容易看完并收藏。`,
    trendSentence
  ]
}

function buildFallbackTips(key: PlatformKey): string[] {
  if (key === 'twitter') {
    return ['前三条先打观点，再给方法', '每条尽量控制一句话一个信息点']
  }

  if (key === 'linkedin') {
    return ['第一段先亮出判断', '中段加入经验或案例增强可信度']
  }

  if (key === 'blog') {
    return ['使用小标题拆分逻辑', '在文末布局关键词与转化 CTA']
  }

  return ['开头前三行先说结论', '结尾加收藏或评论引导']
}

function buildFallbackTitle(key: PlatformKey, input: MultiPlatformGenerationInput): string {
  const topic = input.topic.trim()

  switch (key) {
    case 'twitter':
      return `A smarter way to turn ${topic} into repeatable content`
    case 'linkedin':
      return `How to turn ${topic} into a content system that actually converts`
    case 'blog':
      return `${topic}怎么做成一套可复用的内容增长系统`
    default:
      return `做${topic}的人，真正该先优化的不是努力，而是内容结构`
  }
}

function buildFallbackHook(key: PlatformKey, input: MultiPlatformGenerationInput): string {
  const topic = input.topic.trim()

  switch (key) {
    case 'twitter':
      return `If you're posting about ${topic} but not seeing traction, the problem is usually positioning—not effort.`
    case 'linkedin':
      return `Most creators talk about ${topic}. Very few package it into a repeatable commercial narrative.`
    case 'blog':
      return `这篇文章不讲空泛方法，而是直接告诉你如何把「${topic}」做成一套可批量复用的内容系统。`
    default:
      return `很多人做${topic}没有结果，不是因为不努力，而是内容没有对准用户真正会收藏和转发的点。`
  }
}

function buildFallbackCoverLines(input: MultiPlatformGenerationInput): string[] {
  return uniqueStrings([
    `${input.topic}还能这样做`,
    '先收藏再照着发',
    '一篇拆成四个平台'
  ], 3)
}

function normalizePlatformDraft(key: PlatformKey, payload: any, input: MultiPlatformGenerationInput): PlatformDraft {
  const coverLines = normalizeStringArray(payload?.coverLines)
  const hashtags = normalizeStringArray(payload?.hashtags)
  const body = normalizeStringArray(payload?.body || payload?.posts || payload?.paragraphs || payload?.sections)
  const tips = normalizeStringArray(payload?.formatTips || payload?.tips)

  return {
    key,
    title: normalizeString(payload?.title) || buildFallbackTitle(key, input),
    hook: normalizeString(payload?.hook) || buildFallbackHook(key, input),
    body: body.length > 0 ? body : buildFallbackBody(key, input),
    hashtags: hashtags.length > 0 ? uniqueStrings(hashtags, 6) : buildStarterHashtags(input.topic, key),
    cta: normalizeString(payload?.cta) || input.callToAction || '收藏这条，后续直接照着改写发布',
    formatTips: tips.length > 0 ? uniqueStrings(tips, 4) : buildFallbackTips(key),
    coverLines: coverLines.length > 0 ? uniqueStrings(coverLines, 4) : (key === 'xiaohongshu' ? buildFallbackCoverLines(input) : [])
  }
}

function buildFallbackAssets(input: MultiPlatformGenerationInput) {
  const seoKeywords = input.includeSeoKeywords
    ? uniqueStrings([
        input.topic,
        `${input.topic} 方法`,
        `${input.topic} 模板`,
        `${input.topic} 变现`
      ], input.premium ? 6 : 3)
    : []

  const imagePrompts = input.includeImagePrompts
    ? uniqueStrings([
        `小红书封面风格，主题是${input.topic}，高对比标题，大面积留白，品牌感红白配色`,
        `信息图风格海报，突出${input.topic}的3个关键步骤，适合社媒传播`,
        `专业内容工厂工作台场景，体现效率、AI、内容批量生产`
      ], input.premium ? 3 : 1)
    : []

  const videoHooks = input.includeVideoHooks && input.premium
    ? uniqueStrings([
        `开场 3 秒直接问：为什么你做${input.topic}还是没有转化？`,
        `镜头先给结果：我用一套模板把同一个主题改成了 4 个平台版本。`
      ], 2)
    : []

  const musicIdeas = input.includeMusicIdeas && input.premium
    ? uniqueStrings([
        '极简电子感节奏，适合效率与系统感表达',
        '轻快高质感都市 Lo-fi，适合知识博主与内容演示'
      ], 2)
    : []

  return {
    seoKeywords,
    imagePrompts,
    videoHooks,
    musicIdeas
  }
}

function buildMockPack(input: MultiPlatformGenerationInput): MultiPlatformPack {
  return {
    source: 'mock',
    trendSignal: input.trendSignal || null,
    strategy: {
      campaignAngle: `把「${input.topic}」从泛内容改成可收藏、可成交的内容任务。`,
      audienceLens: `优先面向${input.audience}，先解决他们当下最想立刻做成的一件事。`,
      trendSummary: input.trendSignal
        ? `当前可借势「${input.trendSignal.label}」，主打${input.trendSignal.angle}。`
        : '当前适合走“结果先行 + 模板复用 + 明确 CTA”的内容结构。',
      seoFocus: `围绕${input.topic}布局主关键词、方法词和转化词，兼顾搜索和种草。`,
      translationNote: input.languageMode === 'bilingual'
        ? 'Twitter / LinkedIn 默认转成英文表达，减少直译感，保留观点力度。'
        : '当前输出以中文为主，可后续接入翻译 API 做更多本地化。',
      monetizationHint: `建议把${input.offer || '你的产品或服务'}嵌入 CTA，形成“内容 → 线索 → 成交”闭环。`
    },
    assets: buildFallbackAssets(input),
    platforms: input.platforms.map((key) => normalizePlatformDraft(key, {}, input))
  }
}

export async function generateMultiPlatformPack(input: MultiPlatformGenerationInput): Promise<MultiPlatformPack> {
  try {
    const response = await aiService.generateMultiPlatformPack({
      topic: input.topic,
      audience: input.audience,
      goal: input.goal,
      tone: input.tone,
      offer: input.offer,
      callToAction: input.callToAction,
      trendContext: input.trendSignal
        ? `${input.trendSignal.label}｜${input.trendSignal.momentum}｜${input.trendSignal.angle}`
        : undefined,
      platforms: input.platforms,
      premium: input.premium,
      languageMode: input.languageMode,
      includeSeoKeywords: input.includeSeoKeywords,
      includeImagePrompts: input.includeImagePrompts,
      includeVideoHooks: input.includeVideoHooks,
      includeMusicIdeas: input.includeMusicIdeas,
    })

    const rawText = extractRawText(response)
    const parsed = extractJsonObject(rawText)
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('AI 返回格式异常')
    }

    const strategy = parsed.strategy || {}
    const assets = parsed.assets || {}
    const platformsData = parsed.platforms || {}

    const normalizedPlatforms = input.platforms.map((key) => {
      const payload = getPlatformPayload(platformsData, key)
      return normalizePlatformDraft(key, payload || {}, input)
    })

    if (!normalizedPlatforms.some((item) => item.body.length > 0)) {
      throw new Error('平台内容为空')
    }

    return {
      source: 'ai',
      trendSignal: input.trendSignal || null,
      strategy: {
        campaignAngle: normalizeString(strategy.campaignAngle) || `围绕${input.topic}建立一个可复用的内容转化角度。`,
        audienceLens: normalizeString(strategy.audienceLens) || `优先说给${input.audience}听，而不是对所有人泛泛而谈。`,
        trendSummary: normalizeString(strategy.trendSummary) || (input.trendSignal?.angle || '当前内容更适合走结果导向的表达。'),
        seoFocus: normalizeString(strategy.seoFocus) || `围绕${input.topic}建立主关键词、场景词和行动词。`,
        translationNote: normalizeString(strategy.translationNote) || '英文平台已按语气差异做本地化改写。',
        monetizationHint: normalizeString(strategy.monetizationHint) || `把${input.offer || '你的服务'}放进 CTA，提升线索转化。`
      },
      assets: {
        seoKeywords: input.includeSeoKeywords
          ? uniqueStrings(normalizeStringArray(assets.seoKeywords), input.premium ? 8 : 3)
          : [],
        imagePrompts: input.includeImagePrompts
          ? uniqueStrings(normalizeStringArray(assets.imagePrompts), input.premium ? 4 : 1)
          : [],
        videoHooks: input.includeVideoHooks && input.premium
          ? uniqueStrings(normalizeStringArray(assets.videoHooks), 3)
          : [],
        musicIdeas: input.includeMusicIdeas && input.premium
          ? uniqueStrings(normalizeStringArray(assets.musicIdeas), 3)
          : []
      },
      platforms: normalizedPlatforms
    }
  } catch (error) {
    if (ALLOW_MOCK_FALLBACK) {
      console.warn('generateMultiPlatformPack failed, fallback to mock pack:', error)
      return buildMockPack(input)
    }

    console.error('generateMultiPlatformPack failed:', error)
    const reason = error instanceof Error ? error.message : 'unknown_error'
    throw new Error(`多平台内容生成失败（未启用演示兜底）：${reason}`)
  }
}
