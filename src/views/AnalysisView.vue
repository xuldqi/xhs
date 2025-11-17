<template>
  <div class="analysis-view">
    <div class="analysis-container">
      <h2>账号数据分析</h2>
      
      <!-- 分析进度 -->
      <div v-if="isAnalyzing" class="analyzing-section">
        <el-icon class="rotating" :size="60" color="#409EFF">
          <Loading />
        </el-icon>
        <p class="analyzing-text">AI 正在分析您的账号数据...</p>
        <el-progress :percentage="analysisProgress" :stroke-width="8" />
      </div>
      
      <!-- 分析结果 -->
      <div v-else-if="accountData" class="result-section">
        <el-alert
          title="分析完成！请确认或修改以下信息"
          type="success"
          :closable="false"
          class="success-alert"
        />
        
        <el-form
          ref="formRef"
          :model="formData"
          :rules="rules"
          label-width="120px"
          class="data-form"
        >
          <el-form-item label="账号名称" prop="username">
            <el-input
              v-model="formData.username"
              placeholder="请输入账号名称"
              :disabled="!isEditing"
            />
          </el-form-item>
          
          <el-form-item label="当前粉丝数" prop="followerCount">
            <el-input-number
              v-model="formData.followerCount"
              :min="0"
              :max="1000000"
              :disabled="!isEditing"
              style="width: 100%"
            />
          </el-form-item>
          
          <el-form-item label="发布笔记数" prop="postCount">
            <el-input-number
              v-model="formData.postCount"
              :min="0"
              :max="10000"
              :disabled="!isEditing"
              style="width: 100%"
            />
          </el-form-item>
          
          <el-form-item label="内容类别" prop="contentCategory">
            <el-select
              v-model="formData.contentCategory"
              placeholder="请选择内容类别"
              :disabled="!isEditing"
              style="width: 100%"
            >
              <el-option label="美妆" value="美妆" />
              <el-option label="穿搭" value="穿搭" />
              <el-option label="美食" value="美食" />
              <el-option label="旅行" value="旅行" />
              <el-option label="知识分享" value="知识分享" />
              <el-option label="生活方式" value="生活方式" />
              <el-option label="健身" value="健身" />
              <el-option label="摄影" value="摄影" />
              <el-option label="其他" value="其他" />
            </el-select>
          </el-form-item>
        </el-form>
        
        <!-- 验证错误 -->
        <el-alert
          v-if="validationErrors.length > 0"
          title="请修正以下错误："
          type="error"
          :closable="false"
          class="error-alert"
        >
          <ul>
            <li v-for="(error, index) in validationErrors" :key="index">
              {{ error }}
            </li>
          </ul>
        </el-alert>
        
        <!-- 操作按钮 -->
        <div class="action-buttons">
          <el-button size="large" @click="goBack">返回</el-button>
          <el-button
            v-if="!isEditing"
            size="large"
            @click="isEditing = true"
          >
            修改信息
          </el-button>
          <el-button
            v-if="isEditing"
            size="large"
            @click="cancelEdit"
          >
            取消修改
          </el-button>
          <el-button
            type="primary"
            size="large"
            :loading="isValidating"
            @click="handleConfirm"
          >
            确认并生成指南
          </el-button>
        </div>
      </div>
      
      <!-- 分析失败 -->
      <div v-else class="error-section">
        <el-result
          icon="error"
          title="图像识别失败"
          sub-title="可能原因：网络连接问题、图片不清晰、或 AI 服务暂时不可用"
        >
          <template #extra>
            <div class="error-actions">
              <el-button type="primary" size="large" @click="showManualInput">
                <el-icon><Edit /></el-icon>
                手动输入账号信息
              </el-button>
              <el-button size="large" @click="handleRetry">
                <el-icon><Refresh /></el-icon>
                重新识别
              </el-button>
              <el-button size="large" @click="goBack">
                <el-icon><Back /></el-icon>
                返回重新上传
              </el-button>
            </div>
            
            <div class="error-tips">
              <h4>💡 建议：</h4>
              <ul>
                <li>确保上传的是小红书个人主页的完整截图</li>
                <li>截图需包含账号名、粉丝数、笔记数等信息</li>
                <li>图片清晰度要足够，避免模糊或遮挡</li>
                <li>如果多次失败，可以选择手动输入信息</li>
              </ul>
            </div>
          </template>
        </el-result>
      </div>
      
      <!-- 手动输入对话框 -->
      <el-dialog
        v-model="showManualDialog"
        title="手动输入账号信息"
        width="600px"
      >
        <el-form
          ref="manualFormRef"
          :model="manualFormData"
          :rules="rules"
          label-width="120px"
        >
          <el-form-item label="账号名称" prop="username">
            <el-input
              v-model="manualFormData.username"
              placeholder="请输入账号名称"
            />
          </el-form-item>
          
          <el-form-item label="当前粉丝数" prop="followerCount">
            <el-input-number
              v-model="manualFormData.followerCount"
              :min="0"
              :max="1000000"
              style="width: 100%"
            />
          </el-form-item>
          
          <el-form-item label="发布笔记数" prop="postCount">
            <el-input-number
              v-model="manualFormData.postCount"
              :min="0"
              :max="10000"
              style="width: 100%"
            />
          </el-form-item>
          
          <el-form-item label="内容类别" prop="contentCategory">
            <el-select
              v-model="manualFormData.contentCategory"
              placeholder="请选择内容类别"
              style="width: 100%"
            >
              <el-option label="美妆" value="美妆" />
              <el-option label="穿搭" value="穿搭" />
              <el-option label="美食" value="美食" />
              <el-option label="旅行" value="旅行" />
              <el-option label="知识分享" value="知识分享" />
              <el-option label="生活方式" value="生活方式" />
              <el-option label="健身" value="健身" />
              <el-option label="摄影" value="摄影" />
              <el-option label="其他" value="其他" />
            </el-select>
          </el-form-item>
        </el-form>
        
        <template #footer>
          <el-button @click="showManualDialog = false">取消</el-button>
          <el-button type="primary" @click="handleManualSubmit">
            确认
          </el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Loading, Edit, Refresh, Back } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { AccountData } from '@/types'

