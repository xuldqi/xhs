# 性能优化文档

## 概述

本项目实施了全面的性能优化策略，以确保快速的加载时间和流畅的用户体验。

## 优化策略

### 1. 代码分割和懒加载

#### 路由级别懒加载
所有路由组件都使用动态导入实现懒加载：

```typescript
{
  path: '/knowledge',
  component: () => import('@/views/KnowledgeView.vue')
}
```

#### 组件级别懒加载
重型组件（图表、视频、复杂UI）使用懒加载：

```typescript
const VideoEmbed = defineAsyncComponent(() => import('@/components/content/VideoEmbed.vue'))
```

#### 智能预加载
- 关键路由在空闲时间预加载
- 基于用户导航模式预测性预加载
- 使用 `requestIdleCallback` 优化预加载时机

### 2. 图片优化

#### 现代图片格式
- 自动检测并使用 AVIF/WebP 格式
- 降级到 JPEG/PNG 以支持旧浏览器

#### 响应式图片
```typescript
// 生成多尺寸图片源集
const srcSet = await ImageOptimizer.generateSrcSet(
  '/images/hero.jpg',
  [640, 768, 1024, 1280, 1920]
)
```

#### 懒加载
- 使用 IntersectionObserver 实现图片懒加载
- 预加载视口附近的图片（rootMargin: 50px）
- 占位符和加载状态

#### 压缩和优化
- 客户端图片压缩
- 自动生成缩略图
- 优化的图片尺寸和质量

### 3. 资源优化

#### 关键CSS内联
```typescript
// 首屏关键样式内联到 HTML
CriticalCSS.inlineCriticalCSS()
```

#### 字体优化
- 使用 `font-display: swap` 避免FOIT
- 预加载关键字体
- 子集化字体文件

#### 资源提示
```html
<!-- DNS预解析 -->
<link rel="dns-prefetch" href="//fonts.googleapis.com">

<!-- 预连接 -->
<link rel="preconnect" href="https://fonts.googleapis.com">

<!-- 预加载关键资源 -->
<link rel="preload" href="/fonts/inter-var.woff2" as="font">
```

### 4. 缓存策略

#### Service Worker
实施多层缓存策略：

- **静态资源**: Cache First
- **API请求**: Network First with Cache Fallback
- **图片**: Cache First with Network Fallback
- **导航**: Network First with Offline Page

#### 缓存管理
- 自动清理过期缓存（7天）
- 版本化缓存名称
- 智能缓存更新

### 5. 构建优化

#### Vite配置
```typescript
{
  build: {
    // 代码分割
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'ui-vendor': ['@headlessui/vue', '@heroicons/vue'],
          'chart-vendor': ['chart.js']
        }
      }
    },
    // 压缩
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
}
```

#### 依赖优化
- 预构建常用依赖
- Tree-shaking 移除未使用代码
- 动态导入大型库

### 6. 性能监控

#### Core Web Vitals
监控关键性能指标：

- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **FCP** (First Contentful Paint): < 1.8s
- **TTFB** (Time to First Byte): < 800ms

#### 性能报告
```typescript
const report = performanceOptimizer.generatePerformanceReport()
// {
//   metrics: { lcp: 2100, fid: 50, cls: 0.05, ... },
//   recommendations: ['优化建议...'],
//   score: 95
// }
```

#### 开发工具
- 实时性能监控面板（开发环境）
- 性能报告导出
- Bundle 分析可视化

## 性能目标

### 加载性能
- 首次内容绘制 (FCP): < 1.8s
- 最大内容绘制 (LCP): < 2.5s
- 首次输入延迟 (FID): < 100ms
- 累积布局偏移 (CLS): < 0.1

### 运行时性能
- 60 FPS 流畅动画
- < 100ms 交互响应时间
- < 50MB 内存占用

### 网络性能
- 首次加载 < 1MB (gzip)
- 后续导航 < 200KB
- 图片优化 > 70% 压缩率

## 使用指南

### 开发环境

#### 启用性能监控
```vue
<template>
  <PerformanceMonitor />
</template>
```

#### 查看Bundle分析
```bash
npm run build
# 查看 dist/stats.html
```

### 生产环境

#### 构建优化版本
```bash
npm run build
```

#### 验证性能
1. 使用 Lighthouse 测试
2. 检查 Core Web Vitals
3. 验证缓存策略
4. 测试离线功能

## 最佳实践

### 图片使用
```vue
<LazyImage
  :src="/images/hero.jpg"
  :alt="Hero Image"
  :width="1920"
  :height="1080"
  loading="lazy"
/>
```

### 组件懒加载
```typescript
const HeavyComponent = defineAsyncComponent({
  loader: () => import('./HeavyComponent.vue'),
  loadingComponent: LoadingSpinner,
  delay: 200,
  timeout: 3000
})
```

### 路由预加载
```typescript
// 在用户可能访问的路由上预加载
router.beforeEach((to, from, next) => {
  if (to.name === 'Home') {
    preloadRouteComponents('Knowledge')
    preloadRouteComponents('Cases')
  }
  next()
})
```

## 性能检查清单

- [ ] 所有路由使用懒加载
- [ ] 重型组件使用动态导入
- [ ] 图片使用现代格式 (AVIF/WebP)
- [ ] 图片实施懒加载
- [ ] 关键CSS内联
- [ ] 字体优化 (preload + font-display)
- [ ] Service Worker 配置
- [ ] 代码分割优化
- [ ] 移除 console.log (生产环境)
- [ ] Lighthouse 评分 > 90

## 监控和调试

### 性能监控面板
开发环境下，点击右下角的 📊 图标打开性能监控面板。

### Chrome DevTools
1. Performance 面板：分析运行时性能
2. Network 面板：检查资源加载
3. Lighthouse：综合性能评估
4. Coverage：查找未使用代码

### 性能API
```typescript
// 获取性能指标
const metrics = performanceOptimizer.getMetrics()

// 生成报告
const report = performanceOptimizer.generatePerformanceReport()

// 导出报告
console.log(JSON.stringify(report, null, 2))
```

## 持续优化

### 定期检查
- 每次发布前运行 Lighthouse
- 监控 Core Web Vitals
- 分析 Bundle 大小变化
- 检查缓存命中率

### 优化建议
1. 定期更新依赖以获取性能改进
2. 监控第三方脚本影响
3. 优化大型资源文件
4. 实施渐进式增强
5. 考虑使用 CDN

## 参考资源

- [Web Vitals](https://web.dev/vitals/)
- [Vite 性能优化](https://vitejs.dev/guide/performance.html)
- [Vue 性能优化](https://vuejs.org/guide/best-practices/performance.html)
- [Image Optimization](https://web.dev/fast/#optimize-your-images)
- [Service Worker](https://developers.google.com/web/fundamentals/primers/service-workers)
