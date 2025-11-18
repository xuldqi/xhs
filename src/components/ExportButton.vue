<template>
  <el-dropdown split-button type="primary" size="large" @click="handleExport('pdf')" :loading="isExporting">
    <el-icon v-if="!isExporting"><Download /></el-icon>
    {{ isExporting ? '导出中...' : '导出 PDF' }}
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item @click="handleExport('pdf')">
          <el-icon><Document /></el-icon>
          导出 PDF
        </el-dropdown-item>
        <el-dropdown-item @click="handleExport('html')">
          <el-icon><DocumentCopy /></el-icon>
          导出 HTML
        </el-dropdown-item>
        <el-dropdown-item @click="handleShare">
          <el-icon><Share /></el-icon>
          生成分享链接
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Download, Document, DocumentCopy, Share } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { GuideContent } from '@/types'

const props = defineProps<{
  guideContent: GuideContent
}>()

const emit = defineEmits<{
  'export-success': []
  'export-error': [error: string]
}>()

const isExporting = ref(false)

const handleExport = async (format: 'pdf' | 'html') => {
  if (format === 'pdf') {
    await exportPDF()
  } else if (format === 'html') {
    await exportHTML()
  }
}

const exportPDF = async () => {
  try {
    isExporting.value = true
    
    // 动态导入 jsPDF 和 html2canvas
    const { default: jsPDF } = await import('jspdf')
    const { default: html2canvas } = await import('html2canvas')
    
    // 创建 PDF
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    
    // 添加标题
    pdf.setFontSize(20)
    pdf.text(props.guideContent.metadata.accountName + ' 的涨粉实操指南', pageWidth / 2, 20, { align: 'center' })
    
    pdf.setFontSize(12)
    pdf.text('生成时间：' + new Date(props.guideContent.metadata.generatedAt).toLocaleString('zh-CN'), pageWidth / 2, 30, { align: 'center' })
    
    let yOffset = 40
    
    // 添加每个章节
    for (const section of props.guideContent.sections) {
      // 检查是否需要新页面
      if (yOffset > pageHeight - 40) {
        pdf.addPage()
        yOffset = 20
      }
      
      // 章节标题
      pdf.setFontSize(16)
      pdf.text(`${section.id}. ${section.title}`, 20, yOffset)
      yOffset += 10
      
      // 章节内容（简化版）
      pdf.setFontSize(10)
      const lines = pdf.splitTextToSize(section.content.replace(/<[^>]*>/g, ''), pageWidth - 40)
      
      for (const line of lines) {
        if (yOffset > pageHeight - 20) {
          pdf.addPage()
          yOffset = 20
        }
        pdf.text(line, 20, yOffset)
        yOffset += 7
      }
      
      yOffset += 10
    }
    
    // 生成文件名
    const filename = `小红书涨粉指南_${props.guideContent.metadata.accountName}_${new Date().toISOString().split('T')[0]}.pdf`
    
    // 保存 PDF
    pdf.save(filename)
    
    ElMessage.success('PDF 导出成功！')
    emit('export-success')
    
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('PDF 导出失败，请重试')
    emit('export-error', error instanceof Error ? error.message : '导出失败')
  } finally {
    isExporting.value = false
  }
}

const exportHTML = async () => {
  try {
    isExporting.value = true
    
    // 生成完整的 HTML 文件
    const htmlContent = generateHTMLContent()
    
    // 创建 Blob
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' })
    
    // 生成文件名
    const filename = `小红书涨粉指南_${props.guideContent.metadata.accountName}_${new Date().toISOString().split('T')[0]}.html`
    
    // 下载文件
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    
    ElMessage.success('HTML 导出成功！')
    emit('export-success')
    
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('HTML 导出失败，请重试')
    emit('export-error', error instanceof Error ? error.message : '导出失败')
  } finally {
    isExporting.value = false
  }
}

const generateHTMLContent = (): string => {
  const { metadata, sections } = props.guideContent
  
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${metadata.accountName} 的涨粉实操指南</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
      line-height: 1.8;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }
    h1 { font-size: 32px; color: #1a1a1a; margin-bottom: 12px; text-align: center; }
    .subtitle { text-align: center; color: #666; margin-bottom: 40px; }
    .section { margin-bottom: 40px; }
    .section-title { font-size: 24px; color: #333; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 2px solid #f0f0f0; }
    
    /* 卡片样式 */
    .content-block {
      background: #f8f9fa;
      border-left: 4px solid #409EFF;
      border-radius: 8px;
      padding: 20px 24px;
      margin: 16px 0;
      transition: all 0.3s ease;
    }
    .success-block { background: linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%); border-left-color: #52c41a; }
    .warning-block { background: linear-gradient(135deg, #fff7e6 0%, #fffbf0 100%); border-left-color: #faad14; }
    .info-block { background: linear-gradient(135deg, #e6f7ff 0%, #f0f9ff 100%); border-left-color: #1890ff; }
    .default-block { background: #f8f9fa; border-left-color: #d9d9d9; }
    
    .block-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .block-icon { font-size: 1.4rem; }
    .block-title { font-size: 1.05rem; font-weight: 600; color: #333; }
    .block-content { color: #666; }
    .block-content ul { padding-left: 24px; margin: 8px 0; }
    .block-content li { margin: 6px 0; }
    
    .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #f0f0f0; text-align: center; color: #999; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${metadata.accountName} 的涨粉实操指南</h1>
    <p class="subtitle">生成时间：${new Date(metadata.generatedAt).toLocaleString('zh-CN')}</p>
    
    ${sections.map(section => `
      <div class="section">
        <h2 class="section-title">${section.id}. ${section.title}</h2>
        <div class="section-content">${section.content}</div>
      </div>
    `).join('')}
    
    <div class="footer">
      <p>🎉 由小红书涨粉助手生成 | 祝你快速涨粉！</p>
    </div>
  </div>
</body>
</html>`
}

const handleShare = async () => {
  try {
    // 生成分享链接（将数据编码到 URL 中）
    const shareData = {
      metadata: props.guideContent.metadata,
      sections: props.guideContent.sections
    }
    
    // 压缩数据
    const jsonStr = JSON.stringify(shareData)
    const encoded = btoa(encodeURIComponent(jsonStr))
    
    // 生成分享链接
    const shareUrl = `${window.location.origin}/share?data=${encoded}`
    
    // 复制到剪贴板
    await navigator.clipboard.writeText(shareUrl)
    
    ElMessageBox.alert(
      `分享链接已复制到剪贴板！<br><br>
      <div style="background: #f5f5f5; padding: 12px; border-radius: 4px; word-break: break-all; font-size: 12px;">
        ${shareUrl}
      </div><br>
      <small style="color: #999;">注意：链接较长，建议使用短链接服务</small>`,
      '分享链接',
      {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '好的'
      }
    )
    
  } catch (error) {
    console.error('生成分享链接失败:', error)
    ElMessage.error('生成分享链接失败')
  }
}
</script>
