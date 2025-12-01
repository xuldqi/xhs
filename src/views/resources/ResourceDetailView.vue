<template>
  <div class="resource-detail-view">
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>
    
    <div v-else-if="resource" class="resource-container">
      <!-- 面包屑导航 -->
      <div class="breadcrumb-section">
        <div class="container">
          <Breadcrumb :items="breadcrumbItems" />
        </div>
      </div>

      <!-- 资源头部 -->
      <header class="resource-header">
        <div class="container">
          <div class="header-tags">
            <el-tag type="info">{{ resource.category }}</el-tag>
            <el-tag v-if="resource.featured" type="warning">
              <el-icon><Star /></el-icon>
              精选资源
            </el-tag>
          </div>
          
          <h1 class="resource-title">{{ resource.title }}</h1>
          
          <p v-if="resource.description" class="resource-description">
            {{ resource.description }}
          </p>
          
          <div class="resource-meta">
            <span class="meta-item">
              <el-icon><Document /></el-icon>
              {{ resource.fileFormat }}
            </span>
            <span class="meta-item">
              <el-icon><FolderOpened /></el-icon>
              {{ resource.fileSize }}
            </span>
            <span class="meta-item">
              <el-icon><View /></el-icon>
              {{ resource.viewCount }}次浏览
            </span>
            <span class="meta-item">
              <el-icon><Download /></el-icon>
              {{ resource.downloadCount }}次下载
            </span>
            <span v-if="resource.author" class="meta-item">
              <el-icon><User /></el-icon>
              {{ resource.author }}
            </span>
          </div>
        </div>
      </header>

      <!-- 资源内容 -->
      <div class="resource-body">
        <div class="container">
          <div class="content-grid">
            <!-- 主内容 -->
            <div class="main-content">
              <!-- 预览图片 -->
              <div v-if="resource.previewImage" class="preview-section">
                <h3>资源预览</h3>
                <div class="preview-image">
                  <img :src="resource.previewImage" :alt="resource.title" />
                </div>
              </div>

              <!-- 标签 -->
              <div v-if="resource.tags.length > 0" class="tags-section">
                <h3>相关标签</h3>
                <div class="tags-list">
                  <el-tag
                    v-for="tag in resource.tags"
                    :key="tag"
                    size="large"
                    type="info"
                    effect="plain"
                  >
                    {{ tag }}
                  </el-tag>
                </div>
              </div>
            </div>

            <!-- 侧边栏 -->
            <aside class="resource-sidebar">
              <!-- 下载卡片 -->
              <div class="download-card">
                <div class="download-icon">
                  <el-icon><Download /></el-icon>
                </div>
                <h3>下载资源</h3>
                <p class="download-info">
                  文件格式：{{ resource.fileFormat }}<br>
                  文件大小：{{ resource.fileSize }}
                </p>
                <el-button 
                  type="primary" 
                  size="large" 
                  :icon="Download"
                  @click="handleDownload"
                  :loading="downloading"
                  style="width: 100%"
                >
                  {{ downloading ? '下载中...' : '立即下载' }}
                </el-button>
              </div>

              <!-- 资源信息 -->
              <div class="info-card">
                <h3>资源信息</h3>
                <div class="info-list">
                  <div class="info-item">
                    <span class="info-label">发布时间</span>
                    <span class="info-value">{{ formatDate(resource.publishDate) }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">浏览次数</span>
                    <span class="info-value">{{ formatNumber(resource.viewCount) }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">下载次数</span>
                    <span class="info-value">{{ formatNumber(resource.downloadCount) }}</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="error-state">
      <el-empty description="资源不存在">
        <el-button type="primary" @click="$router.push('/resources')">
          返回资源库
        </el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Star, Document, FolderOpened, View, Download, User } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getResourceBySlug, resources } from '@/data/resourcesData'
import type { Resource } from '@/data/resourcesData'
import { analytics } from '@/utils/analytics'
import Breadcrumb from '@/components/Breadcrumb.vue'

