<template>
  <div class="viral-generator-view">
    <div class="container">
      <Breadcrumb :items="breadcrumbItems" />
      
      <div class="tool-header">
        <h1 class="tool-title">🔥 爆款生成器</h1>
        <p class="tool-description">
          一站式生成爆款内容：标题 + 封面文字 + 完整文案，让你的笔记轻松上热门
        </p>
      </div>

      <!-- 安全提示 -->
      <el-alert
        v-if="currentStep === 0"
        title="数据安全保证"
        type="info"
        :closable="false"
        show-icon
        style="margin-bottom: 24px;"
      >
        <template #default>
          <p style="margin: 0; font-size: 14px;">
            🔒 所有数据在本地处理，不会上传到服务器<br>
            🔒 生成的内容仅保存在您的浏览器中<br>
            🔒 我们不会收集或存储您的任何个人信息
          </p>
        </template>
      </el-alert>

      <!-- 使用说明 -->
      <el-card class="usage-guide" shadow="never" v-if="currentStep === 0">
        <template #header>
          <div class="card-header">
            <el-icon><InfoFilled /></el-icon>
            <span>使用说明</span>
          </div>
        </template>
        <div class="guide-content">
          <p>这个工具帮你一站式生成完整的小红书内容，包含三个步骤：</p>
          <ol>
            <li><strong>生成标题</strong>：输入主题和关键词，AI 会生成多个吸引眼球的标题供你选择</li>
            <li><strong>生成封面文字</strong>：基于选中的标题，生成适合放在封面上的文字建议</li>
            <li><strong>生成完整文案</strong>：输入内容大纲，AI 会生成完整的文案内容</li>
          </ol>
          <p><strong>💡 提示：</strong>你可以从"热词洞察工具"或"灵感话题库"中选择话题，然后直接跳转到这里生成内容！</p>
        </div>
      </el-card>

      <div class="tool-content">
        <!-- 步骤指示器 -->
        <div class="steps-indicator">
          <div 
            v-for="(step, index) in steps" 
            :key="index"
            class="step-item"
            :class="{ 
              'active': currentStep === index,
              'completed': currentStep > index
            }"
          >
            <div class="step-number">{{ index + 1 }}</div>
            <div class="step-label">{{ step.label }}</div>
          </div>
        </div>

        <!-- 步骤1：输入主题，生成标题 -->
        <div v-if="currentStep === 0" class="step-content">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>📝 第一步：输入主题，生成爆款标题</span>
              </div>
            </template>
            
            <el-form :model="form" label-position="top">
              <el-form-item label="内容主题">
                <el-input
                  v-model="form.topic"
                  placeholder="例如：30天瘦20斤的减肥方法、平价好物推荐、职场穿搭技巧等"
                  clearable
                  size="large"
                />
              </el-form-item>
              
              <el-form-item label="关键词（可选）">
                <el-input
                  v-model="form.keywords"
                  placeholder="用逗号分隔多个关键词，例如：学生党,平价,好物"
                  clearable
                />
              </el-form-item>
              
              <el-button
                type="primary"
                size="large"
                :loading="generatingTitles"
                :disabled="!form.topic"
                @click="generateTitles"
                class="generate-btn"
              >
                <el-icon><MagicStick /></el-icon>
                {{ generatingTitles ? 'AI 正在生成标题...' : '生成爆款标题' }}
              </el-button>
            </el-form>

            <!-- 生成的标题列表 -->
            <div v-if="titles.length > 0" class="titles-section">
              <h3 class="section-title">✨ 为你生成了 {{ titles.length }} 个爆款标题：</h3>
              <div class="titles-grid">
                <div
                  v-for="(title, index) in titles"
                  :key="index"
                  class="title-card"
                  :class="{ 'selected': selectedTitleIndex === index }"
                  @click="selectTitle(index, title)"
                >
                  <div class="title-number">#{{ index + 1 }}</div>
                  <div class="title-text">{{ title }}</div>
                  <el-button
                    size="small"
                    :icon="selectedTitleIndex === index ? Check : null"
                    :type="selectedTitleIndex === index ? 'success' : 'default'"
                    @click.stop="selectTitle(index, title)"
                  >
                    {{ selectedTitleIndex === index ? '已选择' : '选择' }}
                  </el-button>
                </div>
              </div>
              
              <el-button
                v-if="selectedTitleIndex !== null"
                type="primary"
                size="large"
                @click="goToNextStep"
                class="next-step-btn"
              >
                下一步：生成封面文字 →
              </el-button>
            </div>
          </el-card>
        </div>

        <!-- 步骤2：生成封面文字 -->
        <div v-if="currentStep === 1" class="step-content">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>🎨 第二步：生成封面文字</span>
                <el-button size="small" @click="currentStep = 0">← 返回</el-button>
              </div>
            </template>
            
            <div class="selected-title-display">
              <h3>已选择的标题：</h3>
              <p class="selected-title-text">{{ selectedTitle }}</p>
            </div>

            <el-button
              type="primary"
              size="large"
              :loading="generatingCoverTexts"
              @click="generateCoverTexts"
              class="generate-btn"
            >
              <el-icon><MagicStick /></el-icon>
              {{ generatingCoverTexts ? 'AI 正在生成封面文字...' : '生成封面文字建议' }}
            </el-button>

            <!-- 生成的封面文字列表 -->
            <div v-if="coverTexts.length > 0" class="cover-texts-section">
              <h3 class="section-title">✨ 为你生成了 {{ coverTexts.length }} 个封面文字：</h3>
              <div class="cover-texts-grid">
                <div
                  v-for="(text, index) in coverTexts"
                  :key="index"
                  class="cover-text-card"
                  :class="{ 'selected': selectedCoverTextIndex === index }"
                  @click="selectCoverText(index, text)"
                >
                  <div class="cover-text-preview">
                    <p class="cover-text-display">{{ text }}</p>
                  </div>
                  <div class="cover-text-actions">
                    <el-button
                      size="small"
                      :icon="selectedCoverTextIndex === index ? Check : null"
                      :type="selectedCoverTextIndex === index ? 'success' : 'default'"
                      @click.stop="selectCoverText(index, text)"
                    >
                      {{ selectedCoverTextIndex === index ? '已选择' : '选择' }}
                    </el-button>
                    <el-button
                      size="small"
                      :icon="CopyDocument"
                      @click.stop="copyText(text)"
                    >
                      复制
                    </el-button>
                  </div>
                </div>
              </div>
              
              <el-button
                v-if="selectedCoverTextIndex !== null"
                type="primary"
                size="large"
                @click="goToNextStep"
                class="next-step-btn"
              >
                下一步：生成完整文案 →
              </el-button>
            </div>
          </el-card>
        </div>

        <!-- 步骤3：输入大纲，生成完整文案 -->
        <div v-if="currentStep === 2" class="step-content">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>✍️ 第三步：生成完整文案</span>
                <el-button size="small" @click="currentStep = 1">← 返回</el-button>
              </div>
            </template>
            
            <div class="selected-info-display">
              <div class="info-item">
                <strong>标题：</strong>{{ selectedTitle }}
              </div>
              <div class="info-item" v-if="selectedCoverText">
                <strong>封面文字：</strong>{{ selectedCoverText }}
              </div>
            </div>

            <el-form :model="form" label-position="top">
              <el-form-item label="内容大纲/要点（每行一个要点）">
                <el-input
                  v-model="form.outline"
                  type="textarea"
                  :rows="6"
                  placeholder="例如：&#10;- 早上空腹喝水&#10;- 三餐怎么吃&#10;- 运动计划&#10;- 我的真实效果"
                  clearable
                />
                <div class="form-tip">
                  💡 提示：列出你想在文案中提到的要点，AI 会根据这些要点生成完整文案
                </div>
              </el-form-item>
              
              <el-button
                type="primary"
                size="large"
                :loading="generatingContent"
                :disabled="!form.outline"
                @click="generateContent"
                class="generate-btn"
              >
                <el-icon><MagicStick /></el-icon>
                {{ generatingContent ? 'AI 正在创作文案...' : '一键生成完整文案' }}
              </el-button>
            </el-form>

            <!-- 生成的完整文案 -->
            <div v-if="content" class="content-section">
              <div class="content-header">
                <h3 class="section-title">✨ 生成的完整文案</h3>
              <div class="content-actions">
                <span class="word-count">共 {{ content.length }} 字</span>
                <el-button
                  type="success"
                  :icon="CopyDocument"
                  @click="copyText(content)"
                >
                  复制全文
                </el-button>
                <el-button
                  type="primary"
                  :icon="Download"
                  @click="exportContent"
                >
                  导出为 Markdown
                </el-button>
              </div>
              </div>
              
              <div class="content-display">
                <pre class="content-text">{{ content }}</pre>
              </div>

              <div class="content-tips">
                <p>💡 <strong>使用建议：</strong>生成的文案可以直接使用，也可以根据你的实际情况适当调整，让内容更真实自然！</p>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { MagicStick, CopyDocument, Check, InfoFilled, Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { aiService } from '@/services/aiService'
import Breadcrumb from '@/components/Breadcrumb.vue'

const router = useRouter()
const route = useRoute()

// 从路由参数获取话题（如果从其他工具跳转过来）
onMounted(() => {
  if (route.query.topic) {
    form.value.topic = route.query.topic as string
    ElMessage.info('已自动填充话题，可以直接生成标题')
  }
})

// 步骤定义
const steps = [
  { label: '生成标题' },
  { label: '封面文字' },
  { label: '完整文案' }
]

// 响应式数据
const currentStep = ref(0)
const form = ref({
  topic: '',
  keywords: '',
  outline: ''
})

const titles = ref<string[]>([])
const selectedTitleIndex = ref<number | null>(null)
const selectedTitle = ref('')

const coverTexts = ref<string[]>([])
const selectedCoverTextIndex = ref<number | null>(null)
const selectedCoverText = ref('')

const content = ref('')

const generatingTitles = ref(false)
const generatingCoverTexts = ref(false)
const generatingContent = ref(false)

// 计算属性
const breadcrumbItems = [
  { label: '工具箱', path: '/tools' },
  { label: '爆款生成器', path: '' }
]

// 生成标题的 Prompt
const generateTitlePrompt = (topic: string, keywords?: string): string => {
  let prompt = `你是一个小红书爆款文案专家。用户输入的主题是：${topic}`
  
  if (keywords) {
    prompt += `\n相关关键词：${keywords}`
  }
  
  prompt += `\n\n请生成10个小红书爆款标题，要求：
1. 使用高情绪词汇（太绝了、必看、不看后悔、真的爱了、绝了）
2. 加入具体数字（30天、5分钟、3步骤、10个技巧）
3. 使用合适的emoji（🔥💯✨⚡️💰🎯❤️👍等）
4. 制造悬念或反差（没想到、原来、竟然、居然、太震惊）
5. 长度控制在15-25字
6. 符合小红书平台调性（真诚、有用、有趣）
7. 可以使用疑问句或感叹句增强吸引力

以 JSON 数组格式输出，只返回数组，不要其他说明。示例格式：
["标题1 🔥", "标题2 ✨", "标题3 💯"]`
  
  return prompt
}

// 生成封面文字的 Prompt
const generateCoverTextPrompt = (title: string): string => {
  return `基于小红书笔记标题：${title}

请生成5个适合做封面文字的短句，要求：
1. 每句6-12字
2. 高度概括核心卖点或最吸引人的点
3. 带有冲击力和吸引力
4. 可以加入1个适当的emoji
5. 适合大字号显示在封面图片上
6. 引发好奇心或共鸣

以 JSON 数组格式输出，只返回数组。示例格式：
["短句1 🔥", "短句2", "短句3 ✨"]`
}

// 生成内容的 Prompt
const generateContentPrompt = (title: string, outline: string): string => {
  return `你是小红书爆款文案写作专家。

用户的标题：${title}
用户的大纲/要点：${outline}

请生成一篇完整的小红书文案，要求：
1. 开头吸引人（用emoji、疑问句或惊叹句，让人想继续看）
2. 分段清晰，每段2-4行，方便阅读
3. 适当使用emoji增强视觉效果（但不要过多）
4. 加入具体案例、数据或个人经历，增强可信度
5. 使用口语化表达，亲切自然
6. 结尾引导互动（提问、引导评论、引导收藏点赞）
7. 总字数控制在300-600字
8. 语气轻松、真诚、有共鸣感

直接输出文案内容，不要加"以下是文案"等说明。`
}

// 方法
const generateTitles = async () => {
  if (!form.value.topic.trim()) {
    ElMessage.warning('请输入内容主题')
    return
  }

  generatingTitles.value = true
  titles.value = []
  selectedTitleIndex.value = null
  selectedTitle.value = ''

  try {
    const prompt = generateTitlePrompt(form.value.topic, form.value.keywords)
    const response = await aiService.generateContent({
      accountData: {} as any,
      sectionId: 0,
      template: prompt,
      context: ''
    })

    if (response.success) {
      // 尝试解析 JSON 数组
      try {
        const content = response.data.trim()
        // 移除可能的 markdown 代码块标记
        const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        const parsed = JSON.parse(jsonContent)
        titles.value = Array.isArray(parsed) ? parsed : [parsed]
      } catch (e) {
        // 如果不是 JSON，尝试按行分割
        titles.value = response.data.split('\n')
          .map(line => line.trim())
          .filter(line => line && !line.startsWith('[') && !line.startsWith(']'))
          .map(line => line.replace(/^["']|["']$/g, '').replace(/^-\s*/, ''))
          .slice(0, 10)
      }
      
      if (titles.value.length === 0) {
        ElMessage.warning('未能生成标题，请重试')
      }
    } else {
      ElMessage.error(response.error || '生成标题失败')
    }
  } catch (error) {
    console.error('Generate titles error:', error)
    ElMessage.error('生成标题失败，请稍后重试')
  } finally {
    generatingTitles.value = false
  }
}

const selectTitle = (index: number, title: string) => {
  selectedTitleIndex.value = index
  selectedTitle.value = title
}

const generateCoverTexts = async () => {
  if (!selectedTitle.value) {
    ElMessage.warning('请先选择一个标题')
    return
  }

  generatingCoverTexts.value = true
  coverTexts.value = []
  selectedCoverTextIndex.value = null
  selectedCoverText.value = ''

  try {
    const prompt = generateCoverTextPrompt(selectedTitle.value)
    const response = await aiService.generateContent({
      accountData: {} as any,
      sectionId: 0,
      template: prompt,
      context: ''
    })

    if (response.success) {
      try {
        const content = response.data.trim()
        const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        const parsed = JSON.parse(jsonContent)
        coverTexts.value = Array.isArray(parsed) ? parsed : [parsed]
      } catch (e) {
        coverTexts.value = response.data.split('\n')
          .map(line => line.trim())
          .filter(line => line && !line.startsWith('[') && !line.startsWith(']'))
          .map(line => line.replace(/^["']|["']$/g, '').replace(/^-\s*/, ''))
          .slice(0, 5)
      }
      
      if (coverTexts.value.length === 0) {
        ElMessage.warning('未能生成封面文字，请重试')
      }
    } else {
      ElMessage.error(response.error || '生成封面文字失败')
    }
  } catch (error) {
    console.error('Generate cover texts error:', error)
    ElMessage.error('生成封面文字失败，请稍后重试')
  } finally {
    generatingCoverTexts.value = false
  }
}

const selectCoverText = (index: number, text: string) => {
  selectedCoverTextIndex.value = index
  selectedCoverText.value = text
}

const generateContent = async () => {
  if (!selectedTitle.value) {
    ElMessage.warning('请先完成前面的步骤')
    return
  }

  if (!form.value.outline.trim()) {
    ElMessage.warning('请输入内容大纲')
    return
  }

  generatingContent.value = true
  content.value = ''

  try {
    const prompt = generateContentPrompt(selectedTitle.value, form.value.outline)
    const response = await aiService.generateContent({
      accountData: {} as any,
      sectionId: 0,
      template: prompt,
      context: ''
    })

    if (response.success) {
      content.value = response.data.trim()
      if (!content.value) {
        ElMessage.warning('未能生成文案，请重试')
      }
    } else {
      ElMessage.error(response.error || '生成文案失败')
    }
  } catch (error) {
    console.error('Generate content error:', error)
    ElMessage.error('生成文案失败，请稍后重试')
  } finally {
    generatingContent.value = false
  }
}

const copyText = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success('已复制到剪贴板')
  }).catch(() => {
    ElMessage.error('复制失败')
  })
}

// 导出完整内容为 Markdown
const exportContent = () => {
  if (!content.value) {
    ElMessage.warning('没有可导出的内容')
    return
  }
  
  const markdown = `# ${selectedTitle.value || '小红书内容'}

${selectedCoverText.value ? `## 封面文字\n\n${selectedCoverText.value}\n\n` : ''}## 完整文案\n\n${content.value}

---
*生成时间：${new Date().toLocaleString('zh-CN')}*
*使用工具：小红书爆款生成器*
`
  
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `小红书内容_${selectedTitle.value?.slice(0, 20) || '未命名'}_${new Date().toISOString().slice(0, 10)}.md`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  
  ElMessage.success('内容已导出为 Markdown 文件')
}

const goToNextStep = () => {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++
    
    // 自动生成下一步的内容
    if (currentStep.value === 1) {
      // 进入封面文字步骤，自动生成
      generateCoverTexts()
    }
  }
}
</script>

<style scoped>
.viral-generator-view {
  min-height: 100vh;
  background: var(--bg-primary);
  padding: 24px 0 48px;
}

.container {
  max-width: 1200px;
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
  background: linear-gradient(135deg, #ff6b6b 0%, #ff2442 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 16px 0;
}

.tool-description {
  font-size: 1.125rem;
  color: var(--text-secondary);
  margin: 0;
}

.usage-guide {
  margin-bottom: 24px;
  border: 1px solid #e5e7eb;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.guide-content {
  line-height: 1.8;
}

.guide-content ol {
  margin: 12px 0;
  padding-left: 24px;
}

.guide-content li {
  margin-bottom: 8px;
}

.steps-indicator {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-bottom: 48px;
  padding: 0 20px;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  position: relative;
  flex: 1;
  max-width: 200px;
}

.step-item::after {
  content: '';
  position: absolute;
  top: 20px;
  left: 100%;
  width: 100%;
  height: 2px;
  background: var(--border-color);
  z-index: 0;
}

.step-item:last-child::after {
  display: none;
}

.step-item.active .step-number,
.step-item.completed .step-number {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff2442 100%);
  color: white;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  position: relative;
  z-index: 1;
  transition: all 0.3s;
}

.step-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  text-align: center;
}

.step-item.active .step-label {
  color: var(--text-primary);
  font-weight: 500;
}

.step-content {
  max-width: 900px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.generate-btn {
  width: 100%;
  margin-top: 16px;
}

.titles-section,
.cover-texts-section {
  margin-top: 32px;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 20px 0;
  color: var(--text-primary);
}

.titles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.title-card {
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.title-card:hover {
  border-color: #ff6b6b;
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.title-card.selected {
  border-color: #ff2442;
  background: linear-gradient(135deg, #fff5f5 0%, #ffe5e5 100%);
}

.title-number {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.title-text {
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 12px;
  line-height: 1.5;
  min-height: 48px;
}

.selected-title-display {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: 20px;
  margin-bottom: 24px;
}

.selected-title-display h3 {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0 0 8px 0;
}

.selected-title-text {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.cover-texts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.cover-text-card {
  background: linear-gradient(135deg, #fff5f5 0%, #ffe5e5 100%);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s;
}

.cover-text-card:hover {
  border-color: #ff6b6b;
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.cover-text-card.selected {
  border-color: #ff2442;
  background: linear-gradient(135deg, #ff6b6b 0%, #ff2442 100%);
}

.cover-text-preview {
  margin-bottom: 16px;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cover-text-display {
  font-size: 1.5rem;
  font-weight: 700;
  text-align: center;
  margin: 0;
  color: var(--text-primary);
}

.cover-text-card.selected .cover-text-display {
  color: white;
}

.cover-text-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.selected-info-display {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: 20px;
  margin-bottom: 24px;
}

.info-item {
  margin-bottom: 12px;
  font-size: 0.875rem;
  color: var(--text-primary);
}

.info-item:last-child {
  margin-bottom: 0;
}

.form-tip {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  margin-top: 8px;
}

.content-section {
  margin-top: 32px;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.content-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.word-count {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.content-display {
  background: white;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 24px;
  margin-bottom: 16px;
}

.content-text {
  font-family: inherit;
  font-size: 0.9375rem;
  line-height: 1.8;
  color: var(--text-primary);
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
}

.content-tips {
  background: #e3f2fd;
  border-radius: var(--radius-md);
  padding: 16px;
}

.content-tips p {
  margin: 0;
  font-size: 0.875rem;
  color: #1976d2;
}

.next-step-btn {
  width: 100%;
  margin-top: 24px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tool-title {
    font-size: 2rem;
  }
  
  .steps-indicator {
    gap: 12px;
  }
  
  .step-label {
    font-size: 0.75rem;
  }
  
  .titles-grid,
  .cover-texts-grid {
    grid-template-columns: 1fr;
  }
  
  .content-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>

