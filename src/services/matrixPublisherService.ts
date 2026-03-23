const API_BASE = import.meta.env.VITE_BACKEND_URL || ''
const ALLOW_MOCK_FALLBACK = import.meta.env.VITE_ALLOW_MOCK_FALLBACK !== 'false'

export type MatrixChannel = 'xiaohongshu'
export type MatrixRiskLevel = 'low' | 'medium' | 'high'
export type MatrixIssueLevel = 'error' | 'warning'

export interface MatrixAccountProfile {
  id: string
  name: string
  handle: string
  persona: string
  niche: string
  voice: string
  imageStyle: string
  dailyLimit: number
  defaultTags: string[]
  preferredSlots: string[]
  requiresReview: boolean
  active: boolean
}

export interface MatrixAnglePreset {
  key: string
  label: string
  description: string
  emphasis: string
}

export interface MatrixAssetPack {
  coverLines: string[]
  imagePrompt: string
  galleryPrompts: string[]
}

export interface MatrixContentVariant {
  id: string
  angleKey: string
  angleLabel: string
  title: string
  hook: string
  body: string[]
  hashtags: string[]
  cta: string
  differenceNote: string
  personaFit: string
  riskLevel: MatrixRiskLevel
  score: number
  assetPack: MatrixAssetPack
}

export interface MatrixCampaignInput {
  topic: string
  audience: string
  keywordSeed?: string
  goal: string
  callToAction?: string
  variantCount: number
  angleKeys: string[]
  accounts: MatrixAccountProfile[]
}

export interface MatrixCampaignResult {
  source: 'ai' | 'mock'
  summary: string
  variants: MatrixContentVariant[]
}

export interface MatrixDispatchPlan {
  id: string
  accountId: string
  variantId: string
  channel: MatrixChannel
  plannedAt: string
  note: string
  status: 'draft' | 'queued'
  reviewRequired: boolean
  assetUrls: string[]
}

export interface MatrixValidationIssue {
  id: string
  level: MatrixIssueLevel
  message: string
}

const MATRIX_ACCOUNTS_STORAGE_KEY = 'xhs_matrix_accounts_v1'
const MATRIX_PLANS_STORAGE_KEY = 'xhs_matrix_plans_v1'
const MATRIX_VARIANTS_STORAGE_KEY = 'xhs_matrix_variants_v1'
const MATRIX_CAMPAIGN_DRAFT_STORAGE_KEY = 'xhs_matrix_campaign_draft_v1'

export const MATRIX_ANGLE_PRESETS: MatrixAnglePreset[] = [
  {
    key: 'tutorial',
    label: '教程型',
    description: '适合干货号，用步骤把复杂主题拆开。',
    emphasis: '突出结构、方法、执行路径。'
  },
  {
    key: 'experience',
    label: '经验型',
    description: '适合个人号，用第一人称讲真实过程。',
    emphasis: '强调个人经历、转折和体感。'
  },
  {
    key: 'pitfall',
    label: '避坑型',
    description: '适合转化号，从常见错误切入。',
    emphasis: '突出误区、成本和修正动作。'
  },
  {
    key: 'checklist',
    label: '清单型',
    description: '适合收藏号，用模板和清单制造保存欲。',
    emphasis: '突出步骤清单、模板、可复制素材。'
  },
  {
    key: 'opinion',
    label: '观点型',
    description: '适合涨粉号，用反差观点提高讨论度。',
    emphasis: '强调立场、反常识、讨论引导。'
  },
]

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
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
      .split(/[\n,，]/)
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return []
}

function uniqueStrings(values: string[], max = values.length): string[] {
  return [...new Set(values.map((item) => item.trim()).filter(Boolean))].slice(0, max)
}

