<template>
  <div class="analysis-view">
    <div class="analysis-container">
      <h2>账号信息确认</h2>
      
      <!-- 分析进度 -->
      <div v-if="isAnalyzing" class="analyzing-section">
        <el-icon class="rotating" :size="48" color="#667eea">
          <Loading />
        </el-icon>
        <p class="analyzing-text">AI 正在分析您的账号数据...</p>
        <el-progress :percentage="analysisProgress" :stroke-width="6" color="#667eea" />
      </div>
      
      <!-- 分析结果 -->
      <div v-else-if="accountData" class="result-section">
        <el-alert
          title="✅ 分析完成！请确认以下信息"
          type="success"
          :closable="false"
          class="success-alert"
        />
        
        <el-form
          ref="formRef"
          :model="formData"
          :rules="rules"
          label-width="100px"
          label-position="left"
          class="data-form"
        >
          <el-form-item label="账号名称" prop="username">
            <el-input
              v-model="formData.username"
              placeholder="请输入账号名称"
            />
          </el-form-item>
          
          <el-form-item label="当前粉丝数" prop="followerCount">
            <el-input-number
              v-model="formData.followerCount"
              :min="0"
              :max="10000000"
              :controls="true"
              style="width: 100%"
            />
          </el-form-item>
          
          <el-form-item label="笔记数" prop="postCount">
            <el-input-number
              v-model="formData.postCount"
              :min="0"
              :max="10000"
              :controls="true"
              style="width: 100%"
            />
          </el-form-item>
          
          <el-form-item label="内容类别" prop="contentCategory">
            <el-select
              v-model="formData.contentCategory"
              placeholder="选择内容类别"
              style="width: 100%"
            >
              <el-option label="美妆护肤" value="美妆" />
              <el-option label="穿搭时尚" value="穿搭" />
              <el-option label="美食探店" value="美食" />
              <el-option label="旅行攻略" value="旅行" />
              <el-option label="知识分享" value="知识分享" />
              <el-option label="生活方式" value="生活方式" />
              <el-option label="健身运动" value="健身" />
              <el-option label="摄影" value="摄影" />
              <el-option label="母婴育儿" value="母婴" />
              <el-option label="家居装修" value="家居" />
              <el-option label="数码科技" value="数码" />
              <el-option label="职场成长" value="职场" />
              <el-option label="其他" value="其他" />
            </el-select>
          </el-form-item>
          
          <!-- 补充信息（可选） -->
          <el-divider>
            <span class="divider-text">📝 补充信息（可选）</span>
          </el-divider>
          
          <el-form-item label="内容描述">
            <el-input
              v-model="formData.contentDirection"
              type="textarea"
              :rows="2"
              placeholder="例如：专注职场穿搭，面向25-35岁职场女性"
            />
          </el-form-item>
          
          <el-form-item label="热门标题">
            <el-input
              v-model="formData.exampleTitles"
              type="textarea"
              :rows="3"
              placeholder="粘贴您的热门笔记标题（每行一个），帮助AI分析内容风格"
            />
          </el-form-item>
        </el-form>
        
        <!-- 验证错误 -->
        <el-alert
          v-if="validationErrors.length > 0"
          title="请修正以下错误"
          type="error"
          :closable="false"
          class="error-alert"
        >
          <ul>
            <li v-for="(error, index) in validationErrors" :key="index">{{ error }}</li>
          </ul>
        </el-alert>
        
        <!-- 操作按钮 - 简化布局 -->
        <div class="action-buttons">
          <el-button
            type="primary"
            size="large"
            :loading="isValidating"
            @click="handleConfirm"
          >
            确认并生成指南
          </el-button>
          <el-button size="large" @click="goBack">返回修改</el-button>
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
          
          <el-divider content-position="left">
            <span style="color: #909399; font-size: 14px;">📝 补充信息（可选，帮助生成更精准的指南）</span>
          </el-divider>
          
          <el-form-item label="内容方向">
            <el-input
              v-model="manualFormData.contentDirection"
              type="textarea"
              :rows="3"
              placeholder="例如：专注于职场穿搭分享，主要面向25-35岁的职场女性，风格偏向简约优雅"
            />
            <div style="color: #909399; font-size: 12px; margin-top: 4px;">
              💡 描述您的内容定位、目标受众、风格特点等
            </div>
          </el-form-item>
          
          <el-form-item label="热门笔记标题">
            <el-input
              v-model="manualFormData.exampleTitles"
              type="textarea"
              :rows="4"
              placeholder="请输入您最近几篇热门笔记的标题，每行一个，例如：&#10;秋冬必备！5套通勤穿搭模板&#10;小个子女生显高秘籍｜158cm穿搭分享&#10;平价好物｜这些单品让你气质翻倍"
            />
            <div style="color: #909399; font-size: 12px; margin-top: 4px;">
              💡 提供3-5个您的热门笔记标题，帮助AI了解您的内容风格
            </div>
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
  contentCategory: '',
  contentDirection: '',
  exampleTitles: ''
})

