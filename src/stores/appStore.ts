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
  
  // 上传的图片（兼容旧版单图）
  const uploadedImage = ref<string | null>(savedData.uploadedImage || null)
  const uploadedFile = ref<File | null>(null)
  
  // 上传的多张图片（新版）
  const uploadedImages = ref<Array<{ dataUrl: string; file?: File }>>(savedData.uploadedImages || [])
  
  // 账号数据
  const accountData = ref<AccountData | null>(savedData.accountData || null)
  
  // 指南内容
  const guideContent = ref<GuideContent | null>(savedData.guideContent || null)
  
  // 保存到 localStorage
  const saveToStorage = () => {
    try {
      const data = {
        uploadedImage: uploadedImage.value,
        uploadedImages: uploadedImages.value.map(img => ({ dataUrl: img.dataUrl })), // 不保存 File 对象
        accountData: accountData.value,
        guideContent: guideContent.value
      }
      localStorage.setItem('xiaohongshu-guide-data', JSON.stringify(data))
      console.log('💾 数据已保存')
    } catch (error) {
      console.error('保存数据失败:', error)
    }
  }
  
  // 设置上传的图片（单图，兼容旧版）
  function setUploadedImage(imageUrl: string, file: File) {
    uploadedImage.value = imageUrl
    uploadedFile.value = file
    // 同时设置为多图格式
    uploadedImages.value = [{ dataUrl: imageUrl, file }]
    saveToStorage()
  }
  
  // 设置上传的多张图片（新版）
  function setUploadedImages(images: Array<{ dataUrl: string; file: File }>) {
    uploadedImages.value = images
    // 兼容旧版，设置第一张为主图
    if (images.length > 0) {
      uploadedImage.value = images[0].dataUrl
      uploadedFile.value = images[0].file
    }
    saveToStorage()
  }
  
  // 设置账号数据
  function setAccountData(data: AccountData) {
    accountData.value = data
    saveToStorage()
  }
  
  // 设置指南内容
  function setGuideContent(content: GuideContent | null) {
    guideContent.value = content
    if (content) {
      saveToStorage()
    } else {
      // 清除指南内容时,只清除指南,保留其他数据
      const data = {
        uploadedImage: uploadedImage.value,
        uploadedImages: uploadedImages.value.map(img => ({ dataUrl: img.dataUrl })),
        accountData: accountData.value,
        guideContent: null
      }
      localStorage.setItem('xiaohongshu-guide-data', JSON.stringify(data))
    }
  }
  
  // 清空所有数据
  function clearAll() {
    uploadedImage.value = null
    uploadedFile.value = null
    uploadedImages.value = []
    accountData.value = null
    guideContent.value = null
    localStorage.removeItem('xiaohongshu-guide-data')
    console.log('🗑️ 数据已清空')
  }
  
  return {
    uploadedImage,
    uploadedFile,
    uploadedImages,
    accountData,
    guideContent,
    setUploadedImage,
    setUploadedImages,
    setAccountData,
    setGuideContent,
    clearAll
  }
})
