<template>
  <div class="scheduler-view">
    <div class="container">
      <Breadcrumb :items="breadcrumbItems" />
      
      <div class="tool-header">
        <h1 class="tool-title">定时发布计划</h1>
        <p class="tool-description">
          规划内容发布时间，把握最佳发帖时段
        </p>
      </div>

      <div class="tool-content">
        <el-alert
          type="info"
          :closable="false"
          show-icon
          class="info-alert"
        >
          <template #title>使用说明</template>
          当前为规划辅助工具，支持添加待发内容、设置建议时间。发帖时需手动复制到小红书。后续将支持提醒推送。
        </el-alert>

        <div class="scheduler-actions">
          <el-button type="primary" @click="showAddDialog = true">
            <el-icon><Plus /></el-icon>
            添加计划
          </el-button>
          <el-button @click="copyTodayPlan">
            <el-icon><CopyDocument /></el-icon>
            复制今日计划
          </el-button>
        </div>

        <div class="schedule-list">
          <div
            v-for="(item, index) in scheduleList"
            :key="item.id"
            class="schedule-item"
          >
            <div class="item-time">
              <span class="date">{{ item.date }}</span>
              <span class="time">{{ item.time }}</span>
            </div>
            <div class="item-content">
              <h4>{{ item.title }}</h4>
              <p v-if="item.outline">{{ item.outline }}</p>
              <div v-if="item.tags?.length" class="item-tags">
                <el-tag v-for="(t, i) in item.tags" :key="i" size="small">{{ t }}</el-tag>
              </div>
            </div>
            <div class="item-actions">
              <el-button size="small" :icon="CopyDocument" @click="copyItem(item)" circle />
              <el-button size="small" type="danger" :icon="Delete" @click="removeItem(index)" circle plain />
            </div>
          </div>

          <div v-if="scheduleList.length === 0" class="empty-schedule">
            <el-empty description="暂无发布计划，点击「添加计划」开始规划" />
          </div>
        </div>
      </div>
    </div>

    <el-dialog v-model="showAddDialog" title="添加发布计划" width="480px" @close="resetAddForm">
      <el-form :model="addForm" label-position="top">
        <el-form-item label="发布日期">
          <el-date-picker
            v-model="addForm.date"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="建议时间">
          <el-select v-model="addForm.time" placeholder="选择时间" style="width: 100%">
            <el-option
              v-for="t in timeOptions"
              :key="t"
              :label="t"
              :value="t"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="标题/钩子">
          <el-input v-model="addForm.title" placeholder="笔记标题或开头文案" />
        </el-form-item>
        <el-form-item label="大纲（可选）">
          <el-input v-model="addForm.outline" type="textarea" :rows="3" placeholder="正文大纲" />
        </el-form-item>
        <el-form-item label="标签（可选，逗号分隔）">
          <el-input v-model="addForm.tagsStr" placeholder="例如：护肤,平价,学生党" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="addItem">添加</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, CopyDocument, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import Breadcrumb from '@/components/Breadcrumb.vue'

interface ScheduleItem {
  id: string
  date: string
  time: string
  title: string
  outline?: string
  tags?: string[]
}

const breadcrumbItems = computed(() => [
  { label: '首页', path: '/' },
  { label: '工具箱', path: '/tools' },
  { label: '定时发布计划', path: '' }
])

const timeOptions = Array.from({ length: 36 }, (_, i) => {
  const h = 6 + Math.floor(i / 2)
  const m = i % 2 === 0 ? '00' : '30'
  return `${h}:${m}`
})

const SCHEDULER_STORAGE_KEY = 'xhs_scheduler_plans'
const showAddDialog = ref(false)
const scheduleList = ref<ScheduleItem[]>(loadStoredPlans())