const router = useRouter()
const uploadedImageUrl = ref<string>('')

// 状态
const isAnalyzing = ref(true)
const analysisProgress = ref(0)
const accountData = ref<AccountData | null>(null)
const isEditing = ref(false)
const isValidating = ref(false)
const validationErrors = ref<string[]>([])
const showManualDialog = ref(false)

// 表单引用
const formRef = ref<FormInstance>()
const manualFormRef = ref<FormInstance>()

// 表单数据
const formData = reactive({
  username: '',
  followerCount: 0,
  postCount: 0,
  contentCategory: ''
})

const manualFormData = reactive({
  username: '',
  followerCount: 0,
  postCount: 0,
  contentCategory: ''
})

// 表单验证规则
const rules: FormRules = {
  username: [
    { required: true, message: '请输入账号名称', trigger: 'blur' },
    { min: 2, max: 50, message: '账号名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  followerCount: [
    { required: true, message: '请输入粉丝数', trigger: 'blur' },
    { type: 'number', min: 0, message: '粉丝数不能为负数', trigger: 'blur' }
  ],
  postCount: [
    { required: true, message: '请输入笔记数', trigger: 'blur' },
    { type: 'number', min: 0, message: '笔记数不能为负数', trigger: 'blur' }
  ],
  contentCategory: [
    { required: true, message: '请选择内容类别', trigger: 'change' }
  ]
}

// 开始分析
onMounted(async () => {
  const { useAppStore } = await import('@/stores/appStore')
  const store = useAppStore()
  
  // 优先使用多图，兼容旧版单图
  const images = store.uploadedImages.length > 0 ? store.uploadedImages : 
                 store.uploadedImage ? [{ dataUrl: store.uploadedImage }] : []
  
  if (images.length === 0) {
    router.push('/')
    return
  }
  
  uploadedImageUrl.value = images[0].dataUrl
  // 分析第一张图片（主页截图）
  await analyzeImage(images[0].dataUrl)
})

const analyzeImage = async (imageDataUrl: string) => {
  try {
    isAnalyzing.value = true
    analysisProgress.value = 20
    
    const { aiService } = await import('@/services/aiService')
    const { IMAGE_ANALYSIS_PROMPT } = await import('@/services/promptTemplates')
    const { ElMessage } = await import('element-plus')
    
    console.log('🔍 开始图像分析...')
    console.log('📡 API 配置状态:', aiService.isConfigured())
    
    // 检查 API 配置
    if (!aiService.isConfigured()) {
      console.error('❌ API 未配置')
      isAnalyzing.value = false
      accountData.value = null
      ElMessage.error({
        message: 'AI 服务未配置，请联系管理员配置 API 密钥',
        duration: 5000,
        showClose: true
      })
      return
    }
    
    console.log('✅ API 已配置，开始调用...')
    
    analysisProgress.value = 40
    
    // 提取 base64
    const base64 = imageDataUrl.split(',')[1]
    
    analysisProgress.value = 60
    
    console.log('📤 发送图像分析请求...')
    
    // 调用 AI 分析
    const response = await aiService.analyzeImage({
      image: base64,
      prompt: IMAGE_ANALYSIS_PROMPT
    })
    
    console.log('📥 收到分析响应:', response)
    
    analysisProgress.value = 90
    
    if (response.success && response.data) {
      console.log('✅ 分析成功:', response.data)
      accountData.value = response.data
      Object.assign(formData, response.data)
      analysisProgress.value = 100
      setTimeout(() => {
        isAnalyzing.value = false
      }, 300)
    } else {
      console.error('❌ AI 分析失败:', response.error)
      isAnalyzing.value = false
      accountData.value = null
      ElMessage.error({
        message: response.error || 'AI 无法识别图片内容，请确保上传的是小红书主页截图',
        duration: 5000,
        showClose: true
      })
    }
    
  } catch (error) {
    console.error('❌ 分析失败:', error)
    isAnalyzing.value = false
    accountData.value = null
    
    const { ElMessage } = await import('element-plus')
    
    // 判断错误类型
    let errorMessage = '图像分析失败，请重试'
    
    if (error instanceof Error) {
      if (error.message.includes('fetch') || error.message.includes('network')) {
        errorMessage = '网络连接失败，请检查网络后重试'
      } else if (error.message.includes('timeout')) {
        errorMessage = '请求超时，请稍后重试'
      } else if (error.message.includes('API')) {
        errorMessage = 'API 服务异常，请稍后重试或联系管理员'
      } else {
        errorMessage = error.message
      }
    }
    
    ElMessage.error({
      message: errorMessage,
      duration: 5000,
      showClose: true
    })
  }
}

// 返回
const goBack = () => {
  router.push('/upload')
}

// 取消编辑
const cancelEdit = () => {
  isEditing.value = false
  if (accountData.value) {
    Object.assign(formData, accountData.value)
  }
  validationErrors.value = []
}

// 确认数据
const handleConfirm = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    validationErrors.value = []
    isValidating.value = true
    
    // 保存数据到 store
    const { useAppStore } = await import('@/stores/appStore')
    const store = useAppStore()
    store.setAccountData({
      ...formData,
      recentPosts: [],
      analysisDate: new Date()
    })
    
    // 保存到历史记录
    const { HistoryManager } = await import('@/utils/historyManager')
    HistoryManager.saveRecord({
      accountName: formData.username,
      followers: formData.followerCount,
      notes: formData.postCount,
      category: formData.contentCategory
    })
    
    setTimeout(() => {
      isValidating.value = false
      router.push('/guide')
    }, 500)
  } catch (error) {
    validationErrors.value = ['请填写所有必填项']
    isValidating.value = false
  }
}

