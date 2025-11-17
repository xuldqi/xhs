import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export class AuthService {
  // 发送手机验证码（需要配置 Supabase Auth）
  static async sendPhoneOTP(phone: string): Promise<void> {
    const { error } = await supabase.auth.signInWithOtp({
      phone,
    })
    
    if (error) throw error
  }

  // 验证手机验证码登录
  static async verifyPhoneOTP(phone: string, token: string): Promise<User> {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms',
    })
    
    if (error) throw error
    if (!data.user) throw new Error('登录失败')
    
    return data.user
  }

  // 邮箱密码注册
  static async signUpWithEmail(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    
    if (error) throw error
    if (!data.user) throw new Error('注册失败')
    
    return data.user
  }

  // 邮箱密码登录
  static async signInWithEmail(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) throw error
    if (!data.user) throw new Error('登录失败')
    
    return data.user
  }

  // 获取当前用户
  static async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  }

  // 退出登录
  static async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  // 监听认证状态变化
  static onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user ?? null)
    })
  }
}
