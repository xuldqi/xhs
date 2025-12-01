<template>
  <div class="hot-words-insight-view">
    <div class="container">
      <Breadcrumb :items="breadcrumbItems" />
      
      <div class="tool-header">
        <h1 class="tool-title">🔥 热词洞察工具</h1>
        <p class="tool-description">
          发现热门概念和趋势词，为你的小红书内容提供选题灵感和关键词
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
          <p>这个工具整合了概念词典的丰富数据，帮助你：</p>
          <ul>
            <li>🔍 <strong>搜索热门概念</strong>：输入关键词，找到相关的热门概念</li>
            <li>📊 <strong>浏览热门榜单</strong>：查看最受欢迎的概念TOP20</li>
            <li>💡 <strong>获取选题灵感</strong>：每个概念都提供了可衍生的选题方向</li>
            <li>🏷️ <strong>提取关键词</strong>：获取适合小红书的关键词标签</li>
            <li>📈 <strong>查看关联度</strong>：了解概念与小红书内容的关联程度</li>
          </ul>
        </div>
      </el-card>

      <!-- 搜索和筛选 -->
      <el-card class="search-section" shadow="never">
        <div class="search-bar">
          <el-input
            v-model="searchQuery"
            placeholder="搜索热门概念，例如：心理学、经济学、思维方法..."
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

      <!-- 热门榜单 -->
      <el-card v-if="!searchQuery && selectedCategoryId === 'all'" class="popular-section" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon><TrendCharts /></el-icon>
            <span>热门概念 TOP 20</span>
          </div>
        </template>
        <div class="hot-words-grid">
          <div
            v-for="(word, index) in popularHotWords"
            :key="word.id"
            class="hot-word-card"
            @click="viewHotWordDetail(word)"
          >
            <div class="rank-badge">{{ index + 1 }}</div>
            <div class="word-content">
              <h3 class="word-title">{{ word.title }}</h3>
              <p class="word-summary">{{ word.summary }}</p>
              <div class="word-meta">
                <el-tag size="small" type="info">{{ word.category }}</el-tag>
                <span class="view-count">👁️ {{ word.viewCount }}</span>
                <span class="like-count">❤️ {{ word.likeCount }}</span>
                <el-tag
                  size="small"
                  :type="word.relevance >= 8 ? 'success' : word.relevance >= 6 ? 'warning' : 'info'"
                >
                  关联度: {{ word.relevance }}/10
                </el-tag>
              </div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 搜索结果 -->
      <el-card v-if="searchQuery || selectedCategoryId !== 'all'" class="results-section" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon><Search /></el-icon>
            <span>
              {{ searchQuery ? `搜索结果 (${filteredHotWords.length})` : `分类: ${selectedCategoryName} (${filteredHotWords.length})` }}
            </span>
          </div>
        </template>
        <div v-if="filteredHotWords.length === 0" class="empty-state">
          <el-empty description="没有找到相关概念，试试其他关键词或分类" />
        </div>
        <div v-else class="hot-words-list">
          <div
            v-for="word in filteredHotWords"
            :key="word.id"
            class="hot-word-item"
            @click="viewHotWordDetail(word)"
          >
            <div class="word-main">
              <h3 class="word-title">{{ word.title }}</h3>
              <p class="word-summary">{{ word.summary }}</p>
              <div class="word-tags">
                <el-tag
                  v-for="tag in word.tags.slice(0, 5)"
                  :key="tag"
                  size="small"
                  style="margin-right: 6px;"
                >
                  {{ tag }}
                </el-tag>
              </div>
            </div>
            <div class="word-side">
              <el-tag size="small" type="info">{{ word.category }}</el-tag>
              <div class="word-stats">
                <span>👁️ {{ word.viewCount }}</span>
                <span>❤️ {{ word.likeCount }}</span>
              </div>
              <el-tag
                size="small"
                :type="word.relevance >= 8 ? 'success' : word.relevance >= 6 ? 'warning' : 'info'"
              >
                关联度: {{ word.relevance }}/10
              </el-tag>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 热词详情对话框 -->
      <el-dialog
        v-model="detailDialogVisible"
        :title="selectedHotWord?.title"
        width="800px"
        class="hot-word-detail-dialog"
      >
        <div v-if="selectedHotWord" class="hot-word-detail">
          <div class="detail-header">
            <el-tag type="info" size="large">{{ selectedHotWord.category }}</el-tag>
            <div class="detail-stats">
              <span>👁️ {{ selectedHotWord.viewCount }} 次浏览</span>
              <span>❤️ {{ selectedHotWord.likeCount }} 个赞</span>
              <el-tag
                :type="selectedHotWord.relevance >= 8 ? 'success' : selectedHotWord.relevance >= 6 ? 'warning' : 'info'"
              >
                关联度: {{ selectedHotWord.relevance }}/10
              </el-tag>
            </div>
          </div>

          <div class="detail-section">
            <h4>📖 概念定义</h4>
            <p>{{ selectedHotWord.definition }}</p>
          </div>

          <div class="detail-section">
            <h4>📝 概念摘要</h4>
            <p>{{ selectedHotWord.summary }}</p>
          </div>

          <div class="detail-section">
            <h4>🏷️ 适合小红书的关键词</h4>
            <div class="keywords-list">
              <el-tag
                v-for="keyword in selectedHotWord.xhsKeywords"
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

          <div class="detail-section">
            <h4>💡 可衍生的选题方向</h4>
            <div class="topics-list">
              <div
                v-for="(topic, index) in selectedHotWord.xhsTopics"
                :key="index"
                class="topic-item"
                @click="useTopicForGenerator(topic)"
              >
                <el-icon><Lightbulb /></el-icon>
                <span>{{ topic }}</span>
                <el-button
                  type="primary"
                  size="small"
                  text
                  @click.stop="useTopicForGenerator(topic)"
                >
                  使用
                </el-button>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h4>🏷️ 相关标签</h4>
            <div class="tags-list">
              <el-tag
                v-for="tag in selectedHotWord.tags"
                :key="tag"
                size="small"
                style="margin: 4px;"
              >
                {{ tag }}
              </el-tag>
            </div>
          </div>
        </div>

        <template #footer>
          <div class="dialog-footer">
            <el-button @click="detailDialogVisible = false">关闭</el-button>
            <el-button
              type="primary"
              @click="useHotWordForGenerator"
            >
              使用此概念生成内容
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
import { Search, InfoFilled, TrendCharts, Lightbulb } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import Breadcrumb from '@/components/Breadcrumb.vue'
import {
  loadHotWordsData,
  searchHotWords,
  getPopularHotWords,
  getRelevantHotWords,
  type HotWord,
  type HotWordCategory
} from '@/data/hotWordsData'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const hotWords = ref<HotWord[]>([])
const categories = ref<HotWordCategory[]>([])
const searchQuery = ref('')
const selectedCategoryId = ref('all')
const detailDialogVisible = ref(false)
const selectedHotWord = ref<HotWord | null>(null)

