<template>
  <BaseChart
    type="line"
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
    borderColor?: string
    backgroundColor?: string
    fill?: boolean
  }>
  width?: string
  height?: string
  showLegend?: boolean
  showGrid?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  width: '100%',
  height: '400px',
  showLegend: true,
  showGrid: true
})

const chartData = computed(() => ({
  labels: props.labels,
  datasets: props.datasets.map((dataset, index) => ({
    label: dataset.label,
    data: dataset.data,
    borderColor: dataset.borderColor || getDefaultColor(index),
    backgroundColor: dataset.backgroundColor || getDefaultColor(index, 0.1),
    fill: dataset.fill ?? false,
    tension: 0.4
  }))
}))

const chartOptions = computed(() => ({
  plugins: {
    legend: {
      display: props.showLegend,
      position: 'top' as const
    },
    tooltip: {
      mode: 'index' as const,
      intersect: false
    }
  },
  scales: {
    x: {
      grid: {
        display: props.showGrid
      }
    },
    y: {
      grid: {
        display: props.showGrid
      },
      beginAtZero: true
    }
  }
}))

function getDefaultColor(index: number, alpha = 1): string {
  const colors = [
    `rgba(255, 99, 132, ${alpha})`,
    `rgba(54, 162, 235, ${alpha})`,
    `rgba(255, 206, 86, ${alpha})`,
    `rgba(75, 192, 192, ${alpha})`,
    `rgba(153, 102, 255, ${alpha})`,
    `rgba(255, 159, 64, ${alpha})`
  ]
  return colors[index % colors.length]
}
</script>
