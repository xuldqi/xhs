<template>
  <div class="format-selector">
    <div class="selector-label">显示格式：</div>
    <div class="selector-buttons">
      <button
        :class="['format-btn', { active: currentFormat === 'report' }]"
        @click="handleFormatChange('report')"
      >
        <el-icon><TrendCharts /></el-icon>
        <span>报告</span>
      </button>
      <button
        :class="['format-btn', { active: currentFormat === 'card' }]"
        @click="handleFormatChange('card')"
      >
        <el-icon><Grid /></el-icon>
        <span>卡片</span>
      </button>
      <button
        :class="['format-btn', { active: currentFormat === 'professional' }]"
        @click="handleFormatChange('professional')"
      >
        <el-icon><Document /></el-icon>
        <span>文档</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Grid, Document, TrendCharts } from '@element-plus/icons-vue'
import { DocumentFormat } from '@/types/models'

interface Props {
  currentFormat: DocumentFormat
}

interface Emits {
  (e: 'format-change', format: DocumentFormat): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const handleFormatChange = (format: DocumentFormat) => {
  if (format !== props.currentFormat) {
    emit('format-change', format)
  }
}
</script>

<style scoped>
.format-selector {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
}

.selector-label {
  font-size: 14px;
  font-weight: 500;
  color: #666;
}

.selector-buttons {
  display: flex;
  gap: 12px;
}

.format-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: #ffffff;
  color: #666;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.format-btn:hover {
  border-color: #ff2442;
  color: #ff2442;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 36, 66, 0.15);
}

.format-btn.active {
  border-color: #ff2442;
  background: linear-gradient(135deg, #ff2442 0%, #ff6b6b 100%);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(255, 36, 66, 0.3);
}

.format-btn .el-icon {
  font-size: 18px;
}

@media (max-width: 768px) {
  .format-selector {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .selector-buttons {
    width: 100%;
  }
  
  .format-btn {
    flex: 1;
    justify-content: center;
  }
}
</style>