// 计算属性
const breadcrumbItems = computed(() => [
  { label: '工具箱', path: '/tools' },
  { label: '热词洞察工具', path: '' }
])

const selectedCategoryName = computed(() => {
  if (selectedCategoryId.value === 'all') return '全部'
  const category = categories.value.find(c => c.id === selectedCategoryId.value)
  return category?.name || '全部'
})

const filteredHotWords = computed(() => {
  if (searchQuery.value || selectedCategoryId.value !== 'all') {
    return searchHotWords(
      hotWords.value,
      searchQuery.value,
      selectedCategoryId.value === 'all' ? undefined : selectedCategoryId.value
    )
  }
  return []
})

const popularHotWords = computed(() => {
  return getPopularHotWords(hotWords.value, 20)
})

// 方法
const handleSearch = () => {
  // 搜索逻辑已在 computed 中处理
}

const selectCategory = (categoryId: string) => {
  selectedCategoryId.value = categoryId
}

const viewHotWordDetail = (word: HotWord) => {
  selectedHotWord.value = word
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

const useTopicForGenerator = (topic: string) => {
  // 跳转到爆款生成器，并传递话题
  router.push({
    path: '/tools/viral-generator',
    query: { topic }
  })
  ElMessage.success('已跳转到爆款生成器')
}

const useHotWordForGenerator = () => {
  if (!selectedHotWord.value) return
  
  // 使用热词标题作为主题
  router.push({
    path: '/tools/viral-generator',
    query: { topic: selectedHotWord.value.title }
  })
  detailDialogVisible.value = false
  ElMessage.success('已跳转到爆款生成器')
}

// 初始化
onMounted(async () => {
  loading.value = true
  try {
    const data = await loadHotWordsData()
    hotWords.value = data.hotWords
    categories.value = data.categories
  } catch (error) {
    console.error('加载热词数据失败:', error)
    ElMessage.error('加载数据失败，请刷新重试')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.hot-words-insight-view {
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

.popular-section,
.results-section {
  border: 1px solid #e5e7eb;
}

.hot-words-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.hot-word-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  display: flex;
  gap: 12px;
}

.hot-word-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
  transform: translateY(-2px);
}

.rank-badge {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex-shrink: 0;
}

.word-content {
  flex: 1;
}

.word-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 8px 0;
}

.word-summary {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 12px 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.word-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 0.75rem;
  color: #9ca3af;
}

.hot-words-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hot-word-item {
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

.hot-word-item:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
}

.word-main {
  flex: 1;
}

.word-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 8px 0;
}

.word-summary {
  font-size: 0.9375rem;
  color: #6b7280;
  margin: 0 0 12px 0;
  line-height: 1.6;
}

.word-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.word-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  flex-shrink: 0;
}

.word-stats {
  display: flex;
  gap: 12px;
  font-size: 0.875rem;
  color: #9ca3af;
}

.empty-state {
  padding: 48px 0;
}

.hot-word-detail {
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

.keywords-list,
.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.topics-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.topic-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.topic-item:hover {
  background: #f3f4f6;
}

.topic-item span {
  flex: 1;
  color: #4b5563;
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

  .hot-words-grid {
    grid-template-columns: 1fr;
  }

  .hot-word-item {
    flex-direction: column;
  }

  .word-side {
    align-items: flex-start;
  }

  .detail-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>

