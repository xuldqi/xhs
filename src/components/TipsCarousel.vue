<template>
  <div class="tips-carousel">
    <div class="carousel-header">
      <span class="header-icon">💡</span>
      <span class="header-title">运营小技巧</span>
    </div>
    
    <div class="carousel-container">
      <button 
        class="carousel-btn prev" 
        @click="prevTip"
        :disabled="currentIndex === 0"
      >
        ‹
      </button>
      
      <div class="carousel-content">
        <transition :name="transitionName" mode="out-in">
          <div :key="currentIndex" class="tip-item">
            {{ tips[currentIndex] }}
          </div>
        </transition>
      </div>
      
      <button 
        class="carousel-btn next" 
        @click="nextTip"
        :disabled="currentIndex === tips.length - 1"
      >
        ›
      </button>
    </div>
    
    <div class="carousel-indicators">
      <span 
        v-for="(_, index) in tips" 
        :key="index"
        class="indicator"
        :class="{ active: index === currentIndex }"
        @click="goToTip(index)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { getRandomTips } from '@/data/operationTips'

const tips = ref<string[]>([])
const currentIndex = ref(0)
const transitionName = ref('slide-left')
let autoPlayTimer: number | null = null

// 初始化随机获取10条技巧
onMounted(() => {
  tips.value = getRandomTips(10)
  startAutoPlay()
})

onUnmounted(() => {
  stopAutoPlay()
})

// 自动轮播
function startAutoPlay() {
  autoPlayTimer = window.setInterval(() => {
    nextTip()
  }, 8000) // 每8秒切换，停留更久
}

function stopAutoPlay() {
  if (autoPlayTimer) {
    clearInterval(autoPlayTimer)
    autoPlayTimer = null
  }
}

// 下一条
function nextTip() {
  if (currentIndex.value < tips.value.length - 1) {
    transitionName.value = 'slide-left'
    currentIndex.value++
  } else {
    // 到最后一条时，重新随机获取
    tips.value = getRandomTips(10)
    currentIndex.value = 0
  }
}

// 上一条
function prevTip() {
  if (currentIndex.value > 0) {
    transitionName.value = 'slide-right'
    currentIndex.value--
  }
}

// 跳转到指定条
function goToTip(index: number) {
  transitionName.value = index > currentIndex.value ? 'slide-left' : 'slide-right'
  currentIndex.value = index
}

// 鼠标悬停时暂停自动播放
function handleMouseEnter() {
  stopAutoPlay()
}

function handleMouseLeave() {
  startAutoPlay()
}
</script>

<style scoped>
.tips-carousel {
  background: linear-gradient(135deg, #fff5f5 0%, #fff9f9 100%);
  border: 1px solid #ffe0e0;
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
}

.carousel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.header-icon {
  font-size: 1.25rem;
}

.header-title {
  font-size: 1rem;
  font-weight: 600;
  color: #ff2442;
}

.carousel-container {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 60px;
}

.carousel-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #ffccd5;
  background: white;
  border-radius: 50%;
  color: #ff2442;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.carousel-btn:hover:not(:disabled) {
  background: #ff2442;
  color: white;
  transform: scale(1.1);
}

.carousel-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.carousel-content {
  flex: 1;
  overflow: hidden;
  position: relative;
  min-height: 60px;
}

.tip-item {
  font-size: 0.9375rem;
  line-height: 1.6;
  color: #333;
  padding: 8px 12px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(255, 36, 66, 0.1);
}

.carousel-indicators {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: 16px;
}

.indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ffccd5;
  cursor: pointer;
  transition: all 0.3s;
}

.indicator.active {
  background: #ff2442;
  width: 24px;
  border-radius: 4px;
}

.indicator:hover {
  background: #ff6b81;
}

/* 过渡动画 */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease;
}

.slide-left-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-left-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-right-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-right-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

@media (max-width: 768px) {
  .tips-carousel {
    padding: 16px;
  }
  
  .carousel-btn {
    width: 28px;
    height: 28px;
    font-size: 1.25rem;
  }
  
  .tip-item {
    font-size: 0.875rem;
    padding: 6px 10px;
  }
}
</style>
