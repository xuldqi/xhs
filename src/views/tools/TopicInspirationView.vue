<template>
  <div class="topic-inspiration-view">
    <div class="container">
      <Breadcrumb :items="breadcrumbItems" />
      
      <div class="tool-header">
        <h1 class="tool-title">💡 灵感话题库</h1>
        <p class="tool-description">
          发现"第一次XX"类选题灵感，为你的小红书内容提供源源不断的创作素材
        </p>
      </div>

      <!-- 使用说明 -->
      <el-card class="usage-guide" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon><InfoFilled /></el-icon>
            <span>使用说明</span>
          </div>
        </template>
        <div class="guide-content">
          <p>这个工具整合了"人生第一次"的丰富数据，帮助你：</p>
          <ul>
            <li>🔍 <strong>搜索话题</strong>：输入关键词，找到相关的"第一次"话题</li>
            <li>📚 <strong>分类浏览</strong>：按出行、财务、职场、生活等分类查看话题</li>
            <li>⭐ <strong>精选推荐</strong>：查看最受欢迎和最有价值的话题</li>
            <li>💡 <strong>获取灵感</strong>：每个话题都提供了多个可衍生的选题方向</li>
            <li>🚀 <strong>一键生成</strong>：直接使用话题跳转到爆款生成器生成内容</li>
          </ul>
        </div>
      </el-card>

      <!-- 搜索和筛选 -->
      <el-card class="search-section" shadow="never">
        <div class="search-bar">
          <el-input
            v-model="searchQuery"
            placeholder="搜索话题，例如：租房、面试、旅行、做饭..."
            size="large"
            clearable
            @input="handleSearch"
            @clear="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>

        <div class="category-filter">
          <el-button
            :type="selectedCategoryId === 'all' ? 'primary' : 'default'"
            @click="selectCategory('all')"
          >
            全部
          </el-button>
          <el-button
            v-for="category in categories"
            :key="category.id"
            :type="selectedCategoryId === category.id ? 'primary' : 'default'"
            @click="selectCategory(category.id)"
          >
            <span class="category-icon">{{ category.icon }}</span>
            {{ category.name }}
            <el-tag size="small" type="info" style="margin-left: 6px;">
              {{ category.count }}
            </el-tag>
          </el-button>
        </div>
      </el-card>

      <!-- 精选推荐 -->
      <el-card v-if="!searchQuery && selectedCategoryId === 'all'" class="featured-section" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon><Star /></el-icon>
            <span>精选推荐</span>
          </div>
        </template>
        <div class="featured-topics">
          <div
            v-for="topic in featuredTopics"
            :key="topic.id"
            class="featured-topic-card"
            @click="viewTopicDetail(topic)"
          >
            <div class="featured-badge">⭐ 精选</div>
            <h3 class="topic-title">{{ topic.xhsTitle }}</h3>
            <p class="topic-intro">{{ topic.intro }}</p>
            <div class="topic-meta">
              <el-tag size="small" type="info">{{ topic.category }}</el-tag>
              <el-tag
                size="small"
                :type="topic.relevance >= 9 ? 'success' : topic.relevance >= 7 ? 'warning' : 'info'"
              >
                关联度: {{ topic.relevance }}/10
              </el-tag>
            </div>
            <el-button
              type="primary"
              size="small"
              @click.stop="useTopicForGenerator(topic)"
            >
              使用此话题
            </el-button>
          </div>
        </div>
      </el-card>

      <!-- 话题列表 -->
      <el-card class="topics-section" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon><List /></el-icon>
            <span>
              {{ searchQuery ? `搜索结果 (${filteredTopics.length})` : selectedCategoryId === 'all' ? `全部话题 (${filteredTopics.length})` : `${selectedCategoryName} (${filteredTopics.length})` }}
            </span>
          </div>
        </template>
        <div v-if="filteredTopics.length === 0" class="empty-state">
          <el-empty description="没有找到相关话题，试试其他关键词或分类" />
        </div>
        <div v-else class="topics-list">
          <div
            v-for="topic in filteredTopics"
            :key="topic.id"
            class="topic-item"
            @click="viewTopicDetail(topic)"
          >
            <div class="topic-main">
              <div class="topic-header">
                <h3 class="topic-title">{{ topic.xhsTitle }}</h3>
                <el-tag v-if="topic.featured" type="warning" size="small">精选</el-tag>
              </div>
              <p class="topic-intro">{{ topic.intro }}</p>
              <div class="topic-tags">
                <el-tag
                  v-for="tag in topic.tags.slice(0, 5)"
                  :key="tag"
                  size="small"
                  style="margin-right: 6px;"
                >
                  {{ tag }}
                </el-tag>
              </div>
              <div class="topic-keywords">
                <span class="keywords-label">关键词：</span>
                <el-tag
                  v-for="keyword in topic.xhsKeywords.slice(0, 6)"
                  :key="keyword"
                  type="primary"
                  effect="plain"
                  size="small"
                  style="margin: 2px 4px;"
                >
                  {{ keyword }}
                </el-tag>
              </div>
            </div>
            <div class="topic-side">
              <el-tag type="info" size="small">{{ topic.category }}</el-tag>
              <div class="topic-stats">
                <el-tag
                  size="small"
                  :type="topic.relevance >= 9 ? 'success' : topic.relevance >= 7 ? 'warning' : 'info'"
                >
                  关联度: {{ topic.relevance }}/10
                </el-tag>
              </div>
              <el-button
                type="primary"
                size="small"
                @click.stop="useTopicForGenerator(topic)"
              >
                使用此话题
              </el-button>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 话题详情对话框 -->
      <el-dialog
        v-model="detailDialogVisible"
        :title="selectedTopic?.xhsTitle"
        width="900px"
        class="topic-detail-dialog"
      >
        <div v-if="selectedTopic" class="topic-detail">
          <div class="detail-header">
            <el-tag type="info" size="large">{{ selectedTopic.category }}</el-tag>
            <div class="detail-stats">
              <el-tag
                :type="selectedTopic.relevance >= 9 ? 'success' : selectedTopic.relevance >= 7 ? 'warning' : 'info'"
              >
                关联度: {{ selectedTopic.relevance }}/10
              </el-tag>
              <span v-if="selectedTopic.difficulty">难度: {{ selectedTopic.difficulty }}</span>
              <span v-if="selectedTopic.duration">时长: {{ selectedTopic.duration }}</span>
            </div>
          </div>

          <div class="detail-section">
            <h4>📝 话题简介</h4>
            <p>{{ selectedTopic.intro }}</p>
          </div>

          <div v-if="selectedTopic.steps && selectedTopic.steps.length > 0" class="detail-section">
            <h4>📋 详细步骤</h4>
            <div class="steps-list">
              <div
                v-for="(step, index) in selectedTopic.steps"
                :key="index"
                class="step-item"
              >
                <div class="step-number">{{ index + 1 }}</div>
                <div class="step-content">
                  <h5>{{ step.title }}</h5>
                  <p>{{ step.detail }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h4>💡 可衍生的选题方向</h4>
            <div class="topics-list">
              <div
                v-for="(topic, index) in selectedTopic.xhsTopics"
                :key="index"
                class="topic-option"
                @click="useTopicTitleForGenerator(topic)"
              >
                <el-icon><Lightbulb /></el-icon>
                <span>{{ topic }}</span>
                <el-button
                  type="primary"
                  size="small"
                  text
                  @click.stop="useTopicTitleForGenerator(topic)"
                >
                  使用
                </el-button>
              </div>
            </div>
          </div>

          <div v-if="selectedTopic.tips && selectedTopic.tips.length > 0" class="detail-section">
            <h4>💡 实用建议</h4>
            <ul class="tips-list">
              <li v-for="(tip, index) in selectedTopic.tips" :key="index">{{ tip }}</li>
            </ul>
          </div>

          <div v-if="selectedTopic.pitfalls && selectedTopic.pitfalls.length > 0" class="detail-section">
            <h4>⚠️ 注意事项</h4>
            <ul class="pitfalls-list">
              <li v-for="(pitfall, index) in selectedTopic.pitfalls" :key="index">{{ pitfall }}</li>
            </ul>
          </div>

          <div class="detail-section">
            <h4>🏷️ 适合小红书的关键词</h4>
            <div class="keywords-list">
              <el-tag
                v-for="keyword in selectedTopic.xhsKeywords"
                :key="keyword"
                type="primary"
                effect="plain"
                style="margin: 4px;"
                @click="copyToClipboard(keyword)"
              >
                {{ keyword }}
              </el-tag>
            </div>
          </div>
        </div>

        <template #footer>
          <div class="dialog-footer">
            <el-button @click="detailDialogVisible = false">关闭</el-button>
            <el-button
              type="primary"
              @click="useTopicForGenerator(selectedTopic!)"
            >
              使用此话题生成内容
            </el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, InfoFilled, Star, List, Lightbulb } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import Breadcrumb from '@/components/Breadcrumb.vue'
