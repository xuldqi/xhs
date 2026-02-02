/**
 * 内容日历服务
 * 调用后端 AI 生成日历，保存/加载 Supabase
 */

import { supabase } from '@/lib/supabase'
import type { CalendarData, CalendarDay, BrandVoice } from '@/types/models'

const API_BASE = import.meta.env.VITE_BACKEND_URL || ''
const CALENDAR_API = `${API_BASE}/api/calendar`

export interface GenerateCalendarParams {
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
}

export interface SavedCalendar {
  id: string
  user_id: string
  brand_voice_id: string | null
  input_params: Record<string, any>
  calendar_data: CalendarData
  days_count: number
  created_at: string
}

/**
 * 调用后端生成内容日历
 */
export async function generateCalendar(
  params: GenerateCalendarParams,
  userId?: string
): Promise<CalendarData> {
  const res = await fetch(`${CALENDAR_API}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...params,
      userId
    })
  })

  const json = await res.json()

  if (!res.ok) {
    throw new Error(json.message || json.error || '生成失败')
  }

  if (!json.success || !json.data) {
    throw new Error('AI 返回格式异常')
  }

  return json.data as CalendarData
}

/**
 * 保存日历到 Supabase（后端已保存，此函数用于前端直接写入场景）
 */
export async function saveCalendar(
  inputParams: Record<string, any>,
  calendarData: CalendarData,
  daysCount: number,
  brandVoiceId?: string
): Promise<SavedCalendar> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('请先登录')

  const { data, error } = await supabase
    .from('calendar_history')
    .insert({
      user_id: user.id,
      brand_voice_id: brandVoiceId || null,
      input_params: inputParams,
      calendar_data: calendarData,
      days_count: daysCount
    })
    .select()
    .single()

  if (error) throw new Error(error.message || '保存失败')
  return data as SavedCalendar
}

/**
 * 更新日历到 Supabase
 */
export async function updateCalendar(
  id: string,
  inputParams: Record<string, any>,
  calendarData: CalendarData,
  daysCount: number
): Promise<SavedCalendar> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('请先登录')

  const { data, error } = await supabase
    .from('calendar_history')
    .update({
      input_params: inputParams,
      calendar_data: calendarData,
      days_count: daysCount
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw new Error(error.message || '更新失败')
  return data as SavedCalendar
}

/**
 * 加载用户日历历史列表
 */
export async function loadCalendarHistory(limit = 20): Promise<SavedCalendar[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('calendar_history')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message || '加载失败')
  return (data || []) as SavedCalendar[]
}

/**
 * 删除日历
 */
export async function deleteCalendar(id: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('请先登录')

  const { error } = await supabase
    .from('calendar_history')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message || '删除失败')
}

/**
 * 分析单条笔记表现，返回优化建议
 */
export async function analyzeNote(item: { title: string; outline?: string; publishedNote?: { likes?: number; favorites?: number; comments?: number } }): Promise<string[]> {
  const API_BASE = import.meta.env.VITE_BACKEND_URL || ''
  const res = await fetch(`${API_BASE}/api/calendar/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ item })
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || json.error || '分析失败')
  const suggestions = json.data?.suggestions
  return Array.isArray(suggestions) ? suggestions : [suggestions].filter(Boolean)
}

/**
 * 基于已发数据优化下周/下月日历
 */
export async function optimizeCalendar(
  calendarData: CalendarData,
  inputParams: Record<string, any>,
  daysCount: number,
  userId?: string
): Promise<CalendarData> {
  const API_BASE = import.meta.env.VITE_BACKEND_URL || ''
  const res = await fetch(`${API_BASE}/api/calendar/optimize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ calendarData, inputParams, daysCount, userId })
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || json.error || '优化失败')
  if (!json.data?.days) throw new Error('AI 返回格式异常')
  return json.data as CalendarData
}

/**
 * 获取单条日历详情
 */
export async function getCalendarById(id: string): Promise<SavedCalendar | null> {
  const { data, error } = await supabase
    .from('calendar_history')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data as SavedCalendar
}

/**
 * 保存/更新品牌声
 */
export async function saveBrandVoice(voice: Partial<BrandVoice>): Promise<BrandVoice & { id: string }> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('请先登录')

  const payload = {
    user_id: user.id,
    name: voice.name || '默认品牌声',
    style: voice.style || null,
    keywords: voice.keywords || [],
    forbidden_words: voice.forbiddenWords || [],
    emoji_list: voice.emojiList || []
  }

  if (voice.id) {
    const { data, error } = await supabase
      .from('brand_voice')
      .update(payload)
      .eq('id', voice.id)
      .eq('user_id', user.id)
      .select()
      .single()
    if (error) throw new Error(error.message || '更新失败')
    return data as BrandVoice & { id: string }
  } else {
    const { data, error } = await supabase
      .from('brand_voice')
      .insert(payload)
      .select()
      .single()
    if (error) throw new Error(error.message || '保存失败')
    return data as BrandVoice & { id: string }
  }
}

/**
 * 加载用户品牌声列表
 */
export async function loadBrandVoices(): Promise<(BrandVoice & { id: string })[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('brand_voice')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return []
  return (data || []).map((r: any) => ({
    id: r.id,
    name: r.name,
    style: r.style,
    keywords: r.keywords || [],
    forbiddenWords: r.forbidden_words || [],
    emojiList: r.emoji_list || []
  }))
}
