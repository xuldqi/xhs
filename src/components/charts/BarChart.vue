<template>
  <BaseChart
    type="bar"
    :data="chartData"
    :options="chartOptions"
    :width="width"
    :height="height"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseChart from './BaseChart.vue'

interface Props {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
  }>
  width?: string
  height?: string
  showLegend?: boolean
  horizontal?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  width: '100%',
  height: '400px',
  showLegend: true,
  horizontal: false
})

const chartData = computed(() => ({
  labels: props.labels,
  datasets: props.datasets.map((dataset, index) => ({
    label: dataset.label,
    data: dataset.data,
    backgroundColor: dataset.backgroundColor || getDefaultColors(dataset.data.length, 0.8),
    borderColor: dataset.borderColor || getDefaultColors(dataset.data.length, 1),
    borderWidth: 1
  }))
}))

const chartOptions = computed(() => ({
  indexAxis: props.horizontal ? 'y' as const : 'x' as const,
  plugins: {
    legend: {
      display: props.showLegend,
      position: 'top' as const
    }
  },
  scales: {
    x: {
      beginAtZero: true
    },
    y: {
      beginAtZero: true
    }
  }
}))

function getDefaultColors(count: number, alpha = 1): string[] {
  const baseColors = [
    [255, 99, 132],
    [54, 162, 235],
    [255, 206, 86],
    [75, 192, 192],
    [153, 102, 255],
    [255, 159, 64]
  ]
  
  return Array.from({ length: count }, (_, i) => {
    const color = baseColors[i % baseColors.length]
    return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`
  })
}
</script>
