<template>
  <div class="calendar-view">
    <div class="container">
      <Breadcrumb :items="breadcrumbItems" />

      <div class="tool-header">
        <div>
          <h1 class="tool-title">AI 内容日历</h1>
          <p class="tool-description">
            输入账号定位与目标，AI 自动生成 7 天或 30 天的内容规划日历（免费 7 天，VIP 30 天）
          </p>
        </div>
        <div v-if="calendarHistory.length > 0" class="header-actions-top">
          <el-button :icon="Refresh" circle @click="loadHistory" :loading="loadingHistory" title="刷新列表" />
          <el-select
            v-model="selectedCalendarId"
            placeholder="切换规划"
            style="width: 220px; margin: 0 12px"
            @change="selectCalendar"
          >
            <el-option
              v-for="h in calendarHistory"
              :key="h.id"
              :label="`${h.input_params?.positioning || '未命名'} · ${h.input_params?.goal || '涨粉'}`"
              :value="h.id"
            />
          </el-select>
          <el-button type="primary" plain @click="goToNewCalendar">
            <el-icon><Plus /></el-icon>
            新建日历
          </el-button>
        </div>
      </div>

      <!-- 引导：建议先诊断 -->
      <el-alert
        v-if="showForm && !form.positioning && route.query.from !== 'guide'"
        type="info"
        :closable="false"
        show-icon
        class="diagnosis-tip"
      >
        <template #title>
          建议先完成
          <router-link to="/analysis" class="tip-link">账号诊断</router-link>
          ，一键预填定位与目标，获得更精准的 AI 内容规划
        </template>
      </el-alert>
      <!-- 引导：优先 AI 生成 -->
      <el-alert
        v-if="showForm && form.positioning"
        type="success"
        :closable="false"
        show-icon
        class="ai-first-tip"
      >
        <template #title>填写完定位与目标后，点击「AI 一键生成」即可 3 秒出规划</template>
      </el-alert>

      <!-- 品牌声 & 生成表单（新建时展示） -->
      <div v-if="showForm" class="form-section">
        <el-card>
          <template #header>
            <span>生成参数</span>
          </template>

          <el-form :model="form" label-position="top" class="generate-form">
            <el-row :gutter="24">
              <el-col :xs="24" :md="12">
                <el-form-item label="账号/品牌定位" required>
                  <el-input
                    v-model="form.positioning"
                    placeholder="如：美妆、美食、知识分享、职场成长等"
                    clearable
                  />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :md="12">
                <el-form-item label="目标" required>
                  <el-select v-model="form.goal" placeholder="选择目标" style="width: 100%">
                    <el-option label="涨粉" value="涨粉" />
                    <el-option label="带货" value="带货" />
                    <el-option label="互动" value="互动" />
                    <el-option label="品牌曝光" value="品牌曝光" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="24">
              <el-col :xs="24" :md="12">
                <el-form-item label="风格关键词（可选）">
                  <el-input
                    v-model="form.styleKeywordsStr"
                    placeholder="如：温柔、专业、沙雕、干货，用逗号分隔"
                    clearable
                  />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :md="12">
                <el-form-item label="生成天数">
                  <el-radio-group v-model="form.daysCount">
                    <el-radio :label="7">7 天（免费）</el-radio>
                    <el-radio :label="30" :disabled="!canGenerate30">30 天（VIP）</el-radio>
                  </el-radio-group>
                  <p v-if="!canGenerate30" class="hint-text">开通 VIP 解锁 30 天日历</p>
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="参考爆款摘要（可选）">
              <el-input
                v-model="form.referenceNotes"
                type="textarea"
                :rows="3"
                placeholder="粘贴爆款笔记的标题、正文摘要、标签等，AI 会借鉴其风格"
              />
            </el-form-item>

            <!-- 品牌声选择（多套可选） -->
            <el-form-item v-if="brandVoices.length > 0" label="选择品牌声">
              <el-select
                v-model="selectedBrandVoiceId"
                placeholder="选择已有品牌声或手动填写"
                style="width: 100%"
                clearable
                @change="onBrandVoiceSelect"
              >
                <el-option
                  v-for="bv in brandVoices"
                  :key="bv.id"
                  :label="bv.name || '默认'"
                  :value="bv.id"
                />
              </el-select>
            </el-form-item>
            <!-- 品牌声快捷设置 -->
            <el-collapse>
              <el-collapse-item title="品牌声设置（风格、禁词、emoji）" name="brand">
                <el-form-item label="风格">
                  <el-input v-model="form.brandStyle" placeholder="如：温柔、专业、沙雕" />
                </el-form-item>
                <el-form-item label="禁词（不要使用的词，逗号分隔）">
                  <el-input v-model="form.brandForbidden" placeholder="如：绝对、必买" />
                </el-form-item>
                <el-form-item label="常用 emoji（逗号分隔）">
                  <el-input v-model="form.brandEmoji" placeholder="如：✨💕📌" />
                </el-form-item>
              </el-collapse-item>
            </el-collapse>

            <el-form-item>
              <el-button
                type="primary"
                size="large"
                :loading="generating"
                :disabled="!form.positioning || !form.goal"
                @click="handleGenerate"
              >
                <el-icon><MagicStick /></el-icon>
                AI 一键生成（推荐）
              </el-button>
              <el-button size="large" plain @click="createBlankCalendar">
                从零填写
              </el-button>
            </el-form-item>
            <p class="form-cta-hint">推荐先使用 AI 生成，再根据需要手动微调</p>
          </el-form>
        </el-card>
      </div>

      <!-- 生成中 -->
      <div v-if="generating" class="generating-section">
        <el-progress :percentage="generationProgress" :stroke-width="12" />
        <p class="generating-text">AI 正在生成 {{ form.daysCount }} 天的内容规划...</p>
      </div>

      <!-- 加载历史中 -->
      <div v-else-if="loadingHistory && calendarHistory.length === 0" class="loading-section">
        <el-icon class="is-loading"><Loading /></el-icon>
        <p>加载我的日历...</p>
      </div>

      <!-- 日历展示 -->
      <div v-else-if="calendarData && calendarData.days?.length" class="calendar-section">
        <!-- 我的日历列表（登录用户） -->
        <div v-if="isLoggedIn && calendarHistory.length > 0" class="calendar-list-panel">
          <div class="list-panel-header">
            <span>我的日历</span>
            <div class="list-panel-actions">
              <el-button
                v-if="calendarHistory.length >= 2"
                size="small"
                link
                @click="openCompareDialog"
              >
                对比
              </el-button>
              <el-button size="small" :icon="Refresh" link @click="loadHistory" :loading="loadingHistory">
                刷新
              </el-button>
            </div>
          </div>
          <div class="calendar-list">
            <div
              v-for="h in calendarHistory"
              :key="h.id"
              class="calendar-list-item"
              :class="{ active: selectedCalendarId === h.id }"
              @click="selectCalendar(h.id)"
            >
              <div class="item-main">
                <span class="item-title">{{ h.input_params?.positioning || '未命名' }}</span>
                <span class="item-goal">{{ h.input_params?.goal || '涨粉' }}</span>
                <span class="item-meta">{{ formatCreatedAt(h.created_at) }}</span>
              </div>
              <div class="item-actions">
                <el-button size="small" link @click.stop="copyCalendarToNew(h)">
                  复制
                </el-button>
                <el-button
                  size="small"
                  :icon="Delete"
                  type="danger"
                  link
                  @click.stop="handleDeleteCalendar(h.id)"
                >
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <el-card>
          <template #header>
            <div class="calendar-header">
              <span>内容日历</span>
              <div class="header-actions">
                <el-button size="small" @click="goToNewCalendar">
                  <el-icon><Plus /></el-icon>
                  新建
                </el-button>
                <el-tooltip :content="canGenerate30 ? '基于已发数据优化下周日历' : '优化下周为 VIP 专属功能'" placement="bottom">
                  <el-button
                    size="small"
                    :loading="optimizing"
                    :disabled="!canGenerate30"
                    @click="handleOptimize"
                  >
                    优化下周
                  </el-button>
                </el-tooltip>
                <el-button size="small" @click="handleExportMarkdown">
                  <el-icon><Document /></el-icon>
                  导出 Markdown
                </el-button>
                <el-button size="small" type="primary" @click="handleExportPDF">
                  <el-icon><Download /></el-icon>
                  导出 PDF
                </el-button>
                <el-button v-if="isLoggedIn" size="small" @click="handleSave">
                  <el-icon><Share /></el-icon>
                  保存到云端
                </el-button>
              </div>
            </div>
          </template>

          <!-- 月历头部：年月 + 左右翻月 -->
          <div class="month-nav">
            <el-button text @click="prevMonth">
              <el-icon><ArrowLeft /></el-icon>
            </el-button>
            <span class="month-title">{{ displayMonthYear }}</span>
            <el-button text @click="nextMonth">
              <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>

          <!-- 月历表格：星期 + 日期格子 -->
          <div class="month-calendar">
            <div class="weekday-row">
              <span v-for="w in weekdayLabels" :key="w" class="weekday-cell">{{ w }}</span>
            </div>
            <div
              v-for="(week, wi) in monthWeeks"
              :key="wi"
              class="week-row"
            >
              <div
                v-for="(cell, ci) in week"
                :key="ci"
                class="day-cell"
                :class="{
                  'in-range': cell?.dayData,
                  'empty': !cell
                }"
                @click="cell?.dayData && selectDay(cell.dayData)"
              >
                <template v-if="cell">
                  <div class="cell-date">{{ cell.day }}</div>
                  <div v-if="cell.weekday" class="cell-weekday">{{ cell.weekday }}</div>
                  <div v-if="cell.dayData?.items?.length" class="cell-items">
                    <div
                      v-for="item in (cell.dayData.items || []).slice(0, 2)"
                      :key="item.id"
                      class="cell-item"
                    >
                      <span class="cell-item-title">{{ item.title?.slice(0, 8) }}{{ (item.title?.length || 0) > 8 ? '…' : '' }}</span>
                      <span v-if="item.suggestedTime" class="cell-item-time">{{ item.suggestedTime }}</span>
                    </div>
                    <div v-if="(cell.dayData.items?.length || 0) > 2" class="cell-more">
                      +{{ (cell.dayData.items?.length || 0) - 2 }}
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-section">
        <el-empty description="暂无日历内容">
          <el-button type="primary" @click="goToNewCalendar">新建日历</el-button>
        </el-empty>
      </div>
    </div>

    <!-- 对比日历弹窗 -->
    <el-dialog
      v-model="compareDialogVisible"
      title="对比日历"
      width="500px"
      append-to-body
    >
      <el-form label-position="top">
        <el-form-item label="日历 A">
          <el-select v-model="compareA" placeholder="选择日历" style="width: 100%">
            <el-option
              v-for="h in calendarHistory"
              :key="h.id"
              :label="`${h.input_params?.positioning || '未命名'} · ${h.input_params?.goal || '涨粉'}`"
              :value="h.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="日历 B">
          <el-select v-model="compareB" placeholder="选择日历" style="width: 100%">
            <el-option
              v-for="h in calendarHistory"
              :key="h.id"
              :label="`${h.input_params?.positioning || '未命名'} · ${h.input_params?.goal || '涨粉'}`"
              :value="h.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div v-if="compareSummary" class="compare-summary">
        <div class="compare-row">
          <span class="compare-label">日历 A</span>
          <span>{{ compareSummary.a.days }} 天 · {{ compareSummary.a.items }} 条</span>
          <span v-if="compareSummary.a.types" class="compare-types">{{ compareSummary.a.types }}</span>
        </div>
        <div class="compare-row">
          <span class="compare-label">日历 B</span>
          <span>{{ compareSummary.b.days }} 天 · {{ compareSummary.b.items }} 条</span>
          <span v-if="compareSummary.b.types" class="compare-types">{{ compareSummary.b.types }}</span>
        </div>
      </div>
    </el-dialog>

    <!-- 单日详情抽屉（可编辑） -->
    <el-drawer
      v-model="detailDrawerVisible"
      :title="selectedDay ? `${selectedDay.date} 内容详情` : ''"
      size="420px"
      direction="rtl"
    >
      <div v-if="selectedDay" class="day-detail">
        <el-alert
          v-if="analyzeResult?.length"
          type="success"
          :closable="true"
          @close="analyzeResult = null"
          class="analyze-result"
        >
          <template #title>AI 优化建议</template>
          <ul class="analyze-suggestions">
            <li v-for="(s, i) in analyzeResult" :key="i">{{ s }}</li>
          </ul>
        </el-alert>
        <div v-if="selectedDay.items?.length" class="batch-actions">
            <el-button size="small" @click="copyDayToNextWeek">
            复制当天全部到下周
          </el-button>
        </div>
        <div v-else class="empty-day-tip">
          <p>当天暂无内容</p>
          <el-button type="primary" size="small" @click="addItemToDay(selectedDay)">
            添加笔记
          </el-button>
        </div>
        <div
          v-for="item in (selectedDay.items || [])"
          :key="item.id"
          class="detail-item editable"
        >
          <div class="detail-item-header">
            <el-select v-model="item.type" size="small" style="width: 110px" @change="markItemChanged">
              <el-option label="图文" value="image" />
              <el-option label="短视频" value="video" />
              <el-option label="轮播" value="carousel" />
              <el-option label="直播预告" value="live_preview" />
            </el-select>
            <el-select
              v-model="item.status"
              size="small"
              placeholder="状态"
              style="width: 90px; margin-left: 8px"
              clearable
              @change="onStatusChange(item)"
            >
              <el-option label="草稿" value="draft" />
              <el-option label="待发" value="pending" />
              <el-option label="已发" value="published" />
            </el-select>
            <el-select
              v-model="item.suggestedTime"
              size="small"
              placeholder="建议时间"
              style="width: 100px; margin-left: 8px"
              filterable
              allow-create
              default-first-option
              @change="markItemChanged"
            >
              <el-option-group label="午间高峰">
                <el-option label="12:00" value="12:00" />
                <el-option label="12:30" value="12:30" />
                <el-option label="13:00" value="13:00" />
                <el-option label="14:00" value="14:00" />
              </el-option-group>
              <el-option-group label="晚间高峰">
                <el-option label="19:00" value="19:00" />
                <el-option label="20:00" value="20:00" />
                <el-option label="21:00" value="21:00" />
                <el-option label="22:00" value="22:00" />
              </el-option-group>
            </el-select>
          </div>
          <el-form-item label="标题" class="detail-form-item">
            <el-input v-model="item.title" placeholder="笔记标题" @input="markItemChanged" />
          </el-form-item>
          <el-form-item label="大纲" class="detail-form-item">
            <el-input v-model="item.outline" type="textarea" :rows="3" placeholder="正文大纲" @input="markItemChanged" />
          </el-form-item>
          <el-form-item label="标签" class="detail-form-item">
            <el-input
              :model-value="(item.tags || []).join(', ')"
              placeholder="用逗号分隔，如：干货,职场"
              @update:model-value="(v: string) => updateItemTags(item, v)"
            />
          </el-form-item>
          <!-- 已发笔记：录入链接与数据 -->
          <div v-if="item.status === 'published'" class="published-note-section">
            <el-form-item label="笔记链接" class="detail-form-item">
              <el-input
                v-model="getPublishedNote(item).url"
                placeholder="https://www.xiaohongshu.com/explore/..."
                size="small"
                @input="markItemChanged"
              />
            </el-form-item>
            <el-form-item label="数据（点赞 / 收藏 / 评论）" class="detail-form-item">
              <div class="published-stats">
                <el-input-number v-model="getPublishedNote(item).likes" :min="0" size="small" placeholder="点赞" controls-position="right" @change="markItemChanged" />
                <el-input-number v-model="getPublishedNote(item).favorites" :min="0" size="small" placeholder="收藏" controls-position="right" @change="markItemChanged" />
                <el-input-number v-model="getPublishedNote(item).comments" :min="0" size="small" placeholder="评论" controls-position="right" @change="markItemChanged" />
              </div>
            </el-form-item>
          </div>
          <div class="detail-item-actions">
            <el-select
              :model-value="''"
              placeholder="移动到..."
              size="small"
              style="width: 140px"
              filterable
              @change="(d: string) => moveItemToDate(item, d)"
            >
              <el-option
                v-for="d in availableMoveDates"
                :key="d"
                :label="d"
                :value="d"
              />
            </el-select>
            <el-button size="small" @click="copyItemToNextWeek(item)">
              复制到下周
            </el-button>
            <el-button size="small" :loading="analyzingItemId === item.id" @click="analyzeItem(item)">
              AI 分析
            </el-button>
            <el-button size="small" type="danger" link @click="deleteItem(item)">
              删除
            </el-button>
          </div>
        </div>
        <div v-if="selectedDay.items?.length" class="add-item-btn">
          <el-button size="small" @click="addItemToDay(selectedDay)">
            <el-icon><Plus /></el-icon>
            添加笔记
          </el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onActivated } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { MagicStick, Document, Download, Share, Plus, Loading, ArrowLeft, ArrowRight, Refresh, Delete } from '@element-plus/icons-vue'
