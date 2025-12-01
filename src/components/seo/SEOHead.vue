<script setup lang="ts">
import { computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useHead } from '@vueuse/head'

interface Props {
  title?: string
  description?: string
  keywords?: string
  image?: string
  type?: string
  url?: string
  author?: string
  publishedTime?: string
  modifiedTime?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'website'
})

const route = useRoute()

// 默认值
const defaultTitle = '小红书增长攻略生成器 - AI 智能生成运营方案'
const defaultDescription = '专业的小红书运营工具平台，提供 AI 智能攻略生成、数据分析、案例库、知识库等功能，帮助你快速提升小红书账号影响力'
const defaultKeywords = '小红书,小红书运营,小红书涨粉,小红书攻略,小红书工具,内容运营,社交媒体营销'
const defaultImage = 'https://yourdomain.com/og-image.jpg'
const siteName = '小红书增长攻略'

// 计算完整标题
const fullTitle = computed(() => {
  if (!props.title) return defaultTitle
  return `${props.title} - ${siteName}`
})

// 计算完整 URL
const fullUrl = computed(() => {
  if (props.url) return props.url
  return `https://yourdomain.com${route.fullPath}`
})

// 使用 @vueuse/head 管理 head 标签
useHead({
  title: fullTitle,
  meta: [
    // 基础 meta 标签
    {
      name: 'description',
      content: computed(() => props.description || defaultDescription)
    },
    {
      name: 'keywords',
      content: computed(() => props.keywords || defaultKeywords)
    },
    {
      name: 'author',
      content: computed(() => props.author || siteName)
    },
    
    // Open Graph 标签
    {
      property: 'og:title',
      content: fullTitle
    },
    {
      property: 'og:description',
      content: computed(() => props.description || defaultDescription)
    },
    {
      property: 'og:type',
      content: computed(() => props.type)
    },
    {
      property: 'og:url',
      content: fullUrl
    },
    {
      property: 'og:image',
      content: computed(() => props.image || defaultImage)
    },
    {
      property: 'og:site_name',
      content: siteName
    },
    
    // Twitter Card 标签
    {
      name: 'twitter:card',
      content: 'summary_large_image'
    },
    {
      name: 'twitter:title',
      content: fullTitle
    },
    {
      name: 'twitter:description',
      content: computed(() => props.description || defaultDescription)
    },
    {
      name: 'twitter:image',
      content: computed(() => props.image || defaultImage)
    },
    
    // 文章特定标签
    ...(props.type === 'article' ? [
      {
        property: 'article:published_time',
        content: computed(() => props.publishedTime || '')
      },
      {
        property: 'article:modified_time',
        content: computed(() => props.modifiedTime || '')
      },
      {
        property: 'article:author',
        content: computed(() => props.author || siteName)
      }
    ] : [])
  ],
  
  // 结构化数据
  script: [
    {
      type: 'application/ld+json',
      children: computed(() => JSON.stringify({
        '@context': 'https://schema.org',
        '@type': props.type === 'article' ? 'Article' : 'WebSite',
        name: fullTitle.value,
        description: props.description || defaultDescription,
        url: fullUrl.value,
        image: props.image || defaultImage,
        ...(props.type === 'article' && {
          datePublished: props.publishedTime,
          dateModified: props.modifiedTime,
          author: {
            '@type': 'Organization',
            name: props.author || siteName
          }
        })
      }))
    }
  ]
})
</script>

<template>
  <!-- 这个组件不渲染任何内容 -->
</template>
