<template>
  <div class="home-view">
    <AppHeader />
    
    <div class="container">
      <!-- 顶部标题区域 -->
      <div class="hero-header">
        <h1 class="main-title">小红书涨粉实操指南生成器</h1>
        <p class="main-description">
          上传你的小红书主页截图，AI 自动分析账号数据，生成专属的 12 章节涨粉实操指南
        </p>
        <div class="hero-stats">
          <div class="stat-item">
            <div class="stat-number">12</div>
            <div class="stat-label">核心章节</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-number">5分钟</div>
            <div class="stat-label">智能生成</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-number">100%</div>
            <div class="stat-label">数据安全</div>
          </div>
        </div>
      </div>

      <!-- 工具入口卡片 -->
      <div class="tool-card">
        <!-- 上传区域 -->
        <div
          class="upload-zone"
          :class="{ 'is-dragging': isDragging, 'has-preview': previewUrl }"
          @drop.prevent="handleDrop"
          @dragover.prevent="handleDragOver"
          @dragleave.prevent="handleDragLeave"
          @click="triggerFileInput"
        >
          <input
            ref="fileInputRef"
            type="file"
            accept=".png,.jpg,.jpeg"
            style="display: none"
            @change="handleFileSelect"
          />
          
          <!-- 有预览图 -->
          <div v-if="previewUrl" class="preview-wrapper">
            <img :src="previewUrl" alt="预览" class="preview-img" />
            <div class="preview-mask">
              <el-button type="primary" size="large" @click.stop="triggerFileInput">
                重新选择
              </el-button>
            </div>
          </div>
          
          <!-- 无预览图 -->
          <div v-else class="upload-placeholder">
            <el-icon :size="64" color="#409EFF">
              <Upload />
            </el-icon>
            <p class="upload-text">点击或拖拽上传小红书主页截图</p>
            <p class="upload-hint">支持 PNG、JPG、JPEG 格式，不超过 10MB</p>
          </div>
        </div>

        <!-- 进度条 -->
        <div v-if="isUploading" class="progress-section">
          <el-progress :percentage="uploadProgress" :stroke-width="8" />
          <p class="progress-tip">{{ progressText }}</p>
        </div>

        <!-- 错误提示 -->
        <el-alert
          v-if="error"
          :title="error"
          type="error"
          :closable="true"
          @close="error = null"
          show-icon
        />

        <!-- 开始按钮 -->
        <el-button
          v-if="previewUrl && !isUploading"
          type="primary"
          size="large"
          class="start-button"
          @click="handleStartAnalysis"
        >
          开始 AI 分析
        </el-button>

        <!-- 底部提示 -->
        <div class="bottom-tips">
          <div class="tip-item">
            <el-icon color="#67C23A"><CircleCheck /></el-icon>
            <span>AI 智能识别</span>
          </div>
          <div class="tip-item">
            <el-icon color="#67C23A"><CircleCheck /></el-icon>
            <span>12 章节指南</span>
          </div>
          <div class="tip-item">
            <el-icon color="#67C23A"><CircleCheck /></el-icon>
            <span>一键导出</span>
          </div>
          <div class="tip-item">
            <el-icon color="#409EFF"><Lock /></el-icon>
            <span>数据不存储</span>
          </div>
        </div>
      </div>

      <!-- 功能介绍区域 -->
      <div id="features" class="features-section">
        <h2 class="section-title">核心功能</h2>
        <p class="section-subtitle">AI 驱动的智能涨粉解决方案</p>
        
        <div class="features-grid">
          <div class="feature-card">
            <h3>AI 智能分析</h3>
            <p>上传小红书主页截图，AI 自动识别账号名称、粉丝数、笔记数和内容类别，无需手动输入</p>
          </div>
          
          <div class="feature-card">
            <h3>账号诊断</h3>
            <p>基于当前数据分析账号现状，评估涨粉难度，给出针对性的改进建议和预期时间</p>
          </div>
          
          <div class="feature-card">
            <h3>12 章节指南</h3>
            <p>从起号计划到变现路径，涵盖内容规划、爆款公式、冷启动技巧等完整涨粉方案</p>
          </div>
          
          <div class="feature-card">
            <h3>对标分析</h3>
            <p>提供 18 维度拆解清单，帮你找到对标账号，学习成功经验，快速复制涨粉路径</p>
          </div>
          
          <div class="feature-card">
            <h3>实操清单</h3>
            <p>每日固定动作、立刻行动清单，让你知道今晚做什么、明天做什么，不再迷茫</p>
          </div>
          
          <div class="feature-card">
            <h3>一键导出</h3>
            <p>支持导出为 HTML 格式，保留完整格式和样式，可通过浏览器打印为 PDF 保存</p>
          </div>
        </div>
      </div>

      <!-- 使用步骤 -->
      <div id="how-to-use" class="steps-section">
        <h2 class="section-title">使用步骤</h2>
        <p class="section-subtitle">3 步生成专属涨粉指南</p>
        
        <div class="steps-grid">
          <div class="step-card">
            <div class="step-number">1</div>
            <h3>上传截图</h3>
            <p>打开小红书 App，进入个人主页，截图保存。然后上传到本工具</p>
          </div>
          
          <div class="step-arrow">→</div>
          
          <div class="step-card">
            <div class="step-number">2</div>
            <h3>AI 分析</h3>
            <p>AI 自动识别账号数据，你可以确认或修改信息，确保准确性</p>
          </div>
          
          <div class="step-arrow">→</div>
          
          <div class="step-card">
            <div class="step-number">3</div>
            <h3>获取指南</h3>
            <p>AI 生成 12 章节完整指南，包含诊断、计划、技巧等，可导出保存</p>
          </div>
        </div>
      </div>

      <!-- FAQ -->
      <div id="faq" class="faq-section">
        <h2 class="section-title">常见问题</h2>
        
        <div class="faq-list">
          <div class="faq-item">
            <h3>❓ 小红书涨粉助手需要付费吗？</h3>
            <p>完全免费使用！我们使用 DeepSeek AI API 和 Google Gemini，成本很低，目前不收取任何费用。无需注册登录，上传截图即可使用。</p>
          </div>
          
          <div class="faq-item">
            <h3>❓ 上传的小红书截图数据安全吗？</h3>
            <p>非常安全。您的图片仅用于 AI 分析，不会存储在我们的服务器。AI 分析完成后立即删除所有数据，完全保护您的隐私。我们不收集任何个人信息。</p>
          </div>
          
          <div class="faq-item">
            <h3>❓ AI 生成的小红书涨粉指南准确吗？</h3>
            <p>指南基于小红书平台最新规则和大量成功案例生成，具有很高的参考价值。包含账号诊断、起号计划、爆款公式等实用内容。但每个账号情况不同，建议结合自身实际情况调整优化。</p>
          </div>
          
          <div class="faq-item">
            <h3>❓ 支持哪些图片格式？如何截图？</h3>
            <p>支持 PNG、JPG、JPEG 格式，文件大小不超过 10MB。建议：打开小红书 App → 进入个人主页 → 截取完整屏幕（包含粉丝数、笔记数等信息）→ 上传到本工具。清晰的截图能提高 AI 识别准确率。</p>
          </div>
          
          <div class="faq-item">
            <h3>❓ 生成小红书涨粉指南需要多久？</h3>
            <p>整个过程约 5 分钟：图像识别约 10 秒，AI 生成 12 个章节内容约 3-5 分钟。生成后可立即查看，支持导出为 HTML 格式，可打印为 PDF 保存。</p>
          </div>
          
          <div class="faq-item">
            <h3>❓ 适合什么样的小红书账号使用？</h3>
            <p>特别适合 0-1000 粉丝的新手博主和起号阶段的账号。无论是美妆、穿搭、美食、旅行还是知识分享类账号，都能获得针对性的涨粉建议和实操方案。</p>
          </div>
          
          <div class="faq-item">
            <h3>❓ 生成的指南包含哪些内容？</h3>
            <p>完整的 12 章节包括：①账号诊断 ②起号三天计划 ③对标账号拆解 ④内容规划 ⑤爆款笔记公式 ⑥冷启动技巧 ⑦每日固定动作 ⑧数据复盘模板 ⑨避坑指南 ⑩变现路径规划 ⑪冲刺计划总结表 ⑫立刻行动清单。</p>
          </div>
          
          <div class="faq-item">
            <h3>❓ 如何提高小红书涨粉效果？</h3>
            <p>建议：1) 严格按照生成的指南执行 2) 重点关注对标账号拆解和爆款公式 3) 坚持每日固定动作 4) 定期使用数据复盘模板分析 5) 持续优化内容质量。涨粉是一个持续过程，需要耐心和坚持。</p>
          </div>
        </div>
      </div>
      
      <!-- SEO 内容区域（对用户隐藏，对搜索引擎可见） -->
      <div class="seo-content">
        <h2>关于小红书涨粉助手</h2>
        <p>
          小红书涨粉助手是一款基于人工智能技术的免费小红书运营工具，专为小红书博主和内容创作者设计。
          通过上传小红书主页截图，AI 会自动分析您的账号数据，包括粉丝数、笔记数、内容类别等关键指标，
          并生成一份完整的 12 章节涨粉实操指南。
        </p>
        <p>
          我们的工具特别适合 0-1000 粉丝阶段的新手博主，帮助您快速度过冷启动期，实现粉丝增长。
          无论您是美妆博主、穿搭达人、美食分享者、旅行记录者还是知识分享者，都能获得针对性的运营建议。
        </p>
        <h3>小红书涨粉的核心要素</h3>
        <p>
          成功的小红书涨粉需要关注以下几个方面：账号定位清晰、内容质量优秀、发布时间精准、
          封面设计吸引人、标题具有吸引力、标签使用恰当、互动及时有效、数据分析到位。
          我们的 AI 工具会根据您的账号现状，在这些方面给出具体的优化建议。
        </p>
        <h3>为什么选择我们的小红书涨粉工具</h3>
        <ul>
          <li>完全免费：无需付费，无需注册，上传即用</li>
          <li>AI 驱动：使用最新的人工智能技术进行分析</li>
          <li>内容全面：12 个章节覆盖涨粉全流程</li>
          <li>实操性强：提供具体可执行的行动清单</li>
          <li>数据安全：不存储任何用户数据，保护隐私</li>
          <li>持续更新：根据小红书平台规则及时更新策略</li>
        </ul>
      </div>
    </div>
    
    <AppFooter @show-privacy="showPrivacy" />
    
    <PrivacyModal ref="privacyModalRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Upload, Lock, CircleCheck, TrendCharts } from '@element-plus/icons-vue'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import PrivacyModal from '@/components/PrivacyModal.vue'