import Breadcrumb from '@/components/Breadcrumb.vue'
import { useUserStore } from '@/stores/userStore'
import * as calendarService from '@/services/calendarService'
import type { SavedCalendar } from '@/services/calendarService'
import type { CalendarData, CalendarDay, CalendarItem } from '@/types/models'
import { exportToPDF } from '@/utils/pdfExporter'
import jsPDF from 'jspdf'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const breadcrumbItems = [{ name: '首页', path: '/' }, { name: '内容日历' }]

const form = ref({
  positioning: '',
  goal: '涨粉',
  styleKeywordsStr: '',
  referenceNotes: '',
  daysCount: 7 as 7 | 30,
  brandStyle: '',
  brandForbidden: '',
  brandEmoji: ''
})

const generating = ref(false)
const generationProgress = ref(0)
const calendarData = ref<CalendarData | null>(null)
const detailDrawerVisible = ref(false)
const selectedDay = ref<CalendarDay | null>(null)

// 我的日历列表
const calendarHistory = ref<SavedCalendar[]>([])
const selectedCalendarId = ref<string | null>(null)
const loadingHistory = ref(false)
const optimizing = ref(false)
const analyzingItemId = ref<string | null>(null)
const analyzeResult = ref<string[] | null>(null)

// 品牌声多套
const brandVoices = ref<{ id: string; name?: string; style?: string; keywords?: string[]; forbiddenWords?: string[]; emojiList?: string[] }[]>([])
const selectedBrandVoiceId = ref<string | null>(null)

