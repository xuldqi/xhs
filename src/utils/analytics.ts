// Google Analytics 4 集成

interface AnalyticsEvent {
  action: string
  category: string
  label?: string
  value?: number
}

class Analytics {
  private initialized = false
  private measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID || ''

  // 初始化 GA4
  init() {
    if (this.initialized || !this.measurementId) {
      return
    }

    // 加载 gtag.js
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`
    document.head.appendChild(script)

    // 初始化 gtag
    window.dataLayer = window.dataLayer || []
    function gtag(...args: any[]) {
      window.dataLayer.push(arguments)
    }
    window.gtag = gtag

    gtag('js', new Date())
    gtag('config', this.measurementId, {
      send_page_view: true
    })

    this.initialized = true
    console.log('Google Analytics initialized')
  }

  // 追踪页面浏览
  trackPageView(path: string, title?: string) {
    if (!this.initialized) return

    window.gtag?.('event', 'page_view', {
      page_path: path,
      page_title: title || document.title
    })
  }

  // 追踪事件
  trackEvent(event: AnalyticsEvent) {
    if (!this.initialized) return

    window.gtag?.('event', event.action, {
      event_category: event.category,
      event_label: event.label,
      value: event.value
    })
  }

  // track 方法（兼容性方法，简化调用）
  track(action: string, params?: Record<string, any>) {
    if (!this.initialized) return

    // 将参数转换为 AnalyticsEvent 格式
    const event: AnalyticsEvent = {
      action: action,
      category: params?.category || 'general',
      label: params?.label,
      value: params?.value
    }

    this.trackEvent(event)

    // 同时发送自定义参数
    if (params) {
      window.gtag?.('event', action, params)
    }
  }

  // 追踪用户注册
  trackSignup(method: string = 'email') {
    this.trackEvent({
      action: 'sign_up',
      category: 'engagement',
      label: method
    })
  }

  // 追踪登录
  trackLogin(method: string = 'email') {
    this.trackEvent({
      action: 'login',
      category: 'engagement',
      label: method
    })
  }

  // 追踪图片上传
  trackUpload(imageCount: number) {
    this.trackEvent({
      action: 'upload_image',
      category: 'engagement',
      label: 'screenshot',
      value: imageCount
    })
  }

  // 追踪指南生成
  trackGenerateGuide(accountName?: string) {
    this.trackEvent({
      action: 'generate_guide',
      category: 'conversion',
      label: accountName || 'unknown'
    })
  }

  // 追踪导出
  trackExport(format: string = 'pdf') {
    this.trackEvent({
      action: 'export_guide',
      category: 'engagement',
      label: format
    })
  }

  // 追踪支付
  trackPurchase(planType: string, amount: number) {
    if (!this.initialized) return

    window.gtag?.('event', 'purchase', {
      transaction_id: Date.now().toString(),
      value: amount,
      currency: 'CNY',
      items: [{
        item_id: planType,
        item_name: `${planType}_plan`,
        price: amount,
        quantity: 1
      }]
    })
  }

  // 追踪分享
  trackShare(method: string = 'link') {
    this.trackEvent({
      action: 'share',
      category: 'engagement',
      label: method
    })
  }

  // 追踪错误
  trackError(errorMessage: string, errorType: string = 'general') {
    this.trackEvent({
      action: 'error',
      category: 'error',
      label: `${errorType}: ${errorMessage}`
    })
  }

  // 追踪搜索
  trackSearch(searchTerm: string) {
    if (!this.initialized) return

    window.gtag?.('event', 'search', {
      search_term: searchTerm
    })
  }

  // 追踪转化漏斗
  trackFunnelStep(step: string, stepNumber: number) {
    this.trackEvent({
      action: 'funnel_step',
      category: 'conversion',
      label: step,
      value: stepNumber
    })
  }
}

// 扩展 Window 接口
declare global {
  interface Window {
    dataLayer: any[]
    gtag?: (...args: any[]) => void
  }
}

export const analytics = new Analytics()

// 自动初始化
if (typeof window !== 'undefined') {
  analytics.init()
}
