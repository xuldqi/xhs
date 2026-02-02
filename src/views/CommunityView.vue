<template>
  <div class="community-view">
    <!-- 页面头部 -->
    <div class="community-header">
      <div class="container">
        <Breadcrumb :items="breadcrumbItems" />
        
        <div class="header-content">
          <h1 class="page-title">社区问答</h1>
          <p class="page-description">
            与小红书运营者交流经验，解决运营难题
          </p>
        </div>

        <!-- 操作按钮 -->
        <div class="header-actions">
          <el-button type="primary" size="large" :icon="Edit" @click="showAskDialog = true">
            提问
          </el-button>
        </div>
      </div>
    </div>

    <!-- 筛选和排序 -->
    <div class="community-filters">
      <div class="container">
        <el-tabs v-model="activeTab" @tab-change="handleTabChange">
          <el-tab-pane label="全部问题" name="all" />
          <el-tab-pane label="待解决" name="unsolved" />
          <el-tab-pane label="已解决" name="solved" />
          <el-tab-pane label="我的提问" name="my-questions" />
          <el-tab-pane label="我的回答" name="my-answers" />
        </el-tabs>
        
        <div class="filter-controls">
          <el-select v-model="categoryFilter" placeholder="分类" clearable>
            <el-option label="内容创作" value="content" />
            <el-option label="账号运营" value="operation" />
            <el-option label="数据分析" value="analytics" />
            <el-option label="涨粉技巧" value="growth" />
            <el-option label="变现方法" value="monetization" />
          </el-select>
          
          <el-select v-model="sortBy" placeholder="排序">
            <el-option label="最新发布" value="createdAt" />
            <el-option label="最多回答" value="answerCount" />
            <el-option label="最多点赞" value="likeCount" />
            <el-option label="最多浏览" value="viewCount" />
          </el-select>
        </div>
      </div>
    </div>

    <!-- 问题列表 -->
    <div class="community-content">
      <div class="container">
        <div v-if="loading" class="loading-state">
          <el-skeleton :rows="5" animated />
        </div>
        
        <div v-else-if="questions.length === 0" class="empty-state">
          <el-empty description="暂无相关问题">
            <el-button type="primary" @click="showAskDialog = true">
              发布第一个问题
            </el-button>
          </el-empty>
        </div>
        
        <div v-else class="questions-list">
          <QuestionCard
            v-for="question in questions"
            :key="question.id"
            :question="question"
            @click="handleQuestionClick(question)"
            @like="handleQuestionLike(question)"
            @collect="handleQuestionCollect(question)"
          />
          
          <!-- 分页 -->
          <div v-if="totalPages > 1" class="pagination-wrapper">
            <el-pagination
              v-model:current-page="currentPage"
              :page-size="pageSize"
              :total="totalCount"
              layout="prev, pager, next, jumper"
              @current-change="handlePageChange"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 提问对话框 -->
    <el-dialog
      v-model="showAskDialog"
      title="发布问题"
      width="600px"
      :before-close="handleCloseAskDialog"
    >
      <el-form :model="questionForm" :rules="questionRules" ref="questionFormRef" label-width="80px">
        <el-form-item label="问题标题" prop="title">
          <el-input
            v-model="questionForm.title"
            placeholder="请输入问题标题（10-100字）"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="问题描述" prop="description">
          <el-input
            v-model="questionForm.description"
            type="textarea"
            :rows="6"
            placeholder="详细描述你的问题，包括背景信息和具体困惑"
            maxlength="1000"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="问题分类" prop="category">
          <el-select v-model="questionForm.category" placeholder="选择分类">
            <el-option label="内容创作" value="content" />
            <el-option label="账号运营" value="operation" />
            <el-option label="数据分析" value="analytics" />
            <el-option label="涨粉技巧" value="growth" />
            <el-option label="变现方法" value="monetization" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="标签" prop="tags">
          <el-select
            v-model="questionForm.tags"
            multiple
            filterable
            allow-create
            placeholder="添加标签（最多5个）"
          >
            <el-option label="新手" value="新手" />
            <el-option label="进阶" value="进阶" />
            <el-option label="高级" value="高级" />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showAskDialog = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmitQuestion">
          发布问题
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Edit } from '@element-plus/icons-vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { analytics } from '@/utils/analytics'
import { communityService } from '@/services/communityService'
import { useUserStore } from '@/stores/userStore'
import Breadcrumb from '@/components/Breadcrumb.vue'
import QuestionCard from '@/components/community/QuestionCard.vue'

const router = useRouter()
const userStore = useUserStore()

// 响应式数据
const loading = ref(false)
const questions = ref<any[]>([])
const activeTab = ref('all')
const categoryFilter = ref('')
const sortBy = ref('createdAt')
const currentPage = ref(1)
const pageSize = ref(20)
const totalCount = ref(0)
const showAskDialog = ref(false)
const submitting = ref(false)

