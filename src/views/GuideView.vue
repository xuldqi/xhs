<template>
  <div class="guide-view">
    <Breadcrumb />
    <div class="guide-container">
      <!-- 生成中 -->
      <div v-if="isGenerating" class="generating-section">
        <div class="generating-header">
          <img src="/favicon.svg" alt="小红书学院" class="logo-pulse" />
          <h2>小红书学院正在为您生成专属涨粉指南...</h2>
        </div>
        
        <div class="progress-info">
          <div class="current-section">
            <span class="section-number">{{ currentSection }}</span>
            <span class="divider">/</span>
            <span class="total-sections">12</span>
          </div>
          <p class="section-name">
            <el-icon class="pulse"><Document /></el-icon>
            {{ currentSection === 0 ? '正在准备...' : SECTION_TITLES[currentSection - 1] }}
          </p>
          <p class="estimated-time">
            预计剩余时间：{{ estimatedTime }}
          </p>
        </div>
        
        <el-progress
          :percentage="generationProgress"
          :stroke-width="16"
          :color="progressColor"
          :show-text="false"
        />
        
        <div class="progress-percentage">{{ generationProgress }}%</div>
        
        <div class="tips">
          <div class="tip-item">
            <el-icon color="#67C23A"><CircleCheck /></el-icon>
            <span>AI 正在分析您的账号特点</span>
          </div>
          <div class="tip-item">
            <el-icon color="#67C23A"><CircleCheck /></el-icon>
            <span>生成个性化的涨粉策略</span>
          </div>
          <div class="tip-item">
            <el-icon color="#409EFF"><Clock /></el-icon>
            <span>预计需要 3-5 分钟，请耐心等待</span>
          </div>
        </div>
        
        <!-- 已完成的章节列表 -->
        <div v-if="currentSection > 0" class="completed-sections">
          <h4>已生成章节</h4>
          <div class="section-list">
            <div
              v-for="i in currentSection"
              :key="i"
              class="completed-item"
            >
              <el-icon color="#67C23A"><SuccessFilled /></el-icon>
              <span>{{ i }}. {{ SECTION_TITLES[i - 1] }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 运营技巧轮播 - 放在大框外面 -->
      <TipsCarousel v-if="isGenerating" />
      
      <!-- 生成完成 -->
      <div v-else-if="guideContent" class="content-section">
        <div class="header">
          <h1>{{ guideContent.metadata.accountName }} 的涨粉实操指南</h1>
          <p class="meta-info">
            生成时间：{{ formatDate(guideContent.metadata.generatedAt) }} |
            目标粉丝：{{ guideContent.metadata.targetFollowers }}
          </p>
          
          <div class="action-bar">
            <el-button type="primary" size="large" @click="handleExportHTML">
              <el-icon><Download /></el-icon>
              导出 HTML
            </el-button>
            <el-button size="large" @click="handleExportPDF">
              <el-icon><Document /></el-icon>
              导出 PDF
            </el-button>
            <el-button v-if="isLoggedIn" size="large" @click="handleSaveAndShare" :loading="saving">
              <el-icon><Share /></el-icon>
              {{ shareId ? '复制分享链接' : '保存并分享' }}
            </el-button>
            <el-button size="large" @click="handleRegenerate">
              <el-icon><Refresh /></el-icon>
              重新生成
            </el-button>
          </div>
        </div>
        
        <!-- 格式选择器 -->
        <FormatSelector
          :current-format="documentFormat"
          @format-change="handleFormatChange"
        />
        
        <!-- 卡片格式 -->
        <div v-if="documentFormat === 'card'" class="card-format">
          <!-- 章节卡片网格 -->
          <div class="cards-grid" :class="{ 'has-paywall': shouldShowPaywall }">
            <div 
              v-for="section in limitedGuideContent.sections" 
              :key="section.id"
              class="chapter-card"
              :class="{ 'expanded': expandedCard === section.id }"
              @click="toggleCard(section.id)"
            >
              <!-- 卡片头部 -->
              <div class="card-header">
                <div class="card-number">{{ String(section.id).padStart(2, '0') }}</div>
                <div class="card-title-wrap">
                  <h3 class="card-title">{{ section.title }}</h3>
                  <span class="card-meta">{{ getContentLength(section.content) }} 字</span>
                </div>
                <div class="card-arrow" :class="{ 'rotated': expandedCard === section.id }">
                  <el-icon><ArrowDown /></el-icon>
                </div>
            </div>
            
              <!-- 卡片预览 -->
              <div v-if="expandedCard !== section.id" class="card-preview">
                {{ getPreviewText(section.content) }}
            </div>
            
              <!-- 展开的内容 -->
              <transition name="expand">
                <div v-if="expandedCard === section.id" class="card-content" @click.stop>
                  <div v-html="formatContent(section.content)" class="content-body"></div>
            </div>
              </transition>
              
              <!-- 卡片装饰 -->
              <div class="card-decoration"></div>
                    </div>
            </div>
            
            <!-- 付费墙遮罩 -->
            <div v-if="shouldShowPaywall" class="paywall-overlay">
              <div class="paywall-content">
                <div class="paywall-icon">🔒</div>
                <h3>解锁完整涨粉秘籍</h3>
                <p class="paywall-desc">升级到基础会员及以上，查看完整的12章节涨粉指南</p>
                <ul class="paywall-features">
                  <li>✅ 完整12章节涨粉策略</li>
                  <li>✅ 详细操作步骤指导</li>
                  <li>✅ 实战案例分析</li>
                  <li>✅ 数据分析技巧</li>
                </ul>
                <el-button type="primary" size="large" @click="handleUpgrade">
                  立即升级 ¥29.9
                </el-button>
            </div>
          </div>
        </div>
        
        <!-- 专业文档格式 -->
        <div v-else-if="documentFormat === 'professional'" class="professional-container" :class="{ 'has-paywall': shouldShowPaywall }">
          <ProfessionalDocument
            :account-data="professionalAccountData"
            :content="allSectionsContent"
            :sections="limitedGuideContent.sections"
          />
          
          <!-- 付费墙遮罩 -->
          <div v-if="shouldShowPaywall" class="paywall-overlay">
            <div class="paywall-content">
              <div class="paywall-icon">🔒</div>
              <h3>解锁完整涨粉秘籍</h3>
              <p class="paywall-desc">升级到基础会员及以上，查看完整的12章节涨粉指南</p>
              <ul class="paywall-features">
                <li>✅ 完整12章节涨粉策略</li>
                <li>✅ 详细操作步骤指导</li>
                <li>✅ 实战案例分析</li>
                <li>✅ 数据分析技巧</li>
              </ul>
              <el-button type="primary" size="large" @click="handleUpgrade">
                立即升级 ¥29.9
              </el-button>
            </div>
          </div>
        </div>
        
        <!-- 新版报告格式 -->
        <div v-else class="report-container" :class="{ 'has-paywall': shouldShowPaywall }">
          <ReportLayout
            :account-name="guideContent.metadata.accountName"
            :generated-date="formatDate(guideContent.metadata.generatedAt)"
            :target-followers="guideContent.metadata.targetFollowers"
            :current-followers="String(accountData.followers || 0)"
            :total-notes="String(accountData.notes || 0)"
            :category="accountData.category || '未分类'"
            :sections="limitedGuideContent.sections"
            @section-change="handleSectionChange"
          />
          
          <!-- 付费墙遮罩 -->
          <div v-if="shouldShowPaywall" class="paywall-overlay report-paywall">
            <div class="paywall-content">
              <div class="paywall-icon">🔒</div>
              <h3>解锁完整涨粉秘籍</h3>
              <p class="paywall-desc">升级会员查看完整的12章节涨粉指南</p>
              <el-button type="primary" size="large" @click="handleUpgrade">
                立即升级
              </el-button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 生成失败 -->
      <div v-else class="error-section">
        <el-result
          icon="error"
          title="指南生成失败"
          sub-title="AI 生成过程中出现错误，请检查网络连接或稍后重试"
        >
          <template #extra>
            <div class="error-actions">
              <el-button type="primary" size="large" @click="handleRegenerate">
                <el-icon><Refresh /></el-icon>
                重新生成
              </el-button>
              <el-button size="large" @click="goBack">
                <el-icon><Back /></el-icon>
                返回修改信息
              </el-button>
            </div>
            
            <div class="error-tips">
              <h4>💡 可能的原因：</h4>
              <ul>
                <li>网络连接不稳定</li>
                <li>AI 服务暂时繁忙</li>
                <li>API 配置问题</li>
              </ul>
              <p>如果问题持续，请联系技术支持。</p>
            </div>
          </template>
        </el-result>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Download, Refresh, Loading, Document, CircleCheck, Clock, SuccessFilled, Share, Back, ArrowDown } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { SECTION_TITLES } from '@/types'
