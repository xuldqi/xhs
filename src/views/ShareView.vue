<template>
  <div class="share-view">
    <div class="share-container">
      <!-- 加载中 -->
      <div v-if="loading" class="loading-section">
        <el-icon class="is-loading" :size="40"><Loading /></el-icon>
        <p>加载中...</p>
      </div>

      <!-- 加载失败 -->
      <div v-else-if="error" class="error-section">
        <el-result
          icon="error"
          title="加载失败"
          :sub-title="error"
        >
          <template #extra>
            <el-button type="primary" @click="goHome">返回首页</el-button>
          </template>
        </el-result>
      </div>

      <!-- 指南内容 -->
      <div v-else-if="guide" class="content-section">
        <div class="header">
          <h1>{{ guide.guide_content.metadata.accountName }} 的涨粉实操指南</h1>
          <p class="meta-info">
            生成时间：{{ formatDate(guide.created_at) }} |
            浏览次数：{{ guide.view_count }}
          </p>
          
          <div class="action-bar">
            <el-button type="primary" size="large" @click="goHome">
              <el-icon><Plus /></el-icon>
              生成我的指南
            </el-button>
          </div>
        </div>

        <!-- 导言说明 -->
        <div class="introduction">
          <div class="intro-card">
            <div class="intro-icon">📖</div>
            <h3>关于本指南</h3>
            <p>这是一份根据账号实际情况量身定制的涨粉实操指南。包含12个核心模块，从账号诊断到立即行动，每一步都有具体可执行的方法。</p>
          </div>
        </div>

        <!-- 内容 -->
        <div class="sections">
          <el-collapse v-model="activeNames" accordion>
            <el-collapse-item
              v-for="section in guide.guide_content.sections"
              :key="section.id"
              :name="section.id"
            >
              <template #title>
                <div class="collapse-title">
                  <span class="section-number">{{ section.id }}</span>
                  <span class="section-name">{{ section.title }}</span>
                  <span class="section-badge">{{ getContentLength(section.content) }}字</span>
                </div>
              </template>
              <div 
                class="section-content" 
                v-html="formatContent(section.content)" 
              />
            </el-collapse-item>
          </el-collapse>
        </div>

        <!-- 底部提示 -->
        <div class="footer-tip">
          <p>💡 想生成属于你自己的涨粉指南？</p>
          <el-button type="primary" size="large" @click="goHome">
            立即生成
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Loading, Plus } from '@element-plus/icons-vue'
import { getGuideByShareId, type SavedGuide } from '@/services/guideService'
import { formatContent } from '@/utils/contentFormatter'
import '@/styles/guide-content.css'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const error = ref('')
const guide = ref<SavedGuide | null>(null)
const activeNames = ref<number[]>([1])

// 加载指南
onMounted(async () => {
  const shareId = route.params.shareId as string
  
  if (!shareId) {
    error.value = '分享链接无效'
    loading.value = false
    return
  }

  const result = await getGuideByShareId(shareId)
  
  if (result.success && result.guide) {
    guide.value = result.guide
  } else {
    error.value = result.error || '指南不存在或已被删除'
  }
  
  loading.value = false
})

// 格式化日期
function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取内容长度
function getContentLength(content: string): number {
  return content.replace(/<[^>]*>/g, '').replace(/\s/g, '').length
}

// 返回首页
function goHome() {
  router.push('/')
}
</script>

<style scoped>
.share-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
}

.share-container {
  max-width: 1000px;
  margin: 0 auto;
}

/* 加载中 */
.loading-section {
  background: white;
  border-radius: 20px;
  padding: 60px 40px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.loading-section p {
  margin-top: 20px;
  color: #909399;
  font-size: 16px;
}

/* 错误 */
.error-section {
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

/* 内容 */
.content-section {
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.header {
  text-align: center;
  padding-bottom: 2rem;
  border-bottom: 2px solid #e4e7ed;
  margin-bottom: 2rem;
}

.header h1 {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 1rem;
}

.meta-info {
  color: #909399;
  margin-bottom: 1.5rem;
}

.action-bar {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

/* 导言 */
.introduction {
  margin-bottom: 2rem;
}

.intro-card {
  background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e4e7ed;
}

.intro-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  text-align: center;
}

.intro-card h3 {
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 0.8rem;
  font-weight: 600;
  text-align: center;
}

.intro-card p {
  color: #606266;
  line-height: 1.8;
  font-size: 0.95rem;
  text-align: left;
  margin: 0;
}

/* 章节 */
.sections {
  margin-top: 2rem;
}

.collapse-title {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  font-size: 1.1rem;
}

.section-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #FF2442;
  color: white;
  border-radius: 50%;
  font-weight: bold;
  font-size: 0.9rem;
}

.section-name {
  flex: 1;
  font-weight: 600;
  color: #333;
  text-align: left;
}

.section-badge {
  padding: 4px 12px;
  background: transparent;
  color: #999;
  border-radius: 12px;
  font-size: 0.85rem;
}

.section-content {
  line-height: 1.8;
  color: #606266;
  text-align: left !important;
}

/* 底部提示 */
.footer-tip {
  margin-top: 3rem;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  text-align: center;
  color: white;
}

.footer-tip p {
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .share-view {
    padding: 20px 10px;
  }
  
  .content-section {
    padding: 20px;
  }
  
  .header h1 {
    font-size: 1.8rem;
  }
}
</style>
