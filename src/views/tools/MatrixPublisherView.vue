<template>
  <div class="matrix-view">
    <div class="matrix-shell">
      <Breadcrumb :items="breadcrumbItems" />

      <section class="hero-band">
        <div class="hero-copy">
          <p class="hero-kicker">Matrix Publishing Desk</p>
          <h1>多账号矩阵发布台</h1>
          <p class="hero-subtitle">
            一个主题先拆成多份不同稿，再按账号人设、风格和时间窗做错峰分发。
            这版先把账号配置、多版本生成、分发队列和任务入队打通。
          </p>

          <div class="hero-actions">
            <el-button type="primary" size="large" @click="generateVariants">
              <el-icon><MagicStick /></el-icon>
              生成矩阵版本
            </el-button>
            <el-button size="large" @click="goToReview">
              去审核台
            </el-button>
            <el-button size="large" plain @click="goToHistory">
              <el-icon><Connection /></el-icon>
              查看执行历史
            </el-button>
          </div>
        </div>

        <div class="hero-rules">
          <div class="rule-card">
            <span>规则 01</span>
            <strong>一个主题，不直接群发同一篇。</strong>
            <p>默认拆成教程、经验、避坑、清单、观点五种切口。</p>
          </div>
          <div class="rule-card">
            <span>规则 02</span>
            <strong>每个账号先定义角色，再谈自动发布。</strong>
            <p>人设、图片风格、时间窗、日上限都写进计划。</p>
          </div>
          <div class="rule-card accent">
            <span>规则 03</span>
            <strong>先排队，再入任务。</strong>
            <p>需要人工审核的账号会自动保留为待审，不直接派发。</p>
          </div>
        </div>
      </section>

      <section class="stats-ribbon">
        <article class="stat-chip">
          <span>活跃账号</span>
          <strong>{{ activeAccountCount }}</strong>
        </article>
        <article class="stat-chip">
          <span>已生成版本</span>
          <strong>{{ variants.length }}</strong>
        </article>
        <article class="stat-chip">
          <span>待排计划</span>
          <strong>{{ plans.length }}</strong>
        </article>
        <article class="stat-chip">
          <span>需审核账号</span>
          <strong>{{ reviewAccountCount }}</strong>
        </article>
      </section>

      <div class="workspace-grid">
        <section class="panel paper-panel accounts-panel">
          <div class="section-head">
            <div>
              <p class="section-kicker">Account Studio</p>
              <h2>账号画像</h2>
            </div>
            <el-button text @click="resetAccountEditor">新建账号</el-button>
          </div>

          <div class="account-board">
            <article
              v-for="account in accounts"
              :key="account.id"
              class="account-strip"
              :class="{ active: account.active, editing: accountEditor.id === account.id }"
            >
              <div class="account-main">
                <div class="account-topline">
                  <strong>{{ account.name }}</strong>
                  <span>{{ account.handle || '未设置账号名' }}</span>
                </div>
                <p>{{ account.persona || '先写这个账号负责哪种内容表达。' }}</p>
                <div class="account-meta">
                  <span>{{ account.niche || '未设赛道' }}</span>
                  <span>{{ account.imageStyle }}</span>
                  <span>日上限 {{ account.dailyLimit }}</span>
                </div>
              </div>

              <div class="account-tags">
                <el-tag v-for="tag in account.defaultTags" :key="tag" size="small">{{ tag }}</el-tag>
                <el-tag size="small" :type="account.requiresReview ? 'warning' : 'success'">
                  {{ account.requiresReview ? '先审后发' : '可直发' }}
                </el-tag>
              </div>

              <div class="account-actions">
                <el-button size="small" @click="editAccount(account)">编辑</el-button>
                <el-button size="small" text @click="toggleAccountActive(account.id)">
                  {{ account.active ? '停用' : '启用' }}
                </el-button>
                <el-button size="small" text type="danger" @click="deleteAccount(account.id)">删除</el-button>
              </div>
            </article>
          </div>

          <div class="editor-block">
            <div class="sub-head">
              <strong>{{ accountEditor.id ? '编辑账号' : '新增账号' }}</strong>
              <span>账号信息直接影响版本分配和队列规则。</span>
            </div>

            <el-form label-position="top" class="editor-form">
              <div class="form-grid">
                <el-form-item label="账号名称">
                  <el-input v-model="accountEditor.name" placeholder="例如：方法论主号" />
                </el-form-item>
                <el-form-item label="账号标识">
                  <el-input v-model="accountEditor.handle" placeholder="例如：@content.playbook" />
                </el-form-item>
              </div>

              <el-form-item label="人设描述">
                <el-input
                  v-model="accountEditor.persona"
                  type="textarea"
                  :rows="2"
                  placeholder="这个账号像谁在说话，负责讲什么视角"
                />
              </el-form-item>

              <div class="form-grid">
                <el-form-item label="内容赛道">
                  <el-input v-model="accountEditor.niche" placeholder="例如：AI 提效 / 本地商家 / 个人品牌" />
                </el-form-item>
                <el-form-item label="语气风格">
                  <el-input v-model="accountEditor.voice" placeholder="例如：利落、走心、像在复盘" />
                </el-form-item>
              </div>

              <div class="form-grid">
                <el-form-item label="图片风格">
                  <el-input v-model="accountEditor.imageStyle" placeholder="例如：奶油白纸感、杂志图、信息卡片" />
                </el-form-item>
                <el-form-item label="日发布上限">
                  <el-input v-model.number="accountEditor.dailyLimit" type="number" min="1" max="5" />
                </el-form-item>
              </div>

              <div class="form-grid">
                <el-form-item label="默认标签">
                  <el-input v-model="accountEditor.defaultTagsText" placeholder="逗号分隔，例如：模板分享,运营复盘" />
                </el-form-item>
                <el-form-item label="推荐时段">
                  <el-input v-model="accountEditor.preferredSlotsText" placeholder="逗号分隔，例如：10:30,20:00" />
                </el-form-item>
              </div>

              <div class="switch-row">
                <label>
                  <span>账号启用</span>
                  <el-switch v-model="accountEditor.active" />
                </label>
                <label>
                  <span>必须人工审核</span>
                  <el-switch v-model="accountEditor.requiresReview" />
                </label>
              </div>

              <div class="editor-actions">
                <el-button @click="resetAccountEditor">清空</el-button>
                <el-button type="primary" @click="saveAccount">保存账号</el-button>
              </div>
            </el-form>
          </div>
        </section>

        <section class="panel paper-panel builder-panel">
          <div class="section-head">
            <div>
              <p class="section-kicker">Campaign Builder</p>
              <h2>主题拆稿器</h2>
            </div>
            <span class="section-note">{{ generationSourceLabel }}</span>
          </div>

          <el-form label-position="top" class="builder-form">
            <el-form-item label="主题">
              <el-input
                v-model="campaignForm.topic"
                placeholder="例如：AI 内容矩阵怎么做得像真人而不是批量机改"
                size="large"
                clearable
              />
            </el-form-item>

            <div class="form-grid">
              <el-form-item label="目标受众">
                <el-input v-model="campaignForm.audience" placeholder="例如：想系统做小红书的服务型创作者" />
              </el-form-item>
              <el-form-item label="目标">
                <el-input v-model="campaignForm.goal" placeholder="例如：稳定涨粉 + 私信询盘" />
              </el-form-item>
            </div>

            <div class="form-grid">
              <el-form-item label="关键词补充">
                <el-input v-model="campaignForm.keywordSeed" placeholder="例如：矩阵运营,多账号,自动发布" />
              </el-form-item>
              <el-form-item label="默认 CTA">
                <el-input v-model="campaignForm.callToAction" placeholder="例如：收藏并评论“模板”" />
              </el-form-item>
            </div>

            <el-form-item label="版本数量">
              <div class="count-row">
                <el-slider v-model="campaignForm.variantCount" :min="3" :max="8" show-input />
              </div>
            </el-form-item>

            <el-form-item label="切口模板">
              <div class="angle-grid">
                <button
                  v-for="preset in MATRIX_ANGLE_PRESETS"
                  :key="preset.key"
                  type="button"
                  class="angle-pill"
                  :class="{ active: campaignForm.angleKeys.includes(preset.key) }"
                  @click="toggleAngle(preset.key)"
                >
                  <strong>{{ preset.label }}</strong>
                  <span>{{ preset.description }}</span>
                </button>
              </div>
            </el-form-item>
          </el-form>

          <div class="builder-actions">
            <el-button :loading="generating" type="primary" size="large" @click="generateVariants">
              <el-icon><MagicStick /></el-icon>
              {{ generating ? '正在生成版本...' : '生成矩阵版本' }}
            </el-button>
            <el-button @click="clearWorkspace">清空版本与计划</el-button>
          </div>

          <div class="campaign-summary">
            <div>
              <strong>本次生成策略</strong>
              <p>{{ campaignSummary }}</p>
            </div>
            <div class="summary-badges">
              <el-tag v-for="key in campaignForm.angleKeys" :key="key" size="small">
                {{ getAngleLabel(key) }}
              </el-tag>
            </div>
          </div>
        </section>
      </div>

      <section class="panel paper-panel variants-panel">
        <div class="section-head">
          <div>
            <p class="section-kicker">Variants</p>
            <h2>多版本稿件</h2>
          </div>
          <div class="inline-actions">
            <el-button text @click="autoPlanSelected">自动分配账号</el-button>
            <el-button text @click="copyAllVariants" :disabled="variants.length === 0">复制全部版本</el-button>
          </div>
        </div>

        <div v-if="variants.length === 0" class="empty-sheet">
          <h3>还没有版本草稿</h3>
          <p>先设好主题和账号画像，再生成多份不同切口的稿件。</p>
        </div>

        <div v-else class="variant-grid">
          <article
            v-for="variant in variants"
            :key="variant.id"
            class="variant-card"
            :class="{ selected: selectedVariantIds.includes(variant.id) }"
          >
            <div class="variant-top">
              <label class="variant-check">
                <input
                  :checked="selectedVariantIds.includes(variant.id)"
                  type="checkbox"
                  @change="toggleVariantSelection(variant.id)"
                />
                <span>{{ variant.angleLabel }}</span>
              </label>
              <el-tag :type="riskTagType(variant.riskLevel)" size="small">
                {{ riskLabel(variant.riskLevel) }}
              </el-tag>
            </div>

            <h3>{{ variant.title }}</h3>
            <p class="variant-hook">{{ variant.hook }}</p>

            <ul class="variant-body">
              <li v-for="paragraph in variant.body" :key="paragraph">{{ paragraph }}</li>
            </ul>

            <div class="variant-footnotes">
              <p><strong>差异点：</strong>{{ variant.differenceNote }}</p>
              <p><strong>更适合：</strong>{{ variant.personaFit }}</p>
            </div>

            <div class="asset-box">
              <strong>封面字</strong>
              <p>{{ variant.assetPack.coverLines.join(' / ') }}</p>
              <strong>图片提示词</strong>
              <p>{{ variant.assetPack.imagePrompt }}</p>
            </div>

            <div class="variant-tags">
              <el-tag v-for="tag in variant.hashtags" :key="tag" size="small">{{ tag }}</el-tag>
            </div>

            <div class="variant-actions">
              <el-button size="small" @click="copyVariant(variant)">复制</el-button>
              <el-button size="small" type="primary" @click="appendPlanForVariant(variant.id)">加入计划</el-button>
            </div>
          </article>
        </div>
      </section>

      <section class="panel paper-panel planner-panel">
        <div class="section-head">
          <div>
            <p class="section-kicker">Dispatch Queue</p>
            <h2>分发计划</h2>
          </div>
          <div class="inline-actions">
            <label class="dispatch-switch">
              <span>到点立刻派发</span>
              <el-switch v-model="dispatchNow" />
            </label>
            <el-button text @click="addEmptyPlan">新增空白计划</el-button>
          </div>
        </div>

        <div class="validation-stack">
          <el-alert
            v-for="issue in validationIssues"
            :key="issue.id"
            :type="issue.level === 'error' ? 'error' : 'warning'"
            :closable="false"
            show-icon
            class="validation-item"
          >
            <template #title>{{ issue.message }}</template>
          </el-alert>
        </div>

        <div v-if="plans.length === 0" class="empty-sheet compact">
          <h3>还没有排班</h3>
          <p>你可以先自动分配，也可以手动给某个版本指定账号和时间。</p>
        </div>

        <div v-else class="plan-list">
          <article v-for="plan in plans" :key="plan.id" class="plan-row">
            <div class="plan-grid">
              <label>
                <span>账号</span>
                <el-select :model-value="plan.accountId" @update:model-value="updatePlan(plan.id, 'accountId', $event)">
                  <el-option
                    v-for="account in activeAccounts"
                    :key="account.id"
                    :label="`${account.name} ${account.handle ? `(${account.handle})` : ''}`"
                    :value="account.id"
                  />
                </el-select>
              </label>

              <label>
                <span>版本</span>
                <el-select :model-value="plan.variantId" @update:model-value="updatePlan(plan.id, 'variantId', $event)">
                  <el-option
                    v-for="variant in variants"
                    :key="variant.id"
                    :label="`${variant.angleLabel}｜${variant.title}`"
                    :value="variant.id"
                  />
                </el-select>
              </label>

              <label>
                <span>时间</span>
                <input
                  class="native-datetime"
                  type="datetime-local"
                  :value="toLocalDatetime(plan.plannedAt)"
                  @input="handlePlanDatetimeInput(plan.id, $event)"
                />
              </label>

              <label>
                <span>图片链接</span>
                <el-input
                  :model-value="plan.assetUrls.join('\n')"
                  type="textarea"
                  :rows="2"
                  placeholder="每行一个 URL，可留空只传提示词"
                  @update:model-value="updatePlan(plan.id, 'assetUrls', parseAssetUrls($event))"
                />
              </label>

              <label>
                <span>备注</span>
                <el-input :model-value="plan.note" placeholder="例如：给个人号版本再人工过一遍" @update:model-value="updatePlan(plan.id, 'note', $event)" />
              </label>
            </div>

            <div class="plan-meta">
              <div class="meta-left">
                <el-tag size="small">小红书</el-tag>
                <el-tag size="small" :type="plan.reviewRequired ? 'warning' : 'success'">
                  {{ plan.reviewRequired ? '先审后发' : '可直发' }}
                </el-tag>
                <el-tag size="small" type="info">{{ plan.status === 'queued' ? '已入队' : '草稿' }}</el-tag>
              </div>
              <div class="meta-right">
                <span>{{ summarizePlan(plan) }}</span>
                <el-button text type="danger" @click="removePlan(plan.id)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
          </article>
        </div>

        <div class="planner-actions">
          <el-button @click="autoPlanSelected">
            <el-icon><RefreshRight /></el-icon>
            重新自动排班
          </el-button>
          <el-button type="primary" :loading="queueing" @click="queuePlans">
            <el-icon><UploadFilled /></el-icon>
            {{ queueing ? '正在创建任务...' : '创建队列任务' }}
          </el-button>
        </div>
      </section>

      <section v-if="latestTasks.length > 0" class="panel paper-panel task-panel">
        <div class="section-head">
          <div>
            <p class="section-kicker">Queued Tasks</p>
            <h2>最近入队结果</h2>
          </div>
          <el-button text @click="goToHistory">去看历史详情</el-button>
        </div>

        <div class="task-grid">
          <article v-for="task in latestTasks" :key="task.id" class="task-card">
            <div class="task-top">
              <strong>{{ task.topic }}</strong>
              <el-tag :type="task.status === 'dispatched' ? 'primary' : 'warning'" size="small">{{ task.status }}</el-tag>
            </div>
            <p>{{ task.payload?.accountProfile?.name || '未写账号' }} · {{ task.payload?.variant?.angleLabel || '未写版本' }}</p>
            <div class="task-meta-line">
              <span>{{ formatTaskDate(task.created_at) }}</span>
              <span>{{ task.id }}</span>
            </div>
          </article>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Connection,
  Delete,
  MagicStick,
  RefreshRight,
  UploadFilled,
} from '@element-plus/icons-vue'
import Breadcrumb from '@/components/Breadcrumb.vue'
import { analyticsService } from '@/services/analyticsService'
import { createAutomationTask, type AutomationTask } from '@/services/automationTaskService'
import {
  MATRIX_ANGLE_PRESETS,
  buildMatrixDispatchPayload,
  createMatrixAccountDraft,
  createRecommendedPlans,
  generateMatrixCampaign,
  getAnglePreset,
  loadMatrixAccounts,
  loadMatrixCampaignDraft,
  loadMatrixPlans,
  loadMatrixVariants,
  removeMatrixAccount,
  saveMatrixAccounts,
  saveMatrixCampaignDraft,
  saveMatrixPlans,
  saveMatrixVariants,
  serializeVariant,
  type MatrixAccountProfile,
  type MatrixContentVariant,
  type MatrixDispatchPlan,
  type MatrixRiskLevel,
  upsertMatrixAccount,
  validateMatrixSetup,
} from '@/services/matrixPublisherService'