// 对比
const compareDialogVisible = ref(false)
const compareA = ref<string | null>(null)
const compareB = ref<string | null>(null)

const isLoggedIn = computed(() => userStore.isLoggedIn)

const canGenerate30 = computed(() => {
  const plan = userStore.planType
  return plan === 'basic' || plan === 'pro' || plan === 'lifetime'
})

function getTypeLabel(type: string): string {
  const map: Record<string, string> = {
    image: '图文',
    video: '短视频',
    carousel: '轮播',
    live_preview: '直播预告'
  }
  return map[type] || type
}

function getTypeTagType(type: string): string {
  const map: Record<string, string> = {
    image: 'success',
    video: 'primary',
    carousel: 'warning',
    live_preview: 'danger'
  }
  return map[type] || 'info'
}

const weekdayLabels = ['一', '二', '三', '四', '五', '六', '日']

// 月历显示月份（用于翻月）
const displayMonth = ref<{ year: number; month: number }>({ year: 0, month: 0 })

const displayMonthYear = computed(() => {
  if (!displayMonth.value.year) return ''
  return `${displayMonth.value.year}年${displayMonth.value.month}月`
})

// 构建月历格子（Mon=0 到 Sun=6）
const monthWeeks = computed(() => {
  if (!calendarData.value?.days?.length) return []
  const days = calendarData.value.days
  const dayMap = new Map(days.map((d) => [d.date, d]))

  // 从数据推断显示月份
  const firstDate = new Date(days[0].date)
  const year = displayMonth.value.year || firstDate.getFullYear()
  const month = displayMonth.value.month || firstDate.getMonth() + 1

  const first = new Date(year, month - 1, 1)
  const last = new Date(year, month, 0)
  // getDay: 0=Sun, 1=Mon, ... 6=Sat. Mon=0: (getDay()+6)%7
  const startPad = ((first.getDay() + 6) % 7)
  const totalDays = last.getDate()

  const cells: Array<{ day: number; weekday: string; dateStr: string; dayData?: CalendarDay } | null>[] = []
  let week: (typeof cells)[0] = []

  // 月初空白
  for (let i = 0; i < startPad; i++) {
    week.push(null)
  }

  for (let d = 1; d <= totalDays; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const dayData = dayMap.get(dateStr)
    const date = new Date(year, month - 1, d)
    const wd = (date.getDay() + 6) % 7
    week.push({
      day: d,
      weekday: weekdayLabels[wd],
      dateStr,
      dayData
    })
    if (week.length === 7) {
      cells.push(week)
      week = []
    }
  }

  if (week.length) {
    while (week.length < 7) week.push(null)
    cells.push(week)
  }

  return cells
})

