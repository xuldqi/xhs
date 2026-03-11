import type { TrendSignal } from './multiPlatformContentService'

export type StudioModeKey = 'image' | 'video' | 'article' | 'audio'

export interface StudioModeMeta {
  label: string
  description: string
  premium: boolean
  icon: string
}

export interface FactoryStudioInput {
  topic: string
  audience: string
  goal: string
  tone: string
  offer?: string
  callToAction?: string
  trendSignal?: TrendSignal | null
  premium: boolean
  languageMode: 'zh' | 'bilingual'
  modes: StudioModeKey[]
}

export interface StudioSection {
  title: string
  items: string[]
}

export interface StudioModePack {
  key: StudioModeKey
  label: string
  description: string
  premiumOnly: boolean
  highlight: string
  summary: string
  bullets: string[]
  sections: StudioSection[]
  toolLinks: Array<{ label: string; path: string }>
}

export interface FactoryStudioPack {
  source: 'ai' | 'mock'
  summary: string
  modes: StudioModePack[]
}

const ALLOW_MOCK_FALLBACK = import.meta.env.VITE_ALLOW_MOCK_FALLBACK === 'true'

export const STUDIO_MODE_META: Record<StudioModeKey, StudioModeMeta> = {
  image: {
    label: '图片工位',
    description: '封面图、海报、配图、图生图处理',
    premium: false,
    icon: '◧'
  },
  video: {
    label: '视频工位',
    description: '短视频脚本、分镜、镜头提示词',
    premium: true,
    icon: '▶'
  },
  article: {
    label: '长文工位',
    description: 'SEO 标题、结构化大纲、导读段',
    premium: false,
    icon: '¶'
  },
  audio: {
    label: '音频工位',
    description: '口播风格、BGM 灵感、音频栏目包装',
    premium: true,
    icon: '♪'
  }
}

const API_BASE = import.meta.env.VITE_BACKEND_URL || ''

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeString(item)).filter(Boolean)
  }

  if (typeof value === 'string') {
    return value.split(/\n+/).map((item) => item.trim()).filter(Boolean)
  }

  return []
}

