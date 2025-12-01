// import { performanceMonitor } from '@/utils/performanceMonitor'
// import { errorMonitor } from '@/utils/errorMonitor'
// import { userBehaviorAnalytics } from '@/utils/userBehaviorAnalytics'

interface PageViewData {
  page: string
  title: string
  referrer: string
  timestamp: number
}

interface ToolUsageData {
  toolName: string
  action: string
  duration?: number
  success: boolean
  timestamp: number
}

interface ResourceDownloadData {
  resourceId: string
  resourceType: string
  resourceName: string
  timestamp: number
}

interface ConversionData {
  funnelStep: string
  action: string
  value?: number
  timestamp: number
}

interface CTAClickData {
  ctaId: string
  ctaText: string
  location: string
  timestamp: number
}

class AnalyticsService {
  private isInitialized = false

  // 初始化分析服务
  initialize() {
    if (this.isInitialized) return

    // 初始化各个监控模块
    // performanceMonitor.setEnabled(true)
    // errorMonitor.setEnabled(true)
    // userBehaviorAnalytics.setEnabled(true)

    this.isInitialized = true
    console.log('[Analytics] Service initialized')
  }

  // 页面浏览追踪
  trackPageView(page: string, title: string) {
    const data: PageViewData = {
      page,
      title,
      referrer: document.referrer,
      timestamp: Date.now()
    }

    // userBehaviorAnalytics.track('page_view', data)

    // 发送到 Google Analytics（如果配置）
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'page_view', {
        page_path: page,
        page_title: title
      })
    }

    console.log('[Analytics] Page view tracked:', page)
  }

  // 工具使用追踪
  trackToolUsage(toolName: string, action: string, options: {
    duration?: number
    success?: boolean
    metadata?: any
  } = {}) {
    const data: ToolUsageData = {
      toolName,
      action,
      duration: options.duration,
      success: options.success ?? true,
      timestamp: Date.now()
    }

    // userBehaviorAnalytics.track('tool_usage', {
    //   ...data,
    //   ...options.metadata
    // })

    // 发送到 Google Analytics
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'tool_usage', {
        tool_name: toolName,
        action,
        success: options.success ?? true
      })
    }

    console.log('[Analytics] Tool usage tracked:', toolName, action)
  }

  // 资源下载追踪
  trackResourceDownload(resourceId: string, resourceType: string, resourceName: string) {
    const data: ResourceDownloadData = {
      resourceId,
      resourceType,
      resourceName,
      timestamp: Date.now()
    }

    // userBehaviorAnalytics.track('resource_download', data)

    // 发送到 Google Analytics
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'download', {
        resource_id: resourceId,
        resource_type: resourceType,
        resource_name: resourceName
      })
    }

    console.log('[Analytics] Resource download tracked:', resourceName)
  }

  // 转化漏斗追踪
  trackConversionFunnel(funnelStep: string, action: string, value?: number) {
    const data: ConversionData = {
      funnelStep,
      action,
      value,
      timestamp: Date.now()
    }

    // userBehaviorAnalytics.track('conversion_funnel', data)

    // 发送到 Google Analytics
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'conversion', {
        funnel_step: funnelStep,
        action,
        value
      })
    }

    console.log('[Analytics] Conversion funnel tracked:', funnelStep, action)
  }

  // CTA 点击追踪
  trackCTAClick(ctaId: string, ctaText: string, location: string) {
    const data: CTAClickData = {
      ctaId,
      ctaText,
      location,
      timestamp: Date.now()
    }

    // userBehaviorAnalytics.track('cta_click', data)

    // 发送到 Google Analytics
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'cta_click', {
        cta_id: ctaId,
        cta_text: ctaText,
        location
      })
    }

    console.log('[Analytics] CTA click tracked:', ctaId, location)
  }

  // 自定义事件追踪
  trackEvent(eventName: string, properties?: Record<string, any>) {
    // userBehaviorAnalytics.track(eventName, properties || {})

    // 发送到 Google Analytics
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', eventName, properties)
    }

    console.log('[Analytics] Custom event tracked:', eventName, properties)
  }

  // 用户属性设置
  setUserProperties(properties: Record<string, any>) {
    // userBehaviorAnalytics.setUserProperties(properties)

    // 发送到 Google Analytics
    if (typeof window.gtag !== 'undefined') {
      window.gtag('set', 'user_properties', properties)
    }

    console.log('[Analytics] User properties set:', properties)
  }

  // 获取会话统计
  getSessionStats() {
    // return userBehaviorAnalytics.getSessionStats()
    return {}
  }

  // 获取性能报告
  getPerformanceReport() {
    // return performanceMonitor.getPerformanceReport()
    return {}
  }

  // 获取错误统计
  getErrorStats() {
    // return errorMonitor.getErrorStats()
    return {}
  }

  // 记录错误
  trackError(error: Error, context?: any) {
    // errorMonitor.recordCustomError(error.message, 'high', {
    //   stack: error.stack,
    //   ...context
    // })

    // userBehaviorAnalytics.trackError(error, context)

    console.error('[Analytics] Error tracked:', error, context)
  }

  // 记录性能指标
  trackPerformance(metricName: string, value: number, extra?: any) {
    // performanceMonitor.recordCustomMetric(metricName, value, extra)

    console.log('[Analytics] Performance metric tracked:', metricName, value)
  }

  // 清理和发送数据
  flush() {
    // performanceMonitor.flushMetrics()
    // errorMonitor.flushErrors()
    // userBehaviorAnalytics.flushActions()
    // userBehaviorAnalytics.flushPageViews()

    console.log('[Analytics] Data flushed')
  }

  // 销毁服务
  destroy() {
    // performanceMonitor.destroy()
    // errorMonitor.destroy()
    // userBehaviorAnalytics.destroy()

    this.isInitialized = false
    console.log('[Analytics] Service destroyed')
  }
}

// 创建全局实例
export const analyticsService = new AnalyticsService()

// 自动初始化
if (typeof window !== 'undefined') {
  analyticsService.initialize()
}

export default analyticsService
