<template>
  <div class="history-view">
    <div class="history-shell">
      <Breadcrumb :items="breadcrumbItems" />

      <section class="hero">
        <div>
          <p class="kicker">Execution History</p>
          <h1>自动化执行历史</h1>
          <p>查看每次任务的输入、状态回写、错误信息与产物链接。</p>
        </div>
        <div class="hero-actions">
          <el-button @click="goFactory">回到内容工厂</el-button>
          <el-button type="primary" @click="loadHistory">刷新</el-button>
        </div>
      </section>

      <section class="filters card">
        <el-select v-model="filters.status" clearable placeholder="状态筛选">
          <el-option label="待派发" value="queued" />
          <el-option label="已派发" value="dispatched" />
          <el-option label="已完成" value="completed" />
          <el-option label="失败" value="failed" />
        </el-select>
        <el-select v-model="filters.workflowId" clearable placeholder="流水线筛选">
          <el-option label="趋势抓取" value="trend-scraper" />
          <el-option label="多平台改写" value="multi-platform-remix" />
          <el-option label="自动内容生产" value="auto-content-engine" />
        </el-select>
        <el-select v-model="filters.triggerMode" clearable placeholder="触发方式">
          <el-option label="手动" value="manual" />
          <el-option label="定时" value="scheduled" />
        </el-select>
        <el-input v-model="filters.q" clearable placeholder="搜索主题关键词" />
        <el-button type="primary" @click="applyFilters">查询</el-button>
      </section>

      <section class="table card">
        <div v-if="loading">
          <el-skeleton :rows="6" animated />
        </div>
        <template v-else>
          <el-table :data="history.items" stripe>
            <el-table-column prop="workflow_title" label="流水线" min-width="150" />
            <el-table-column prop="topic" label="主题" min-width="220" show-overflow-tooltip />
            <el-table-column label="状态" width="110">
              <template #default="{ row }">
                <el-tag :type="statusTagType(row.status)" size="small">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="平台结果" min-width="150">
              <template #default="{ row }">
                <span>{{ row.published_platforms?.join(', ') || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="创建时间" width="170">
              <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
            </el-table-column>
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <el-button size="small" @click="openDetail(row.id)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination-row">
            <el-pagination
              background
              layout="prev, pager, next, total"
              :total="history.total"
              :current-page="currentPage"
              :page-size="pageSize"
              @current-change="changePage"
            />
          </div>
        </template>
      </section>
    </div>

    <el-drawer v-model="detailVisible" title="任务执行详情" size="56%">
      <div v-if="selectedTask" class="detail-grid">
        <div class="detail-row"><strong>任务 ID：</strong><span>{{ selectedTask.id }}</span></div>
        <div class="detail-row"><strong>流水线：</strong><span>{{ selectedTask.workflow_title }}</span></div>
        <div class="detail-row"><strong>状态：</strong><span>{{ selectedTask.status }}</span></div>
        <div class="detail-row"><strong>触发方式：</strong><span>{{ selectedTask.trigger_mode }}</span></div>
        <div class="detail-row"><strong>主题：</strong><span>{{ selectedTask.topic }}</span></div>
        <div class="detail-row"><strong>创建时间：</strong><span>{{ formatDate(selectedTask.created_at) }}</span></div>
        <div class="detail-row" v-if="selectedTask.dispatched_at"><strong>派发时间：</strong><span>{{ formatDate(selectedTask.dispatched_at) }}</span></div>
        <div class="detail-row" v-if="selectedTask.completed_at"><strong>完成时间：</strong><span>{{ formatDate(selectedTask.completed_at) }}</span></div>
        <div class="detail-row" v-if="selectedTask.error_message"><strong>错误：</strong><span class="error">{{ selectedTask.error_message }}</span></div>

        <div class="detail-block">
          <strong>输入 Payload</strong>
          <pre>{{ formatJson(selectedTask.payload) }}</pre>
        </div>

        <div class="detail-block" v-if="selectedTask.result_payload">
          <strong>状态回写 / Result</strong>
          <pre>{{ formatJson(selectedTask.result_payload) }}</pre>
        </div>

        <div class="detail-block" v-if="selectedTask.artifact_urls?.length">
          <strong>产物链接</strong>
          <ul class="artifact-list">
            <li v-for="url in selectedTask.artifact_urls" :key="url">
              <a :href="url" target="_blank" rel="noopener noreferrer">{{ url }}</a>
            </li>
          </ul>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import Breadcrumb from '@/components/Breadcrumb.vue'
import {
  getAutomationHistory,
  getAutomationTask,
  type AutomationHistoryResponse,
  type AutomationTask,
  type AutomationTaskEnriched,
  type AutomationTaskStatus,
  type AutomationWorkflowId,
} from '@/services/automationTaskService'

interface HistoryFilters {
  status?: AutomationTaskStatus
  workflowId?: AutomationWorkflowId
  triggerMode?: 'manual' | 'scheduled'
  q?: string
}

const router = useRouter()
const route = useRoute()

const pageSize = 20
const currentPage = ref(1)
const loading = ref(false)
const detailVisible = ref(false)
const selectedTask = ref<AutomationTaskEnriched | null>(null)
const history = ref<AutomationHistoryResponse>({
  items: [],
  total: 0,
  limit: pageSize,
  offset: 0,
})

const filters = reactive<HistoryFilters>({
  status: undefined,
  workflowId: undefined,
  triggerMode: undefined,
  q: '',
})

const breadcrumbItems = [
  { label: '首页', path: '/' },
  { label: '工具矩阵', path: '/tools' },
  { label: '内容工厂', path: '/tools/multi-platform-content' },
  { label: '执行历史', path: '' },
]

function formatDate(value: string | null) {
  if (!value) return '-'
  return new Date(value).toLocaleString('zh-CN', { hour12: false })
}

function formatJson(value: unknown) {
  return JSON.stringify(value ?? {}, null, 2)
}

function statusTagType(status: AutomationTaskStatus) {
  if (status === 'completed') return 'success'
  if (status === 'failed') return 'danger'
  if (status === 'dispatched') return 'primary'
  return 'warning'
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean)
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.map((item) => item.trim()).filter(Boolean))]
}