function uniqueStrings(values: string[], max = values.length): string[] {
  return [...new Set(values.map((item) => item.trim()).filter(Boolean))].slice(0, max)
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

async function postStudioPrompt(systemPrompt: string, userPrompt: string) {
  if (!API_BASE) {
    throw new Error('backend_not_configured')
  }

  const response = await fetch(`${API_BASE}/api/ai/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ systemPrompt, userPrompt })
  })

  if (!response.ok) {
    throw new Error(`AI request failed: ${response.status}`)
  }

  return response.json()
}

function buildImageFallback(input: FactoryStudioInput): StudioModePack {
  const trendLine = input.trendSignal?.label ? `结合「${input.trendSignal.label}」做视觉切口。` : '强调结果感与收藏感。'
  return {
    key: 'image',
    label: STUDIO_MODE_META.image.label,
    description: STUDIO_MODE_META.image.description,
    premiumOnly: false,
    highlight: `围绕「${input.topic}」输出 3 套封面 / 配图提示词`,
    summary: `先给视觉一个明确主张：让用户在 1 秒内知道这是关于 ${input.topic} 的结果型内容。`,
    bullets: [
      `封面主标题：${input.topic}还能这样做`,
      `副标题强调受众：专门写给${input.audience}`,
      trendLine
    ],
    sections: [
      {
        title: '文生图提示词',
        items: [
          `小红书封面风格，主题是${input.topic}，突出结果感、品牌感红白配色、大标题留白`,
          `信息图海报风，展示${input.topic}的3个步骤，适合社媒传播和收藏`,
          `专业工作台场景，体现 AI 内容工厂、批量生产、效率提升`
        ]
      },
      {
        title: '图生图 / 处理建议',
        items: [
          '先去背景，再叠加大字标题和高对比色块',
          '如果素材普通，可以再做漫画风或信息图风格化',
          '优先输出 1:1 封面和 9:16 视频首帧两种尺寸'
        ]
      }
    ],
    toolLinks: [
      { label: '打开图片背景移除', path: '/tools/background-remover' },
      { label: '打开漫画风生成器', path: '/tools/manga-generator' }
    ]
  }
}

function buildVideoFallback(input: FactoryStudioInput): StudioModePack {
  const trendLine = input.trendSignal?.angle || '结果先出镜，再给方法。'
  return {
    key: 'video',
    label: STUDIO_MODE_META.video.label,
    description: STUDIO_MODE_META.video.description,
    premiumOnly: true,
    highlight: `15 秒短视频脚本：把「${input.topic}」拍成一条能停留的内容`,
    summary: `视频重点不是讲全，而是先让人停下来，再把下一步动作讲清楚。`,
    bullets: [
      `开场钩子：为什么你做${input.topic}还是没结果？`,
      `中段结构：问题 → 误区 → 一套方法 → CTA`,
      `镜头策略：近景说结论，切 B-roll 证明过程`
    ],
    sections: [
      {
        title: '分镜脚本',
        items: [
          '镜头 1（0-3秒）：直接抛问题，字幕加粗突出结果差异',
          '镜头 2（3-9秒）：拆掉一个常见误区，给一个反常识观点',
          '镜头 3（9-15秒）：给可执行动作，并引导评论区领取模板'
        ]
      },
      {
        title: '镜头提示词',
        items: [
          `创作者面对镜头讲解${input.topic}，节奏快，字幕醒目，专业工作台背景`,
          `屏幕录制 / 白板 / 文档切换，体现系统化流程感`,
          '结尾固定镜头给 CTA，停留 2 秒方便用户看清指令'
        ]
      }
    ],
    toolLinks: []
  }
}

function buildArticleFallback(input: FactoryStudioInput): StudioModePack {
  return {
    key: 'article',
    label: STUDIO_MODE_META.article.label,
    description: STUDIO_MODE_META.article.description,
    premiumOnly: false,
    highlight: `SEO 长文骨架：把「${input.topic}」写成可搜索、可转化的文章`,
    summary: `长文不要只是拉长版文案，而要围绕搜索词、结构和转化节点来设计。`,
    bullets: [
      `SEO 标题建议：${input.topic}怎么做成一套能持续产出的内容系统`,
      'Meta 描述建议：强调方法、步骤和可复制结果',
      `结尾 CTA：${input.callToAction || '收藏本文并领取模板'}`
    ],
    sections: [
      {
        title: '文章大纲',
        items: [
          '导语：为什么这个话题现在值得做',
          '第一部分：用户常见误区与低效做法',
          '第二部分：可复用的系统化流程',
          '第三部分：案例拆解与实际落地动作',
          '结尾：FAQ + CTA + 相关关键词布局'
        ]
      },
      {
        title: '关键词布局',
        items: [
          `${input.topic}`,
          `${input.topic} 方法`,
          `${input.topic} 模板`,
          `${input.topic} 变现`
        ]
      }
    ],
    toolLinks: [
      { label: '打开 SEO 关键词工具', path: '/tools/keyword-tool' }
    ]
  }
}

function buildAudioFallback(input: FactoryStudioInput): StudioModePack {
  return {
    key: 'audio',
    label: STUDIO_MODE_META.audio.label,
    description: STUDIO_MODE_META.audio.description,
    premiumOnly: true,
    highlight: `音频包装：把「${input.topic}」做成可复用的口播 / 栏目音轨`,
    summary: '音频层的价值在于增强节奏感、记忆点和系列化感，而不是单纯配个音乐。',
    bullets: [
      '口播声线：可信、稳、有结论感',
      'BGM 方向：轻快电子 / 都市 Lo-fi / 极简商业感',
      '固定口号：每条内容结尾统一一句品牌收束'
    ],
    sections: [
      {
        title: 'BGM 灵感',
        items: [
          '极简电子感，适合效率和增长主题',
          '高质感 Lo-fi，适合知识博主口播',
          '轻鼓点商业感，适合服务成交型内容'
        ]
      },
      {
        title: '音频结构',
        items: [
          '前 1 秒给标志性音效，建立栏目记忆',
          '正文保持低干扰伴奏，让信息更清晰',
          `结尾用 CTA 收束：${input.callToAction || '评论区领取完整模板'}`
        ]
      }
    ],
    toolLinks: []
  }
}

function buildLockedMode(key: StudioModeKey): StudioModePack {
  const meta = STUDIO_MODE_META[key]
  return {
    key,
    label: meta.label,
    description: meta.description,
    premiumOnly: meta.premium,
    highlight: `${meta.label}专业版能力预览`,
    summary: `升级后可解锁 ${meta.label} 的完整生成内容。`,
    bullets: ['你会拿到更完整的结构化资产，而不是一条裸 prompt。'],
    sections: [
      {
        title: '解锁后包含',
        items: key === 'video'
          ? ['短视频脚本', '分镜结构', '镜头提示词']
          : ['BGM 灵感', '口播风格', '栏目收尾模板']
      }
    ],
    toolLinks: []
  }
}

function buildMockPack(input: FactoryStudioInput): FactoryStudioPack {
  const requestedModes = input.modes
  const accessibleModes = requestedModes
    .filter((key) => input.premium || !STUDIO_MODE_META[key].premium)
    .map((key) => {
      if (key === 'image') return buildImageFallback(input)
      if (key === 'video') return buildVideoFallback(input)
      if (key === 'article') return buildArticleFallback(input)
      return buildAudioFallback(input)
    })

  const lockedModes = requestedModes
    .filter((key) => STUDIO_MODE_META[key].premium && !input.premium)
    .map((key) => buildLockedMode(key))

  return {
    source: 'mock',
    summary: `围绕「${input.topic}」输出多模态资产，让同一个主题可以继续扩成图、视频、长文和音频。`,
    modes: [...accessibleModes, ...lockedModes]
  }
}

function buildSections(raw: any): StudioSection[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((item) => ({
      title: normalizeString(item?.title),
      items: uniqueStrings(normalizeArray(item?.items), 6)
    }))
    .filter((section) => section.title && section.items.length > 0)
}

function normalizeModePack(key: StudioModeKey, payload: any, input: FactoryStudioInput): StudioModePack {
  const meta = STUDIO_MODE_META[key]
  const fallback = key === 'image'
    ? buildImageFallback(input)
    : key === 'video'
      ? buildVideoFallback(input)
      : key === 'article'
        ? buildArticleFallback(input)
        : buildAudioFallback(input)

  return {
    key,
    label: meta.label,
    description: meta.description,
    premiumOnly: meta.premium,
    highlight: normalizeString(payload?.highlight) || fallback.highlight,
    summary: normalizeString(payload?.summary) || fallback.summary,
    bullets: uniqueStrings(normalizeArray(payload?.bullets), 6).length > 0
      ? uniqueStrings(normalizeArray(payload?.bullets), 6)
      : fallback.bullets,
    sections: buildSections(payload?.sections).length > 0 ? buildSections(payload?.sections) : fallback.sections,
    toolLinks: fallback.toolLinks
  }
}

export async function generateFactoryStudioPack(input: FactoryStudioInput): Promise<FactoryStudioPack> {
  try {
    const accessibleModes = input.modes.filter((key) => input.premium || !STUDIO_MODE_META[key].premium)
    if (accessibleModes.length === 0) {
      return buildMockPack(input)
    }

    const systemPrompt = `你是一个多模态内容工厂总监。请围绕同一个主题，为不同制作工位输出结构化资产包。
必须严格返回 JSON 对象，不要包含其他说明，格式如下：
{
  "summary": "30-60字总结",
  "modes": {
    "image": {
      "highlight": "",
      "summary": "",
      "bullets": ["", "", ""],
      "sections": [{ "title": "", "items": ["", ""] }]
    },
    "video": {
      "highlight": "",
      "summary": "",
      "bullets": ["", "", ""],
      "sections": [{ "title": "", "items": ["", ""] }]
    },
    "article": {
      "highlight": "",
      "summary": "",
      "bullets": ["", "", ""],
      "sections": [{ "title": "", "items": ["", ""] }]
    },
    "audio": {
      "highlight": "",
      "summary": "",
      "bullets": ["", "", ""],
      "sections": [{ "title": "", "items": ["", ""] }]
    }
  }
}
要求：
1. 只输出用户请求的 modes。
2. image 侧重点是封面图、海报、图生图处理建议。
3. video 侧重点是短视频脚本、分镜和镜头提示词。
4. article 侧重点是 SEO 标题、文章结构、关键词布局。
5. audio 侧重点是口播风格、BGM 灵感、栏目音频包装。
6. 每个 mode 的 bullets 控制在 3-5 条，sections 不超过 3 组。
7. 不能输出 Markdown 代码块。`

    const userPrompt = `主题：${input.topic}
目标受众：${input.audience}
商业目标：${input.goal}
语气风格：${input.tone}
产品 / 服务：${input.offer || '未提供'}
CTA：${input.callToAction || '收藏并评论领取模板'}
趋势上下文：${input.trendSignal ? `${input.trendSignal.label}｜${input.trendSignal.angle}` : '无'}
语言模式：${input.languageMode}
套餐：${input.premium ? '专业版' : '试用版'}
需要输出的工位：${accessibleModes.join('、')}
请直接输出 JSON。`

    const response = await postStudioPrompt(systemPrompt, userPrompt)
    const rawText = response?.choices?.[0]?.message?.content || response?.content || response?.data || ''
    const parsed = extractJsonObject(rawText)
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('AI 返回格式异常')
    }

    const modesPayload = parsed.modes || {}
    const accessiblePacks = accessibleModes.map((key) => normalizeModePack(key, modesPayload[key] || {}, input))
    const lockedModes = input.modes
      .filter((key) => STUDIO_MODE_META[key].premium && !input.premium)
      .map((key) => buildLockedMode(key))

    return {
      source: 'ai',
      summary: normalizeString(parsed.summary) || `围绕「${input.topic}」输出可继续制作的多模态资产包。`,
      modes: [...accessiblePacks, ...lockedModes]
    }
  } catch (error) {
    if (ALLOW_MOCK_FALLBACK) {
      console.warn('generateFactoryStudioPack failed, fallback to mock pack:', error)
      return buildMockPack(input)
    }

    console.error('generateFactoryStudioPack failed:', error)
    const reason = error instanceof Error ? error.message : 'unknown_error'
    throw new Error(`五模态工作台生成失败（未启用演示兜底）：${reason}`)
  }
}
