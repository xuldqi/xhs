<template>
  <div class="review-view">
    <div class="review-shell">
      <Breadcrumb :items="breadcrumbItems" />

      <section class="review-hero">
        <div class="hero-copy">
          <p class="eyebrow">Review Console</p>
          <h1>矩阵审核台</h1>
          <p>
            这里只处理需要人工审核的矩阵任务。未来时间的稿件通过后会保留原计划时间重建成定时任务，
            到点自动触发；当前时间的稿件则直接派发。
          </p>
        </div>

        <div class="hero-actions">
          <el-button type="primary" @click="loadQueue">刷新待审列表</el-button>
          <el-button @click="goPublisher">回到矩阵发布台</el-button>
        </div>
      </section>

      <section class="headline-metrics">
        <article class="metric-panel">
          <span>待审任务</span>
          <strong>{{ pendingTasks.length }}</strong>
        </article>
        <article class="metric-panel">
          <span>未来定时待审</span>
          <strong>{{ futurePendingCount }}</strong>
        </article>
        <article class="metric-panel">
          <span>立即处理</span>
          <strong>{{ immediatePendingCount }}</strong>
        </article>
        <article class="metric-panel">
          <span>最近决策</span>
          <strong>{{ recentTasks.length }}</strong>
        </article>
      </section>

      <div class="review-grid">
        <section class="queue-column paper-panel">
          <div class="section-head">
            <div>
              <p class="section-kicker">Pending</p>
              <h2>待审队列</h2>
            </div>
            <el-input
              v-model="searchTerm"
              clearable
              placeholder="搜索主题 / 账号 / 标题"
              class="search-input"
            />
          </div>

          <div v-if="loading" class="loading-block">
            <el-skeleton :rows="5" animated />
          </div>

          <div v-else-if="filteredPendingTasks.length === 0" class="empty-state">
            <h3>待审队列是空的</h3>
            <p>当前没有 `reviewRequired=true` 的矩阵任务，或者都已经处理完了。</p>
          </div>

          <div v-else class="queue-list">
            <button
              v-for="task in filteredPendingTasks"
              :key="task.id"
              type="button"
              class="queue-card"
              :class="{ active: selectedTask?.id === task.id }"
              @click="selectTask(task.id)"
            >
              <div class="queue-top">
                <span class="queue-angle">{{ task.variant.angleLabel }}</span>
                <el-tag size="small" :type="task.isFuture ? 'warning' : 'danger'">
                  {{ task.isFuture ? '保留定时' : '立即处理' }}
                </el-tag>
              </div>
              <h3>{{ task.variant.title }}</h3>
              <p class="queue-account">{{ task.account.name }} {{ task.account.handle }}</p>
              <p class="queue-topic">{{ task.topic }}</p>
              <div class="queue-meta">
                <span>{{ formatDate(task.plannedAt) }}</span>
                <span>{{ task.account.niche || '未设赛道' }}</span>
              </div>
            </button>
          </div>
        </section>

        <section class="detail-column paper-panel">
          <div v-if="selectedTask" class="detail-wrap">
            <div class="section-head">
              <div>
                <p class="section-kicker">Review Desk</p>
                <h2>审稿台</h2>
              </div>
              <div class="head-actions">
                <el-button @click="copySelected">复制文案</el-button>
                <el-button
                  type="danger"
                  plain
                  :loading="rejecting"
                  @click="rejectSelected"
                >
                  驳回
                </el-button>
                <el-button
                  type="primary"
                  :loading="approving"
                  @click="approveSelected"
                >
                  {{ selectedTask.isFuture ? '通过并保留定时' : '通过并立即派发' }}
                </el-button>
              </div>
            </div>

            <div class="review-banners">
              <el-alert
                :closable="false"
                show-icon
                :type="selectedTask.isFuture ? 'info' : 'warning'"
              >
                <template #title>
                  {{ selectedTask.isFuture
                    ? '这条计划在未来时间执行，通过后会重建成一次性定时任务。'
                    : '这条计划已经到达执行窗口，通过后会立即派发。' }}
                </template>
              </el-alert>
            </div>

            <div class="review-layout">
              <div class="review-main">
                <article class="copy-sheet">
                  <div class="copy-head">
                    <span>{{ selectedTask.variant.angleLabel }}</span>
                    <strong>{{ selectedTask.variant.title }}</strong>
                  </div>
                  <p class="hook">{{ selectedTask.variant.hook }}</p>
                  <div class="paragraphs">
                    <p v-for="paragraph in selectedTask.variant.body" :key="paragraph">{{ paragraph }}</p>
                  </div>
                  <p class="cta">{{ selectedTask.variant.cta }}</p>

                  <div class="tag-row">
                    <el-tag v-for="tag in selectedTask.variant.hashtags" :key="tag" size="small">{{ tag }}</el-tag>
                  </div>
                </article>

                <article class="asset-sheet">
                  <div class="mini-head">
                    <span>封面字</span>
                    <strong>{{ selectedTask.assetPack.coverLines.join(' / ') }}</strong>
                  </div>
                  <div v-if="selectedTask.assetPack.imageUrls.length > 0" class="asset-block">
                    <label>已绑定图片链接</label>
                    <ul>
                      <li v-for="url in selectedTask.assetPack.imageUrls" :key="url">
                        <a :href="url" target="_blank" rel="noopener noreferrer">{{ url }}</a>
                      </li>
                    </ul>
                  </div>
                  <div class="asset-block">
                    <label>主图提示词</label>
                    <p>{{ selectedTask.assetPack.imagePrompt }}</p>
                  </div>
                  <div class="asset-block">
                    <label>配图提示词</label>
                    <ul>
                      <li v-for="prompt in selectedTask.assetPack.galleryPrompts" :key="prompt">{{ prompt }}</li>
                    </ul>
                  </div>
                </article>
              </div>

              <aside class="review-side">
                <article class="side-card">
                  <div class="mini-head">
                    <span>账号画像</span>
                    <strong>{{ selectedTask.account.name }}</strong>
                  </div>
                  <p>{{ selectedTask.account.persona }}</p>
                  <ul>
                    <li>账号：{{ selectedTask.account.handle || '未设置' }}</li>
                    <li>赛道：{{ selectedTask.account.niche || '未设置' }}</li>
                    <li>语气：{{ selectedTask.account.voice || '未设置' }}</li>
                    <li>图片风格：{{ selectedTask.account.imageStyle || '未设置' }}</li>
                    <li>计划时间：{{ formatDate(selectedTask.plannedAt) }}</li>
                  </ul>
                </article>

                <article class="side-card">
                  <div class="mini-head">
                    <span>审稿备注</span>
                    <strong>内部说明</strong>
                  </div>
                  <p>{{ selectedTask.plan.note || '当前没有额外备注。' }}</p>
                  <div class="review-input">
                    <label>驳回原因 / 通过说明</label>
                    <el-input
                      v-model="reviewNote"
                      type="textarea"
                      :rows="4"
                      placeholder="例如：标题太像上一批，重写开头并降低情绪词。"
                    />
                  </div>
                </article>

                <article class="side-card">
                  <div class="mini-head">
                    <span>原始任务</span>
                    <strong>{{ selectedTask.id }}</strong>
                  </div>
                  <ul>
                    <li>状态：{{ statusLabel(selectedTask.status) }}</li>
                    <li>触发方式：{{ selectedTask.trigger_mode }}</li>
                    <li>来源：{{ selectedTask.source }}</li>
                    <li v-if="selectedTask.next_run_at">next_run_at：{{ formatDate(selectedTask.next_run_at) }}</li>
                  </ul>
                </article>
              </aside>
            </div>
          </div>

          <div v-else class="empty-detail">
            <h3>先从左侧选一条待审任务</h3>
            <p>你会在这里看到账号人设、版本文案、配图提示词和审核备注。</p>
          </div>
        </section>
      </div>

      <section class="recent-panel paper-panel">
        <div class="section-head">
          <div>
            <p class="section-kicker">Recent Decisions</p>
            <h2>最近处理结果</h2>
          </div>
        </div>

        <div v-if="recentTasks.length === 0" class="empty-state compact">
          <h3>还没有最近决策</h3>
          <p>通过或驳回几条后，这里会显示最近处理记录。</p>
        </div>

        <div v-else class="recent-grid">
          <article v-for="task in recentTasks" :key="task.id" class="recent-card">
            <div class="recent-top">
              <strong>{{ task.variant.title }}</strong>
              <el-tag :type="statusTagType(task.status)" size="small">
                {{ statusLabel(task.status) }}
              </el-tag>
            </div>
            <p>{{ task.account.name }} · {{ task.variant.angleLabel }}</p>
            <small>{{ formatDate(task.updated_at || task.created_at) }}</small>
          </article>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import Breadcrumb from '@/components/Breadcrumb.vue'
