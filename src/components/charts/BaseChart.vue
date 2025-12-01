<template>
  <div class="base-chart" :style="{ width, height }">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Chart, ChartConfiguration, registerables } from 'chart.js'

// 注册 Chart.js 组件
Chart.register(...registerables)

interface Props {
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'radar' | 'polarArea'
  data: any
  options?: any
  width?: string
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  width: '100%',
  height: '400px',
  options: () => ({})
})

const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

const createChart = () => {
  if (!chartCanvas.value) return

  const config: ChartConfiguration = {
    type: props.type,
    data: props.data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      ...props.options
    }
  }

  chartInstance = new Chart(chartCanvas.value, config)
}

const updateChart = () => {
  if (!chartInstance) return

  chartInstance.data = props.data
  chartInstance.options = {
    responsive: true,
    maintainAspectRatio: false,
    ...props.options
  }
  chartInstance.update()
}

const destroyChart = () => {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
}

onMounted(() => {
  createChart()
})

onUnmounted(() => {
  destroyChart()
})

watch(() => [props.data, props.options], () => {
  updateChart()
}, { deep: true })

watch(() => props.type, () => {
  destroyChart()
  createChart()
})
</script>

<style scoped>
.base-chart {
  position: relative;
}
</style>
