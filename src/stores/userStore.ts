import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@supabase/supabase-js'
import { AuthService } from '@/services/authService'
import { UserService } from '@/services/userService'
import type { Profile, Subscription, PlanConfig } from '@/lib/supabase'

export const useUserStore = defineStore('user', () => {
  // 状态
  const user = ref<User | null>(null)
  const profile = ref<Profile | null>(null)
  const subscription = ref<Subscription | null>(null)
  const vipStatus = ref<any>(null)
  const planConfig = ref<PlanConfig | null>(null)
  const loading = ref(false)

  // 计算属性
  const isLoggedIn = computed(() => !!user.value)
  const isVIP = computed(() => {
    if (!vipStatus.value) return false
    return vipStatus.value.is_active && vipStatus.value.plan_type !== 'free'
  })
  const planType = computed(() => vipStatus.value?.plan_type || 'free')
  const planName = computed(() => planConfig.value?.name || '免费体验')

  // 初始化用户状态
  async function init() {
    loading.value = true
    try {
      const currentUser = await AuthService.getCurrentUser()
      if (currentUser) {
        await setUser(currentUser)
      }
    } catch (error) {
      console.error('初始化用户状态失败:', error)
    } finally {
      loading.value = false
    }

    // 监听认证状态变化
    AuthService.onAuthStateChange(async (newUser) => {
      if (newUser) {
        await setUser(newUser)
      } else {
        clearUser()
      }
    })
  }

  // 设置用户信息
  async function setUser(newUser: User) {
    user.value = newUser
    try {
      await loadUserData()
    } catch (error) {
      console.error('加载用户数据失败:', error)
    }
  }

  // 加载用户数据
  async function loadUserData() {
    if (!user.value) return

    try {
      // 并行加载用户数据
      const [profileData, vipData] = await Promise.all([
        UserService.getProfile(user.value.id),
        UserService.getVIPStatus(user.value.id),
      ])

      profile.value = profileData
      vipStatus.value = vipData

      // 加载套餐配置
      if (vipData?.plan_type) {
        planConfig.value = await UserService.getPlanConfig(vipData.plan_type)
      }
    } catch (error) {
      console.error('加载用户数据失败:', error)
      // 不要抛出错误，避免影响用户体验
    }
  }

  // 清除用户信息
  function clearUser() {
    user.value = null
    profile.value = null
    subscription.value = null
    vipStatus.value = null
    planConfig.value = null
  }

  // 登录
  async function login(email: string, password: string) {
    loading.value = true
    try {
      const loggedInUser = await AuthService.signInWithEmail(email, password)
      await setUser(loggedInUser)
      return loggedInUser
    } catch (error: any) {
      console.error('登录失败:', error)
      throw new Error(error.message || '登录失败')
    } finally {
      loading.value = false
    }
  }

  // 注册
  async function register(email: string, password: string) {
    loading.value = true
    try {
      const newUser = await AuthService.signUpWithEmail(email, password)
      await setUser(newUser)
      return newUser
    } catch (error: any) {
      console.error('注册失败:', error)
      throw new Error(error.message || '注册失败')
    } finally {
      loading.value = false
    }
  }

  // 退出登录
  async function logout() {
    loading.value = true
    try {
      await AuthService.signOut()
      clearUser()
    } catch (error: any) {
      console.error('退出登录失败:', error)
      throw new Error(error.message || '退出登录失败')
    } finally {
      loading.value = false
    }
  }

  // 更新用户资料
  async function updateProfile(updates: Partial<Profile>) {
    if (!user.value) throw new Error('未登录')

    loading.value = true
    try {
      const updatedProfile = await UserService.updateProfile(user.value.id, updates)
      profile.value = updatedProfile
      return updatedProfile
    } catch (error: any) {
      console.error('更新资料失败:', error)
      throw new Error(error.message || '更新资料失败')
    } finally {
      loading.value = false
    }
  }

  // 检查是否可以执行操作
  async function canPerformAction(actionType: 'generate_guide' | 'export_html') {
    if (!user.value) {
      return { allowed: false, reason: '请先登录' }
    }

    try {
      return await UserService.canPerformAction(user.value.id, actionType)
    } catch (error: any) {
      console.error('检查权限失败:', error)
      return { allowed: false, reason: '检查权限失败' }
    }
  }

  // 记录使用日志
  async function logUsage(
    actionType: 'generate_guide' | 'export_html' | 'view_history',
    metadata?: any
  ) {
    if (!user.value) return

    try {
      await UserService.logUsage(user.value.id, actionType, metadata)
      // 重新加载 VIP 状态以更新使用次数
      if (actionType === 'generate_guide' || actionType === 'export_html') {
        await loadUserData()
      }
    } catch (error) {
      console.error('记录使用日志失败:', error)
    }
  }

  // 刷新用户数据
  async function refresh() {
    if (!user.value) return
    await loadUserData()
  }

  return {
    // 状态
    user,
    profile,
    subscription,
    vipStatus,
    planConfig,
    loading,
    // 计算属性
    isLoggedIn,
    isVIP,
    planType,
    planName,
    // 方法
    init,
    login,
    register,
    logout,
    updateProfile,
    canPerformAction,
    logUsage,
    refresh,
  }
})
