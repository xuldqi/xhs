<template>
  <div class="guide-calendar-preview">
    <div class="preview-header">
      <div class="preview-icon">📅</div>
      <div>
        <h3 class="preview-title">接下来 30 天内容规划预览</h3>
        <p class="preview-desc">基于你的账号定位，AI 为你规划了接下来的发帖方向</p>
      </div>
    </div>

    <div v-if="loading" class="preview-loading">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>正在生成内容规划...</span>
    </div>

    <div v-else-if="error" class="preview-error">
      <el-alert type="warning" :title="error" show-icon />
      <el-button size="small" @click="loadPreview">重试</el-button>
    </div>

    <div v-else-if="calendarData?.days?.length" class="preview-content">
      <div class="days-list">
        <div
          v-for="(day, idx) in visibleDays"
          :key="day.date"
          class="day-card"
          :class="{ blurred: idx >= fullVisibleCount }"
        >
          <div class="day-header">
            <span class="day-date">{{ formatDate(day.date) }}</span>
            <el-tag v-if="day.items?.length" size="small" type="info">
              {{ day.items.length }} 条
            </el-tag>
          </div>
          <div class="day-items">
            <div
              v-for="item in day.items"
              :key="item.id"
              class="day-item"
              :class="`type-${item.type}`"
            >
              <div class="item-title">{{ item.title }}</div>
              <div v-if="item.outline" class="item-outline">{{ truncate(item.outline, 60) }}</div>
              <div v-if="item.tags?.length" class="item-tags">
                <el-tag v-for="t in item.tags.slice(0, 3)" :key="t" size="small">{{ t }}</el-tag>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="hasBlurredDays" class="preview-cta-overlay">
        <div class="cta-blur" />
        <div class="cta-content">
          <p class="cta-text">{{ ctaText }}</p>
          <el-button type="primary" @click="handleCtaClick">
            {{ ctaButtonText }}
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Loading } from '@element-plus/icons-vue'
import * as calendarService from '@/services/calendarService'
import type { CalendarData, CalendarDay } from '@/types/models'
import { useUserStore } from '@/stores/userStore'

const props = defineProps<{
  positioning: string
  goal?: string
}>()

const router = useRouter()
const userStore = useUserStore()

const loading = ref(true)
const error = ref('')
const calendarData = ref<CalendarData | null>(null)

const fullVisibleCount = 5

const visibleDays = computed(() => calendarData.value?.days || [])
const hasBlurredDays = computed(() => visibleDays.value.length > fullVisibleCount)

const ctaText = computed(() => {
  if (!userStore.isLoggedIn) return '登录后可查看 30 天完整日历，并一键生成专属内容规划'
  const plan = userStore.planType
  if (plan === 'basic' || plan === 'pro' || plan === 'lifetime') {
    return '前往内容日历，生成完整 30 天规划并支持导出'
  }
  return '升级 VIP 可生成 30 天完整日历，并享受品牌声定制等高级功能'
})

const ctaButtonText = computed(() => {
  if (!userStore.isLoggedIn) return '登录 / 注册'
  return '前往内容日历'
})

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

function truncate(s: string, len: number): string {
  if (!s) return ''
  return s.length <= len ? s : s.slice(0, len) + '...'
}

function handleCtaClick() {
  const calendarQuery = {
    from: 'guide',
    positioning: props.positioning || '',
    goal: props.goal || '涨粉'
  }
  const queryStr = new URLSearchParams(calendarQuery as Record<string, string>).toString()
  if (!userStore.isLoggedIn) {
    router.push({ path: '/login', query: { redirect: `/calendar?${queryStr}` } })
  } else {
    router.push({ path: '/calendar', query: calendarQuery })
  }
}

async function loadPreview() {
  if (!props.positioning) return
  loading.value = true
  error.value = ''
  try {
    const data = await calendarService.generateCalendar(
      {
        daysCount: 7,
        positioning: props.positioning,
        goal: props.goal || '涨粉'
      },
      userStore.user?.id
    )
    calendarData.value = data
  } catch (e: any) {
    error.value = e?.message || '加载失败'
    calendarData.value = null
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (userStore.isLoggedIn) userStore.refresh?.()
  loadPreview()
})

watch(() => props.positioning, (val) => {
  if (val && !calendarData.value) loadPreview()
})
</script>

<style scoped>
.guide-calendar-preview {
  margin-top: 48px;
  padding: 24px;
  background: linear-gradient(135deg, #fff9f9 0%, #fff 100%);
  border: 1px solid #ffe4e4;
  border-radius: 12px;
}

.preview-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 24px;
}

.preview-icon {
  font-size: 32px;
  line-height: 1;
}

.preview-title {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.preview-desc {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.preview-loading {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 24px;
  color: #666;
}

.preview-error {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
}

.preview-content {
  position: relative;
}

.days-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.day-card {
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  transition: filter 0.3s;
}

.day-card.blurred {
  position: relative;
  filter: blur(4px);
  pointer-events: none;
  user-select: none;
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.day-date {
  font-weight: 600;
  color: #333;
}

.day-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.day-item {
  padding: 10px 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 3px solid #ff2442;
}

.day-item.type-video {
  border-left-color: #409eff;
}

.day-item.type-carousel {
  border-left-color: #e6a23c;
}

.day-item.type-live_preview {
  border-left-color: #f56c6c;
}

.item-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.item-outline {
  font-size: 12px;
  color: #666;
  line-height: 1.5;
}

.item-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 6px;
}

.preview-cta-overlay {
  position: relative;
  margin-top: -80px;
  height: 120px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.cta-blur {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(255,255,255,0.98), transparent);
  pointer-events: none;
}

.cta-content {
  position: relative;
  z-index: 1;
  text-align: center;
  padding-bottom: 16px;
}

.cta-text {
  margin: 0 0 12px;
  font-size: 14px;
  color: #666;
}

@media (max-width: 768px) {
  .guide-calendar-preview {
    padding: 16px;
    margin-top: 32px;
  }
}
</style>
