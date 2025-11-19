/**
 * 历史记录管理工具
 * 使用 localStorage 保存最近的分析记录
 */

import type { AccountData, GuideContent } from '@/types/models'

// 基础历史记录（用于列表显示）
export interface HistoryRecord {
  id: string
  accountName: string
  followers: number
  notes: number
  category: string
  createdAt: string
  thumbnailUrl?: string
}

// 完整历史记录（包含所有分析数据）
export interface FullHistoryRecord extends HistoryRecord {
  // 完整的指南内容
  guideContent: GuideContent
  // 账号完整数据
  accountData: AccountData
  // 分析元数据
  metadata: {
    analysisDate: string
    version: string
    dataSize: number
    compressed: boolean
  }
}

const STORAGE_KEY = 'xhs_guide_history'
const FULL_STORAGE_KEY = 'xhs_guide_history_full'
const MAX_RECORDS = 5
const MAX_STORAGE_SIZE = 4 * 1024 * 1024 // 4MB (localStorage 通常限制 5-10MB)

export class HistoryManager {
  /**
   * 保存一条记录
   */
  static saveRecord(record: Omit<HistoryRecord, 'id' | 'createdAt'>): void {
    try {
      const history = this.getHistory()
      const newRecord: HistoryRecord = {
        ...record,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      }
      
      // 添加到开头
      history.unshift(newRecord)
      
      // 只保留最近的记录
      const trimmedHistory = history.slice(0, MAX_RECORDS)
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedHistory))
    } catch (error) {
      console.error('保存历史记录失败:', error)
    }
  }

  /**
   * 获取所有历史记录
   */
  static getHistory(): HistoryRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('读取历史记录失败:', error)
      return []
    }
  }

  /**
   * 删除指定记录
   */
  static deleteRecord(id: string): void {
    try {
      const history = this.getHistory()
      const filtered = history.filter(record => record.id !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
    } catch (error) {
      console.error('删除历史记录失败:', error)
    }
  }

  /**
   * 清空所有记录
   */
  static clearHistory(): void {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('清空历史记录失败:', error)
    }
  }

  /**
   * 获取最近一条记录
   */
  static getLatest(): HistoryRecord | null {
    const history = this.getHistory()
    return history.length > 0 ? history[0] : null
  }

  /**
   * 保存完整的分析记录
   */
  static saveFullRecord(record: Omit<FullHistoryRecord, 'id' | 'createdAt' | 'metadata'>): void {
    try {
      const id = Date.now().toString()
      const createdAt = new Date().toISOString()
      
      // 创建完整记录
      const fullRecord: FullHistoryRecord = {
        id,
        accountName: record.accountName,
        followers: record.followers,
        notes: record.notes,
        category: record.category,
        thumbnailUrl: record.thumbnailUrl,
        createdAt,
        guideContent: record.guideContent,
        accountData: record.accountData,
        metadata: {
          analysisDate: createdAt,
          version: '1.0',
          dataSize: 0,
          compressed: false
        }
      }

      // 计算数据大小
      const dataStr = JSON.stringify(fullRecord)
      fullRecord.metadata.dataSize = dataStr.length

      // 检查存储空间
      if (!this.checkStorageSpace(dataStr.length)) {
        console.warn('存储空间不足，尝试清理旧记录')
        this.cleanOldRecords()
      }

      // 保存完整记录
      const fullHistory = this.getFullHistory()
      fullHistory.unshift(fullRecord)
      const trimmedFullHistory = fullHistory.slice(0, MAX_RECORDS)
      localStorage.setItem(FULL_STORAGE_KEY, JSON.stringify(trimmedFullHistory))

      // 同时保存基础记录（用于列表显示）
      const basicRecord: HistoryRecord = {
        id,
        accountName: record.accountName,
        followers: record.followers,
        notes: record.notes,
        category: record.category,
        createdAt,
        thumbnailUrl: record.thumbnailUrl
      }
      
      const history = this.getHistory()
      history.unshift(basicRecord)
      const trimmedHistory = history.slice(0, MAX_RECORDS)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedHistory))

      console.log(`保存完整记录成功，数据大小: ${(dataStr.length / 1024).toFixed(2)}KB`)
    } catch (error) {
      console.error('保存完整记录失败:', error)
      // 降级：至少保存基础信息
      this.saveRecord({
        accountName: record.accountName,
        followers: record.followers,
        notes: record.notes,
        category: record.category,
        thumbnailUrl: record.thumbnailUrl
      })
    }
  }

  /**
   * 获取所有完整历史记录
   */
  static getFullHistory(): FullHistoryRecord[] {
    try {
      const data = localStorage.getItem(FULL_STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('读取完整历史记录失败:', error)
      return []
    }
  }

  /**
   * 获取指定ID的完整记录
   */
  static getFullRecord(id: string): FullHistoryRecord | null {
    try {
      const fullHistory = this.getFullHistory()
      return fullHistory.find(record => record.id === id) || null
    } catch (error) {
      console.error('获取完整记录失败:', error)
      return null
    }
  }

  /**
   * 检查存储空间是否足够
   */
  static checkStorageSpace(requiredSize: number): boolean {
    try {
      // 估算当前使用的空间
      let currentSize = 0
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key) {
          const value = localStorage.getItem(key)
          if (value) {
            currentSize += key.length + value.length
          }
        }
      }

      return (currentSize + requiredSize) < MAX_STORAGE_SIZE
    } catch (error) {
      console.error('检查存储空间失败:', error)
      return false
    }
  }

  /**
   * 清理旧记录以释放空间
   */
  static cleanOldRecords(): void {
    try {
      const fullHistory = this.getFullHistory()
      if (fullHistory.length > 0) {
        // 删除最旧的记录
        fullHistory.pop()
        localStorage.setItem(FULL_STORAGE_KEY, JSON.stringify(fullHistory))
        
        // 同步删除基础记录
        const history = this.getHistory()
        if (history.length > 0) {
          history.pop()
          localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
        }
        
        console.log('已清理最旧的记录')
      }
    } catch (error) {
      console.error('清理旧记录失败:', error)
    }
  }

  /**
   * 压缩记录数据
   * 简化策略：移除不必要的字段，保留核心内容
   */
  static compressRecord(record: FullHistoryRecord): FullHistoryRecord {
    try {
      const compressed: FullHistoryRecord = {
        ...record,
        // 压缩 guideContent：只保留核心字段
        guideContent: {
          ...record.guideContent,
          sections: record.guideContent.sections.map(section => ({
            ...section,
            // 移除可能的冗余数据
            tables: section.tables || [],
            checklists: section.checklists || []
          }))
        },
        // 压缩 accountData：移除详细的 recentPosts 图片
        accountData: {
          ...record.accountData,
          recentPosts: record.accountData.recentPosts.map(post => ({
            ...post,
            imageUrl: '' // 移除图片URL以节省空间
          }))
        },
        metadata: {
          ...record.metadata,
          compressed: true
        }
      }

      return compressed
    } catch (error) {
      console.error('压缩记录失败:', error)
      return record
    }
  }

  /**
   * 解压记录数据
   * 当前实现：直接返回（因为压缩策略是移除数据，无法恢复）
   */
  static decompressRecord(record: FullHistoryRecord): FullHistoryRecord {
    // 当前压缩策略是移除数据，无需解压
    return record
  }

  /**
   * 导出记录为 JSON
   */
  static exportToJSON(record: FullHistoryRecord): void {
    try {
      const dataStr = JSON.stringify(record, null, 2)
      const blob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${record.accountName}_分析报告_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      console.log('导出 JSON 成功')
    } catch (error) {
      console.error('导出 JSON 失败:', error)
      throw error
    }
  }

  /**
   * 导出记录为 PDF
   * 注意：这个方法需要配合 pdfExporter 使用
   */
  static async exportToPDF(record: FullHistoryRecord): Promise<void> {
    try {
      // 这里需要调用现有的 PDF 导出功能
      // 由于 PDF 导出需要 DOM 元素，这个方法主要是提供接口
      console.log('PDF 导出功能需要在 GuideView 中调用')
      throw new Error('请在指南页面使用导出 PDF 功能')
    } catch (error) {
      console.error('导出 PDF 失败:', error)
      throw error
    }
  }
}
