<template>
  <div class="new-home-view">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="container">
        <div class="hero-content">
          <h1 class="hero-title">
            你的 AI 小红书运营管家：
            <span class="highlight">免费诊断 + 智能内容日历</span>，帮你系统涨粉
          </h1>
          <p class="hero-subtitle">
            上传主页截图 → 秒出12章涨粉指南 + 你的专属30天内容日历（免费预览前几天）
          </p>
          
          <div class="hero-actions">
            <CTAButton
              text="立即免费诊断我的账号"
              size="large"
              @click="scrollToUpload"
            />
            <button class="btn-secondary" @click="goToCalendar">
              先生成我的内容日历试试
            </button>
          </div>

          <p class="hero-trust">
            完全免费起步 · 隐私不留存 · 基于顶级AI实时适配2026小红书算法
          </p>
          
        </div>
        
        <div class="hero-visual">
          <HeroCalendarMockup />
        </div>
      </div>
    </section>

    <!-- 工具矩阵（用核心功能同款卡片形式展示） -->
    <section class="features-section">
      <div class="container">
        <h2 class="section-title">工具矩阵</h2>
        <p class="section-subtitle">提升效率的实用工具</p>
        
        <div class="features-grid features-highlight">
          <div
            v-for="item in homeTools"
            :key="item.id"
            class="feature-card"
            :class="{ 'feature-emphasized': item.emphasized }"
            @click="navigateTo(item.link)"
          >
            <div class="feature-icon" v-html="item.svg"></div>
            <div class="feature-header">
              <h3>{{ item.title }}</h3>
              <span v-if="item.badge" class="feature-badge">{{ item.badge }}</span>
            </div>
            <p>{{ item.description }}</p>
            <span class="feature-link">了解更多 →</span>
          </div>
        </div>
        <div class="features-cta">
          <CTAButton text="探索更多工具" @click="goToTools" />
        </div>
      </div>
    </section>

    <!-- Upload Section（唯一上传入口，合并原底部 CTA 的转化意图） -->
    <section id="upload-section" class="upload-section">
      <div class="container">
        <h2 class="section-title">现在开始：上传截图，生成你的专属指南</h2>
        <p class="section-subtitle">3 步即可获得 12 章涨粉指南 + 30 天内容日历</p>
        
        <div class="upload-card">
          <UploadZone />
        </div>

        <div class="upload-subscribe">
          <p class="subscribe-label">订阅每日涨粉 Tips + 日历提醒（免费）</p>
          <div class="subscribe-form">
            <input
              v-model="subscribeEmail"
              type="email"
              placeholder="输入邮箱"
              class="subscribe-input"
            />
            <input
              v-model="subscribeWechat"
              type="text"
              placeholder="或微信号"
              class="subscribe-input"
            />
            <button class="subscribe-btn" @click="handleSubscribe">
              订阅
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Activity Banner -->
    <ActivityBanner />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import CTAButton from '@/components/conversion/CTAButton.vue'
import ActivityBanner from '@/components/conversion/ActivityBanner.vue'
import UploadZone from '@/components/UploadZone.vue'
import HeroCalendarMockup from '@/components/HeroCalendarMockup.vue'
import { analyticsService } from '@/services/analyticsService'

const router = useRouter()

