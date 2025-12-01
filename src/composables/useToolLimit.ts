import { computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

// 工具使用限制配置
export const TOOL_LIMITS = {
  free: {
    'title-generator': 10, // 每日10次
    'viral-generator': 3, // 每日3次
    'background-remover': 5, // 每日5次
    'manga-generator': 5, // 每日5次
    'hot-words-insight': 20, // 每日20次
    'topic-inspiration': 20, // 每日20次
  },
  pro: {
    'title-generator': 999, // 无限
    'viral-generator': 999,
    'background-remover': 999,
    'manga-generator': 999,
    'hot-words-insight': 999,
    'topic-inspiration': 999,
  }
} as const

export type ToolId = keyof typeof TOOL_LIMITS.free

export function useToolLimit() {
  const router = useRouter()
  const userStore = useUserStore()

  // 获取工具的使用限制
  const getToolLimit = (toolId: ToolId): number => {
    const planType = userStore.planType
    const limits = TOOL_LIMITS[planType] || TOOL_LIMITS.free
    return limits[toolId] || 0
  }

  // 检查是否可以使用工具
  const canUseTool = async (toolId: ToolId): Promise<boolean> => {
    // 如果未登录，提示登录
    if (!userStore.isLoggedIn) {
      const result = await ElMessageBox.confirm(
        '使用此工具需要先登录',
        '需要登录',
        {
          confirmButtonText: '去登录',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch(() => false)

      if (result) {
        router.push(`/login?redirect=${router.currentRoute.value.fullPath}`)
      }
      return false
    }

    // 如果是VIP，直接允许
    if (userStore.isVIP) {
      return true
    }

    // 检查使用次数（这里简化处理，实际应该从后端获取今日使用次数）
    const limit = getToolLimit(toolId)
    if (limit >= 999) {
      return true
    }

    // 检查使用次数限制
    // 注意：实际使用时需要从后端API获取真实使用次数
    // const todayUsage = await UserService.getTodayToolUsage(toolId)
    // if (todayUsage >= limit) {
    //   const result = await ElMessageBox.confirm(
    //     `您今日的${getToolName(toolId)}使用次数已用完（${limit}次/天）`,
    //     '使用次数已用完',
    //     {
    //       confirmButtonText: '升级会员',
    //       cancelButtonText: '取消',
    //       type: 'warning',
    //     }
    //   ).catch(() => false)
    //
    //   if (result) {
    //     router.push('/pricing')
    //   }
    //   return false
    // }

    return true
  }

  // 获取工具名称
  const getToolName = (toolId: ToolId): string => {
    const nameMap: Record<ToolId, string> = {
      'title-generator': '标题生成器',
      'viral-generator': '爆款生成器',
      'background-remover': '图片背景移除',
      'manga-generator': '漫画风生成器',
      'hot-words-insight': '热词洞察工具',
      'topic-inspiration': '灵感话题库',
    }
    return nameMap[toolId] || '工具'
  }

  // 获取剩余使用次数提示
  const getRemainingUsageTip = (toolId: ToolId): string => {
    if (userStore.isVIP) {
      return '会员无限使用'
    }
    const limit = getToolLimit(toolId)
    if (limit >= 999) {
      return '无限使用'
    }
    // 注意：实际使用时需要从后端API获取真实剩余次数
    return `每日 ${limit} 次`
  }

  // 显示升级提示
  const showUpgradeTip = (toolId: ToolId) => {
    const toolName = getToolName(toolId)
    const limit = getToolLimit(toolId)
    
    ElMessageBox.confirm(
      `免费版${toolName}每日限制${limit}次，升级会员可无限使用`,
      '升级会员',
      {
        confirmButtonText: '立即升级',
        cancelButtonText: '取消',
        type: 'info',
      }
    ).then(() => {
      router.push('/pricing')
    }).catch(() => {})
  }

  return {
    getToolLimit,
    canUseTool,
    getToolName,
    getRemainingUsageTip,
    showUpgradeTip,
  }
}