interface CampaignFormState {
  topic: string
  audience: string
  keywordSeed: string
  goal: string
  callToAction: string
  variantCount: number
  angleKeys: string[]
}

interface AccountEditorState {
  id: string
  name: string
  handle: string
  persona: string
  niche: string
  voice: string
  imageStyle: string
  dailyLimit: number
  defaultTagsText: string
  preferredSlotsText: string
  requiresReview: boolean
  active: boolean
}

const router = useRouter()

const DEFAULT_CAMPAIGN_FORM: CampaignFormState = {
  topic: '',
  audience: '想把同一个主题拆成多份真人感内容的创作者 / 服务型商家',
  keywordSeed: '',
  goal: '稳定涨粉 + 询盘转化',
  callToAction: '收藏这篇，评论区回你模板',
  variantCount: 5,
  angleKeys: MATRIX_ANGLE_PRESETS.map((item) => item.key),
}

const breadcrumbItems = [
  { label: '首页', path: '/' },
  { label: '工具矩阵', path: '/tools' },
  { label: '矩阵发布台', path: '' },
]

const accounts = ref<MatrixAccountProfile[]>(loadMatrixAccounts())
const variants = ref<MatrixContentVariant[]>(loadMatrixVariants())
const plans = ref<MatrixDispatchPlan[]>(loadMatrixPlans())
const latestTasks = ref<AutomationTask[]>([])