function loadStoredPlans(): ScheduleItem[] {
  try {
    const raw = localStorage.getItem(SCHEDULER_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function savePlans() {
  try {
    localStorage.setItem(SCHEDULER_STORAGE_KEY, JSON.stringify(scheduleList.value))
  } catch {}
}

const addForm = ref({
  date: '',
  time: '12:00',
  title: '',
  outline: '',
  tagsStr: ''
})

function resetAddForm() {
  addForm.value = {
    date: new Date().toISOString().slice(0, 10),
    time: '12:00',
    title: '',
    outline: '',
    tagsStr: ''
  }
}

const addItem = () => {
  if (!addForm.value.title?.trim()) {
    ElMessage.warning('请填写标题')
    return
  }
  const date = addForm.value.date || new Date().toISOString().slice(0, 10)
  const tags = addForm.value.tagsStr
    ? addForm.value.tagsStr.split(/[,，]/).map(s => s.trim()).filter(Boolean)
    : []
  scheduleList.value.push({
    id: `s-${Date.now()}`,
    date,
    time: addForm.value.time || '12:00',
    title: addForm.value.title.trim(),
    outline: addForm.value.outline?.trim() || undefined,
    tags: tags.length ? tags : undefined
  })
  scheduleList.value.sort((a, b) => {
    const da = `${a.date} ${a.time}`
    const db = `${b.date} ${b.time}`
    return da.localeCompare(db)
  })
  savePlans()
  showAddDialog.value = false
  resetAddForm()
  ElMessage.success('已添加')
}

const removeItem = (index: number) => {
  scheduleList.value.splice(index, 1)
  savePlans()
}

const copyItem = (item: ScheduleItem) => {
  const text = [
    `【${item.date} ${item.time}】${item.title}`,
    item.outline ? `\n大纲：${item.outline}` : '',
    item.tags?.length ? `\n标签：${item.tags.join(' #')}` : ''
  ].filter(Boolean).join('')
  navigator.clipboard.writeText(text).then(() => ElMessage.success('已复制')).catch(() => ElMessage.error('复制失败'))
}

const copyTodayPlan = () => {
  const today = new Date().toISOString().slice(0, 10)
  const items = scheduleList.value.filter(i => i.date === today)
  if (items.length === 0) {
    ElMessage.info('今日暂无计划')
    return
  }
  const text = items.map(i =>
    `【${i.time}】${i.title}\n${i.outline || ''}\n${i.tags?.length ? '#' + i.tags.join(' #') : ''}`
  ).join('\n\n')
  navigator.clipboard.writeText(text).then(() => ElMessage.success('今日计划已复制')).catch(() => ElMessage.error('复制失败'))
}

resetAddForm()
</script>

<style scoped>
.scheduler-view {
  min-height: 100vh;
  background: var(--bg-primary, #f5f7fa);
  padding: 32px 0;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.tool-header { text-align: center; margin: 32px 0 32px; }
.tool-title { font-size: 2rem; font-weight: 700; margin: 0 0 12px 0; }
.tool-description { font-size: 1rem; color: var(--text-secondary); }

.info-alert { margin-bottom: 24px; }

.scheduler-actions { display: flex; gap: 12px; margin-bottom: 24px; }

.schedule-list { display: flex; flex-direction: column; gap: 12px; }

.schedule-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

.item-time {
  flex: 0 0 90px;
  text-align: center;
}

.item-time .date { display: block; font-size: 14px; font-weight: 600; }
.item-time .time { display: block; font-size: 12px; color: var(--text-secondary); }

.item-content { flex: 1; min-width: 0; }
.item-content h4 { margin: 0 0 8px 0; font-size: 15px; }
.item-content p { margin: 0 0 8px 0; font-size: 13px; color: var(--text-secondary); line-height: 1.5; }
.item-tags { display: flex; flex-wrap: wrap; gap: 6px; }

.item-actions { flex: 0 0 auto; display: flex; gap: 8px; }

.empty-schedule { padding: 48px; background: #fff; border-radius: 12px; }
</style>
