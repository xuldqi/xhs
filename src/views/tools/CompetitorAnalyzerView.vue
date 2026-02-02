<template>
  <div class="competitor-analyzer-view">
    <div class="container">
      <Breadcrumb :items="breadcrumbItems" />
      
      <div class="tool-header">
        <h1 class="tool-title">竞品分析工具</h1>
        <p class="tool-description">
          深度分析竞品账号，发现优势与差异化机会
        </p>
      </div>

      <div class="tool-content">
        <div class="content-grid">
          <div class="input-section">
            <el-card>
              <template #header><span>输入竞品信息</span></template>
              <el-form :model="form" label-position="top">
                <el-form-item label="竞品描述">
                  <el-input
                    v-model="form.competitorDesc"
                    type="textarea"
                    :rows="4"
                    placeholder="描述竞品账号：领域、粉丝量、内容风格、代表作、你观察到的特点等"
                    clearable
                  />
                </el-form-item>
                <el-form-item label="我的账号定位（可选）">
                  <el-input
                    v-model="form.yourPositioning"
                    placeholder="例如：美妆新手、平价护肤"
                    clearable
                  />
                </el-form-item>
                <el-button
                  type="primary"
                  size="large"
                  :loading="generating"
                  :disabled="!form.competitorDesc?.trim()"
                  @click="analyze"
                  class="generate-btn"
                >
                  <el-icon><DataAnalysis /></el-icon>
                  AI 竞品分析
                </el-button>
              </el-form>
            </el-card>
          </div>

          <div class="results-section">
            <el-card>
              <template #header>
                <div class="card-header">
                  <span>分析结果</span>
                  <el-button v-if="result" type="success" size="small" @click="copyAll">
                    <el-icon><CopyDocument /></el-icon> 复制全部
                  </el-button>
                </div>
              </template>
              
              <div v-if="!result && !generating" class="empty-results">
                <el-empty description="输入竞品描述后点击分析" />
              </div>
              <div v-else-if="generating" class="loading-results">
                <el-icon class="is-loading" :size="32"><Loading /></el-icon>
                <p>AI 正在分析竞品...</p>
              </div>
              <div v-else-if="result" class="analysis-result">
                <div class="result-group">
                  <h4>竞品优势</h4>
                  <ul><li v-for="(s, i) in result.strengths" :key="i">{{ s }}</li></ul>
                </div>
                <div class="result-group">
                  <h4>可借鉴短板</h4>
                  <ul><li v-for="(w, i) in result.weaknesses" :key="i">{{ w }}</li></ul>
                </div>
                <div v-if="result.contentStrategy" class="result-group">
                  <h4>内容策略</h4>
                  <p class="strategy-text">{{ result.contentStrategy }}</p>
                </div>
                <div class="result-group">
                  <h4>差异化机会</h4>
                  <ul><li v-for="(d, i) in result.differentiation" :key="i">{{ d }}</li></ul>
                </div>
                <div class="result-group">
                  <h4>行动建议</h4>
                  <ul><li v-for="(a, i) in result.actionItems" :key="i">{{ a }}</li></ul>
                </div>
                <div v-if="result.summary" class="summary-box">
                  <h4>总结</h4>
                  <p>{{ result.summary }}</p>
                </div>
              </div>
            </el-card>
          </div>
        </div>

        <div class="usage-guide">
          <el-card>
            <template #header><span>使用说明</span></template>
            <ul>
              <li>尽可能详细描述竞品：领域、粉丝、内容风格、代表作</li>
              <li>填写「我的账号定位」可获得更针对性的差异化建议</li>
            </ul>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { DataAnalysis, CopyDocument, Loading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { aiService } from '@/services/aiService'
import Breadcrumb from '@/components/Breadcrumb.vue'

interface CompetitorResult {
  strengths: string[]
  weaknesses: string[]
  contentStrategy?: string
  differentiation: string[]
  actionItems: string[]
  summary?: string
}

const form = ref({ competitorDesc: '', yourPositioning: '' })
const generating = ref(false)
const result = ref<CompetitorResult | null>(null)

const breadcrumbItems = computed(() => [
  { label: '首页', path: '/' },
  { label: '工具箱', path: '/tools' },
  { label: '竞品分析工具', path: '' }
])

function parseJson(text: string): CompetitorResult | null {
  try {
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return null
    const parsed = JSON.parse(match[0])
    return {
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
      contentStrategy: typeof parsed.contentStrategy === 'string' ? parsed.contentStrategy : '',
      differentiation: Array.isArray(parsed.differentiation) ? parsed.differentiation : [],
      actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems : [],
      summary: typeof parsed.summary === 'string' ? parsed.summary : ''
    }
  } catch {
    return null
  }
}

const analyze = async () => {
  if (!form.value.competitorDesc?.trim()) return
  generating.value = true
  result.value = null
  try {
    const res: any = await aiService.analyzeCompetitor(
      form.value.competitorDesc.trim(),
      form.value.yourPositioning?.trim() || undefined
    )
    const rawText = res?.choices?.[0]?.message?.content || res?.content || ''
    const parsed = parseJson(rawText)
    if (parsed && (parsed.strengths?.length || parsed.differentiation?.length)) {
      result.value = parsed
      ElMessage.success('分析完成！')
    } else {
      ElMessage.error('AI 返回格式异常，请重试')
    }
  } catch (e: any) {
    console.error(e)
    ElMessage.error(e?.message || '分析失败，请检查网络后重试')
  } finally {
    generating.value = false
  }
}

const copyAll = () => {
  if (!result.value) return
  const lines: string[] = [
    '【竞品优势】',
    ...(result.value.strengths || []),
    '【可借鉴短板】',
    ...(result.value.weaknesses || []),
    result.value.contentStrategy ? `【内容策略】${result.value.contentStrategy}` : '',
    '【差异化机会】',
    ...(result.value.differentiation || []),
    '【行动建议】',
    ...(result.value.actionItems || []),
    result.value.summary ? `【总结】${result.value.summary}` : ''
  ].filter(Boolean)
  navigator.clipboard.writeText(lines.join('\n')).then(() => ElMessage.success('已复制全部')).catch(() => ElMessage.error('复制失败'))
}
</script>

<style scoped>
.competitor-analyzer-view {
  min-height: 100vh;
  background: var(--bg-primary, #f5f7fa);
  padding: 32px 0;
}

.container {
  max-width: var(--container-xl, 1200px);
  margin: 0 auto;
  padding: 0 20px;
}

.tool-header {
  text-align: center;
  margin: 32px 0 48px;
}

.tool-title { font-size: 2rem; font-weight: 700; margin: 0 0 12px 0; }
.tool-description { font-size: 1rem; color: var(--text-secondary); }

.content-grid { display: grid; grid-template-columns: 360px 1fr; gap: 24px; }
@media (max-width: 900px) { .content-grid { grid-template-columns: 1fr; } }

.input-section .generate-btn { width: 100%; }

.empty-results, .loading-results {
  min-height: 240px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}

.loading-results p { margin-top: 12px; font-size: 14px; }

.analysis-result { display: flex; flex-direction: column; gap: 24px; }

.result-group h4 { font-size: 15px; margin: 0 0 12px 0; }
.result-group ul { margin: 0; padding-left: 20px; line-height: 2; }
.strategy-text { margin: 0; font-size: 14px; line-height: 1.6; }

.summary-box {
  padding: 16px;
  background: #fef9e7;
  border-radius: 8px;
  border-left: 4px solid var(--brand-primary, #ff2442);
}

.summary-box p { margin: 0; font-size: 14px; line-height: 1.6; }

.usage-guide { margin-top: 32px; }
.usage-guide ul { margin: 0; padding-left: 20px; line-height: 2; font-size: 14px; color: var(--text-secondary); }
</style>