const campaignForm = reactive<CampaignFormState>(loadMatrixCampaignDraft(DEFAULT_CAMPAIGN_FORM))
const generating = ref(false)
const queueing = ref(false)
const dispatchNow = ref(false)
const campaignSummary = ref('先把账号角色设清楚，再生成矩阵版本。')
const generationSource = ref<'ai' | 'mock'>(variants.value.length > 0 ? 'mock' : 'ai')
const selectedVariantIds = ref<string[]>(variants.value.map((item) => item.id))

const accountEditor = reactive<AccountEditorState>(toEditorState())

const activeAccounts = computed(() => accounts.value.filter((item) => item.active))
const activeAccountCount = computed(() => activeAccounts.value.length)
const reviewAccountCount = computed(() => activeAccounts.value.filter((item) => item.requiresReview).length)
const selectedVariants = computed(() => variants.value.filter((item) => selectedVariantIds.value.includes(item.id)))
const validationIssues = computed(() => validateMatrixSetup(accounts.value, variants.value, plans.value))
const hasBlockingIssue = computed(() => validationIssues.value.some((item) => item.level === 'error'))
const generationSourceLabel = computed(() => generationSource.value === 'ai' ? 'AI 实时生成' : 'Mock / 演示兜底')

watch(accounts, (value) => saveMatrixAccounts(value), { deep: true })
watch(plans, (value) => saveMatrixPlans(value), { deep: true })
watch(variants, (value) => saveMatrixVariants(value), { deep: true })
watch(campaignForm, (value) => saveMatrixCampaignDraft(value), { deep: true })