import { analyticsService } from '@/services/analyticsService'
import {
  createAutomationTask,
  dispatchAutomationTask,
  getAutomationTasks,
  reviewAutomationTask,
  type AutomationTask,
} from '@/services/automationTaskService'

interface ReviewTaskMeta {
  id: string
  source: string
  topic: string
  status: AutomationTask['status']
  trigger_mode: AutomationTask['trigger_mode']
  created_at: string
  updated_at: string
  next_run_at: string | null
  plannedAt: string
  isFuture: boolean
  account: {
    id: string
    name: string
    handle: string
    persona: string
    niche: string
    voice: string
    imageStyle: string
  }
  variant: {
    id: string
    angleLabel: string
    title: string
    hook: string
    body: string[]
    hashtags: string[]
    cta: string
  }
  assetPack: {
    coverLines: string[]
    imagePrompt: string
    galleryPrompts: string[]
    imageUrls: string[]
  }
  plan: {
    id: string
    note: string
  }
  payload: Record<string, any>
}

const router = useRouter()
const loading = ref(false)
const approving = ref(false)
const rejecting = ref(false)
const searchTerm = ref('')
const reviewNote = ref('')
const tasks = ref<ReviewTaskMeta[]>([])
const selectedTaskId = ref('')

const breadcrumbItems = [
  { label: '首页', path: '/' },
  { label: '工具矩阵', path: '/tools' },
  { label: '矩阵审核台', path: '' },
]

