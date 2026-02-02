<template>
  <div class="title-generator-view">
    <div class="container">
      <Breadcrumb :items="breadcrumbItems" />
      
      <div class="tool-header">
        <h1 class="tool-title">标题生成器</h1>
        <p class="tool-description">
          基于 AI 的智能标题生成工具，帮助你创作吸引眼球的小红书标题
        </p>
      </div>

      <div class="tool-content">
        <div class="content-grid">
          <!-- 输入区域 -->
          <div class="input-section">
            <el-card>
              <template #header>
                <div class="card-header">
                  <span>输入内容信息</span>
                  <el-button type="primary" size="small" @click="showExamples = true">
                    查看示例
                  </el-button>
                </div>
              </template>
              
              <el-form :model="form" label-position="top">
                <el-form-item label="内容主题">
                  <el-input
                    v-model="form.topic"
                    placeholder="例如：护肤、美妆、穿搭、美食等"
                    clearable
                  />
                </el-form-item>
                
                <el-form-item label="关键词（可选）">
                  <el-input
                    v-model="form.keywords"
                    placeholder="用逗号分隔多个关键词"
                    clearable
                  />
                </el-form-item>
                
                <el-form-item label="标题风格">
                  <el-select v-model="form.style" placeholder="选择标题风格">
                    <el-option label="吸睛型" value="catchy" />
                    <el-option label="专业型" value="professional" />
                    <el-option label="情感型" value="emotional" />
                    <el-option label="疑问型" value="question" />
                    <el-option label="数字型" value="numeric" />
                  </el-select>
                </el-form-item>
                
                <el-form-item label="生成数量">
                  <el-slider v-model="form.count" :min="3" :max="10" show-stops />
                </el-form-item>
                
                <el-button
                  type="primary"
                  size="large"
                  :loading="generating"
                  :disabled="!form.topic"
                  @click="generateTitles"
                  class="generate-btn"
                >
                  <el-icon><MagicStick /></el-icon>
                  生成标题
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
                    v-if="titles.length > 0"
                    type="success"
                    size="small"
                    @click="copyAllTitles"
                  >
                    <el-icon><CopyDocument /></el-icon>
                    复制全部
                  </el-button>
                </div>
              </template>
              
              <div v-if="titles.length === 0" class="empty-results">
                <el-empty description="还没有生成标题，请填写信息后点击生成" />
              </div>
              
              <div v-else class="titles-list">
                <div
                  v-for="(title, index) in titles"
                  :key="index"
                  class="title-item"
                >
                  <div class="title-number">{{ index + 1 }}</div>
                  <div class="title-content">
                    <p class="title-text">{{ title.text }}</p>
                    <div class="title-meta">
                      <el-tag size="small" type="info">{{ title.length }}字</el-tag>
                      <el-tag size="small" :type="getScoreType(title.score)">
                        评分: {{ title.score }}
                      </el-tag>
                    </div>
                  </div>
                  <div class="title-actions">
                    <el-button
                      size="small"
                      :icon="Star"
                      :type="title.liked ? 'warning' : 'default'"
                      @click="toggleLike(index)"
                    />
                    <el-button
                      size="small"
                      :icon="CopyDocument"
                      @click="copyTitle(title.text)"
                    />
                  </div>
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
              <h3>如何使用标题生成器？</h3>
              <ol>
                <li>输入你的内容主题，例如"护肤"、"美妆教程"等</li>
                <li>（可选）添加关键词，用逗号分隔，例如"平价,学生党,推荐"</li>
                <li>选择标题风格，不同风格适合不同类型的内容</li>
                <li>选择生成数量，建议生成 5-10 个标题供选择</li>
                <li>点击"生成标题"按钮，等待 AI 生成结果</li>
                <li>查看生成的标题，可以点赞收藏喜欢的标题</li>
                <li>点击复制按钮，将标题复制到剪贴板</li>
              </ol>
              
              <h3>标题风格说明</h3>
              <ul>
                <li><strong>吸睛型：</strong>使用夸张、惊叹的表达，吸引用户点击</li>
                <li><strong>专业型：</strong>使用专业术语，展现权威性</li>
                <li><strong>情感型：</strong>触动用户情感，引发共鸣</li>
                <li><strong>疑问型：</strong>以问题形式，激发用户好奇心</li>
                <li><strong>数字型：</strong>使用具体数字，增加可信度</li>
              </ul>
              
              <h3>标题优化建议</h3>
              <ul>
                <li>标题长度建议控制在 15-25 字之间</li>
                <li>包含 1-2 个核心关键词</li>
                <li>使用表情符号增加视觉吸引力（适度使用）</li>
                <li>避免过度夸张和标题党</li>
                <li>测试多个标题，选择效果最好的</li>
              </ul>
            </div>
          </el-card>
        </div>
      </div>
    </div>

    <!-- 示例对话框 -->
    <el-dialog v-model="showExamples" title="标题示例" width="600px">
      <div class="examples-content">
        <h4>护肤类标题示例：</h4>
        <ul>
          <li>🔥 学生党必看！10款平价精华液测评</li>
          <li>💰 100元搞定全套护肤！超详细攻略</li>
          <li>❓ 为什么你的皮肤越来越差？这3个错误别再犯</li>
        </ul>
        
        <h4>美妆类标题示例：</h4>
        <ul>
          <li>✨ 手残党福音！5分钟搞定日常妆容</li>
          <li>💄 这些平价口红居然比大牌还好用？</li>
          <li>🎨 新手必学！底妆不卡粉的秘诀</li>
        </ul>
        
        <h4>穿搭类标题示例：</h4>
        <ul>
          <li>👗 小个子显高穿搭！155也能穿出170既视感</li>
          <li>🛍️ 双11必买清单！这些单品闭眼入</li>
          <li>💡 梨形身材救星！这样穿显瘦10斤</li>
        </ul>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { MagicStick, CopyDocument, Star } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { analytics } from '@/utils/analytics'
