<template>
  <div class="community-question-detail">
    <div class="container">
      <Breadcrumb :items="breadcrumbItems" />

      <div v-if="loading" class="loading-state">
        <el-skeleton :rows="6" animated />
      </div>

      <div v-else-if="!question" class="empty-state">
        <el-result icon="warning" title="问题不存在">
          <template #sub-title>
            <p>该问题可能已被删除或链接有误</p>
          </template>
          <template #extra>
            <el-button type="primary" @click="router.push('/community')">返回社区</el-button>
          </template>
        </el-result>
      </div>

      <template v-else>
        <!-- 问题主体 -->
        <article class="question-main">
          <div class="question-header">
            <div class="user-info">
              <el-avatar :src="question.author?.avatar" :size="48">
                {{ question.author?.name?.charAt(0) }}
              </el-avatar>
              <div class="user-details">
                <span class="user-name">{{ question.author?.name }}</span>
                <span class="question-meta">
                  {{ formatDate(question.createdAt) }}
                  <span v-if="categoryLabel" class="category"> · {{ categoryLabel }}</span>
                </span>
              </div>
            </div>
            <el-tag v-if="question.isResolved" type="success" size="small">
              <el-icon><Check /></el-icon>
              已解决
            </el-tag>
          </div>

          <h1 class="question-title">{{ question.title }}</h1>
          <div class="question-body">{{ question.description }}</div>

          <div v-if="question.tags?.length" class="question-tags">
            <el-tag v-for="tag in question.tags" :key="tag" size="small" type="info" effect="plain">
              {{ tag }}
            </el-tag>
          </div>

          <div class="question-actions">
            <span class="stat-item">
              <el-icon><View /></el-icon>
              {{ formatNumber(question.viewCount) }} 浏览
            </span>
            <span class="stat-item">
              <el-icon><ChatDotRound /></el-icon>
              {{ question.answerCount }} 回答
            </span>
            <el-button
              size="small"
              :type="question.isLiked ? 'primary' : 'default'"
              @click="handleLike"
            >
              <el-icon><Star /></el-icon>
              {{ question.isLiked ? '已赞' : '点赞' }} ({{ question.likeCount }})
            </el-button>
            <el-button
              size="small"
              :type="question.isCollected ? 'warning' : 'default'"
              @click="handleCollect"
            >
              <el-icon><Collection /></el-icon>
              {{ question.isCollected ? '已收藏' : '收藏' }}
            </el-button>
          </div>
        </article>

        <!-- 回答列表 -->
        <section class="answers-section">
          <h2 class="section-title">{{ answers.length }} 个回答</h2>
          <div v-if="answers.length === 0" class="no-answers">
            <p>暂无回答，快来写下第一个回答吧～</p>
            <el-button type="primary" @click="focusReply">写回答</el-button>
          </div>
          <ul v-else class="answer-list">
            <li v-for="answer in answers" :key="answer.id" class="answer-item">
              <div class="answer-header">
                <el-avatar :src="answer.author?.avatar" :size="36">
                  {{ answer.author?.name?.charAt(0) }}
                </el-avatar>
                <div class="answer-meta">
                  <span class="answer-author">{{ answer.author?.name }}</span>
                  <span class="answer-date">{{ formatDate(answer.createdAt) }}</span>
                </div>
                <el-tag v-if="answer.isAccepted" type="success" size="small">采纳</el-tag>
              </div>
              <div class="answer-body">{{ answer.content }}</div>
            </li>
          </ul>
        </section>

        <!-- 写回答 -->
        <div class="reply-section">
          <h3>写下你的回答</h3>
          <el-input
            v-model="replyContent"
            type="textarea"
            :rows="4"
            placeholder="分享你的经验或建议..."
            maxlength="1000"
            show-word-limit
          />
          <el-button type="primary" :loading="submitting" @click="handleSubmitReply">
            发布回答
          </el-button>
        </div>

        <div class="back-link">
          <el-button text type="primary" @click="router.push('/community')">
            <el-icon><ArrowLeft /></el-icon>
            返回社区问答
          </el-button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Check,
  View,
  ChatDotRound,
  Star,
  Collection,
  ArrowLeft
} from '@element-plus/icons-vue'
import Breadcrumb from '@/components/Breadcrumb.vue'
import { communityService } from '@/services/communityService'
import { useUserStore } from '@/stores/userStore'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const questionId = computed(() => route.params.id as string)
const loading = ref(true)
const question = ref<any>(null)
const replyContent = ref('')
const submitting = ref(false)

