<template>
  <el-drawer
    v-model="visible"
    title="错误日志"
    direction="rtl"
    size="500px"
  >
    <div class="error-log-viewer">
      <div class="log-header">
        <el-button size="small" @click="handleRefresh">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
        <el-button size="small" type="danger" @click="handleClear">
          <el-icon><Delete /></el-icon>
          清空
        </el-button>
      </div>
      
      <div v-if="errors.length === 0" class="empty-state">
        <el-empty description="暂无错误记录" />
      </div>
      
      <div v-else class="log-list">
        <div
          v-for="(error, index) in errors"
          :key="index"
          class="log-item"
          :class="`log-${error.type.toLowerCase()}`"
        >
          <div class="log-header-row">
            <el-tag :type="getTagType(error.type)" size="small">
              {{ error.type }}
            </el-tag>
            <span class="log-time">{{ formatTime(error.timestamp) }}</span>
          </div>
          
          <div class="log-message">{{ error.message }}</div>
          
          <el-collapse v-if="error.details" accordion>
            <el-collapse-item title="详细信息" name="details">
              <pre class="log-details">{{ formatDetails(error.details) }}</pre>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Refresh, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { errorHandler, ErrorType, type AppError } from '@/utils/errorHandler'

const visible = defineModel<boolean>({ default: false })
const errors = ref<AppError[]>([])

const loadErrors = () => {
  errors.value = errorHandler.getErrorLog()
}

const handleRefresh = () => {
  loadErrors()
  ElMessage.success('已刷新')
}

const handleClear = () => {
  errorHandler.clearLog()
  loadErrors()
  ElMessage.success('已清空')
}

const getTagType = (type: ErrorType): string => {
  const typeMap: Record<ErrorType, string> = {
    [ErrorType.NETWORK]: 'danger',
    [ErrorType.API]: 'warning',
    [ErrorType.VALIDATION]: 'info',
    [ErrorType.AUTH]: 'warning',
    [ErrorType.FILE]: 'danger',
    [ErrorType.UNKNOWN]: 'info'
  }
  return typeMap[type] || 'info'
}

const formatTime = (date: Date): string => {
  return new Date(date).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const formatDetails = (details: any): string => {
  if (typeof details === 'string') {
    return details
  }
  return JSON.stringify(details, null, 2)
}

// 监听visible变化，自动加载
watch(() => visible.value, (newVal) => {
  if (newVal) {
    loadErrors()
  }
})

defineExpose({
  refresh: loadErrors
})
</script>

<style scoped>
.error-log-viewer {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.log-header {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.log-list {
  flex: 1;
  overflow-y: auto;
}

.log-item {
  background: #f9fafb;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  border-left: 4px solid #e5e7eb;
}

.log-item.log-network {
  border-left-color: #f56c6c;
  background: #fef0f0;
}

.log-item.log-api {
  border-left-color: #e6a23c;
  background: #fdf6ec;
}

.log-item.log-validation {
  border-left-color: #409eff;
  background: #ecf5ff;
}

.log-item.log-auth {
  border-left-color: #e6a23c;
  background: #fdf6ec;
}

.log-item.log-file {
  border-left-color: #f56c6c;
  background: #fef0f0;
}

.log-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.log-time {
  font-size: 12px;
  color: #909399;
}

.log-message {
  font-size: 14px;
  color: #303133;
  margin-bottom: 8px;
  line-height: 1.5;
}

.log-details {
  font-size: 12px;
  color: #606266;
  background: white;
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
  max-height: 300px;
  overflow-y: auto;
}

:deep(.el-collapse-item__header) {
  font-size: 13px;
  padding: 8px 0;
}

:deep(.el-collapse-item__content) {
  padding: 0;
}
</style>
