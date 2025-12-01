// 性能优化工具
export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer
  private metrics: Map<string, number> = new Map()

  static getInstance(): PerformanceOptimizer {
    if (!this.instance) {
      this.instance = new PerformanceOptimizer()
    }
    return this.instance
  }

  // 初始化性能优化
  init() {
    this.monitorPerformance()
  }

  // 性能监控
  private monitorPerformance() {
    // 页面加载完成后记录指标
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        setTimeout(() => {
          this.recordNavigationMetrics()
        }, 0)
      })
    }
  }

  // 记录导航指标
  private recordNavigationMetrics() {
    if (typeof performance === 'undefined') return
    
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    if (navigation) {
      this.metrics.set('ttfb', navigation.responseStart - navigation.requestStart)
      this.metrics.set('domLoad', navigation.domContentLoadedEventEnd - navigation.navigationStart)
      this.metrics.set('load', navigation.loadEventEnd - navigation.navigationStart)
    }

    // FCP
    const paintEntries = performance.getEntriesByType('paint')
    const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint')
    if (fcpEntry) {
      this.metrics.set('fcp', fcpEntry.startTime)
    }
  }

  // 预加载关键路由
  preloadCriticalRoutes() {
    // 实现预加载逻辑
  }

  // 优化字体加载
  optimizeFontLoading() {
    // 实现字体优化逻辑
  }

  // 获取性能指标
  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics)
  }

  // 性能报告
  generatePerformanceReport(): {
    metrics: Record<string, number>
    recommendations: string[]
    score: number
  } {
    const metrics = this.getMetrics()
    const recommendations: string[] = []
    let score = 100

    // LCP 评估
    if (metrics.lcp && metrics.lcp > 4000) {
      recommendations.push('优化最大内容绘制时间 (LCP)')
      score -= 20
    }

    // FID 评估
    if (metrics.fid && metrics.fid > 300) {
      recommendations.push('减少首次输入延迟 (FID)')
      score -= 15
    }

    // CLS 评估
    if (metrics.cls && metrics.cls > 0.25) {
      recommendations.push('改善累积布局偏移 (CLS)')
      score -= 15
    }

    return {
      metrics,
      recommendations,
      score: Math.max(0, score)
    }
  }
}

// 导出单例实例
export const performanceOptimizer = PerformanceOptimizer.getInstance()

// 自动初始化
if (typeof window !== 'undefined') {
  performanceOptimizer.init()
}
