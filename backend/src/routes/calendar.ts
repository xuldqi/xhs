import { Router, Request, Response } from 'express'
import { createClient } from '@supabase/supabase-js'
import { AIService } from '../services/aiService'

export const calendarRouter = Router()

let aiService: AIService | null = null
let supabase: ReturnType<typeof createClient> | null = null

const getAIService = () => {
  if (!aiService) aiService = new AIService()
  return aiService
}

function getSupabase() {
  if (!supabase) {
    const url = process.env.SUPABASE_URL || ''
    const key = process.env.SUPABASE_SERVICE_KEY || ''
    if (!url || !key) throw new Error('Supabase 配置缺失')
    supabase = createClient(url, key)
  }
  return supabase
}

interface CalendarGenerateRequest {
  daysCount: 7 | 30
  positioning: string
  goal: string
  styleKeywords?: string[]
  referenceNotes?: string
  brandVoice?: {
    style?: string
    keywords?: string[]
    forbiddenWords?: string[]
    emojiList?: string[]
  }
  userId?: string
}

function buildCalendarPrompt(params: CalendarGenerateRequest): { system: string; user: string } {
  const { daysCount, positioning, goal, styleKeywords = [], referenceNotes = '', brandVoice } = params
  const styleStr = styleKeywords.length ? styleKeywords.join('、') : '自然亲和'
  const refStr = referenceNotes ? `\n参考爆款笔记摘要（可借鉴其风格和结构）：\n${referenceNotes}` : ''
  const voiceRules = brandVoice ? `
品牌声约束（必须遵守）：
- 风格：${brandVoice.style || '自然'}
- 常用关键词：${(brandVoice.keywords || []).join('、') || '无'}
- 禁词（绝对不要使用）：${(brandVoice.forbiddenWords || []).join('、') || '无'}
- 常用 emoji：${(brandVoice.emojiList || []).join(' ') || '无'}` : ''

  const systemPrompt = `你是小红书内容规划专家，擅长为创作者生成高质量的内容日历。
输出必须为纯 JSON，不要包含任何其他文字、markdown 或解释。
格式严格为：{"days":[{"date":"YYYY-MM-DD","items":[...]},...]}

每个 item 结构：{"id":"唯一id","title":"标题/钩子","outline":"正文大纲","tags":["标签1","标签2"],"type":"image|video|carousel|live_preview","suggestedTime":"HH:mm"}
- type 可选：image(图文)、video(短视频)、carousel(轮播)、live_preview(直播预告)
- 每天 1-3 条建议，标签需为小红书热门话题格式
- 内容类型必须多样化：同一周内图文(image)、短视频(video)、轮播(carousel)、直播预告(live_preview) 需均衡分布，避免单一类型
- suggestedTime 必填，基于平台高峰期智能分配：
  - 午间高峰：12:00、12:30、13:00、14:00（上班族午休）
  - 晚间高峰：19:00、20:00、21:00、22:00（下班后刷手机）
  - 同一天多条内容：间隔至少 2 小时，避免集中发布
  - 图文/短视频可混用午间和晚间；直播预告优先晚间`
  const userPrompt = `请为小红书创作者生成 ${daysCount} 天的内容日历。

账号定位：${positioning}
目标：${goal}
风格关键词：${styleStr}${refStr}${voiceRules}

从明天开始，生成 ${daysCount} 天的日历。每天 1-3 条内容建议。
直接返回 JSON，格式：{"days":[{"date":"YYYY-MM-DD","items":[{"id":"uuid","title":"","outline":"","tags":[],"type":"","suggestedTime":""}]}]}`

  return { system: systemPrompt, user: userPrompt }
}

/** 平台高峰期时间池（小红书用户活跃时段） */
const PEAK_HOURS = ['12:00', '12:30', '13:00', '14:00', '19:00', '20:00', '21:00', '22:00']

function parseCalendarResponse(text: string): { days: any[] } {
  let cleaned = text.trim()
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
  if (jsonMatch) cleaned = jsonMatch[0]
  const parsed = JSON.parse(cleaned)
  if (!parsed.days || !Array.isArray(parsed.days)) {
    throw new Error('AI 返回格式错误：缺少 days 数组')
  }
  // 确保每条都有 suggestedTime，缺失时按平台高峰期补齐
  let hourIndex = 0
  for (const day of parsed.days) {
    for (const item of day.items || []) {
      if (!item.suggestedTime || !/^\d{1,2}:\d{2}$/.test(item.suggestedTime)) {
        item.suggestedTime = PEAK_HOURS[hourIndex % PEAK_HOURS.length]
        hourIndex++
      }
    }
  }
  return parsed
}