const router = useRouter()
const privacyModalRef = ref()

// 状态
const isDragging = ref(false)
const isUploading = ref(false)
const uploadProgress = ref(0)
const previewUrl = ref<string | null>(null)
const error = ref<string | null>(null)
const fileInputRef = ref<HTMLInputElement>()
const currentFile = ref<File | null>(null)

// 进度文本
const progressText = computed(() => {
  if (uploadProgress.value < 30) return '正在读取图片...'
  if (uploadProgress.value < 70) return '正在压缩处理...'
  return '即将完成...'
})

// 触发文件选择
const triggerFileInput = () => {
  fileInputRef.value?.click()
}

// 处理文件选择
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    processFile(file)
  }
}

// 处理拖拽
const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  const file = event.dataTransfer?.files[0]
  if (file) {
    processFile(file)
  }
}

const handleDragOver = () => {
  isDragging.value = true
}

const handleDragLeave = () => {
  isDragging.value = false
}

// 处理文件
const processFile = async (file: File) => {
  error.value = null
  
  try {
    const { validateFile } = await import('@/utils/fileValidator')
    const validation = validateFile(file)
    
    if (!validation.valid) {
      error.value = validation.error || '文件验证失败'
      return
    }
    
    isUploading.value = true
    uploadProgress.value = 20
    
    const { compressImage } = await import('@/utils/imageProcessor')
    uploadProgress.value = 50
    
    const compressed = await compressImage(file, 1920, 1920, 0.85)
    uploadProgress.value = 90
    
    previewUrl.value = compressed.dataUrl
    currentFile.value = file
    uploadProgress.value = 100
    
    setTimeout(() => {
      isUploading.value = false
      uploadProgress.value = 0
    }, 500)
    
  } catch (err) {
    error.value = err instanceof Error ? err.message : '处理失败，请重试'
    isUploading.value = false
    uploadProgress.value = 0
  }
}

