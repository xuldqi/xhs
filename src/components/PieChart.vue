<template>
  <div class="pie-chart">
    <svg :width="size" :height="size" viewBox="0 0 100 100">
      <circle
        v-for="(segment, index) in segments"
        :key="index"
        cx="50"
        cy="50"
        r="25"
        fill="transparent"
        :stroke="segment.color"
        :stroke-width="50"
        :stroke-dasharray="`${segment.percentage} ${100 - segment.percentage}`"
        :stroke-dashoffset="segment.offset"
        :transform="`rotate(-90 50 50)`"
      />
    </svg>
    
    <div class="legend">
      <div
        v-for="(item, index) in data"
        :key="index"
        class="legend-item"
      >
        <span class="legend-color" :style="{ background: colors[index % colors.length] }" />
        <span class="legend-label">{{ item.name }}</span>
        <span class="legend-value">{{ item.value }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface ChartData {
  name: string
  value: number
}

interface Props {
  data: ChartData[]
  size?: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 200
})

const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399']

const segments = computed(() => {
  let offset = 0
  return props.data.map((item, index) => {
    const segment = {
      percentage: item.value,
      offset: -offset,
      color: colors[index % colors.length]
    }
    offset += item.value
    return segment
  })
})
</script>

<style scoped>
.pie-chart {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin: 2rem 0;
}

svg {
  flex-shrink: 0;
}

.legend {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  flex-shrink: 0;
}

.legend-label {
  flex: 1;
  font-size: 0.95rem;
  color: #606266;
}

.legend-value {
  font-weight: 600;
  color: #409EFF;
  font-size: 0.95rem;
}

@media (max-width: 768px) {
  .pie-chart {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
