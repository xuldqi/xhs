<template>
  <div class="hero-calendar-mockup">
    <div class="mockup-frame">
      <div class="mockup-header">
        <span class="mockup-title">你的 30 天内容日历</span>
        <span class="mockup-badge">AI 规划</span>
      </div>
      <div class="mockup-calendar">
        <div class="week-row">
          <div v-for="day in sampleDays" :key="day.date" class="day-cell">
            <div class="day-date">{{ day.date }}</div>
            <div class="day-content">
              <div class="day-item" v-for="item in day.items" :key="item.title">
                {{ item.title }}
                <span v-if="item.time" class="item-time">{{ item.time }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="mockup-footer">
        <span class="footer-hint">标题 · 大纲 · 标签 · 发布时间，一键搞定</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const sampleDays = [
  { date: '周一', items: [{ title: 'OOTD 穿搭', time: '12:00' }] },
  { date: '周二', items: [{ title: '干货分享：新手避坑', time: '19:00' }] },
  { date: '周三', items: [{ title: '好物推荐', time: '14:00' }, { title: '粉丝互动', time: '20:00' }] },
  { date: '周四', items: [{ title: '教程：xxx', time: '12:00' }] },
  { date: '周五', items: [{ title: '周末预告', time: '18:00' }] },
  { date: '周六', items: [{ title: 'vlog 日常', time: '10:00' }] },
  { date: '周日', items: [{ title: '下周规划', time: '15:00' }] }
]
</script>

<style scoped>
.hero-calendar-mockup {
  width: 100%;
  max-width: 420px;
  padding: 16px;
}

.mockup-frame {
  background: white;
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(255, 36, 66, 0.15), 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 36, 66, 0.12);
  overflow: hidden;
}

.mockup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  background: linear-gradient(135deg, #ff2442 0%, #ff5c77 100%);
  color: white;
}

.mockup-title {
  font-size: 15px;
  font-weight: 600;
}

.mockup-badge {
  font-size: 11px;
  padding: 3px 8px;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 12px;
}

.mockup-calendar {
  padding: 16px;
}

.week-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.day-cell {
  min-height: 70px;
  padding: 10px 8px;
  background: #fafafa;
  border-radius: 10px;
  border: 1px solid #eee;
}

.day-date {
  font-size: 12px;
  font-weight: 600;
  color: #666;
  margin-bottom: 6px;
}

.day-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.day-item {
  font-size: 11px;
  color: #333;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-time {
  display: block;
  font-size: 10px;
  color: #999;
}

.mockup-footer {
  padding: 10px 18px;
  background: #f8f9fa;
  border-top: 1px solid #eee;
}

.footer-hint {
  font-size: 12px;
  color: #888;
}

@media (max-width: 768px) {
  .hero-calendar-mockup {
    max-width: 100%;
  }
  .week-row {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
