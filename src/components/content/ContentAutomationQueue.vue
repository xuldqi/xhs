<template>
  <section class="queue-panel">
    <div class="queue-head">
      <div>
        <p class="queue-kicker">Queue</p>
        <h3>一键丢进自动化流水线</h3>
        <p>内容一生成，马上入队给抓取、改写、发布链路继续跑。</p>
      </div>
      <el-button text @click="refreshTasks">刷新任务</el-button>
    </div>

    <div class="queue-actions">
      <button
        v-for="action in taskActions"
        :key="action.workflowId"
        type="button"
        class="queue-action"
        :class="{ locked: action.premium && !isPremiumUnlocked }"
        @click="createTask(action.workflowId, action.premium)"
      >
        <div>
          <strong>{{ action.title }}</strong>
          <p>{{ action.description }}</p>
        </div>
        <span class="action-badge">{{ action.premium ? 'PRO' : 'READY' }}</span>
      </button>
    </div>

    <div class="schedule-builder">
      <div class="builder-head">
        <div>
          <strong>定时任务创建器</strong>
          <p>把当前主题做成定时任务，后面接 n8n、cron 或调度器就能自动跑。</p>
        </div>
        <el-tag type="info">Scheduled</el-tag>
      </div>

      <div class="builder-grid">
        <el-select v-model="scheduleForm.workflowId" placeholder="选择工作流">
          <el-option
            v-for="action in taskActions"
            :key="action.workflowId"
            :label="action.title"
            :value="action.workflowId"
          />
        </el-select>

        <el-select v-model="scheduleForm.preset" placeholder="选择频率">
          <el-option
            v-for="preset in schedulePresets"
            :key="preset.id"
            :label="preset.label"
            :value="preset.id"
          />
        </el-select>

        <el-input
          v-model="scheduleForm.note"
          placeholder="备注，例如：每天早上自动抓热点"
          clearable
        />

        <el-button type="primary" @click="createScheduledTask">
          创建定时任务
        </el-button>
      </div>
    </div>

    <div class="task-list">
      <div v-if="loading" class="task-loading">
        <el-skeleton :rows="4" animated />
      </div>

      <template v-else>
        <article v-for="task in tasks" :key="task.id" class="task-card">
          <div class="task-top">
            <div>
              <h4>{{ task.workflow_title }}</h4>
              <p>{{ task.topic }}</p>
            </div>
            <el-tag size="small" :type="statusTypeMap[task.status] || 'info'">
              {{ statusLabelMap[task.status] || task.status }}
            </el-tag>
          </div>

          <div class="task-progress">
            <span class="progress-step" :class="progressClass(task, 'queued')">已入队</span>
            <span class="progress-step" :class="progressClass(task, 'dispatched')">已派发</span>
            <span class="progress-step" :class="progressClass(task, 'completed')">已完成</span>
          </div>

          <div class="task-meta">
            <span>触发方式：{{ triggerLabelMap[task.trigger_mode] || task.trigger_mode }}</span>
            <span>来源：{{ task.source }}</span>
            <span>创建时间：{{ formatDate(task.created_at) }}</span>
            <span v-if="task.next_run_at">下次执行：{{ formatDate(task.next_run_at) }}</span>
            <span v-if="task.external_id">执行 ID：{{ task.external_id }}</span>
            <span v-if="task.payload?.schedule">计划：{{ scheduleSummary(task.payload.schedule) }}</span>
          </div>

          <p v-if="task.error_message" class="task-error">{{ task.error_message }}</p>
          <p v-if="task.result_payload && task.status !== 'failed'" class="task-result">
            {{ summarizeResult(task.result_payload) }}
          </p>

          <div class="task-actions">
            <el-button size="small" @click="copyTask(task)">复制任务摘要</el-button>
            <el-button size="small" @click="openTaskDetail(task.id)">查看详情</el-button>
            <el-button
              v-if="task.status === 'queued'"
              size="small"
              type="primary"
              @click="dispatchTask(task.id)"
            >
              立即派发
            </el-button>
            <el-button
              v-if="task.status === 'failed'"
              size="small"
              type="warning"
              @click="retryTask(task.id)"
            >
              重试任务
            </el-button>
          </div>
        </article>

        <el-empty v-if="!tasks.length" description="还没有自动化任务，先生成内容再入队" />
      </template>
    </div>

    <el-dialog v-model="detailVisible" title="自动化任务详情" width="760px">
      <div v-if="selectedTask" class="task-detail">
        <div class="detail-row">
          <strong>任务名称：</strong>
          <span>{{ selectedTask.workflow_title }}</span>
        </div>
        <div class="detail-row">
          <strong>状态：</strong>
          <span>{{ statusLabelMap[selectedTask.status] || selectedTask.status }}</span>
        </div>
        <div class="detail-row">
          <strong>主题：</strong>
          <span>{{ selectedTask.topic }}</span>
        </div>
        <div class="detail-row">
          <strong>触发方式：</strong>
          <span>{{ triggerLabelMap[selectedTask.trigger_mode] || selectedTask.trigger_mode }}</span>
        </div>
        <div class="detail-row" v-if="selectedTask.payload?.schedule">
          <strong>计划配置：</strong>
          <span>{{ scheduleSummary(selectedTask.payload.schedule) }}</span>
        </div>
        <div class="detail-row" v-if="selectedTask.next_run_at">
          <strong>下次执行：</strong>
          <span>{{ formatDate(selectedTask.next_run_at) }}</span>
        </div>
        <div class="detail-row" v-if="selectedTask.completed_at">
          <strong>完成时间：</strong>
          <span>{{ formatDate(selectedTask.completed_at) }}</span>
        </div>
        <div class="detail-block">
          <strong>Payload</strong>
          <pre>{{ formatJson(selectedTask.payload) }}</pre>
        </div>
        <div v-if="selectedTask.result_payload" class="detail-block">
          <strong>结果 / 回写</strong>
          <pre>{{ formatJson(selectedTask.result_payload) }}</pre>
        </div>
      </div>
    </el-dialog>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  createAutomationTask,
  dispatchAutomationTask,
  getAutomationTask,
  getAutomationTasks,
  retryAutomationTask,
  type AutomationTask,
  type AutomationWorkflowId,
} from '@/services/automationTaskService'