function prevMonth() {
  if (!displayMonth.value.month) return
  let { year, month } = displayMonth.value
  month--
  if (month < 1) {
    month = 12
    year--
  }
  displayMonth.value = { year, month }
}

function nextMonth() {
  if (!displayMonth.value.month) return
  let { year, month } = displayMonth.value
  month++
  if (month > 12) {
    month = 1
    year++
  }
  displayMonth.value = { year, month }
}

function formatDayDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function formatCreatedAt(createdAt: string): string {
  const d = new Date(createdAt)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 86400000) return '今天'
  if (diff < 172800000) return '昨天'
  return `${d.getMonth() + 1}/${d.getDate()}`
}

async function copyCalendarToNew(h: SavedCalendar) {
  try {
    const data = JSON.parse(JSON.stringify(h.calendar_data))
    const inputParams = { ...h.input_params, positioning: `${(h.input_params?.positioning || '未命名')}（副本）` }
    if (!isLoggedIn.value) {
      calendarData.value = data
      showForm.value = false
      ElMessage.success('已复制到当前（登录后可保存到我的日历）')
      return
    }
    const saved = await calendarService.saveCalendar(inputParams, data, h.days_count || 7)
    await loadHistory()
    selectedCalendarId.value = saved.id
    calendarData.value = saved.calendar_data
    router.replace({ query: { id: saved.id } })
    ElMessage.success('已复制到新日历')
  } catch (e: any) {
    ElMessage.error(e?.message || '复制失败')
  }
}

