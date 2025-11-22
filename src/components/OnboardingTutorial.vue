<template>
  <el-dialog
    v-model="visible"
    title="🎉 欢迎使用小红书涨粉助手"
    width="90%"
    :style="{ maxWidth: '600px' }"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="currentStep === steps.length - 1"
  >
    <div class="tutorial-content">
      <div class="step-indicator">
        <div
          v-for="(step, index) in steps"
          :key="index"
          class="step-dot"
          :class="{ active: index === currentStep, completed: index < currentStep }"
        ></div>
      </div>

      <div class="step-content">
        <div class="step-icon">{{ steps[currentStep].icon }}</div>
        <h3>{{ steps[currentStep].title }}</h3>
        <p>{{ steps[currentStep].description }}</p>
        
        <div v-if="steps[currentStep].image" class="step-image">
          <img :src="steps[currentStep].image" :alt="steps[currentStep].title" />
        </div>

        <div v-if="steps[currentStep].tips" class="step-tips">
          <div v-for="(tip, index) in steps[currentStep].tips" :key="index" class="tip-item">
            <el-icon color="#67C23A"><CircleCheck /></el-icon>
            <span>{{ tip }}</span>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="tutorial-footer">
        <el-button v-if="currentStep > 0" @click="prevStep">上一步</el-button>
        <el-button v-if="currentStep < steps.length - 1" type="primary" @click="nextStep">
          下一步
        </el-button>
        <el-button v-else type="primary" @click="finish">开始使用</el-button>
        <el-button v-if="currentStep < steps.length - 1" text @click="skip">跳过教程</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { CircleCheck } from '@element-plus/icons-vue'

const visible = ref(false)
const currentStep = ref(0)

const steps = [
  {
    icon: '📸',
    title: '第一步：准备截图',
    description: '打开小红书App，进入你的个人主页，截取完整屏幕',
    tips: [
      '确保截图包含账号名称',
      '确保能看到粉丝数和笔记数',
      '建议使用竖屏截图，更清晰'
    ]
  },
  {
    icon: '⬆️',
    title: '第二步：上传图片',
    description: '将截图上传到工具，支持1-3张图片',
    tips: [
      '第一张必须是主页截图',
      '其他图片可以是笔记列表',
      '支持拖拽上传，更方便'
    ]
  },
  {
    icon: '🤖',
    title: '第三步：AI分析',
    description: 'AI会自动识别你的账号信息，你可以确认或修改',
    tips: [
      '识别准确率超过95%',
      '可以手动修正任何信息',
      '分析过程约10秒完成'
    ]
  },
  {
    icon: '📋',
    title: '第四步：获取指南',
    description: 'AI生成12章节完整指南，包含诊断、计划、技巧等',
    tips: [
      '生成过程约3-5分钟',
      '可以随时导出为PDF',
      '支持分享给朋友'
    ]
  },
  {
    icon: '🎯',
    title: '开始你的涨粉之旅！',
    description: '现在你已经了解如何使用了，让我们开始吧！',
    tips: [
      '完全免费使用',
      '数据不会被存储',
      '随时可以重新生成'
    ]
  }
]

const nextStep = () => {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const skip = () => {
  localStorage.setItem('onboarding_completed', 'true')
  visible.value = false
}

const finish = () => {
  localStorage.setItem('onboarding_completed', 'true')
  visible.value = false
}

const show = () => {
  currentStep.value = 0
  visible.value = true
}

// 检查是否是首次访问
onMounted(() => {
  const completed = localStorage.getItem('onboarding_completed')
  if (!completed) {
    setTimeout(() => {
      visible.value = true
    }, 1000)
  }
})

defineExpose({
  show
})
</script>

<style scoped>
.tutorial-content {
  padding: 20px 0;
}

.step-indicator {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 32px;
}

.step-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #e5e7eb;
  transition: all 0.3s;
}

.step-dot.active {
  background: #409EFF;
  width: 32px;
  border-radius: 6px;
}

.step-dot.completed {
  background: #67C23A;
}

.step-content {
  text-align: center;
}

.step-icon {
  font-size: 4rem;
  margin-bottom: 24px;
}

.step-content h3 {
  font-size: 1.5rem;
  color: #1f2937;
  margin: 0 0 16px 0;
  font-weight: 600;
}

.step-content p {
  font-size: 1rem;
  color: #6b7280;
  line-height: 1.6;
  margin: 0 0 24px 0;
}

.step-image {
  margin: 24px 0;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #e5e7eb;
}

.step-image img {
  width: 100%;
  height: auto;
  display: block;
}

.step-tips {
  display: flex;
  flex-direction: column;
  gap: 12px;
  text-align: left;
  max-width: 400px;
  margin: 0 auto;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f0f9ff;
  border-radius: 8px;
}

.tip-item span {
  font-size: 0.9375rem;
  color: #374151;
}

.tutorial-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .step-icon {
    font-size: 3rem;
  }

  .step-content h3 {
    font-size: 1.25rem;
  }

  .step-content p {
    font-size: 0.9375rem;
  }
}
</style>
