<template>
  <div v-if="history.length > 0" class="history-panel">
    <div class="history-header">
      <h3>
        <el-icon><Clock /></el-icon>
        最近分析
      </h3>
      <el-button text type="danger" size="small" @click="handleClearAll">
        清空
      </el-button>
    </div>
    
    <div class="history-list">
      <div
        v-for="record in history"
        :key="record.id"
        class="history-item"
        @click="handleRecordClick(record)"
      >
        <div class="record-info">
          <div class="record-name">{{ record.accountName }}</div>
          <div class="record-stats">
            <span>{{ formatNumber(record.followers) }} 粉丝</span>
            <span class="divider">·</span>
            <span>{{ record.category }}</span>
          </div>
          <div class="record-time">{{ formatTime(record.createdAt) }}</div>
        </div>
        
        <el-button
          text
          type="danger"
          size="small"
          @click.stop="handleDelete(record.id)"
        >
          <el-icon><Delete /></el-icon>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Clock, Delete } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { HistoryManager, type HistoryRecord } from '@/utils/historyManager'

const router = useRouter()
const history = ref<HistoryRecord[]>([])

const loadHistory = () => {
  history.value = HistoryManager.getHistory()
}

const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  }
  return num.toString()
}

const formatTime = (dateStr: string): string => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  
  return date.toLocaleDateString('zh-CN')
}

const handleRecordClick = (record: HistoryRecord) => {
  // 可以跳转到分析页面，预填充数据
  ElMessage.info('历史记录查看功能开发中...')
}

const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定删除这条记录吗？', '提示', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    HistoryManager.deleteRecord(id)
    loadHistory()
    ElMessage.success('删除成功')
  } catch {
    // 用户取消
  }
}

const handleClearAll = async () => {
  try {
    await ElMessageBox.confirm('确定清空所有历史记录吗？', '提示', {
      confirmButtonText: '清空',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    HistoryManager.clearHistory()
    loadHistory()
    ElMessage.success('已清空')
  } catch {
    // 用户取消
  }
}

onMounted(() => {
  loadHistory()
})

defineExpose({
  refresh: loadHistory
})
</script>

<style scoped>
.history-panel {
  background: #f9fafb;
  border-radius: 12px;
  padding: 20px;
  margin-top: 24px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.history-header h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-item {
  background: white;
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #e5e7eb;
}

.history-item:hover {
  border-color: #409EFF;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.record-info {
  flex: 1;
}

.record-name {
  font-size: 0.9375rem;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 4px;
}

.record-stats {
  font-size: 0.8125rem;
  color: #6b7280;
  margin-bottom: 4px;
}

.divider {
  margin: 0 6px;
}

.record-time {
  font-size: 0.75rem;
  color: #9ca3af;
}

@media (max-width: 768px) {
  .history-panel {
    padding: 16px;
  }
  
  .history-item {
    padding: 10px 12px;
  }
}
</style>
