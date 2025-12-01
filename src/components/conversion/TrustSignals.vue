<template>
  <div class="trust-signals">
    <div class="container">
      <div class="signals-grid">
        <div
          v-for="signal in signals"
          :key="signal.id"
          class="signal-item"
        >
          <div class="signal-icon" :class="`icon-${signal.type}`">
            <el-icon><component :is="signal.icon" /></el-icon>
          </div>
          
          <div class="signal-content">
            <div class="signal-value">{{ signal.value }}</div>
            <div class="signal-label">{{ signal.label }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { User, Document, TrendCharts, Star } from '@element-plus/icons-vue'

interface Signal {
  id: string
  type: 'users' | 'content' | 'growth' | 'rating'
  icon: any
  value: string
  label: string
}

// 响应式数据
const signals = ref<Signal[]>([
  {
    id: '1',
    type: 'users',
    icon: User,
    value: '10,000+',
    label: '活跃用户'
  },
  {
    id: '2',
    type: 'content',
    icon: Document,
    value: '500+',
    label: '优质内容'
  },
  {
    id: '3',
    type: 'growth',
    icon: TrendCharts,
    value: '300%',
    label: '平均增长'
  },
  {
    id: '4',
    type: 'rating',
    icon: Star,
    value: '4.9/5.0',
    label: '用户评分'
  }
])
</script>

<style scoped>
.trust-signals {
  padding: 48px 0;
  background: white;
}

.container {
  max-width: var(--container-xl);
  margin: 0 auto;
  padding: 0 20px;
}

.signals-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 32px;
}

.signal-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  transition: all var(--transition-normal);
}

.signal-item:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.signal-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  flex-shrink: 0;
}

.icon-users {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.icon-content {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.icon-growth {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.icon-rating {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.signal-content {
  flex: 1;
}

.signal-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.signal-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .signals-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .signals-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .signal-item {
    padding: 20px;
  }
  
  .signal-value {
    font-size: 1.5rem;
  }
}
</style>