function sanitizeAssetUrls(value: unknown): string[] {
  return uniqueStrings(
    normalizeStringArray(value)
      .map((item) => item.trim())
      .filter((item) => /^https?:\/\//i.test(item)),
    9
  )
}

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function writeStorage<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
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

function bigrams(text: string): string[] {
  const normalized = text.replace(/\s+/g, '').trim()
  if (normalized.length < 2) return normalized ? [normalized] : []

  const values: string[] = []
  for (let i = 0; i < normalized.length - 1; i += 1) {
    values.push(normalized.slice(i, i + 2))
  }
  return values
}

function similarityScore(a: string, b: string): number {
  const left = bigrams(a)
  const right = bigrams(b)
  if (!left.length || !right.length) return 0

  const rightSet = new Map<string, number>()
  for (const token of right) {
    rightSet.set(token, (rightSet.get(token) || 0) + 1)
  }

  let overlap = 0
  for (const token of left) {
    const count = rightSet.get(token) || 0
    if (count > 0) {
      overlap += 1
      rightSet.set(token, count - 1)
    }
  }

  return (2 * overlap) / (left.length + right.length)
}

export function getAnglePreset(key: string): MatrixAnglePreset {
  return MATRIX_ANGLE_PRESETS.find((item) => item.key === key) || MATRIX_ANGLE_PRESETS[0]
}

function buildVariantText(variant: MatrixContentVariant): string {
  return [variant.hook, ...variant.body, variant.cta].filter(Boolean).join('\n\n')
}

function toFutureIso(daysOffset: number, slot: string) {
  const now = new Date()
  const next = new Date(now)
  next.setDate(next.getDate() + daysOffset)

  const [hoursRaw, minutesRaw] = slot.split(':')
  const hours = Number(hoursRaw)
  const minutes = Number(minutesRaw)
  if (Number.isInteger(hours) && Number.isInteger(minutes)) {
    next.setHours(hours, minutes, 0, 0)
  } else {
    next.setHours(11 + daysOffset, 30, 0, 0)
  }

  if (next.getTime() <= now.getTime()) {
    next.setHours(next.getHours() + 6)
  }

  return next.toISOString()
}

function createMockVariant(topic: string, angleKey: string, index: number, input: MatrixCampaignInput): MatrixContentVariant {
  const preset = getAnglePreset(angleKey)
  const tone = input.audience || '想稳定出单的小红书创作者'
  const keyword = input.keywordSeed?.trim() || topic
  const titlesByAngle: Record<string, string> = {
    tutorial: `把 ${keyword} 做成可复用流程，我现在只按这 4 步发`,
    experience: `同样写 ${keyword}，我换了讲法后互动真的明显变了`,
    pitfall: `${keyword} 最容易踩的 5 个坑，我已经替你踩完了`,
    checklist: `做 ${keyword} 先别急着发，这份清单先存下来`,
    opinion: `很多人把 ${keyword} 做废，不是努力不够，是方向一开始就错了`,
  }

  const hookByAngle: Record<string, string> = {
    tutorial: `如果你也想把「${topic}」做得更稳定，我建议先别追求花活，先把结构固定下来。`,
    experience: `我之前做「${topic}」的时候，最大的问题不是不会写，而是每次都像重开一遍。`,
    pitfall: `很多人做「${topic}」会觉得没流量，其实常见问题就那几个，而且几乎每次都重复出现。`,
    checklist: `最近有人问我「${topic}」到底要准备什么，我把自己一直在用的清单直接整理出来了。`,
    opinion: `说个可能会被反驳的观点：做「${topic}」最该优化的，往往不是标题，而是切入角度。`,
  }

  const bodyByAngle: Record<string, string[]> = {
    tutorial: [
      '第一步先把目标人群写死，只回答一个具体场景，不要一上来就想覆盖所有人。',
      '第二步把标题、开头和结尾拆成固定模板，这样你每次只需要替换案例和细节。',
      '第三步正文一定要给动作，不要只给观点。用户看完能立刻照着做，收藏率才会起来。',
      '第四步配图不要乱来，封面负责抓停留，内页负责补证据，这样内容才像完整产品。'
    ],
    experience: [
      '以前我总觉得只要内容够多就能起来，后来发现用户根本记不住我到底擅长什么。',
      '我开始把每篇内容都压回一个明确问题，再用真实场景讲一遍，账号的质感会稳定很多。',
      '尤其是开头，少写空话，直接把“谁、在什么场景、为什么会卡住”说清楚，阅读会顺很多。',
      '如果你也在反复重写，不妨先把角度固定，剩下的再慢慢打磨。'
    ],
    pitfall: [
      '第一个坑是标题和正文像两篇内容，点进来以为有答案，结果正文全是铺垫。',
      '第二个坑是每一段都在讲道理，没有截图、案例、清单这类能让人信服的证据。',
      '第三个坑是账号人设不稳，今天像老师，明天像搬运号，用户自然不会持续关注。',
      '第四个坑是同一主题所有号都发一样的稿子，平台和用户都能感觉到机械重复。'
    ],
    checklist: [
      '先准备 1 个明确标题版本，别一边排版一边想标题，不然整篇气质会散掉。',
      '再准备 1 个场景开头、3 个正文要点、1 个互动结尾，这样写稿速度会快很多。',
      '图片部分至少要有 1 张封面和 3 张补充图，封面讲卖点，补充图讲过程和结果。',
      '最后别忘了给每个账号单独配标签组和口吻，同主题也要做出角色差。'
    ],
    opinion: [
      '很多人以为爆不爆取决于标题，其实更底层的问题是内容有没有站在具体人群的视角里。',
      '同一个主题，个人号讲亲历，本地商家号讲场景，清单号讲模板，效果本来就不该一样。',
      '如果你把所有账号都当成分发器，最后只会得到一堆“好像发了很多，但没有资产”的内容。',
      '矩阵真正该做的不是复制，而是分工。每个账号都负责不同的信任任务，才有意义。'
    ]
  }

  const coverByAngle: Record<string, string[]> = {
    tutorial: ['固定流程更稳', '4 步就能开写'],
    experience: ['我改了讲法', '互动真的上来'],
    pitfall: ['这些坑别再踩', '少走很多弯路'],
    checklist: ['先存这份清单', '发前照着过'],
    opinion: ['不是你不努力', '是切法错了'],
  }

  const accountTags = input.accounts[index % Math.max(input.accounts.length, 1)]?.defaultTags || []

  const hashtags = uniqueStrings([
    `#${topic.replace(/\s+/g, '')}`,
    `#${keyword.replace(/\s+/g, '')}`,
    '#小红书运营',
    '#内容矩阵',
    ...accountTags
  ], 6)

  return {
    id: createId('variant'),
    angleKey: preset.key,
    angleLabel: preset.label,
    title: titlesByAngle[preset.key] || `${topic} 的第 ${index + 1} 种写法`,
    hook: hookByAngle[preset.key] || `围绕「${topic}」换一个角度，会更容易被记住。`,
    body: bodyByAngle[preset.key] || bodyByAngle.tutorial,
    hashtags,
    cta: input.callToAction?.trim() || '如果你也在做这类内容，先收藏，评论区我再补一版更细的模板。',
    differenceNote: `${preset.label}版本重点放在 ${preset.emphasis}`,
    personaFit: input.accounts[index % Math.max(input.accounts.length, 1)]?.persona || tone,
    riskLevel: preset.key === 'opinion' ? 'medium' : 'low',
    score: 84 + (index % 9),
    assetPack: {
      coverLines: coverByAngle[preset.key] || coverByAngle.tutorial,
      imagePrompt: `小红书图文封面，主题「${topic}」，风格 ${input.accounts[index % Math.max(input.accounts.length, 1)]?.imageStyle || '干净杂志感'}，大标题突出 ${preset.label}，暖白底，醒目主标题，适合收藏型图文。`,
      galleryPrompts: [
        `信息卡片风，展示 ${topic} 的核心步骤与误区对比，适合图文第 2 张`,
        `真实工作台 / 生活场景，强调 ${preset.label} 的使用场景和结果感`,
        `总结页风格，突出 CTA 与行动清单，适合最后一张图`
      ]
    }
  }
}

function buildMockCampaign(input: MatrixCampaignInput): MatrixCampaignResult {
  const angleKeys = input.angleKeys.length > 0
    ? input.angleKeys
    : MATRIX_ANGLE_PRESETS.map((item) => item.key)

  const variants = Array.from({ length: Math.max(1, input.variantCount) }, (_, index) => {
    const angleKey = angleKeys[index % angleKeys.length]
    return createMockVariant(input.topic, angleKey, index, input)
  })

  return {
    source: 'mock',
    summary: `已围绕「${input.topic}」生成 ${variants.length} 个差异化版本，分别覆盖方法、经验、避坑、清单和观点切口。`,
    variants,
  }
}

async function postMatrixPrompt(systemPrompt: string, userPrompt: string) {
  if (!API_BASE) {
    throw new Error('backend_not_configured')
  }

  const response = await fetch(`${API_BASE}/api/ai/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ systemPrompt, userPrompt }),
  })

  if (!response.ok) {
    throw new Error(`AI request failed: ${response.status}`)
  }

  return response.json()
}

function normalizeAssetPack(value: any): MatrixAssetPack {
  return {
    coverLines: uniqueStrings(normalizeStringArray(value?.coverLines), 3),
    imagePrompt: normalizeString(value?.imagePrompt),
    galleryPrompts: uniqueStrings(normalizeStringArray(value?.galleryPrompts), 4),
  }
}

function normalizeVariant(value: any, index: number, input: MatrixCampaignInput): MatrixContentVariant | null {
  const anglePreset = getAnglePreset(normalizeString(value?.angleKey) || input.angleKeys[index % input.angleKeys.length] || MATRIX_ANGLE_PRESETS[index % MATRIX_ANGLE_PRESETS.length].key)
  const title = normalizeString(value?.title)
  const hook = normalizeString(value?.hook)
  const body = uniqueStrings(normalizeStringArray(value?.body), 6)

  if (!title || !hook || body.length === 0) {
    return null
  }

  const assetPack = normalizeAssetPack(value?.assetPack)
  const safeAssetPack: MatrixAssetPack = {
    coverLines: assetPack.coverLines.length > 0 ? assetPack.coverLines : [`${anglePreset.label}版本`, '替换成你的结果'],
    imagePrompt: assetPack.imagePrompt || `小红书图文封面，主题 ${input.topic}，风格简洁杂志感，适合 ${anglePreset.label} 内容。`,
    galleryPrompts: assetPack.galleryPrompts.length > 0 ? assetPack.galleryPrompts : [
      `围绕 ${input.topic} 的场景图`,
      `${input.topic} 的步骤信息图`,
      `${input.topic} 的结果展示图`
    ]
  }

  return {
    id: createId('variant'),
    angleKey: anglePreset.key,
    angleLabel: normalizeString(value?.angleLabel) || anglePreset.label,
    title,
    hook,
    body,
    hashtags: uniqueStrings(normalizeStringArray(value?.hashtags), 6),
    cta: normalizeString(value?.cta) || input.callToAction?.trim() || '收藏这篇，后面继续补模板。',
    differenceNote: normalizeString(value?.differenceNote) || anglePreset.emphasis,
    personaFit: normalizeString(value?.personaFit) || input.accounts[index % Math.max(input.accounts.length, 1)]?.persona || input.audience,
    riskLevel: ['low', 'medium', 'high'].includes(normalizeString(value?.riskLevel))
      ? normalizeString(value?.riskLevel) as MatrixRiskLevel
      : 'low',
    score: Math.min(99, Math.max(70, Number(value?.score || 82))),
    assetPack: safeAssetPack,
  }
}

export function createMatrixAccountDraft(overrides: Partial<MatrixAccountProfile> = {}): MatrixAccountProfile {
  return {
    id: overrides.id || createId('account'),
    name: overrides.name || '',
    handle: overrides.handle || '',
    persona: overrides.persona || '',
    niche: overrides.niche || '',
    voice: overrides.voice || '',
    imageStyle: overrides.imageStyle || '暖白杂志感',
    dailyLimit: overrides.dailyLimit || 1,
    defaultTags: overrides.defaultTags || [],
    preferredSlots: overrides.preferredSlots || ['11:30', '20:30'],
    requiresReview: overrides.requiresReview ?? true,
    active: overrides.active ?? true,
  }
}

export function createDefaultMatrixAccounts(): MatrixAccountProfile[] {
  return [
    createMatrixAccountDraft({
      name: '方法论主号',
      handle: '@content.playbook',
      persona: '像一个靠谱操盘手，讲流程、框架和执行顺序',
      niche: '内容增长 / AI 提效',
      voice: '利落、稳、像在复盘实战',
      imageStyle: '奶油白 + 纸感排版',
      defaultTags: ['内容方法论', 'AI创作', '运营复盘'],
      preferredSlots: ['10:30', '20:00'],
      requiresReview: true,
    }),
    createMatrixAccountDraft({
      name: '个人经历号',
      handle: '@solo.creator.lab',
      persona: '第一人称分享，像真实创作者在讲自己踩坑和调整',
      niche: '个人品牌 / 创作者效率',
      voice: '真诚、克制、像聊天',
      imageStyle: '自然光照片 + 手写标题',
      defaultTags: ['个人品牌', '创作者日常', '效率系统'],
      preferredSlots: ['12:00', '21:00'],
      requiresReview: true,
    }),
    createMatrixAccountDraft({
      name: '清单资料号',
      handle: '@template.dispatch',
      persona: '专门发模板、清单和即拿即用的内容资料',
      niche: '模板清单 / 收藏型内容',
      voice: '高密度、直接给结果',
      imageStyle: '高对比信息卡片',
      defaultTags: ['模板分享', '资料库', '内容清单'],
      preferredSlots: ['09:30', '19:30'],
      requiresReview: false,
    }),
  ]
}

export function loadMatrixAccounts(): MatrixAccountProfile[] {
  const stored = readStorage<MatrixAccountProfile[]>(MATRIX_ACCOUNTS_STORAGE_KEY, [])
  if (stored.length > 0) {
    return stored.map((item) => createMatrixAccountDraft(item))
  }
  return createDefaultMatrixAccounts()
}

export function saveMatrixAccounts(accounts: MatrixAccountProfile[]) {
  writeStorage(MATRIX_ACCOUNTS_STORAGE_KEY, accounts)
}

export function upsertMatrixAccount(accounts: MatrixAccountProfile[], nextAccount: MatrixAccountProfile): MatrixAccountProfile[] {
  const exists = accounts.some((item) => item.id === nextAccount.id)
  return exists
    ? accounts.map((item) => item.id === nextAccount.id ? nextAccount : item)
    : [nextAccount, ...accounts]
}

export function removeMatrixAccount(accounts: MatrixAccountProfile[], accountId: string): MatrixAccountProfile[] {
  return accounts.filter((item) => item.id !== accountId)
}

export function loadMatrixPlans(): MatrixDispatchPlan[] {
  const rawPlans = readStorage<any[]>(MATRIX_PLANS_STORAGE_KEY, [])
  if (!Array.isArray(rawPlans)) return []

  return rawPlans
    .map((item) => {
      const id = normalizeString(item?.id)
      const accountId = normalizeString(item?.accountId)
      const variantId = normalizeString(item?.variantId)
      const plannedAt = normalizeString(item?.plannedAt)
      if (!id || !accountId || !variantId || !plannedAt) return null

      return {
        id,
        accountId,
        variantId,
        channel: 'xiaohongshu' as const,
        plannedAt,
        note: normalizeString(item?.note),
        status: item?.status === 'queued' ? 'queued' : 'draft',
        reviewRequired: Boolean(item?.reviewRequired),
        assetUrls: sanitizeAssetUrls(item?.assetUrls),
      }
    })
    .filter((item): item is MatrixDispatchPlan => Boolean(item))
}

export function saveMatrixPlans(plans: MatrixDispatchPlan[]) {
  writeStorage(MATRIX_PLANS_STORAGE_KEY, plans)
}

export function loadMatrixVariants(): MatrixContentVariant[] {
  return readStorage<MatrixContentVariant[]>(MATRIX_VARIANTS_STORAGE_KEY, [])
}

export function saveMatrixVariants(variants: MatrixContentVariant[]) {
  writeStorage(MATRIX_VARIANTS_STORAGE_KEY, variants)
}

export function loadMatrixCampaignDraft<T extends Record<string, any>>(fallback: T): T {
  return readStorage<T>(MATRIX_CAMPAIGN_DRAFT_STORAGE_KEY, fallback)
}

export function saveMatrixCampaignDraft<T extends Record<string, any>>(value: T) {
  writeStorage(MATRIX_CAMPAIGN_DRAFT_STORAGE_KEY, value)
}

export async function generateMatrixCampaign(input: MatrixCampaignInput): Promise<MatrixCampaignResult> {
  const safeInput: MatrixCampaignInput = {
    ...input,
    variantCount: Math.min(Math.max(input.variantCount, 1), 8),
    angleKeys: input.angleKeys.length > 0
      ? uniqueStrings(input.angleKeys)
      : MATRIX_ANGLE_PRESETS.map((item) => item.key),
  }

  const accountSummary = safeInput.accounts
    .filter((item) => item.active)
    .map((account) => `${account.handle || account.name}｜${account.persona}｜${account.niche}｜默认标签:${account.defaultTags.join('/') || '无'}｜图片风格:${account.imageStyle}`)
    .join('\n')

  const angleSummary = safeInput.angleKeys
    .map((item) => {
      const preset = getAnglePreset(item)
      return `${preset.key}:${preset.label}(${preset.emphasis})`
    })
    .join('\n')

  const systemPrompt = `你是“小红书矩阵内容总编”。
请围绕用户给出的一个主题，输出多份“同主题但明显不同”的小红书图文稿。

必须严格返回 JSON 对象，不要输出任何额外说明。格式如下：
{
  "summary": "40-80字，总结本次矩阵策略",
  "variants": [
    {
      "angleKey": "tutorial",
      "angleLabel": "教程型",
      "title": "标题",
      "hook": "开头钩子",
      "body": ["段落1", "段落2", "段落3", "段落4"],
      "hashtags": ["#标签1", "#标签2", "#标签3"],
      "cta": "结尾互动引导",
      "differenceNote": "这一版和其他版本最大的区别",
      "personaFit": "更适合哪个账号人设",
      "riskLevel": "low",
      "score": 88,
      "assetPack": {
        "coverLines": ["封面字1", "封面字2"],
        "imagePrompt": "整套图文封面的主提示词",
        "galleryPrompts": ["配图提示词1", "配图提示词2", "配图提示词3"]
      }
    }
  ]
}

要求：
1. 输出 ${safeInput.variantCount} 份不同版本。
2. 版本必须覆盖用户指定角度，且每一版的标题、开头、案例和 CTA 都要明显不同。
3. 文案适合小红书图文，正文每段 1-3 句，整体真实、有人的口气，不要像模板机翻。
4. 不要把同一段话改几个词重复输出。
5. 标签要和正文贴合，不要只给大词。
6. 封面字要短，适合大标题。
7. 图片提示词要具体到视觉风格、构图和场景。
8. riskLevel 仅允许 low / medium / high。
9. 不要输出 markdown 代码块。`

  const userPrompt = `主题：${safeInput.topic}
目标受众：${safeInput.audience}
目标：${safeInput.goal}
关键词补充：${safeInput.keywordSeed || '无'}
CTA：${safeInput.callToAction || '收藏、评论或私信领取模板'}
需要的角度：
${angleSummary}

账号矩阵画像：
${accountSummary || '暂无账号画像，请按通用小红书创作者矩阵输出'}

请直接输出 JSON。`

  try {
    const response = await postMatrixPrompt(systemPrompt, userPrompt)
    const rawText = response?.choices?.[0]?.message?.content || response?.content || response?.data || ''
    const parsed = extractJsonObject(String(rawText))
    const rawVariants = Array.isArray(parsed?.variants) ? parsed.variants : []
    const variants = rawVariants
      .map((item: any, index: number) => normalizeVariant(item, index, safeInput))
      .filter((item: MatrixContentVariant | null): item is MatrixContentVariant => Boolean(item))

    if (variants.length > 0) {
      return {
        source: 'ai',
        summary: normalizeString(parsed?.summary) || `已为「${safeInput.topic}」生成 ${variants.length} 个矩阵版本。`,
        variants: variants.slice(0, safeInput.variantCount),
      }
    }

    if (!ALLOW_MOCK_FALLBACK) {
      throw new Error('AI response format invalid')
    }
  } catch (error) {
    if (!ALLOW_MOCK_FALLBACK) {
      throw error
    }
  }

  return buildMockCampaign(safeInput)
}

export function createRecommendedPlans(
  variants: MatrixContentVariant[],
  accounts: MatrixAccountProfile[],
  existingPlans: MatrixDispatchPlan[] = []
): MatrixDispatchPlan[] {
  const activeAccounts = accounts.filter((item) => item.active)
  if (variants.length === 0 || activeAccounts.length === 0) return existingPlans

  const nextPlans = [...existingPlans]
  let offsetDays = 0

  for (let index = 0; index < variants.length; index += 1) {
    const variant = variants[index]
    const account = activeAccounts[index % activeAccounts.length]
    const slot = account.preferredSlots[index % Math.max(account.preferredSlots.length, 1)] || '11:30'

    nextPlans.push({
      id: createId('plan'),
      accountId: account.id,
      variantId: variant.id,
      channel: 'xiaohongshu',
      plannedAt: toFutureIso(offsetDays, slot),
      note: `${account.name} 使用 ${variant.angleLabel} 版本`,
      status: 'draft',
      reviewRequired: account.requiresReview,
      assetUrls: [],
    })

    if ((index + 1) % activeAccounts.length === 0) {
      offsetDays += 1
    }
  }

  return nextPlans
}

export function validateMatrixSetup(
  accounts: MatrixAccountProfile[],
  variants: MatrixContentVariant[],
  plans: MatrixDispatchPlan[]
): MatrixValidationIssue[] {
  const issues: MatrixValidationIssue[] = []
  const activeAccounts = accounts.filter((item) => item.active)

  if (activeAccounts.length === 0) {
    issues.push({
      id: createId('issue'),
      level: 'error',
      message: '至少要启用 1 个账号，才能做矩阵分发。'
    })
  }

  if (variants.length === 0) {
    issues.push({
      id: createId('issue'),
      level: 'error',
      message: '先生成至少 1 个内容版本，再去排分发。'
    })
  }

  if (plans.length === 0) {
    issues.push({
      id: createId('issue'),
      level: 'warning',
      message: '当前还没有分发计划。你可以先自动分配，再微调账号和时间。'
    })
  } else {
    const plansWithImages = plans.filter((plan) => sanitizeAssetUrls(plan.assetUrls).length > 0).length
    if (plansWithImages === 0) {
      issues.push({
        id: createId('issue'),
        level: 'warning',
        message: '当前计划都没有绑定图片链接，入队后会只传图片提示词。'
      })
    }
  }

  for (let i = 0; i < variants.length; i += 1) {
    for (let j = i + 1; j < variants.length; j += 1) {
      const titleSimilarity = similarityScore(variants[i].title, variants[j].title)
      const bodySimilarity = similarityScore(buildVariantText(variants[i]), buildVariantText(variants[j]))

      if (titleSimilarity >= 0.62) {
        issues.push({
          id: createId('issue'),
          level: 'warning',
          message: `《${variants[i].title}》和《${variants[j].title}》标题太像了，建议再拉开切口。`
        })
      }

      if (bodySimilarity >= 0.72) {
        issues.push({
          id: createId('issue'),
          level: 'warning',
          message: `${variants[i].angleLabel} 和 ${variants[j].angleLabel} 正文重合度偏高，容易像批量改写。`
        })
      }
    }
  }

  const accountMap = new Map(accounts.map((item) => [item.id, item]))
  const variantUsage = new Map<string, number>()
  const dayCounter = new Map<string, { accountId: string; count: number }>()
  const reviewWarningAccounts = new Set<string>()

  for (const plan of plans) {
    const account = accountMap.get(plan.accountId)
    if (!account) {
      issues.push({
        id: createId('issue'),
        level: 'error',
        message: '分发计划里有账号不存在，请重新选择账号。'
      })
      continue
    }

    const dayKey = `${plan.accountId}||${plan.plannedAt.slice(0, 10)}`
    const nextCount = (dayCounter.get(dayKey)?.count || 0) + 1
    dayCounter.set(dayKey, { accountId: plan.accountId, count: nextCount })
    variantUsage.set(plan.variantId, (variantUsage.get(plan.variantId) || 0) + 1)

    if (
      plan.reviewRequired
      && Date.parse(plan.plannedAt) > Date.now() + 5 * 60 * 1000
      && !reviewWarningAccounts.has(plan.accountId)
    ) {
      reviewWarningAccounts.add(plan.accountId)
      issues.push({
        id: createId('issue'),
        level: 'warning',
        message: `${account.name} 标记为先审后发，未来时间计划只会入队，不会自动到点发出。`
      })
    }
  }

  for (const [, value] of dayCounter.entries()) {
    const account = accountMap.get(value.accountId)
    if (account && value.count > account.dailyLimit) {
      issues.push({
        id: createId('issue'),
        level: 'error',
        message: `${account.name} 在同一天排了 ${value.count} 条，超过了日上限 ${account.dailyLimit}。`
      })
    }
  }

  for (const [variantId, count] of variantUsage.entries()) {
    if (count > 1) {
      const variant = variants.find((item) => item.id === variantId)
      issues.push({
        id: createId('issue'),
        level: 'warning',
        message: `${variant?.angleLabel || '某个'}版本被安排到 ${count} 个账号，建议至少换标题和开头后再复用。`
      })
    }
  }

  return issues
}

export function serializeVariant(variant: MatrixContentVariant): string {
  return [
    variant.title,
    '',
    variant.hook,
    '',
    ...variant.body,
    '',
    variant.cta,
    '',
    variant.hashtags.join(' ')
  ].filter(Boolean).join('\n')
}

export function buildMatrixDispatchPayload(
  topic: string,
  account: MatrixAccountProfile,
  variant: MatrixContentVariant,
  plan: MatrixDispatchPlan
) {
  const fullText = serializeVariant(variant)
  const assetUrls = sanitizeAssetUrls(plan.assetUrls)

  return {
    dispatchMode: 'provider-chain',
    workflowHint: 'matrix-publisher',
    publishText: `${variant.title}\n${variant.hook}`,
    contentSummary: fullText,
    selectedPlatforms: ['xiaohongshu'],
    plannedAt: plan.plannedAt,
    reviewRequired: plan.reviewRequired,
    accountProfile: {
      id: account.id,
      name: account.name,
      handle: account.handle,
      persona: account.persona,
      niche: account.niche,
      voice: account.voice,
      imageStyle: account.imageStyle,
      preferredSlots: account.preferredSlots,
      dailyLimit: account.dailyLimit,
      defaultTags: account.defaultTags,
      requiresReview: account.requiresReview,
    },
    variant: {
      id: variant.id,
      angleKey: variant.angleKey,
      angleLabel: variant.angleLabel,
      title: variant.title,
      hook: variant.hook,
      body: variant.body,
      hashtags: variant.hashtags,
      cta: variant.cta,
      differenceNote: variant.differenceNote,
      personaFit: variant.personaFit,
      riskLevel: variant.riskLevel,
      score: variant.score,
    },
    assetPack: variant.assetPack,
    mediaAssets: {
      imageUrls: assetUrls,
      imageCount: assetUrls.length,
      source: assetUrls.length > 0 ? 'url' : 'prompt',
    },
    xiaohongshu: {
      accountHandle: account.handle,
      title: variant.title,
      desc: fullText,
      hashtags: variant.hashtags,
      imageUrls: assetUrls,
      coverLines: variant.assetPack.coverLines,
      imagePrompt: variant.assetPack.imagePrompt,
      galleryPrompts: variant.assetPack.galleryPrompts,
      topic,
    },
    matrixPlan: {
      ...plan,
      assetUrls,
    },
  }
}
