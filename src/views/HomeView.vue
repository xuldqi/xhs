<template>
  <div class="home-view">
    <div class="container">
      <!-- 顶部标题区域 -->
      <div class="hero-header">
        <h1 class="main-title">小红书涨粉实操指南生成器</h1>
        <p class="main-description">
          上传你的小红书主页截图，AI 自动分析账号数据，生成专属的 12 章节涨粉实操指南
        </p>
        
        <!-- 统计数据 -->
        <div class="hero-stats-banner">
          <StatsCounter ref="statsCounterRef" />
        </div>
        
        <div class="hero-actions">
          <el-button type="primary" plain @click="showExample">
            <el-icon><View /></el-icon>
            查看示例指南
          </el-button>
          <el-button plain @click="showTutorial">
            <el-icon><QuestionFilled /></el-icon>
            新手教程
          </el-button>
        </div>
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
          :class="{ 'is-dragging': isDragging, 'has-images': uploadedImages.length > 0 }"
          @drop.prevent="handleDrop"
          @dragover.prevent="handleDragOver"
          @dragleave.prevent="handleDragLeave"
          @click="triggerFileInput"
        >
          <input
            ref="fileInputRef"
            type="file"
            accept=".png,.jpg,.jpeg"
            multiple
            style="display: none"
            @change="handleFileSelect"
          />
          
          <!-- 有预览图 -->
          <div v-if="uploadedImages.length > 0" class="preview-grid">
            <div
              v-for="(img, index) in uploadedImages"
              :key="index"
              class="preview-item"
            >
              <img :src="img.dataUrl" alt="预览" class="preview-img" />
              <div class="preview-badge">{{ index + 1 }}</div>
              <el-button
                class="remove-btn"
                circle
                size="small"
                type="danger"
                @click.stop="removeImage(index)"
              >
                <el-icon><Close /></el-icon>
              </el-button>
            </div>
            
            <!-- 添加更多按钮 -->
            <div
              v-if="uploadedImages.length < 3"
              class="add-more"
              @click.stop="triggerFileInput"
            >
              <el-icon :size="32" color="#409EFF">
                <Plus />
              </el-icon>
              <p>添加图片</p>
              <p class="hint">{{ uploadedImages.length }}/3</p>
            </div>
          </div>
          
          <!-- 无预览图 -->
          <div v-else class="upload-placeholder">
            <el-icon :size="64" color="#409EFF">
              <Upload />
            </el-icon>
            <p class="upload-text">上传 1-3 张小红书主页截图</p>
            <p class="upload-hint">
              <el-icon><InfoFilled /></el-icon>
              第一张必须包含主页信息（账号名、粉丝数、笔记数）
            </p>
            <p class="upload-hint">其他图片可以是笔记列表，帮助分析内容风格</p>
            <p class="upload-hint-small">支持 PNG、JPG、JPEG 格式，单张不超过 10MB</p>
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
          v-if="uploadedImages.length > 0 && !isUploading"
          type="primary"
          size="large"
          class="start-button"
          @click="handleStartAnalysis"
        >
          开始 AI 分析（{{ uploadedImages.length }} 张图片）
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

      <!-- 结果展示区 -->
      <section class="results-showcase">
        <h2 class="section-title">你将获得什么？</h2>
        <p class="section-subtitle">一份完整的、可执行的涨粉实操手册</p>
        
        <div class="benefits-grid">
          <div class="benefit-card">
            <div class="benefit-number">📊</div>
            <h3>账号全面诊断</h3>
            <p>分析你的账号现状、优势和改进方向，给出涨粉难度评估和预期时间</p>
          </div>
          
          <div class="benefit-card">
            <div class="benefit-number">📅</div>
            <h3>3天起号计划</h3>
            <p>Day 1-3详细行动步骤，包含对标研究、选题方向、发布策略、薯条投放</p>
          </div>
          
          <div class="benefit-card">
            <div class="benefit-number">💡</div>
            <h3>爆款笔记公式</h3>
            <p>标题模板、封面设计、正文结构，可直接套用的爆款创作方法论</p>
          </div>
          
          <div class="benefit-card">
            <div class="benefit-number">📈</div>
            <h3>数据复盘模板</h3>
            <p>每周复盘表格、核心指标追踪、优化方向建议，让数据指导决策</p>
          </div>
          
          <div class="benefit-card">
            <div class="benefit-number">💰</div>
            <h3>变现路径规划</h3>
            <p>不同粉丝量级的变现方式和预估收入，清晰的商业化路径</p>
          </div>
          
          <div class="benefit-card">
            <div class="benefit-number">✅</div>
            <h3>立即行动清单</h3>
            <p>今晚必做、明天要完成、本周关键里程碑，不再迷茫</p>
          </div>
        </div>
        
        <div class="showcase-stats">
          <div class="stat-card">
            <div class="stat-number">12</div>
            <div class="stat-label">个专业章节</div>
            <div class="stat-desc">完整的涨粉知识体系</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">50+</div>
            <div class="stat-label">条实操建议</div>
            <div class="stat-desc">每一条都可以立即执行</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">18</div>
            <div class="stat-label">维度拆解框架</div>
            <div class="stat-desc">系统化学习对标账号</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">5分钟</div>
            <div class="stat-label">智能生成</div>
            <div class="stat-desc">AI自动分析和撰写</div>
          </div>
        </div>
      </section>

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
      

    </div>
    
    <AppFooter />
    
    <ExampleModal ref="exampleModalRef" />
    <OnboardingTutorial ref="onboardingRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Upload, Lock, CircleCheck, View, Close, Plus, InfoFilled, QuestionFilled } from '@element-plus/icons-vue'