import {
  loadTopicInspirationData,
  searchTopics,
  getPopularTopics,
  getFeaturedTopics,
  type TopicInspiration,
  type TopicCategory
} from '@/data/topicInspirationData'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const topics = ref<TopicInspiration[]>([])
const categories = ref<TopicCategory[]>([])
const searchQuery = ref('')
const selectedCategoryId = ref('all')
const detailDialogVisible = ref(false)
const selectedTopic = ref<TopicInspiration | null>(null)

// 计算属性
const breadcrumbItems = computed(() => [
  { label: '工具箱', path: '/tools' },
  { label: '灵感话题库', path: '' }
])

const selectedCategoryName = computed(() => {
  if (selectedCategoryId.value === 'all') return '全部'
  const category = categories.value.find(c => c.id === selectedCategoryId.value)
  return category?.name || '全部'
})

const filteredTopics = computed(() => {
  if (searchQuery.value || selectedCategoryId.value !== 'all') {
    return searchTopics(
      topics.value,
      searchQuery.value,
      selectedCategoryId.value === 'all' ? undefined : selectedCategoryId.value
    )
  }
  // 如果没有搜索和筛选，显示全部话题
  return topics.value
})

const featuredTopics = computed(() => {
  return getFeaturedTopics(topics.value, 6)
})