const manualFormData = reactive({
  username: '',
  followerCount: 0,
  postCount: 0,
  contentCategory: '',
  contentDirection: '',
  exampleTitles: ''
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
  try {
    // 1. 检查权限
    const { usePermission } = await import('@/composables/usePermission')
    const { checkGeneratePermission } = usePermission()
    
    const hasPermission = await checkGeneratePermission()
    if (!hasPermission) {
      await router.push('/login?redirect=/upload')
      return
    }
    
    // 2. 获取上传的图片
    const { useAppStore } = await import('@/stores/appStore')
    const store = useAppStore()
    
    // 优先使用多图，兼容旧版单图
    const images = store.uploadedImages.length > 0 ? store.uploadedImages : 
                   store.uploadedImage ? [{ dataUrl: store.uploadedImage }] : []
    
    if (images.length === 0) {
      await router.push('/')
      return
    }
    
    uploadedImageUrl.value = images[0].dataUrl
    
    // 3. 分析第一张图片（主页截图）
    await analyzeImage(images[0].dataUrl)
  } catch (error) {
    console.error('初始化失败:', error)
    await router.push('/')
  }
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
    
    // 检查 API 配置（异步）
    const isConfigured = await aiService.isConfiguredAsync()
    if (!isConfigured) {
      console.error('❌ API 未配置')
      isAnalyzing.value = false
      accountData.value = null
      ElMessage.error({
        message: 'AI 服务未配置，请联系管理员。您可以使用手动输入功能继续。',
        duration: 5000,
        showClose: true
      })
      // 自动显示手动输入选项
      setTimeout(() => {
        showManualDialog.value = true
      }, 1000)
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
    
    // 判断错误类型并提供具体的错误消息
    let errorMessage = '图像分析失败'
    let showManualInputOption = true
    
    if (error instanceof Error) {
      const msg = error.message.toLowerCase()
      
      if (msg.includes('network') || msg.includes('fetch') || msg.includes('econnrefused')) {
        errorMessage = '网络连接失败，请检查网络后重试'
      } else if (msg.includes('timeout')) {
        errorMessage = '请求超时，请稍后重试'
      } else if (msg.includes('配置') || msg.includes('api key') || msg.includes('configured')) {
        errorMessage = 'AI 服务未配置，请联系管理员'
      } else if (msg.includes('503') || msg.includes('overload') || msg.includes('繁忙')) {
        errorMessage = 'AI 服务繁忙，请稍后重试'
      } else if (msg.includes('429') || msg.includes('rate limit')) {
        errorMessage = 'API 调用频率超限，请稍后重试'
      } else if (msg.includes('parse') || msg.includes('json')) {
        errorMessage = 'AI 返回格式错误，请重试'
      } else {
        errorMessage = error.message || '图像分析失败，请重试'
      }
    }
    
    ElMessage.error({
      message: `${errorMessage}。您可以使用手动输入功能继续。`,
      duration: 6000,
      showClose: true
    })
    
    // 如果是配置错误，自动显示手动输入
    if (showManualInputOption && errorMessage.includes('配置')) {
      setTimeout(() => {
        showManualDialog.value = true
      }, 1500)
    }
  }
}

// 返回首页
const goBack = () => {
  router.push('/')
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
  padding: 80px 20px 40px;
  background: var(--bg-secondary, #f8fafc);
}

.analysis-container {
  max-width: 640px;
  width: 100%;
  margin: 0 auto;
  background: var(--bg-primary, white);
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--border-light, #e5e7eb);
}

h2 {
  font-size: 1.5rem;
  color: var(--text-primary, #1f2937);
  margin: 0 0 24px 0;
  text-align: center;
  font-weight: 600;
}

.analyzing-section {
  text-align: center;
  padding: 48px 20px;
}

.rotating {
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.analyzing-text {
  font-size: 1rem;
  color: var(--text-secondary, #6b7280);
  margin: 20px 0;
}

.result-section {
  margin-top: 20px;
}

.success-alert {
  margin-bottom: 20px;
  border-radius: 8px;
}

.data-form {
  margin: 20px 0;
}

.data-form :deep(.el-form-item__label) {
  font-weight: 500;
  color: var(--text-primary, #374151);
}

.data-form :deep(.el-input__wrapper),
.data-form :deep(.el-select .el-input__wrapper) {
  border-radius: 8px;
}

.divider-text {
  font-size: 0.8rem;
  color: var(--text-tertiary, #9ca3af);
}

.data-form :deep(.el-divider) {
  margin: 20px 0;
}

.data-form :deep(.el-textarea__inner) {
  border-radius: 8px;
}

.error-alert {
  margin: 16px 0;
  border-radius: 8px;
}

.error-alert ul {
  margin: 8px 0 0 16px;
  padding: 0;
}

.error-alert li {
  margin: 4px 0;
}

/* 按钮区域 - 统一布局 */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
}

.action-buttons .el-button {
  width: 100%;
  height: 44px;
  border-radius: 8px;
  font-weight: 500;
}

.action-buttons .el-button--primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.action-buttons .el-button--primary:hover {
  opacity: 0.9;
}

.action-buttons .el-button--default {
  background: var(--bg-secondary, #f3f4f6);
  border: 1px solid var(--border-light, #e5e7eb);
  color: var(--text-secondary, #6b7280);
}

.error-section {
  padding: 32px 16px;
}

.error-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.error-actions .el-button {
  width: 100%;
  height: 44px;
  border-radius: 8px;
}

.error-tips {
  max-width: 100%;
  margin: 0;
  text-align: left;
  background: var(--bg-secondary, #f9fafb);
  padding: 20px;
  border-radius: 12px;
  border-left: 3px solid #667eea;
}

.error-tips h4 {
  margin: 0 0 12px 0;
  color: var(--text-primary, #1f2937);
  font-size: 0.9rem;
}

.error-tips ul {
  margin: 0;
  padding-left: 16px;
}

.error-tips li {
  margin: 6px 0;
  color: var(--text-secondary, #6b7280);
  line-height: 1.5;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .analysis-view {
    padding: 70px 16px 24px;
  }
  
  .analysis-container {
    padding: 20px;
    border-radius: 12px;
  }
  
  h2 {
    font-size: 1.25rem;
    margin-bottom: 16px;
  }
  
  .analyzing-section {
    padding: 32px 16px;
  }
  
  .data-form :deep(.el-form-item__label) {
    font-size: 0.875rem;
  }
}
</style>