import AppFooter from '@/components/AppFooter.vue'
import ExampleModal from '@/components/ExampleModal.vue'
import OnboardingTutorial from '@/components/OnboardingTutorial.vue'
import StatsCounter from '@/components/StatsCounter.vue'
import { analytics } from '@/utils/analytics'

const router = useRouter()
const exampleModalRef = ref()
const onboardingRef = ref()
const statsCounterRef = ref()

// 追踪页面浏览
onMounted(() => {
  analytics.trackPageView('/', '首页')
})

interface UploadedImage {
  file: File
  dataUrl: string
}

// 状态
const isDragging = ref(false)
const isUploading = ref(false)
const uploadProgress = ref(0)
const uploadedImages = ref<UploadedImage[]>([])
const error = ref<string | null>(null)
const fileInputRef = ref<HTMLInputElement>()

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
  const files = target.files
  if (files && files.length > 0) {
    processFiles(Array.from(files))
  }
  // 清空 input，允许重复选择同一文件
  target.value = ''
}

// 处理拖拽
const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    processFiles(Array.from(files))
  }
}

const handleDragOver = () => {
  isDragging.value = true
}

const handleDragLeave = () => {
  isDragging.value = false
}

// 处理多个文件
const processFiles = async (files: File[]) => {
  error.value = null
  
  // 检查数量限制
  const remainingSlots = 3 - uploadedImages.value.length
  if (files.length > remainingSlots) {
    error.value = `最多只能上传 3 张图片，当前还可以上传 ${remainingSlots} 张`
    return
  }
  
  try {
    const { validateFile } = await import('@/utils/fileValidator')
    const { compressImage } = await import('@/utils/imageProcessor')
    
    isUploading.value = true
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      uploadProgress.value = Math.floor(((i + 0.5) / files.length) * 100)
      
      // 验证文件
      const validation = validateFile(file)
      if (!validation.valid) {
        error.value = `${file.name}: ${validation.error || '文件验证失败'}`
        continue
      }
      
      // 压缩图片
      const compressed = await compressImage(file, 1920, 1920, 0.85)
      
      // 添加到列表
      uploadedImages.value.push({
        file,
        dataUrl: compressed.dataUrl
      })
    }
    
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

// 移除图片
const removeImage = (index: number) => {
  uploadedImages.value.splice(index, 1)
}

// 开始分析
const handleStartAnalysis = async () => {
  if (uploadedImages.value.length === 0) return
  
  // 追踪上传事件
  analytics.trackUpload(uploadedImages.value.length)
  analytics.trackFunnelStep('upload_complete', 1)
  
  const { useAppStore } = await import('@/stores/appStore')
  const store = useAppStore()
  
  // 保存所有图片，第一张作为主图
  store.setUploadedImages(uploadedImages.value.map(img => ({
    dataUrl: img.dataUrl,
    file: img.file
  })))
  
  router.push('/analysis')
}

// 显示示例
const showExample = () => {
  analytics.trackEvent({
    action: 'view_example',
    category: 'engagement',
    label: 'hero_button'
  })
  exampleModalRef.value?.show()
}

// 显示新手教程
const showTutorial = () => {
  analytics.trackEvent({
    action: 'view_tutorial',
    category: 'engagement',
    label: 'hero_button'
  })
  onboardingRef.value?.show()
}

// 滚动到上传区域
const scrollToUpload = () => {
  const uploadZone = document.querySelector('.upload-zone')
  if (uploadZone) {
    uploadZone.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
  analytics.trackEvent({
    action: 'scroll_to_upload',
    category: 'engagement',
    label: 'cta_button'
  })
}
</script>

<style scoped>
.home-view {
  min-height: 100vh;
  background: linear-gradient(180deg, var(--color-primary-50) 0%, var(--color-white) 100%);
  display: flex;
  flex-direction: column;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px 80px;
  flex: 1;
}

/* 顶部标题区域 - 优化后的 Hero Section */
.hero-header {
  text-align: center;
  margin-bottom: var(--spacing-15);  /* 60px - 区块最小间距 */
  padding: var(--spacing-12) var(--spacing-6);  /* 48px 32px */
  background: linear-gradient(135deg, var(--color-primary-50) 0%, var(--color-secondary-50) 100%);
  border-radius: var(--radius-2xl);  /* 24px */
  box-shadow: var(--shadow-lg);
  position: relative;
  overflow: hidden;
}

/* 添加背景装饰 */
.hero-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, var(--color-primary-200) 0%, transparent 70%);
  opacity: 0.3;
  pointer-events: none;
}

