<template>
  <div class="brand-logo" :class="{ clickable: clickable }" @click="handleClick">
    <img :src="logoSrc" :alt="altText" class="logo-icon" :style="iconStyle" />
    <span v-if="showText" class="logo-text" :style="textStyle">{{ text }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

interface Props {
  size?: 'small' | 'medium' | 'large'
  showText?: boolean
  clickable?: boolean
  text?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  showText: true,
  clickable: true,
  text: '小红书流量学院'
})

const router = useRouter()

const logoSrc = '/favicon.svg'
const altText = '小红书流量学院'

const iconStyle = computed(() => {
  const sizes = {
    small: '24px',
    medium: '36px',
    large: '48px'
  }
  return {
    width: sizes[props.size],
    height: sizes[props.size]
  }
})

const textStyle = computed(() => {
  const fontSizes = {
    small: '1rem',
    medium: '1.25rem',
    large: '1.5rem'
  }
  return {
    fontSize: fontSizes[props.size]
  }
})

const handleClick = () => {
  if (props.clickable) {
    router.push('/')
  }
}
</script>

<style scoped>
.brand-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  user-select: none;
}

.brand-logo.clickable {
  cursor: pointer;
  transition: opacity var(--transition-base);
}

.brand-logo.clickable:hover {
  opacity: 0.8;
}

.logo-icon {
  border-radius: var(--radius-md);
  object-fit: contain;
}

.logo-text {
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  white-space: nowrap;
}
</style>
