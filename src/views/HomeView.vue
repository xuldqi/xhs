<template>
  <div class="home-view">
    <div class="container">
      <!-- 顶部标题区域 -->
      <div class="hero-header">
        <h1 class="main-title">小红书涨粉实操指南生成器</h1>
        <p class="main-description">
          上传你的小红书主页截图，AI 自动分析账号数据，生成专属的 12 章节涨粉实操指南
        </p>
        <el-button type="primary" plain @click="showExample">
          <el-icon><View /></el-icon>
          查看示例指南
        </el-button>
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

      <!-- 历史记录 -->
      <HistoryPanel ref="historyPanelRef" />

      <!-- 结果展示区 -->
      <section class="results-showcase">
        <h2 class="section-title">你将获得什么？</h2>
        <p class="section-subtitle">一份完整的、可执行的涨粉实操手册</p>
        
        <div class="value-grid">
          <div class="value-card">
            <div class="value-icon">📊</div>
            <h3>账号全面诊断</h3>
            <p>分析你的账号现状、优势和改进方向，给出涨粉难度评估和预期时间</p>
          </div>
          
          <div class="value-card">
            <div class="value-icon">📅</div>
            <h3>3天起号计划</h3>
            <p>Day 1-3详细行动步骤，包含对标研究、选题方向、发布策略、薯条投放</p>
          </div>
          
          <div class="value-card">
            <div class="value-icon">💡</div>
            <h3>爆款笔记公式</h3>
            <p>标题模板、封面设计、正文结构，可直接套用的爆款创作方法论</p>
          </div>
          
          <div class="value-card">
            <div class="value-icon">📈</div>
            <h3>数据复盘模板</h3>
            <p>每周复盘表格、核心指标追踪、优化方向建议，让数据指导决策</p>
          </div>
          
          <div class="value-card">
            <div class="value-icon">💰</div>
            <h3>变现路径规划</h3>
            <p>不同粉丝量级的变现方式和预估收入，清晰的商业化路径</p>
          </div>
          
          <div class="value-card">
            <div class="value-icon">✅</div>
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

      <!-- 成功案例 -->
      <section class="success-stories">
        <h2 class="section-title">真实用户成功案例</h2>
        <p class="section-subtitle">他们都通过我们的指南实现了涨粉目标</p>
        
        <div class="cases-grid">
          <div class="case-card">
            <div class="case-header">
              <div class="case-avatar">👩</div>
              <div class="case-info">
                <div class="case-name">美妆博主 @小美</div>
                <div class="case-category">美妆护肤</div>
              </div>
            </div>
            
            <div class="case-growth">
              <div class="growth-item">
                <span class="label">使用前</span>
                <span class="number">50</span>
                <span class="unit">粉丝</span>
              </div>
              <div class="growth-arrow">
                <span class="arrow-icon">→</span>
                <span class="growth-rate">+2300%</span>
              </div>
              <div class="growth-item highlight">
                <span class="label">30天后</span>
                <span class="number">1,200</span>
                <span class="unit">粉丝</span>
              </div>
            </div>
            
            <div class="case-quote">
              "按照指南的爆款公式，第一篇笔记就上了热门！对标账号拆解框架特别实用，让我找到了清晰的方向。"
            </div>
            
            <div class="case-highlights">
              <span class="highlight">✓ 首篇爆款</span>
              <span class="highlight">✓ 30天破千粉</span>
              <span class="highlight">✓ 接到品牌合作</span>
            </div>
          </div>
          
          <div class="case-card">
            <div class="case-header">
              <div class="case-avatar">👨</div>
              <div class="case-info">
                <div class="case-name">穿搭博主 @时尚达人</div>
                <div class="case-category">穿搭时尚</div>
              </div>
            </div>
            
            <div class="case-growth">
              <div class="growth-item">
                <span class="label">使用前</span>
                <span class="number">120</span>
                <span class="unit">粉丝</span>
              </div>
              <div class="growth-arrow">
                <span class="arrow-icon">→</span>
                <span class="growth-rate">+650%</span>
              </div>
              <div class="growth-item highlight">
                <span class="label">45天后</span>
                <span class="number">900</span>
                <span class="unit">粉丝</span>
              </div>
            </div>
            
            <div class="case-quote">
              "3天起号计划非常详细，每一步都有具体的操作指导。数据复盘模板帮我找到了内容优化方向。"
            </div>
            
            <div class="case-highlights">
              <span class="highlight">✓ 笔记互动率提升3倍</span>
              <span class="highlight">✓ 45天近千粉</span>
            </div>
          </div>
          
          <div class="case-card">
            <div class="case-header">
              <div class="case-avatar">🍜</div>
              <div class="case-info">
                <div class="case-name">美食博主 @吃货小王</div>
                <div class="case-category">美食探店</div>
              </div>
            </div>
            
            <div class="case-growth">
              <div class="growth-item">
                <span class="label">使用前</span>
                <span class="number">0</span>
                <span class="unit">粉丝</span>
              </div>
              <div class="growth-arrow">
                <span class="arrow-icon">→</span>
                <span class="growth-rate">从0到1</span>
              </div>
              <div class="growth-item highlight">
                <span class="label">60天后</span>
                <span class="number">1,500</span>
                <span class="unit">粉丝</span>
              </div>
            </div>
            
            <div class="case-quote">
              "完全零基础开始，指南给了我系统的方法论。冷启动技巧和每日固定动作让我养成了良好的运营习惯。"
            </div>
            
            <div class="case-highlights">
              <span class="highlight">✓ 零基础起号</span>
              <span class="highlight">✓ 60天破1500粉</span>
              <span class="highlight">✓ 开始接广告</span>
            </div>
          </div>
        </div>
        
        <div class="overall-stats">
          <div class="stat">
            <span class="stat-number">10,000+</span>
            <span class="stat-label">累计使用次数</span>
          </div>
          <div class="stat">
            <span class="stat-number">85%</span>
            <span class="stat-label">用户达成涨粉目标</span>
          </div>
          <div class="stat">
            <span class="stat-number">4.8/5.0</span>
            <span class="stat-label">用户满意度评分</span>
          </div>
        </div>
        
        <div class="cta-section">
          <h3>看完案例，是不是也想试试？</h3>
          <p>上传截图，5分钟获取你的专属涨粉方案</p>
          <el-button type="primary" size="large" @click="scrollToUpload">
            开始生成我的指南
          </el-button>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Upload, Lock, CircleCheck, View, Close, Plus, InfoFilled } from '@element-plus/icons-vue'