interface Props {
  topic: string
  isPremiumUnlocked: boolean
  contentSummary?: string
  studioSummary?: string
  selectedPlatforms?: string[]
  selectedModes?: string[]
  trendLabel?: string | null
}

interface SchedulePreset {
  id: string
  label: string
  cron: string
  note: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  upgrade: [feature?: string]
}>()
const router = useRouter()

const loading = ref(false)
const tasks = ref<AutomationTask[]>([])
const detailVisible = ref(false)
const selectedTask = ref<AutomationTask | null>(null)

const taskActions: Array<{ workflowId: AutomationWorkflowId; title: string; description: string; premium: boolean }> = [
  {
    workflowId: 'trend-scraper',
    title: '创建趋势抓取任务',
    description: '先去抓相关热点，再回来给内容工厂喂选题',
    premium: false,
  },
  {
    workflowId: 'multi-platform-remix',
    title: '创建多平台改写任务',
    description: '把当前主题继续派发到多平台改写链路',
    premium: true,
  },
  {
    workflowId: 'auto-content-engine',
    title: '创建全自动内容任务',
    description: '交给自动内容引擎继续跑生成、配图和发布时间',
    premium: true,
  },
]

const schedulePresets: SchedulePreset[] = [
  { id: 'daily-9', label: '每天 09:00', cron: '0 9 * * *', note: '每日早上自动执行' },
  { id: 'every-6h', label: '每 6 小时', cron: '0 */6 * * *', note: '适合趋势抓取和内容补充' },
  { id: 'weekday-10', label: '工作日 10:00', cron: '0 10 * * 1-5', note: '适合工作日发布节奏' },
]

const scheduleForm = ref({
  workflowId: 'trend-scraper' as AutomationWorkflowId,
  preset: 'daily-9',
  note: '',
})

const statusTypeMap: Record<string, string> = {
  queued: 'warning',
  dispatched: 'primary',
  completed: 'success',
  failed: 'danger',
}

const statusLabelMap: Record<string, string> = {
  queued: '待派发',
  dispatched: '已派发',
  completed: '已完成',
  failed: '失败',
}

