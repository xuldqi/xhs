import { supabase } from '@/lib/supabase'
import type { User } from '@/types/user'

export class AuthService {
  // 映射 Supabase 用户到本地 User 类型
  private static mapUser(supabaseUser: any): User {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email,
      role: supabaseUser.role,
      created_at: supabaseUser.created_at,
      subscription_status: supabaseUser.app_metadata?.subscription_status || 'free'
    }
  }

  // 邮箱密码注册
  static async signUpWithEmail(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) throw error
    if (!data.user) throw new Error('注册失败')

    return this.mapUser(data.user)
  }

  // 邮箱密码登录
  static async signInWithEmail(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    if (!data.user) throw new Error('登录失败')

    return this.mapUser(data.user)
  }

  // 获取当前用户
  static async getCurrentUser(): Promise<User | null> {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error || !session?.user) return null
    return this.mapUser(session.user)
  }

  // 获取当前 session
  static async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) return null
    return session
  }

  // 退出登录
  static async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    localStorage.removeItem('access_token') // 清理可能的遗留
  }

  // 监听认证状态变化
  static onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user ? this.mapUser(session.user) : null
      callback(user)
    })
  }

  // 发送手机验证码 (暂不支持)
  static async sendPhoneOTP(phone: string): Promise<void> {
    throw new Error('暂不支持手机验证码')
  }

  // 验证手机验证码登录 (暂不支持)
  static async verifyPhoneOTP(phone: string, token: string): Promise<User> {
    throw new Error('暂不支持手机验证码')
  }

  // 重新发送确认邮件
  static async resendConfirmationEmail(email: string): Promise<void> {
    // Supabase 可以在 signUp 时配置自动发送，或者使用 resend api
    // 这里暂时留空或抛出错误
  }
}
