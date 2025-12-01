<template>
  <article class="answer-card">
    <!-- 回答头部 -->
    <div class="answer-header">
      <div class="user-info">
        <el-avatar :src="answer.author.avatar" :size="40">
          {{ answer.author.name.charAt(0) }}
        </el-avatar>
        <div class="user-details">
          <div class="user-name">
            {{ answer.author.name }}
            <el-tag v-if="answer.author.isExpert" type="warning" size="small">
              <el-icon><Medal /></el-icon>
              专家
            </el-tag>
          </div>
          <div class="answer-meta">
            <span>{{ formatDate(answer.createdAt) }}</span>
            <span v-if="answer.isAccepted" class="accepted">· 最佳答案</span>
          </div>
        </div>
      </div>
      
      <el-tag v-if="answer.isAccepted" type="success" size="small">
        <el-icon><Check /></el-icon>
        已采纳
      </el-tag>
    </div>

    <!-- 回答内容 -->
    <div class="answer-content">
      <div class="answer-text" v-html="renderedContent"></div>
      
      <!-- 图片附件 -->
      <div v-if="answer.images && answer.images.length > 0" class="answer-images">
        <LazyImage
          v-for="(image, index) in answer.images"
          :key="index"
          :src="image"
          :alt="`回答图片 ${index + 1}`"
          aspect-ratio="16/9"
          class="answer-image"
          @click="handleImageClick(image, index)"
        />
      </div>
    </div>

    <!-- 回答底部 -->
    <div class="answer-footer">
      <div class="stats">
        <span class="stat-item">
          <el-icon><Star /></el-icon>
          {{ answer.likeCount }}个赞
        </span>
        <span class="stat-item">
          <el-icon><ChatDotRound /></el-icon>
          {{ answer.commentCount }}条评论
        </span>
      </div>
      
      <div class="actions">
        <el-button
          size="small"
          :icon="Star"
          :type="answer.isLiked ? 'primary' : 'default'"
          @click="handleLike"
        >
          {{ answer.isLiked ? '已赞' : '点赞' }}
        </el-button>
        <el-button
          size="small"
          :icon="ChatDotRound"
          @click="handleComment"
        >
          评论
        </el-button>
        <el-button
          size="small"
          :icon="Share"
          @click="handleShare"
        >
          分享
        </el-button>
      </div>
    </div>

    <!-- 评论区 -->
    <div v-if="showComments && answer.comments && answer.comments.length > 0" class="comments-section">
      <div class="comments-header">
        <h4>评论 ({{ answer.commentCount }})</h4>
      </div>
      <div class="comments-list">
        <div
          v-for="comment in answer.comments"
          :key="comment.id"
          class="comment-item"
        >
          <el-avatar :src="comment.author.avatar" :size="32">
            {{ comment.author.name.charAt(0) }}
          </el-avatar>
          <div class="comment-content">
            <div class="comment-author">{{ comment.author.name }}</div>
            <div class="comment-text">{{ comment.content }}</div>
            <div class="comment-meta">{{ formatDate(comment.createdAt) }}</div>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Check, Star, ChatDotRound, Share, Medal } from '@element-plus/icons-vue'
import { marked } from 'marked'
import LazyImage from '@/components/LazyImage.vue'

interface Answer {
  id: string
  content: string
  author: {
    id: string
    name: string
    avatar: string
    isExpert: boolean
  }
  images?: string[]
  likeCount: number
  commentCount: number
  isLiked: boolean
  isAccepted: boolean
  createdAt: string
  comments?: Array<{
    id: string
    content: string
    author: {
      id: string
      name: string
      avatar: string
    }
    createdAt: string
  }>
}

interface Props {
  answer: Answer
}

const props = defineProps<Props>()
const emit = defineEmits<{
  like: []
  comment: []
  share: []
  imageClick: [image: string, index: number]
}>()

const showComments = ref(false)

const renderedContent = computed(() => {
  return marked(props.answer.content)
})

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 60) {
    return `${minutes}分钟前`
  } else if (hours < 24) {
    return `${hours}小时前`
  } else if (days < 30) {
    return `${days}天前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}

const handleLike = () => {
  emit('like')
}

const handleComment = () => {
  showComments.value = !showComments.value
  emit('comment')
}

const handleShare = () => {
  emit('share')
}

const handleImageClick = (image: string, index: number) => {
  emit('imageClick', image, index)
}
</script>

<style scoped>
.answer-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  margin-bottom: 16px;
}

.answer-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.user-info {
  display: flex;
  gap: 12px;
  align-items: center;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.answer-meta {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.accepted {
  color: #10b981;
  font-weight: 600;
}

.answer-content {
  margin-bottom: 16px;
}

.answer-text {
  font-size: 0.9375rem;
  line-height: 1.8;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.answer-text :deep(p) {
  margin: 12px 0;
}

.answer-text :deep(ul),
.answer-text :deep(ol) {
  margin: 12px 0;
  padding-left: 24px;
}

.answer-text :deep(code) {
  background: var(--bg-secondary);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}

.answer-images {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.answer-image {
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: pointer;
  transition: transform var(--transition-fast);
}

.answer-image:hover {
  transform: scale(1.05);
}

.answer-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

.stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.actions {
  display: flex;
  gap: 8px;
}

.comments-section {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
}

.comments-header h4 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 16px 0;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-item {
  display: flex;
  gap: 12px;
}

.comment-content {
  flex: 1;
  background: var(--bg-secondary);
  padding: 12px;
  border-radius: var(--radius-md);
}

.comment-author {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.comment-text {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 4px;
}

.comment-meta {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .answer-card {
    padding: 16px;
  }
  
  .answer-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .actions {
    width: 100%;
  }
  
  .actions .el-button {
    flex: 1;
  }
  
  .answer-images {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
