import { supabase } from '@/lib/supabase'
import { AuthService } from './authService'
import type { Database } from '@/lib/database.types' // If exists, otherwise use any or inferred
import type { Profile, Subscription, PlanConfig, GuideHistory } from '@/types/user'

export class UserService {
  // 获取用户资料
  static async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('getProfile error', error)
      return null
    }

    return {
      id: data.id,
      username: data.nickname || '',
      avatar_url: data.avatar_url || '',
      full_name: data.nickname || ''
    }
  }

  // 更新用户资料
  static async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    const updateData: any = {}
    if (updates.username) updateData.nickname = updates.username
    if (updates.full_name) updateData.nickname = updates.full_name
    if (updates.avatar_url) updateData.avatar_url = updates.avatar_url

    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      username: data.nickname || '',
      avatar_url: data.avatar_url || '',
      full_name: data.nickname || ''
    }
  }

  // 获取用户当前订阅
  static async getCurrentSubscription(userId: string): Promise<Subscription | null> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is 'not found'
      console.error('getCurrentSubscription error', error)
      return null
    }

    if (!data) return null

    return {
      plan_type: data.plan_type,
      status: data.status,
      current_period_end: data.expires_at || ''
    }
  }

  // 获取用户 VIP 状态
  static async getVIPStatus(userId: string) {
    const sub = await this.getCurrentSubscription(userId)
    const isVip = sub ? (sub.plan_type === 'pro' || sub.plan_type === 'lifetime' || sub.plan_type === 'basic') : false

    return {
      is_active: isVip,
      plan_type: sub?.plan_type || 'free',
      expires_at: sub?.current_period_end || null
    }
  }

  // 记录使用日志
  static async logUsage(
    userId: string,
    actionType: string,
    metadata?: any
  ): Promise<void> {
    await supabase.from('usage_logs').insert({
      user_id: userId,
      action_type: actionType,
      metadata
    })
  }

  // 获取今日使用次数
  static async getTodayUsageCount(userId: string, actionType: string): Promise<number> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { count, error } = await supabase
      .from('usage_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('action_type', actionType)
      .gte('created_at', today.toISOString())

    if (error) {
      console.error('getTodayUsageCount error', error)
      return 0
    }

    return count || 0
  }

  // 检查是否可以执行操作
  static async canPerformAction(
    userId: string,
    actionType: string
  ): Promise<{ allowed: boolean; reason?: string; remaining?: number }> {
    const vipStatus = await this.getVIPStatus(userId)
    const planConfig = await this.getPlanConfig(vipStatus.plan_type)

    if (!planConfig) return { allowed: true } // Fallback

    let limit = 0
    if (actionType === 'generate_guide') limit = planConfig.daily_generate_limit
    if (actionType === 'export_html') limit = planConfig.daily_export_limit

    const used = await this.getTodayUsageCount(userId, actionType)

    if (used >= limit) {
      return {
        allowed: false,
        reason: `今日${actionType === 'generate_guide' ? '生成' : '导出'}次数已达上限 (${limit}次)，请升级套餐或明日再试`,
        remaining: 0
      }
    }

    return { allowed: true, remaining: limit - used }
  }

  // 获取套餐配置
  static async getPlanConfig(planType: string): Promise<PlanConfig | null> {
    // 优先从数据库获取配置
    const { data } = await supabase
      .from('plan_configs')
      .select('*')
      .eq('plan_type', planType)
      .single()

    if (data) {
      return {
        name: data.name,
        daily_generate_limit: data.daily_generate_limit,
        daily_export_limit: data.daily_export_limit,
        features: [] // 简化处理
      }
    }

    // Fallback defaults
    if (planType === 'pro' || planType === 'lifetime') {
      return {
        name: '专业版',
        daily_generate_limit: 100,
        daily_export_limit: 100,
        features: ['全部功能']
      }
    }
    return {
      name: '免费版',
      daily_generate_limit: 5,
      daily_export_limit: 1,
      features: ['基础功能']
    }
  }

  // 保存生成历史
  static async saveGuideHistory(
    userId: string,
    accountName: string,
    accountData: any,
    guideContent: any
  ): Promise<GuideHistory> {
    const { data, error } = await supabase
      .from('guide_history')
      .insert({
        user_id: userId,
        account_name: accountName,
        account_data: accountData,
        guide_content: guideContent
      })
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      user_id: data.user_id,
      account_name: data.account_name,
      created_at: data.created_at
    }
  }

  // 获取用户历史记录
  static async getGuideHistory(userId: string, limit = 50): Promise<GuideHistory[]> {
    const { data, error } = await supabase
      .from('guide_history')
      .select('id, user_id, account_name, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('getGuideHistory error', error)
      return []
    }

    return data.map(item => ({
      id: item.id,
      user_id: item.user_id,
      account_name: item.account_name,
      created_at: item.created_at
    }))
  }

  // 删除历史记录
  static async deleteGuideHistory(userId: string, historyId: string): Promise<void> {
    const { error } = await supabase
      .from('guide_history')
      .delete()
      .eq('id', historyId)
      .eq('user_id', userId)

    if (error) throw error
  }
}
