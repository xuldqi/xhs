<template>
  <div class="analysis-view">
    <div class="analysis-container">
      <h2>账号数据分析</h2>
      
      <!-- 分析进度 -->
      <div v-if="isAnalyzing" class="analyzing-section">
        <AnalysisStatus :progress="analysisProgress" />
      </div>
      
      <!-- 分析结果 -->
      <div v-else-if="accountData" class="result-section">
        <div class="result-header">
          <img :src="uploadedImageUrl" alt="用户头像" class="user-avatar" />
          <h3>请核对 AI 分析结果</h3>
          <p>确认信息无误后，即可生成专属您的增长指南</p>
        </div>

        <div class="data-cards">
          <div class="data-card">
            <div class="card-label">账号名称</div>
            <div class="card-value">
              <el-input v-if="isEditing" v-model="formData.username" size="large" />
              <span v-else>{{ formData.username }}</span>
            </div>
          </div>
          <div class="data-card">
            <div class="card-label">当前粉丝数</div>
            <div class="card-value">
              <el-input-number v-if="isEditing" v-model="formData.followerCount" size="large" :min="0" />
              <span v-else>{{ formData.followerCount }}</span>
            </div>
          </div>
          <div class="data-card">
            <div class="card-label">发布笔记数</div>
            <div class="card-value">
              <el-input-number v-if="isEditing" v-model="formData.postCount" size="large" :min="0" />
              <span v-else>{{ formData.postCount }}</span>
            </div>
          </div>
          <div class="data-card">
            <div class="card-label">内容类别</div>
            <div class="card-value">
              <el-select v-if="isEditing" v-model="formData.contentCategory" placeholder="请选择" size="large">
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
              <span v-else>{{ formData.contentCategory }}</span>
            </div>
          </div>
        </div>
        
        <div class="action-buttons">
          <button class="btn-secondary" @click="goBack">返回</button>
          <button v-if="!isEditing" class="btn-secondary" @click="isEditing = true">修改信息</button>
          <button v-if="isEditing" class="btn-secondary" @click="cancelEdit">取消修改</button>
          <button class="btn-primary" :disabled="isValidating" @click="handleConfirm">
            <span v-if="isValidating">正在生成...</span>
            <span v-else>确认并生成指南</span>
          </button>
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
import { Loading, Edit, Refresh, Back } from '@element-plus/icons-vue';
import AnalysisStatus from '@/components/AnalysisStatus.vue';
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

// 返回
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
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.analysis-container {
  max-width: 800px;
  width: 100%;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.analyzing-section {
  padding: 40px 0;
}

/* Result Section */
.result-section {
  text-align: center;
}

.result-header {
  margin-bottom: 30px;
}

.user-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  margin: 0 auto 20px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  border: 3px solid white;
}

.result-header h3 {
  font-size: 1.8rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.result-header p {
  font-size: 1rem;
  color: #666;
  max-width: 400px;
  margin: 0 auto;
}

.data-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.data-card {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 15px;
  padding: 20px;
  text-align: left;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.card-label {
  font-size: 0.9rem;
  color: #888;
  margin-bottom: 10px;
}

.card-value span {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
}

.card-value .el-input,
.card-value .el-input-number,
.card-value .el-select {
  width: 100%;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-primary, .btn-secondary {
  padding: 12px 28px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(118, 75, 162, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(118, 75, 162, 0.4);
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.btn-secondary {
  background: #f1f1f1;
  color: #555;
  border: 1px solid #ddd;
}

.btn-secondary:hover {
  background: #e9e9e9;
  border-color: #ccc;
}


/* Error Section */
.error-section {
  padding: 40px 0;
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
  border-left: 4px solid #667eea;
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

/* Responsive */
@media (max-width: 768px) {
  .analysis-container {
    padding: 20px;
    margin: 20px;
  }
  
  .data-cards {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .action-buttons button {
    width: 100%;
  }

  .result-header h3 {
    font-size: 1.5rem;
  }

  .result-header p {
    font-size: 0.9rem;
  }
}
</style>
