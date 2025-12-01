/**
 * 响应式设计 Composable
 * 提供移动端检测和响应式断点功能
 */

import { ref, onMounted, onUnmounted, computed } from 'vue'

export interface Breakpoints {
  sm: number
  md: number
  lg: number
  xl: number
  '2xl': number
}

const defaultBreakpoints: Breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
}

export function useResponsive(breakpoints: Breakpoints = defaultBreakpoints) {
  const windowWidth = ref(0)

  const updateWidth = () => {
    windowWidth.value = window.innerWidth
  }

  onMounted(() => {
    updateWidth()
    window.addEventListener('resize', updateWidth)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateWidth)
  })

  const isMobile = computed(() => windowWidth.value < breakpoints.md)
  const isTablet = computed(() => windowWidth.value >= breakpoints.md && windowWidth.value < breakpoints.lg)
  const isDesktop = computed(() => windowWidth.value >= breakpoints.lg)
  
  const isSmallScreen = computed(() => windowWidth.value < breakpoints.sm)
  const isMediumScreen = computed(() => windowWidth.value >= breakpoints.sm && windowWidth.value < breakpoints.md)
  const isLargeScreen = computed(() => windowWidth.value >= breakpoints.md && windowWidth.value < breakpoints.lg)
  const isXLargeScreen = computed(() => windowWidth.value >= breakpoints.lg && windowWidth.value < breakpoints.xl)
  const is2XLargeScreen = computed(() => windowWidth.value >= breakpoints.xl)

  return {
    windowWidth,
    isMobile,
    isTablet,
    isDesktop,
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
    isXLargeScreen,
    is2XLargeScreen
  }
}

/**
 * 检测是否为触摸设备
 */
export function useTouchDevice() {
  const isTouchDevice = computed(() => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0
  })

  return {
    isTouchDevice
  }
}

/**
 * 获取安全的视口高度（考虑移动端地址栏）
 */
export function useViewportHeight() {
  const viewportHeight = ref(0)

  const updateHeight = () => {
    viewportHeight.value = window.innerHeight
  }

  onMounted(() => {
    updateHeight()
    window.addEventListener('resize', updateHeight)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateHeight)
  })

  return {
    viewportHeight
  }
}
