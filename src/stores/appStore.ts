import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AccountData, GuideContent } from '@/types'

export const useAppStore = defineStore('app', () => {
  // 从 localStorage 恢复数据
  const loadFromStorage = () => {
    try {
      const saved = localStorage.getItem('xiaohongshu-guide-data')
      if (saved) {
        const data = JSON.parse(saved)
        return data
      }
    } catch (error) {
      console.error('恢复数据失败:', error)
    }
    return {}
  }
  
  const savedData = loadFromStorage()
  
  // 上传的图片
  const uploadedImage = ref<string | null>(savedData.uploadedImage || null)
  const uploadedFile = ref<File | null>(null)
  
  // 账号数据
  const accountData = ref<AccountData | null>(savedData.accountData || null)
  
  // 指南内容
  const guideContent = ref<GuideContent | null>(savedData.guideContent || null)
  
  // 保存到 localStorage
  const saveToStorage = () => {
    try {
      const data = {
        uploadedImage: uploadedImage.value,
        accountData: accountData.value,
        guideContent: guideContent.value
      }
      localStorage.setItem('xiaohongshu-guide-data', JSON.stringify(data))
      console.log('💾 数据已保存')
    } catch (error) {
      console.error('保存数据失败:', error)
    }
  }
  
  // 设置上传的图片
  function setUploadedImage(imageUrl: string, file: File) {
    uploadedImage.value = imageUrl
    uploadedFile.value = file
    saveToStorage()
  }
  
  // 设置账号数据
  function setAccountData(data: AccountData) {
    accountData.value = data
    saveToStorage()
  }
  
  // 设置指南内容
  function setGuideContent(content: GuideContent) {
    guideContent.value = content
    saveToStorage()
  }
  
  // 清空所有数据
  function clearAll() {
    uploadedImage.value = null
    uploadedFile.value = null
    accountData.value = null
    guideContent.value = null
    localStorage.removeItem('xiaohongshu-guide-data')
    console.log('🗑️ 数据已清空')
  }
  
  return {
    uploadedImage,
    uploadedFile,
    accountData,
    guideContent,
    setUploadedImage,
    setAccountData,
    setGuideContent,
    clearAll
  }
})
