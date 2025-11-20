<template>
  <div class="professional-chart">
    <canvas :id="chartId" :ref="chartId"></canvas>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { Chart, registerables } from 'chart.js'
import type { ChartData } from '@/utils/professionalDataAnalyzer'

Chart.register(...registerables)

const props = defineProps<{
  data: ChartData
  chartId: string
}>()

const chartInstance = ref<Chart | null>(null)

onMounted(() => {
  createChart()
})

onBeforeUnmount(() => {
  if (chartInstance.value) {
    chartInstance.value.destroy()
  }
})

function createChart() {
  const canvas = document.getElementById(props.chartId) as HTMLCanvasElement
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // 配置图表
  const config: any = {
    type: props.data.type,
    data: {
      labels: props.data.labels,
      datasets: props.data.datasets.map(dataset => ({
        ...dataset,
        borderWidth: 2,
        tension: 0.4 // 平滑曲线
      }))
    },
    options: getChartOptions()
  }

  chartInstance.value = new Chart(ctx, config)
}

function getChartOptions() {
  const baseOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
          font: {
            family: "'Source Han Sans CN', 'Microsoft YaHei', sans-serif",
            size: 12
          },
          padding: 15,
          usePointStyle: true
        }
      },
      title: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          family: "'Source Han Sans CN', 'Microsoft YaHei', sans-serif",
          size: 14
        },
        bodyFont: {
          family: "'Source Han Sans CN', 'Microsoft YaHei', sans-serif",
          size: 13
        },
        padding: 12,
        cornerRadius: 8
      }
    }
  }

  // 根据图表类型添加特定配置
  if (props.data.type === 'bar' || props.data.type === 'line') {
    return {
      ...baseOptions,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            font: {
              family: "'Source Han Sans CN', 'Microsoft YaHei', sans-serif"
            }
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        },
        x: {
          ticks: {
            font: {
              family: "'Source Han Sans CN', 'Microsoft YaHei', sans-serif"
            }
          },
          grid: {
            display: false
          }
        }
      }
    }
  }

  if (props.data.type === 'radar') {
    return {
      ...baseOptions,
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          ticks: {
            stepSize: 20,
            font: {
              family: "'Source Han Sans CN', 'Microsoft YaHei', sans-serif"
            }
          },
          pointLabels: {
            font: {
              family: "'Source Han Sans CN', 'Microsoft YaHei', sans-serif",
              size: 12
            }
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        }
      }
    }
  }

  return baseOptions
}
</script>

<style scoped>
.professional-chart {
  width: 100%;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

canvas {
  max-width: 100%;
  max-height: 100%;
}

@media print {
  .professional-chart {
    page-break-inside: avoid;
  }
}
</style>