// 首页工具矩阵（与核心功能同款卡片形式：图标 + 标题 + 描述 + 了解更多）
const homeTools = ref([
  {
    id: 'calendar',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
    title: 'AI 内容日历',
    description: '30 天内容规划，标题/大纲/标签/发布时间',
    link: '/calendar',
    badge: '新',
    emphasized: true
  },
  {
    id: '1',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`,
    title: '标题生成器',
    description: 'AI 智能生成吸引眼球的标题，多种风格实时预览',
    link: '/tools/title-generator',
    emphasized: false
  },
  {
    id: '2',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>`,
    title: '话题分析工具',
    description: '分析热门话题趋势，找到最适合的内容方向',
    link: '/tools/topic-analyzer',
    emphasized: false
  },
  {
    id: '3',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
    title: '竞品分析工具',
    description: '深度分析竞品账号，学习优秀案例成功经验',
    link: '/tools/competitor-analyzer',
    emphasized: false
  },
  {
    id: '4',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path></svg>`,
    title: 'SEO 关键词工具',
    description: '挖掘高价值关键词，优化内容搜索排名',
    link: '/tools/keyword-tool',
    emphasized: false
  }
])

// 保留原 features 供其他区块使用
const features = ref([
  { id: 1, svg: '', title: '涨粉秘籍', description: '实战经验、独家技巧', link: '/secrets', badge: 'VIP' },
  { id: 2, svg: '', title: '知识库', description: '系统化运营知识', link: '/knowledge' },
  { id: 3, svg: '', title: '案例库', description: '真实涨粉案例', link: '/cases' },
  { id: 4, svg: '', title: '情报局', description: '平台动态与趋势', link: '/intelligence' },
  { id: 5, svg: '', title: '工具箱', description: '标题生成等工具', link: '/tools' },
  { id: 6, svg: '', title: '社区', description: '交流经验', link: '/community' }
])

const subscribeEmail = ref('')
const subscribeWechat = ref('')

async function handleSubscribe() {
  const email = subscribeEmail.value.trim()
  const wechat = subscribeWechat.value.trim()
  if (!email && !wechat) {
    ElMessage.warning('请输入邮箱或微信号')
    return
  }
  const base = import.meta.env.VITE_BACKEND_URL || ''
  const apiUrl = base ? `${base.replace(/\/$/, '')}/api/subscribe` : '/api/subscribe'
  try {
    const { data } = await axios.post<{ success: boolean; message?: string }>(
      apiUrl,
      { email: email || undefined, wechat: wechat || undefined }
    )
    if (data.success) {
      analyticsService.trackEvent?.('subscribe', { type: email ? 'email' : 'wechat' })
      ElMessage.success('订阅成功！我们会尽快为您推送每日涨粉 Tips')
      subscribeEmail.value = ''
      subscribeWechat.value = ''
    } else {
      ElMessage.warning(data.message || '订阅失败')
    }
  } catch (err: any) {
    ElMessage.error(err.response?.data?.message || '订阅失败，请稍后重试')
  }
}

function scrollToUpload() {
  const element = document.getElementById('upload-section')
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
  analyticsService.trackCTAClick('hero-cta', '立即开始', 'hero-section')
}

function navigateTo(path: string) {
  router.push(path)
}

function goToKnowledge() {
  router.push('/knowledge')
}

function goToCalendar() {
  router.push('/calendar')
  analyticsService.trackCTAClick('hero-secondary', '先生成我的内容日历试试', 'hero-section')
}

function goToTools() {
  router.push('/tools')
}

onMounted(() => {
  // 首页数据为静态/本地，如需从 API 拉取可在此调用
})
</script>

<style scoped>
.new-home-view {
  width: 100%;
}

/* Hero Section */
.hero-section {
  background: #f8f9fa; /* Light gray background */
  color: #333; /* Dark text color */
  padding: 4rem 0;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.hero-section .container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.hero-content {
  max-width: 800px;
}

.hero-title {
  font-size: 3.2rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 1.5rem;
  color: #111;
}

.hero-title .highlight {
  display: inline;
  background: linear-gradient(120deg, #FF2442 0%, #FF5C77 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.2rem;
  line-height: 1.8;
  margin-bottom: 2.5rem;
  color: #555;
}

.hero-actions {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

/* 主按钮与次按钮统一尺寸、圆角 */
.hero-actions :deep(.el-button) {
  min-height: 3.5rem;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: var(--radius-base, 8px);
}

.hero-trust {
  font-size: 0.875rem;
  color: #888;
  margin: 0;
}

.hero-actions .btn-secondary {
  min-height: 3.5rem;
  padding: 1rem 2rem;
  border: 2px solid #FF2442;
  background: white;
  color: #FF2442;
  border-radius: var(--radius-base, 8px);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(255, 36, 66, 0.15);
}

.hero-actions .btn-secondary:hover {
  background: #fff0f2;
  color: #e61e3c;
  border-color: #e61e3c;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 36, 66, 0.25);
}

.hero-visual {
  width: 100%;
  max-width: 400px;
  margin-top: 2rem;
}

/* Features Section */
.features-section {
  padding: 3rem 0;
}

.features-section .section-title,
.features-section .section-subtitle {
  text-align: center;
}

.features-section .features-grid {
  gap: 1rem;
}

.feature-card {
  background: white;
  padding: 1.25rem;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  transition: all 0.2s ease;
  cursor: pointer;
  border: 1px solid #eee;
}

.feature-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.08);
  border-color: #FF2442;
}

.feature-card.feature-emphasized {
  border: 2px solid #FF2442;
  background: linear-gradient(135deg, #fff9f9 0%, #fff 100%);
}

.features-highlight {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.feature-icon {
  font-size: 1.5rem;
  margin-bottom: 0.75rem;
  color: #FF2442;
}
.feature-icon :deep(svg) {
  width: 28px;
  height: 28px;
  stroke: #FF2442;
}

.feature-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.feature-card h3 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.feature-badge {
  display: inline-block;
  padding: 0.2rem 0.4rem;
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  color: #333;
  font-size: 0.65rem;
  font-weight: 700;
  border-radius: 4px;
  text-transform: uppercase;
}

.feature-card p {
  color: #666;
  line-height: 1.5;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.feature-link {
  color: #FF2442;
  font-weight: 600;
  font-size: 0.8rem;
}

.features-cta {
  text-align: center;
  margin-top: 1.5rem;
}

.cta-box {
  text-align: center;
  padding: 3rem;
  background: linear-gradient(135deg, #FF2442 0%, #FF5C77 100%);
  border-radius: 16px;
  color: white;
}

.cta-box h3 {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
}

.cta-box p {
  font-size: 1.1rem;
  margin-bottom: 2rem;
  opacity: 0.95;
}

/* 上传区下方订阅（原 CTA Section 订阅合并至此） */
.upload-subscribe {
  margin-top: 2.5rem;
  padding-top: 2rem;
  border-top: 1px solid #e8e8e8;
  text-align: center;
}

.subscribe-label {
  font-size: 0.95rem;
  margin-bottom: 1rem !important;
  color: #666;
}

.subscribe-form {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
}

.subscribe-input {
  padding: 0.6rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fff;
  color: #333;
  font-size: 0.95rem;
  width: 160px;
}

.subscribe-input::placeholder {
  color: #999;
}

.subscribe-btn {
  padding: 0.6rem 1.5rem;
  background: #FF2442;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.subscribe-btn:hover {
  background: #e01f3c;
  transform: scale(1.02);
}

/* Upload Section */
.upload-section {
  padding: 6rem 0;
}

.upload-section .container {
  text-align: center;
}

.upload-section .section-title,
.upload-section .section-subtitle {
  text-align: center;
}

.upload-card {
  max-width: 800px;
  margin: 0 auto;
}

/* Container */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .hero-section .container {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .hero-visual {
    display: none;
  }

  .features-grid,
  .features-highlight {
    grid-template-columns: repeat(2, 1fr);
  }

  .feature-card {
    padding: 1rem;
  }

  .section-title {
    font-size: 1.75rem;
  }


  .summary-value {
    font-size: 2rem;
  }

  .cta-box {
    padding: 2rem 1.5rem;
  }

  .cta-box h3 {
    font-size: 1.5rem;
  }

  .cta-box p {
    font-size: 1rem;
  }
}
</style>