function getStartDate(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

calendarRouter.post('/generate', async (req: Request, res: Response) => {
  try {
    const body = req.body as CalendarGenerateRequest
    const { daysCount, positioning, goal, userId } = body

    if (!positioning || !goal) {
      return res.status(400).json({ error: '缺少必要参数', message: 'positioning 和 goal 必填' })
    }
    if (daysCount !== 7 && daysCount !== 30) {
      return res.status(400).json({ error: '参数错误', message: 'daysCount 必须为 7 或 30' })
    }

    // 未登录用户只能生成 7 天
    if (!userId && daysCount === 30) {
      return res.status(403).json({ error: '需要登录', message: '生成 30 天日历需登录并开通 VIP' })
    }

    // 已登录：校验 VIP 与每日次数
    if (userId) {
      try {
        const db = getSupabase()
        const { data: vipRows } = await db.rpc('get_user_vip_status', { p_user_id: userId })
        const vip = vipRows?.[0]
        const planType = vip?.plan_type || 'free'
        const isActive = vip?.is_active ?? false

        if (daysCount === 30) {
          const allowedPlans = ['basic', 'pro', 'lifetime']
          if (!allowedPlans.includes(planType) || !isActive) {
            return res.status(403).json({
              error: '需要 VIP',
              message: '生成 30 天日历需开通基础会员及以上'
            })
          }
        }

        const { data: todayCount } = await db.rpc('get_today_usage_count', {
          p_user_id: userId,
          p_action_type: 'generate_calendar'
        })
        const count = todayCount ?? 0
        const limit = planType === 'free' ? 1 : planType === 'basic' ? 3 : 999
        if (count >= limit) {
          return res.status(429).json({
            error: '次数已用完',
            message: `今日日历生成次数已用完（${limit}次），请明天再试`
          })
        }
      } catch (dbErr) {
        console.error('权限校验失败:', dbErr)
        return res.status(500).json({ error: '服务异常', message: '权限校验失败' })
      }
    }

    const { system, user } = buildCalendarPrompt(body)
    const service = getAIService()
    const raw = await service.generateContent(system, user)

    const content = raw?.choices?.[0]?.message?.content || raw?.data || ''
    if (!content) {
      return res.status(500).json({ error: 'AI 返回为空', message: '生成失败，请重试' })
    }

    const parsed = parseCalendarResponse(content)

    // 已登录：保存到 calendar_history 并记录 usage
    if (userId) {
      try {
        const db = getSupabase()
        const { data: cal } = await db
          .from('calendar_history')
          .insert({
            user_id: userId,
            input_params: {
              positioning,
              goal,
              styleKeywords: body.styleKeywords,
              referenceNotes: body.referenceNotes
            },
            calendar_data: parsed,
            days_count: daysCount
          })
          .select('id')
          .single()

        await db.from('usage_logs').insert({
          user_id: userId,
          action_type: 'generate_calendar',
          metadata: { calendar_id: cal?.id, days_count: daysCount }
        })
      } catch (saveErr) {
        console.error('保存日历失败:', saveErr)
      }
    }

    res.json({ success: true, data: parsed })
  } catch (err: any) {
    console.error('Calendar generate error:', err)
    if (err.message?.includes('JSON')) {
      return res.status(500).json({ error: '解析失败', message: 'AI 返回格式异常，请重试' })
    }
    res.status(500).json({
      error: '生成失败',
      message: err?.message || '未知错误'
    })
  }
})

/**
 * POST /api/calendar/analyze - 分析单条笔记表现，返回优化建议
 */
calendarRouter.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { item } = req.body as { item: any }
    if (!item?.title) {
      return res.status(400).json({ error: '缺少笔记数据', message: 'item.title 必填' })
    }

    const likes = item.publishedNote?.likes ?? 0
    const favorites = item.publishedNote?.favorites ?? 0
    const comments = item.publishedNote?.comments ?? 0
    const hasData = likes > 0 || favorites > 0 || comments > 0

    const systemPrompt = `你是小红书内容优化专家。根据用户已发笔记的表现数据，给出简明扼要的优化建议。
输出格式为纯文本，3-5 条建议，每条一行，用「建议」或「-」开头。`

    const userPrompt = hasData
      ? `笔记标题：${item.title}
大纲：${item.outline || '无'}
数据：点赞 ${likes}，收藏 ${favorites}，评论 ${comments}

请分析这条笔记的表现，给出 3-5 条具体优化建议（如标题、钩子、标签、发布时间等）。`
      : `笔记标题：${item.title}
大纲：${item.outline || '无'}
该笔记尚未录入数据，请基于标题和大纲给出 3-5 条发布前优化建议。`

    const service = getAIService()
    const raw = await service.generateContent(systemPrompt, userPrompt)
    const content = raw?.choices?.[0]?.message?.content || raw?.data || '暂无分析结果'

    res.json({ success: true, data: { suggestions: content.trim().split('\n').filter(Boolean) } })
  } catch (err: any) {
    console.error('Calendar analyze error:', err)
    res.status(500).json({ error: '分析失败', message: err?.message || '未知错误' })
  }
})

