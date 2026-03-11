<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { useRoute } from 'vue-router'

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

function upsertMeta(selector: string, attrs: Record<string, string>) {
  let el = document.head.querySelector(selector) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    document.head.appendChild(el)
  }
  Object.entries(attrs).forEach(([key, value]) => el!.setAttribute(key, value))
}

watchEffect(() => {
  if (typeof document === 'undefined') return

  document.title = fullTitle.value

  const description = props.description || defaultDescription
  const keywords = props.keywords || defaultKeywords
  const author = props.author || siteName
  const image = props.image || defaultImage
  const type = props.type || 'website'

  upsertMeta('meta[name="description"]', { name: 'description', content: description })
  upsertMeta('meta[name="keywords"]', { name: 'keywords', content: keywords })
  upsertMeta('meta[name="author"]', { name: 'author', content: author })

  upsertMeta('meta[property="og:title"]', { property: 'og:title', content: fullTitle.value })
  upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description })
  upsertMeta('meta[property="og:type"]', { property: 'og:type', content: type })
  upsertMeta('meta[property="og:url"]', { property: 'og:url', content: fullUrl.value })
  upsertMeta('meta[property="og:image"]', { property: 'og:image', content: image })
  upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: siteName })

  upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' })
  upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: fullTitle.value })
  upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description })
  upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: image })
})
</script>

<template>
  <!-- 这个组件不渲染任何内容 -->
</template>
