export interface ProviderStatus {
  key: string
  label: string
  configured: boolean
  recommendedFor: string
}

export interface WorkflowRuntimeStatus {
  id: string
  title: string
  downloadPath: string
  importReady: boolean
}

export interface AutomationStatusResponse {
  providers: ProviderStatus[]
  workflows: WorkflowRuntimeStatus[]
  note: string
}

const API_BASE = import.meta.env.VITE_BACKEND_URL || ''

export async function getAutomationStatus(): Promise<AutomationStatusResponse> {
  if (!API_BASE) {
    return getFallbackAutomationStatus()
  }

  try {
    const response = await fetch(`${API_BASE}/api/automation/status`)
    if (!response.ok) {
      throw new Error(`status ${response.status}`)
    }
    return response.json()
  } catch (error) {
    console.warn('getAutomationStatus fallback:', error)
    return getFallbackAutomationStatus()
  }
}

function getFallbackAutomationStatus(): AutomationStatusResponse {
  return {
    providers: [
      { key: 'deepseek', label: 'DeepSeek', configured: false, recommendedFor: '长文 / 多平台改写' },
      { key: 'gemini', label: 'Gemini', configured: false, recommendedFor: '图像理解 / 轻量生成' },
      { key: 'unsplash', label: 'Unsplash', configured: false, recommendedFor: '自动配图' },
      { key: 'twitter', label: 'Twitter API', configured: false, recommendedFor: '趋势抓取 / 发布' },
      { key: 'weibo', label: 'Weibo API', configured: false, recommendedFor: '中文分发' },
      { key: 'xiaohongshu', label: '小红书渠道', configured: false, recommendedFor: '人工/半自动分发' },
    ],
    workflows: [
      { id: 'trend-scraper', title: '趋势抓取流水线', downloadPath: '/workflows/intelligent-scraper.json', importReady: true },
      { id: 'multi-platform-remix', title: '多平台改写流水线', downloadPath: '/workflows/multi-platform-publisher.json', importReady: true },
      { id: 'auto-content-engine', title: '自动内容生产流水线', downloadPath: '/workflows/auto-content-generation.json', importReady: true },
    ],
    note: '当前展示为前端兜底状态；接通后端后会自动显示真实配置情况。'
  }
}