.hero-header::after {
  content: '';
  position: absolute;
  bottom: -50%;
  left: -10%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, var(--color-secondary-200) 0%, transparent 70%);
  opacity: 0.3;
  pointer-events: none;
}

.main-title {
  font-size: var(--font-5xl);  /* 48px - 首屏标题桌面端 */
  font-weight: var(--font-extrabold);  /* 800 */
  background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-secondary-500) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 var(--spacing-6) 0;  /* 24px */
  line-height: var(--leading-tight);  /* 1.25 */
  letter-spacing: -0.02em;
  position: relative;
  z-index: 1;
}

.main-description {
  font-size: var(--font-xl);  /* 20px - 首屏副标题 */
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);  /* 1.6 */
  margin: 0 0 var(--spacing-8) 0;  /* 32px */
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  font-weight: var(--font-medium);  /* 500 */
  position: relative;
  z-index: 1;
}

.hero-stats-banner {
  margin: var(--spacing-4) 0;  /* 16px - 减小间距 */
  padding: var(--spacing-3) var(--spacing-5);  /* 12px 20px - 更紧凑 */
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
  border-radius: var(--radius-md);  /* 12px */
  display: inline-block;
  border: 1px solid rgba(102, 126, 234, 0.15);
}

.hero-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 24px;
}

.hero-actions .el-button {
  padding: 12px 28px;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.hero-actions .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.25);
}

