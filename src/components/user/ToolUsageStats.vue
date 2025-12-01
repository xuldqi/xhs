<template>
  <div class="tool-usage-stats">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>工具使用统计</span>
          <el-button type="text" @click="refreshStats">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>

      <div v-loading="loading">
        <!-- 今日统计 -->
        <div class="stats-section">
          <h4 class="section-title">今日使用</h4>
          <div class="stats-grid">
            <div 
              v-for="tool in toolStats" 
              :key="tool.id"
              class="stat-card"
              :class="{ 'limit-reached': tool.todayUsage >= tool.limit && tool.limit < 999 }"
            >
              <div class="stat-header">
                <span class="tool-name">{{ tool.name }}</span>
                <el-tag 
                  v-if="tool.limit < 999 && tool.todayUsage >= tool.limit" 
                  type="danger" 
                  size="small"
                >
                  已用完
                </el-tag>
                <el-tag 
                  v-else-if="tool.limit >= 999" 
                  type="success" 
                  size="small"
                >
                  无限
                </el-tag>
              </div>
              <div class="stat-value">
                <span class="current">{{ tool.todayUsage }}</span>
                <span class="limit" v-if="tool.limit < 999">/ {{ tool.limit }}</span>
                <span class="limit" v-else>/ ∞</span>
              </div>
              <div class="stat-progress" v-if="tool.limit < 999">
                <el-progress 
                  :percentage="Math.min((tool.todayUsage / tool.limit) * 100, 100)"
                  :color="tool.todayUsage >= tool.limit ? '#f56c6c' : '#67c23a'"
                  :stroke-width="6"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 本周统计 -->
        <el-divider />
        <div class="stats-section">
          <h4 class="section-title">本周使用</h4>
          <div class="week-stats">
            <div 
              v-for="tool in toolStats" 
              :key="tool.id"
              class="week-stat-item"
            >
              <div class="week-stat-label">{{ tool.name }}</div>
              <div class="week-stat-value">{{ tool.weekUsage }} 次</div>
            </div>
          </div>
        </div>

        <!-- 升级提示 -->
        <el-alert
          v-if="!userStore.isVIP && hasReachedLimit"
          title="部分工具使用次数已用完"
          type="warning"
          :closable="false"
          show-icon
          style="margin-top: 24px;"
        >
          <template #default>
            <p>升级会员可享受所有工具无限使用，立即升级解锁更多功能！</p>
            <el-button type="primary" size="small" @click="goToPricing" style="margin-top: 8px;">
              立即升级
            </el-button>
          </template>
        </el-alert>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Refresh } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/userStore'
import { TOOL_LIMITS, type ToolId } from '@/composables/useToolLimit'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)

interface ToolStat {
  id: ToolId
  name: string
  todayUsage: number
  weekUsage: number
  limit: number
}

const toolStats = ref<ToolStat[]>([
  { id: 'title-generator', name: '标题生成器', todayUsage: 0, weekUsage: 0, limit: 10 },
  { id: 'viral-generator', name: '爆款生成器', todayUsage: 0, weekUsage: 0, limit: 3 },
  { id: 'background-remover', name: '图片背景移除', todayUsage: 0, weekUsage: 0, limit: 5 },
  { id: 'manga-generator', name: '漫画风生成器', todayUsage: 0, weekUsage: 0, limit: 5 },
  { id: 'hot-words-insight', name: '热词洞察工具', todayUsage: 0, weekUsage: 0, limit: 20 },
  { id: 'topic-inspiration', name: '灵感话题库', todayUsage: 0, weekUsage: 0, limit: 20 },
])

const hasReachedLimit = computed(() => {
  return toolStats.value.some(tool => tool.todayUsage >= tool.limit && tool.limit < 999)
})

onMounted(() => {
  loadStats()
})

const loadStats = async () => {
  if (!userStore.user) return
  
  loading.value = true
  try {
    // 更新限制（根据会员状态）
    const planType = userStore.planType
    const limits = TOOL_LIMITS[planType] || TOOL_LIMITS.free
    
    toolStats.value = toolStats.value.map(tool => ({
      ...tool,
      limit: limits[tool.id] || 0
    }))
    
    // 获取使用统计数据
    // 注意：实际使用时需要从后端API获取真实数据
    // const stats = await UserService.getToolUsageStats(userStore.user.id)
    // toolStats.value = stats
    
    // 初始化使用数据（实际应从后端获取）
    toolStats.value = toolStats.value.map(tool => ({
      ...tool,
      todayUsage: 0, // 初始化为0，等待后端数据
      weekUsage: 0
    }))
  } catch (error) {
    console.error('加载工具使用统计失败:', error)
  } finally {
    loading.value = false
  }
}

const refreshStats = () => {
  loadStats()
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

.stats-section {
  margin-bottom: 24px;
}

.stats-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.stat-card {
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
  border: 2px solid transparent;
  transition: all 0.3s;
}

.stat-card:hover {
  border-color: #667eea;
  transform: translateY(-2px);
}

.stat-card.limit-reached {
  background: #fef0f0;
  border-color: #f56c6c;
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.tool-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.stat-value {
  margin-bottom: 8px;
}

.stat-value .current {
  font-size: 24px;
  font-weight: 700;
  color: #667eea;
}

.stat-value .limit {
  font-size: 14px;
  color: #999;
  margin-left: 4px;
}

.stat-progress {
  margin-top: 8px;
}

.week-stats {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
}

.week-stat-item {
  padding: 12px;
  background: #f5f7fa;
  border-radius: 6px;
  text-align: center;
}

.week-stat-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.week-stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #667eea;
}
</style>

