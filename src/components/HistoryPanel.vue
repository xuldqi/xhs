<template>
  <div class="history-panel">
    <div class="history-header">
      <h3>
        <el-icon><Clock /></el-icon>
        最近分析
      </h3>
      <el-button v-if="history.length > 0" text type="danger" size="small" @click="handleClearAll">
        清空
      </el-button>
    </div>
    
    <!-- 空状态 -->
    <div v-if="history.length === 0" class="empty-state">
      <el-icon :size="48" color="#d1d5db"><Document /></el-icon>
      <p class="empty-text">暂无历史记录</p>
      <p class="empty-hint">完成分析后，历史记录会自动保存在这里</p>
    </div>
    
    <div v-else class="history-list">
      <div
        v-for="record in history"
        :key="record.id"
        class="history-item"
        @click="handleRecordClick(record)"
      >
        <div class="record-info">
          <div class="record-header">
            <div class="record-name">{{ record.accountName }}</div>
            <el-tag v-if="record.isCloud" size="small" type="success">云端</el-tag>
            <el-tag v-else size="small" type="info">本地</el-tag>
          </div>
          <div class="record-stats">
            <span>{{ formatNumber(record.followers) }} 粉丝</span>
            <span class="divider">·</span>
            <span>{{ record.category }}</span>
            <span v-if="record.isCloud && record.viewCount > 0" class="divider">·</span>
            <span v-if="record.isCloud && record.viewCount > 0">{{ record.viewCount }} 次浏览</span>
          </div>
          <div class="record-time">{{ formatTime(record.createdAt) }}</div>
        </div>
        
        <div class="record-actions">
          <el-button
            v-if="record.isCloud"
            text
            type="primary"
            size="small"
            @click.stop="handleShare(record, $event)"
          >
            <el-icon><Share /></el-icon>
          </el-button>
          <el-button
            text
            type="danger"
            size="small"
            @click.stop="handleDelete(record)"
          >
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Clock, Delete, Share } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { HistoryManager, type HistoryRecord } from '@/utils/historyManager'
import { getUserGuides, deleteGuide, generateShareLink, type SavedGuide } from '@/services/guideService'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const userStore = useUserStore()
const localHistory = ref<HistoryRecord[]>([])
const cloudHistory = ref<SavedGuide[]>([])
const loading = ref(false)

// 是否登录
const isLoggedIn = computed(() => userStore.isLoggedIn)

// 合并本地和云端历史记录
const history = computed(() => {
  const combined: any[] = []
  
  // 添加云端记录
  cloudHistory.value.forEach(item => {
    combined.push({
      id: item.id,
      accountName: item.account_name,
      followers: item.account_data?.followerCount || 0,
      category: item.account_data?.contentCategory || '未知',
      createdAt: item.created_at,
      isCloud: true,
      shareId: item.share_id,
      isPublic: item.is_public,
      viewCount: item.view_count
    })
  })
  
  // 添加本地记录
  localHistory.value.forEach(item => {
    combined.push({
      ...item,
      isCloud: false
    })
  })
  
  // 按时间排序
  return combined.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
})

const loadHistory = async () => {
  // 加载本地历史
  localHistory.value = HistoryManager.getHistory()
  
  // 如果已登录，加载云端历史
  if (isLoggedIn.value) {
    loading.value = true
    try {
      const result = await getUserGuides()
      if (result.success && result.guides) {
        cloudHistory.value = result.guides
      }
    } catch (error) {
      console.error('加载云端历史失败:', error)
    } finally {
      loading.value = false
    }
  }
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

const handleRecordClick = async (record: any) => {
  if (record.isCloud && record.shareId) {
    // 云端记录，跳转到分享页面
    router.push(`/share/${record.shareId}`)
  } else {
    // 本地记录，加载完整数据并跳转到指南页面
    try {
      loading.value = true
      const fullRecord = HistoryManager.getFullRecord(record.id)
      
      if (!fullRecord) {
        ElMessage.error('无法加载历史记录，数据可能已损坏')
        return
      }

      // 跳转到指南页面，并传递历史记录数据
      router.push({
        name: 'guide',
        params: { historyId: record.id }
      })
    } catch (error) {
      console.error('加载历史记录失败:', error)
      ElMessage.error('加载历史记录失败')
    } finally {
      loading.value = false
    }
  }
}

const handleShare = async (record: any, event: Event) => {
  event.stopPropagation()
  
  if (!record.isCloud || !record.shareId) {
    ElMessage.warning('只有云端保存的指南才能分享')
    return
  }
  
  const shareLink = generateShareLink(record.shareId)
  
  try {
    await navigator.clipboard.writeText(shareLink)
    ElMessage.success('分享链接已复制到剪贴板！')
  } catch (error) {
    // 降级方案
    ElMessageBox.alert(shareLink, '分享链接', {
      confirmButtonText: '关闭'
    })
  }
}

const handleDelete = async (record: any) => {
  try {
    await ElMessageBox.confirm('确定删除这条记录吗？', '提示', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    if (record.isCloud) {
      // 删除云端记录
      const result = await deleteGuide(record.id)
      if (result.success) {
        ElMessage.success('删除成功')
        loadHistory()
      } else {
        ElMessage.error(result.error || '删除失败')
      }
    } else {
      // 删除本地记录
      HistoryManager.deleteRecord(record.id)
      loadHistory()
      ElMessage.success('删除成功')
    }
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

.record-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.record-name {
  font-size: 0.9375rem;
  font-weight: 500;
  color: #1f2937;
}

.record-actions {
  display: flex;
  gap: 4px;
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

.empty-state {
  text-align: center;
  padding: 48px 24px;
}

.empty-text {
  font-size: 1rem;
  font-weight: 500;
  color: #6b7280;
  margin: 16px 0 8px;
}

.empty-hint {
  font-size: 0.875rem;
  color: #9ca3af;
  margin: 0;
}

@media (max-width: 768px) {
  .history-panel {
    padding: 16px;
  }
  
  .history-item {
    padding: 10px 12px;
  }
  
  .empty-state {
    padding: 32px 16px;
  }
}
</style>
