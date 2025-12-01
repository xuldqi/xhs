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

      <!-- 会员到期提醒 -->
      <div class="expiry-warning" v-if="vipStatus?.expires_at && daysUntilExpiry <= 7 && daysUntilExpiry > 0">
        <el-alert
          :title="`会员将在 ${daysUntilExpiry} 天后到期`"
          type="warning"
          :closable="false"
          show-icon
        >
          <template #default>
            <p>您的会员将在 {{ formatDate(vipStatus.expires_at) }} 到期，续费可继续享受会员权益。</p>
            <el-button type="primary" size="small" @click="goToPricing" style="margin-top: 8px;">
              立即续费
            </el-button>
          </template>
        </el-alert>
      </div>

      <el-divider v-if="vipStatus?.expires_at && daysUntilExpiry <= 7" />

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

      <!-- 会员权益 -->
      <el-divider />
      <div class="member-benefits">
        <h4>会员权益</h4>
        <div class="benefits-list">
          <div class="benefit-item" v-if="userStore.isVIP">
            <el-icon><Check /></el-icon>
            <span>所有工具无限使用</span>
          </div>
          <div class="benefit-item" v-if="userStore.isVIP">
            <el-icon><Check /></el-icon>
            <span>优先客服支持</span>
          </div>
          <div class="benefit-item" v-if="userStore.isVIP">
            <el-icon><Check /></el-icon>
            <span>新功能优先体验</span>
          </div>
          <div class="benefit-item" v-if="userStore.isVIP && planConfig?.features?.customTemplate">
            <el-icon><Check /></el-icon>
            <span>自定义模板</span>
          </div>
          <template v-if="!userStore.isVIP">
            <div class="benefit-item">
              <el-icon><Close /></el-icon>
              <span class="disabled">所有工具无限使用（需升级）</span>
            </div>
            <div class="benefit-item">
              <el-icon><Close /></el-icon>
              <span class="disabled">优先客服支持（需升级）</span>
            </div>
          </template>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Check, Close } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/userStore'
import { UserService } from '@/services/userService'

const router = useRouter()
const userStore = useUserStore()

const todayGenerate = ref(0)
const todayExport = ref(0)

const vipStatus = computed(() => userStore.vipStatus)
const planName = computed(() => userStore.planName)
const planConfig = computed(() => userStore.planConfig)

// 计算距离到期的天数
const daysUntilExpiry = computed(() => {
  if (!vipStatus.value?.expires_at) return 0
  const expiryDate = new Date(vipStatus.value.expires_at)
  const today = new Date()
  const diffTime = expiryDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays > 0 ? diffDays : 0
})

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

.expiry-warning {
  margin-bottom: 24px;
}

.member-benefits h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #333;
}

.benefits-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.benefit-item .disabled {
  color: #999;
}
</style>