import type { GuideContent } from '@/types'
import Breadcrumb from '@/components/Breadcrumb.vue'
import TipsCarousel from '@/components/TipsCarousel.vue'
import FormatSelector from '@/components/guide/FormatSelector.vue'
import ProfessionalDocument from '@/components/guide/ProfessionalDocument.vue'
import ReportLayout from '@/components/ReportLayout.vue'
import '@/styles/guide-content.css'
import '@/styles/professional-document.css'
import { formatContent, stripHtmlTags } from '@/utils/contentFormatter'
import type { AccountData } from '@/types'
import { exportToPDF, prepareElementForExport } from '@/utils/pdfExporter'
import { saveGuide, generateShareLink } from '@/services/guideService'
import { useUserStore } from '@/stores/userStore'
import { HistoryManager } from '@/utils/historyManager'
import type { DocumentFormat } from '@/types/models'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 状态
const isGenerating = ref(true)
const currentSection = ref(0)
const generationProgress = ref(0)
const guideContent = ref<GuideContent | null>(null)
const activeNames = ref<number[]>([1]) // 默认展开第一个章节
const expandedCard = ref<number | null>(null) // 卡片展开状态
const startTime = ref<number>(0)
const saving = ref(false)
const shareId = ref('')
const documentFormat = ref<DocumentFormat>('report')
const accountData = ref({
  username: '',
  followers: 0,
  notes: 0,
  category: ''
})

// 计算属性
const isLoggedIn = computed(() => userStore.isLoggedIn)

// 权限检查 - 基础会员及以上可以查看完整内容
const canViewFullContent = computed(() => {
  const planType = userStore.user?.planType
  return planType === 'basic' || planType === 'pro' || planType === 'lifetime'
})

// 是否显示付费墙
const shouldShowPaywall = computed(() => {
  return guideContent.value && !canViewFullContent.value
})

// 限制内容（只显示一半章节）
const limitedGuideContent = computed(() => {
  if (!guideContent.value || canViewFullContent.value) {
    return guideContent.value
  }
  
  // 只显示前6个章节（一半内容）
  const sections = guideContent.value.sections || []
  const limitedSections = sections.slice(0, Math.ceil(sections.length / 2))
  
  return {
    ...guideContent.value,
    sections: limitedSections
  }
})

// 进度条颜色
const progressColor = computed(() => {
  if (generationProgress.value < 30) return '#409EFF'
  if (generationProgress.value < 70) return '#67C23A'
  return '#E6A23C'
})

// 专业文档所需的账号数据
const professionalAccountData = computed<AccountData>(() => {
  // 优先从 guideContent.metadata 获取，因为这是生成时保存的完整数据
  const metadata = guideContent.value?.metadata
  
  return {
    username: metadata?.accountName || accountData.value.username || '未知账号',
    followerCount: metadata?.accountData?.followerCount || accountData.value.followers || 0,
    postCount: metadata?.accountData?.postCount || accountData.value.notes || 0,
    contentCategory: metadata?.accountData?.contentCategory || accountData.value.category || '未分类'
  }
})

// 合并所有章节内容
const allSectionsContent = computed(() => {
  if (!guideContent.value) return ''
  return guideContent.value.sections.map(s => s.content).join('\n\n')
})

// 预计剩余时间
const estimatedTime = computed(() => {
  if (currentSection.value === 0) return '计算中...'
  if (currentSection.value >= 12) return '即将完成'
  
  const elapsed = Date.now() - startTime.value
  const avgTimePerSection = elapsed / currentSection.value
  const remainingSections = 12 - currentSection.value
  const remainingMs = avgTimePerSection * remainingSections
  
  const seconds = Math.ceil(remainingMs / 1000)
  if (seconds < 60) return `${seconds} 秒`
  const minutes = Math.ceil(seconds / 60)
  return `${minutes} 分钟`
})