function extractArtifactUrls(resultPayload: Record<string, any> | null): string[] {
  if (!resultPayload) return []

  const urls = normalizeStringArray(resultPayload.artifactUrls)
  if (Array.isArray(resultPayload.artifacts)) {
    for (const item of resultPayload.artifacts) {
      if (item && typeof item === 'object' && typeof item.url === 'string') {
        urls.push(item.url)
      }
    }
  }

  if (resultPayload.image?.url && typeof resultPayload.image.url === 'string') {
    urls.push(resultPayload.image.url)
  }

  return uniqueStrings(urls)
}

function toEnrichedTask(task: AutomationTask): AutomationTaskEnriched {
  const published = uniqueStrings([
    ...normalizeStringArray(task.result_payload?.publishedPlatforms),
    ...normalizeStringArray(task.payload?.selectedPlatforms),
    ...normalizeStringArray(task.payload?.platforms),
  ])

  return {
    ...task,
    published_platforms: published,
    artifact_urls: extractArtifactUrls(task.result_payload),
  }
}

async function loadHistory() {
  loading.value = true
  try {
    history.value = await getAutomationHistory({
      ...filters,
      limit: pageSize,
      offset: (currentPage.value - 1) * pageSize,
    })
  } catch (error: any) {
    ElMessage.error(error?.message || '加载执行历史失败')
  } finally {
    loading.value = false
  }
}

async function openDetail(taskId: string) {
  try {
    const fromList = history.value.items.find((item) => item.id === taskId)
    if (fromList) {
      selectedTask.value = fromList
      detailVisible.value = true
      router.replace({ query: { ...route.query, taskId } })
      return
    }

    const task = await getAutomationTask(taskId)
    if (!task) {
      ElMessage.error('任务不存在')
      return
    }
    selectedTask.value = toEnrichedTask(task)
    detailVisible.value = true
    router.replace({ query: { ...route.query, taskId } })
  } catch (error: any) {
    ElMessage.error(error?.message || '加载任务详情失败')
  }
}

function applyFilters() {
  currentPage.value = 1
  void loadHistory()
}

function changePage(page: number) {
  currentPage.value = page
  void loadHistory()
}

function goFactory() {
  router.push('/tools/multi-platform-content')
}

onMounted(async () => {
  await loadHistory()
  if (typeof route.query.taskId === 'string' && route.query.taskId) {
    await openDetail(route.query.taskId)
  }
})
</script>

<style scoped>
.history-view {
  min-height: 100vh;
  background: #f7f9fc;
  padding: 20px 0 60px;
}

.history-shell {
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 20px;
}

.hero {
  margin-top: 14px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

.kicker {
  display: inline-flex;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.1);
  color: #1d4ed8;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 0 0 10px;
}

.hero h1 {
  margin: 0;
  color: #0f172a;
}

.hero p {
  margin: 8px 0 0;
  color: #64748b;
}

.hero-actions {
  display: flex;
  gap: 10px;
}

.card {
  margin-top: 16px;
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 20px;
  padding: 16px;
}

.filters {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
}

.pagination-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 14px;
}

.detail-grid {
  display: grid;
  gap: 12px;
}

.detail-row {
  display: flex;
  gap: 8px;
  color: #334155;
}

.detail-block strong {
  display: block;
  margin-bottom: 8px;
  color: #0f172a;
}

.detail-block pre {
  margin: 0;
  border-radius: 12px;
  background: #0f172a;
  color: #f8fafc;
  padding: 12px;
  overflow: auto;
  font-size: 0.84rem;
  line-height: 1.6;
}

.error {
  color: #dc2626;
}

.artifact-list {
  margin: 0;
  padding-left: 18px;
}

.artifact-list a {
  color: #2563eb;
  word-break: break-all;
}

@media (max-width: 980px) {
  .filters {
    grid-template-columns: 1fr;
  }

  .hero {
    flex-direction: column;
  }
}
</style>