// 显示手动输入
const showManualInput = () => {
  showManualDialog.value = true
}

// 手动提交
const handleManualSubmit = async () => {
  if (!manualFormRef.value) return
  
  try {
    await manualFormRef.value.validate()
    accountData.value = {
      ...manualFormData,
      recentPosts: [],
      analysisDate: new Date()
    }
    Object.assign(formData, accountData.value)
    showManualDialog.value = false
    
    const { ElMessage } = await import('element-plus')
    ElMessage.success('账号信息已保存')
  } catch (error) {
    // 验证失败
  }
}

// 重新识别
const handleRetry = async () => {
  if (uploadedImageUrl.value) {
    await analyzeImage(uploadedImageUrl.value)
  }
}
</script>

<style scoped>
.analysis-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: #f5f7fa;
}

.analysis-container {
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
  margin-bottom: 2rem;
  text-align: center;
}

.analyzing-section {
  text-align: center;
  padding: 60px 20px;
}

.rotating {
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.analyzing-text {
  font-size: 1.2rem;
  color: #666;
  margin: 2rem 0;
}

.result-section {
  margin-top: 2rem;
}

.success-alert {
  margin-bottom: 2rem;
}

.data-form {
  margin: 2rem 0;
}

.error-alert {
  margin: 1rem 0;
}

.error-alert ul {
  margin: 0.5rem 0 0 1rem;
  padding: 0;
}

.error-alert li {
  margin: 0.25rem 0;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}

.error-section {
  padding: 40px 20px;
}

.error-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.error-tips {
  max-width: 600px;
  margin: 0 auto;
  text-align: left;
  background: #f9fafb;
  padding: 24px;
  border-radius: 12px;
  border-left: 4px solid #409EFF;
}

.error-tips h4 {
  margin: 0 0 12px 0;
  color: #1f2937;
  font-size: 1rem;
}

.error-tips ul {
  margin: 0;
  padding-left: 20px;
}

.error-tips li {
  margin: 8px 0;
  color: #6b7280;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .analysis-container {
    padding: 20px;
  }
  
  h2 {
    font-size: 1.5rem;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .action-buttons .el-button {
    width: 100%;
  }
}
</style>
