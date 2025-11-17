<template>
  <div class="vip-info">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>会员状态</span>
          <el-button type="primary" @click="goToPricing">升级会员</el-button>
        </div>
      </template>

      <div class="vip-status">
        <div class="status-item">
          <label>当前套餐</label>
          <div class="value">{{ planName }}</div>
        </div>
        <div class="status-item" v-if="vipStatus?.expires_at">
          <label>到期时间</label>
          <div class="value">{{ formatDate(vipStatus.expires_at) }}</div>
        </div>
        <div class="status-item" v-else>
          <label>有效期</label>
          <div class="value">永久有效</div>
        </div>
      </div>

      <el-divider />

      <div class="usage-stats">
        <h4>今日使用情况</h4>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-label">生成次数</div>
            <div class="stat-value">
              {{ todayGenerate }} / {{ planConfig?.daily_generate_limit === 999 ? '∞' : planConfig?.daily_generate_limit }}
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-label">导出次数</div>
            <div class="stat-value">
              {{ todayExport }} / {{ planConfig?.daily_export_limit === 999 ? '∞' : planConfig?.daily_export_limit }}
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { UserService } from '@/services/userService'

const router = useRouter()
const userStore = useUserStore()

const todayGenerate = ref(0)
const todayExport = ref(0)

const vipStatus = computed(() => userStore.vipStatus)
const planName = computed(() => userStore.planName)
const planConfig = computed(() => userStore.planConfig)

onMounted(async () => {
  await loadTodayUsage()
})

const loadTodayUsage = async () => {
  if (!userStore.user) return
  
  try {
    const [generateCount, exportCount] = await Promise.all([
      UserService.getTodayUsageCount(userStore.user.id, 'generate_guide'),
      UserService.getTodayUsageCount(userStore.user.id, 'export_html'),
    ])
    todayGenerate.value = generateCount
    todayExport.value = exportCount
  } catch (error) {
    console.error('加载使用统计失败:', error)
  }
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

const goToPricing = () => {
  router.push('/pricing')
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.vip-status {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.status-item label {
  display: block;
  font-size: 14px;
  color: #999;
  margin-bottom: 8px;
}

.status-item .value {
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.usage-stats h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #333;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.stat-item {
  text-align: center;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #667eea;
}
</style>
