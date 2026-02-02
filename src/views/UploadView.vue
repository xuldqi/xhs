<template>
  <div class="upload-view">
    <Breadcrumb />
    <div class="upload-container">
      <h2>上传小红书主页截图</h2>
      <p class="subtitle">支持 PNG、JPG、JPEG 格式，文件大小不超过 10MB</p>
      
      <!-- 拖拽上传区域 -->
      <div
        class="upload-area"
        :class="{ 'is-dragging': isDragging, 'has-file': previewUrl }"
        @drop.prevent="handleDrop"
        @dragover.prevent="handleDragOver"
        @dragleave.prevent="handleDragLeave"
        @click="triggerFileInput"
      >
        <input
          ref="fileInputRef"
          type="file"
          accept=".png,.jpg,.jpeg"
          style="display: none"
          @change="handleFileSelect"
        />
        
        <!-- 预览图片 -->
        <div v-if="previewUrl" class="preview-container">
          <img :src="previewUrl" alt="预览图" class="preview-image" />
          <div class="preview-overlay">
            <el-button type="primary" @click.stop="triggerFileInput">
              重新选择
            </el-button>
          </div>
        </div>
        
        <!-- 上传提示 -->
        <div v-else class="upload-prompt">
          <el-icon :size="60" color="#FF2442">
            <Upload />
          </el-icon>
          <p class="prompt-text">拖拽图片到此处，或点击选择文件</p>
          <p class="prompt-hint">支持 PNG、JPG、JPEG 格式</p>
        </div>
      </div>
      
      <!-- 上传进度 -->
      <div v-if="isUploading" class="upload-progress">
        <el-progress :percentage="uploadProgress" :stroke-width="8" />
        <p class="progress-text">上传中... {{ uploadProgress }}%</p>
      </div>
      
      <!-- 错误提示 -->
      <el-alert
        v-if="error"
        :title="error"
        type="error"
        :closable="true"
        @close="error = null"
        class="error-alert"
      />
      
      <!-- 隐私声明 -->
      <div class="privacy-notice">
        <el-icon><Lock /></el-icon>
        <span>{{ PRIVACY_NOTICE }}</span>
      </div>
      
      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button size="large" @click="goBack">返回</el-button>
        <el-button
          type="primary"
          size="large"
          :disabled="!previewUrl || isUploading"
          @click="handleNext"
        >
          下一步：分析账号
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Upload, Lock } from '@element-plus/icons-vue'
import { PRIVACY_NOTICE } from '@/types'
import Breadcrumb from '@/components/Breadcrumb.vue'

const router = useRouter()

// 状态
const isDragging = ref(false)
const isUploading = ref(false)
const uploadProgress = ref(0)
const previewUrl = ref<string | null>(null)
const error = ref<string | null>(null)
const fileInputRef = ref<HTMLInputElement>()
const currentFile = ref<File | null>(null)

// 触发文件选择
const triggerFileInput = () => {
  fileInputRef.value?.click()
}

// 处理文件选择
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    processFile(file)
  }
}

// 处理拖拽放置
const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  const file = event.dataTransfer?.files[0]
  if (file) {
    processFile(file)
  }
}

// 处理拖拽悬停
const handleDragOver = () => {
  isDragging.value = true
}

// 处理拖拽离开
const handleDragLeave = () => {
  isDragging.value = false
}

// 处理文件
const processFile = async (file: File) => {
  error.value = null
  
  try {
    // 验证文件
    const { validateFile, validateImageDimensions } = await import('@/utils/fileValidator')
    const validation = validateFile(file)
    
    if (!validation.valid) {
      error.value = validation.error || '文件验证失败'
      return
    }
    
    // 验证图片尺寸
    const dimensionCheck = await validateImageDimensions(file)
    if (!dimensionCheck.valid) {
      error.value = dimensionCheck.error || '图片尺寸不符合要求'
      return
    }
    
    // 开始处理
    isUploading.value = true
    uploadProgress.value = 20
    
    // 压缩图片
    const { compressImage } = await import('@/utils/imageProcessor')
    uploadProgress.value = 40
    
    const compressed = await compressImage(file, 1920, 1920, 0.85)
    uploadProgress.value = 70
    
    // 生成预览
    previewUrl.value = compressed.dataUrl
    currentFile.value = file
    uploadProgress.value = 100
    
    // 延迟隐藏进度条
    setTimeout(() => {
      isUploading.value = false
    }, 300)
    
  } catch (err) {
    error.value = err instanceof Error ? err.message : '处理失败，请重试'
    isUploading.value = false
    uploadProgress.value = 0
  }
}

// 返回
const goBack = () => {
  router.push('/')
}

// 下一步
const handleNext = async () => {
  if (previewUrl.value && currentFile.value) {
    // 保存图片到 store
    const { useAppStore } = await import('@/stores/appStore')
    const store = useAppStore()
    store.setUploadedImage(previewUrl.value, currentFile.value)
    
    router.push('/analysis')
  }
}
</script>

<style scoped>
.upload-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.upload-container {
  max-width: 800px;
  width: 100%;
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

h2 {
  font-size: 2rem;
  color: #333;
  margin-bottom: 0.5rem;
  text-align: center;
}

.subtitle {
  color: #666;
  text-align: center;
  margin-bottom: 2rem;
}

.upload-area {
  border: 3px dashed #dcdfe6;
  border-radius: 12px;
  padding: 60px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;
  position: relative;
  overflow: hidden;
}

.upload-area:hover {
  border-color: #FF2442;
  background: #f0f9ff;
}

.upload-area.is-dragging {
  border-color: #FF2442;
  background: #e6f7ff;
  transform: scale(1.02);
}

.upload-area.has-file {
  padding: 0;
  border: none;
}

.preview-container {
  position: relative;
  width: 100%;
  max-height: 500px;
}

.preview-image {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 12px;
}

.preview-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 12px;
}

.preview-container:hover .preview-overlay {
  opacity: 1;
}

.upload-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.prompt-text {
  font-size: 1.2rem;
  color: #333;
  margin: 0;
}

.prompt-hint {
  font-size: 0.9rem;
  color: #999;
  margin: 0;
}

.upload-progress {
  margin-top: 2rem;
}

.progress-text {
  text-align: center;
  margin-top: 0.5rem;
  color: #666;
}

.error-alert {
  margin-top: 1rem;
}

.privacy-notice {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 2rem;
  padding: 12px;
  background: #f0f9ff;
  border-radius: 8px;
  color: #FF2442;
  font-size: 0.9rem;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .upload-container {
    padding: 20px;
  }
  
  h2 {
    font-size: 1.5rem;
  }
  
  .upload-area {
    padding: 40px 20px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .action-buttons .el-button {
    width: 100%;
  }
}
</style>
