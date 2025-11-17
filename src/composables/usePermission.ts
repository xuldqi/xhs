import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

export function usePermission() {
  const router = useRouter()
  const userStore = useUserStore()

  /**
   * 检查是否可以生成指南
   */
  const checkGeneratePermission = async (): Promise<boolean> => {
    // 检查是否登录
    if (!userStore.isLoggedIn) {
      const result = await ElMessageBox.confirm(
        '请先登录后再使用生成功能',
        '需要登录',
        {
          confirmButtonText: '去登录',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch(() => false)

      if (result) {
        router.push('/login?redirect=/upload')
      }
      return false
    }

    // 检查使用次数
    const permission = await userStore.canPerformAction('generate_guide')
    
    if (!permission.allowed) {
      const result = await ElMessageBox.confirm(
        permission.reason || '您的使用次数已用完',
        '权限不足',
        {
          confirmButtonText: '升级会员',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch(() => false)

      if (result) {
        router.push('/pricing')
      }
      return false
    }

    return true
  }

  /**
   * 检查是否可以导出
   */
  const checkExportPermission = async (): Promise<boolean> => {
    if (!userStore.isLoggedIn) {
      ElMessage.warning('请先登录后再导出')
      return false
    }

    const permission = await userStore.canPerformAction('export_html')
    
    if (!permission.allowed) {
      const result = await ElMessageBox.confirm(
        permission.reason || '您的导出次数已用完',
        '权限不足',
        {
          confirmButtonText: '升级会员',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch(() => false)

      if (result) {
        router.push('/pricing')
      }
      return false
    }

    return true
  }

  /**
   * 记录使用日志
   */
  const logUsage = async (
    actionType: 'generate_guide' | 'export_html' | 'view_history',
    metadata?: any
  ) => {
    if (userStore.isLoggedIn) {
      await userStore.logUsage(actionType, metadata)
    }
  }

  return {
    checkGeneratePermission,
    checkExportPermission,
    logUsage,
  }
}