const matrixSources = new Set(['matrix-publisher-ui', 'matrix-review-approved'])

const pendingTasks = computed(() => tasks.value.filter((task) => task.status === 'queued' && task.payload?.reviewRequired))
const futurePendingCount = computed(() => pendingTasks.value.filter((task) => task.isFuture).length)
const immediatePendingCount = computed(() => pendingTasks.value.filter((task) => !task.isFuture).length)
const recentTasks = computed(() => tasks.value.filter((task) => task.status !== 'queued').slice(0, 12))
const selectedTask = computed(() => pendingTasks.value.find((task) => task.id === selectedTaskId.value) || null)

const filteredPendingTasks = computed(() => {
  const q = searchTerm.value.trim().toLowerCase()
  if (!q) return pendingTasks.value
  return pendingTasks.value.filter((task) => {
    return [
      task.topic,
      task.account.name,
      task.account.handle,
      task.variant.title,
      task.variant.angleLabel,
    ].some((value) => value?.toLowerCase().includes(q))
  })
})

function normalizeString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => normalizeString(item))
    .filter(Boolean)
}

function isMatrixTask(task: AutomationTask) {
  return matrixSources.has(task.source)
    || (typeof task.payload?.workflowHint === 'string' && task.payload.workflowHint === 'matrix-publisher')
}

