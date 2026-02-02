/**
 * 导航结构 - 精简版（SaaS 工具定位）
 * 目标：让用户进来只有一条路——点击「免费诊断」
 */

import type { NavigationItem } from '@/types/navigation'

// 桌面端：3-4 个核心入口
export const navigationStructure: NavigationItem[] = [
  {
    id: 'products',
    label: '产品功能',
    path: '/',
    children: [
      { id: 'diagnosis', label: '账号诊断', path: '/analysis' },
      { id: 'calendar', label: 'AI 内容日历', path: '/calendar', badge: 'new' },
      { id: 'title-generator', label: '标题生成器', path: '/tools/title-generator' },
      { id: 'topic-analyzer', label: '话题分析工具', path: '/tools/topic-analyzer' },
      { id: 'competitor-analyzer', label: '竞品分析工具', path: '/tools/competitor-analyzer' },
      { id: 'keyword-tool', label: 'SEO 关键词工具', path: '/tools/keyword-tool' },
      { id: 'scheduler', label: '定时发布工具', path: '/tools/scheduler' },
      { id: 'tools', label: '工具箱（全部）', path: '/tools' }
    ]
  },
  {
    id: 'pricing',
    label: '价格',
    path: '/pricing'
  },
  {
    id: 'resources',
    label: '资源中心',
    path: '/knowledge',
    children: [
      { id: 'knowledge', label: '知识库', path: '/knowledge' },
      { id: 'cases', label: '案例库', path: '/cases' },
      { id: 'intelligence', label: '情报局', path: '/intelligence' },
      { id: 'community', label: '社区', path: '/community' }
    ]
  }
]

// 移动端：简化版
export const mobileNavigationStructure: NavigationItem[] = [
  { id: 'home', label: '首页', path: '/' },
  { id: 'diagnosis', label: '账号诊断', path: '/analysis' },
  { id: 'calendar', label: '内容日历', path: '/calendar' },
  { id: 'tools', label: '工具箱', path: '/tools' },
  { id: 'pricing', label: '价格', path: '/pricing' },
  { id: 'resources', label: '资源中心', path: '/knowledge' },
  { id: 'community', label: '社区', path: '/community' }
]
