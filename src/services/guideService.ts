/**
 * 指南服务
 * 处理指南的保存、分享、查询等功能
 */

import { supabase } from '@/lib/supabase'
import type { GuideContent } from '@/types'

export interface SavedGuide {
  id: string
  user_id: string
  share_id: string
  account_name: string
  account_data: any
  guide_content: GuideContent
  is_public: boolean
  view_count: number
  created_at: string
  updated_at: string
}

/**
 * 保存指南到云端
 */
export async function saveGuide(
  accountData: any,
  guideContent: GuideContent
): Promise<{ success: boolean; shareId?: string; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: '请先登录' }
    }

    const { data, error } = await supabase
      .from('guide_history')
      .insert({
        user_id: user.id,
        account_name: guideContent.metadata.accountName,
        account_data: accountData,
        guide_content: guideContent,
        is_public: false
      })
      .select('share_id')
      .single()

    if (error) {
      console.error('保存指南失败:', error)
      
      // 根据错误类型返回更友好的提示
      if (error.code === '23505') {
        return { success: false, error: '该指南已存在' }
      } else if (error.code === '42501') {
        return { success: false, error: '没有权限保存' }
      }
      
      return { success: false, error: '保存失败，请重试' }
    }

    return { success: true, shareId: data.share_id }
  } catch (error: any) {
    console.error('保存指南异常:', error)
    
    if (error.message?.includes('network')) {
      return { success: false, error: '网络连接失败' }
    }
    
    return { success: false, error: '保存异常，请重试' }
  }
}

/**
 * 通过 share_id 获取指南
 */
export async function getGuideByShareId(
  shareId: string
): Promise<{ success: boolean; guide?: SavedGuide; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('guide_history')
      .select('*')
      .eq('share_id', shareId)
      .single()

    if (error || !data) {
      return { success: false, error: '指南不存在' }
    }

    // 增加浏览次数
    await supabase
      .from('guide_history')
      .update({ view_count: data.view_count + 1 })
      .eq('id', data.id)

    return { success: true, guide: data }
  } catch (error) {
    console.error('获取指南异常:', error)
    return { success: false, error: '获取失败' }
  }
}

/**
 * 获取用户的所有指南
 */
export async function getUserGuides(): Promise<{
  success: boolean
  guides?: SavedGuide[]
  error?: string
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: '请先登录' }
    }

    const { data, error } = await supabase
      .from('guide_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('获取指南列表失败:', error)
      return { success: false, error: '获取失败' }
    }

    return { success: true, guides: data || [] }
  } catch (error) {
    console.error('获取指南列表异常:', error)
    return { success: false, error: '获取异常' }
  }
}

/**
 * 更新指南的公开状态
 */
export async function updateGuidePublicStatus(
  guideId: string,
  isPublic: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('guide_history')
      .update({ is_public: isPublic })
      .eq('id', guideId)

    if (error) {
      console.error('更新公开状态失败:', error)
      return { success: false, error: '更新失败' }
    }

    return { success: true }
  } catch (error) {
    console.error('更新公开状态异常:', error)
    return { success: false, error: '更新异常' }
  }
}

/**
 * 删除指南
 */
export async function deleteGuide(
  guideId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('guide_history')
      .delete()
      .eq('id', guideId)

    if (error) {
      console.error('删除指南失败:', error)
      return { success: false, error: '删除失败' }
    }

    return { success: true }
  } catch (error) {
    console.error('删除指南异常:', error)
    return { success: false, error: '删除异常' }
  }
}

/**
 * 生成分享链接
 */
export function generateShareLink(shareId: string): string {
  const baseUrl = window.location.origin
  return `${baseUrl}/share/${shareId}`
}
