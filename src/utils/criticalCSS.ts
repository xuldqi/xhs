// 关键CSS管理工具
export class CriticalCSS {
  private static criticalStyles: string[] = []
  private static isInlined = false

  // 定义关键CSS
  static readonly CRITICAL_STYLES = `
    /* 重置样式 */
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    /* 基础字体和颜色 */
    html {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #fff;
    }
    
    body {
      font-size: 16px;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    /* 布局容器 */
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }
    
    /* 头部样式 */
    .app-header {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid #e5e7eb;
    }
    
    /* 懒加载图片 */
    img.lazy {
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    img.lazy.loaded {
      opacity: 1;
    }
    
    /* 骨架屏 */
    .skeleton {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
    }
    
    @keyframes loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `

  // 内联关键CSS
  static inlineCriticalCSS() {
    if (this.isInlined) return

    const style = document.createElement('style')
    style.id = 'critical-css'
    style.textContent = this.CRITICAL_STYLES
    document.head.insertBefore(style, document.head.firstChild)
    
    this.isInlined = true
  }

  // 添加自定义关键样式
  static addCriticalStyle(css: string) {
    this.criticalStyles.push(css)
  }

  // 获取所有关键样式
  static getAllCriticalStyles(): string {
    return [this.CRITICAL_STYLES, ...this.criticalStyles].join('\n')
  }

  // 移除关键CSS（在完整CSS加载后）
  static removeCriticalCSS() {
    const criticalStyle = document.getElementById('critical-css')
    if (criticalStyle) {
      criticalStyle.remove()
      this.isInlined = false
    }
  }
}

// 自动内联关键CSS
if (typeof window !== 'undefined') {
  CriticalCSS.inlineCriticalCSS()
}
