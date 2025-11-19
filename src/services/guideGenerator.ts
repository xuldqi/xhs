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
 * 从内容中提取表格
 */
function extractTables(content: string): any[] {
  // TODO: 实现表格提取逻辑
  return []
}

/**
 * 从内容中提取清单
 */
function extractChecklists(content: string): any[] {
  // TODO: 实现清单提取逻辑
  return []
}
