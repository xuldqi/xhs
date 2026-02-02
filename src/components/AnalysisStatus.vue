<template>
  <div class="analysis-status">
    <div class="status-header">
      <div class="spinner"></div>
      <h3 class="status-title">AI Engine Initializing...</h3>
      <p class="status-subtitle">正在分析您的账号，请稍候片刻</p>
    </div>
    <div class="progress-bar">
      <div class="progress-bar-inner" :style="{ width: progress + '%' }"></div>
    </div>
    <ul class="step-list">
      <li v-for="(step, index) in steps" :key="index" :class="getStepClass(index)">
        <div class="step-icon">
          <svg v-if="index < currentStep" class="checkmark" viewBox="0 0 52 52"><circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none"/><path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/></svg>
          <div v-else-if="index === currentStep" class="loading-dot"></div>
          <div v-else class="circle"></div>
        </div>
        <span class="step-label">{{ step.label }}</span>
        <span class="step-status">{{ getStepStatus(index) }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { defineProps, computed } from 'vue';

const props = defineProps({
  progress: {
    type: Number,
    required: true,
  },
});

const steps = [
  { label: '读取图片数据', progress: 20 },
  { label: '识别个人信息', progress: 40 },
  { label: '分析内容风格', progress: 60 },
  { label: '评估账号现状', progress: 80 },
  { label: '生成初步建议', progress: 100 },
];

const currentStep = computed(() => {
  if (props.progress === 100) {
      return steps.length;
  }
  const stepIndex = steps.findIndex(step => props.progress < step.progress);
  return stepIndex === -1 ? steps.length : stepIndex;
});

const getStepClass = (index) => {
  if (index < currentStep.value) return 'completed';
  if (index === currentStep.value) return 'in-progress';
  return 'pending';
};

const getStepStatus = (index) => {
  if (index < currentStep.value) return '完成';
  if (index === currentStep.value) return '进行中...';
  return '等待中';
};
</script>

<style scoped>
.analysis-status {
  padding: 40px;
  text-align: center;
}

.status-header {
  margin-bottom: 30px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #667eea;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.status-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.status-subtitle {
  font-size: 1rem;
  color: #666;
}

.progress-bar {
  height: 8px;
  background-color: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 30px;
}

.progress-bar-inner {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transition: width 0.3s ease;
  border-radius: 4px;
}

.step-list {
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: left;
}

.step-list li {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  opacity: 0.5;
  transition: opacity 0.3s ease;
}

.step-list li.in-progress,
.step-list li.completed {
  opacity: 1;
}

.step-icon {
  width: 24px;
  height: 24px;
  margin-right: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.circle {
  width: 12px;
  height: 12px;
  background-color: #ced4da;
  border-radius: 50%;
}

.loading-dot {
  width: 16px;
  height: 16px;
  background-color: #667eea;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0.8);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
  100% {
    transform: scale(0.8);
    opacity: 0.8;
  }
}

.checkmark {
  width: 24px;
  height: 24px;
}

.checkmark-circle {
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  stroke-width: 3;
  stroke: #667eea;
  fill: none;
  animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}

.checkmark-check {
  transform-origin: 50% 50%;
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  stroke-width: 4;
  stroke: #667eea;
  animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
}

@keyframes stroke {
  100% {
    stroke-dashoffset: 0;
  }
}

.step-label {
  flex-grow: 1;
  color: #333;
  font-weight: 500;
}

.step-list li.completed .step-label {
  color: #888;
  text-decoration: line-through;
}

.step-status {
  font-size: 0.9rem;
  color: #888;
  font-weight: 500;
}

.step-list li.in-progress .step-status {
  color: #667eea;
}

.step-list li.completed .step-status {
  color: #28a745;
}
</style>
