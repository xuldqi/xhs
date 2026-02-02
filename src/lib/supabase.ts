import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// 创建 Supabase 客户端，启用持久化 session
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // 自动刷新 token
    autoRefreshToken: true,
    // 持久化 session 到 localStorage
    persistSession: true,
    // 检测 session 从其他标签页的更新
    detectSessionInUrl: true,
    // 存储 key 前缀
    storageKey: 'xiaohongshu-auth',
  },
})

// 类型定义
export interface Profile {
  id: string
  email: string | null
  phone: string | null
  nickname: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  plan_type: 'free' | 'basic' | 'pro' | 'lifetime'
  status: 'active' | 'expired' | 'cancelled'
  started_at: string
  expires_at: string | null
  auto_renew: boolean
  created_at: string
  updated_at: string
}

export interface UsageLog {
  id: string
  user_id: string
  action_type: 'generate_guide' | 'export_html' | 'view_history' | 'generate_calendar'
  metadata: any
  created_at: string
}

export interface Order {
  id: string
  user_id: string
  order_no: string
  plan_type: string
  amount: number
  status: 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled'
  alipay_trade_no: string | null
  paid_at: string | null
  created_at: string
  updated_at: string
}

export interface GuideHistory {
  id: string
  user_id: string
  account_name: string
  account_data: any
  guide_content: any
  created_at: string
}

export interface PlanConfig {
  plan_type: string
  name: string
  price: number
  duration_days: number | null
  daily_generate_limit: number
  daily_export_limit: number
  history_limit: number
  priority: boolean
  features: {
    customTemplate?: boolean
    earlyAccess?: boolean
  }
}
