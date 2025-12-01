<template>
  <div class="community-view">
    <!-- 页面头部 -->
    <div class="community-header">
      <div class="container">
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
import QuestionCard from '@/components/community/QuestionCard.vue'

const router = useRouter()

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
const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value))

// 方法
const loadQuestions = async () => {
  loading.value = true
  
  try {
    // 问题数据
    const questionsData = [
      {
        id: '1',
        title: '新手如何快速涨粉到1000？',
        description: '我是小红书新手，账号刚注册一个月，目前只有50个粉丝。想请教大家有什么快速涨粉的方法吗？',
        author: {
          id: 'user1',
          name: '小红书新手',
          avatar: 'https://via.placeholder.com/40'
        },
        category: 'growth',
        tags: ['新手', '涨粉', '运营'],
        viewCount: 1234,
        answerCount: 15,
        likeCount: 45,
        isResolved: false,
        isLiked: false,
        isCollected: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        title: '如何提高笔记的曝光率？',
        description: '我的笔记质量还可以，但是曝光量一直很低，有什么办法可以提高曝光吗？',
        author: {
          id: 'user2',
          name: '运营小白',
          avatar: 'https://via.placeholder.com/40'
        },
        category: 'operation',
        tags: ['曝光', 'SEO', '流量'],
        viewCount: 2345,
        answerCount: 23,
        likeCount: 67,
        isResolved: true,
        isLiked: false,
        isCollected: false,
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        title: '小红书封面图怎么设计才能吸引人？',
        description: '看到别人的封面图都很吸引人，我的封面图总是没什么点击率，想学习一下封面图的设计技巧。',
        author: {
          id: 'user3',
          name: '设计小白',
          avatar: 'https://via.placeholder.com/40'
        },
        category: 'content',
        tags: ['封面', '设计', '视觉'],
        viewCount: 3456,
        answerCount: 32,
        likeCount: 89,
        isResolved: true,
        isLiked: false,
        isCollected: false,
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '4',
        title: '账号数据分析应该关注哪些指标？',
        description: '刚开始做数据分析，不知道应该重点关注哪些数据指标，希望有经验的朋友分享一下。',
        author: {
          id: 'user4',
          name: '数据分析师',
          avatar: 'https://via.placeholder.com/40'
        },
        category: 'analytics',
        tags: ['数据分析', '指标', '运营'],
        viewCount: 4567,
        answerCount: 28,
        likeCount: 112,
        isResolved: true,
        isLiked: false,
        isCollected: false,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '5',
        title: '小红书账号如何变现？有哪些方式？',
        description: '账号有5000粉丝了，想开始变现，但不知道有哪些方式，求指导。',
        author: {
          id: 'user5',
          name: '创业者',
          avatar: 'https://via.placeholder.com/40'
        },
        category: 'monetization',
        tags: ['变现', '收入', '商业'],
        viewCount: 5678,
        answerCount: 45,
        likeCount: 156,
        isResolved: false,
        isLiked: false,
        isCollected: false,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '6',
        title: '笔记标题怎么写才能提高点击率？',
        description: '我的笔记内容不错，但标题总是写不好，点击率很低，有什么技巧吗？',
        author: {
          id: 'user6',
          name: '内容创作者',
          avatar: 'https://via.placeholder.com/40'
        },
        category: 'content',
        tags: ['标题', '文案', '点击率'],
        viewCount: 6789,
        answerCount: 38,
        likeCount: 203,
        isResolved: true,
        isLiked: false,
        isCollected: false,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '7',
        title: '如何找到合适的话题和关键词？',
        description: '总是不知道写什么内容，找不到热门话题，有什么工具或方法推荐吗？',
        author: {
          id: 'user7',
          name: '选题困难户',
          avatar: 'https://via.placeholder.com/40'
        },
        category: 'content',
        tags: ['话题', '关键词', '选题'],
        viewCount: 7890,
        answerCount: 52,
        likeCount: 234,
        isResolved: true,
        isLiked: false,
        isCollected: false,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '8',
        title: '小红书账号定位不清晰怎么办？',
        description: '我的账号内容很杂，没有明确的定位，粉丝增长很慢，应该怎么调整？',
        author: {
          id: 'user8',
          name: '迷茫运营',
          avatar: 'https://via.placeholder.com/40'
        },
        category: 'operation',
        tags: ['定位', '账号', '策略'],
        viewCount: 8901,
        answerCount: 41,
        likeCount: 178,
        isResolved: false,
        isLiked: false,
        isCollected: false,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '9',
        title: '如何提高笔记的互动率？',
        description: '我的笔记点赞和评论都很少，互动率很低，有什么方法可以提高吗？',
        author: {
          id: 'user9',
          name: '互动达人',
          avatar: 'https://via.placeholder.com/40'
        },
        category: 'operation',
        tags: ['互动', '评论', '点赞'],
        viewCount: 9012,
        answerCount: 67,
        likeCount: 289,
        isResolved: true,
        isLiked: false,
        isCollected: false,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '10',
        title: '小红书内容发布时间有讲究吗？',
        description: '听说发布时间会影响曝光，想知道什么时候发布效果最好？',
        author: {
          id: 'user10',
          name: '时间管理',
          avatar: 'https://via.placeholder.com/40'
        },
        category: 'operation',
        tags: ['发布时间', '策略', '流量'],
        viewCount: 10123,
        answerCount: 58,
        likeCount: 312,
        isResolved: true,
        isLiked: false,
        isCollected: false,
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '11',
        title: '如何分析竞品账号的成功经验？',
        description: '想学习同领域优秀账号的做法，但不知道从哪些角度分析，求指导。',
        author: {
          id: 'user11',
          name: '学习型运营',
          avatar: 'https://via.placeholder.com/40'
        },
        category: 'analytics',
        tags: ['竞品', '分析', '学习'],
        viewCount: 11234,
        answerCount: 49,
        likeCount: 267,
        isResolved: true,
        isLiked: false,
        isCollected: false,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '12',
        title: '小红书笔记被限流了怎么办？',
        description: '最近笔记的曝光突然下降很多，怀疑被限流了，应该怎么处理？',
        author: {
          id: 'user12',
          name: '限流困扰',
          avatar: 'https://via.placeholder.com/40'
        },
        category: 'operation',
        tags: ['限流', '违规', '恢复'],
        viewCount: 12345,
        answerCount: 73,
        likeCount: 345,
        isResolved: false,
        isLiked: false,
        isCollected: false,
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '13',
        title: '如何制作吸引人的视频内容？',
        description: '想开始做视频笔记，但不知道如何制作才能吸引人，有什么技巧吗？',
        author: {
          id: 'user13',
          name: '视频新手',
          avatar: 'https://via.placeholder.com/40'
        },
        category: 'content',
        tags: ['视频', '制作', '内容'],
        viewCount: 13456,
        answerCount: 61,
        likeCount: 298,
        isResolved: true,
        isLiked: false,
        isCollected: false,
        createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '14',
        title: '小红书账号如何从0到1？',
        description: '刚注册账号，完全不知道从哪里开始，希望有经验的朋友给一些建议。',
        author: {
          id: 'user14',
          name: '完全新手',
          avatar: 'https://via.placeholder.com/40'
        },
        category: 'growth',
        tags: ['新手', '起步', '基础'],
        viewCount: 14567,
        answerCount: 84,
        likeCount: 412,
        isResolved: true,
        isLiked: false,
        isCollected: false,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '15',
        title: '如何建立自己的内容风格？',
        description: '看到很多账号都有独特的风格，我也想建立自己的风格，但不知道怎么做。',
        author: {
          id: 'user15',
          name: '风格探索',
          avatar: 'https://via.placeholder.com/40'
        },
        category: 'content',
        tags: ['风格', '定位', '差异化'],
        viewCount: 15678,
        answerCount: 56,
        likeCount: 323,
        isResolved: true,
        isLiked: false,
        isCollected: false,
        createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '16',
        title: '小红书合作推广怎么接？',
        description: '账号有1万粉丝了，想接一些合作推广，但不知道从哪里找资源。',
        author: {
          id: 'user16',
          name: '接单新手',
          avatar: 'https://via.placeholder.com/40'
        },
        category: 'monetization',
        tags: ['合作', '推广', '接单'],
        viewCount: 16789,
        answerCount: 92,
        likeCount: 456,
        isResolved: false,
        isLiked: false,
        isCollected: false,
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '17',
        title: '笔记内容质量不错但流量很差怎么办？',
        description: '我的内容质量自认为还可以，但流量一直很差，不知道问题出在哪里。',
        author: {
          id: 'user17',
          name: '流量困扰',
          avatar: 'https://via.placeholder.com/40'
        },
        category: 'operation',
        tags: ['流量', '内容', '优化'],
        viewCount: 17890,
        answerCount: 78,
        likeCount: 389,
        isResolved: false,
        isLiked: false,
        isCollected: false,
        createdAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '18',
        title: '如何提高账号的垂直度？',
        description: '我的账号内容不够垂直，粉丝画像不清晰，应该怎么调整？',
        author: {
          id: 'user18',
          name: '垂直度优化',
          avatar: 'https://via.placeholder.com/40'
        },
        category: 'operation',
        tags: ['垂直度', '定位', '粉丝'],
        viewCount: 18901,
        answerCount: 65,
        likeCount: 401,
        isResolved: true,
        isLiked: false,
        isCollected: false,
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '19',
        title: '小红书直播怎么做？',
        description: '想尝试做直播，但不知道如何开始，有什么建议吗？',
        author: {
          id: 'user19',
          name: '直播新手',
          avatar: 'https://via.placeholder.com/40'
        },
        category: 'content',
        tags: ['直播', '互动', '变现'],
        viewCount: 19012,
        answerCount: 88,
        likeCount: 478,
        isResolved: true,
        isLiked: false,
        isCollected: false,
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '20',
        title: '如何建立粉丝社群？',
        description: '想建立一个粉丝社群，但不知道如何运营和维护，求经验分享。',
        author: {
          id: 'user20',
          name: '社群运营',
          avatar: 'https://via.placeholder.com/40'
        },
        category: 'operation',
        tags: ['社群', '粉丝', '运营'],
        viewCount: 20123,
        answerCount: 95,
        likeCount: 523,
        isResolved: false,
        isLiked: false,
        isCollected: false,
        createdAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '21',
        title: '小红书视频笔记前3秒怎么设计才能抓住用户？',
        description: '听说视频前3秒决定80%的完播率，想知道具体怎么设计开头才能吸引用户看完？',
        author: {
          id: 'user21',
          name: '视频创作者',
          avatar: 'https://via.placeholder.com/40'
        },
        category: 'content',
        tags: ['视频', '开头', '完播率'],
        viewCount: 21234,
        answerCount: 87,
        likeCount: 512,
        isResolved: true,
        isLiked: false,
        isCollected: false,
        createdAt: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '22',
        title: '小红书笔记发布的最佳时间是什么时候？',
        description: '不同时间段发布效果差异很大，想知道什么时间段发布笔记曝光量最高？',
        author: {
          id: 'user22',
          name: '时间优化',
          avatar: 'https://via.placeholder.com/40'
        },
        category: 'operation',
        tags: ['发布时间', '流量', '策略'],
        viewCount: 22345,
        answerCount: 102,
        likeCount: 589,
        isResolved: true,
        isLiked: false,
        isCollected: false,
        createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '23',
        title: '小红书笔记标签怎么选才能提高曝光？',
        description: '标签选择对曝光影响很大，但不知道如何选择合适的话题标签和地点标签？',
        author: {
          id: 'user23',
          name: '标签优化',
          avatar: 'https://via.placeholder.com/40'
        },
        category: 'operation',
        tags: ['标签', 'SEO', '曝光'],
        viewCount: 23456,
        answerCount: 76,
        likeCount: 445,
        isResolved: true,
        isLiked: false,
        isCollected: false,
        createdAt: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '24',
        title: '小红书账号从0到1万粉丝需要多长时间？',
        description: '刚开始做账号，想知道正常情况下从0到1万粉丝大概需要多长时间，有什么加速方法？',
        author: {
          id: 'user24',
          name: '新手起步',
          avatar: 'https://via.placeholder.com/40'
        },
        category: 'growth',
        tags: ['涨粉', '时间', '策略'],
        viewCount: 24567,
        answerCount: 94,
        likeCount: 623,
        isResolved: true,
        isLiked: false,
        isCollected: false,
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '25',
        title: '小红书笔记封面图尺寸和比例有什么要求？',
        description: '封面图对点击率影响很大，想知道最佳尺寸比例是多少，有什么设计技巧？',
        author: {
          id: 'user25',
          name: '设计新手',
          avatar: 'https://via.placeholder.com/40'
        },
        category: 'content',
        tags: ['封面', '设计', '尺寸'],
        viewCount: 25678,
        answerCount: 68,
        likeCount: 378,
        isResolved: true,
        isLiked: false,
        isCollected: false,
        createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '26',
        title: '小红书笔记被判定为广告怎么办？',
        description: '正常分享产品使用体验，但被系统判定为广告，曝光量大幅下降，应该怎么申诉？',
        author: {
          id: 'user26',
          name: '内容创作者',
          avatar: 'https://via.placeholder.com/40'
        },
        category: 'operation',
        tags: ['违规', '申诉', '限流'],
        viewCount: 26789,
        answerCount: 115,
        likeCount: 712,
        isResolved: false,
        isLiked: false,
        isCollected: false,
        createdAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '27',
        title: '小红书笔记合集功能怎么用？对涨粉有帮助吗？',
        description: '看到很多账号都在用笔记合集功能，想知道这个功能对账号增长有什么帮助？',
        author: {
          id: 'user27',
          name: '功能探索',
          avatar: 'https://via.placeholder.com/40'
        },
        category: 'operation',
        tags: ['合集', '功能', '涨粉'],
        viewCount: 27890,
        answerCount: 81,
        likeCount: 456,
        isResolved: true,
        isLiked: false,
        isCollected: false,
        createdAt: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '28',
        title: '小红书账号垂直度不够会影响推荐吗？',
        description: '我的账号内容比较杂，美妆、穿搭、美食都有，想知道这样会影响平台推荐吗？',
        author: {
          id: 'user28',
          name: '内容困惑',
          avatar: 'https://via.placeholder.com/40'
        },
        category: 'operation',
        tags: ['垂直度', '定位', '推荐'],
        viewCount: 28901,
        answerCount: 97,
        likeCount: 534,
        isResolved: true,
        isLiked: false,
        isCollected: false,
        createdAt: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '29',
        title: '小红书笔记互动率多少算正常？',
        description: '我的笔记点赞收藏都不多，想知道互动率多少算正常水平，如何提升？',
        author: {
          id: 'user29',
          name: '数据困惑',
          avatar: 'https://via.placeholder.com/40'
        },
        category: 'analytics',
        tags: ['互动率', '数据', '优化'],
        viewCount: 29012,
        answerCount: 124,
        likeCount: 667,
        isResolved: true,
        isLiked: false,
        isCollected: false,
        createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '30',
        title: '小红书直播带货怎么开始？需要什么条件？',
        description: '想尝试直播带货，但不知道需要什么条件，如何申请，有什么技巧？',
        author: {
          id: 'user30',
          name: '直播新手',
          avatar: 'https://via.placeholder.com/40'
        },
        category: 'monetization',
        tags: ['直播', '带货', '变现'],
        viewCount: 30123,
        answerCount: 108,
        likeCount: 789,
        isResolved: true,
        isLiked: false,
        isCollected: false,
        createdAt: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
    
    questions.value = questionsData
    totalCount.value = questionsData.length
    
    // 追踪页面浏览
    analytics.track('community_page_view', {
      tab: activeTab.value,
      page: currentPage.value
    })
  } catch (error) {
    console.error('Failed to load questions:', error)
    ElMessage.error('加载问题失败')
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
    question.isLiked = !question.isLiked
    question.likeCount += question.isLiked ? 1 : -1
    
    analytics.track('question_like', {
      questionId: question.id,
      liked: question.isLiked
    })
    
    ElMessage.success(question.isLiked ? '点赞成功' : '取消点赞')
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
      // 提交问题
      analytics.track('question_submit', {
        category: questionForm.value.category,
        tags: questionForm.value.tags
      })
      
      ElMessage.success('问题发布成功')
      showAskDialog.value = false
      
      // 重置表单
      questionFormRef.value?.resetFields()
      
      // 刷新列表
      loadQuestions()
    } catch (error) {
      console.error('Failed to submit question:', error)
      ElMessage.error('发布失败')
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
  background: #ffffff;
  color: #1a1a1a;
  padding: 32px 0 48px;
  border-bottom: 1px solid #e5e7eb;
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
  color: #1a1a1a;
}

.page-description {
  font-size: 1.125rem;
  color: #6b7280;
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