import { aiService } from '@/services/aiService'
import Breadcrumb from '@/components/Breadcrumb.vue'

interface TitleResult {
  text: string
  length: number
  score: number
  liked: boolean
}

const form = ref({
  topic: '',
  keywords: '',
  style: 'catchy',
  count: 5
})

const generating = ref(false)
const titles = ref<TitleResult[]>([])
const showExamples = ref(false)

const breadcrumbItems = computed(() => [
  { label: '首页', path: '/' },
  { label: '工具矩阵', path: '/tools' },
  { label: '标题生成器', path: '' }
])

const getScoreType = (score: number) => {
  if (score >= 90) return 'success'
  if (score >= 70) return 'warning'
  return 'info'
}

function parseTitleJson(text: string): TitleResult[] {
  try {
    const match = text.match(/\[[\s\S]*\]/)
    if (!match) return []
    const arr = JSON.parse(match[0])
    if (!Array.isArray(arr)) return []
    return arr.map((item: any) => {
      const text = typeof item.text === 'string' ? item.text.trim() : String(item.text || '').trim()
      return {
        text,
        length: text.length,
        score: typeof item.score === 'number' ? Math.min(99, Math.max(0, item.score)) : 80,
        liked: false
      }
    }).filter((t: TitleResult) => t.text.length > 0)
  } catch {
    return []
  }
}

const generateTitles = async () => {
  if (!form.value.topic?.trim()) return
  generating.value = true
  titles.value = []
  try {
    const res: any = await aiService.generateTitles({
      topic: form.value.topic.trim(),
      keywords: form.value.keywords?.trim() || undefined,
      style: form.value.style,
      count: form.value.count
    })
    const rawText = res?.choices?.[0]?.message?.content || res?.content || ''
    const parsed = parseTitleJson(rawText)
    if (parsed.length > 0) {
      titles.value = parsed
      analytics.track('title_generated', {
        topic: form.value.topic,
        style: form.value.style,
        count: parsed.length
      })
      ElMessage.success('标题生成成功！')
    } else {
      ElMessage.error('AI 返回格式异常，请重试')
    }
  } catch (e: any) {
    console.error('Failed to generate titles:', e)
    ElMessage.error(e?.message || '生成失败，请检查网络或后端 AI 配置（DeepSeek）')
  } finally {
    generating.value = false
  }
}

const copyTitle = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success('标题已复制到剪贴板')
    analytics.track('title_copied', { text })
  }).catch(() => {
    ElMessage.error('复制失败')
  })
}

const copyAllTitles = () => {
  const allTitles = titles.value.map(t => t.text).join('\n')
  navigator.clipboard.writeText(allTitles).then(() => {
    ElMessage.success('所有标题已复制到剪贴板')
    analytics.track('all_titles_copied', { count: titles.value.length })
  }).catch(() => {
    ElMessage.error('复制失败')
  })
}

const toggleLike = (index: number) => {
  titles.value[index].liked = !titles.value[index].liked
  
  if (titles.value[index].liked) {
    analytics.track('title_liked', { text: titles.value[index].text })
  }
}
</script>

<style scoped>
.title-generator-view {
  min-height: 100vh;
  background: var(--bg-primary);
  padding: 32px 0;
}

.container {
  max-width: var(--container-xl);
  margin: 0 auto;
  padding: 0 20px;
}

.tool-header {
  text-align: center;
  margin: 32px 0 48px;
}

.tool-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 16px 0;
}

.tool-description {
  font-size: 1.125rem;
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.content-grid {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 24px;
  margin-bottom: 48px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.generate-btn {
  width: 100%;
  margin-top: 16px;
}

.empty-results {
  padding: 48px 0;
}

.titles-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.title-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.title-item:hover {
  background: var(--bg-tertiary);
  transform: translateX(4px);
}

.title-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.title-content {
  flex: 1;
  min-width: 0;
}

.title-text {
  font-size: 1rem;
  color: var(--text-primary);
  margin: 0 0 8px 0;
  line-height: 1.6;
}

.title-meta {
  display: flex;
  gap: 8px;
}

.title-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.usage-guide {
  margin-top: 48px;
}

.guide-content h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 24px 0 12px 0;
}

.guide-content h3:first-child {
  margin-top: 0;
}

.guide-content ol,
.guide-content ul {
  padding-left: 24px;
  line-height: 1.8;
  color: var(--text-secondary);
}

.guide-content li {
  margin-bottom: 8px;
}

.examples-content h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 16px 0 8px 0;
}

.examples-content h4:first-child {
  margin-top: 0;
}

.examples-content ul {
  padding-left: 24px;
  line-height: 1.8;
  color: var(--text-secondary);
}

.examples-content li {
  margin-bottom: 8px;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .tool-title {
    font-size: 1.75rem;
  }
  
  .title-item {
    flex-direction: column;
    gap: 12px;
  }
  
  .title-actions {
    justify-content: flex-end;
  }
}
</style>