// 表单
const questionFormRef = ref<FormInstance>()
const questionForm = ref({
  title: '',
  description: '',
  category: '',
  tags: []
})

const questionRules: FormRules = {
  title: [
    { required: true, message: '请输入问题标题', trigger: 'blur' },
    { min: 10, max: 100, message: '标题长度在 10 到 100 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入问题描述', trigger: 'blur' },
    { min: 20, max: 1000, message: '描述长度在 20 到 1000 个字符', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择问题分类', trigger: 'change' }
  ]
}

// 计算属性
const breadcrumbItems = computed(() => [
  { label: '首页', path: '/' },
  { label: '社区问答', path: '/community' }
])

const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value))

const loadQuestions = async () => {
  loading.value = true
  try {
    const isResolved = activeTab.value === 'solved' ? true : activeTab.value === 'unsolved' ? false : undefined
    const sortCol = sortBy.value === 'createdAt' ? 'created_at' : sortBy.value === 'answerCount' ? 'answer_count' : sortBy.value === 'likeCount' ? 'like_count' : sortBy.value === 'viewCount' ? 'view_count' : 'created_at'
    const res = await communityService.getQuestions({
      page: currentPage.value,
      limit: pageSize.value,
      category: categoryFilter.value || undefined,
      isResolved,
      sortBy: sortCol,
      sortOrder: 'desc'
    })
    questions.value = res.data
    totalCount.value = res.total
    analytics.track('community_page_view', { tab: activeTab.value, page: currentPage.value })
  } catch (e) {
    console.error('加载问题失败', e)
    questions.value = []
    totalCount.value = 0
    ElMessage.error('加载失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const handleTabChange = () => {
  currentPage.value = 1
  loadQuestions()
}

const handlePageChange = () => {
  loadQuestions()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleQuestionClick = (question: any) => {
  analytics.track('question_click', {
    questionId: question.id,
    title: question.title
  })
  
  router.push(`/community/questions/${question.id}`)
}

const handleQuestionLike = async (question: any) => {
  try {
    const { count } = await communityService.incrementQuestionLike(question.id)
    question.likeCount = count
    analytics.track('question_like', { questionId: question.id, liked: true })
    ElMessage.success('点赞成功')
  } catch (error) {
    console.error('Failed to like question:', error)
    ElMessage.error('操作失败')
  }
}

const handleQuestionCollect = async (question: any) => {
  try {
    question.isCollected = !question.isCollected
    
    analytics.track('question_collect', {
      questionId: question.id,
      collected: question.isCollected
    })
    
    ElMessage.success(question.isCollected ? '收藏成功' : '取消收藏')
  } catch (error) {
    console.error('Failed to collect question:', error)
    ElMessage.error('操作失败')
  }
}

const handleSubmitQuestion = async () => {
  if (!questionFormRef.value) return
  await questionFormRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      await communityService.createQuestion({
        title: questionForm.value.title,
        description: questionForm.value.description,
        category: questionForm.value.category,
        tags: questionForm.value.tags,
        authorId: userStore.user?.id,
        authorName: userStore.profile?.nickname || userStore.user?.email || '匿名用户',
        authorAvatar: userStore.profile?.avatar_url ?? undefined
      })
      analytics.track('question_submit', { category: questionForm.value.category, tags: questionForm.value.tags })
      ElMessage.success('问题发布成功')
      showAskDialog.value = false
      questionFormRef.value?.resetFields()
      loadQuestions()
    } catch (error) {
      console.error('Failed to submit question:', error)
      ElMessage.error('发布失败，请稍后重试')
    } finally {
      submitting.value = false
    }
  })
}

const handleCloseAskDialog = () => {
  questionFormRef.value?.resetFields()
  showAskDialog.value = false
}

// 监听筛选条件变化
watch([categoryFilter, sortBy], () => {
  currentPage.value = 1
  loadQuestions()
})

// 初始化
onMounted(() => {
  loadQuestions()
})
</script>

<style scoped>
.community-view {
  min-height: 100vh;
  background: var(--bg-primary);
}

.community-header {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 32px 0 48px;
}

.container {
  max-width: var(--container-xl);
  margin: 0 auto;
  padding: 0 20px;
}

.header-content {
  text-align: center;
  margin: 32px 0;
}

.page-title {
  font-size: 3rem;
  font-weight: 700;
  margin: 0 0 16px 0;
}

.page-description {
  font-size: 1.125rem;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.header-actions {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

.community-filters {
  background: white;
  border-bottom: 1px solid var(--border-color);
  padding: 16px 0;
}

.community-filters :deep(.el-tabs__header) {
  margin: 0 0 16px 0;
}

.filter-controls {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
}

.community-content {
  padding: 48px 0;
}

.loading-state,
.empty-state {
  padding: 48px 0;
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 32px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }
  
  .filter-controls {
    flex-direction: column;
  }
  
  .community-header {
    padding: 24px 0 32px;
  }
  
  .container {
    padding: 0 16px;
  }
}
</style>
