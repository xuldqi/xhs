<template>
  <div class="keyword-tool-view">
    <div class="container">
      <Breadcrumb :items="breadcrumbItems" />
      
      <div class="tool-header">
        <h1 class="tool-title">SEO 关键词工具</h1>
        <p class="tool-description">
          挖掘热门关键词，优化笔记标题和内容，提升小红书搜索排名
        </p>
      </div>

      <div class="tool-content">
        <div class="content-grid">
          <!-- 输入区域 -->
          <div class="input-section">
            <el-card>
              <template #header>
                <span>输入内容领域</span>
              </template>
              
              <el-form :model="form" label-position="top">
                <el-form-item label="内容领域">
                  <el-input
                    v-model="form.topic"
                    placeholder="例如：护肤、美妆、穿搭、美食探店、职场干货"
                    clearable
                  />
                </el-form-item>
                
                <el-form-item label="细分方向（可选）">
                  <el-input
                    v-model="form.subNiche"
                    placeholder="例如：平价学生党、新手入门、通勤穿搭"
                    clearable
                  />
                </el-form-item>
                
                <el-button
                  type="primary"
                  size="large"
                  :loading="generating"
                  :disabled="!form.topic"
                  @click="generateKeywords"
                  class="generate-btn"
                >
                  <el-icon><Search /></el-icon>
                  AI 生成关键词
                </el-button>
              </el-form>
            </el-card>
          </div>

          <!-- 结果区域 -->
          <div class="results-section">
            <el-card>
              <template #header>
                <div class="card-header">
                  <span>生成结果</span>
                  <el-button
                    v-if="result"
                    type="success"
                    size="small"
                    @click="copyAll"
                  >
                    <el-icon><CopyDocument /></el-icon>
                    复制全部
                  </el-button>
                </div>
              </template>
              
              <div v-if="!result && !generating" class="empty-results">
                <el-empty description="输入领域后点击生成，AI 将为你挖掘优质关键词" />
              </div>
              
              <div v-else-if="generating" class="loading-results">
                <el-icon class="is-loading" :size="32"><Loading /></el-icon>
                <p>AI 正在分析热门趋势...</p>
              </div>
              
              <div v-else-if="result" class="keywords-result">
                <div class="keyword-group">
                  <h4>核心关键词</h4>
                  <p class="group-desc">用户最常搜索的主关键词</p>
                  <div class="tags-wrap">
                    <el-tag
                      v-for="(kw, i) in result.coreKeywords"
                      :key="i"
                      size="large"
                      type="danger"
                      effect="plain"
                      class="keyword-tag"
                      @click="copyText(kw)"
                    >
                      {{ kw }}
                      <el-icon class="copy-icon"><CopyDocument /></el-icon>
                    </el-tag>
                  </div>
                </div>
                
                <div class="keyword-group">
                  <h4>长尾关键词</h4>
                  <p class="group-desc">竞争小、转化高的具体词</p>
                  <div class="tags-wrap">
                    <el-tag
                      v-for="(kw, i) in result.longTailKeywords"
                      :key="i"
                      size="large"
                      type="warning"
                      effect="plain"
                      class="keyword-tag"
                      @click="copyText(kw)"
                    >
                      {{ kw }}
                      <el-icon class="copy-icon"><CopyDocument /></el-icon>
                    </el-tag>
                  </div>
                </div>
                
                <div class="keyword-group">
                  <h4>相关拓展词</h4>
                  <p class="group-desc">可用于话题标签</p>
                  <div class="tags-wrap">
                    <el-tag
                      v-for="(kw, i) in result.relatedKeywords"
                      :key="i"
                      size="large"
                      type="info"
                      effect="plain"
                      class="keyword-tag"
                      @click="copyText(kw)"
                    >
                      {{ kw }}
                      <el-icon class="copy-icon"><CopyDocument /></el-icon>
                    </el-tag>
                  </div>
                </div>
                
                <div v-if="result.usageTips" class="usage-tips">
                  <h4>使用建议</h4>
                  <p>{{ result.usageTips }}</p>
                </div>
              </div>
            </el-card>
          </div>
        </div>

        <!-- 使用说明 -->
        <div class="usage-guide">
          <el-card>
            <template #header>
              <span>使用说明</span>
            </template>
            <div class="guide-content">
              <h3>如何用好关键词？</h3>
              <ul>
                <li><strong>标题：</strong>至少包含 1 个核心关键词，放在前半部分</li>
                <li><strong>正文：</strong>前 50 字出现核心词，自然穿插长尾词</li>
                <li><strong>话题：</strong>选择 2–3 个相关拓展词作为话题标签</li>
                <li><strong>长尾词：</strong>竞争小、容易出爆款，适合新手起步</li>
              </ul>
            </div>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search, CopyDocument, Loading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { aiService } from '@/services/aiService'
