<template>
  <div class="pricing-page">
    <div class="pricing-bg"></div>
    <div class="pricing-container">
      <Breadcrumb />
      
      <div class="pricing-header">
        <h1 class="animate-up">解锁 AI 创作潜能</h1>
        <p class="subtitle animate-up delay-1">选择最适合您的方案，开启自媒体运营新篇章</p>
        
        <!-- 信任徽章 -->
        <div class="trust-badges animate-up delay-2">
          <div class="trust-item">
            <el-icon><Lock /></el-icon>
            <span>官方支付保障</span>
          </div>
          <div class="trust-item">
            <el-icon><Lightning /></el-icon>
            <span>权益即刻生效</span>
          </div>
          <div class="trust-item">
            <el-icon><CircleCheck /></el-icon>
            <span>隐私安全加密</span>
          </div>
        </div>
        <p class="payment-channel-note animate-up delay-2">当前支付方式：仅支持支付宝</p>

        <div v-if="entryHint" class="entry-hint animate-up delay-2">
          <strong>{{ entryHint.title }}</strong>
          <span>{{ entryHint.desc }}</span>
        </div>
      </div>

      <!-- 价格卡片区 -->
      <div class="pricing-grid animate-up delay-3" v-loading="loading">
        <div
          v-for="plan in plans"
          :key="plan.plan_type"
          class="pricing-card"
          :class="{ 'is-featured': plan.plan_type === 'pro', 'is-lifetime': plan.plan_type === 'lifetime' }"
          @click="plan.plan_type !== 'free' && handlePurchase(plan)"
        >
          <div class="card-glow"></div>
          
          <div v-if="plan.plan_type === 'pro'" class="badge-featured">
            <el-icon><StarFilled /></el-icon> Most Popular
          </div>
          <div v-if="plan.plan_type === 'lifetime'" class="badge-lifetime">
            <el-icon><Trophy /></el-icon> Best Value
          </div>
          
          <div class="plan-content">
            <div class="plan-top">
              <h3 class="plan-name">{{ plan.name }}</h3>
              <div class="plan-price">
                <span class="currency">¥</span>
                <span class="amount">{{ plan.price }}</span>
                <span class="period" v-if="plan.duration_days">/{{ plan.duration_days }}天</span>
                <span class="period" v-else>/永久</span>
              </div>
              <p class="plan-desc">{{ getPlanDesc(plan.plan_type) }}</p>
            </div>

            <div class="divider"></div>

            <div class="plan-features">
              <div v-for="(feature, index) in getPlanFeatures(plan)" :key="index" class="feature-row">
                <div class="feature-icon">
                  <el-icon v-if="feature.included"><Select /></el-icon>
                  <el-icon v-else class="exclude"><CloseBold /></el-icon>
                </div>
                <span class="feature-text" :class="{ 'text-muted': !feature.included }">
                  {{ feature.text }}
                </span>
                <el-tooltip v-if="feature.tip" :content="feature.tip" placement="top">
                  <el-icon class="feature-info"><InfoFilled /></el-icon>
                </el-tooltip>
              </div>
            </div>

            <div class="plan-action">
              <button 
                class="btn-purchase" 
                :class="{ 'btn-primary': plan.plan_type !== 'free', 'btn-outline': plan.plan_type === 'free' }"
                :disabled="plan.plan_type === 'free' || loading"
              >
                {{ getBtnText(plan.plan_type) }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 权益保障 -->
      <div class="guarantee-section animate-up delay-4">
        <h2 class="section-title">无忧售后保障</h2>
        <div class="guarantee-grid">
          <div class="guarantee-card">
            <div class="icon-box">
              <el-icon><Wallet /></el-icon>
            </div>
            <h4>资金安全</h4>
            <p>接入支付宝官方支付接口，交易全链路加密，资金直达无需担忧。</p>
          </div>
          <div class="guarantee-card">
            <div class="icon-box">
              <el-icon><Lock /></el-icon>
            </div>
            <h4>隐私保护</h4>
            <p>采用企业级 SSL 加密传输，数据本地化处理，绝不存储您的敏感信息。</p>
          </div>
          <div class="guarantee-card">
            <div class="icon-box">
              <el-icon><Service /></el-icon>
            </div>
            <h4>专属客服</h4>
            <p>遇到问题？我们的专业客服团队工作日早9晚6在线，极速响应您的诉求。</p>
          </div>
          <div class="guarantee-card">
            <div class="icon-box">
              <el-icon><Reading /></el-icon>
            </div>
            <h4>合规运营</h4>
            <p>严格遵守法律法规，完善的<router-link to="/terms">服务条款</router-link>保障您的每一次消费权益。</p>
          </div>
        </div>
      </div>

      <!-- FAQ -->
      <div class="faq-section animate-up delay-4">
        <h2 class="section-title">常见问题</h2>
        <div class="faq-grid">
          <el-collapse v-model="activeNames" class="modern-collapse">
            <el-collapse-item title="购买后如何开发票？" name="1">
              <div>目前支持开具增值税电子普通发票。请在购买后联系在线客服，提供抬头信息，我们将在 3 个工作日内发送至您的邮箱。</div>
            </el-collapse-item>
            <el-collapse-item title="账号可以多人共享吗？" name="2">
              <div>为了保障您的权益，账号仅限个人使用。系统检测到多人异地频繁登录可能会触发安全风控导致封禁。</div>
            </el-collapse-item>
            <el-collapse-item title="套餐到期后数据会丢失吗？" name="3">
              <div>不会。转为免费版后，您的历史数据依然保留（只要不超过免费版条数限制），续费后即可解锁查看全部历史记录。</div>
            </el-collapse-item>
            <el-collapse-item title="支持退款吗？" name="4">
              <div>由于数字商品的特殊性，购买后不支持无理由退款。如果不确定是否符合需求，建议先使用免费版体验所有基础功能。</div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  Lock, CircleCheck, Service, Wallet, Reading, 
  Select, CloseBold, InfoFilled, StarFilled, Trophy, Lightning
} from '@element-plus/icons-vue'
import { UserService } from '@/services/userService'
import { useUserStore } from '@/stores/userStore'
import type { PlanConfig } from '@/types/user'
import axios from 'axios'
import Breadcrumb from '@/components/Breadcrumb.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const plans = ref<PlanConfig[]>([])
const loading = ref(false)
const payingPlan = ref<string | null>(null)
const activeNames = ref(['1'])