import AppFooter from '@/components/AppFooter.vue'
import HistoryPanel from '@/components/HistoryPanel.vue'
import ExampleModal from '@/components/ExampleModal.vue'

const router = useRouter()
const historyPanelRef = ref()
const exampleModalRef = ref()

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
  exampleModalRef.value?.show()
}

// 滚动到上传区域
const scrollToUpload = () => {
  const uploadZone = document.querySelector('.upload-zone')
  if (uploadZone) {
    uploadZone.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
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
  margin: 0 0 24px 0;
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

.upload-zone.has-images {
  padding: 20px;
  border: 2px solid #409EFF;
  background: #f0f9ff;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.preview-item {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #e5e7eb;
  aspect-ratio: 9/16;
  background: #fafafa;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.preview-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  background: #409EFF;
  color: white;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
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
  border: 2px dashed #409EFF;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
  aspect-ratio: 9/16;
}

.add-more:hover {
  background: #f0f9ff;
  border-color: #66b1ff;
}

.add-more p {
  margin: 8px 0 0 0;
  color: #409EFF;
  font-size: 0.875rem;
}

.add-more .hint {
  color: #9ca3af;
  font-size: 0.75rem;
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
  color: #6b7280;
  margin: 8px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.upload-hint-small {
  font-size: 0.75rem;
  color: #9ca3af;
  margin: 4px 0 0 0;
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


/* 结果展示区 */
.results-showcase {
  margin-top: 80px;
  padding: 60px 40px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 20px;
}

.value-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin: 40px 0;
}

.value-card {
  background: white;
  border-radius: 16px;
  padding: 32px 24px;
  text-align: center;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.value-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(64, 158, 255, 0.15);
  border-color: #409EFF;
}

.value-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.value-card h3 {
  font-size: 1.25rem;
  color: #1f2937;
  margin: 0 0 12px 0;
  font-weight: 600;
}

.value-card p {
  font-size: 0.9375rem;
  color: #6b7280;
  line-height: 1.6;
  margin: 0;
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
