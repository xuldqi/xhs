<template>
  <div class="guide-view">
    <div class="guide-container">
      <!-- 生成中 -->
      <div v-if="isGenerating" class="generating-section">
        <div class="generating-icon">
          <el-icon class="rotating" :size="80" color="#409EFF">
            <Loading />
          </el-icon>
        </div>
        
        <h2>正在生成您的专属涨粉指南...</h2>
        
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
              导出 HTML（推荐）
            </el-button>
            <el-button size="large" @click="handleRegenerate">
              <el-icon><Refresh /></el-icon>
              重新生成
            </el-button>
          </div>
        </div>
        
        <!-- 导言说明 -->
        <div class="introduction">
          <div class="intro-card">
            <div class="intro-icon">📖</div>
            <h3>关于本指南</h3>
            <p>这是一份根据您的账号实际情况量身定制的涨粉实操指南。包含12个核心模块，从账号诊断到立即行动，每一步都有具体可执行的方法。</p>
          </div>
          
          <div class="intro-card">
            <div class="intro-icon">🎯</div>
            <h3>如何使用</h3>
            <p>建议按顺序阅读每个章节，重点关注"立刻行动清单"。每个模块都可以独立展开查看，点击标题即可折叠或展开内容。</p>
          </div>
          
          <div class="intro-card">
            <div class="intro-icon">💡</div>
            <h3>实操建议</h3>
            <p>不要试图一次性完成所有内容。先从"起号三天计划"开始，每天完成一个小目标。记住：持续行动比完美计划更重要。</p>
          </div>
        </div>
        
        <!-- 内容 - 使用折叠面板 -->
        <div class="sections">
          <el-collapse v-model="activeNames" accordion>
            <el-collapse-item
              v-for="section in guideContent.sections"
              :key="section.id"
              :name="section.id"
            >
              <template #title>
                <div class="collapse-title">
                  <span class="section-number">{{ section.id }}</span>
                  <span class="section-name">{{ section.title }}</span>
                  <span class="section-badge">{{ getContentLength(section.content) }}字</span>
                </div>
              </template>
              <div 
                class="section-content" 
                v-html="formatContent(section.content)" 
              />
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>
      
      <!-- 生成失败 -->
      <div v-else class="error-section">
        <el-result
          icon="error"
          title="生成失败"
          sub-title="指南生成过程中出现错误，请重试"
        >
          <template #extra>
            <el-button type="primary" @click="handleRegenerate">
              重新生成
            </el-button>
            <el-button @click="goBack">返回修改信息</el-button>
          </template>
        </el-result>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Download, Refresh, Loading, Document, CircleCheck, Clock, SuccessFilled } from '@element-plus/icons-vue'
import { SECTION_TITLES } from '@/types'
import type { GuideContent } from '@/types'
import TipsCarousel from '@/components/TipsCarousel.vue'

const router = useRouter()

// 状态
const isGenerating = ref(true)
const currentSection = ref(0)
const generationProgress = ref(0)
const guideContent = ref<GuideContent | null>(null)
const activeNames = ref<number[]>([1]) // 默认展开第一个章节
const startTime = ref<number>(0)

