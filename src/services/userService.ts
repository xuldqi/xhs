import { supabase } from '@/lib/supabase'
import type { Profile, Subscription, UsageLog, GuideHistory, PlanConfig } from '@/lib/supabase'

export class UserService {
  // 获取用户资料
  static async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
    
    if (error) {
      console.error('获取用户资料失败:', error)
      return null
    }
    return data?.[0] || null
  }

  // 更新用户资料
  static async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
    
    if (error) throw error
    if (!data || data.length === 0) throw new Error('更新失败')
    return data[0]
  }

  // 获取用户当前订阅
  static async getCurrentSubscription(userId: string): Promise<Subscription | null> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
    
    if (error) {
      console.error('获取订阅失败:', error)
      return null
    }
    return data?.[0] || null
  }

  // 获取用户 VIP 状态
  static async getVIPStatus(userId: string) {
    const { data, error } = await supabase
      .rpc('get_user_vip_status', { p_user_id: userId })
    
    if (error) throw error
    return data?.[0] || null
  }

  // 记录使用日志
  static async logUsage(
    userId: string,
    actionType: 'generate_guide' | 'export_html' | 'view_history',
    metadata?: any
  ): Promise<void> {
    const { error } = await supabase
      .from('usage_logs')
      .insert({
        user_id: userId,
        action_type: actionType,
        metadata,
      })
    
    if (error) throw error
  }

  // 获取今日使用次数
  static async getTodayUsageCount(
    userId: string,
    actionType: 'generate_guide' | 'export_html' | 'view_history'
  ): Promise<number> {
    const { data, error } = await supabase
      .rpc('get_today_usage_count', {
        p_user_id: userId,
        p_action_type: actionType,
      })
    
    if (error) throw error
    return data || 0
  }

  // 检查是否可以执行操作
  static async canPerformAction(
    userId: string,
    actionType: 'generate_guide' | 'export_html'
  ): Promise<{ allowed: boolean; reason?: string; remaining?: number }> {
    // 获取 VIP 状态
    const vipStatus = await this.getVIPStatus(userId)
    if (!vipStatus || !vipStatus.is_active) {
      return { allowed: false, reason: '请先开通会员' }
    }

    // 获取套餐配置
    const planConfig = await this.getPlanConfig(vipStatus.plan_type)
    if (!planConfig) {
      return { allowed: false, reason: '套餐配置错误' }
    }

    // 获取今日使用次数
    const todayCount = await this.getTodayUsageCount(userId, actionType)
    
    const limit = actionType === 'generate_guide' 
      ? planConfig.daily_generate_limit 
      : planConfig.daily_export_limit

    if (todayCount >= limit) {
      return { 
        allowed: false, 
        reason: `今日${actionType === 'generate_guide' ? '生成' : '导出'}次数已用完`,
        remaining: 0
      }
    }

    return { 
      allowed: true, 
      remaining: limit - todayCount 
    }
  }

  // 获取套餐配置
  static async getPlanConfig(planType: string): Promise<PlanConfig | null> {
    const { data, error } = await supabase
      .from('plan_configs')
      .select('*')
      .eq('plan_type', planType)
    
    if (error) {
      console.error('获取套餐配置失败:', error)
      return null
    }
    return data?.[0] || null
  }

  // 获取所有套餐配置
  static async getAllPlanConfigs(): Promise<PlanConfig[]> {
    const { data, error } = await supabase
      .from('plan_configs')
      .select('*')
      .order('price', { ascending: true })
    
    if (error) throw error
    return data || []
  }

  // 保存生成历史到云端
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
        guide_content: guideContent,
      })
      .select()
    
    if (error) throw error
    if (!data || data.length === 0) throw new Error('保存失败')
    return data[0]
  }

  // 获取用户历史记录
  static async getGuideHistory(userId: string, limit = 50): Promise<GuideHistory[]> {
    const { data, error } = await supabase
      .from('guide_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data || []
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