.hero-stats {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-8);  /* 32px - 减小间距 */
  margin-top: var(--spacing-5);  /* 20px - 减小间距 */
  padding-top: var(--spacing-4);  /* 16px */
  border-top: 1px solid var(--border-light);
}

.stat-item {
  text-align: center;
  transition: transform 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-2px);
}

.stat-number {
  font-size: 1.5rem;  /* 减小字号 */
  font-weight: var(--font-bold);  /* 700 */
  background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-secondary-500) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
  margin-bottom: var(--spacing-1);  /* 4px */
}

.stat-label {
  font-size: 0.75rem;  /* 减小字号 */
  color: var(--text-secondary);
  font-weight: var(--font-medium);  /* 500 */
}

.stat-divider {
  width: 1px;
  height: 32px;  /* 减小高度 */
  background: linear-gradient(180deg, transparent 0%, var(--border-light) 50%, transparent 100%);
}

/* 工具卡片 */
.tool-card {
  background: var(--bg-primary);
  border-radius: var(--radius-2xl);  /* 24px */
  padding: var(--spacing-12);  /* 48px */
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-light);
}

/* 上传区域 */
.upload-zone {
  border: 3px dashed var(--border-medium);
  border-radius: var(--radius-xl);  /* 20px */
  padding: 64px 40px;
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-slow);
  background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--color-primary-50) 100%);
  margin-bottom: var(--spacing-8);  /* 32px */
  position: relative;
  overflow: hidden;
}

.upload-zone::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%);
  opacity: 0;
  transition: opacity var(--transition-slow);
}

.upload-zone:hover {
  border-color: var(--color-primary-500);
  background: linear-gradient(135deg, var(--color-primary-50) 0%, var(--color-secondary-50) 100%);
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(102, 126, 234, 0.15);
}

.upload-zone:hover::before {
  opacity: 1;
}

.upload-zone.is-dragging {
  border-color: var(--color-primary-500);
  background: linear-gradient(135deg, var(--color-primary-100) 0%, var(--color-secondary-100) 100%);
  transform: scale(1.02);
  box-shadow: 0 16px 48px rgba(102, 126, 234, 0.2);
}

.upload-zone.has-images {
  padding: var(--spacing-6);  /* 24px */
  border: 3px solid var(--color-primary-500);
  background: linear-gradient(135deg, var(--color-primary-50) 0%, var(--color-secondary-50) 100%);
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.preview-item {
  position: relative;
  border-radius: var(--radius-md);  /* 12px */
  overflow: hidden;
  border: 2px solid var(--border-light);
  aspect-ratio: 9/16;
  background: var(--bg-secondary);
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.preview-badge {
  position: absolute;
  top: var(--spacing-2);  /* 8px */
  left: var(--spacing-2);
  background: var(--color-primary-500);
  color: var(--text-inverse);
  width: 28px;
  height: 28px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-bold);  /* 700 */
  font-size: var(--font-sm);  /* 14px */
  box-shadow: var(--shadow-sm);
}

.remove-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  opacity: 0;
  transition: opacity 0.2s;
}

.preview-item:hover .remove-btn {
  opacity: 1;
}

.add-more {
  border: 2px dashed var(--color-primary-400);
  border-radius: var(--radius-md);  /* 12px */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  background: var(--bg-primary);
  aspect-ratio: 9/16;
}

.add-more:hover {
  background: var(--color-primary-50);
  border-color: var(--color-primary-500);
}

.add-more p {
  margin: var(--spacing-2) 0 0 0;  /* 8px */
  color: var(--color-primary-500);
  font-size: var(--font-sm);  /* 14px */
}

.add-more .hint {
  color: var(--text-tertiary);
  font-size: var(--font-xs);  /* 12px */
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.upload-text {
  font-size: var(--font-lg);  /* 18px */
  color: var(--text-primary);
  margin: 0;
  font-weight: var(--font-medium);  /* 500 */
}

.upload-hint {
  font-size: var(--font-sm);  /* 14px */
  color: var(--text-secondary);
  margin: var(--spacing-2) 0;  /* 8px */
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);  /* 8px */
}