// 开始分析
const handleStartAnalysis = async () => {
  if (previewUrl.value && currentFile.value) {
    const { useAppStore } = await import('@/stores/appStore')
    const store = useAppStore()
    store.setUploadedImage(previewUrl.value, currentFile.value)
    router.push('/analysis')
  }
}

// 显示隐私政策
const showPrivacy = () => {
  privacyModalRef.value?.show()
}
</script>

<style scoped>
.home-view {
  min-height: 100vh;
  background: white;
  display: flex;
  flex-direction: column;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 60px 20px;
  flex: 1;
}

/* 顶部标题区域 */
.hero-header {
  text-align: center;
  margin-bottom: 48px;
}

.main-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 16px 0;
  line-height: 1.2;
}

.main-description {
  font-size: 1.125rem;
  color: #6b7280;
  line-height: 1.75;
  margin: 0 0 32px 0;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.hero-stats {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 32px;
  margin-top: 32px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #409EFF;
  line-height: 1;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: #e5e7eb;
}

/* 工具卡片 */
.tool-card {
  background: white;
  border-radius: 16px;
  padding: 40px;
}

/* 上传区域 */
.upload-zone {
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 60px 30px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;
  margin-bottom: 24px;
}

.upload-zone:hover {
  border-color: #409EFF;
  background: #f0f9ff;
}

.upload-zone.is-dragging {
  border-color: #409EFF;
  background: #e6f7ff;
  transform: scale(1.01);
}

.upload-zone.has-preview {
  padding: 0;
  border: none;
  background: transparent;
}

.preview-wrapper {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
}

.preview-img {
  width: 100%;
  height: auto;
  display: block;
}

.preview-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.preview-wrapper:hover .preview-mask {
  opacity: 1;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.upload-text {
  font-size: 1.125rem;
  color: #374151;
  margin: 0;
  font-weight: 500;
}

.upload-hint {
  font-size: 0.875rem;
  color: #9ca3af;
  margin: 0;
}

/* 进度 */
.progress-section {
  margin-bottom: 24px;
}

.progress-tip {
  text-align: center;
  margin-top: 8px;
  color: #6b7280;
  font-size: 0.875rem;
}

/* 开始按钮 */
.start-button {
  width: 100%;
  height: 48px;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 24px;
}

/* 底部提示 */
.bottom-tips {
  display: flex;
  justify-content: center;
  gap: 24px;
  flex-wrap: wrap;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #6b7280;
  font-size: 0.875rem;
}

/* 功能介绍区域 */
.features-section {
  margin-top: 80px;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  text-align: center;
  margin: 0 0 12px 0;
}

.section-subtitle {
  font-size: 1.125rem;
  color: #6b7280;
  text-align: center;
  margin: 0 0 48px 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.feature-card {
  background: #fafafa;
  border-radius: 12px;
  padding: 32px 24px;
  text-align: center;
  transition: all 0.3s;
}

.feature-card:hover {
  background: #f0f9ff;
  transform: translateY(-2px);
}

.feature-card h3 {
  font-size: 1.25rem;
  color: #1f2937;
  margin: 0 0 12px 0;
  font-weight: 600;
}

.feature-card p {
  font-size: 0.9375rem;
  color: #6b7280;
  line-height: 1.6;
  margin: 0;
}

/* 使用步骤 */
.steps-section {
  margin-top: 80px;
}

.steps-grid {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  flex-wrap: wrap;
}

.step-card {
  background: #fafafa;
  border-radius: 12px;
  padding: 32px 24px;
  text-align: center;
  flex: 1;
  min-width: 200px;
  max-width: 280px;
}

.step-number {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 auto 16px;
}

.step-card h3 {
  font-size: 1.125rem;
  color: #1f2937;
  margin: 0 0 12px 0;
  font-weight: 600;
}

.step-card p {
  font-size: 0.9375rem;
  color: #6b7280;
  line-height: 1.6;
  margin: 0;
}

.step-arrow {
  font-size: 2rem;
  color: #d1d5db;
  font-weight: 300;
}

/* FAQ */
.faq-section {
  margin-top: 80px;
  margin-bottom: 40px;
}

.faq-list {
  max-width: 700px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.faq-item {
  background: #fafafa;
  border-radius: 12px;
  padding: 24px;
}

.faq-item h3 {
  font-size: 1.125rem;
  color: #1f2937;
  margin: 0 0 12px 0;
  font-weight: 600;
}

.faq-item p {
  font-size: 0.9375rem;
  color: #6b7280;
  line-height: 1.6;
  margin: 0;
}

/* SEO 内容区域 */
.seo-content {
  max-width: 700px;
  margin: 80px auto 40px;
  padding: 40px;
  background: #fafafa;
  border-radius: 12px;
  line-height: 1.8;
  color: #374151;
}

.seo-content h2 {
  font-size: 1.5rem;
  color: #1f2937;
  margin: 0 0 16px 0;
  font-weight: 600;
}

.seo-content h3 {
  font-size: 1.25rem;
  color: #1f2937;
  margin: 24px 0 12px 0;
  font-weight: 600;
}

.seo-content p {
  margin: 12px 0;
  font-size: 0.9375rem;
  color: #6b7280;
}

.seo-content ul {
  margin: 12px 0;
  padding-left: 24px;
}

.seo-content li {
  margin: 8px 0;
  font-size: 0.9375rem;
  color: #6b7280;
}

/* 响应式 */
@media (max-width: 768px) {
  .container {
    padding: 40px 16px;
  }

  .main-title {
    font-size: 1.875rem;
  }

  .main-description {
    font-size: 1rem;
  }

  .tool-card {
    padding: 24px;
  }

  .upload-zone {
    padding: 40px 20px;
  }

  .bottom-tips {
    gap: 16px;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .section-subtitle {
    font-size: 1rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .steps-grid {
    flex-direction: column;
  }

  .step-arrow {
    transform: rotate(90deg);
  }

  .features-section,
  .steps-section,
  .faq-section {
    margin-top: 60px;
  }
}
</style>
