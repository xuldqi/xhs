<template>
  <div class="growth-chart">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import type { TimelineEvent } from '@/types/content'

interface Props {
  timeline: TimelineEvent[]
}

const props = defineProps<Props>()
const chartCanvas = ref<HTMLCanvasElement | null>(null)

const drawChart = () => {
  if (!chartCanvas.value || !props.timeline.length) return
  
  const canvas = chartCanvas.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  // 设置画布尺寸
  const dpr = window.devicePixelRatio || 1
  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
  ctx.scale(dpr, dpr)
  
  const width = rect.width
  const height = rect.height
  const padding = { top: 40, right: 40, bottom: 60, left: 60 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom
  
  // 提取数据
  const data = props.timeline
    .filter(event => event.metrics?.followers)
    .map(event => ({
      date: new Date(event.date),
      followers: event.metrics!.followers!
    }))
  
  if (data.length === 0) return
  
  // 计算比例
  const maxFollowers = Math.max(...data.map(d => d.followers))
  const minFollowers = Math.min(...data.map(d => d.followers))
  const followerRange = maxFollowers - minFollowers
  
  const xStep = chartWidth / (data.length - 1)
  
  // 清空画布
  ctx.clearRect(0, 0, width, height)
  
  // 绘制网格线
  ctx.strokeStyle = '#e5e7eb'
  ctx.lineWidth = 1
  
  // 水平网格线
  for (let i = 0; i <= 5; i++) {
    const y = padding.top + (chartHeight / 5) * i
    ctx.beginPath()
    ctx.moveTo(padding.left, y)
    ctx.lineTo(padding.left + chartWidth, y)
    ctx.stroke()
    
    // Y轴标签
    const value = maxFollowers - (followerRange / 5) * i
    ctx.fillStyle = '#6b7280'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText(formatNumber(value), padding.left - 10, y + 4)
  }
  
  // 绘制渐变填充
  const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight)
  gradient.addColorStop(0, 'rgba(16, 185, 129, 0.2)')
  gradient.addColorStop(1, 'rgba(16, 185, 129, 0)')
  
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.moveTo(padding.left, padding.top + chartHeight)
  
  data.forEach((point, index) => {
    const x = padding.left + xStep * index
    const y = padding.top + chartHeight - ((point.followers - minFollowers) / followerRange) * chartHeight
    
    if (index === 0) {
      ctx.lineTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })
  
  ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight)
  ctx.closePath()
  ctx.fill()
  
  // 绘制折线
  ctx.strokeStyle = '#10b981'
  ctx.lineWidth = 3
  ctx.beginPath()
  
  data.forEach((point, index) => {
    const x = padding.left + xStep * index
    const y = padding.top + chartHeight - ((point.followers - minFollowers) / followerRange) * chartHeight
    
    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })
  
  ctx.stroke()
  
  // 绘制数据点
  data.forEach((point, index) => {
    const x = padding.left + xStep * index
    const y = padding.top + chartHeight - ((point.followers - minFollowers) / followerRange) * chartHeight
    
    // 外圈
    ctx.fillStyle = 'white'
    ctx.beginPath()
    ctx.arc(x, y, 6, 0, Math.PI * 2)
    ctx.fill()
    
    // 内圈
    ctx.fillStyle = '#10b981'
    ctx.beginPath()
    ctx.arc(x, y, 4, 0, Math.PI * 2)
    ctx.fill()
  })
  
  // X轴标签
  ctx.fillStyle = '#6b7280'
  ctx.font = '12px sans-serif'
  ctx.textAlign = 'center'
  
  data.forEach((point, index) => {
    const x = padding.left + xStep * index
    const dateStr = formatDate(point.date)
    ctx.fillText(dateStr, x, padding.top + chartHeight + 20)
  })
  
  // 标题
  ctx.fillStyle = '#111827'
  ctx.font = 'bold 14px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('粉丝增长趋势', padding.left, padding.top - 15)
}

const formatNumber = (num: number) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}

const formatDate = (date: Date) => {
  return `${date.getMonth() + 1}/${date.getDate()}`
}

onMounted(() => {
  drawChart()
  
  // 响应窗口大小变化
  window.addEventListener('resize', drawChart)
})

watch(() => props.timeline, () => {
  drawChart()
}, { deep: true })
</script>

<style scoped>
.growth-chart {
  width: 100%;
  height: 400px;
}

canvas {
  width: 100%;
  height: 100%;
}
</style>