// 方法
const handleSearch = () => {
  // 搜索逻辑已在 computed 中处理
}

const selectCategory = (categoryId: string) => {
  selectedCategoryId.value = categoryId
}

const viewTopicDetail = (topic: TopicInspiration) => {
  selectedTopic.value = topic
  detailDialogVisible.value = true
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success(`已复制: ${text}`)
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

const useTopicForGenerator = (topic: TopicInspiration) => {
  // 跳转到爆款生成器，使用话题标题作为主题
  router.push({
    path: '/tools/viral-generator',
    query: { topic: topic.xhsTitle }
  })
  detailDialogVisible.value = false
  ElMessage.success('已跳转到爆款生成器')
}

const useTopicTitleForGenerator = (topicTitle: string) => {
  // 跳转到爆款生成器，使用选题方向作为主题
  router.push({
    path: '/tools/viral-generator',
    query: { topic: topicTitle }
  })
  detailDialogVisible.value = false
  ElMessage.success('已跳转到爆款生成器')
}

// 初始化
onMounted(async () => {
  loading.value = true
  try {
    const data = await loadTopicInspirationData()
    topics.value = data.topics
    categories.value = data.categories
  } catch (error) {
    console.error('加载话题数据失败:', error)
    ElMessage.error('加载数据失败，请刷新重试')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.topic-inspiration-view {
  min-height: 100vh;
  background: #f9fafb;
  padding: 32px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.tool-header {
  text-align: center;
  margin-bottom: 32px;
}

.tool-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 12px 0;
}

.tool-description {
  font-size: 1.125rem;
  color: #6b7280;
  margin: 0;
}

.usage-guide {
  margin-bottom: 24px;
  border: 1px solid #e5e7eb;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.guide-content {
  line-height: 1.8;
}

.guide-content ul {
  margin: 12px 0 0 0;
  padding-left: 24px;
}

.guide-content li {
  margin-bottom: 8px;
}

.search-section {
  margin-bottom: 24px;
  border: 1px solid #e5e7eb;
}

.search-bar {
  margin-bottom: 16px;
}

.category-filter {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.category-icon {
  margin-right: 4px;
}

.featured-section {
  margin-bottom: 24px;
  border: 1px solid #e5e7eb;
}

.featured-topics {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.featured-topic-card {
  background: linear-gradient(135deg, #fff5f5 0%, #fff 100%);
  border: 2px solid #fecaca;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.featured-topic-card:hover {
  border-color: #f87171;
  box-shadow: 0 4px 12px rgba(248, 113, 113, 0.2);
  transform: translateY(-2px);
}

.featured-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.featured-topic-card .topic-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 8px 0;
}

.featured-topic-card .topic-intro {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 12px 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.featured-topic-card .topic-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.topics-section {
  border: 1px solid #e5e7eb;
}

.topics-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.topic-item {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  justify-content: space-between;
  gap: 20px;
}

.topic-item:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
}

.topic-main {
  flex: 1;
}

.topic-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.topic-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.topic-intro {
  font-size: 0.9375rem;
  color: #6b7280;
  margin: 0 0 12px 0;
  line-height: 1.6;
}

.topic-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.topic-keywords {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
}

.keywords-label {
  font-size: 0.875rem;
  color: #9ca3af;
  margin-right: 4px;
}

.topic-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  flex-shrink: 0;
}

.topic-stats {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.empty-state {
  padding: 48px 0;
}

.topic-detail {
  padding: 8px 0;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.detail-stats {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 0.875rem;
  color: #6b7280;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 12px 0;
}

.detail-section p {
  font-size: 0.9375rem;
  color: #4b5563;
  line-height: 1.8;
  margin: 0;
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.step-item {
  display: flex;
  gap: 16px;
}

.step-number {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex-shrink: 0;
}

.step-content h5 {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 4px 0;
}

.step-content p {
  font-size: 0.9375rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.6;
}

.topics-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.topic-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.topic-option:hover {
  background: #f3f4f6;
}

.topic-option span {
  flex: 1;
  color: #4b5563;
}

.tips-list,
.pitfalls-list {
  margin: 0;
  padding-left: 24px;
}

.tips-list li,
.pitfalls-list li {
  margin-bottom: 8px;
  color: #4b5563;
  line-height: 1.6;
}

.keywords-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tool-title {
    font-size: 2rem;
  }

  .featured-topics {
    grid-template-columns: 1fr;
  }

  .topic-item {
    flex-direction: column;
  }

  .topic-side {
    align-items: flex-start;
  }

  .detail-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>