.upload-hint-small {
  font-size: var(--font-xs);  /* 12px */
  color: var(--text-tertiary);
  margin: var(--spacing-1) 0 0 0;  /* 4px */
}

/* 进度 */
.progress-section {
  margin-bottom: 24px;
}

.progress-tip {
  text-align: center;
  margin-top: var(--spacing-2);  /* 8px */
  color: var(--text-secondary);
  font-size: var(--font-sm);  /* 14px */
}

/* 开始按钮 */
.start-button {
  width: 100%;
  height: 56px;
  font-size: var(--font-lg);  /* 18px */
  font-weight: var(--font-bold);  /* 700 */
  margin-bottom: var(--spacing-8);  /* 32px */
  border-radius: var(--radius-lg);  /* 16px */
  background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-secondary-500) 100%);
  border: none;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
  transition: all var(--transition-slow);
}

.start-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(102, 126, 234, 0.4);
}

.start-button:active {
  transform: translateY(0);
}

/* 底部提示 */
.bottom-tips {
  display: flex;
  justify-content: center;
  gap: var(--spacing-6);  /* 24px */
  flex-wrap: wrap;
  padding-top: var(--spacing-6);
  border-top: 1px solid var(--border-light);
}

.tip-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);  /* 8px */
  color: var(--text-secondary);
  font-size: var(--font-sm);  /* 14px */
}

/* 功能介绍区域 */
.features-section {
  margin-top: var(--spacing-20);  /* 80px */
}

.section-title {
  font-size: var(--font-2xl);  /* 24px */
  font-weight: var(--font-bold);  /* 700 */
  color: var(--text-primary);
  text-align: center;
  margin: 0 0 var(--spacing-3) 0;  /* 12px */
}

.section-subtitle {
  font-size: var(--font-lg);  /* 18px */
  color: var(--text-secondary);
  text-align: center;
  margin: 0 0 var(--spacing-12) 0;  /* 48px */
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-6);  /* 24px */
}

.feature-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);  /* 12px */
  padding: var(--spacing-8) var(--spacing-6);  /* 32px 24px */
  text-align: center;
  transition: all var(--transition-slow);
}

.feature-card:hover {
  background: var(--color-primary-50);
  transform: translateY(-2px);
}

.feature-card h3 {
  font-size: var(--font-xl);  /* 20px */
  color: var(--text-primary);
  margin: 0 0 var(--spacing-3) 0;  /* 12px */
  font-weight: var(--font-semibold);  /* 600 */
}

.feature-card p {
  font-size: var(--font-base);  /* 16px */
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);  /* 1.6 */
  margin: 0;
  text-align: left;
  word-wrap: break-word;
}

/* 使用步骤 */
.steps-section {
  margin-top: var(--spacing-20);  /* 80px */
}

.steps-grid {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-6);  /* 24px */
  flex-wrap: wrap;
}

.step-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);  /* 12px */
  padding: var(--spacing-8) var(--spacing-6);  /* 32px 24px */
  text-align: center;
  flex: 1;
  min-width: 200px;
  max-width: 280px;
}

.step-number {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-secondary-500) 100%);
  color: var(--text-inverse);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-xl);  /* 20px */
  font-weight: var(--font-bold);  /* 700 */
  margin: 0 auto var(--spacing-4);  /* 16px */
}

.step-card h3 {
  font-size: var(--font-lg);  /* 18px */
  color: var(--text-primary);
  margin: 0 0 var(--spacing-3) 0;  /* 12px */
  font-weight: var(--font-semibold);  /* 600 */
}

.step-card p {
  font-size: var(--font-base);  /* 16px */
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);  /* 1.6 */
  margin: 0;
  text-align: left;
  word-wrap: break-word;
}

