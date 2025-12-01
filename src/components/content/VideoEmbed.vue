<template>
  <div class="video-embed" :class="{ loading: isLoading }">
    <div class="video-container" :style="{ paddingBottom: aspectRatio }">
      <iframe
        v-if="embedUrl"
        :src="embedUrl"
        :title="title"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
        @load="handleLoad"
      ></iframe>
      <div v-else class="video-placeholder">
        <p>无效的视频链接</p>
      </div>
    </div>
    <div v-if="caption" class="video-caption">
      {{ caption }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  url: string
  title?: string
  caption?: string
  aspectRatio?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '视频',
  aspectRatio: '56.25%' // 16:9
})

const isLoading = ref(true)

const embedUrl = computed(() => {
  const url = props.url

  // YouTube
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const videoId = extractYouTubeId(url)
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null
  }

  // Bilibili
  if (url.includes('bilibili.com')) {
    const videoId = extractBilibiliId(url)
    return videoId ? `https://player.bilibili.com/player.html?bvid=${videoId}` : null
  }

  // Vimeo
  if (url.includes('vimeo.com')) {
    const videoId = extractVimeoId(url)
    return videoId ? `https://player.vimeo.com/video/${videoId}` : null
  }

  // 直接嵌入链接
  if (url.includes('embed')) {
    return url
  }

  return null
})

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }

  return null
}

function extractBilibiliId(url: string): string | null {
  const patterns = [
    /bilibili\.com\/video\/(BV[^/?]+)/,
    /b23\.tv\/([^/?]+)/
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }

  return null
}

function extractVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/)
  return match ? match[1] : null
}

function handleLoad() {
  isLoading.value = false
}
</script>

<style scoped>
.video-embed {
  margin: 2rem 0;
}

.video-container {
  position: relative;
  width: 100%;
  height: 0;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.video-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.video-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  color: #999;
}

.video-caption {
  margin-top: 0.75rem;
  text-align: center;
  font-size: 0.9rem;
  color: #666;
  font-style: italic;
}

.video-embed.loading .video-container::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: translate(-50%, -50%) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(360deg); }
}

@media (max-width: 768px) {
  .video-embed {
    margin: 1.5rem 0;
  }

  .video-caption {
    font-size: 0.85rem;
  }
}
</style>