async function handleDeleteCalendar(id: string) {
  try {
    await calendarService.deleteCalendar(id)
    calendarHistory.value = calendarHistory.value.filter((h) => h.id !== id)
    if (selectedCalendarId.value === id) {
      const next = calendarHistory.value[0]
      if (next) {
        selectCalendar(next.id)
      } else {
        goToNewCalendar()
      }
    }
    ElMessage.success('已删除')
  } catch (e: any) {
    ElMessage.error(e?.message || '删除失败')
  }
}

function selectDay(day: CalendarDay) {
  selectedDay.value = day
  detailDrawerVisible.value = true
}

// 可移动到的日期（排除当天）
const availableMoveDates = computed(() => {
  if (!calendarData.value?.days?.length || !selectedDay.value) return []
  return calendarData.value.days
    .map((d) => d.date)
    .filter((d) => d !== selectedDay.value!.date)
})

function updateItemTags(item: CalendarItem, v: string) {
  item.tags = v.split(/[,，]/).map((s) => s.trim()).filter(Boolean)
  markItemChanged()
}

function markItemChanged() {
  // 用于后续可选的「保存修改」提示
}

function onStatusChange(item: CalendarItem) {
  markItemChanged()
  if (item.status === 'published' && !item.publishedNote) {
    item.publishedNote = { url: '', likes: undefined, favorites: undefined, comments: undefined }
  }
}

async function analyzeItem(item: CalendarItem) {
  analyzingItemId.value = item.id
  analyzeResult.value = null
  try {
    const suggestions = await calendarService.analyzeNote(item)
    analyzeResult.value = suggestions
  } catch (e: any) {
    ElMessage.error(e?.message || '分析失败')
  } finally {
    analyzingItemId.value = null
  }
}

async function handleOptimize() {
  if (!calendarData.value || !canGenerate30.value) {
    ElMessage.warning('优化下周为 VIP 专属功能')
    return
  }
  optimizing.value = true
  try {
    const daysCount = calendarData.value.days?.length || 7
    const optimized = await calendarService.optimizeCalendar(
      calendarData.value,
      { positioning: form.value.positioning, goal: form.value.goal },
      daysCount,
      userStore.user?.id
    )
    calendarData.value = optimized
    ElMessage.success('已优化下周日历')
  } catch (e: any) {
    ElMessage.error(e?.message || '优化失败')
  } finally {
    optimizing.value = false
  }
}

function openCompareDialog() {
  compareDialogVisible.value = true
  if (calendarHistory.value.length >= 2) {
    compareA.value = compareA.value || calendarHistory.value[0].id
    compareB.value = compareB.value || calendarHistory.value[1].id
  }
}

function onBrandVoiceSelect(voiceId: string | null) {
  if (!voiceId) return
  const bv = brandVoices.value.find((v) => v.id === voiceId)
  if (bv) {
    form.value.brandStyle = bv.style || ''
    form.value.brandForbidden = (bv.forbiddenWords || []).join(', ')
    form.value.brandEmoji = (bv.emojiList || []).join(', ')
  }
}

function getPublishedNote(item: CalendarItem) {
  if (!item.publishedNote) {
    item.publishedNote = { url: '', likes: 0, favorites: 0, comments: 0 }
  }
  return item.publishedNote
}

function moveItemToDate(item: CalendarItem, targetDate: string) {
  if (!calendarData.value || !selectedDay.value) return
  const srcDay = selectedDay.value
  const srcItems = srcDay.items || []
  const idx = srcItems.indexOf(item)
  if (idx < 0) return
  srcItems.splice(idx, 1)
  let targetDay = calendarData.value.days.find((d) => d.date === targetDate)
  if (!targetDay) {
    targetDay = { date: targetDate, items: [] }
    calendarData.value.days.push(targetDay)
    calendarData.value.days.sort((a, b) => a.date.localeCompare(b.date))
  }
  if (!targetDay.items) targetDay.items = []
  targetDay.items.push(item)
  ElMessage.success(`已移至 ${targetDate}`)
  if (srcItems.length === 0) detailDrawerVisible.value = false
}

function copyItemToNextWeek(item: CalendarItem) {
  if (!calendarData.value || !selectedDay.value) return
  const srcDate = selectedDay.value.date
  const d = new Date(srcDate)
  d.setDate(d.getDate() + 7)
  const targetDate = d.toISOString().slice(0, 10)
  let targetDay = calendarData.value.days.find((day) => day.date === targetDate)
  if (!targetDay) {
    targetDay = { date: targetDate, items: [] }
    calendarData.value.days.push(targetDay)
    calendarData.value.days.sort((a, b) => a.date.localeCompare(b.date))
  }
  const copy = { ...item, id: crypto.randomUUID() }
  if (!targetDay.items) targetDay.items = []
  targetDay.items.push(copy)
  ElMessage.success(`已复制到 ${targetDate}`)
}