function toReviewTask(task: AutomationTask): ReviewTaskMeta | null {
  if (!isMatrixTask(task)) return null

  const account = task.payload?.accountProfile || {}
  const variant = task.payload?.variant || {}
  const assetPack = task.payload?.assetPack || {}
  const imageUrls = normalizeStringArray(task.payload?.xiaohongshu?.imageUrls || task.payload?.mediaAssets?.imageUrls || task.payload?.matrixPlan?.assetUrls)
  const plan = task.payload?.matrixPlan || {}
  const plannedAt = normalizeString(task.payload?.plannedAt || task.payload?.schedule?.runAt || task.next_run_at || task.created_at)
  const plannedAtMs = Date.parse(plannedAt)

  if (!normalizeString(variant.title) || !normalizeString(account.name)) {
    return null
  }

  return {
    id: task.id,
    source: task.source,
    topic: task.topic,
    status: task.status,
    trigger_mode: task.trigger_mode,
    created_at: task.created_at,
    updated_at: task.updated_at,
    next_run_at: task.next_run_at,
    plannedAt,
    isFuture: Number.isFinite(plannedAtMs) && plannedAtMs > Date.now() + 5 * 60 * 1000,
    account: {
      id: normalizeString(account.id),
      name: normalizeString(account.name),
      handle: normalizeString(account.handle),
      persona: normalizeString(account.persona),
      niche: normalizeString(account.niche),
      voice: normalizeString(account.voice),
      imageStyle: normalizeString(account.imageStyle),
    },
    variant: {
      id: normalizeString(variant.id),
      angleLabel: normalizeString(variant.angleLabel),
      title: normalizeString(variant.title),
      hook: normalizeString(variant.hook),
      body: normalizeStringArray(variant.body),
      hashtags: normalizeStringArray(variant.hashtags),
      cta: normalizeString(variant.cta),
    },
    assetPack: {
      coverLines: normalizeStringArray(assetPack.coverLines),
      imagePrompt: normalizeString(assetPack.imagePrompt),
      galleryPrompts: normalizeStringArray(assetPack.galleryPrompts),
      imageUrls,
    },
    plan: {
      id: normalizeString(plan.id),
      note: normalizeString(plan.note),
    },
    payload: task.payload || {},
  }
}

async function loadQueue() {
  loading.value = true
  try {
    const rawTasks = await getAutomationTasks(120)
    const nextTasks = rawTasks
      .map(toReviewTask)
      .filter((item): item is ReviewTaskMeta => Boolean(item))
      .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))

    tasks.value = nextTasks

    const nextSelected = pendingTasks.value.find((task) => task.id === selectedTaskId.value)
      || pendingTasks.value[0]
      || null
    selectedTaskId.value = nextSelected?.id || ''
  } catch (error: any) {
    ElMessage.error(error?.message || '加载审核队列失败')
  } finally {
    loading.value = false
  }
}

function selectTask(taskId: string) {
  selectedTaskId.value = taskId
  reviewNote.value = ''
}

function formatDate(value: string | null) {
  if (!value) return '-'
  return new Date(value).toLocaleString('zh-CN', { hour12: false })
}

function statusLabel(status: AutomationTask['status']) {
  if (status === 'completed') return '已完成'
  if (status === 'failed') return '失败'
  if (status === 'rejected') return '已驳回'
  if (status === 'replaced') return '已替换'
  if (status === 'dispatched') return '已派发'
  return '待派发'
}

function statusTagType(status: AutomationTask['status']) {
  if (status === 'completed') return 'success'
  if (status === 'failed') return 'danger'
  if (status === 'rejected') return 'danger'
  if (status === 'replaced') return 'info'
  if (status === 'dispatched') return 'primary'
  return 'warning'
}

function serializeSelected(task: ReviewTaskMeta) {
  return [
    task.variant.title,
    '',
    task.variant.hook,
    '',
    ...task.variant.body,
    '',
    task.variant.cta,
    '',
    task.variant.hashtags.join(' ')
  ].filter(Boolean).join('\n')
}

async function copySelected() {
  if (!selectedTask.value) return
  try {
    await navigator.clipboard.writeText(serializeSelected(selectedTask.value))
    ElMessage.success('文案已复制')
  } catch {
    ElMessage.error('复制失败')
  }
}