/**
 * POST /api/calendar/optimize - 基于已发数据优化下周/下月日历
 */
calendarRouter.post('/optimize', async (req: Request, res: Response) => {
  try {
    const body = req.body as { calendarData: any; inputParams?: any; daysCount?: number; userId?: string }
    const { calendarData, inputParams = {}, daysCount = 7, userId } = body

    if (!calendarData?.days?.length) {
      return res.status(400).json({ error: '缺少日历数据', message: 'calendarData.days 必填' })
    }

    if (!userId) {
      return res.status(401).json({ error: '需要登录', message: '优化日历需登录并开通 VIP' })
    }

    // VIP 校验
    try {
      const db = getSupabase()
      const { data: vipRows } = await db.rpc('get_user_vip_status', { p_user_id: userId })
      const vip = vipRows?.[0]
      const planType = vip?.plan_type || 'free'
      const isActive = vip?.is_active ?? false
      if (planType === 'free' || !isActive) {
        return res.status(403).json({
          error: '需要 VIP',
          message: '优化下周/下月日历为 VIP 专属功能'
        })
      }
    } catch (dbErr) {
      console.error('VIP 校验失败:', dbErr)
      return res.status(500).json({ error: '服务异常', message: '权限校验失败' })
    }

    // 收集已发笔记及数据
    const published: string[] = []
    for (const day of calendarData.days) {
      for (const item of day.items || []) {
        if (item.status === 'published' && item.publishedNote) {
          const p = item.publishedNote
          published.push(`【${day.date}】${item.title}：点赞 ${p.likes || 0}，收藏 ${p.favorites || 0}，评论 ${p.comments || 0}`)
        }
      }
    }

    const systemPrompt = `你是小红书内容规划专家。根据用户已发笔记的表现数据，优化下周/下月的日历规划。
输出必须为纯 JSON：{"days":[{"date":"YYYY-MM-DD","items":[{"id":"uuid","title":"","outline":"","tags":[],"type":"image|video|carousel|live_preview","suggestedTime":"HH:mm"}]}]}
- 基于表现好的内容类型和风格，增加类似建议
- 表现差的类型可减少或调整方向
- 建议发布时间：午间 12:00-14:00，晚间 19:00-22:00`

    const userPrompt = `当前日历定位：${inputParams.positioning || '未指定'}，目标：${inputParams.goal || '涨粉'}
已发笔记表现：
${published.length ? published.join('\n') : '暂无已发数据'}

请基于以上信息，生成优化后的 ${daysCount} 天内容日历（从下周一开始）。直接返回 JSON。`

    const service = getAIService()
    const raw = await service.generateContent(systemPrompt, userPrompt)
    const content = raw?.choices?.[0]?.message?.content || raw?.data || ''
    const jsonMatch = content.trim().match(/\{[\s\S]*\}/)
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { days: [] }

    if (!parsed.days?.length) {
      return res.status(500).json({ error: '优化失败', message: 'AI 返回格式异常' })
    }

    // 确保每条有 suggestedTime
    let hi = 0
    for (const day of parsed.days) {
      for (const item of day.items || []) {
        if (!item.suggestedTime || !/^\d{1,2}:\d{2}$/.test(item.suggestedTime)) {
          item.suggestedTime = PEAK_HOURS[hi % PEAK_HOURS.length]
          hi++
        }
      }
    }

    res.json({ success: true, data: parsed })
  } catch (err: any) {
    console.error('Calendar optimize error:', err)
    if (err?.message?.includes('JSON')) {
      return res.status(500).json({ error: '解析失败', message: 'AI 返回格式异常' })
    }
    res.status(500).json({ error: '优化失败', message: err?.message || '未知错误' })
  }
})
