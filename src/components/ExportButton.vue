<template>
  <el-button
    type="primary"
    size="large"
    :loading="isExporting"
    @click="handleExport"
  >
    <el-icon v-if="!isExporting"><Download /></el-icon>
    {{ isExporting ? '导出中...' : '导出 PDF' }}
  </el-button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { GuideContent } from '@/types'

const props = defineProps<{
  guideContent: GuideContent
}>()

const emit = defineEmits<{
  'export-success': []
  'export-error': [error: string]
}>()

const isExporting = ref(false)

const handleExport = async () => {
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
</script>