import Breadcrumb from '@/components/Breadcrumb.vue'

interface KeywordResult {
  coreKeywords: string[]
  longTailKeywords: string[]
  relatedKeywords: string[]
  usageTips?: string
}

const form = ref({ topic: '', subNiche: '' })
const generating = ref(false)
const result = ref<KeywordResult | null>(null)

const breadcrumbItems = computed(() => [
  { label: '首页', path: '/' },
  { label: '工具箱', path: '/tools' },
  { label: 'SEO 关键词工具', path: '' }
])

function parseKeywordJson(text: string): KeywordResult | null {
  try {
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return null
    const parsed = JSON.parse(match[0])
    return {
      coreKeywords: Array.isArray(parsed.coreKeywords) ? parsed.coreKeywords : [],
      longTailKeywords: Array.isArray(parsed.longTailKeywords) ? parsed.longTailKeywords : [],
      relatedKeywords: Array.isArray(parsed.relatedKeywords) ? parsed.relatedKeywords : [],
      usageTips: typeof parsed.usageTips === 'string' ? parsed.usageTips : ''
    }
  } catch {
    return null
  }
}

const generateKeywords = async () => {
  if (!form.value.topic.trim()) return
  generating.value = true
  result.value = null
  try {
    const res: any = await aiService.generateKeywords(
      form.value.topic.trim(),
      form.value.subNiche.trim() || undefined
    )
    const rawText = res?.choices?.[0]?.message?.content || res?.content || ''
    const parsed = parseKeywordJson(rawText)
    if (parsed && (parsed.coreKeywords.length || parsed.longTailKeywords.length)) {
      result.value = parsed
      ElMessage.success('关键词生成成功！')
    } else {
      ElMessage.error('AI 返回格式异常，请重试')
    }
  } catch (e: any) {
    console.error(e)
    ElMessage.error(e?.message || '生成失败，请检查网络后重试')
  } finally {
    generating.value = false
  }
}

const copyText = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success('已复制到剪贴板')
  }).catch(() => ElMessage.error('复制失败'))
}

const copyAll = () => {
  if (!result.value) return
  const lines: string[] = [
    '【核心关键词】' + result.value.coreKeywords.join('、'),
    '【长尾关键词】' + result.value.longTailKeywords.join('、'),
    '【相关拓展词】' + result.value.relatedKeywords.join('、'),
    result.value.usageTips ? '【使用建议】' + result.value.usageTips : ''
  ].filter(Boolean)
  navigator.clipboard.writeText(lines.join('\n')).then(() => {
    ElMessage.success('已复制全部到剪贴板')
  }).catch(() => ElMessage.error('复制失败'))
}
</script>

<style scoped>
.keyword-tool-view {
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
  max-width: 560px;
  margin: 0 auto;
}

.content-grid {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 24px;
}

@media (max-width: 900px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

.input-section .generate-btn {
  width: 100%;
}

.results-section .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.empty-results,
.loading-results {
  min-height: 240px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}

.loading-results p {
  margin-top: 12px;
  font-size: 14px;
}

.keywords-result {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.keyword-group h4 {
  font-size: 15px;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.group-desc {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0 0 12px 0;
}

.tags-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.keyword-tag {
  cursor: pointer;
  padding: 6px 12px;
}

.keyword-tag .copy-icon {
  margin-left: 4px;
  opacity: 0.6;
}

.keyword-tag:hover .copy-icon {
  opacity: 1;
}

.usage-tips {
  padding: 16px;
  background: #fef9e7;
  border-radius: 8px;
  border-left: 4px solid var(--brand-primary, #ff2442);
}

.usage-tips h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
}

.usage-tips p {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-primary);
}

.usage-guide {
  margin-top: 32px;
}

.guide-content h3 {
  font-size: 15px;
  margin: 0 0 12px 0;
}

.guide-content ul {
  margin: 0;
  padding-left: 20px;
  font-size: 14px;
  line-height: 1.8;
  color: var(--text-secondary);
}
</style>