const currentPlan = computed(() => userStore.planType)
const entryHint = computed(() => {
  const source = typeof route.query.source === 'string' ? route.query.source : ''
  const feature = typeof route.query.feature === 'string' ? route.query.feature : ''
  if (source !== 'content-factory' && source !== 'permission-gate') return null

  const map: Record<string, { title: string; desc: string }> = {
    'multi-platform': {
      title: '你正在解锁：四平台改写',
      desc: '升级专业版后可同步生成小红书 / Twitter / LinkedIn / 博客版本。'
    },
    'studio-video': {
      title: '你正在解锁：视频工位',
      desc: '升级后即可开启短视频脚本、分镜和镜头提示词。'
    },
    'asset-video-hooks': {
      title: '你正在解锁：视频与音频素材包',
      desc: '升级后可生成短视频开场和 BGM 灵感并进入自动化流水线。'
    },
    'automation-workflow': {
      title: '你正在解锁：自动化任务权限',
      desc: '升级后可直接派发多平台流水线并查看完整执行历史。'
    },
    'general': {
      title: '你正在解锁：完整内容工厂',
      desc: '专业版覆盖多平台生成、五模态资产、自动化看板与执行历史。'
    }
  }

  if (source === 'permission-gate') {
    return {
      title: '你已触达当前套餐上限',
      desc: '升级后可获得更高的生成与导出额度，并解锁完整内容工厂能力。'
    }
  }

  return map[feature] || map.general
})

onMounted(async () => {
  await loadPlans()
})

const loadPlans = async () => {
  loading.value = true
  try {
    plans.value = await UserService.getAllPlanConfigs()
  } catch (error) {
    ElMessage.error('加载套餐失败')
  } finally {
    loading.value = false
  }
}

const getPlanDesc = (type?: string) => {
  if (!type) return '解锁更多权益'
  const map: Record<string, string> = {
    free: '仅开放 Starter 体验与基础队列',
    basic: '扩大次数与历史容量，适合稳定产出',
    pro: '解锁完整内容工厂与自动化能力',
    lifetime: '一次付费，长期使用全部专业能力'
  }
  return map[type] || '解锁更多权益'
}

const getBtnText = (type?: string) => {
  if (!type) return '立即升级'
  if (currentPlan.value === type) return '当前套餐'
  if (type === 'free') return '免费体验中'
  return '立即升级'
}