const triggerLabelMap: Record<string, string> = {
  manual: '手动',
  scheduled: '定时',
}

function formatDate(value: string) {
  return new Date(value).toLocaleString('zh-CN', { hour12: false })
}

function formatJson(value: unknown) {
  return JSON.stringify(value ?? {}, null, 2)
}

function summarizeResult(resultPayload: Record<string, any>) {
  if (typeof resultPayload?.message === 'string') return resultPayload.message
  if (typeof resultPayload?.summary === 'string') return resultPayload.summary
  if (typeof resultPayload?.hint === 'string') return resultPayload.hint
  if (typeof resultPayload?.dispatchAccepted === 'boolean') {
    return resultPayload.dispatchAccepted ? 'Webhook 已接受任务，等待回写完成状态。' : '任务还未成功派发。'
  }
  return '任务已有回写结果，可点击查看详情。'
}

function buildPayload() {
  return {
    topic: props.topic,
    contentSummary: props.contentSummary || '',
    studioSummary: props.studioSummary || '',
    selectedPlatforms: props.selectedPlatforms || [],
    selectedModes: props.selectedModes || [],
    trendLabel: props.trendLabel || null,
  }
}

function scheduleSummary(schedule: any) {
  if (!schedule) return '未设置'
  return `${schedule.label || schedule.id || '自定义'} · ${schedule.cron || 'no-cron'}`
}

function progressClass(task: AutomationTask, step: 'queued' | 'dispatched' | 'completed') {
  if (task.status === 'failed') {
    return step === 'queued' || step === 'dispatched' ? 'done' : 'failed'
  }
  if (step === 'queued') return 'done'
  if (step === 'dispatched' && ['dispatched', 'completed'].includes(task.status)) return 'done'
  if (step === 'completed' && task.status === 'completed') return 'done'
  return 'idle'
}

async function refreshTasks() {
  loading.value = true
  try {
    tasks.value = await getAutomationTasks(10)
  } finally {
    loading.value = false
  }
}

async function createTask(workflowId: AutomationWorkflowId, premium: boolean) {
  if (premium && !props.isPremiumUnlocked) {
    emit('upgrade', 'automation-workflow')
    return
  }

  if (!props.topic.trim()) {
    ElMessage.warning('先输入主题并生成内容，再创建自动化任务')
    return
  }

  try {
    const task = await createAutomationTask({
      workflowId,
      topic: props.topic,
      payload: buildPayload(),
      triggerMode: 'manual',
      source: 'content-factory-ui',
      autoDispatch: workflowId !== 'trend-scraper',
    })
    tasks.value = [task, ...tasks.value.filter((item) => item.id !== task.id)].slice(0, 10)
    ElMessage.success('自动化任务已创建')
  } catch (error: any) {
    ElMessage.error(error?.message || '创建任务失败')
  }
}

async function createScheduledTask() {
  const targetAction = taskActions.find((item) => item.workflowId === scheduleForm.value.workflowId)
  if (targetAction?.premium && !props.isPremiumUnlocked) {
    emit('upgrade', 'automation-workflow')
    return
  }

  if (!props.topic.trim()) {
    ElMessage.warning('先输入主题并生成内容，再创建定时任务')
    return
  }

  const preset = schedulePresets.find((item) => item.id === scheduleForm.value.preset)
  if (!preset) {
    ElMessage.warning('请选择一个定时频率')
    return
  }

  try {
    const task = await createAutomationTask({
      workflowId: scheduleForm.value.workflowId,
      topic: props.topic,
      payload: {
        ...buildPayload(),
        schedule: {
          id: preset.id,
          label: preset.label,
          cron: preset.cron,
          note: scheduleForm.value.note || preset.note,
        }
      },
      triggerMode: 'scheduled',
      source: 'content-factory-scheduler',
      autoDispatch: false,
    })

    tasks.value = [task, ...tasks.value.filter((item) => item.id !== task.id)].slice(0, 10)
    ElMessage.success('定时任务已创建')
  } catch (error: any) {
    ElMessage.error(error?.message || '创建定时任务失败')
  }
}