// 进度条颜色
const progressColor = computed(() => {
  if (generationProgress.value < 30) return '#409EFF'
  if (generationProgress.value < 70) return '#67C23A'
  return '#E6A23C'
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
  
  if (!store.accountData) {
    router.push('/analysis')
    return
  }
  
  await generateGuide()
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
    ElMessage.error({
      message: error instanceof Error ? error.message : 'AI 生成失败，请检查 API 配置或稍后重试',
      duration: 5000,
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

// 格式化内容
const formatContent = (content: string): string => {
  if (!content) {
    return '<p style="color: #999;">内容为空</p>'
  }
  
  let formatted = content
  
  // 1. 处理【】括号内容 - 加粗显示
  formatted = formatted.replace(/【(.+?)】/g, '<strong style="color: #333; font-weight: 700; background: #f0f9ff; padding: 2px 8px; border-radius: 4px;">【$1】</strong>')
  
  // 2. 处理 Markdown 标题
  formatted = formatted.replace(/^#### (.+)$/gm, '<h4 style="margin: 1rem 0 0.5rem; font-size: 1.1rem; color: #666; font-weight: 600;">$1</h4>')
  formatted = formatted.replace(/^### (.+)$/gm, '<h3 style="margin: 1.5rem 0 1rem; font-size: 1.2rem; color: #333; font-weight: 700;">$1</h3>')
  formatted = formatted.replace(/^## (.+)$/gm, '<h2 style="margin: 2rem 0 1rem; font-size: 1.4rem; color: #409EFF; font-weight: 700;">$1</h2>')
  
  // 3. 处理表格（检测表格模式的数据）
  // 匹配类似 "| 列1 | 列2 | 列3 |" 的行
  const tableRegex = /^\|(.+)\|$/gm
  if (tableRegex.test(formatted)) {
    formatted = formatted.replace(/(\|.+\|\n)+/g, (match) => {
      const rows = match.trim().split('\n')
      if (rows.length < 2) return match
      
      let tableHtml = '<table style="width: 100%; border-collapse: collapse; margin: 1.5rem 0; border: 1px solid #e4e7ed;">'
      
      rows.forEach((row, index) => {
        const cells = row.split('|').filter(cell => cell.trim()).map(cell => cell.trim())
        if (cells.length === 0) return
        
        // 跳过分隔行（如 |---|---|）
        if (cells[0].match(/^-+$/)) return
        
        const tag = index === 0 ? 'th' : 'td'
        const style = index === 0 
          ? 'padding: 12px; border: 1px solid #e4e7ed; background: #f5f7fa; font-weight: 600; text-align: left;'
          : 'padding: 12px; border: 1px solid #e4e7ed; text-align: left;'
        
        tableHtml += '<tr>'
        cells.forEach(cell => {
          tableHtml += `<${tag} style="${style}">${cell}</${tag}>`
        })
        tableHtml += '</tr>'
      })
      
      tableHtml += '</table>'
      return tableHtml
    })
  }
  
  // 4. 处理加粗 **text**
  formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong style="color: #409EFF; font-weight: 600;">$1</strong>')
  
  // 5. 处理列表 - 保持原生 ul/li 格式
  formatted = formatted.replace(/^[•\-] (.+)$/gm, '<li>$1</li>')
  formatted = formatted.replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')
  
  // 6. 包装连续的 li 为 ul
  formatted = formatted.replace(/(<li>.*?<\/li>\s*)+/gs, (match) => {
    return '<ul>' + match + '</ul>'
  })
  
  // 6.5. 处理时间格式 - 将连续的时间段用换行分隔
  // 匹配类似 "7:00-22:00 7:00-9:00" 或 "18:00-22:00 18:00-19:00" 的格式
  formatted = formatted.replace(/(\d{1,2}:\d{2}-\d{1,2}:\d{2})\s+(\d{1,2}:\d{2}-\d{1,2}:\d{2})/g, '$1<br/>$2')
  
  // 7. 处理段落
  const lines = formatted.split('\n')
  const result: string[] = []
  
  for (let line of lines) {
    line = line.trim()
    if (!line) continue
    
    // 如果已经是 HTML 标签，直接添加
    if (line.startsWith('<')) {
      result.push(line)
    } else {
      // 普通文本转为段落
      result.push(`<p style="margin: 1rem 0; line-height: 1.8;">${line}</p>`)
    }
  }
  
  return result.join('\n')
}

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
      
      const cleanContent = section.content
        .replace(/<[^>]*>/g, '')  // 移除 HTML 标签
        .replace(/&nbsp;/g, ' ')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .trim()
      
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
  
  const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${guideContent.value.metadata.accountName} 的涨粉实操指南</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 900px; margin: 40px auto; padding: 20px; line-height: 1.8; }
    h1 { color: #333; border-bottom: 3px solid #409EFF; padding-bottom: 10px; }
    h2 { color: #409EFF; margin-top: 2rem; padding-left: 1rem; border-left: 4px solid #409EFF; }
    h3 { color: #666; margin-top: 1.5rem; }
    ul { padding-left: 2rem; }
    li { margin: 0.5rem 0; }
    strong { color: #409EFF; }
    .meta { color: #999; margin-bottom: 2rem; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
  <h1>${guideContent.value.metadata.accountName} 的涨粉实操指南</h1>
  <div class="meta">
    生成时间：${formatDate(guideContent.value.metadata.generatedAt)} | 
    目标粉丝：${guideContent.value.metadata.targetFollowers}
  </div>
  ${guideContent.value.sections.map(section => `
    <h2>${section.id}. ${section.title}</h2>
    <div>${formatContent(section.content)}</div>
  `).join('')}
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

// 重新生成
const handleRegenerate = () => {
  generateGuide()
}

// 返回
const goBack = () => {
  router.push('/analysis')
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

.generating-section h2 {
  font-size: 2rem;
  color: #333;
  margin-bottom: 2rem;
}

.progress-info {
  margin: 2rem 0;
}

.current-section {
  font-size: 1.2rem;
  color: #409EFF;
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
  display: flex;
  justify-content: center;
  gap: 1rem;
}

/* 导言说明 */
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
  background: #f0f9ff;
  color: #409EFF;
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
  font-size: 1.3rem;
  color: #333;
  margin: 1.5rem 0 1rem;
  text-align: left !important;
}

.section-content :deep(h2) {
  font-size: 1.4rem;
  color: #333;
  margin: 2rem 0 1rem;
  text-align: left !important;
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

/* 列表样式优化 */
.section-content :deep(ul) {
  background: #f8f9fa;
  border-left: 4px solid #409EFF;
  border-radius: 8px;
  padding: 20px 24px 20px 48px;
  margin: 16px 0;
  list-style-type: disc;
}

.section-content :deep(li) {
  color: #666;
  line-height: 1.8;
  margin: 8px 0;
}

.section-content :deep(.markdown-table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-content :deep(.markdown-table th),
.section-content :deep(.markdown-table td) {
  padding: 12px 16px;
  text-align: left;
  border: 1px solid #e4e7ed;
}

.section-content :deep(.markdown-table th) {
  background: #f5f7fa;
  font-weight: 600;
  color: #333;
}

.section-content :deep(.markdown-table tr:hover) {
  background: #f5f7fa;
}

/* 错误样式 */
.error-section {
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
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
    flex-direction: column;
  }
  
  .section-content :deep(.card-grid) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .section-content :deep(.card-item) {
    padding: 16px 16px 16px 45px;
    min-height: 80px;
  }
  
  .action-bar .el-button {
    width: 100%;
  }
  
  .section-title {
    font-size: 1.4rem;
  }
}
</style>