.step-arrow {
  font-size: var(--font-2xl);  /* 24px */
  color: var(--border-medium);
  font-weight: 300;
}

/* FAQ */
.faq-section {
  margin-top: var(--spacing-20);  /* 80px */
  margin-bottom: var(--spacing-10);  /* 40px */
}

.faq-list {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);  /* 16px */
}

.faq-item {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);  /* 12px */
  padding: var(--spacing-6);  /* 24px */
  margin-bottom: var(--spacing-4);  /* 16px */
}

.faq-item:last-child {
  margin-bottom: 0;
}

.faq-item h3 {
  font-size: var(--font-lg);  /* 18px */
  color: var(--text-primary);
  margin: 0 0 var(--spacing-4) 0;  /* 16px */
  font-weight: var(--font-semibold);  /* 600 */
  line-height: var(--leading-normal);  /* 1.5 */
}

.faq-item p {
  font-size: var(--font-base);  /* 16px */
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);  /* 1.6 */
  margin: 0;
  text-align: left;
  word-wrap: break-word;
  max-width: 100%;
}

/* 响应式 */
@media (max-width: 768px) {
  .container {
    padding: 20px 16px;
  }

  /* 移动端精简 hero 区域，确保上传在第一屏 */
  .hero-header {
    padding: 16px 0 12px;
    margin-bottom: 16px;
  }

  .main-title {
    font-size: 1.5rem;
    margin-bottom: 8px;
  }

  .main-description {
    font-size: 0.9rem;
    margin-bottom: 12px;
    line-height: 1.5;
  }

  /* 移动端隐藏次要元素 */
  .hero-stats-banner {
    display: none;
  }

  .hero-stats {
    display: none;
  }

  .hero-actions {
    margin-top: 12px;
    gap: 8px;
  }

  .hero-actions .el-button {
    padding: 8px 16px;
    font-size: 0.875rem;
  }

  /* 移动端隐藏背景装饰 */
  .hero-header::before,
  .hero-header::after {
    display: none;
  }

  .tool-card {
    padding: 16px;
    margin-top: 0;
  }

  .upload-zone {
    padding: 24px 16px;
  }

  .upload-placeholder .el-icon {
    font-size: 48px !important;
  }

  .upload-text {
    font-size: 1rem;
  }

  .upload-hint {
    font-size: 0.8rem;
  }

  .upload-hint-small {
    font-size: 0.75rem;
  }

  .bottom-tips {
    gap: 12px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .bottom-tips .tip-item {
    font-size: 0.75rem;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .section-subtitle {
    font-size: 1rem;
  }

  .features-grid,
  .benefits-grid {
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
  .faq-section,
  .results-showcase {
    margin-top: 40px;
  }
}

/* 结果展示区 */
.results-showcase {
  margin-top: var(--spacing-20);  /* 80px */
}

.benefits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-6);  /* 24px */
  margin-bottom: var(--spacing-12);  /* 48px */
}

.benefit-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);  /* 12px */
  padding: var(--spacing-8) var(--spacing-6);  /* 32px 24px */
  text-align: center;
  transition: all var(--transition-slow);
  border: 2px solid transparent;
}

.benefit-card:hover {
  background: var(--color-primary-50);
  transform: translateY(-4px);
  border-color: var(--color-primary-500);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15);
}

.benefit-number {
  font-size: 3rem;
  margin-bottom: var(--spacing-4);  /* 16px */
  display: block;
}

.benefit-card h3 {
  font-size: var(--font-lg);  /* 18px */
  color: var(--text-primary);
  margin: 0 0 var(--spacing-3) 0;  /* 12px */
  font-weight: var(--font-semibold);  /* 600 */
}

.benefit-card p {
  font-size: var(--font-base);  /* 16px */
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);  /* 1.6 */
  margin: 0;
  text-align: left;
  word-wrap: break-word;
}

