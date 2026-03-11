<template>
  <section class="publish-dashboard">
    <div class="dashboard-head">
      <div>
        <p class="dashboard-kicker">Publish Dashboard</p>
        <h3>发布结果看板</h3>
        <p>实时看成功率、失败率、最近执行和平台分布。</p>
      </div>
      <div class="dashboard-actions">
        <el-button text @click="loadDashboard">刷新</el-button>
        <el-button size="small" type="primary" @click="goHistory">查看完整历史</el-button>
      </div>
    </div>

    <div v-if="loading" class="dashboard-loading">
      <el-skeleton :rows="4" animated />
    </div>

    <template v-else-if="dashboard">
      <div class="kpi-grid">
        <article class="kpi-card">
          <span>总任务</span>
          <strong>{{ dashboard.totals.total }}</strong>
          <small>{{ dashboard.windowDays }} 天窗口</small>
        </article>
        <article class="kpi-card success">
          <span>成功率</span>
          <strong>{{ dashboard.rates.successRate }}%</strong>
          <small>completed / total</small>
        </article>
        <article class="kpi-card danger">
          <span>失败率</span>
          <strong>{{ dashboard.rates.failureRate }}%</strong>
          <small>failed / total</small>
        </article>
        <article class="kpi-card">
          <span>最近执行</span>
          <strong>{{ formatDate(dashboard.lastExecutionAt) }}</strong>
          <small>最近一次派发/完成时间</small>
        </article>
      </div>

      <div class="summary-grid">
        <article class="panel">
          <div class="panel-head">
            <h4>状态分布</h4>
          </div>
          <ul class="status-list">
            <li>
              <span>待派发</span>
              <strong>{{ dashboard.totals.queued }}</strong>
            </li>
            <li>
              <span>已派发</span>
              <strong>{{ dashboard.totals.dispatched }}</strong>
            </li>
            <li>
              <span>已完成</span>
              <strong>{{ dashboard.totals.completed }}</strong>
            </li>
            <li>
              <span>失败</span>
              <strong>{{ dashboard.totals.failed }}</strong>
            </li>
          </ul>
        </article>

        <article class="panel">
          <div class="panel-head">
            <h4>平台结果</h4>
          </div>
          <div v-if="dashboard.platformSummary.length" class="platform-list">
            <div v-for="item in dashboard.platformSummary" :key="item.platform" class="platform-row">
              <div class="platform-name">{{ item.platform }}</div>
              <div class="platform-bar">
                <span class="success" :style="{ width: calcBar(item.success, item.total) }"></span>
                <span class="failed" :style="{ width: calcBar(item.failed, item.total) }"></span>
              </div>
              <div class="platform-total">{{ item.success }}/{{ item.total }}</div>
            </div>
          </div>
          <el-empty v-else description="暂无平台执行数据" :image-size="58" />
        </article>
      </div>

      <article class="panel recent-panel">
        <div class="panel-head">
          <h4>最近执行</h4>
        </div>
        <div v-if="dashboard.recentExecutions.length" class="recent-list">
          <div v-for="task in dashboard.recentExecutions" :key="task.id" class="recent-item">
            <div>
              <strong>{{ task.workflow_title }}</strong>
              <p>{{ task.topic }}</p>
            </div>
            <div class="recent-meta">
              <span class="status" :class="task.status">{{ task.status }}</span>
              <span>{{ formatDate(task.updated_at) }}</span>
            </div>
          </div>
        </div>
        <el-empty v-else description="暂无执行记录" :image-size="58" />
      </article>
    </template>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getAutomationDashboard, type AutomationDashboard } from '@/services/automationTaskService'

const router = useRouter()
const loading = ref(false)
const dashboard = ref<AutomationDashboard | null>(null)

function formatDate(value: string | null) {
  if (!value) return '暂无'
  return new Date(value).toLocaleString('zh-CN', { hour12: false })
}

function calcBar(value: number, total: number) {
  if (!total) return '0%'
  return `${Math.max(8, Math.round((value / total) * 100))}%`
}

async function loadDashboard() {
  loading.value = true
  try {
    dashboard.value = await getAutomationDashboard(7, 8)
  } catch (error: any) {
    ElMessage.error(error?.message || '加载发布看板失败')
  } finally {
    loading.value = false
  }
}

function goHistory() {
  router.push('/tools/content-automation-history')
}

onMounted(loadDashboard)
</script>

<style scoped>
.publish-dashboard {
  margin-top: 24px;
  padding: 24px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(17, 24, 39, 0.08);
  box-shadow: 0 18px 48px rgba(17, 24, 39, 0.06);
}

.dashboard-head,
.dashboard-actions,
.summary-grid,
.panel-head,
.recent-item,
.recent-meta,
.status-list li,
.platform-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.dashboard-kicker {
  display: inline-flex;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(32, 90, 248, 0.08);
  color: #1d4ed8;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin: 0 0 10px;
}

.dashboard-head h3,
.panel h4 {
  margin: 0;
  color: #111827;
}

.dashboard-head p {
  margin: 8px 0 0;
  color: #6b7280;
  line-height: 1.7;
}

.kpi-grid {
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.kpi-card {
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: 18px;
  padding: 14px;
  background: #fff;
  display: grid;
  gap: 6px;
}

.kpi-card span {
  color: #6b7280;
  font-size: 0.86rem;
}

.kpi-card strong {
  color: #111827;
  font-size: 1.35rem;
}

.kpi-card small {
  color: #9ca3af;
}

.kpi-card.success strong {
  color: #047857;
}

.kpi-card.danger strong {
  color: #b42318;
}

.summary-grid {
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.panel {
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: 18px;
  padding: 16px;
  background: #fcfaf8;
}

.status-list {
  margin: 12px 0 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 10px;
}

.status-list li span {
  color: #6b7280;
}

.status-list li strong {
  color: #111827;
}

.platform-list {
  margin-top: 12px;
  display: grid;
  gap: 10px;
}

.platform-name {
  width: 90px;
  color: #1f2937;
  font-weight: 600;
  text-transform: capitalize;
}

.platform-bar {
  flex: 1;
  display: flex;
  height: 8px;
  border-radius: 999px;
  overflow: hidden;
  background: #e5e7eb;
}

.platform-bar .success {
  background: #10b981;
}

.platform-bar .failed {
  background: #ef4444;
}

.platform-total {
  width: 66px;
  text-align: right;
  color: #6b7280;
  font-size: 0.84rem;
}

.recent-panel {
  margin-top: 16px;
}

.recent-list {
  margin-top: 12px;
  display: grid;
  gap: 10px;
}

.recent-item {
  padding: 12px;
  border-radius: 14px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  background: #fff;
}

.recent-item p {
  margin: 5px 0 0;
  color: #6b7280;
  font-size: 0.9rem;
}

.status {
  text-transform: uppercase;
  font-size: 0.74rem;
  font-weight: 700;
}

.status.completed {
  color: #047857;
}

.status.failed {
  color: #b42318;
}

.status.dispatched {
  color: #1d4ed8;
}

.status.queued {
  color: #9a3412;
}

@media (max-width: 1080px) {
  .kpi-grid,
  .summary-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-head,
  .dashboard-actions,
  .recent-item,
  .recent-meta,
  .platform-row {
    flex-direction: column;
    align-items: stretch;
  }

  .platform-name,
  .platform-total {
    width: auto;
    text-align: left;
  }
}
</style>
