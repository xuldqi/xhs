<template>
  <div class="topic-analyzer-view">
    <div class="container">
      <Breadcrumb :items="breadcrumbItems" />
      
      <div class="tool-header">
        <h1 class="tool-title">话题分析工具</h1>
        <p class="tool-description">
          分析热门话题趋势，找到最适合你的内容方向
        </p>
      </div>

      <div class="tool-content">
        <div class="content-grid">
          <div class="input-section">
            <el-card>
              <template #header><span>输入内容领域</span></template>
              <el-form :model="form" label-position="top">
                <el-form-item label="内容领域">
                  <el-input
                    v-model="form.domain"
                    placeholder="例如：美妆护肤、穿搭、美食、职场"
                    clearable
                  />
                </el-form-item>
                <el-form-item label="关注时段（可选）">
                  <el-select v-model="form.timeRange" placeholder="选择关注时段">
                    <el-option label="近期热门" value="近期" />
                    <el-option label="本周" value="本周" />
                    <el-option label="本月" value="本月" />
                  </el-select>
                </el-form-item>
                <el-button
                  type="primary"
                  size="large"
                  :loading="generating"
                  :disabled="!form.domain"
                  @click="analyze"
                  class="generate-btn"
                >
                  <el-icon><TrendCharts /></el-icon>
                  AI 分析话题趋势
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
                <el-empty description="输入领域后点击分析" />
              </div>
              <div v-else-if="generating" class="loading-results">
                <el-icon class="is-loading" :size="32"><Loading /></el-icon>
                <p>AI 正在分析热门趋势...</p>
              </div>
              <div v-else-if="result" class="analysis-result">
                <div class="result-group">
                  <h4>热门话题</h4>
                  <div class="topic-list">
                    <div
                      v-for="(t, i) in result.hotTopics"
                      :key="i"
                      class="topic-item"
                      @click="copyText(`${t.topic}（${t.reason}）`)"
                    >
                      <el-tag :type="t.trend === '上升' ? 'danger' : 'info'" size="small">{{ t.trend }}</el-tag>
                      <span class="topic-name">{{ t.topic }}</span>
                      <span class="topic-reason">{{ t.reason }}</span>
                      <el-icon class="copy-icon"><CopyDocument /></el-icon>
                    </div>
                  </div>
                </div>
                <div class="result-group">
                  <h4>内容建议</h4>
                  <ul class="suggestion-list">
                    <li v-for="(s, i) in result.contentSuggestions" :key="i" @click="copyText(s)">{{ s }}</li>
                  </ul>
                </div>
                <div v-if="result.avoidTopics?.length" class="result-group">
                  <h4>建议避免</h4>
                  <el-tag v-for="(a, i) in result.avoidTopics" :key="i" size="small" type="warning" class="avoid-tag">{{ a }}</el-tag>
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
              <li>输入你深耕的内容领域，AI 分析近期热门话题</li>
              <li>「上升」话题适合蹭热度，竞争较大</li>
              <li>「稳定」话题可持续产出，适合长期布局</li>
            </ul>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { TrendCharts, CopyDocument, Loading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { aiService } from '@/services/aiService'
import Breadcrumb from '@/components/Breadcrumb.vue'

interface TopicItem {
  topic: string
  trend: string
  reason: string
}

interface TopicResult {
  hotTopics: TopicItem[]
  contentSuggestions: string[]
  avoidTopics?: string[]
  summary?: string
}

const form = ref({ domain: '', timeRange: '' })
const generating = ref(false)
const result = ref<TopicResult | null>(null)

const breadcrumbItems = computed(() => [
  { label: '首页', path: '/' },
  { label: '工具箱', path: '/tools' },
  { label: '话题分析工具', path: '' }
])

function parseJson(text: string): TopicResult | null {
  try {
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return null
    const parsed = JSON.parse(match[0])
    return {
      hotTopics: Array.isArray(parsed.hotTopics) ? parsed.hotTopics : [],
      contentSuggestions: Array.isArray(parsed.contentSuggestions) ? parsed.contentSuggestions : [],
      avoidTopics: Array.isArray(parsed.avoidTopics) ? parsed.avoidTopics : [],
      summary: typeof parsed.summary === 'string' ? parsed.summary : ''
    }
  } catch {
    return null
  }
}

const analyze = async () => {
  if (!form.value.domain.trim()) return
  generating.value = true
  result.value = null
  try {
    const res: any = await aiService.analyzeTopics(
      form.value.domain.trim(),
      form.value.timeRange || undefined
    )
    const rawText = res?.choices?.[0]?.message?.content || res?.content || ''
    const parsed = parseJson(rawText)
    if (parsed && parsed.hotTopics?.length) {
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

const copyText = (text: string) => {
  navigator.clipboard.writeText(text).then(() => ElMessage.success('已复制')).catch(() => ElMessage.error('复制失败'))
}

const copyAll = () => {
  if (!result.value) return
  const lines: string[] = [
    '【热门话题】',
    ...result.value.hotTopics.map(t => `- ${t.topic}（${t.trend}）${t.reason}`),
    '【内容建议】',
    ...(result.value.contentSuggestions || []),
    result.value.summary ? `【总结】${result.value.summary}` : ''
  ].filter(Boolean)
  navigator.clipboard.writeText(lines.join('\n')).then(() => ElMessage.success('已复制全部')).catch(() => ElMessage.error('复制失败'))
}
</script>

<style scoped>
.topic-analyzer-view {
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

.tool-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary, #303133);
  margin: 0 0 12px 0;
}

.tool-description {
  font-size: 1rem;
  color: var(--text-secondary, #909399);
}

.content-grid {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 24px;
}

@media (max-width: 900px) {
  .content-grid { grid-template-columns: 1fr; }
}

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

.topic-list { display: flex; flex-direction: column; gap: 10px; }

.topic-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
  cursor: pointer;
}

.topic-item:hover { background: #f0f0f0; }

.topic-name { font-weight: 500; flex: 0 0 120px; }
.topic-reason { flex: 1; font-size: 13px; color: var(--text-secondary); }
.copy-icon { opacity: 0.5; }

.suggestion-list {
  margin: 0;
  padding-left: 20px;
  line-height: 2;
  cursor: pointer;
}

.avoid-tag { margin-right: 8px; margin-bottom: 8px; }

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
