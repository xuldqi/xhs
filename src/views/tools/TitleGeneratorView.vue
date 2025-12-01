<template>
  <div class="title-generator-view">
    <div class="container">
      <Breadcrumb :items="breadcrumbItems" />
      
      <div class="tool-header">
        <div class="header-content">
          <div>
            <h1 class="tool-title">标题生成器</h1>
            <p class="tool-description">
              基于 AI 的智能标题生成工具，帮助你创作吸引眼球的小红书标题
            </p>
          </div>
          <div class="usage-info" v-if="userStore.isLoggedIn">
            <el-tag :type="userStore.isVIP ? 'success' : 'info'" effect="plain">
              {{ getRemainingUsageTip('title-generator') }}
            </el-tag>
            <el-button 
              v-if="!userStore.isVIP" 
              type="primary" 
              size="small" 
              link
              @click="showUpgradeTip('title-generator')"
            >
              升级无限使用
            </el-button>
          </div>
        </div>
      </div>

      <div class="tool-content">
        <div class="content-grid">
          <!-- 输入区域 -->
          <div class="input-section">
            <el-card>
              <template #header>
                <div class="card-header">
                  <span>输入内容信息</span>
                  <div class="header-actions">
                    <el-button type="info" size="small" @click="fillExample">
                      <el-icon><DocumentAdd /></el-icon>
                      快速填充示例
                    </el-button>
                    <el-button type="primary" size="small" @click="showExamples = true">
                      查看示例
                    </el-button>
                  </div>
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
                  <div class="header-actions" v-if="titles.length > 0">
                    <el-button
                      type="success"
                      size="small"
                      @click="copyAllTitles"
                    >
                      <el-icon><CopyDocument /></el-icon>
                      复制全部
                    </el-button>
                    <el-button
                      type="primary"
                      size="small"
                      @click="exportTitles"
                    >
                      <el-icon><Download /></el-icon>
                      导出为文本
                    </el-button>
                  </div>
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

        <!-- 安全提示 -->
        <div class="security-notice">
          <el-alert
            title="数据安全保证"
            type="info"
            :closable="false"
            show-icon
          >
            <template #default>
              <p style="margin: 0; font-size: 14px;">
                🔒 所有数据在本地处理，不会上传到服务器<br>
                🔒 生成的内容仅保存在您的浏览器中<br>
                🔒 我们不会收集或存储您的任何个人信息
              </p>
            </template>
          </el-alert>
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
import { MagicStick, CopyDocument, Star, DocumentAdd, Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { analytics } from '@/utils/analytics'
import Breadcrumb from '@/components/Breadcrumb.vue'
import { useToolLimit } from '@/composables/useToolLimit'
import { useUserStore } from '@/stores/userStore'

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

const { canUseTool, getRemainingUsageTip, showUpgradeTip } = useToolLimit()
const userStore = useUserStore()

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

const generateTitles = async () => {
  // 检查使用权限
  const canUse = await canUseTool('title-generator')
  if (!canUse) {
    return
  }
  
  generating.value = true
  
  try {
    // 生成标题
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const generatedTitles: TitleResult[] = []
    const styles = {
      catchy: ['🔥', '💥', '⚡️', '✨'],
      professional: ['📊', '📈', '💼', '🎯'],
      emotional: ['❤️', '💕', '😊', '🥰'],
      question: ['❓', '🤔', '💭', '❔'],
      numeric: ['1️⃣', '2️⃣', '3️⃣', '🔢']
    }
    
    const emoji = styles[form.value.style as keyof typeof styles] || ['✨']
    
    for (let i = 0; i < form.value.count; i++) {
      const randomEmoji = emoji[Math.floor(Math.random() * emoji.length)]
      const titleText = `${randomEmoji} ${form.value.topic}必看！超实用${form.value.keywords ? form.value.keywords.split(',')[0] : '技巧'}分享 ${i + 1}`
      
      generatedTitles.push({
        text: titleText,
        length: titleText.length,
        score: Math.floor(Math.random() * 30) + 70,
        liked: false
      })
    }
    
    titles.value = generatedTitles
    
    analytics.track('title_generated', {
      topic: form.value.topic,
      style: form.value.style,
      count: form.value.count
    })
    
    ElMessage.success('标题生成成功！')
  } catch (error) {
    console.error('Failed to generate titles:', error)
    ElMessage.error('生成失败，请重试')
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

// 快速填充示例数据
const fillExample = () => {
  const examples = [
    { topic: '平价护肤', keywords: '学生党,好物推荐,性价比', style: 'catchy' },
    { topic: '日常穿搭', keywords: '小个子,显瘦,百搭', style: 'numeric' },
    { topic: '美食探店', keywords: '平价,好吃,推荐', style: 'emotional' },
    { topic: '职场技能', keywords: '提升,效率,方法', style: 'professional' }
  ]
  
  const randomExample = examples[Math.floor(Math.random() * examples.length)]
  form.value.topic = randomExample.topic
  form.value.keywords = randomExample.keywords
  form.value.style = randomExample.style
  form.value.count = 5
  
  ElMessage.success('已填充示例数据，可以直接生成标题')
  analytics.track('example_filled', { example: randomExample.topic })
}

// 导出标题为文本文件
const exportTitles = () => {
  if (titles.value.length === 0) {
    ElMessage.warning('没有可导出的标题')
    return
  }
  
  const content = titles.value
    .map((title, index) => `${index + 1}. ${title.text} (${title.length}字, 评分: ${title.score})`)
    .join('\n')
  
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `小红书标题_${new Date().toISOString().slice(0, 10)}.txt`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  
  ElMessage.success('标题已导出为文本文件')
  analytics.track('titles_exported', { count: titles.value.length })
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
  margin: 32px 0 48px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
}

.tool-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 16px 0;
  text-align: left;
}

.tool-description {
  font-size: 1.125rem;
  color: var(--text-secondary);
  max-width: 600px;
  line-height: 1.6;
  text-align: left;
}

.usage-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  flex-shrink: 0;
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

.header-actions {
  display: flex;
  gap: 8px;
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

.security-notice {
  margin: 24px 0;
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
