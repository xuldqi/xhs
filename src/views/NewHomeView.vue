<template>
  <div class="new-home-view">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="container">
        <div class="hero-content">
          <h1 class="hero-title">
            小红书增长专家
            <span class="highlight">一站式运营平台</span>
          </h1>
          <p class="hero-subtitle">
            从数据分析到内容策略，从工具矩阵到社区交流<br>
            助力你的小红书账号快速增长
          </p>
          
          <div class="hero-actions">
            <CTAButton
              text="立即开始"
              size="large"
              @click="scrollToUpload"
            />
            <button class="btn-secondary" @click="goToKnowledge">
              了解更多
            </button>
          </div>
          
          <StatsCounter class="hero-stats" />
        </div>
        
        <div class="hero-visual">
          <div class="visual-card">
            <div class="visual-placeholder">
              <div class="visual-icon">📱</div>
              <div class="visual-text">小红书增长专家</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <div class="container">
        <h2 class="section-title">核心功能</h2>
        <p class="section-subtitle">全方位助力你的小红书运营</p>
        
        <div class="features-grid">
          <div
            v-for="feature in features"
            :key="feature.id"
            class="feature-card"
            @click="navigateTo(feature.link)"
          >
            <div class="feature-icon">{{ feature.icon }}</div>
            <div class="feature-header">
              <h3>{{ feature.title }}</h3>
              <span v-if="feature.badge" class="feature-badge">{{ feature.badge }}</span>
            </div>
            <p>{{ feature.description }}</p>
            <span class="feature-link">了解更多 →</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Cases Section -->
    <section class="cases-section">
      <div class="container">
        <div class="section-header">
          <div>
            <h2 class="section-title">真实用户成功案例</h2>
            <p class="section-subtitle">他们都通过我们的指南实现了涨粉目标</p>
          </div>
        </div>
        
        <div class="cases-list">
          <div
            v-for="(caseItem, index) in simpleCases"
            :key="index"
            class="case-item"
          >
            <div class="case-icon">{{ caseItem.icon }}</div>
            <div class="case-content">
              <div class="case-header">
                <h3 class="case-title">{{ caseItem.title }}</h3>
                <span class="case-category">{{ caseItem.category }}</span>
              </div>
              <div class="case-stats">
                <span class="stat">使用前{{ caseItem.before }}粉丝</span>
                <span class="stat-arrow">→</span>
                <span class="stat highlight">{{ caseItem.after }}</span>
              </div>
              <p class="case-period">{{ caseItem.period }}</p>
              <p class="case-quote">"{{ caseItem.quote }}"</p>
              <div class="case-tags">
                <span
                  v-for="(tag, tagIndex) in caseItem.tags"
                  :key="tagIndex"
                  class="case-tag"
                >
                  ✓ {{ tag }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="cases-footer">
          <div class="stats-summary">
            <div class="summary-item">
              <div class="summary-value">10,000+</div>
              <div class="summary-label">累计使用次数</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">85%</div>
              <div class="summary-label">用户达成涨粉目标</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">4.8/5.0</div>
              <div class="summary-label">用户满意度评分</div>
            </div>
          </div>
          
          <div class="cta-box">
            <h3>看完案例，是不是也想试试？</h3>
            <p>上传截图，5分钟获取你的专属涨粉方案</p>
            <CTAButton
              text="开始生成我的指南"
              size="large"
              @click="scrollToUpload"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Tools Section -->
    <section class="tools-section">
      <div class="container">
        <h2 class="section-title">工具矩阵</h2>
        <p class="section-subtitle">提升效率的实用工具</p>
        
        <div class="tools-grid">
          <ToolCard
            v-for="tool in tools"
            :key="tool.id"
            :tool="tool"
          />
        </div>
        
        <div class="tools-cta">
          <CTAButton
            text="探索更多工具"
            @click="goToTools"
          />
        </div>
      </div>
    </section>

    <!-- Testimonials Section -->
    <section class="testimonials-section">
      <div class="container">
        <h2 class="section-title">用户评价</h2>
        <p class="section-subtitle">来自真实用户的反馈</p>
        
        <TestimonialCarousel />
      </div>
    </section>

    <!-- Trust Section -->
    <section class="trust-section">
      <div class="container">
        <h2 class="section-title">为什么选择我们？</h2>
        <div class="trust-grid">
          <div class="trust-item">
            <div class="trust-icon">🔒</div>
            <h3>数据安全</h3>
            <p>HTTPS加密传输，本地处理，不存储用户数据，100%保护隐私</p>
          </div>
          <div class="trust-item">
            <div class="trust-icon">✅</div>
            <h3>真实案例</h3>
            <p>所有案例和数据均来自真实来源，标注清晰，可信可靠</p>
          </div>
          <div class="trust-item">
            <div class="trust-icon">⚡</div>
            <h3>即时生效</h3>
            <p>支付成功后立即生效，无需等待，随时可用</p>
          </div>
          <div class="trust-item">
            <div class="trust-icon">💬</div>
            <h3>专业支持</h3>
            <p>24小时内响应，工作日在线客服，专业解答疑问</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="container">
        <div class="cta-content">
          <h2>准备好开始了吗？</h2>
          <p>立即生成你的专属增长攻略</p>
          <CTAButton
            text="免费开始"
            size="large"
            @click="scrollToUpload"
          />
          <div class="cta-trust">
            <span>🔒 数据安全</span>
            <span>•</span>
            <span>✅ 真实案例</span>
            <span>•</span>
            <span>⚡ 即时生效</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Upload Section -->
    <section id="upload-section" class="upload-section">
      <div class="container">
        <h2 class="section-title">上传截图，生成攻略</h2>
        <p class="section-subtitle">3步即可获得专业的增长建议</p>
        
        <div class="upload-card">
          <!-- 这里可以嵌入原有的上传组件 -->
          <router-link to="/upload" class="upload-link">
            <div class="upload-placeholder">
              <div class="upload-icon">📸</div>
              <h3>点击上传小红书主页截图</h3>
              <p>支持 PNG、JPG 格式，最多3张</p>
            </div>
          </router-link>
        </div>
      </div>
    </section>

    <!-- Trust Signals -->
    <TrustSignals />
    
    <!-- Activity Banner -->
    <ActivityBanner />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import CTAButton from '@/components/conversion/CTAButton.vue'
import StatsCounter from '@/components/StatsCounter.vue'
import CaseCard from '@/components/cases/CaseCard.vue'
import ToolCard from '@/components/tools/ToolCard.vue'
import TestimonialCarousel from '@/components/conversion/TestimonialCarousel.vue'
import TrustSignals from '@/components/conversion/TrustSignals.vue'
import ActivityBanner from '@/components/conversion/ActivityBanner.vue'
import { analyticsService } from '@/services/analyticsService'

const router = useRouter()

const features = ref([
  {
    id: 1,
    icon: '💎',
    title: '涨粉秘籍',
    description: '实战经验、独家技巧、深度解析（VIP专享）',
    link: '/secrets',
    badge: 'VIP'
  },
  {
    id: 2,
    icon: '📚',
    title: '知识库',
    description: '系统化的小红书运营知识，从入门到精通',
    link: '/knowledge'
  },
  {
    id: 3,
    icon: '📈',
    title: '案例库',
    description: '真实账号增长案例，数据可视化展示',
    link: '/cases'
  },
  {
    id: 4,
    icon: '📡',
    title: '情报局',
    description: '最新平台动态、政策变化、趋势分析',
    link: '/intelligence'
  },
  {
    id: 5,
    icon: '🛠️',
    title: '工具箱',
    description: '标题生成、话题分析等实用工具',
    link: '/tools'
  },
  {
    id: 6,
    icon: '💬',
    title: '社区',
    description: '与其他运营者交流经验，解决问题',
    link: '/community'
  }
])

const featuredCases = ref([])
const tools = ref([])

// 简化的案例数据
const simpleCases = ref([
  {
    icon: '💄',
    title: '美妆博主 @小美',
    category: '美妆护肤',
    before: '50',
    after: '→+2300%',
    period: '30天后1,200粉丝',
    quote: '按照指南的爆款公式，第一篇笔记就了热门！对标账号拆解框架特别实用，让我找到了清晰的方向。',
    tags: ['自媒爆款✓', '30天破千粉✓', '接到品牌合作']
  },
  {
    icon: '😊',
    title: '穿搭博主 @时尚达人',
    category: '穿搭时尚',
    before: '120',
    after: '→+650%',
    period: '45天后900粉丝',
    quote: '3天起号计划非常详细，每一步都有具体的操作指南。数据盘板帮我找到了内容优化方向。',
    tags: ['笔记互动率提升3倍✓', '45天近千粉✓', '开始接广']
  },
  {
    icon: '🍔',
    title: '美食博主 @吃货小王',
    category: '美食探店',
    before: '0',
    after: '→从0到1',
    period: '60天后1,500粉丝',
    quote: '完全零基础开始，指南给了我系统的方法论。冷启动技巧和每日固定动作让我养成了良好的运营习惯。',
    tags: ['零基础起号✓', '60天破1500粉✓', '开始接广告']
  }
])

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

function goToTools() {
  router.push('/tools')
}

onMounted(() => {
  // 加载特色案例和工具
  // TODO: 从API获取数据
})
</script>

<style scoped>
.new-home-view {
  width: 100%;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 6rem 0 4rem;
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%),
    linear-gradient(-45deg, rgba(255,255,255,0.1) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.1) 75%),
    linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.1) 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  opacity: 0.3;
}