const getPlanFeatures = (plan: PlanConfig) => {
  const isFree = plan.plan_type === 'free'
  const isBasic = plan.plan_type === 'basic'
  const isPro = plan.plan_type === 'pro' || plan.plan_type === 'lifetime'
  const generateLimit = plan.daily_generate_limit || (isFree ? 1 : 10)
  const exportLimit = plan.daily_export_limit || (isFree ? 1 : 50)
  const historyLimit = plan.history_limit || (isFree ? 10 : 100)

  return [
    {
      text: `内容生成次数：${generateLimit >= 999 ? '无限' : `每日 ${generateLimit} 次`}`,
      included: true,
      tip: ''
    },
    {
      text: `内容导出次数：${exportLimit >= 999 ? '无限' : `每日 ${exportLimit} 次`}`,
      included: true,
      tip: ''
    },
    {
      text: isPro ? '内容工厂：4 平台 + 五模态资产包' : '内容工厂：小红书 Starter Pack',
      included: true,
      tip: isPro ? '含多平台改写、视频/BGM 灵感、工作流下载' : '升级后可解锁 Twitter/LinkedIn/博客与高级素材'
    },
    {
      text: isPro ? '自动化任务：定时调度 + 多平台派发' : (isBasic ? '自动化任务：基础队列 + 手动派发' : '自动化任务：基础队列'),
      included: true,
      tip: '专业版支持完整 workflow 权限与发布看板'
    },
    {
      text: `执行历史：保存 ${historyLimit} 条`,
      included: true,
      tip: isPro ? '含输入/回写/错误/产物链接全量追踪' : '升级可查看完整执行详情'
    },
    {
      text: 'Provider 实接：Twitter / Weibo / 配图',
      included: isPro,
      tip: isPro ? '可接真实 provider 适配链路' : '免费版仅展示基础能力'
    },
    {
      text: 'VIP 优先队列与客服支持',
      included: isBasic || isPro,
      tip: isPro ? '高峰期优先处理' : ''
    }
  ]
}

const handlePurchase = async (plan: PlanConfig) => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录后购买')
    router.push('/login?redirect=/pricing')
    return
  }

  if (currentPlan.value === plan.plan_type) {
    ElMessage.info('您已经是该套餐尊贵用户')
    return
  }

  payingPlan.value = plan.plan_type

  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'
    const response = await axios.post(`${backendUrl}/api/payment/create-order`, {
      userId: userStore.user?.id,
      planType: plan.plan_type,
    })

    if (response.data.success) {
      const { paymentForm, orderNo } = response.data.data
      localStorage.setItem('pending_order', orderNo)
      
      const div = document.createElement('div')
      div.innerHTML = paymentForm
      document.body.appendChild(div)
      const form = div.querySelector('form')
      if (form) form.submit()
    } else {
      throw new Error(response.data.error || '创建订单失败')
    }
  } catch (error: any) {
    console.error('购买失败:', error)
    ElMessage.error(error.message || '系统繁忙，请稍后重试')
  } finally {
    payingPlan.value = null
  }
}

</script>

<style scoped>
.pricing-page {
  min-height: 100vh;
  position: relative;
  background: #f8fafc;
  padding-bottom: 80px;
}

/* 顶部背景装饰 */
.pricing-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 500px;
  background: linear-gradient(135deg, #fff1f2 0%, #fff 100%);
  clip-path: ellipse(150% 60% at 50% 0%);
  z-index: 0;
}

.pricing-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  position: relative;
  z-index: 1;
}

/* Header Styles */
.pricing-header {
  text-align: center;
  max-width: 700px;
  margin: 40px auto 60px;
}

.pricing-header h1 {
  font-size: 42px;
  font-weight: 800;
  letter-spacing: -1px;
  background: linear-gradient(to right, #ff2442, #ff6b6b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 16px;
}

.subtitle {
  font-size: 18px;
  color: #64748b;
  margin-bottom: 32px;
}

.trust-badges {
  display: flex;
  justify-content: center;
  gap: 32px;
}

.trust-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #475569;
  font-size: 14px;
  font-weight: 500;
}

.trust-item .el-icon {
  color: #ff2442;
  font-size: 18px;
}

.payment-channel-note {
  margin-top: 14px;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
}