function deleteItem(item: CalendarItem) {
  if (!selectedDay.value) return
  const items = selectedDay.value.items || []
  const idx = items.indexOf(item)
  if (idx >= 0) {
    items.splice(idx, 1)
    ElMessage.success('已删除')
    if (items.length === 0) detailDrawerVisible.value = false
  }
}

function copyDayToNextWeek() {
  if (!calendarData.value || !selectedDay.value) return
  const srcDate = selectedDay.value.date
  const items = selectedDay.value.items || []
  if (!items.length) {
    ElMessage.warning('当天暂无内容')
    return
  }
  const d = new Date(srcDate)
  d.setDate(d.getDate() + 7)
  const targetDate = d.toISOString().slice(0, 10)
  let targetDay = calendarData.value.days.find((day) => day.date === targetDate)
  if (!targetDay) {
    targetDay = { date: targetDate, items: [] }
    calendarData.value.days.push(targetDay)
    calendarData.value.days.sort((a, b) => a.date.localeCompare(b.date))
  }
  for (const item of items) {
    const copy = { ...item, id: crypto.randomUUID() }
    if (!targetDay.items) targetDay.items = []
    targetDay.items.push(copy)
  }
  ElMessage.success(`已复制 ${items.length} 条到 ${targetDate}`)
}

const PEAK_TIME_PRESETS = ['12:00', '12:30', '13:00', '14:00', '19:00', '20:00', '21:00', '22:00']

function addItemToDay(day: CalendarDay) {
  const existingCount = day.items?.length || 0
  const item: CalendarItem = {
    id: crypto.randomUUID(),
    title: '新笔记',
    outline: '',
    tags: [],
    type: 'image',
    status: 'draft',
    suggestedTime: PEAK_TIME_PRESETS[existingCount % PEAK_TIME_PRESETS.length]
  }
  if (!day.items) day.items = []
  day.items.push(item)
}

function createBlankCalendar() {
  const days: CalendarDay[] = []
  const start = new Date()
  start.setDate(start.getDate() + 1)
  const count = form.value.daysCount || 7
  for (let i = 0; i < count; i++) {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    days.push({ date: d.toISOString().slice(0, 10), items: [] })
  }
  calendarData.value = { days }
  showForm.value = false
  selectedCalendarId.value = null
  ElMessage.success(`已创建 ${count} 天空白日历`)
  if (isLoggedIn.value && userStore.user) {
    try {
      calendarService.saveCalendar(
        { positioning: form.value.positioning || '未命名', goal: form.value.goal },
        calendarData.value,
        count
      ).then(async (saved) => {
        await loadHistory()
        selectedCalendarId.value = saved.id
        calendarData.value = saved.calendar_data
        router.replace({ query: { id: saved.id } })
        ElMessage.success('已保存到我的日历')
      }).catch(() => {})
    } catch (_) {}
  }
}

async function handleGenerate() {
  try {
    generating.value = true
    generationProgress.value = 20

    const styleKeywords = form.value.styleKeywordsStr
      ? form.value.styleKeywordsStr.split(/[,，]/).map((s) => s.trim()).filter(Boolean)
      : undefined

    const brandVoice = (form.value.brandStyle || form.value.brandForbidden || form.value.brandEmoji)
      ? {
          style: form.value.brandStyle || undefined,
          keywords: undefined,
          forbiddenWords: form.value.brandForbidden
            ? form.value.brandForbidden.split(/[,，]/).map((s) => s.trim()).filter(Boolean)
            : undefined,
          emojiList: form.value.brandEmoji
            ? form.value.brandEmoji.split(/[,，]/).map((s) => s.trim()).filter(Boolean)
            : undefined
        }
      : undefined

    generationProgress.value = 50

    const data = await calendarService.generateCalendar(
      {
        daysCount: form.value.daysCount,
        positioning: form.value.positioning,
        goal: form.value.goal,
        styleKeywords,
        referenceNotes: form.value.referenceNotes || undefined,
        brandVoice
      },
      userStore.user?.id
    )

    generationProgress.value = 100
    calendarData.value = data
    showForm.value = false
    // 登录用户：后端已自动保存，刷新列表并选中最新
    if (isLoggedIn.value && userStore.user) {
      try {
        await loadHistory()
        if (calendarHistory.value.length > 0) {
          selectedCalendarId.value = calendarHistory.value[0].id
          calendarData.value = calendarHistory.value[0].calendar_data
          router.replace({ query: { ...route.query, id: calendarHistory.value[0].id } })
          ElMessage.success('生成成功，已保存到我的日历')
        } else {
          ElMessage.success('内容日历生成成功')
        }
      } catch (e2: any) {
        ElMessage.success('内容日历生成成功')
        console.warn('刷新日历列表失败:', e2?.message)
      }
    } else {
      ElMessage.success('内容日历生成成功（登录后可永久保存到我的日历）')
    }
  } catch (e: any) {
    ElMessage.error(e?.message || '生成失败')
  } finally {
    generating.value = false
    generationProgress.value = 0
  }
}