// 分类文案映射
const categoryMap: Record<string, string> = {
  content: '内容创作',
  operation: '账号运营',
  analytics: '数据分析',
  growth: '涨粉技巧',
  monetization: '变现方法'
}

const categoryLabel = computed(() =>
  question.value?.category ? categoryMap[question.value.category] || question.value.category : ''
)

const breadcrumbItems = computed(() => [
  { label: '首页', path: '/' },
  { label: '社区问答', path: '/community' },
  { label: question.value?.title || '问题详情', path: '' }
])

const answers = ref<any[]>([])

async function loadQuestion() {
  loading.value = true
  question.value = null
  answers.value = []
  try {
    const q = await communityService.getQuestionById(questionId.value)
    question.value = q
    if (q) {
      const list = await communityService.getAnswers(questionId.value)
      answers.value = list.map(a => ({
        id: a.id,
        author: a.author,
        content: a.content,
        createdAt: a.createdAt,
        isAccepted: a.isAccepted
      }))
    }
  } catch (e) {
    console.error('加载问题失败', e)
    question.value = null
    answers.value = []
  } finally {
    loading.value = false
  }
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)} 天前`
  return d.toLocaleDateString('zh-CN')
}

function formatNumber(n: number) {
  if (n >= 10000) return (n / 10000).toFixed(1) + '万'
  return String(n)
}

async function handleLike() {
  if (!question.value) return
  try {
    const { count } = await communityService.incrementQuestionLike(question.value.id)
    question.value.likeCount = count
    ElMessage.success('点赞成功')
  } catch (e) {
    ElMessage.error('操作失败')
  }
}

function handleCollect() {
  if (!question.value) return
  question.value.isCollected = !question.value.isCollected
  ElMessage.success(question.value.isCollected ? '收藏成功' : '已取消收藏')
}

function focusReply() {
  document.querySelector<HTMLElement>('.reply-section textarea')?.focus()
}

async function handleSubmitReply() {
  const content = replyContent.value.trim()
  if (!content) {
    ElMessage.warning('请输入回答内容')
    return
  }
  if (!question.value) return
  submitting.value = true
  try {
    const newAnswer = await communityService.createAnswer(question.value.id, {
      content,
      authorId: userStore.user?.id,
      authorName: userStore.profile?.nickname || userStore.user?.email || '匿名用户',
      authorAvatar: userStore.profile?.avatar_url ?? undefined
    })
    answers.value = [
      ...answers.value,
      {
        id: newAnswer.id,
        author: newAnswer.author,
        content: newAnswer.content,
        createdAt: newAnswer.createdAt,
        isAccepted: newAnswer.isAccepted
      }
    ]
    question.value.answerCount = answers.value.length
    replyContent.value = ''
    ElMessage.success('回答已发布')
  } catch (e) {
    ElMessage.error('发布失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

onMounted(loadQuestion)
watch(questionId, loadQuestion)
</script>

<style scoped>
.community-question-detail {
  min-height: 60vh;
  padding: 24px 0 48px;
  background: #f9fafb;
}

.container {
  max-width: 720px;
  margin: 0 auto;
  padding: 0 20px;
}

.loading-state,
.empty-state {
  margin-top: 32px;
}

.question-main {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.question-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-weight: 600;
  color: #303133;
}

.question-meta {
  font-size: 13px;
  color: #909399;
}

.question-meta .category {
  color: #606266;
}

.question-title {
  font-size: 1.5rem;
  color: #303133;
  margin: 0 0 12px;
  line-height: 1.4;
}

.question-body {
  color: #606266;
  line-height: 1.7;
  white-space: pre-wrap;
  margin-bottom: 16px;
}

.question-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.question-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}

.stat-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #909399;
}

.answers-section {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.section-title {
  font-size: 1.125rem;
  color: #303133;
  margin: 0 0 16px;
}

.no-answers {
  text-align: center;
  padding: 24px;
  color: #909399;
}

.no-answers .el-button {
  margin-top: 12px;
}

.answer-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.answer-item {
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.answer-item:last-child {
  border-bottom: none;
}

.answer-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.answer-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.answer-author {
  font-weight: 500;
  color: #303133;
}

.answer-date {
  font-size: 12px;
  color: #909399;
}

.answer-body {
  color: #606266;
  line-height: 1.6;
  white-space: pre-wrap;
  padding-left: 46px;
}

.reply-section {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.reply-section h3 {
  margin: 0 0 12px;
  font-size: 1rem;
  color: #303133;
}

.reply-section .el-textarea {
  margin-bottom: 12px;
}

.back-link {
  margin-top: 16px;
}
</style>
