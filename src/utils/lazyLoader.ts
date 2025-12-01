// 懒加载工具函数
import { defineAsyncComponent, type AsyncComponentLoader } from 'vue'

// 创建懒加载组件的工厂函数
export function createLazyComponent(
  loader: AsyncComponentLoader,
  options: {
    loadingComponent?: any
    errorComponent?: any
    delay?: number
    timeout?: number
  } = {}
) {
  return defineAsyncComponent({
    loader,
    loadingComponent: options.loadingComponent,
    errorComponent: options.errorComponent,
    delay: options.delay || 200,
    timeout: options.timeout || 3000
  })
}

// 预加载关键组件
export function preloadCriticalComponents() {
  // 在空闲时间预加载关键组件
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      // 预加载将在实际使用时触发
    })
  }
}

// 基于路由的预加载
export function preloadRouteComponents(routeName: string) {
  const preloadMap: Record<string, (() => Promise<any>)[]> = {
    'Home': [
      () => import('@/views/KnowledgeView.vue'),
      () => import('@/views/CasesView.vue'),
      () => import('@/views/ToolsView.vue')
    ],
    'Knowledge': [
      () => import('@/views/knowledge/ArticleDetailView.vue')
    ],
    'Cases': [
      () => import('@/views/cases/CaseDetailView.vue')
    ],
    'Intelligence': [
      () => import('@/views/intelligence/IntelligenceDetailView.vue')
    ],
    'Tools': [
      () => import('@/views/tools/TitleGeneratorView.vue')
    ]
  }
  
  const componentsToPreload = preloadMap[routeName]
  if (componentsToPreload) {
    componentsToPreload.forEach(loader => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => loader())
      } else {
        setTimeout(() => loader(), 1000)
      }
    })
  }
}