function handleExportMarkdown() {
  if (!calendarData.value?.days) return
  const lines: string[] = ['# 内容日历\n']
  for (const day of calendarData.value.days) {
    lines.push(`## ${day.date}\n`)
    for (const item of day.items || []) {
      lines.push(`### ${item.title}`)
      lines.push(item.outline)
      if (item.tags?.length) lines.push(`标签: ${item.tags.join(', ')}`)
      if (item.suggestedTime) lines.push(`建议发布时间: ${item.suggestedTime}`)
      lines.push('')
    }
  }
  const blob = new Blob([lines.join('\n')], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `内容日历-${new Date().toISOString().slice(0, 10)}.md`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('已导出 Markdown')
}

function handleExportPDF() {
  if (!calendarData.value?.days) return
  const pdf = new jsPDF()
  let y = 20
  pdf.setFontSize(18)
  pdf.text('内容日历', 20, y)
  y += 15
  pdf.setFontSize(12)
  for (const day of calendarData.value.days) {
    if (y > 270) {
      pdf.addPage()
      y = 20
    }
    pdf.setFont('helvetica', 'bold')
    pdf.text(day.date, 20, y)
    y += 8
    pdf.setFont('helvetica', 'normal')
    for (const item of day.items || []) {
      if (y > 270) {
        pdf.addPage()
        y = 20
      }
      pdf.text(item.title, 25, y)
      y += 6
      const outline = pdf.splitTextToSize(item.outline || '', 165)
      pdf.text(outline, 25, y)
      y += outline.length * 6 + 4
    }
    y += 5
  }
  pdf.save(`内容日历-${new Date().toISOString().slice(0, 10)}.pdf`)
  ElMessage.success('已导出 PDF')
}

async function handleSave() {
  if (!calendarData.value || !isLoggedIn.value) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  const daysCount = calendarData.value.days?.length || form.value.daysCount || 7
  const inputParams = { positioning: form.value.positioning, goal: form.value.goal }
  try {
    if (selectedCalendarId.value) {
      await calendarService.updateCalendar(
        selectedCalendarId.value,
        inputParams,
        calendarData.value,
        daysCount
      )
      ElMessage.success('已更新到云端')
    } else {
      const saved = await calendarService.saveCalendar(
        inputParams,
        calendarData.value,
        daysCount
      )
      calendarHistory.value = [saved, ...calendarHistory.value.filter((h) => h.id !== saved.id)]
      selectedCalendarId.value = saved.id
      ElMessage.success('已保存到云端')
    }
  } catch (e: any) {
    ElMessage.error(e?.message || '保存失败')
  }
}

// 是否展示生成表单（新建或首次）
const showForm = ref(true)

// 选中的日历（从历史加载）
const compareSummary = computed(() => {
  if (!compareA.value || !compareB.value || compareA.value === compareB.value) return null
  const a = calendarHistory.value.find((h) => h.id === compareA.value)
  const b = calendarHistory.value.find((h) => h.id === compareB.value)
  if (!a || !b) return null
  const count = (cal: SavedCalendar) => {
    const days = cal.calendar_data?.days || []
    let items = 0
    const typeCount: Record<string, number> = {}
    for (const day of days) {
      for (const item of day.items || []) {
        items++
        const t = item.type || 'image'
        typeCount[t] = (typeCount[t] || 0) + 1
      }
    }
    const types = ['image', 'video', 'carousel', 'live_preview']
      .map((t) => `${t === 'image' ? '图文' : t === 'video' ? '短视频' : t === 'carousel' ? '轮播' : '直播'}:${typeCount[t] || 0}`)
      .join(' ')
    return { days: days.length, items, types }
  }
  return { a: count(a), b: count(b) }
})

const selectedCalendar = computed(() => {
  if (!selectedCalendarId.value) return null
  return calendarHistory.value.find((h) => h.id === selectedCalendarId.value) || null
})

// 加载历史列表
async function loadHistory() {
  loadingHistory.value = true
  try {
    const list = await calendarService.loadCalendarHistory()
    calendarHistory.value = list
    if (list.length > 0 && !selectedCalendarId.value) {
      const idFromRoute = route.query.id as string
      selectedCalendarId.value = idFromRoute && list.some((h) => h.id === idFromRoute)
        ? idFromRoute
        : list[0].id
      calendarData.value = list.find((h) => h.id === selectedCalendarId.value)!.calendar_data
      showForm.value = false
    }
  } catch (e) {
    console.warn('加载日历历史失败:', e)
  } finally {
    loadingHistory.value = false
  }
}

// 切换选中的日历
function selectCalendar(id: string) {
  selectedCalendarId.value = id
  const item = calendarHistory.value.find((h) => h.id === id)
  if (item) {
    calendarData.value = item.calendar_data
    form.value.positioning = item.input_params?.positioning || ''
    form.value.goal = item.input_params?.goal || '涨粉'
    router.replace({ query: { ...route.query, id } })
  }
  showForm.value = false
}

// 新建日历
function goToNewCalendar() {
  showForm.value = true
  calendarData.value = null
  selectedCalendarId.value = null
  router.replace({ path: '/calendar', query: {} })
}

onMounted(async () => {
  await userStore.refresh()

  // 从诊断/指南页跳转：预填定位、目标
  const q = route.query
  if (q.from === 'guide') {
    if (q.positioning && typeof q.positioning === 'string') {
      form.value.positioning = decodeURIComponent(q.positioning)
    }
    if (q.goal && typeof q.goal === 'string') {
      form.value.goal = decodeURIComponent(q.goal)
    }
  }

  // 加载我的日历列表
  await loadHistory()

  // 加载品牌声列表（登录用户）
  if (isLoggedIn.value) {
    try {
      brandVoices.value = await calendarService.loadBrandVoices()
    } catch (_) {}
  }

  // 若从 guide 来且有预填，且无历史，则保持表单展示
  if (q.from === 'guide' && calendarHistory.value.length === 0) {
    showForm.value = true
  }
})

// 从其他页面返回时刷新列表（确保离开后保存的数据能加载到）
onActivated(() => {
  if (isLoggedIn.value && !showForm.value) {
    loadHistory()
  }
})

// 日历数据变化时初始化显示月份
watch(
  () => calendarData.value?.days?.[0]?.date,
  (dateStr) => {
    if (dateStr) {
      const d = new Date(dateStr)
      displayMonth.value = { year: d.getFullYear(), month: d.getMonth() + 1 }
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.calendar-view {
  padding: 24px 0 48px;
}

.tool-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.header-actions-top {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

/* 我的日历列表面板 */
.calendar-list-panel {
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #ebeef5;
}

.list-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-weight: 600;
  color: #303133;
}

.list-panel-actions {
  display: flex;
  gap: 8px;
}

.compare-summary {
  margin-top: 16px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
}

.compare-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  font-size: 13px;
}

.compare-row:last-child {
  margin-bottom: 0;
}

.compare-label {
  font-weight: 500;
  min-width: 50px;
}

.compare-types {
  font-size: 12px;
  color: #909399;
}

.calendar-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.calendar-list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  cursor: pointer;
  transition: all 0.2s;
}

.calendar-list-item:hover {
  border-color: #FF2442;
  background: #fff9f9;
}

.calendar-list-item.active {
  border-color: #FF2442;
  background: #fff0f2;
}

.item-main {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.item-title {
  font-weight: 500;
  color: #303133;
}

.item-goal {
  font-size: 12px;
  color: #909399;
}

.item-meta {
  font-size: 11px;
  color: #c0c4cc;
}

.calendar-list-item .item-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.tool-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px;
}

.tool-description {
  color: #666;
  margin: 0;
  font-size: 14px;
}

.diagnosis-tip {
  margin-bottom: 20px;
}

.ai-first-tip {
  margin-bottom: 20px;
}

.form-cta-hint {
  font-size: 13px;
  color: #67c23a;
  margin: 8px 0 0;
}

.tip-link {
  color: #FF2442;
  font-weight: 600;
  text-decoration: none;
}

.tip-link:hover {
  text-decoration: underline;
}

.form-section {
  margin-bottom: 24px;
}

.generate-form :deep(.el-form-item) {
  margin-bottom: 16px;
}

.hint-text {
  font-size: 12px;
  color: #999;
  margin: 4px 0 0;
}

.loading-section {
  padding: 48px 24px;
  text-align: center;
  color: #666;
}

.loading-section .el-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.generating-section {
  padding: 48px 24px;
  text-align: center;
}

.generating-text {
  margin-top: 16px;
  color: #666;
}

.calendar-section {
  margin-top: 24px;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 8px;
}

/* 月历导航 */
.month-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  margin-bottom: 16px;
}

.month-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  min-width: 120px;
  text-align: center;
}

