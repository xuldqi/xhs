/**
 * 导航系统类型定义
 */

export interface NavigationItem {
  id: string
  label: string
  path: string
  children?: NavigationItem[]
  icon?: string
  badge?: 'new' | 'hot' | 'vip'
  description?: string
  external?: boolean
}

export interface NavigationGroup {
  id: string
  title: string
  items: NavigationItem[]
}

export interface MobileMenuProps {
  isOpen: boolean
  items: NavigationItem[]
  onClose: () => void
}

export interface NavigationBarProps {
  items: NavigationItem[]
  currentPath: string
  isMobile: boolean
}
