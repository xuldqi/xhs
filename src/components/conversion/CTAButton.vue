<template>
  <el-button
    :class="['cta-button', `cta-${variant}`, { 'cta-pulsing': pulsing }]"
    :type="type"
    :size="size"
    :icon="icon"
    :loading="loading"
    @click="handleClick"
  >
    <slot>{{ text }}</slot>
  </el-button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { analytics } from '@/utils/analytics'

interface Props {
  text?: string
  variant?: 'primary' | 'secondary' | 'success' | 'warning'
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default'
  size?: 'large' | 'default' | 'small'
  icon?: any
  link?: string
  pulsing?: boolean
  trackingId?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  type: 'primary',
  size: 'large',
  pulsing: false
})

const emit = defineEmits<{
  click: []
}>()

const router = useRouter()
const loading = ref(false)

const handleClick = async () => {
  // 追踪点击
  if (props.trackingId) {
    analytics.track('cta_click', {
      ctaId: props.trackingId,
      variant: props.variant,
      text: props.text
    })
  }
  
  emit('click')
  
  // 如果有链接，导航到目标页面
  if (props.link) {
    if (props.link.startsWith('http')) {
      window.open(props.link, '_blank')
    } else {
      router.push(props.link)
    }
  }
}
</script>

<style scoped>
.cta-button {
  font-weight: 600;
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
}

.cta-button::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.cta-button:hover::before {
  width: 300px;
  height: 300px;
}

.cta-primary {
  box-shadow: 0 4px 14px 0 rgba(255, 36, 66, 0.4);
}

.cta-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px 0 rgba(255, 36, 66, 0.5);
}

.cta-secondary {
  box-shadow: 0 4px 14px 0 rgba(107, 114, 128, 0.3);
}

.cta-secondary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px 0 rgba(107, 114, 128, 0.4);
}

.cta-success {
  box-shadow: 0 4px 14px 0 rgba(16, 185, 129, 0.4);
}

.cta-success:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px 0 rgba(16, 185, 129, 0.5);
}

.cta-warning {
  box-shadow: 0 4px 14px 0 rgba(245, 158, 11, 0.4);
}

.cta-warning:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px 0 rgba(245, 158, 11, 0.5);
}

.cta-pulsing {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 36, 66, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(255, 36, 66, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 36, 66, 0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .cta-button {
    width: 100%;
  }
}
</style>
