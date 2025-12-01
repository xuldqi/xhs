<template>
  <article class="case-card" @click="handleClick">
    <!-- 卡片头部 -->
    <div class="card-header">
      <div class="account-info">
        <div class="account-avatar">
          {{ getInitial(caseStudy.author) }}
        </div>
        <div class="account-details">
          <h3 class="account-name">{{ caseStudy.title }}</h3>
          <span class="account-type">{{ caseStudy.accountType }}</span>
        </div>
      </div>
      
      <el-tag v-if="caseStudy.featured" type="warning" effect="dark">
        <el-icon><Star /></el-icon>
        精选案例
      </el-tag>
    </div>

    <!-- 增长数据 -->
    <div class="growth-stats">
      <div class="stat-item">
        <div class="stat-label">起始粉丝</div>
        <div class="stat-value">{{ formatNumber(caseStudy.followersBefore) }}</div>
      </div>
      <div class="stat-arrow">
        <el-icon><Right /></el-icon>
      </div>
      <div class="stat-item">
        <div class="stat-label">当前粉丝</div>
        <div class="stat-value highlight">{{ formatNumber(caseStudy.followersAfter) }}</div>
      </div>
      <div class="stat-item growth-rate">
        <div class="stat-label">增长率</div>
        <div class="stat-value success">+{{ caseStudy.growthRate }}%</div>
      </div>
    </div>

    <!-- 增长周期 -->
    <div class="growth-period">
      <el-icon><Clock /></el-icon>
      <span>{{ caseStudy.growthPeriod }}</span>
    </div>

    <!-- 关键策略 -->
    <div class="key-strategies">
      <h4>关键策略</h4>
      <div class="strategy-tags">
        <el-tag
          v-for="(strategy, index) in caseStudy.keyStrategies.slice(0, 3)"
          :key="index"
          size="small"
          type="success"
          effect="plain"
        >
          {{ strategy }}
        </el-tag>
        <span v-if="caseStudy.keyStrategies.length > 3" class="more-strategies">
          +{{ caseStudy.keyStrategies.length - 3 }}
        </span>
      </div>
    </div>

    <!-- 卡片底部 -->
    <div class="card-footer">
      <div class="meta-info">
        <span class="meta-item">
          <el-icon><View /></el-icon>
          {{ formatNumber(caseStudy.viewCount) }}
        </span>
        <span class="meta-item">
          <el-icon><Star /></el-icon>
          {{ formatNumber(caseStudy.likeCount) }}
        </span>
      </div>
      <el-button type="primary" size="small" :icon="ArrowRight">
        查看详情
      </el-button>
    </div>
  </article>
</template>

<script setup lang="ts">
import { Star, Right, Clock, View, ArrowRight } from '@element-plus/icons-vue'
import type { CaseStudy } from '@/types/content'

interface Props {
  caseStudy: CaseStudy
}

const props = defineProps<Props>()
const emit = defineEmits<{
  click: []
}>()

const getInitial = (name: string) => {
  return name.charAt(0).toUpperCase()
}

const formatNumber = (num: number) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}

const handleClick = () => {
  emit('click')
}
</script>

<style scoped>
.case-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.case-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.account-info {
  display: flex;
  gap: 12px;
  align-items: center;
  flex: 1;
}

.account-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 600;
  flex-shrink: 0;
}

.account-details {
  flex: 1;
  min-width: 0;
}

.account-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-type {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.growth-stats {
  display: grid;
  grid-template-columns: 1fr auto 1fr 1fr;
  gap: 16px;
  padding: 20px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  align-items: center;
}

.stat-item {
  text-align: center;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  margin-bottom: 4px;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.stat-value.highlight {
  color: #667eea;
}

.stat-value.success {
  color: #10b981;
}

.stat-arrow {
  color: var(--text-tertiary);
  font-size: 1.5rem;
}

.growth-rate {
  border-left: 1px solid var(--border-color);
  padding-left: 16px;
}

.growth-period {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: var(--text-secondary);
  padding: 8px 12px;
  background: #fef3c7;
  border-radius: var(--radius-md);
  width: fit-content;
}

.key-strategies h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 12px 0;
}

.strategy-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.more-strategies {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

.meta-info {
  display: flex;
  gap: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .case-card {
    padding: 16px;
  }
  
  .growth-stats {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .stat-arrow {
    display: none;
  }
  
  .growth-rate {
    border-left: none;
    border-top: 1px solid var(--border-color);
    padding-left: 0;
    padding-top: 12px;
  }
}
</style>
