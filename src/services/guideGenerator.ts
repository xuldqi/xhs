import { aiService } from './aiService'
import { getSectionTemplate, getAllTemplates } from './promptTemplates'
import type { AccountData, GuideContent, Section } from '@/types'

/**
 * 生成完整指南
 */
export async function generateGuide(
  accountData: AccountData,
  onProgress?: (current: number, total: number) => void
): Promise<GuideContent> {
  const templates = getAllTemplates()
  const sections: Section[] = []
  
  for (let i = 0; i < templates.length; i++) {
    const template = templates[i]
    
    // 通知进度
    if (onProgress) {
      onProgress(i + 1, templates.length)
    }
    
    // 生成单个章节
    const section = await generateSection(template.id, accountData)
    sections.push(section)
  }
  
  return {
    sections,
    metadata: {
      generatedAt: new Date(),
      accountName: accountData.username,
      targetFollowers: 1000
    }
  }
}

/**
 * 生成单个章节
 */
export async function generateSection(
  sectionId: number,
  accountData: AccountData
): Promise<Section> {
  const template = getSectionTemplate(sectionId)
  
  if (!template) {
    throw new Error(`未找到章节模板: ${sectionId}`)
  }
  
  try {
    // 调用 AI 生成内容（支持代理模式）
    const response = await aiService.generateContent({
      accountData,
      sectionId,
      template: template.promptTemplate,
      context: ''
    })
    
    if (response.success && response.data) {
      return {
        id: sectionId,
        title: template.title,
        content: response.data,
        tables: extractTables(response.data),
        checklists: extractChecklists(response.data)
      }
    } else {
      // AI 生成失败，抛出错误
      throw new Error(response.error || 'AI 生成失败')
    }
  } catch (error) {
    console.error(`生成章节 ${sectionId} 失败:`, error)
    // 直接抛出错误，不使用模拟数据
    throw error
  }
}

// Mock data generation function removed - we now only use real AI-generated content

/**
 * 从内容中提取 Markdown 表格
 * 支持 | col1 | col2 | 与 |---|---| 分隔行
 */
function extractTables(content: string): { headers: string[]; rows: string[][] }[] {
  const tables: { headers: string[]; rows: string[][] }[] = []
  const lines = content.split(/\r?\n/)
  let i = 0
  while (i < lines.length) {
    const headerLine = lines[i]
    const pipeCount = (headerLine.match(/\|/g) || []).length
    if (pipeCount >= 2 && headerLine.trim().startsWith('|')) {
      const headers = headerLine
        .split('|')
        .map((c) => c.trim())
        .filter(Boolean)
      i++
      if (i < lines.length && /^\s*\|[\s\-:]+\|/.test(lines[i])) {
        i++ // 跳过分隔行 |---|---|
      }
      const rows: string[][] = []
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        const cells = lines[i]
          .split('|')
          .map((c) => c.trim())
          .filter((_, idx) => idx > 0 && idx < lines[i].split('|').length - 1)
        if (cells.length >= 1) rows.push(cells)
        i++
      }
      if (headers.length > 0) tables.push({ headers, rows })
      continue
    }
    i++
  }
  return tables
}

/**
 * 从内容中提取清单（Markdown 任务列表）
 * 支持 - [ ] / - [x] 或 * [ ] / * [x]
 */
function extractChecklists(content: string): { text: string; checked: boolean }[][] {
  const checklists: { text: string; checked: boolean }[][] = []
  const lines = content.split(/\r?\n/)
  let current: { text: string; checked: boolean }[] = []
  const checkboxRe = /^(\s*[-*])\s*\[([ xX])\]\s*(.*)$/
  for (const line of lines) {
    const m = line.match(checkboxRe)
    if (m) {
      const checked = m[2].toLowerCase() === 'x'
      const text = m[3].trim()
      current.push({ text, checked })
    } else {
      if (current.length > 0) {
        checklists.push(current)
        current = []
      }
    }
  }
  if (current.length > 0) checklists.push(current)
  return checklists
}
