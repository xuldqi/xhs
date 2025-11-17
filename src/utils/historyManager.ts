/**
 * 历史记录管理工具
 * 使用 localStorage 保存最近的分析记录
 */

export interface HistoryRecord {
  id: string
  accountName: string
  followers: number
  notes: number
  category: string
  createdAt: string
  thumbnailUrl?: string
}

const STORAGE_KEY = 'xhs_guide_history'
const MAX_RECORDS = 5

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
}
