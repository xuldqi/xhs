<template>
  <div class="professional-document">
    <!-- 封面 -->
    <div class="doc-cover">
      <h1 class="doc-cover-title">小红书账号增长策略报告</h1>
      <div class="doc-cover-divider"></div>
      <div class="doc-cover-subtitle">{{ accountData.username }}</div>
      <div class="doc-cover-info">
        <p>当前粉丝数：{{ accountData.followers || 0 }}</p>
        <p>发布笔记数：{{ accountData.notes || 0 }}</p>
        <p>内容类别：{{ accountData.category || '未分类' }}</p>
        <p>生成日期：{{ formatDate(guideContent.metadata.generatedAt) }}</p>
      </div>
    </div>

    <!-- 目录 -->
    <div class="doc-toc">
      <h2 class="doc-toc-title">目录</h2>
      <ul class="doc-toc-list">
        <li 
          v-for="(section, index) in guideContent.sections" 
          :key="section.id"
          class="doc-toc-item"
          @click="scrollToSection(section.id)"
        >
          <span class="doc-toc-item-title">{{ index + 1 }}. {{ section.title }}</span>
          <span class="doc-toc-item-page">{{ index + 3 }}</span>
        </li>
      </ul>
    </div>

    <!-- 内容章节 -->
    <div class="doc-content">
      <div
        v-for="(section, index) in guideContent.sections"
        :key="section.id"
        :id="`section-${section.id}`"
        class="doc-section"
      >
        <h2 class="doc-h2">{{ section.title }}</h2>
        <div class="doc-section-content" v-html="formatContent(section.content)"></div>
      </div>
    </div>

    <!-- 页脚 -->
    <div class="doc-footer">
      <p>本报告由小红书增长指南生成器自动生成</p>
      <p>© 2024 xiaohongshu.college</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GuideContent, AccountData } from '@/types/models'

interface Props {
  guideContent: GuideContent
  accountData: AccountData
}

const props = defineProps<Props>()

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(`section-${sectionId}`)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const formatContent = (content: string) => {
  let formatted = content
  
  formatted = formatted.replace(/\n\n/g, '</p><p class="doc-paragraph">')
  formatted = `<p class="doc-paragraph">${formatted}</p>`
  
  formatted = formatted.replace(/^- (.+)$/gm, '<li class="doc-list-item">$1</li>')
  formatted = formatted.replace(/(<li class="doc-list-item">.*<\/li>)/s, '<ul class="doc-list doc-list-unordered">$1</ul>')
  
  formatted = formatted.replace(/^\d+\. (.+)$/gm, '<li class="doc-list-item">$1</li>')
  
  formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong class="doc-strong">$1</strong>')
  formatted = formatted.replace(/\*(.+?)\*/g, '<em class="doc-em">$1</em>')
  
  const tableRegex = /\|(.+)\|\n\|[-:\s|]+\|\n((?:\|.+\|\n?)+)/g
  formatted = formatted.replace(tableRegex, (match, header, rows) => {
    const headers = header.split('|').filter((h: string) => h.trim()).map((h: string) => h.trim())
    const rowsArray = rows.trim().split('\n').map((row: string) => 
      row.split('|').filter((cell: string) => cell.trim()).map((cell: string) => cell.trim())
    )
    
    let table = '<div class="doc-table-container"><table class="doc-table">'
    table += '<thead><tr>'
    headers.forEach((h: string) => {
      table += `<th>${h}</th>`
    })
    table += '</tr></thead><tbody>'
    
    rowsArray.forEach((row: string[]) => {
      table += '<tr>'
      row.forEach((cell: string) => {
        table += `<td>${cell}</td>`
      })
      table += '</tr>'
    })
    
    table += '</tbody></table></div>'
    return table
  })
  
  return formatted
}
</script>

<style scoped>
.doc-section {
  margin-bottom: 40px;
}

.doc-section-content {
  margin-top: 20px;
}
</style>