/* 月历表格 */
.month-calendar {
  border: 1px solid #ebeef5;
  border-radius: 12px;
  overflow: hidden;
}

.weekday-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
}

.weekday-cell {
  padding: 10px 8px;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: #606266;
}

.week-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  border-bottom: 1px solid #ebeef5;
}

.week-row:last-child {
  border-bottom: none;
}

.day-cell {
  min-height: 90px;
  padding: 8px;
  border-right: 1px solid #ebeef5;
  font-size: 13px;
  transition: background 0.2s;
}

.day-cell:last-child {
  border-right: none;
}

.day-cell.empty {
  background: #fafafa;
}

.day-cell.in-range {
  cursor: pointer;
  background: #fff;
}

.day-cell.in-range:hover {
  background: #fff9f9;
}

.cell-date {
  font-weight: 600;
  color: #333;
  margin-bottom: 2px;
}

.cell-weekday {
  font-size: 11px;
  color: #909399;
  margin-bottom: 6px;
}

.cell-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cell-item {
  font-size: 12px;
  color: #606266;
  padding: 4px 6px;
  background: #f5f7fa;
  border-radius: 4px;
  border-left: 3px solid #FF2442;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 4px;
}

.cell-item-title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cell-item-time {
  font-size: 11px;
  color: #909399;
  flex-shrink: 0;
}

.cell-more {
  font-size: 11px;
  color: #909399;
}

.empty-section {
  padding: 48px 24px;
  text-align: center;
}

.day-detail {
  padding: 0 8px;
}

.analyze-result {
  margin-bottom: 16px;
}

.analyze-suggestions {
  margin: 8px 0 0;
  padding-left: 18px;
  font-size: 13px;
  color: #606266;
  line-height: 1.6;
}

.batch-actions {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

.empty-day-tip {
  text-align: center;
  padding: 24px;
  color: #909399;
}

.add-item-btn {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
}

.detail-form-item {
  margin-bottom: 12px;
}

.detail-form-item :deep(.el-form-item__label) {
  font-size: 12px;
  color: #909399;
}

.published-note-section {
  margin-top: 12px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
}

.published-stats {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.published-stats .el-input-number {
  width: 100px;
}

.detail-item-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-top: 12px;
  padding-top: 8px;
  border-top: 1px dashed #ebeef5;
}

.detail-item {
  padding: 16px 0;
  border-bottom: 1px solid #ebeef5;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-item-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.suggested-time {
  font-size: 12px;
  color: #999;
}

.detail-title {
  margin: 0 0 8px;
  font-size: 15px;
}

.detail-outline {
  margin: 0 0 8px;
  font-size: 13px;
  color: #666;
  line-height: 1.6;
}

.detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

@media (max-width: 768px) {
  .day-cell {
    min-height: 70px;
    padding: 6px;
  }
  .cell-item {
    font-size: 11px;
    padding: 3px 4px;
  }
}
</style>