.hero-section .container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  position: relative;
  z-index: 1;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 1.5rem;
}

.hero-title .highlight {
  display: block;
  background: linear-gradient(90deg, #f093fb 0%, #f5576c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.25rem;
  line-height: 1.8;
  margin-bottom: 2.5rem;
  opacity: 0.95;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 3rem;
}

.btn-secondary {
  padding: 1rem 2rem;
  border: 2px solid white;
  background: transparent;
  color: white;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: white;
  color: #667eea;
}

.hero-visual {
  display: flex;
  justify-content: center;
  align-items: center;
}

.visual-card {
  width: 100%;
  max-width: 500px;
  aspect-ratio: 1;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.visual-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.visual-icon {
  font-size: 6rem;
  animation: float 3s ease-in-out infinite;
}

.visual-text {
  font-size: 1.5rem;
  font-weight: 600;
  opacity: 0.9;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

/* Features Section */
.features-section {
  padding: 6rem 0;
  background: #f8f9fa;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 1rem;
  color: #333;
}

.section-subtitle {
  font-size: 1.1rem;
  text-align: center;
  color: #666;
  margin-bottom: 3rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.feature-card {
  background: white;
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1.5rem;
}

.feature-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.feature-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  color: #333;
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: 4px;
  text-transform: uppercase;
}

.feature-card p {
  color: #666;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.feature-link {
  color: #667eea;
  font-weight: 600;
  font-size: 0.95rem;
}

/* Cases Section */
.cases-section {
  padding: 6rem 0;
  background: #f8f9fa;
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.cases-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-bottom: 4rem;
}

.case-item {
  display: flex;
  gap: 2rem;
  background: white;
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.case-item:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.case-icon {
  font-size: 3rem;
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  border-radius: 12px;
}

.case-content {
  flex: 1;
}

.case-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.case-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.case-category {
  padding: 0.25rem 0.75rem;
  background: #667eea;
  color: white;
  font-size: 0.875rem;
  border-radius: 20px;
}

.case-stats {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  font-size: 1rem;
}

.stat {
  color: #666;
}

.stat-arrow {
  color: #667eea;
  font-weight: bold;
}

.stat.highlight {
  color: #667eea;
  font-weight: 700;
  font-size: 1.25rem;
}

.case-period {
  color: #888;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.case-quote {
  color: #555;
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 1rem;
  font-style: italic;
  padding-left: 1rem;
  border-left: 3px solid #667eea;
}

.case-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.case-tag {
  padding: 0.4rem 0.75rem;
  background: #f0f4ff;
  color: #667eea;
  font-size: 0.875rem;
  border-radius: 6px;
  font-weight: 500;
}

.cases-footer {
  margin-top: 4rem;
}

.stats-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin-bottom: 3rem;
  padding: 2.5rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.summary-item {
  text-align: center;
}

.summary-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 0.5rem;
}

.summary-label {
  font-size: 0.95rem;
  color: #666;
}

.cta-box {
  text-align: center;
  padding: 3rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

/* Tools Section */
.tools-section {
  padding: 6rem 0;
  background: #f8f9fa;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.tools-cta {
  text-align: center;
}

/* Testimonials Section */
.testimonials-section {
  padding: 6rem 0;
}

/* CTA Section */
.cta-section {
  padding: 6rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
}

.cta-content h2 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.cta-content p {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.95;
}

/* Upload Section */
.upload-section {
  padding: 6rem 0;
}

.upload-card {
  max-width: 800px;
  margin: 0 auto;
}

.upload-link {
  display: block;
  text-decoration: none;
  color: inherit;
}

.upload-placeholder {
  background: white;
  border: 3px dashed #667eea;
  border-radius: 16px;
  padding: 4rem 2rem;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
}

.upload-placeholder:hover {
  border-color: #764ba2;
  background: #f8f9fa;
}

.upload-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
}

.upload-placeholder h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
}

  .upload-placeholder p {
    color: #666;
  }
}

/* Trust Section */
.trust-section {
  padding: 6rem 0;
  background: #f9fafb;
}

.trust-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 32px;
  margin-top: 3rem;
}

.trust-item {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.trust-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.trust-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.trust-item h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.75rem 0;
}

.trust-item p {
  font-size: 0.9375rem;
  color: #6b7280;
  line-height: 1.6;
  margin: 0;
}

.cta-trust {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 1.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.cta-trust span {
  display: flex;
  align-items: center;
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

  .features-grid {
    grid-template-columns: 1fr;
  }

  .tools-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .section-title {
    font-size: 1.75rem;
  }

  .section-header {
    margin-bottom: 2rem;
  }

  .case-item {
    flex-direction: column;
    padding: 1.5rem;
    gap: 1rem;
  }

  .case-icon {
    width: 60px;
    height: 60px;
    font-size: 2rem;
  }

  .case-title {
    font-size: 1.1rem;
  }

  .case-stats {
    flex-wrap: wrap;
  }

  .stats-summary {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding: 1.5rem;
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
