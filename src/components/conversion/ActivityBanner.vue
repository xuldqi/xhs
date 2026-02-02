<template>
  <div v-if="visible && currentActivity" class="activity-banner" :class="`banner-${currentActivity.type}`">
    <div class="container">
      <div class="banner-content">
        <div class="banner-icon">
          <el-icon><component :is="getIcon(currentActivity.type)" /></el-icon>
        </div>
        
        <div class="banner-text">
          <span class="banner-title">{{ currentActivity.title }}</span>
          <span class="banner-description">{{ currentActivity.description }}</span>
        </div>
        
        <el-button
          v-if="currentActivity.ctaText"
          type="primary"
          size="large"
          @click="handleCTAClick"
        >
          {{ currentActivity.ctaText }}
        </el-button>
        
        <el-button
          class="close-btn"
          :icon="Close"
          circle
          text
          @click="handleClose"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Present, TrendCharts, Star, Close } from '@element-plus/icons-vue'
import { analytics } from '@/utils/analytics'

interface Activity {
  id: string
  type: 'promotion' | 'feature' | 'announcement'
  title: string
  description: string
  ctaText?: string
  ctaLink?: string
  startDate: string
  endDate: string
}

const router = useRouter()

// 响应式数据
const visible = ref(true)
const activities = ref<Activity[]>([
  {
    id: '1',
    type: 'promotion',
    title: '🎉 限时优惠',
    description: '升级会员享受 7 折优惠，仅限本周！',
    ctaText: '立即升级',
    ctaLink: '/pricing',
    startDate: '2024-01-01',
    endDate: '2024-12-31'
  }
])

// 计算属性
const currentActivity = computed(() => {
  const now = new Date()
  return activities.value.find(activity => {
    const start = new Date(activity.startDate)
    const end = new Date(activity.endDate)
    return now >= start && now <= end
  })
})

// 方法
const getIcon = (type: string) => {
  const map: Record<string, any> = {
    promotion: Present,
    feature: Star,
    announcement: TrendCharts
  }
  return map[type] || Present
}

const handleCTAClick = () => {
  if (!currentActivity.value) return
  
  analytics.track('activity_banner_click', {
    activityId: currentActivity.value.id,
    type: currentActivity.value.type
  })
  
  if (currentActivity.value.ctaLink) {
    router.push(currentActivity.value.ctaLink)
  }
}

const handleClose = () => {
  visible.value = false
  
  if (currentActivity.value) {
    analytics.track('activity_banner_close', {
      activityId: currentActivity.value.id
    })
    
    // 保存关闭状态到 localStorage
    localStorage.setItem(`banner_closed_${currentActivity.value.id}`, 'true')
  }
}

// 初始化
onMounted(() => {
  if (currentActivity.value) {
    const closed = localStorage.getItem(`banner_closed_${currentActivity.value.id}`)
    if (closed === 'true') {
      visible.value = false
    } else {
      analytics.track('activity_banner_view', {
        activityId: currentActivity.value.id,
        type: currentActivity.value.type
      })
    }
  }
})
</script>

<style scoped>
.activity-banner {
  position: relative;
  padding: 16px 0;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.banner-promotion {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.banner-feature {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
}

.banner-announcement {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.container {
  max-width: var(--container-xl);
  margin: 0 auto;
  padding: 0 20px;
}

.banner-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.banner-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.banner-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.banner-title {
  font-weight: 600;
  font-size: 1rem;
}

.banner-description {
  font-size: 0.875rem;
  opacity: 0.9;
}

.close-btn {
  color: white;
  flex-shrink: 0;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .banner-content {
    flex-wrap: wrap;
  }
  
  .banner-text {
    flex-basis: 100%;
    order: 2;
  }
  
  .el-button:not(.close-btn) {
    flex-basis: 100%;
    order: 3;
  }
  
  .close-btn {
    order: 1;
    margin-left: auto;
  }
}
</style>