// 开始生成
onMounted(async () => {
  const { useAppStore } = await import('@/stores/appStore')
  const store = useAppStore()
  
  // 加载格式偏好
  loadFormatPreference()
  
  // 检查是否是从历史记录进入
  const historyId = route.params.historyId as string
  if (historyId) {
    // 加载历史记录
    try {
      const fullRecord = HistoryManager.getFullRecord(historyId)
      if (fullRecord) {
        guideContent.value = fullRecord.guideContent
        isGenerating.value = false
        ElMessage.success('已加载历史记录')
        return
      } else {
        ElMessage.error('历史记录不存在或已损坏')
        router.push('/analysis')
        return
      }
    } catch (error) {
      console.error('加载历史记录失败:', error)
      ElMessage.error('加载历史记录失败')
      router.push('/analysis')
      return
    }
  }
  
  if (!store.accountData) {
    router.push('/analysis')
    return
  }
  
  // 检查是否有已完成的指南
  if (store.guideContent) {
    // 有已完成的指南,询问用户是继续查看还是重新生成
    ElMessageBox.confirm(
      '检测到已有生成的指南,是否要重新生成?',
      '提示',
      {
        confirmButtonText: '重新生成',
        cancelButtonText: '查看旧指南',
        type: 'info',
        distinguishCancelAndClose: true
      }
    ).then(async () => {
      // 用户选择重新生成
      store.setGuideContent(null)
      await generateGuide()
    }).catch((action) => {
      if (action === 'cancel') {
        // 用户选择查看旧指南
        guideContent.value = store.guideContent
        isGenerating.value = false
      } else {
        // 用户关闭对话框,返回上一页
        router.push('/analysis')
      }
    })
  } else {
    // 没有旧指南,直接生成新的
    await generateGuide()
  }
})

// 生成指南
const generateGuide = async () => {
  try {
    isGenerating.value = true
    currentSection.value = 0
    generationProgress.value = 0
    startTime.value = Date.now()
    
    const { useAppStore } = await import('@/stores/appStore')
    const store = useAppStore()
    
    if (!store.accountData) return
    
    // 保存账号数据用于专业文档格式
    accountData.value = {
      username: store.accountData.username,
      followers: store.accountData.followerCount || 0,
      notes: store.accountData.postCount || 0,
      category: store.accountData.contentCategory || '未分类'
    }
    
    // 使用 guideGenerator 服务
    const { generateGuide: generateGuideContent } = await import('@/services/guideGenerator')
    
    // 生成指南，带进度回调
    const content = await generateGuideContent(
      store.accountData,
      (current, total) => {
        currentSection.value = current
        generationProgress.value = Math.floor((current / total) * 100)
      }
    )
    
    // 生成完成
    guideContent.value = content
    
    store.setGuideContent(guideContent.value)
    generationProgress.value = 100
    currentSection.value = 12
    
    // 保存完整的历史记录
    try {
      HistoryManager.saveFullRecord({
        accountName: store.accountData.username,
        followers: store.accountData.followerCount,
        notes: store.accountData.postCount,
        category: store.accountData.contentCategory,
        guideContent: content,
        accountData: store.accountData
      })
      console.log('完整历史记录已保存')
    } catch (error) {
      console.error('保存完整历史记录失败:', error)
    }
    
    // 显示成功提示
    const { ElMessage } = await import('element-plus')
    ElMessage.success({
      message: '指南生成成功！',
      duration: 2000
    })
    
    setTimeout(() => {
      isGenerating.value = false
    }, 800)
    
  } catch (error) {
    console.error('生成失败:', error)
    isGenerating.value = false
    guideContent.value = null
    
    // 显示错误提示
    const { ElMessage } = await import('element-plus')
    
    // 分类错误并提供具体的错误消息
    let errorMessage = 'AI 生成失败'
    
    if (error instanceof Error) {
      const msg = error.message.toLowerCase()
      
      if (msg.includes('network') || msg.includes('fetch') || msg.includes('econnrefused')) {
        errorMessage = '网络连接失败，请检查网络后重试'
      } else if (msg.includes('timeout')) {
        errorMessage = '请求超时，请稍后重试'
      } else if (msg.includes('配置') || msg.includes('api key') || msg.includes('configured')) {
        errorMessage = 'AI 服务未配置，请联系管理员配置 API 密钥'
      } else if (msg.includes('503') || msg.includes('overload') || msg.includes('繁忙')) {
        errorMessage = 'AI 服务繁忙，请稍后重试'
      } else if (msg.includes('429') || msg.includes('rate limit')) {
        errorMessage = 'API 调用频率超限，请稍后重试'
      } else if (msg.includes('parse') || msg.includes('json')) {
        errorMessage = 'AI 返回格式错误，请重试'
      } else {
        errorMessage = error.message || 'AI 生成失败，请重试'
      }
    }
    
    ElMessage.error({
      message: errorMessage,
      duration: 6000,
      showClose: true
    })
  }
}

// 生成模拟内容
const generateMockContent = (id: number, title: string, accountData: any): string => {
  return `
    <h3>基于您的账号情况分析</h3>
    <p>账号名称：<strong>${accountData.username}</strong></p>
    <p>当前粉丝：<strong>${accountData.followerCount}</strong></p>
    <p>内容类别：<strong>${accountData.contentCategory}</strong></p>
    
    <h3>核心建议</h3>
    <ul>
      <li>建议1：根据您的${accountData.contentCategory}类别，重点关注...</li>
      <li>建议2：当前粉丝基础较低，建议采用冷启动策略...</li>
      <li>建议3：每周发布3-5篇高质量内容...</li>
    </ul>
    
    <p><em>注：这是演示内容。实际使用时会调用 AI 生成专业的指南内容。</em></p>
  `
}

// 使用导入的 formatContent 函数

// 格式化日期
const formatDate = (date: Date): string => {
  return new Date(date).toLocaleString('zh-CN')
}



// 获取内容长度
const getContentLength = (content: string): number => {
  // 移除 HTML 标签后计算长度
  const text = content.replace(/<[^>]*>/g, '')
  return text.length
}

// 格式切换
const handleFormatChange = (format: DocumentFormat) => {
  documentFormat.value = format
  // 保存到 localStorage
  localStorage.setItem('preferredFormat', format)
}

// 加载格式偏好
const loadFormatPreference = () => {
  const saved = localStorage.getItem('preferredFormat')
  if (saved && (saved === 'card' || saved === 'professional')) {
    documentFormat.value = saved as DocumentFormat
  }
}

