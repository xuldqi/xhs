/**
 * 导航结构数据
 * 根据设计文档定义的导航结构
 */

import type { NavigationItem } from '@/types/navigation'

export const navigationStructure: NavigationItem[] = [
  {
    id: 'home',
    label: '首页',
    path: '/'
  },
  {
    id: 'knowledge',
    label: '知识库',
    path: '/knowledge',
    badge: 'new',
    children: [
      {
        id: 'beginner',
        label: '新手入门',
        path: '/knowledge/beginner',
        description: '从零开始学习小红书运营'
      },
      {
        id: 'content',
        label: '内容创作',
        path: '/knowledge/content',
        description: '打造爆款内容的技巧'
      },
      {
        id: 'traffic',
        label: '流量获取',
        path: '/knowledge/traffic',
        description: '提升曝光和涨粉策略'
      },
      {
        id: 'data',
        label: '数据分析',
        path: '/knowledge/data',
        description: '用数据驱动运营决策'
      },
      {
        id: 'monetization',
        label: '变现指南',
        path: '/knowledge/monetization',
        description: '将流量转化为收入'
      }
    ]
  },
  {
    id: 'cases',
    label: '案例库',
    path: '/cases',
    description: '真实账号涨粉案例拆解'
  },
  {
    id: 'intelligence',
    label: '情报局',
    path: '/intelligence',
    badge: 'hot',
    description: '平台最新动态和规则变化'
  },
  {
    id: 'tools',
    label: '工具箱',
    path: '/tools',
    children: [
      {
        id: 'guide-generator',
        label: '涨粉指南生成器',
        path: '/',
        description: 'AI 生成个性化涨粉方案'
      },
      {
        id: 'viral-generator',
        label: '爆款生成器',
        path: '/tools/viral-generator',
        description: '一站式生成爆款内容',
        badge: 'hot'
      },
      {
        id: 'title-generator',
        label: '标题生成器',
        path: '/tools/title-generator',
        description: '生成吸引眼球的标题',
        badge: 'new'
      },
      {
        id: 'topic-analyzer',
        label: '话题分析',
        path: '/tools/topic-analyzer',
        description: '分析热门话题趋势',
        badge: 'new'
      },
      {
        id: 'competitor-analyzer',
        label: '竞品分析',
        path: '/tools/competitor-analyzer',
        description: '分析竞争对手策略',
        badge: 'new'
      }
    ]
  },
  {
    id: 'secrets',
    label: '涨粉秘籍',
    path: '/secrets',
    badge: 'vip',
    description: '实战经验和独家技巧'
  },
  {
    id: 'resources',
    label: '资源库',
    path: '/resources',
    description: '模板、SOP 和工具下载'
  },
  {
    id: 'community',
    label: '社区',
    path: '/community',
    badge: 'new',
    description: '与运营者交流经验'
  },
  {
    id: 'pricing',
    label: '会员套餐',
    path: '/pricing',
    badge: 'vip'
  }
]

// 移动端简化导航（可选）
export const mobileNavigationStructure: NavigationItem[] = [
  {
    id: 'home',
    label: '首页',
    path: '/'
  },
  {
    id: 'knowledge',
    label: '知识库',
    path: '/knowledge',
    badge: 'new'
  },
  {
    id: 'cases',
    label: '案例库',
    path: '/cases'
  },
  {
    id: 'intelligence',
    label: '情报局',
    path: '/intelligence',
    badge: 'hot'
  },
  {
    id: 'tools',
    label: '工具箱',
    path: '/tools'
  },
  {
    id: 'secrets',
    label: '涨粉秘籍',
    path: '/secrets',
    badge: 'vip'
  },
  {
    id: 'resources',
    label: '资源库',
    path: '/resources'
  },
  {
    id: 'community',
    label: '社区',
    path: '/community',
    badge: 'new'
  },
  {
    id: 'pricing',
    label: '会员',
    path: '/pricing',
    badge: 'vip'
  }
]