async function dispatchTask(taskId: string) {
  try {
    const task = await dispatchAutomationTask(taskId)
    tasks.value = tasks.value.map((item) => item.id === task.id ? task : item)
    ElMessage.success('任务已派发')
  } catch (error: any) {
    ElMessage.error(error?.message || '派发失败')
  }
}

async function retryTask(taskId: string) {
  try {
    const task = await retryAutomationTask(taskId)
    tasks.value = tasks.value.map((item) => item.id === task.id ? task : item)
    ElMessage.success('任务已重新派发')
  } catch (error: any) {
    ElMessage.error(error?.message || '重试失败')
  }
}

async function openTaskDetail(taskId: string) {
  const task = await getAutomationTask(taskId)
  if (task) {
    selectedTask.value = task
  }
  await router.push({
    path: '/tools/content-automation-history',
    query: { taskId }
  })
}

async function copyTask(task: AutomationTask) {
  try {
    await navigator.clipboard.writeText(JSON.stringify({ payload: task.payload, result: task.result_payload }, null, 2))
    ElMessage.success('任务摘要已复制')
  } catch {
    ElMessage.error('复制失败')
  }
}

onMounted(refreshTasks)
</script>

<style scoped>
.queue-panel {
  margin-top: 24px;
  padding: 24px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(17, 24, 39, 0.08);
  box-shadow: 0 18px 48px rgba(17, 24, 39, 0.06);
}

.queue-head,
.task-top,
.task-actions,
.builder-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.queue-kicker {
  display: inline-flex;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(255, 36, 66, 0.08);
  color: #c71f38;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin: 0 0 10px;
}

.queue-head h3,
.task-card h4,
.builder-head strong {
  margin: 0;
  color: #111827;
}

.queue-head p,
.queue-action p,
.task-top p,
.task-meta,
.task-error,
.task-result,
.builder-head p {
  color: #6b7280;
  line-height: 1.7;
}

.queue-actions,
.task-list {
  display: grid;
  gap: 16px;
  margin-top: 18px;
}

.queue-actions {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.queue-action {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  text-align: left;
  border: 1px solid rgba(17, 24, 39, 0.08);
  background: #fffaf8;
  padding: 18px;
  border-radius: 22px;
  cursor: pointer;
}

.queue-action.locked {
  background: #f9fafb;
}

.queue-action strong {
  display: block;
  color: #111827;
  margin-bottom: 6px;
}

.action-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 7px 10px;
  border-radius: 999px;
  background: #111827;
  color: #fff;
  font-size: 0.72rem;
  font-weight: 700;
}

.schedule-builder {
  margin-top: 18px;
  padding: 18px;
  border-radius: 22px;
  background: #fcfaf8;
  border: 1px solid rgba(17, 24, 39, 0.08);
}

.builder-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-top: 14px;
}

.task-card {
  padding: 18px;
  border-radius: 20px;
  background: #fcfaf8;
  border: 1px solid rgba(17, 24, 39, 0.08);
}

.task-progress {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}

.progress-step {
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  background: #f3f4f6;
  color: #6b7280;
}

.progress-step.done {
  background: #effcf6;
  color: #166534;
}

.progress-step.failed {
  background: #fef2f2;
  color: #b42318;
}

.task-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 10px;
  font-size: 0.9rem;
}

.task-error {
  margin: 10px 0 0;
  color: #b42318;
}

.task-result {
  margin: 10px 0 0;
  color: #1f2937;
}

.task-actions {
  margin-top: 14px;
}

.task-detail {
  display: grid;
  gap: 12px;
}

.detail-row {
  display: flex;
  gap: 8px;
  color: #374151;
}

.detail-block strong {
  display: block;
  margin-bottom: 8px;
  color: #111827;
}

.detail-block pre {
  margin: 0;
  padding: 14px;
  border-radius: 14px;
  background: #111827;
  color: #f9fafb;
  overflow: auto;
  font-size: 0.85rem;
  line-height: 1.6;
}

@media (max-width: 1080px) {
  .queue-actions,
  .builder-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .queue-head,
  .task-top,
  .task-actions,
  .detail-row,
  .builder-head {
    flex-direction: column;
    align-items: stretch;
  }

  .task-progress {
    flex-wrap: wrap;
  }
}
</style>