// 导出 PDF
const handleExport = async () => {
  if (!guideContent.value) return
  
  try {
    console.log('📄 开始导出 PDF...')
    
    // 动态导入 jsPDF
    const jsPDF = (await import('jspdf')).default
    
    // 创建 PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })
    
    let yPosition = 20
    const pageWidth = 210
    const pageHeight = 297
    const margin = 20
    const contentWidth = pageWidth - 2 * margin
    
    // 添加标题
    pdf.setFontSize(20)
    pdf.text(`${guideContent.value.metadata.accountName} 的涨粉实操指南`, margin, yPosition)
    yPosition += 10
    
    pdf.setFontSize(10)
    pdf.text(`生成时间：${formatDate(guideContent.value.metadata.generatedAt)}`, margin, yPosition)
    pdf.text(`目标粉丝：${guideContent.value.metadata.targetFollowers}`, margin + 80, yPosition)
    yPosition += 15
    
    // 遍历所有章节
    for (const section of guideContent.value.sections) {
      // 检查是否需要新页面
      if (yPosition > pageHeight - 40) {
        pdf.addPage()
        yPosition = 20
      }
      
      // 章节标题
      pdf.setFontSize(14)
      pdf.setFont(undefined, 'bold')
      pdf.text(`${section.id}. ${section.title}`, margin, yPosition)
      yPosition += 8
      
      // 章节内容 - 移除 HTML 标签
      pdf.setFontSize(10)
      pdf.setFont(undefined, 'normal')
      
      const cleanContent = stripHtmlTags(section.content)
      
      // 分段处理
      const paragraphs = cleanContent.split('\n').filter(p => p.trim())
      
      for (const paragraph of paragraphs) {
        // 自动换行
        const lines = pdf.splitTextToSize(paragraph, contentWidth)
        
        for (const line of lines) {
          if (yPosition > pageHeight - 20) {
            pdf.addPage()
            yPosition = 20
          }
          pdf.text(line, margin, yPosition)
          yPosition += 6
        }
        
        yPosition += 3 // 段落间距
      }
      
      yPosition += 5 // 章节间距
    }
    
    // 生成文件名
    const filename = `小红书涨粉指南_${guideContent.value.metadata.accountName}_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.pdf`
    
    // 下载
    pdf.save(filename)
    console.log('✅ PDF 导出成功:', filename)
    
  } catch (error) {
    console.error('❌ PDF 导出失败:', error)
    alert('PDF 导出失败，请重试')
  }
}