function toEditorState(account?: MatrixAccountProfile): AccountEditorState {
  const base = account || createMatrixAccountDraft()
  return {
    id: account?.id || '',
    name: base.name,
    handle: base.handle,
    persona: base.persona,
    niche: base.niche,
    voice: base.voice,
    imageStyle: base.imageStyle,
    dailyLimit: base.dailyLimit,
    defaultTagsText: base.defaultTags.join(', '),
    preferredSlotsText: base.preferredSlots.join(', '),
    requiresReview: base.requiresReview,
    active: base.active,
  }
}

function fromEditorState(editor: AccountEditorState): MatrixAccountProfile {
  return createMatrixAccountDraft({
    id: editor.id || undefined,
    name: editor.name.trim(),
    handle: editor.handle.trim(),
    persona: editor.persona.trim(),
    niche: editor.niche.trim(),
    voice: editor.voice.trim(),
    imageStyle: editor.imageStyle.trim() || '暖白杂志感',
    dailyLimit: Math.min(5, Math.max(1, Number(editor.dailyLimit || 1))),
    defaultTags: editor.defaultTagsText
      .split(/[,，]/)
      .map((item) => item.trim())
      .filter(Boolean),
    preferredSlots: editor.preferredSlotsText
      .split(/[,，]/)
      .map((item) => item.trim())
      .filter(Boolean),
    requiresReview: editor.requiresReview,
    active: editor.active,
  })
}

