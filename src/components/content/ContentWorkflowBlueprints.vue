<template>
  <section class="workflow-panel">
    <div class="panel-head">
      <div>
        <p class="panel-kicker">Automation</p>
        <h3>已经能导入和落地的内容工厂流水线</h3>
        <p class="panel-note">工作流 JSON 已搬进当前项目，状态面板会自动检查后端 provider 是否配置到位。</p>
      </div>
      <el-button v-if="!isPremiumUnlocked" type="primary" plain @click="$emit('upgrade')">
        解锁自动化能力
      </el-button>
    </div>

    <div class="helper-links">
      <a href="/workflows/automation-status-callback-sample.json" download class="helper-link">
        下载回调样例 JSON
      </a>
      <a href="/docs/AUTOMATION_CALLBACK.md" target="_blank" rel="noreferrer" class="helper-link muted">
        查看回调对接文档
      </a>
    </div>

    <div class="provider-panel">
      <div class="provider-head">
        <strong>Provider 就绪状态</strong>
        <span>{{ status.note }}</span>
      </div>
      <div class="provider-grid">
        <div v-for="provider in status.providers" :key="provider.key" class="provider-chip" :class="{ active: provider.configured }">
          <div>
            <span class="provider-label">{{ provider.label }}</span>
            <small>{{ provider.recommendedFor }}</small>
          </div>
          <el-tag size="small" :type="provider.configured ? 'success' : 'warning'">
            {{ provider.configured ? '已配置' : '待配置' }}
          </el-tag>
        </div>
      </div>
    </div>

    <div class="workflow-grid">
      <article
        v-for="workflow in workflowBlueprints"
        :key="workflow.id"
        class="workflow-card"
        :class="{ locked: workflow.premiumOnly && !isPremiumUnlocked }"
      >
        <div class="workflow-top">
          <div>
            <p class="workflow-source">{{ workflow.source }}</p>
            <h4>{{ workflow.title }}</h4>
          </div>
          <el-tag size="small" :type="workflow.premiumOnly ? 'warning' : 'success'">
            {{ workflow.premiumOnly ? 'PRO' : 'READY' }}
          </el-tag>
        </div>

        <p class="workflow-description">{{ workflow.description }}</p>
        <p class="workflow-cadence">运行节奏：{{ workflow.cadence }}</p>

        <div class="workflow-section">
          <span class="section-label">依赖 Provider</span>
          <div class="chip-list">
            <span
              v-for="providerKey in workflow.coreProviders"
              :key="providerKey"
              class="chip"
              :class="{ dim: !providerMap[providerKey]?.configured }"
            >
              {{ providerMap[providerKey]?.label || providerKey }}
            </span>
          </div>
        </div>

        <div class="workflow-section">
          <span class="section-label">关键步骤</span>
          <ul>
            <li v-for="step in workflow.steps" :key="step">{{ step }}</li>
          </ul>
        </div>

        <div class="workflow-section">
          <span class="section-label">产出结果</span>
          <div class="chip-list">
            <span v-for="output in workflow.outputs" :key="output" class="chip">{{ output }}</span>
          </div>
        </div>

        <div class="workflow-actions">
          <a :href="workflow.downloadPath" class="download-link" download>
            下载 n8n 工作流
          </a>
          <el-button text @click="copyImportCommand(workflow.downloadPath)">
            复制路径
          </el-button>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { workflowBlueprints } from '@/data/contentAutomationBlueprints'
import { getAutomationStatus, type AutomationStatusResponse, type ProviderStatus } from '@/services/automationService'

interface Props {
  isPremiumUnlocked: boolean
}

defineProps<Props>()
defineEmits<{
  upgrade: []
}>()

const status = ref<AutomationStatusResponse>({
  providers: [],
  workflows: [],
  note: ''
})

const providerMap = computed<Record<string, ProviderStatus>>(() => {
  return status.value.providers.reduce((acc, item) => {
    acc[item.key] = item
    return acc
  }, {} as Record<string, ProviderStatus>)
})

async function copyImportCommand(downloadPath: string) {
  try {
    await navigator.clipboard.writeText(downloadPath)
    ElMessage.success('工作流路径已复制')
  } catch {
    ElMessage.error('复制失败，请稍后再试')
  }
}

onMounted(async () => {
  status.value = await getAutomationStatus()
})
</script>

<style scoped>
.workflow-panel {
  margin-top: 24px;
  padding: 24px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(17, 24, 39, 0.08);
  box-shadow: 0 18px 48px rgba(17, 24, 39, 0.06);
}

.panel-head,
.workflow-top,
.provider-head,
.workflow-actions,
.helper-links {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.panel-kicker {
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

.panel-head h3 {
  margin: 0;
  color: #111827;
  font-size: 1.5rem;
}

.panel-note,
.provider-head span,
.workflow-description,
.workflow-cadence,
.workflow-section li {
  color: #4b5563;
  line-height: 1.7;
}

.helper-links {
  margin-top: 16px;
  flex-wrap: wrap;
}

.helper-link,
.download-link {
  display: inline-flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  text-decoration: none;
  font-size: 0.88rem;
}

.helper-link {
  background: #fff0f3;
  color: #be123c;
}

.helper-link.muted {
  background: #f3f4f6;
  color: #374151;
}

.provider-panel {
  margin-top: 18px;
  padding: 18px;
  border-radius: 22px;
  background: #fcfaf8;
  border: 1px solid rgba(17, 24, 39, 0.08);
}

.provider-head strong {
  color: #111827;
}

.provider-grid,
.workflow-grid {
  display: grid;
  gap: 16px;
  margin-top: 16px;
}

.provider-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.provider-chip {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 18px;
  background: #ffffff;
  border: 1px solid rgba(17, 24, 39, 0.08);
}

.provider-chip.active {
  border-color: rgba(16, 185, 129, 0.25);
  background: #effcf6;
}

.provider-label {
  display: block;
  color: #111827;
  font-weight: 700;
}

.provider-chip small,
.workflow-source {
  color: #9ca3af;
}

.workflow-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.workflow-card {
  padding: 20px;
  border-radius: 22px;
  background: #fffaf8;
  border: 1px solid rgba(17, 24, 39, 0.08);
}

.workflow-card.locked {
  background: linear-gradient(180deg, #fffaf8 0%, #f3f4f6 100%);
}

.workflow-card h4,
.section-label {
  color: #111827;
}

.workflow-source {
  margin: 0 0 8px;
  font-size: 0.8rem;
}

.workflow-card h4 {
  margin: 0;
  font-size: 1.15rem;
}

.workflow-description {
  margin: 14px 0 8px;
}

.workflow-cadence {
  margin: 0;
  font-size: 0.92rem;
}

.workflow-section {
  margin-top: 16px;
}

.section-label {
  display: inline-block;
  margin-bottom: 8px;
  font-weight: 700;
}

.workflow-section ul {
  margin: 0;
  padding-left: 18px;
}

.chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.chip {
  display: inline-flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 999px;
  background: #ffffff;
  color: #374151;
  border: 1px solid rgba(17, 24, 39, 0.08);
  font-size: 0.88rem;
}

.chip.dim {
  opacity: 0.5;
}

.workflow-actions {
  margin-top: 18px;
  align-items: center;
}

.download-link {
  background: #111827;
  color: #ffffff;
}

@media (max-width: 980px) {
  .provider-grid,
  .workflow-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .panel-head,
  .provider-head,
  .workflow-actions,
  .helper-links {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