async function approveSelected() {
  const task = selectedTask.value
  if (!task) return

  approving.value = true
  try {
    if (task.isFuture) {
      const replacement = await createAutomationTask({
        workflowId: 'auto-content-engine',
        topic: task.topic,
        triggerMode: 'scheduled',
        source: 'matrix-review-approved',
        autoDispatch: false,
        payload: {
          ...task.payload,
          reviewRequired: false,
          accountProfile: {
            ...task.payload.accountProfile,
            requiresReview: false,
          },
          schedule: {
            id: task.plan.id || `review-approved-${task.id}`,
            label: 'Review Approved RunAt',
            runAt: task.plannedAt,
            type: 'runAt',
            note: reviewNote.value.trim() || task.plan.note || 'Approved in review queue',
          },
          reviewApproval: {
            approvedAt: new Date().toISOString(),
            approvedFromTaskId: task.id,
            note: reviewNote.value.trim() || null,
          }
        }
      })

      await reviewAutomationTask(task.id, 'replaced', {
        note: reviewNote.value.trim() || 'Approved in review queue and replaced by scheduled task',
        replacementTaskId: replacement.id,
      })
      ElMessage.success('已通过审核，并保留原计划时间创建定时任务')
    } else {
      await reviewAutomationTask(task.id, 'approved', {
        note: reviewNote.value.trim() || 'Approved in review queue',
      })
      await dispatchAutomationTask(task.id)
      ElMessage.success('已通过审核并立即派发')
    }

    analyticsService.trackToolUsage('matrix-review', 'approve', {
      success: true,
      metadata: {
        taskId: task.id,
        future: task.isFuture,
      }
    })
    await loadQueue()
    reviewNote.value = ''
  } catch (error: any) {
    analyticsService.trackToolUsage('matrix-review', 'approve', {
      success: false,
      metadata: { taskId: task.id, message: error?.message || 'unknown' }
    })
    ElMessage.error(error?.message || '审核通过失败')
  } finally {
    approving.value = false
  }
}

async function rejectSelected() {
  const task = selectedTask.value
  if (!task) return

  rejecting.value = true
  try {
    const reason = reviewNote.value.trim() || 'Rejected in matrix review console'
    await reviewAutomationTask(task.id, 'rejected', { note: reason })
    analyticsService.trackToolUsage('matrix-review', 'reject', {
      success: true,
      metadata: { taskId: task.id }
    })
    ElMessage.success('已驳回该任务')
    await loadQueue()
    reviewNote.value = ''
  } catch (error: any) {
    analyticsService.trackToolUsage('matrix-review', 'reject', {
      success: false,
      metadata: { taskId: task.id, message: error?.message || 'unknown' }
    })
    ElMessage.error(error?.message || '驳回失败')
  } finally {
    rejecting.value = false
  }
}

function goPublisher() {
  router.push('/tools/matrix-publisher')
}

void loadQueue()
</script>

<style scoped>
.review-view {
  min-height: 100vh;
  background:
    radial-gradient(circle at top right, rgba(181, 88, 56, 0.1), transparent 24%),
    linear-gradient(180deg, #f9f4ee 0%, #efe5d8 56%, #eadccf 100%);
  color: #231c18;
  padding: 28px 0 72px;
}

.review-shell {
  max-width: 1360px;
  margin: 0 auto;
  padding: 0 20px;
}

.paper-panel {
  background: rgba(255, 251, 245, 0.9);
  border: 1px solid rgba(106, 74, 55, 0.12);
  border-radius: 28px;
  box-shadow: 0 24px 54px rgba(83, 55, 38, 0.08);
}

.review-hero {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 18px;
  padding: 28px 0 0;
}

.eyebrow,
.section-kicker {
  margin: 0 0 10px;
  font-size: 0.76rem;
  text-transform: uppercase;
  letter-spacing: 0.22em;
  color: #9d6641;
}

.hero-copy h1,
.section-head h2 {
  margin: 0;
  font-family: 'Iowan Old Style', 'Palatino Linotype', 'Source Han Serif SC', serif;
  font-size: clamp(2.2rem, 4vw, 4rem);
  line-height: 0.96;
  letter-spacing: -0.05em;
}

.hero-copy p:last-child {
  max-width: 760px;
  margin: 16px 0 0;
  line-height: 1.8;
  color: #715b4f;
}

.hero-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.headline-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-top: 22px;
}

.metric-panel {
  padding: 18px 20px;
  border-radius: 18px;
  background: rgba(255, 250, 244, 0.82);
  border: 1px solid rgba(106, 74, 55, 0.1);
}

.metric-panel span {
  display: block;
  color: #8d715d;
}

.metric-panel strong {
  display: block;
  margin-top: 8px;
  font-size: 2rem;
}

