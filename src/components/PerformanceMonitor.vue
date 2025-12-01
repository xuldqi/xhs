<template>
  <div v-if="isDev && showMonitor" class="performance-monitor">
    <div class="monitor-header">
      <h3>性能监控</h3>
      <button @click="toggleMonitor" class="close-btn">×</button>
    </div>
    
    <div class="monitor-content">
      <div class="metric-group">
        <h4>核心指标</h4>
        <div class="metric">
          <span class="label">LCP:</span>
          <span class="value" :class="getScoreClass(metrics.lcp, 2500, 4000)">
            {{ formatMetric(metrics.lcp) }}
          </span>
        </div>
        <div class="metric">
          <span class="label">FID:</span>
          <span class="value" :class="getScoreClass(metrics.fid, 100, 300)">
            {{ formatMetric(metrics.fid) }}
          </span>
        </div>
        <div class="metric">
          <span class="label">CLS:</span>
          <span class="value" :class="getScoreClass(metrics.cls * 1000, 100, 250)">
            {{ metrics.cls?.toFixed(3) || 'N/A' }}
          </span>
        </div>
        <div class="metric">
          <span class="label">FCP:</span>
          <span class="value" :class="getScoreClass(metrics.fcp, 1800, 3000)">
            {{ formatMetric(metrics.fcp) }}
          </span>
        </div>
        <div class="metric">
          <span class="label">TTFB:</span>
          <span class="value" :class="getScoreClass(metrics.ttfb, 800, 1800)">
            {{ formatMetric(metrics.ttfb) }}
          </span>
        </div>
      </div>
      
      <div class="metric-group">
        <h4>性能评分</h4>
        <div class="score-bar">
          <div 
            class="score-fill" 
            :style="{ width: `${report.score}%` }"
            :class="getScoreBarClass(report.score)"
          ></div>
          <span class="score-text">{{ report.score }}/100</span>
        </div>
      </div>
      
      <div v-if="report.recommendations.length > 0" class="metric-group">
        <h4>优化建议</h4>
        <ul class="recommendations">
          <li v-for="(rec, index) in report.recommendations" :key="index">
            {{ rec }}
          </li>
        </ul>
      </div>
      
      <div class="actions">
        <button @click="refreshMetrics" class="btn-refresh">刷新</button>
        <button @click="exportReport" class="btn-export">导出报告</button>
      </div>
    </div>
  </div>
  
  <button 
    v-if="isDev && !showMonitor" 
    @click="toggleMonitor" 
    class="monitor-toggle"
    title="显示性能监控"
  >
    📊
  </button>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { performanceOptimizer } from '@/utils/performanceOptimizer'

const isDev = import.meta.env.DEV
const showMonitor = ref(false)
const metrics = ref<Record<string, number>>({})
const report = ref({
  metrics: {},
  recommendations: [] as string[],
  score: 0
})

const toggleMonitor = () => {
  showMonitor.value = !showMonitor.value
}

const refreshMetrics = () => {
  metrics.value = performanceOptimizer.getMetrics()
  report.value = performanceOptimizer.generatePerformanceReport()
}

const formatMetric = (value: number | undefined): string => {
  if (value === undefined) return 'N/A'
  return `${Math.round(value)}ms`
}

const getScoreClass = (value: number | undefined, good: number, poor: number): string => {
  if (value === undefined) return ''
  if (value <= good) return 'good'
  if (value <= poor) return 'needs-improvement'
  return 'poor'
}

const getScoreBarClass = (score: number): string => {
  if (score >= 90) return 'good'
  if (score >= 50) return 'needs-improvement'
  return 'poor'
}

const exportReport = () => {
  const reportData = {
    timestamp: new Date().toISOString(),
    metrics: metrics.value,
    report: report.value,
    userAgent: navigator.userAgent
  }
  
  const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `performance-report-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

onMounted(() => {
  // 延迟加载指标
  setTimeout(() => {
    refreshMetrics()
  }, 3000)
  
  // 定期更新指标
  setInterval(() => {
    if (showMonitor.value) {
      refreshMetrics()
    }
  }, 10000)
})
</script>

<style scoped>
.performance-monitor {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 320px;
  max-height: 600px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  z-index: 9999;
  overflow: hidden;
  font-size: 14px;
}

.monitor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.monitor-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.close-btn:hover {
  opacity: 1;
}

.monitor-content {
  padding: 16px;
  max-height: 540px;
  overflow-y: auto;
}

.metric-group {
  margin-bottom: 16px;
}

.metric-group h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.metric {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px solid #f3f4f6;
}

.metric:last-child {
  border-bottom: none;
}

.metric .label {
  font-weight: 500;
  color: #6b7280;
}

.metric .value {
  font-weight: 600;
  font-family: 'Courier New', monospace;
}

.metric .value.good {
  color: #10b981;
}

.metric .value.needs-improvement {
  color: #f59e0b;
}

.metric .value.poor {
  color: #ef4444;
}

.score-bar {
  position: relative;
  height: 32px;
  background: #f3f4f6;
  border-radius: 16px;
  overflow: hidden;
}

.score-fill {
  height: 100%;
  transition: width 0.5s ease;
  border-radius: 16px;
}

.score-fill.good {
  background: linear-gradient(90deg, #10b981, #059669);
}

.score-fill.needs-improvement {
  background: linear-gradient(90deg, #f59e0b, #d97706);
}

.score-fill.poor {
  background: linear-gradient(90deg, #ef4444, #dc2626);
}

.score-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-weight: 700;
  color: #1f2937;
  font-size: 14px;
}

.recommendations {
  margin: 0;
  padding-left: 20px;
  color: #6b7280;
  font-size: 13px;
}

.recommendations li {
  margin-bottom: 6px;
}

.actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.actions button {
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-refresh {
  background: #667eea;
  color: white;
}

.btn-refresh:hover {
  background: #5568d3;
}

.btn-export {
  background: #f3f4f6;
  color: #374151;
}

.btn-export:hover {
  background: #e5e7eb;
}

.monitor-toggle {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  z-index: 9999;
  transition: transform 0.2s;
}

.monitor-toggle:hover {
  transform: scale(1.1);
}
</style>