const route = useRoute()
const router = useRouter()

// 响应式数据
const loading = ref(true)
const resource = ref<Resource | null>(null)
const downloading = ref(false)

// 计算属性
const breadcrumbItems = computed(() => {
  const items = [
    { label: '首页', path: '/' },
    { label: '资源库', path: '/resources' }
  ]
  
  if (resource.value) {
    items.push({ label: resource.value.title, path: '' })
  }
  
  return items
})

// 方法
const formatNumber = (num: number) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const loadResource = () => {
  loading.value = true
  
  try {
    const resourceId = route.params.id as string
    // 先通过 id 查找
    let found = resources.find(r => r.id === resourceId)
    
    // 如果没找到，尝试通过 slug 查找
    if (!found) {
      found = getResourceBySlug(resourceId)
    }
    
    if (found) {
      resource.value = found
      
      // 追踪资源浏览
      analytics.track('resource_view', {
        resourceId: found.id,
        title: found.title,
        category: found.category
      })
    }
  } catch (error) {
    console.error('Failed to load resource:', error)
    ElMessage.error('加载资源失败')
  } finally {
    loading.value = false
  }
}

const handleDownload = async () => {
  if (!resource.value) return
  
  downloading.value = true
  
  try {
    // 追踪下载
    analytics.track('resource_download', {
      resourceId: resource.value.id,
      title: resource.value.title,
      fileFormat: resource.value.fileFormat
    })
    
    // 模拟下载延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 打开下载链接
    window.open(resource.value.downloadUrl, '_blank')
    
    ElMessage.success('下载已开始')
  } catch (error) {
    console.error('Download failed:', error)
    ElMessage.error('下载失败，请重试')
  } finally {
    downloading.value = false
  }
}

// 初始化
onMounted(() => {
  loadResource()
})
</script>

<style scoped>
.resource-detail-view {
  min-height: 100vh;
  background: var(--bg-primary);
}

.loading-container {
  max-width: var(--container-lg);
  margin: 0 auto;
  padding: 48px 20px;
}

.container {
  max-width: var(--container-lg);
  margin: 0 auto;
  padding: 0 20px;
}

.breadcrumb-section {
  padding: 24px 0;
  background: white;
  border-bottom: 1px solid var(--border-color);
}

.resource-header {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 48px 0;
}

.header-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}

.resource-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 16px 0;
  line-height: 1.3;
}

.resource-description {
  font-size: 1.125rem;
  opacity: 0.9;
  margin: 0 0 32px 0;
  line-height: 1.6;
}

.resource-meta {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  font-size: 0.875rem;
  opacity: 0.9;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.resource-body {
  padding: 48px 0;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 48px;
}

.main-content {
  background: white;
  border-radius: var(--radius-lg);
  padding: 32px;
  box-shadow: var(--shadow-sm);
}

.preview-section,
.tags-section {
  margin-bottom: 32px;
}

.preview-section h3,
.tags-section h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: var(--text-primary);
}

.preview-image {
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--bg-secondary);
}

.preview-image img {
  width: 100%;
  height: auto;
  display: block;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.resource-sidebar {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.download-card,
.info-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-sm);
}

.download-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  margin: 0 auto 16px;
}

.download-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  text-align: center;
  margin: 0 0 12px 0;
}

.download-info {
  font-size: 0.875rem;
  color: var(--text-secondary);
  text-align: center;
  margin: 0 0 24px 0;
  line-height: 1.8;
}

.info-card h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: var(--text-primary);
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color);
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.info-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
}

.error-state {
  padding: 48px 20px;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
  
  .resource-sidebar {
    order: -1;
  }
}

@media (max-width: 768px) {
  .resource-title {
    font-size: 2rem;
  }
  
  .resource-meta {
    gap: 16px;
  }
  
  .main-content {
    padding: 24px;
  }
  
  .container {
    padding: 0 16px;
  }
}
</style>