// 导出 HTML
const handleExportHTML = () => {
  if (!guideContent.value) return
  
  // 根据当前格式选择导出内容
  let htmlContent = ''
  
  if (documentFormat.value === 'professional') {
    // 专业格式：直接获取 professional-document 的 HTML
    const professionalDoc = document.querySelector('.professional-document')
    if (professionalDoc) {
      htmlContent = professionalDoc.innerHTML
    }
  } else {
    // 卡片格式：使用原有的章节拼接方式
    htmlContent = guideContent.value.sections.map(section => `
      <h2>${section.id}. ${section.title}</h2>
      <div>${formatContent(section.content)}</div>
    `).join('')
  }
  
  const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${guideContent.value.metadata.accountName} 的涨粉实操指南</title>
  <style>
    * { 
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body { 
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 40px 20px;
    }
    
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }
    
    h1 { 
      font-size: 32px;
      color: #1a1a1a;
      margin-bottom: 12px;
      text-align: center;
      border-bottom: 3px solid #667eea;
      padding-bottom: 20px;
    }
    
    .meta { 
      text-align: center;
      color: #666;
      margin-bottom: 40px;
      font-size: 14px;
    }
    
    h2 { 
      font-size: 24px;
      color: #333;
      margin: 40px 0 20px 0;
      padding: 12px 0 12px 16px;
      border-left: 4px solid #667eea;
      font-weight: 600;
    }
    
    h3 { 
      color: #333;
      margin-top: 1.5rem;
      font-weight: 600;
    }
    
    /* 彩色卡片样式 */
    .content-block {
      background: #f8f9fa;
      border-left: 4px solid #409EFF;
      border-radius: 8px;
      padding: 20px 24px;
      margin: 16px 0;
      transition: all 0.3s ease;
    }
    
    .content-block:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }
    
    /* 成功类型 - 绿色渐变 */
    .success-block {
      background: linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%);
      border-left-color: #52c41a;
    }
    
    /* 警告类型 - 橙色渐变 */
    .warning-block {
      background: linear-gradient(135deg, #fff7e6 0%, #fffbf0 100%);
      border-left-color: #faad14;
    }
    
    /* 提示类型 - 蓝色渐变 */
    .info-block {
      background: linear-gradient(135deg, #e6f7ff 0%, #f0f9ff 100%);
      border-left-color: #1890ff;
    }
    
    /* 紫色类型 - 紫色渐变 */
    .purple-block {
      background: linear-gradient(135deg, #f9f0ff 0%, #efdbff 100%);
      border-left-color: #722ed1;
    }
    
    /* 橙色类型 - 橙色渐变 */
    .orange-block {
      background: linear-gradient(135deg, #fff7e6 0%, #ffe7ba 100%);
      border-left-color: #fa8c16;
    }
    
    /* 粉色类型 - 粉色渐变 */
    .pink-block {
      background: linear-gradient(135deg, #fff0f6 0%, #ffd6e7 100%);
      border-left-color: #eb2f96;
    }
    
    /* 默认类型 */
    .default-block {
      background: #f8f9fa;
      border-left-color: #d9d9d9;
    }
    
    /* 块头部 */
    .block-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }
    
    .block-icon {
      font-size: 1.4rem;
      line-height: 1;
    }
    
    .block-title {
      font-size: 1.05rem;
      font-weight: 600;
      color: #333;
      flex: 1;
    }
    
    /* 块内容 */
    .block-content {
      color: #666;
      line-height: 1.8;
      font-size: 15px;
    }
    
    .block-content ul {
      margin: 8px 0;
      padding-left: 24px;
      list-style-type: disc;
    }
    
    .block-content li {
      color: #666;
      line-height: 1.8;
      margin: 6px 0;
      font-size: 15px;
    }
    
    .block-content p {
      margin: 8px 0;
      line-height: 1.8;
    }
    
    /* 小标题 */
    .block-subtitle {
      font-size: 1.05rem;
      font-weight: 600;
      color: #333;
      margin: 16px 0 10px 0;
      line-height: 1.5;
    }
    
    /* 其他样式 */
    ul {
      padding-left: 24px;
      margin: 12px 0;
      list-style-type: disc;
    }
    
    li {
      color: #666;
      line-height: 1.8;
      margin: 8px 0;
    }
    
    strong {
      color: #409EFF;
      font-weight: 600;
    }
    
    /* 表格样式 - 淡色设计 */
    .content-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      margin: 1.5rem 0;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      border: 1px solid #e8e8e8;
    }
    
    .content-table th,
    .content-table td {
      padding: 16px 20px;
      text-align: left;
      border: none;
    }
    
    .content-table thead {
      position: relative;
    }
    
    .content-table th {
      background: linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%);
      font-weight: 600;
      color: #2c3e50;
      font-size: 0.95rem;
      letter-spacing: 0.3px;
      position: relative;
      border-bottom: 2px solid #d0e0ff;
    }
    
    .content-table th:first-child {
      border-top-left-radius: 12px;
    }
    
    .content-table th:last-child {
      border-top-right-radius: 12px;
    }
    
    .content-table tbody tr {
      transition: all 0.3s ease;
      border-bottom: 1px solid #f0f0f0;
    }
    
    .content-table tbody tr:last-child {
      border-bottom: none;
    }
    
    .content-table tbody tr:nth-child(odd) {
      background: linear-gradient(90deg, #fafbfc 0%, #ffffff 100%);
    }
    
    .content-table tbody tr:nth-child(even) {
      background: white;
    }
    
    .content-table tbody tr:hover {
      background: linear-gradient(90deg, #f5f8ff 0%, #f0f7ff 100%);
      transform: scale(1.005);
      box-shadow: 0 2px 8px rgba(90, 123, 166, 0.12);
    }
    
    .content-table td {
      color: #333;
      font-size: 0.9rem;
      line-height: 1.6;
    }
    
    .content-table td:first-child {
      font-weight: 600;
      color: #5a7ba6;
    }
    
    /* 标签样式 - 精致设计 */
    .tag-badge {
      display: inline-block;
      padding: 4px 12px;
      background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
      color: #e65100;
      border-radius: 6px;
      font-size: 0.85em;
      margin: 0 6px;
      font-weight: 600;
      border: 1px solid #ffb74d;
      box-shadow: 0 2px 4px rgba(230, 81, 0, 0.1);
      transition: all 0.2s ease;
    }
    
    .tag-badge:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(230, 81, 0, 0.2);
    }
    
    .time-badge {
      display: inline-block;
      padding: 5px 14px;
      background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
      color: #1b5e20;
      border-radius: 6px;
      font-size: 0.9em;
      margin: 4px;
      font-weight: 600;
      border: 1px solid #81c784;
      box-shadow: 0 2px 4px rgba(27, 94, 32, 0.1);
      transition: all 0.2s ease;
    }
    
    .time-badge:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(27, 94, 32, 0.2);
    }
    
    /* 打印优化 */
    @media print { 
      body {
        background: white;
        padding: 0;
      }
      .container {
        box-shadow: none;
        padding: 20px;
      }
      .content-block:hover {
        box-shadow: none;
        transform: none;
      }
    }
    
    /* 专业文档格式样式 */
    .doc-h1 {
      font-size: 28px;
      font-weight: 700;
      margin: 40px 0 20px;
      color: #000000;
      border-bottom: 3px solid #ff2442;
      padding-bottom: 10px;
      text-align: left;
    }
    
    .doc-h2 {
      font-size: 22px;
      font-weight: 600;
      margin: 30px 0 15px;
      color: #1a1a1a;
      text-align: left;
    }
    
    .doc-h3 {
      font-size: 18px;
      font-weight: 600;
      margin: 20px 0 10px;
      color: #333333;
      text-align: left;
    }
    
    .doc-paragraph {
      margin: 12px 0;
      text-align: justify;
      font-size: 15px;
      line-height: 1.8;
    }
    
    .doc-metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin: 30px 0;
    }
    
    .doc-metric-card {
      background: #ffffff;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 20px;
      text-align: left;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }
    
    .doc-metric-label {
      font-size: 14px;
      color: #666;
      margin-bottom: 8px;
      text-align: left;
    }
    
    .doc-metric-value {
      font-size: 32px;
      font-weight: 700;
      color: #ff2442;
      margin-bottom: 8px;
      text-align: left;
    }
    
    .doc-metric-desc {
      font-size: 12px;
      color: #999;
      text-align: left;
    }
    
    .doc-table {
      width: 100%;
      border-collapse: collapse;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      font-size: 14px;
      margin: 24px 0;
    }
    
    .doc-table th {
      background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
      padding: 12px 16px;
      text-align: left;
      font-weight: 600;
      border: 1px solid #d0d0d0;
      color: #333;
    }
    
    .doc-table td {
      padding: 10px 16px;
      border: 1px solid #e0e0e0;
      color: #555;
    }
    
    .doc-table tr:nth-child(even) {
      background: #fafafa;
    }
    
    .doc-info-card {
      background: #ffffff;
      border-radius: 8px;
      padding: 24px;
      margin: 20px 0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      border-left: 4px solid #3b82f6;
    }
    
    .doc-card-title {
      font-size: 18px;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .doc-list {
      margin: 16px 0;
      padding-left: 2em;
      text-align: left;
    }
    
    .doc-list-item {
      margin: 8px 0;
      line-height: 1.6;
      text-align: left;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${guideContent.value.metadata.accountName} 的涨粉实操指南</h1>
    <div class="meta">
      生成时间：${formatDate(guideContent.value.metadata.generatedAt)} | 
      目标粉丝：${guideContent.value.metadata.targetFollowers}
    </div>
    ${htmlContent}
  </div>
</body>
</html>
  `
  
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `小红书涨粉指南_${guideContent.value.metadata.accountName}_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.html`
  a.click()
  URL.revokeObjectURL(url)
  
  console.log('✅ HTML 导出成功')
}

// 导出 PDF（新方法）
const handleExportPDF = async () => {
  if (!guideContent.value) return
  
  try {
    ElMessage.info('正在生成 PDF，请稍候...')
    
    // 根据当前格式选择正确的元素
    let targetElement: HTMLElement | null = null
    
    if (documentFormat.value === 'professional') {
      // 专业格式：查找 professional-document 元素
      targetElement = document.querySelector('.professional-document') as HTMLElement
    } else {
      // 卡片格式：查找 content-section 元素
      targetElement = document.querySelector('.content-section') as HTMLElement
    }
    
    if (!targetElement) {
      throw new Error('找不到内容区域')
    }
    
    // 准备导出（展开所有折叠面板）
    const restore = prepareElementForExport(targetElement)
    
    // 等待DOM更新
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 导出PDF
    await exportToPDF(targetElement, {
      filename: `小红书涨粉指南_${guideContent.value.metadata.accountName}.pdf`
    })
    
    // 恢复原始状态
    restore()
    
    ElMessage.success('PDF 导出成功！')
  } catch (error) {
    console.error('PDF 导出失败:', error)
    ElMessage.error('PDF 导出失败，请重试')
  }
}

// 保存并分享
const handleSaveAndShare = async () => {
  if (!guideContent.value) return
  
  // 如果已经有分享链接，直接复制
  if (shareId.value) {
    const shareLink = generateShareLink(shareId.value)
    try {
      await navigator.clipboard.writeText(shareLink)
      ElMessage.success('分享链接已复制到剪贴板！')
    } catch (error) {
      // 降级方案：显示链接让用户手动复制
      ElMessageBox.alert(shareLink, '分享链接', {
        confirmButtonText: '关闭',
        callback: () => {}
      })
    }
    return
  }
  
  // 保存到云端
  saving.value = true
  
  try {
    const { useAppStore } = await import('@/stores/appStore')
    const store = useAppStore()
    
    const result = await saveGuide(store.accountData, guideContent.value)
    
    if (result.success && result.shareId) {
      shareId.value = result.shareId
      const shareLink = generateShareLink(result.shareId)
      
      // 复制到剪贴板
      try {
        await navigator.clipboard.writeText(shareLink)
        ElMessage.success({
          message: '保存成功！分享链接已复制到剪贴板',
          duration: 3000
        })
      } catch (error) {
        // 降级方案
        ElMessageBox.alert(shareLink, '分享链接', {
          confirmButtonText: '关闭',
          callback: () => {}
        })
      }
    } else {
      ElMessage.error(result.error || '保存失败')
    }
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败，请重试')
  } finally {
    saving.value = false
  }
}

// 重新生成
const handleRegenerate = () => {
  generateGuide()
}

// 返回
const goBack = () => {
  router.push('/analysis')
}

// 升级会员
const handleUpgrade = () => {
  router.push('/pricing')
}

const handleSectionChange = (sectionId: number) => {
  console.log('Section changed:', sectionId)
}

// 切换卡片展开状态
const toggleCard = (id: number) => {
  expandedCard.value = expandedCard.value === id ? null : id
}

// 获取预览文本
const getPreviewText = (content: string) => {
  const text = stripHtmlTags(content)
  return text.slice(0, 80) + (text.length > 80 ? '...' : '')
}
</script>

<style scoped>
.guide-view {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 20px;
}

.guide-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* 生成中样式 */
.generating-section {
  background: white;
  border-radius: 20px;
  padding: 60px 40px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.generating-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 2rem;
}

.logo-pulse {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.9;
  }
}

.generating-section h2 {
  font-size: 1.5rem;
  color: #333;
  margin: 0;
}

.progress-info {
  margin: 2rem 0;
}

.current-section {
  font-size: 1.2rem;
  color: #333;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.section-name {
  font-size: 1rem;
  color: #666;
}

.tips {
  margin-top: 2rem;
  color: #909399;
}

/* 内容样式 */
.content-section {
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.header {
  text-align: center;
  padding-bottom: 2rem;
  border-bottom: 2px solid #e4e7ed;
  margin-bottom: 2rem;
}

.header h1 {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 1rem;
}

.meta-info {
  color: #909399;
  margin-bottom: 1.5rem;
}

.action-bar {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  max-width: 400px;
  margin: 0 auto;
}

.action-bar .el-button {
  width: 100%;
}

/* 导言说明 */
/* ========== 新版卡片格式 ========== */
.card-format {
  padding: 0;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  position: relative;
}

@media (max-width: 900px) {
  .cards-grid {
    grid-template-columns: 1fr;
  }
}

.chapter-card {
  position: relative;
  background: #ffffff;
  border-radius: 24px;
  padding: 0;
  border: none;
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.04),
    0 8px 32px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

/* 每张卡片不同的顶部渐变色 */
.chapter-card:nth-child(1)::before { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.chapter-card:nth-child(2)::before { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.chapter-card:nth-child(3)::before { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
.chapter-card:nth-child(4)::before { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }
.chapter-card:nth-child(5)::before { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }
.chapter-card:nth-child(6)::before { background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%); }
.chapter-card:nth-child(7)::before { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.chapter-card:nth-child(8)::before { background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); }
.chapter-card:nth-child(9)::before { background: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%); }
.chapter-card:nth-child(10)::before { background: linear-gradient(135deg, #d299c2 0%, #fef9d7 100%); }
.chapter-card:nth-child(11)::before { background: linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%); }
.chapter-card:nth-child(12)::before { background: linear-gradient(135deg, #fddb92 0%, #d1fdff 100%); }

.chapter-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  opacity: 1;
}

.chapter-card:hover {
  transform: translateY(-8px) scale(1.01);
  box-shadow: 
    0 20px 40px -10px rgba(102, 126, 234, 0.3),
    0 10px 20px -5px rgba(0, 0, 0, 0.1);
}

.chapter-card.expanded {
  grid-column: 1 / -1;
  transform: none;
}

.chapter-card.expanded:hover {
  transform: none;
}

/* 卡片头部 */
.card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 28px 24px 20px;
  background: transparent;
}

.card-number {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 16px;
  font-size: 1.25rem;
  font-weight: 800;
  font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
  flex-shrink: 0;
  box-shadow: 
    0 4px 12px rgba(102, 126, 234, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  letter-spacing: -0.5px;
}

/* 每张卡片不同的编号颜色 */
.chapter-card:nth-child(1) .card-number { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.chapter-card:nth-child(2) .card-number { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.chapter-card:nth-child(3) .card-number { background: linear-gradient(135deg, #4facfe 0%, #00c9ff 100%); }
.chapter-card:nth-child(4) .card-number { background: linear-gradient(135deg, #43e97b 0%, #38d9a9 100%); }
.chapter-card:nth-child(5) .card-number { background: linear-gradient(135deg, #fa709a 0%, #ff6b6b 100%); }
.chapter-card:nth-child(6) .card-number { background: linear-gradient(135deg, #a18cd1 0%, #9775fa 100%); }
.chapter-card:nth-child(7) .card-number { background: linear-gradient(135deg, #667eea 0%, #5c7cfa 100%); }
.chapter-card:nth-child(8) .card-number { background: linear-gradient(135deg, #ff9a9e 0%, #ff8787 100%); }
.chapter-card:nth-child(9) .card-number { background: linear-gradient(135deg, #74b9ff 0%, #339af0 100%); }
.chapter-card:nth-child(10) .card-number { background: linear-gradient(135deg, #d299c2 0%, #cc5de8 100%); }
.chapter-card:nth-child(11) .card-number { background: linear-gradient(135deg, #74c0fc 0%, #4dabf7 100%); }
.chapter-card:nth-child(12) .card-number { background: linear-gradient(135deg, #ffd43b 0%, #fab005 100%); }

.card-title-wrap {
  flex: 1;
  min-width: 0;
}

.card-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 6px 0;
  line-height: 1.4;
  letter-spacing: -0.3px;
}

.card-meta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: #9ca3af;
  font-weight: 500;
  background: #f8f9fa;
  padding: 4px 10px;
  border-radius: 20px;
}

.card-meta::before {
  content: '📝';
  font-size: 0.7rem;
}

.card-arrow {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border-radius: 10px;
  color: #6b7280;
  transition: all 0.3s ease;
  font-size: 1.1rem;
}

.card-arrow.rotated {
  transform: rotate(180deg);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.35);
}

/* 卡片预览 */
.card-preview {
  padding: 0 24px 24px;
  color: #6b7280;
  font-size: 0.92rem;
  line-height: 1.7;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  position: relative;
}

.card-preview::after {
  content: '点击展开详情 →';
  position: absolute;
  bottom: 24px;
  right: 24px;
  font-size: 0.75rem;
  color: #667eea;
  font-weight: 600;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.chapter-card:hover .card-preview::after {
  opacity: 1;
}

/* 展开的内容 */
.card-content {
  padding: 0 24px 28px;
  border-top: 1px dashed #e5e7eb;
  margin-top: 0;
  cursor: default;
  background: linear-gradient(180deg, #fafbfc 0%, #ffffff 100%);
}

.content-body {
  padding-top: 24px;
  color: #374151;
  font-size: 0.95rem;
  line-height: 1.85;
}

.content-body :deep(h3),
.content-body :deep(.content-heading) {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.05rem;
  font-weight: 700;
  color: #1f2937;
  margin: 28px 0 16px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 12px;
  border-left: 4px solid #667eea;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.content-body :deep(ul) {
  margin: 16px 0;
  padding-left: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.content-body :deep(li) {
  position: relative;
  padding: 14px 18px 14px 44px;
  margin: 0;
  background: #ffffff;
  border-radius: 12px;
  color: #4b5563;
  border: 1px solid #f0f0f0;
  transition: all 0.2s ease;
}

.content-body :deep(li):hover {
  background: #f8fafc;
  border-color: #e0e7ff;
  transform: translateX(4px);
}

.content-body :deep(li)::before {
  content: '✓';
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 22px;
  height: 22px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}

.content-body :deep(strong) {
  color: #667eea;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.content-body :deep(p) {
  margin: 12px 0;
  padding: 0 4px;
}

/* 卡片装饰 */
.card-decoration {
  position: absolute;
  bottom: -40px;
  right: -40px;
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.06) 0%, rgba(118, 75, 162, 0.04) 100%);
  border-radius: 50%;
  pointer-events: none;
  transition: all 0.4s ease;
}

.chapter-card:hover .card-decoration {
  transform: scale(1.2);
  opacity: 0.8;
}

/* 展开动画 */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 2000px;
  opacity: 1;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
}

/* 付费墙样式 */
.cards-grid.has-paywall {
  position: relative;
}

.cards-grid.has-paywall::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 300px;
  background: linear-gradient(to bottom, transparent 0%, white 80%);
  pointer-events: none;
}

/* 响应式 */
@media (max-width: 768px) {
  .cards-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .chapter-card {
    border-radius: 16px;
  }
  
  .card-header {
    padding: 20px;
    gap: 12px;
  }
  
  .card-number {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    font-size: 0.9rem;
  }
  
  .card-title {
    font-size: 1rem;
  }
  
  .card-preview {
    padding: 0 20px 20px;
    font-size: 0.85rem;
  }
  
  .card-content {
    padding: 0 20px 20px;
  }
}

/* ========== 旧样式保留（兼容） ========== */
.introduction {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.intro-card {
  background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e4e7ed;
  transition: all 0.3s ease;
}

.intro-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(64, 158, 255, 0.15);
  border-color: #409EFF;
}

.intro-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  text-align: center;
}

.intro-card h3 {
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 0.8rem;
  font-weight: 600;
  text-align: center;
}

.intro-card p {
  color: #606266;
  line-height: 1.8;
  font-size: 0.95rem;
  text-align: left;
  margin: 0;
}

/* 章节 */
.sections {
  margin-top: 2rem;
}

.collapse-title {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  font-size: 1.1rem;
}

.section-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #409EFF;
  color: white;
  border-radius: 50%;
  font-weight: bold;
  font-size: 0.9rem;
}

.section-name {
  flex: 1;
  font-weight: 600;
  color: #333;
  text-align: left;
}

.section-badge {
  padding: 4px 12px;
  background: transparent;
  color: #999;
  border-radius: 12px;
  font-size: 0.85rem;
}

.section-content {
  line-height: 1.8;
  color: #606266;
  text-align: left !important;
}

.section-content :deep(*) {
  text-align: left !important;
}

.section-content :deep(h3) {
  font-size: 1.2rem;
  color: #333;
  margin: 1.5rem 0 1rem;
  text-align: left !important;
  font-weight: 600;
}

.section-content :deep(h2) {
  font-size: 1.3rem;
  color: #333;
  margin: 2rem 0 1rem;
  text-align: left !important;
  font-weight: 600;
}

.section-content :deep(p) {
  margin: 1rem 0;
  text-align: left !important;
}

.section-content :deep(ul) {
  padding-left: 2rem;
  text-align: left !important;
  list-style-position: outside;
}

.section-content :deep(li) {
  margin: 0.5rem 0;
  text-align: left !important;
}

.section-content :deep(strong) {
  color: #409EFF;
}

.section-content :deep(em) {
  color: #909399;
}

/* 内容块卡片样式 - 简洁扁平化设计 */
.section-content :deep(.content-block) {
  background: #fafafa;
  border-radius: 8px;
  padding: 20px;
  margin: 16px 0;
  border-left: 4px solid #d9d9d9;
}

.section-content :deep(.block-header) {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.section-content :deep(.block-icon) {
  font-size: 1.4rem;
  line-height: 1;
}

.section-content :deep(.block-title) {
  font-size: 1.05rem;
  font-weight: 600;
  color: #333;
  flex: 1;
}

.section-content :deep(.block-content) {
  color: #666;
  line-height: 1.8;
}

/* 内容块卡片样式 - 完整实现 */
.section-content :deep(.content-block) {
  background: #f8f9fa;
  border-left: 4px solid #409EFF;
  border-radius: 8px;
  padding: 20px 24px;
  margin: 16px 0;
  transition: all 0.3s ease;
}

.section-content :deep(.content-block:hover) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

/* 成功类型 - 绿色渐变 */
.section-content :deep(.success-block) {
  background: linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%);
  border-left-color: #52c41a;
}

/* 警告类型 - 橙色渐变 */
.section-content :deep(.warning-block) {
  background: linear-gradient(135deg, #fff7e6 0%, #fffbf0 100%);
  border-left-color: #faad14;
}

/* 提示类型 - 蓝色渐变 */
.section-content :deep(.info-block) {
  background: linear-gradient(135deg, #e6f7ff 0%, #f0f9ff 100%);
  border-left-color: #1890ff;
}

/* 紫色类型 - 紫色渐变 (时间、日程) */
.section-content :deep(.purple-block) {
  background: linear-gradient(135deg, #f9f0ff 0%, #efdbff 100%);
  border-left-color: #722ed1;
}

/* 橙色类型 - 橙色渐变 (目标、重点) */
.section-content :deep(.orange-block) {
  background: linear-gradient(135deg, #fff7e6 0%, #ffe7ba 100%);
  border-left-color: #fa8c16;
}

/* 粉色类型 - 粉色渐变 (笔记、文档) */
.section-content :deep(.pink-block) {
  background: linear-gradient(135deg, #fff0f6 0%, #ffd6e7 100%);
  border-left-color: #eb2f96;
}

/* 普通类型 */
.section-content :deep(.default-block) {
  background: #f8f9fa;
  border-left-color: #d9d9d9;
}

/* 块标题样式 */
.section-content :deep(.block-header) {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.section-content :deep(.block-icon) {
  font-size: 1.4rem;
  line-height: 1;
}

.section-content :deep(.block-title) {
  font-size: 1.05rem;
  font-weight: 600;
  color: #333;
  flex: 1;
}

/* 块内容样式 */
.section-content :deep(.block-content) {
  color: #666;
  line-height: 1.8;
  font-size: 15px;
}

/* 块内小标题 - 正常字重，不加粗 */
.section-content :deep(.block-subtitle) {
  font-size: 1.05rem;
  font-weight: 600;
  color: #333;
  margin: 16px 0 10px 0;
  padding-left: 0;
  line-height: 1.5;
}

/* 小标题内的 strong 标签也不加粗，保持正常字重 */
.section-content :deep(.block-subtitle strong) {
  color: #333 !important;
  font-weight: 600 !important;
}

/* 小标题内的所有文字都保持正常字重 */
.section-content :deep(.block-subtitle *) {
  font-weight: 600 !important;
  color: inherit;
}

.section-content :deep(.block-content p) {
  margin: 8px 0;
  line-height: 1.8;
  font-size: 15px;
}

.section-content :deep(.block-content ul) {
  margin: 8px 0;
  padding-left: 24px;
  list-style-type: disc;
}

.section-content :deep(.block-content li) {
  color: #666;
  line-height: 1.8;
  margin: 6px 0;
  font-size: 15px;
}

/* 列表样式优化 */
.section-content :deep(ul) {
  padding-left: 24px;
  margin: 12px 0;
  list-style-type: disc;
}

.section-content :deep(li) {
  color: #666;
  line-height: 1.8;
  margin: 8px 0;
}

.section-content :deep(.block-content ul) {
  padding-left: 24px;
  margin: 8px 0;
}

.section-content :deep(.block-content li) {
  color: #666;
  line-height: 1.8;
  margin: 6px 0;
}

.section-content :deep(.block-content p) {
  margin: 8px 0;
  line-height: 1.8;
}

/* 表格样式 - 美化设计 */
.section-content :deep(.content-table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section-content :deep(.content-table th),
.section-content :deep(.content-table td) {
  padding: 14px 18px;
  text-align: left;
  border: none;
  border-bottom: 1px solid #f0f0f0;
}

.section-content :deep(.content-table th) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-weight: 600;
  color: white;
  font-size: 0.95rem;
  letter-spacing: 0.5px;
}

.section-content :deep(.content-table tbody tr) {
  transition: all 0.2s ease;
}

.section-content :deep(.content-table tbody tr:nth-child(odd)) {
  background: #fafbfc;
}

.section-content :deep(.content-table tbody tr:nth-child(even)) {
  background: white;
}

.section-content :deep(.content-table tbody tr:hover) {
  background: #f0f7ff;
  transform: translateX(2px);
}

.section-content :deep(.content-table td) {
  color: #606266;
  font-size: 0.95rem;
  line-height: 1.6;
}

/* 标签样式 - 多彩设计 */
.section-content :deep(.tag-badge) {
  display: inline-block;
  padding: 2px 8px;
  background: #fff3e0;
  color: #f57c00;
  border-radius: 3px;
  font-size: 0.9em;
  margin: 0 4px;
  font-weight: 500;
}

.section-content :deep(.time-badge) {
  display: inline-block;
  padding: 3px 10px;
  background: #e8f5e9;
  color: #2e7d32;
  border-radius: 3px;
  font-size: 0.95em;
  margin: 4px;
  font-weight: 500;
}

.section-content :deep(.text-highlight) {
  color: #e74c3c;
  font-weight: 600;
}

.section-content :deep(.content-paragraph) {
  margin: 1rem 0;
  line-height: 1.8;
}

/* 错误样式 */
.error-section {
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.error-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.error-tips {
  max-width: 600px;
  margin: 0 auto;
  text-align: left;
  background: #f9fafb;
  padding: 24px;
  border-radius: 12px;
  border-left: 4px solid #f56c6c;
}

.error-tips h4 {
  margin: 0 0 12px 0;
  color: #1f2937;
  font-size: 1rem;
}

.error-tips ul {
  margin: 12px 0;
  padding-left: 20px;
}

.error-tips li {
  margin: 8px 0;
  color: #6b7280;
  line-height: 1.6;
}

.error-tips p {
  margin: 12px 0 0 0;
  color: #6b7280;
  font-size: 0.95rem;
}

@media (max-width: 768px) {
  .generating-section,
  .content-section {
    padding: 20px;
  }
  
  .header h1 {
    font-size: 1.8rem;
  }
  
  .action-bar {
    max-width: 100%;
    gap: 8px;
  }
  
  .action-bar .el-button {
    padding: 10px 8px;
    font-size: 13px;
  }
  
  .section-content :deep(.card-grid) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .section-content :deep(.card-item) {
    padding: 16px 16px 16px 45px;
    min-height: 80px;
  }
  
  .section-title {
    font-size: 1.4rem;
  }
}
</style>


/* 付费墙样式 */
.sections-container,
.professional-container,
.report-container {
  position: relative;
}

.sections-container.has-paywall .sections,
.professional-container.has-paywall,
.report-container.has-paywall {
  position: relative;
}

.sections-container.has-paywall .sections::after,
.professional-container.has-paywall::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 300px;
  background: linear-gradient(transparent, rgba(255, 255, 255, 0.9), white);
  pointer-events: none;
  z-index: 1;
}

.paywall-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  padding: 40px 20px;
}

.paywall-content {
  background: white;
  border-radius: 16px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  max-width: 500px;
  border: 2px solid #409EFF;
}

.paywall-icon {
  font-size: 64px;
  margin-bottom: 20px;
  animation: pulse 2s ease-in-out infinite;
}

.paywall-content h3 {
  font-size: 28px;
  color: #333;
  margin-bottom: 12px;
  font-weight: 600;
}

.paywall-desc {
  font-size: 16px;
  color: #666;
  margin-bottom: 24px;
  line-height: 1.6;
}

.paywall-features {
  list-style: none;
  padding: 0;
  margin: 24px 0;
  text-align: left;
}

.paywall-features li {
  font-size: 15px;
  color: #333;
  margin: 12px 0;
  padding-left: 8px;
  line-height: 1.6;
}

.paywall-content .el-button {
  font-size: 18px;
  padding: 16px 48px;
  border-radius: 8px;
  font-weight: 600;
  margin-top: 8px;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}