function getAngleLabel(key: string) {
  return getAnglePreset(key).label
}

function resetAccountEditor() {
  Object.assign(accountEditor, toEditorState())
}

function editAccount(account: MatrixAccountProfile) {
  Object.assign(accountEditor, toEditorState(account))
}

function saveAccount() {
  const next = fromEditorState(accountEditor)
  if (!next.name || !next.persona) {
    ElMessage.warning('账号名称和人设描述至少填一个完整出来')
    return
  }

  accounts.value = upsertMatrixAccount(accounts.value, next)
  resetAccountEditor()
  ElMessage.success('账号画像已保存')
}

function deleteAccount(accountId: string) {
  accounts.value = removeMatrixAccount(accounts.value, accountId)
  plans.value = plans.value.filter((item) => item.accountId !== accountId)
  if (accountEditor.id === accountId) {
    resetAccountEditor()
  }
}

function toggleAccountActive(accountId: string) {
  accounts.value = accounts.value.map((item) => item.id === accountId ? { ...item, active: !item.active } : item)
}

function toggleAngle(key: string) {
  if (campaignForm.angleKeys.includes(key)) {
    if (campaignForm.angleKeys.length === 1) return
    campaignForm.angleKeys = campaignForm.angleKeys.filter((item) => item !== key)
    return
  }
  campaignForm.angleKeys = [...campaignForm.angleKeys, key]
}

function toggleVariantSelection(variantId: string) {
  if (selectedVariantIds.value.includes(variantId)) {
    selectedVariantIds.value = selectedVariantIds.value.filter((item) => item !== variantId)
    return
  }
  selectedVariantIds.value = [...selectedVariantIds.value, variantId]
}

async function generateVariants() {
  if (!campaignForm.topic.trim()) {
    ElMessage.warning('先写一个主题')
    return
  }

  if (activeAccounts.value.length === 0) {
    ElMessage.warning('至少启用一个账号，系统才知道要往哪种人设分发')
    return
  }

  generating.value = true

  try {
    const result = await generateMatrixCampaign({
      topic: campaignForm.topic.trim(),
      audience: campaignForm.audience.trim(),
      keywordSeed: campaignForm.keywordSeed.trim() || undefined,
      goal: campaignForm.goal.trim(),
      callToAction: campaignForm.callToAction.trim() || undefined,
      variantCount: campaignForm.variantCount,
      angleKeys: campaignForm.angleKeys,
      accounts: activeAccounts.value,
    })

    generationSource.value = result.source
    campaignSummary.value = result.summary
    variants.value = result.variants
    selectedVariantIds.value = result.variants.map((item) => item.id)
    plans.value = []

    analyticsService.trackToolUsage('matrix-publisher', 'generate_variants', {
      success: true,
      metadata: {
        source: result.source,
        variantCount: result.variants.length,
        accountCount: activeAccounts.value.length,
      }
    })

    if (result.source === 'mock') {
      ElMessage.warning('当前用了演示兜底结果；接好后端 AI 后会换成实时生成')
    } else {
      ElMessage.success(`已生成 ${result.variants.length} 个差异化版本`)
    }
  } catch (error: any) {
    analyticsService.trackToolUsage('matrix-publisher', 'generate_variants', {
      success: false,
      metadata: { message: error?.message || 'unknown' }
    })
    ElMessage.error(error?.message || '生成版本失败')
  } finally {
    generating.value = false
  }
}

function appendPlanForVariant(variantId: string) {
  const account = activeAccounts.value[0]
  if (!account) {
    ElMessage.warning('先启用一个账号')
    return
  }

  plans.value = createRecommendedPlans(
    variants.value.filter((item) => item.id === variantId),
    [account],
    plans.value
  )
}

function autoPlanSelected() {
  plans.value = createRecommendedPlans(selectedVariants.value, accounts.value, [])
}