.entry-hint {
  margin: 16px auto 0;
  max-width: 620px;
  padding: 12px 16px;
  border-radius: 14px;
  border: 1px solid rgba(255, 36, 66, 0.24);
  background: rgba(255, 36, 66, 0.06);
  color: #9f1239;
  display: grid;
  gap: 5px;
  text-align: left;
}

/* Card Grid Styles */
.pricing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 80px;
  align-items: stretch; /* 确保卡片等高 */
}

.pricing-card {
  background: white;
  border-radius: 24px;
  padding: 2px; /* For padding border effect */
  position: relative;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.pricing-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Featured & Lifetime Styles */
.is-featured {
  background: linear-gradient(135deg, #ff2442, #ff8787);
}

.is-lifetime {
  background: linear-gradient(135deg, #1e293b, #334155);
}

.card-glow {
  position: absolute;
  inset: 0;
  border-radius: 24px;
  padding: 2px;
  background: white;
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}

.plan-content {
  background: white;
  border-radius: 22px;
  padding: 32px 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
}

/* Badges */
.badge-featured, .badge-lifetime {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  color: white;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  white-space: nowrap;
}

.badge-featured { background: #ff2442; }
.badge-lifetime { background: #0f172a; border: 1px solid #334155; }

/* Plan Internal Layout */
.plan-top {
  text-align: center;
  margin-bottom: 24px;
}

.plan-name {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 16px;
}

.plan-price {
  margin-bottom: 8px;
  color: #0f172a;
  display: flex;
  justify-content: center;
  align-items: baseline;
}

.currency { font-size: 24px; font-weight: 600; margin-right: 2px; }
.amount { font-size: 48px; font-weight: 800; line-height: 1; }
.period { font-size: 14px; color: #64748b; font-weight: 500; }

.plan-desc {
  font-size: 14px;
  color: #64748b;
  min-height: 40px;
}

.divider {
  height: 1px;
  background: #e2e8f0;
  margin: 0 0 24px;
}

.plan-features {
  flex: 1;
  margin-bottom: 32px;
}

.feature-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  font-size: 14px;
}

.feature-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #f1f5f9;
}

.feature-icon .el-icon { font-size: 14px; color: #10b981; }
.feature-icon .exclude { color: #cbd5e1; }

.feature-text { color: #334155; flex: 1; font-weight: 500; }
.feature-text.text-muted { color: #94a3b8; text-decoration: line-through; }

.feature-info { font-size: 14px; color: #94a3b8; cursor: help; }

/* Buttons */
.btn-purchase {
  width: 100%;
  padding: 16px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: #ff2442;
  color: white;
  box-shadow: 0 4px 6px -1px rgba(255, 36, 66, 0.2);
}

.btn-primary:hover {
  background: #e61e3a;
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(255, 36, 66, 0.3);
}

.btn-outline {
  background: transparent;
  border: 2px solid #e2e8f0;
  color: #64748b;
}

/* Guarantee Section */
.guarantee-section {
  margin-bottom: 80px;
}

.section-title {
  text-align: center;
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 40px;
}

.guarantee-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 32px;
}

.guarantee-card {
  background: white;
  padding: 32px;
  border-radius: 20px;
  border: 1px solid #f1f5f9;
  text-align: center;
  transition: all 0.3s;
}

.guarantee-card:hover {
  border-color: #ff2442;
  transform: translateY(-5px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05);
}

.icon-box {
  width: 64px;
  height: 64px;
  background: #fff1f2;
  color: #ff2442;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  margin: 0 auto 20px;
}

.guarantee-card h4 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 12px;
  color: #0f172a;
}

.guarantee-card p {
  color: #64748b;
  line-height: 1.6;
  font-size: 14px;
}

/* FAQ */
.faq-grid {
  max-width: 800px;
  margin: 0 auto;
}

.modern-collapse :deep(.el-collapse-item__header) {
  font-size: 16px;
  font-weight: 600;
  color: #334155;
  padding: 20px 0;
}

.modern-collapse :deep(.el-collapse-item__content) {
  font-size: 15px;
  color: #64748b;
  line-height: 1.7;
}

/* Animations */
.animate-up {
  opacity: 0;
  animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.delay-1 { animation-delay: 0.1s; }
.delay-2 { animation-delay: 0.2s; }
.delay-3 { animation-delay: 0.3s; }
.delay-4 { animation-delay: 0.4s; }

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .pricing-grid {
    grid-template-columns: 1fr;
  }
}
</style>