.review-grid {
  display: grid;
  grid-template-columns: 0.88fr 1.12fr;
  gap: 18px;
  margin-top: 18px;
}

.queue-column,
.detail-column,
.recent-panel {
  padding: 24px;
}

.section-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.section-head h2 {
  font-size: 1.9rem;
}

.search-input {
  max-width: 260px;
}

.queue-list {
  display: grid;
  gap: 12px;
}

.queue-card {
  width: 100%;
  text-align: left;
  padding: 18px;
  border-radius: 22px;
  border: 1px solid rgba(96, 66, 47, 0.1);
  background: rgba(255, 248, 239, 0.88);
  transition: transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease;
  cursor: pointer;
}

.queue-card:hover,
.recent-card:hover {
  transform: translateY(-2px);
}

.queue-card.active {
  border-color: rgba(182, 113, 71, 0.35);
  box-shadow: 0 16px 34px rgba(108, 67, 43, 0.08);
}

.queue-top,
.recent-top,
.mini-head,
.copy-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: baseline;
}

.queue-angle,
.mini-head span,
.copy-head span {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: #98603d;
}

.queue-card h3,
.copy-head strong {
  margin: 12px 0 0;
  font-size: 1.15rem;
  line-height: 1.4;
  color: #2e241f;
}

.queue-account,
.queue-topic,
.queue-meta,
.mini-head strong,
.side-card p,
.asset-block p,
.asset-block li {
  color: #6f5a4e;
}

.queue-account,
.queue-topic {
  margin: 10px 0 0;
  line-height: 1.6;
}

.queue-meta {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 14px;
  font-size: 0.85rem;
}

.empty-state,
.empty-detail {
  padding: 32px;
  border-radius: 24px;
  text-align: center;
  background: rgba(243, 233, 220, 0.55);
  border: 1px dashed rgba(122, 95, 78, 0.2);
}

.empty-state.compact {
  padding: 26px;
}

.empty-state h3,
.empty-detail h3 {
  margin: 0;
}

.empty-state p,
.empty-detail p {
  margin: 10px 0 0;
  color: #7b6557;
}

.head-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.review-banners {
  margin-bottom: 16px;
}

.review-layout {
  display: grid;
  grid-template-columns: 1.08fr 0.92fr;
  gap: 16px;
}

.review-main,
.review-side {
  display: grid;
  gap: 16px;
}

.copy-sheet,
.asset-sheet,
.side-card {
  padding: 20px;
  border-radius: 24px;
  background: rgba(255, 253, 249, 0.95);
  border: 1px solid rgba(105, 73, 54, 0.1);
}

.hook {
  margin: 14px 0 0;
  font-size: 1.02rem;
  line-height: 1.8;
  color: #4d3d34;
}

.paragraphs {
  display: grid;
  gap: 12px;
  margin-top: 18px;
}

.paragraphs p,
.cta {
  margin: 0;
  line-height: 1.8;
  color: #322822;
}

.cta {
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px dashed rgba(122, 95, 78, 0.16);
}

.tag-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 18px;
}

.asset-block {
  margin-top: 14px;
}

.asset-block label,
.review-input label {
  display: block;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: #9a673f;
}

.asset-block ul,
.side-card ul {
  margin: 10px 0 0;
  padding-left: 18px;
  display: grid;
  gap: 8px;
}

.asset-block a {
  color: #0f766e;
  text-decoration: underline;
  word-break: break-all;
}

.review-input {
  margin-top: 14px;
}

.recent-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.recent-card {
  padding: 18px;
  border-radius: 20px;
  background: rgba(255, 249, 241, 0.96);
  border: 1px solid rgba(96, 66, 47, 0.1);
}

.recent-card p,
.recent-card small {
  display: block;
  margin-top: 10px;
  color: #705a4d;
}

@media (max-width: 1180px) {
  .review-grid,
  .review-layout,
  .headline-metrics,
  .recent-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .review-shell {
    padding: 0 14px;
  }

  .review-hero,
  .section-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .queue-column,
  .detail-column,
  .recent-panel {
    padding: 20px;
  }

  .head-actions,
  .hero-actions {
    width: 100%;
  }

  .search-input {
    max-width: none;
    width: 100%;
  }
}
</style>