.showcase-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  margin-top: 48px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 32px 24px;
  text-align: center;
  border: 2px solid #e5e7eb;
  transition: all 0.3s ease;
}

.stat-card:hover {
  border-color: #409EFF;
  transform: translateY(-2px);
}

.stat-card .stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: #409EFF;
  line-height: 1;
  margin-bottom: 12px;
}

.stat-card .stat-label {
  font-size: 1rem;
  color: #374151;
  font-weight: 600;
  margin-bottom: 8px;
}

.stat-card .stat-desc {
  font-size: 0.875rem;
  color: #6b7280;
}

/* 成功案例 */
.success-stories {
  margin-top: 80px;
  padding: 60px 0;
}

.cases-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 32px;
  margin: 40px 0;
}

.case-card {
  background: white;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.case-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
}

.case-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.case-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}

.case-info {
  flex: 1;
}

.case-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.case-category {
  font-size: 0.875rem;
  color: #6b7280;
}

.case-growth {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  background: #f9fafb;
  border-radius: 12px;
  margin-bottom: 20px;
}

.growth-item {
  text-align: center;
}

.growth-item .label {
  display: block;
  font-size: 0.75rem;
  color: #9ca3af;
  margin-bottom: 8px;
}

.growth-item .number {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  line-height: 1;
  margin-bottom: 4px;
}

.growth-item.highlight .number {
  color: #10b981;
}

.growth-item .unit {
  display: block;
  font-size: 0.875rem;
  color: #6b7280;
}

.growth-arrow {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.arrow-icon {
  font-size: 1.5rem;
  color: #10b981;
  font-weight: bold;
}

.growth-rate {
  font-size: 0.75rem;
  color: #10b981;
  font-weight: 600;
  background: #d1fae5;
  padding: 2px 8px;
  border-radius: 4px;
}

.case-quote {
  font-size: 0.9375rem;
  color: #4b5563;
  line-height: 1.6;
  font-style: italic;
  margin-bottom: 16px;
  padding-left: 16px;
  border-left: 3px solid #e5e7eb;
}

.case-highlights {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.case-highlights .highlight {
  font-size: 0.8125rem;
  color: #059669;
  background: #d1fae5;
  padding: 4px 12px;
  border-radius: 6px;
  font-weight: 500;
}

.overall-stats {
  display: flex;
  justify-content: center;
  gap: 48px;
  margin: 48px 0;
  padding: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  flex-wrap: wrap;
}

.overall-stats .stat {
  text-align: center;
  color: white;
}

.overall-stats .stat-number {
  display: block;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.overall-stats .stat-label {
  display: block;
  font-size: 1rem;
  opacity: 0.9;
}

.cta-section {
  text-align: center;
  padding: 48px 32px;
  background: #f9fafb;
  border-radius: 20px;
  margin-top: 48px;
}

.cta-section h3 {
  font-size: 1.875rem;
  color: #1f2937;
  margin: 0 0 12px 0;
  font-weight: 700;
}

.cta-section p {
  font-size: 1.125rem;
  color: #6b7280;
  margin: 0 0 24px 0;
}

/* 响应式优化 */
@media (max-width: 768px) {
  .results-showcase {
    padding: 40px 24px;
    margin-top: 60px;
  }

  .value-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .value-card {
    padding: 24px 20px;
  }

  .showcase-stats {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .success-stories {
    margin-top: 60px;
    padding: 40px 0;
  }

  .cases-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .case-card {
    padding: 24px;
  }

  .case-growth {
    flex-direction: column;
    gap: 16px;
    padding: 20px;
  }

  .growth-arrow {
    transform: rotate(90deg);
  }

  .overall-stats {
    flex-direction: column;
    gap: 32px;
    padding: 32px 24px;
  }

  .cta-section {
    padding: 32px 24px;
  }

  .cta-section h3 {
    font-size: 1.5rem;
  }
}
</style>
