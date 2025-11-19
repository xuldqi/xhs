/**
 * 移动端优化工具
 * 检测设备类型，优化移动端体验
 */

import { ref, computed, readonly, onMounted, onUnmounted } from 'vue'

export interface DeviceInfo {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  screenWidth: number
  screenHeight: number
  devicePixelRatio: number
  touchSupport: boolean
  orientation: 'portrait' | 'landscape'
}

class MobileOptimizer {
  private deviceInfo: DeviceInfo
  private listeners: Array<(info: DeviceInfo) => void> = []

  constructor() {
    this.deviceInfo = this.detectDevice()
    this.setupListeners()
  }

  /**
   * 检测设备信息
   */
  private detectDevice(): DeviceInfo {
    const width = window.innerWidth
    const height = window.innerHeight
    const userAgent = navigator.userAgent.toLowerCase()
    
    // 检测移动设备
    const isMobile = width <= 768 || /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
    const isTablet = width > 768 && width <= 1024
    const isDesktop = width > 1024
    
    // 检测触摸支持
    const touchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    
    // 检测屏幕方向
    const orientation = width > height ? 'landscape' : 'portrait'
    
    return {
      isMobile,
      isTablet,
      isDesktop,
      screenWidth: width,
      screenHeight: height,
      devicePixelRatio: window.devicePixelRatio || 1,
      touchSupport,
      orientation
    }
  }

  /**
   * 设置监听器
   */
  private setupListeners() {
    // 监听窗口大小变化
    window.addEventListener('resize', () => {
      const oldInfo = { ...this.deviceInfo }
      this.deviceInfo = this.detectDevice()
      
      // 如果设备类型发生变化，通知监听器
      if (this.hasSignificantChange(oldInfo, this.deviceInfo)) {
        this.notifyListeners()
      }
    })
    
    // 监听屏幕方向变化
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.deviceInfo = this.detectDevice()
        this.notifyListeners()
      }, 100)
    })
  }

  /**
   * 检查是否有重要变化
   */
  private hasSignificantChange(old: DeviceInfo, current: DeviceInfo): boolean {
    return (
      old.isMobile !== current.isMobile ||
      old.isTablet !== current.isTablet ||
      old.orientation !== current.orientation
    )
  }

  /**
   * 通知监听器
   */
  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.deviceInfo))
  }

  /**
   * 获取设备信息
   */
  getDeviceInfo(): DeviceInfo {
    return { ...this.deviceInfo }
  }

  /**
   * 添加监听器
   */
  addListener(listener: (info: DeviceInfo) => void) {
    this.listeners.push(listener)
  }

  /**
   * 移除监听器
   */
  removeListener(listener: (info: DeviceInfo) => void) {
    const index = this.listeners.indexOf(listener)
    if (index > -1) {
      this.listeners.splice(index, 1)
    }
  }

  /**
   * 优化移动端滚动
   */
  optimizeScrolling() {
    if (this.deviceInfo.isMobile) {
      // 添加平滑滚动
      document.documentElement.style.scrollBehavior = 'smooth'
      
      // 优化iOS滚动
      document.body.style.webkitOverflowScrolling = 'touch'
      
      // 防止橡皮筋效果
      document.addEventListener('touchmove', (e) => {
        if (e.target === document.body) {
          e.preventDefault()
        }
      }, { passive: false })
    }
  }

  /**
   * 优化移动端点击
   */
  optimizeTouch() {
    if (this.deviceInfo.touchSupport) {
      // 移除点击延迟
      const style = document.createElement('style')
      style.textContent = `
        * {
          touch-action: manipulation;
        }
        button, a, [role="button"] {
          cursor: pointer;
        }
      `
      document.head.appendChild(style)
    }
  }

  /**
   * 设置视口
   */
  setupViewport() {
    let viewport = document.querySelector('meta[name="viewport"]') as HTMLMetaElement
    
    if (!viewport) {
      viewport = document.createElement('meta')
      viewport.name = 'viewport'
      document.head.appendChild(viewport)
    }
    
    if (this.deviceInfo.isMobile) {
      viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
    } else {
      viewport.content = 'width=device-width, initial-scale=1.0'
    }
  }

  /**
   * 添加设备类名到body
   */
  addDeviceClasses() {
    const body = document.body
    
    // 清除旧的类名
    body.classList.remove('mobile', 'tablet', 'desktop', 'touch', 'portrait', 'landscape')
    
    // 添加新的类名
    if (this.deviceInfo.isMobile) body.classList.add('mobile')
    if (this.deviceInfo.isTablet) body.classList.add('tablet')
    if (this.deviceInfo.isDesktop) body.classList.add('desktop')
    if (this.deviceInfo.touchSupport) body.classList.add('touch')
    body.classList.add(this.deviceInfo.orientation)
  }

  /**
   * 初始化所有优化
   */
  init() {
    this.setupViewport()
    this.addDeviceClasses()
    this.optimizeScrolling()
    this.optimizeTouch()
    
    // 监听设备变化，更新类名
    this.addListener(() => {
      this.addDeviceClasses()
    })
  }
}

// 导出单例
export const mobileOptimizer = new MobileOptimizer()

/**
 * Vue组合式函数
 */
export function useMobileOptimizer() {
  const deviceInfo = ref(mobileOptimizer.getDeviceInfo())
  
  const updateDeviceInfo = (info: DeviceInfo) => {
    deviceInfo.value = info
  }
  
  onMounted(() => {
    mobileOptimizer.addListener(updateDeviceInfo)
  })
  
  onUnmounted(() => {
    mobileOptimizer.removeListener(updateDeviceInfo)
  })
  
  return {
    deviceInfo: readonly(deviceInfo),
    isMobile: computed(() => deviceInfo.value.isMobile),
    isTablet: computed(() => deviceInfo.value.isTablet),
    isDesktop: computed(() => deviceInfo.value.isDesktop),
    touchSupport: computed(() => deviceInfo.value.touchSupport),
    orientation: computed(() => deviceInfo.value.orientation)
  }
}
