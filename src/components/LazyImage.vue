<template>
  <div class="lazy-image-wrapper" :style="wrapperStyle">
    <img
      v-if="isLoaded || !lazy"
      :src="currentSrc"
      :alt="alt"
      :class="['lazy-image', { loaded: isLoaded }]"
      @load="handleLoad"
      @error="handleError"
    />
    <div v-else class="lazy-image-placeholder">
      <div class="placeholder-shimmer"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Props {
  src: string
  alt: string
  lazy?: boolean
  aspectRatio?: string
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  lazy: true,
  aspectRatio: '16/9'
})

const isLoaded = ref(false)
const hasError = ref(false)
const observer = ref<IntersectionObserver | null>(null)
const imgElement = ref<HTMLImageElement | null>(null)

const currentSrc = computed(() => {
  if (hasError.value && props.placeholder) {
    return props.placeholder
  }
  return props.src
})

const wrapperStyle = computed(() => ({
  aspectRatio: props.aspectRatio,
  position: 'relative',
  overflow: 'hidden',
  backgroundColor: 'var(--bg-secondary)'
}))

const handleLoad = () => {
  isLoaded.value = true
}

const handleError = () => {
  hasError.value = true
  isLoaded.value = true
}

onMounted(() => {
  if (props.lazy && 'IntersectionObserver' in window) {
    observer.value = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            isLoaded.value = true
            if (observer.value) {
              observer.value.disconnect()
            }
          }
        })
      },
      {
        rootMargin: '50px'
      }
    )

    const wrapper = imgElement.value?.parentElement
    if (wrapper) {
      observer.value.observe(wrapper)
    }
  } else {
    isLoaded.value = true
  }
})

onUnmounted(() => {
  if (observer.value) {
    observer.value.disconnect()
  }
})
</script>

<style scoped>
.lazy-image-wrapper {
  width: 100%;
  background-color: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.lazy-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity var(--transition-base);
}

.lazy-image.loaded {
  opacity: 1;
}

.lazy-image-placeholder {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background-color: var(--bg-secondary);
}

.placeholder-shimmer {
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    var(--bg-secondary) 0%,
    var(--bg-tertiary) 50%,
    var(--bg-secondary) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
</style>
