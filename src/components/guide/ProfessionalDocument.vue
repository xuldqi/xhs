<template>
  <div class="professional-document">
    <!-- 封面 -->
    <div class="doc-cover">
      <div class="doc-cover-title">{{ accountData.username }}</div>
      <div class="doc-cover-subtitle">小红书账号增长战略报告</div>
      <div class="doc-cover-divider"></div>
      <div class="doc-cover-info">
        <p>账号类别：{{ accountData.contentCategory }}</p>
        <p>当前粉丝：{{ accountData.followerCount.toLocaleString() }}</p>
        <p>生成日期：{{ new Date().toLocaleDateString('zh-CN') }}</p>
      </div>
    </div>

    <!-- 执行摘要 -->
    <div class="doc-section">
      <h1 class="doc-h1">执行摘要</h1>
      <p class="doc-paragraph" v-html="report.executiveSummary"></p>
    </div>

    <!-- 关键指标 -->
    <div class="doc-section">
      <h1 class="doc-h1">关键指标分析</h1>
      <div class="doc-metrics-grid">
        <div v-for="metric in report.keyMetrics" :key="metric.metric" class="doc-metric-card">
          <div class="doc-metric-label">{{ metric.metric }}</div>
          <div class="doc-metric-value">{{ metric.value }}</div>
          <div class="doc-metric-desc">{{ metric.description }}</div>
        </div>
      </div>
    </div>

    <!-- 数据可视化 -->
    <div class="doc-section">
      <h1 class="doc-h1">数据可视化分析</h1>
      <div v-for="(chart, index) in report.charts" :key="index" class="doc-chart-container">
        <h3 class="doc-chart-title">{{ chart.title }}</h3>
        <ProfessionalChart :data="chart" :chart-id="`chart-${index}`" />
      </div>
    </div>

    <!-- SWOT 分析 -->
    <div class="doc-section">
      <h1 class="doc-h1">SWOT 战略分析</h1>
      <div class="doc-swot-grid">
        <div class="doc-swot-card strengths">
          <div class="doc-swot-title">
            <span>💪</span>
            <span>优势 (Strengths)</span>
          </div>
          <ul class="doc-swot-list">
            <li v-for="(item, i) in report.swotAnalysis.strengths" :key="i">{{ item }}</li>
          </ul>
        </div>
        <div class="doc-swot-card weaknesses">
          <div class="doc-swot-title">
            <span>⚠️</span>
            <span>劣势 (Weaknesses)</span>
          </div>
          <ul class="doc-swot-list">
            <li v-for="(item, i) in report.swotAnalysis.weaknesses" :key="i">{{ item }}</li>
          </ul>
        </div>
        <div class="doc-swot-card opportunities">
          <div class="doc-swot-title">
            <span>🎯</span>
            <span>机会 (Opportunities)</span>
          </div>
          <ul class="doc-swot-list">
            <li v-for="(item, i) in report.swotAnalysis.opportunities" :key="i">{{ item }}</li>
          </ul>
        </div>
        <div class="doc-swot-card threats">
          <div class="doc-swot-title">
            <span>⚡</span>
            <span>威胁 (Threats)</span>
          </div>
          <ul class="doc-swot-list">
            <li v-for="(item, i) in report.swotAnalysis.threats" :key="i">{{ item }}</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 战略建议 -->
    <div class="doc-section">
      <h1 class="doc-h1">战略建议与行动计划</h1>
      <div v-for="(rec, index) in report.recommendations" :key="index" 
           :class="['doc-recommendation', `priority-${rec.priority}`]">
        <div class="doc-recommendation-header">
          <div class="doc-recommendation-title">{{ rec.title }}</div>
          <div :class="['doc-recommendation-priority', rec.priority]">
            {{ rec.priority === 'high' ? '高优先级' : rec.priority === 'medium' ? '中优先级' : '低优先级' }}
          </div>
        </div>
        <div class="doc-recommendation-desc">{{ rec.description }}</div>
        <div class="doc-recommendation-impact">预期效果：{{ rec.expectedImpact }}</div>
      </div>
    </div>

    <!-- 详细实施方案 - 按章节展示 -->
    <div v-for="(section, index) in sections" :key="index" class="doc-section">
      <h1 class="doc-h1">{{ section.title }}</h1>
      
      <!-- 章节增强内容 -->
      <div class="doc-section-enhanced">
        <!-- 徽章 -->
        <div v-if="getEnhancedSection(index + 1, section.title, section.content).badges?.length" 
             v-html="renderBadgesMethod(getEnhancedSection(index + 1, section.title, section.content).badges)"></div>
        
        <!-- 大数字卡片 -->
        <div v-if="getEnhancedSection(index + 1, section.title, section.content).bigNumbers?.length" 
             v-html="renderBigNumbersMethod(getEnhancedSection(index + 1, section.title, section.content).bigNumbers)"></div>
        
        <!-- 数据卡片 -->
        <div v-if="getEnhancedSection(index + 1, section.title, section.content).dataCards?.length" 
             v-html="renderDataCardsMethod(getEnhancedSection(index + 1, section.title, section.content).dataCards)"></div>
        
        <!-- 重点提示 -->
        <div v-if="getEnhancedSection(index + 1, section.title, section.content).highlights?.length" 
             v-html="renderHighlightsMethod(getEnhancedSection(index + 1, section.title, section.content).highlights)"></div>
        
        <!-- 信息卡片 -->
        <div v-if="getEnhancedSection(index + 1, section.title, section.content).infoCards?.length" 
             v-html="renderInfoCardsMethod(getEnhancedSection(index + 1, section.title, section.content).infoCards)"></div>
        
        <!-- 步骤指示器 -->
        <div v-if="getEnhancedSection(index + 1, section.title, section.content).steps?.length" 
             v-html="renderStepsMethod(getEnhancedSection(index + 1, section.title, section.content).steps)"></div>
        
        <!-- 对比卡片 -->
        <div v-if="getEnhancedSection(index + 1, section.title, section.content).comparisonCards?.length" 
             v-html="renderComparisonCardsMethod(getEnhancedSection(index + 1, section.title, section.content).comparisonCards)"></div>
        
        <!-- 进度条 -->
        <div v-if="getEnhancedSection(index + 1, section.title, section.content).progressBars?.length" 
             v-html="renderProgressBarsMethod(getEnhancedSection(index + 1, section.title, section.content).progressBars)"></div>
        
        <!-- 时间轴 -->
        <div v-if="getEnhancedSection(index + 1, section.title, section.content).timeline?.length" 
             v-html="renderTimelineMethod(getEnhancedSection(index + 1, section.title, section.content).timeline)"></div>
        
        <!-- 图表 -->
        <div v-for="(chart, chartIndex) in getEnhancedSection(index + 1, section.title, section.content).charts" 
             :key="chartIndex" class="doc-section-chart">
          <div class="doc-section-chart-title">{{ chart.title }}</div>
          <ProfessionalChart :data="chart" :chart-id="`section-${index}-chart-${chartIndex}`" />
        </div>
        
        <!-- 表格 -->
        <div v-if="getEnhancedSection(index + 1, section.title, section.content).tables?.length" 
             v-html="renderTablesMethod(getEnhancedSection(index + 1, section.title, section.content).tables)"></div>
      </div>
      
      <!-- 原始内容 -->
      <div class="doc-section-content" v-html="formatSectionContent(section.content)"></div>
    </div>

    <!-- 页脚 -->
    <div class="doc-footer">
      <p>本报告由小红书学院 AI 智能生成</p>
      <p>生成时间：{{ new Date().toLocaleString('zh-CN') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AccountData } from '@/types'
import { analyzeProfessionalData } from '@/utils/professionalDataAnalyzer'
import { formatContent } from '@/utils/contentFormatter'
import { 
  enhanceSection, 
  renderDataCards, 
  renderTables,
  renderInfoCards,
  renderProgressBars,
  renderTimeline,
  renderBadges,
  renderBigNumbers,
  renderComparisonCards,
  renderSteps,
  renderHighlights
} from '@/utils/sectionEnhancer'
import ProfessionalChart from './ProfessionalChart.vue'

interface Section {
  title: string
  content: string
}

const props = defineProps<{
  accountData: AccountData
  content: string
  sections?: Array<{ id: number; title: string; content: string }>
}>()

// 生成专业报告
const report = computed(() => {
  console.log('🔍 ProfessionalDocument - 账号数据:', props.accountData)
  const result = analyzeProfessionalData(props.accountData)
  console.log('📊 ProfessionalDocument - 生成的报告:', result)
  console.log('📈 ProfessionalDocument - 图表数据:', result.charts)
  return result
})

// 解析章节 - 如果传入了 sections 就用，否则从 content 中解析
const sections = computed<Section[]>(() => {
  // 如果有传入的 sections，直接使用
  if (props.sections && props.sections.length > 0) {
    return props.sections.map(s => ({
      title: s.title,
      content: s.content
    }))
  }
  
  // 否则尝试从 content 中解析章节
  // 按照 emoji + 标题的格式分割
  const content = props.content
  const sectionPattern = /[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}][\uFE00-\uFE0F]?\s*([^\n]+)/gu
  const matches = Array.from(content.matchAll(sectionPattern))
  
  if (matches.length === 0) {
    // 如果没有找到章节标记，返回整个内容作为一个章节
    return [{
      title: '详细实施方案',
      content: content
    }]
  }
  
  const result: Section[] = []
  
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i]
    const title = match[1].trim()
    const startIndex = match.index! + match[0].length
    const endIndex = i < matches.length - 1 ? matches[i + 1].index! : content.length
    const sectionContent = content.substring(startIndex, endIndex).trim()
    
    result.push({
      title,
      content: sectionContent
    })
  }
  
  return result
})

// 格式化单个章节内容（专业模式）
const formatSectionContent = (content: string): string => {
  return formatContent(content, true)
}

// 获取增强的章节内容
const getEnhancedSection = (sectionId: number, title: string, content: string) => {
  return enhanceSection(sectionId, title, content)
}

// 导出渲染方法供模板使用
const renderDataCardsMethod = renderDataCards
const renderTablesMethod = renderTables
const renderInfoCardsMethod = renderInfoCards
const renderProgressBarsMethod = renderProgressBars
const renderTimelineMethod = renderTimeline
const renderBadgesMethod = renderBadges
const renderBigNumbersMethod = renderBigNumbers
const renderComparisonCardsMethod = renderComparisonCards
const renderStepsMethod = renderSteps
const renderHighlightsMethod = renderHighlights
</script>

<style scoped>
/* 组件特定样式 */
.doc-section {
  margin: 40px 0;
  page-break-inside: avoid;
}

.doc-section:first-of-type {
  margin-top: 0;
}
</style>
