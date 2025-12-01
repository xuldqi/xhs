<template>
  <div class="stats-counter">
    <div class="stat-item">
      <div class="stat-number">{{ displayedGuides }}</div>
      <div class="stat-label">份指南已生成</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const displayedGuides = ref(0)
const targetGuides = ref(10247) // 目标数字

// 数字滚动动画
const animateNumber = () => {
  const duration = 2000 // 2秒
  const steps = 60
  const increment = targetGuides.value / steps
  let current = 0

  const timer = setInterval(() => {
    current += increment
    if (current >= targetGuides.value) {
      displayedGuides.value = targetGuides.value
      clearInterval(timer)
    } else {
      displayedGuides.value = Math.floor(current)
    }
  }, duration / steps)
}

// 从localStorage获取真实数据（如果有）
const loadRealStats = () => {
  const stored = localStorage.getItem('total_guides_generated')
  if (stored) {
    const count = parseInt(stored)
    if (count > targetGuides.value) {
      targetGuides.value = count
    }
  }
}

// 增加计数
const incrementCount = () => {
  targetGuides.value++
  localStorage.setItem('total_guides_generated', targetGuides.value.toString())
}

onMounted(() => {
  loadRealStats()
  animateNumber()
})

defineExpose({
  incrementCount
})
</script>

<style scoped>
.stats-counter {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 1.75rem;  /* 缩小 */
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.75rem;  /* 缩小 */
  color: #6b7280;
  font-weight: 500;
}

@media (max-width: 768px) {
  .stat-number {
    font-size: 1.5rem;
  }

  .stat-label {
    font-size: 0.7rem;
  }
}
</style>