function addEmptyPlan() {
  const account = activeAccounts.value[0]
  const variant = selectedVariants.value[0] || variants.value[0]
  if (!account || !variant) {
    ElMessage.warning('至少要有一个启用账号和一个版本草稿')
    return
  }

  plans.value = [
    ...plans.value,
    {
      id: `plan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      accountId: account.id,
      variantId: variant.id,
      channel: 'xiaohongshu',
      plannedAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
      note: '',
      status: 'draft',
      reviewRequired: account.requiresReview,
      assetUrls: [],
    }
  ]
}

function updatePlan(planId: string, field: keyof MatrixDispatchPlan, value: any) {
  plans.value = plans.value.map((plan) => {
    if (plan.id !== planId) return plan

    const nextPlan = { ...plan, [field]: value }
    if (field === 'accountId') {
      const account = accounts.value.find((item) => item.id === value)
      nextPlan.reviewRequired = account?.requiresReview ?? nextPlan.reviewRequired
    }
    return nextPlan
  })
}

function handlePlanDatetimeInput(planId: string, event: Event) {
  const target = event.target as HTMLInputElement | null
  updatePlan(planId, 'plannedAt', fromLocalDatetime(target?.value || ''))
}

function parseAssetUrls(value: string) {
  return [...new Set(
    value
      .split(/[\n,，]/)
      .map((item) => item.trim())
      .filter((item) => /^https?:\/\//i.test(item))
  )]
}

function removePlan(planId: string) {
  plans.value = plans.value.filter((item) => item.id !== planId)
}

function clearWorkspace() {
  variants.value = []
  plans.value = []
  selectedVariantIds.value = []
  latestTasks.value = []
  campaignSummary.value = '版本和计划已清空，可以重新生成。'
}

async function queuePlans() {
  if (!campaignForm.topic.trim()) {
    ElMessage.warning('主题为空，先补一个主题再创建任务')
    return
  }

  if (plans.value.length === 0) {
    ElMessage.warning('先排一个分发计划')
    return
  }

  if (hasBlockingIssue.value) {
    ElMessage.error('先修掉红色规则，再创建任务')
    return
  }

  queueing.value = true
  const createdTasks: AutomationTask[] = []
  const queuedPlanIds = new Set<string>()

  try {
    for (const plan of plans.value) {
      const account = accounts.value.find((item) => item.id === plan.accountId)
      const variant = variants.value.find((item) => item.id === plan.variantId)

      if (!account || !variant) {
        continue
      }

      const plannedAtMs = Date.parse(plan.plannedAt)
      const isFuturePlan = Number.isFinite(plannedAtMs) && plannedAtMs > Date.now() + 5 * 60 * 1000
      const shouldDispatchNow = dispatchNow.value
        && !plan.reviewRequired
        && (!Number.isFinite(plannedAtMs) || plannedAtMs <= Date.now() + 5 * 60 * 1000)
      const shouldAutoSchedule = !plan.reviewRequired && isFuturePlan

      const payload = shouldAutoSchedule
        ? {
            ...buildMatrixDispatchPayload(campaignForm.topic.trim(), account, variant, plan),
            schedule: {
              id: `matrix-run-at-${plan.id}`,
              label: 'Matrix Planned Dispatch',
              runAt: plan.plannedAt,
              type: 'runAt',
              note: plan.note || `${account.name} 定时发布 ${variant.angleLabel}`,
            }
          }
        : buildMatrixDispatchPayload(campaignForm.topic.trim(), account, variant, plan)

      const task = await createAutomationTask({
        workflowId: 'auto-content-engine',
        topic: campaignForm.topic.trim(),
        payload,
        triggerMode: shouldAutoSchedule ? 'scheduled' : 'manual',
        source: 'matrix-publisher-ui',
        autoDispatch: shouldDispatchNow,
      })

      createdTasks.push(task)
      queuedPlanIds.add(plan.id)
    }

    latestTasks.value = createdTasks
    plans.value = plans.value.map((item) => ({
      ...item,
      status: queuedPlanIds.has(item.id) ? 'queued' : item.status,
    }))

    analyticsService.trackToolUsage('matrix-publisher', 'queue_dispatch', {
      success: true,
      metadata: {
        plans: plans.value.length,
        dispatchedNow: dispatchNow.value,
        created: createdTasks.length,
      }
    })

    ElMessage.success(`已创建 ${createdTasks.length} 个矩阵任务`)
  } catch (error: any) {
    analyticsService.trackToolUsage('matrix-publisher', 'queue_dispatch', {
      success: false,
      metadata: { message: error?.message || 'unknown' }
    })
    ElMessage.error(error?.message || '创建任务失败')
  } finally {
    queueing.value = false
  }
}

async function copyVariant(variant: MatrixContentVariant) {
  try {
    await navigator.clipboard.writeText(serializeVariant(variant))
    ElMessage.success('版本已复制')
  } catch {
    ElMessage.error('复制失败')
  }
}

async function copyAllVariants() {
  if (variants.value.length === 0) return

  const text = variants.value
    .map((variant) => `【${variant.angleLabel}】\n${serializeVariant(variant)}`)
    .join('\n\n----------------\n\n')

  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('全部版本已复制')
  } catch {
    ElMessage.error('复制失败')
  }
}

function goToHistory() {
  router.push('/tools/content-automation-history')
}

function goToReview() {
  router.push('/tools/matrix-review')
}

function summarizePlan(plan: MatrixDispatchPlan) {
  const account = accounts.value.find((item) => item.id === plan.accountId)
  const variant = variants.value.find((item) => item.id === plan.variantId)
  const imageSummary = plan.assetUrls.length > 0 ? ` · 图片 ${plan.assetUrls.length} 张` : ''
  return `${account?.name || '未选账号'} · ${variant?.angleLabel || '未选版本'} · ${formatTaskDate(plan.plannedAt)}${imageSummary}`
}

function riskLabel(riskLevel: MatrixRiskLevel) {
  if (riskLevel === 'high') return '高讨论风险'
  if (riskLevel === 'medium') return '中等讨论'
  return '稳妥'
}

function riskTagType(riskLevel: MatrixRiskLevel) {
  if (riskLevel === 'high') return 'danger'
  if (riskLevel === 'medium') return 'warning'
  return 'success'
}

function toLocalDatetime(value: string) {
  if (!value) return ''
  const date = new Date(value)
  const pad = (num: number) => String(num).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function fromLocalDatetime(value: string) {
  if (!value) return new Date().toISOString()
  return new Date(value).toISOString()
}

function formatTaskDate(value: string | null) {
  if (!value) return '-'
  return new Date(value).toLocaleString('zh-CN', { hour12: false })
}
</script>

<style scoped>
.matrix-view {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(215, 111, 59, 0.1), transparent 28%),
    linear-gradient(180deg, #fffaf4 0%, #f5efe6 52%, #efe6da 100%);
  padding: 28px 0 72px;
  color: #1f1a17;
}

.matrix-shell {
  max-width: 1320px;
  margin: 0 auto;
  padding: 0 20px;
}

.panel {
  position: relative;
  overflow: hidden;
}

.paper-panel {
  background: rgba(255, 252, 246, 0.92);
  border: 1px solid rgba(96, 64, 45, 0.12);
  border-radius: 28px;
  box-shadow: 0 24px 60px rgba(69, 44, 29, 0.08);
}

.hero-band {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 24px;
  margin-top: 28px;
}

.hero-copy,
.hero-rules {
  border-radius: 32px;
  padding: 34px;
}

.hero-copy {
  background: linear-gradient(140deg, rgba(255, 249, 239, 0.95), rgba(246, 234, 216, 0.88));
  border: 1px solid rgba(80, 48, 28, 0.12);
}

.hero-kicker,
.section-kicker {
  margin: 0 0 10px;
  font-size: 0.78rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #9b6540;
}

.hero-copy h1,
.section-head h2 {
  margin: 0;
  font-family: 'Iowan Old Style', 'Palatino Linotype', 'Source Han Serif SC', serif;
  font-size: clamp(2.3rem, 4vw, 4rem);
  line-height: 0.96;
  letter-spacing: -0.04em;
  color: #2e231d;
}

.hero-subtitle {
  max-width: 620px;
  margin: 18px 0 0;
  font-size: 1.04rem;
  line-height: 1.8;
  color: #6f5a4d;
}

.hero-actions {
  display: flex;
  gap: 14px;
  margin-top: 28px;
  flex-wrap: wrap;
}

.hero-rules {
  display: grid;
  gap: 14px;
  background: linear-gradient(180deg, #2e211c 0%, #473128 100%);
  color: #f7ecdf;
}

.rule-card {
  padding: 18px 20px;
  border-radius: 22px;
  background: rgba(255, 247, 235, 0.08);
  border: 1px solid rgba(255, 235, 212, 0.1);
}

.rule-card.accent {
  background: linear-gradient(135deg, rgba(233, 138, 82, 0.32), rgba(255, 220, 188, 0.12));
}

.rule-card span {
  display: block;
  font-size: 0.74rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255, 233, 208, 0.78);
}

.rule-card strong {
  display: block;
  margin-top: 8px;
  font-size: 1rem;
}

.rule-card p {
  margin: 8px 0 0;
  font-size: 0.95rem;
  line-height: 1.65;
  color: rgba(255, 239, 222, 0.82);
}

.stats-ribbon {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin: 18px 0 0;
}

.stat-chip {
  padding: 18px 22px;
  border-radius: 20px;
  background: rgba(255, 252, 246, 0.78);
  border: 1px solid rgba(96, 64, 45, 0.12);
}

.stat-chip span {
  display: block;
  font-size: 0.88rem;
  color: #896c59;
}

.stat-chip strong {
  display: block;
  margin-top: 10px;
  font-size: 2rem;
  letter-spacing: -0.05em;
}

.workspace-grid {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 20px;
  margin-top: 20px;
}

.accounts-panel,
.builder-panel,
.variants-panel,
.planner-panel,
.task-panel {
  padding: 28px;
}

.section-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 22px;
}

.section-head h2 {
  font-size: 2rem;
}

.section-note {
  font-size: 0.88rem;
  color: #8b6e5a;
}

.account-board {
  display: grid;
  gap: 14px;
}

.account-strip {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  gap: 14px;
  align-items: center;
  padding: 18px;
  border-radius: 22px;
  background: rgba(255, 247, 236, 0.7);
  border: 1px solid transparent;
}

.account-strip.active {
  border-color: rgba(177, 111, 72, 0.22);
}

.account-strip.editing {
  background: rgba(245, 226, 199, 0.8);
}

.account-topline {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
}

.account-topline strong {
  font-size: 1rem;
}

.account-topline span,
.account-main p,
.account-meta {
  color: #6f5a4d;
}

.account-main p {
  margin: 8px 0 0;
  line-height: 1.6;
}

.account-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 12px;
  font-size: 0.85rem;
}

.account-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: flex-start;
}

.account-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
}

.editor-block,
.campaign-summary {
  margin-top: 22px;
  padding-top: 22px;
  border-top: 1px dashed rgba(104, 73, 52, 0.18);
}

.sub-head strong {
  font-size: 1rem;
}

.sub-head span,
.campaign-summary p {
  display: block;
  margin-top: 6px;
  color: #7a6457;
}

.editor-form,
.builder-form {
  margin-top: 18px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.switch-row {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.switch-row label,
.dispatch-switch {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #5f4b3f;
}

.editor-actions,
.builder-actions,
.planner-actions,
.inline-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.count-row {
  padding: 6px 12px 0 8px;
}

.angle-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.angle-pill {
  text-align: left;
  padding: 14px 16px;
  border-radius: 18px;
  border: 1px solid rgba(111, 83, 62, 0.14);
  background: rgba(255, 249, 239, 0.76);
  color: #2f231e;
  cursor: pointer;
  transition: transform 160ms ease, border-color 160ms ease, background 160ms ease;
}

.angle-pill:hover,
.variant-card:hover,
.plan-row:hover,
.task-card:hover {
  transform: translateY(-2px);
}

.angle-pill.active {
  background: linear-gradient(135deg, rgba(255, 232, 205, 0.96), rgba(248, 220, 183, 0.86));
  border-color: rgba(177, 111, 72, 0.32);
}

.angle-pill strong,
.campaign-summary strong {
  display: block;
  font-size: 0.98rem;
}

.angle-pill span {
  display: block;
  margin-top: 6px;
  font-size: 0.9rem;
  line-height: 1.55;
  color: #6f5a4d;
}

.campaign-summary {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}

.summary-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.empty-sheet {
  padding: 28px;
  border-radius: 24px;
  background: rgba(247, 239, 226, 0.55);
  border: 1px dashed rgba(136, 108, 89, 0.26);
  text-align: center;
}

.empty-sheet.compact {
  margin-top: 16px;
}

.empty-sheet h3 {
  margin: 0;
  font-size: 1.2rem;
}

.empty-sheet p {
  margin: 10px 0 0;
  color: #7b6557;
}

.variant-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.variant-card {
  padding: 20px;
  border-radius: 24px;
  background: rgba(255, 252, 247, 0.98);
  border: 1px solid rgba(92, 62, 43, 0.12);
  transition: transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease;
}

.variant-card.selected {
  border-color: rgba(189, 112, 68, 0.28);
  box-shadow: 0 18px 34px rgba(121, 73, 45, 0.08);
}

.variant-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.variant-check {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 0.92rem;
  color: #785e51;
}

.variant-card h3 {
  margin: 14px 0 0;
  font-size: 1.3rem;
  line-height: 1.35;
}

.variant-hook {
  margin: 12px 0 0;
  color: #6d564a;
  line-height: 1.7;
}

.variant-body {
  margin: 14px 0 0;
  padding-left: 18px;
  display: grid;
  gap: 10px;
  color: #473930;
}

.variant-footnotes {
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px dashed rgba(114, 85, 67, 0.16);
}

.variant-footnotes p,
.asset-box p {
  margin: 8px 0 0;
  line-height: 1.65;
  color: #725b4d;
}

.asset-box {
  margin-top: 16px;
  padding: 14px;
  border-radius: 18px;
  background: rgba(243, 232, 218, 0.55);
}

.asset-box strong {
  display: block;
  font-size: 0.86rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #9a6740;
}

.variant-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 16px;
}

.variant-actions {
  display: flex;
  gap: 10px;
  margin-top: 18px;
}

.validation-stack {
  display: grid;
  gap: 12px;
}

.validation-item {
  border-radius: 18px;
}

.plan-list {
  display: grid;
  gap: 16px;
  margin-top: 18px;
}

.plan-row {
  padding: 18px;
  border-radius: 22px;
  background: rgba(255, 251, 244, 0.96);
  border: 1px solid rgba(92, 62, 43, 0.12);
}

.plan-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
}

.plan-grid label {
  display: grid;
  gap: 8px;
  font-size: 0.88rem;
  color: #7b6457;
}

.native-datetime {
  width: 100%;
  min-height: 40px;
  padding: 0 12px;
  border-radius: 12px;
  border: 1px solid var(--el-border-color);
  background: white;
  color: #2d241f;
  font: inherit;
}

.plan-meta {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px dashed rgba(114, 85, 67, 0.16);
}

.meta-left,
.meta-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.meta-right span {
  color: #776253;
  font-size: 0.9rem;
}

.task-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.task-card {
  padding: 18px;
  border-radius: 22px;
  background: rgba(255, 250, 243, 0.96);
  border: 1px solid rgba(92, 62, 43, 0.12);
}

.task-top {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.task-card p {
  margin: 12px 0 0;
  color: #6d584a;
  line-height: 1.6;
}

.task-meta-line {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 14px;
  font-size: 0.82rem;
  color: #8d715d;
}

@media (max-width: 1180px) {
  .hero-band,
  .workspace-grid,
  .variant-grid,
  .task-grid,
  .stats-ribbon,
  .plan-grid {
    grid-template-columns: 1fr;
  }

  .account-strip {
    grid-template-columns: 1fr;
  }

  .account-actions {
    flex-direction: row;
    justify-content: flex-start;
  }
}

@media (max-width: 768px) {
  .matrix-shell {
    padding: 0 14px;
  }

  .hero-copy,
  .hero-rules,
  .accounts-panel,
  .builder-panel,
  .variants-panel,
  .planner-panel,
  .task-panel {
    padding: 22px;
  }

  .section-head,
  .campaign-summary,
  .plan-meta {
    flex-direction: column;
    align-items: flex-start;
  }

  .form-grid,
  .angle-grid {
    grid-template-columns: 1fr;
  }
}
</style>
