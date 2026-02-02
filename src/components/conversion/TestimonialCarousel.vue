<template>
  <div class="testimonial-carousel">
    <div class="container">
      <h2 v-if="title" class="carousel-title">{{ title }}</h2>
      
      <el-carousel
        :interval="5000"
        :height="carouselHeight"
        arrow="always"
        indicator-position="outside"
      >
        <el-carousel-item v-for="testimonial in testimonials" :key="testimonial.id">
          <div class="testimonial-card">
            <div class="quote-icon">
              <el-icon><ChatDotRound /></el-icon>
            </div>
            
            <div class="testimonial-content">
              <p class="testimonial-text">"{{ testimonial.content }}"</p>
              
              <div class="testimonial-author">
                <el-avatar :src="testimonial.author.avatar" :size="48">
                  {{ testimonial.author.name.charAt(0) }}
                </el-avatar>
                
                <div class="author-info">
                  <div class="author-name">{{ testimonial.author.name }}</div>
                  <div class="author-role">{{ testimonial.author.role }}</div>
                  
                  <el-rate
                    v-model="testimonial.rating"
                    disabled
                    show-score
                    text-color="#ff9900"
                  />
                </div>
              </div>
              
              <div v-if="testimonial.results" class="testimonial-results">
                <div
                  v-for="(result, index) in testimonial.results"
                  :key="index"
                  class="result-item"
                >
                  <div class="result-value">{{ result.value }}</div>
                  <div class="result-label">{{ result.label }}</div>
                </div>
              </div>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChatDotRound } from '@element-plus/icons-vue'

interface Testimonial {
  id: string
  content: string
  author: {
    name: string
    role: string
    avatar: string
  }
  rating: number
  results?: Array<{
    value: string
    label: string
  }>
}

interface Props {
  title?: string
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  height: '320px'
})

// 响应式数据
const testimonials = ref<Testimonial[]>([
  {
    id: '1',
    content: '使用这个平台后，我的小红书账号在3个月内从0涨到了5000粉丝，内容质量和数据分析工具真的很实用！',
    author: {
      name: '小美',
      role: '美妆博主',
      avatar: ''
    },
    rating: 5,
    results: [
      { value: '5000+', label: '粉丝增长' },
      { value: '3个月', label: '达成时间' },
      { value: '10万+', label: '总曝光量' }
    ]
  },
  {
    id: '2',
    content: '作为运营新手，这里的知识库和案例分析帮助我快速上手，现在我的笔记平均点赞数提升了300%！',
    author: {
      name: '张三',
      role: '生活方式博主',
      avatar: ''
    },
    rating: 5,
    results: [
      { value: '300%', label: '点赞提升' },
      { value: '2周', label: '见效时间' },
      { value: '50+', label: '优质笔记' }
    ]
  },
  {
    id: '3',
    content: '工具矩阵里的标题生成器和数据分析工具太好用了，大大提高了我的工作效率，强烈推荐！',
    author: {
      name: '李四',
      role: '美食博主',
      avatar: ''
    },
    rating: 5,
    results: [
      { value: '80%', label: '效率提升' },
      { value: '每天2小时', label: '节省时间' },
      { value: '1000+', label: '日均浏览' }
    ]
  }
])

const carouselHeight = computed(() => props.height)
</script>

<style scoped>
.testimonial-carousel {
  padding: 40px 0;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.container {
  max-width: var(--container-lg);
  margin: 0 auto;
  padding: 0 20px;
}

.carousel-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 48px 0;
}

.testimonial-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: 28px 32px;
  box-shadow: var(--shadow-md);
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
}

.quote-icon {
  position: absolute;
  top: 16px;
  right: 16px;
  font-size: 2rem;
  color: var(--primary-color);
  opacity: 0.08;
}

.testimonial-content {
  position: relative;
  z-index: 1;
}

.testimonial-text {
  font-size: 1.05rem;
  line-height: 1.7;
  color: var(--text-primary);
  margin: 0 0 20px 0;
  font-style: italic;
}

.testimonial-author {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
}

.author-info {
  flex: 1;
}

.author-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.author-role {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.testimonial-results {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

.result-item {
  text-align: center;
}

.result-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 2px;
}

.result-label {
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

/* Element Plus Carousel 样式覆盖 */
:deep(.el-carousel__arrow) {
  background: rgba(0, 0, 0, 0.3);
}

:deep(.el-carousel__arrow:hover) {
  background: rgba(0, 0, 0, 0.5);
}

:deep(.el-carousel__indicator) {
  padding: 12px 4px;
}

:deep(.el-carousel__button) {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--primary-color);
  opacity: 0.3;
}

:deep(.el-carousel__indicator.is-active .el-carousel__button) {
  opacity: 1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .testimonial-carousel {
    padding: 48px 0;
  }
  
  .carousel-title {
    font-size: 1.75rem;
    margin-bottom: 32px;
  }
  
  .testimonial-card {
    padding: 32px 24px;
  }
  
  .testimonial-text {
    font-size: 1rem;
  }
  
  .testimonial-results {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .testimonial-author {
    flex-direction: column;
    text-align: center;
  }
}
</style>
