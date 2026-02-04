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
            <el-icon><ShieldCheck /></el-icon>
            <span>隐私安全加密</span>
          </div>
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
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  Check, Lock, ShieldCheck, Service, Wallet, Reading, 
  Select, CloseBold, InfoFilled, StarFilled, Trophy, Lightning 
} from '@element-plus/icons-vue'
import { UserService } from '@/services/userService'
import { useUserStore } from '@/stores/userStore'
import type { PlanConfig } from '@/lib/supabase'
import axios from 'axios'
import Breadcrumb from '@/components/Breadcrumb.vue'

const router = useRouter()
const userStore = useUserStore()

const plans = ref<PlanConfig[]>([])
const loading = ref(false)
const payingPlan = ref<string | null>(null)
const activeNames = ref(['1'])

const currentPlan = computed(() => userStore.planType)

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

const getPlanDesc = (type: string) => {
  const map: Record<string, string> = {
    free: '零成本开始您的创作之旅',
    basic: '适合刚起步的自媒体创作者',
    pro: '全功能解锁，专业运营首选',
    lifetime: '一次付费，终身享受更新'
  }
  return map[type] || '解锁更多权益'
}

const getBtnText = (type: string) => {
  if (currentPlan.value === type) return '当前套餐'
  if (type === 'free') return '免费体验中'
  return '立即升级'
}

const getPlanFeatures = (plan: PlanConfig) => {
  // 定义所有可能的特性
  const allFeatures = [
    { key: 'generate', label: 'AI 标题生成', limit: true },
    { key: 'viral', label: 'AI 爆款生成器', limit: true },
    { key: 'tools', label: '图片/热词工具', limit: true },
    { key: 'export', label: '内容导出', limit: true },
    { key: 'history', label: '历史记录保存', limit: true },
    { key: 'priority', label: 'VIP 急速队列', bool: true },
    { key: 'template', label: '自定义模板', bool: true },
    { key: 'support', label: '专属客服支持', bool: true },
  ]
  
  return allFeatures.map(f => {
    let included = true
    let text = f.label
    let tip = ''
    
    if (f.limit) {
      // 处理带限制的数量
      let limit = 0
      if (f.key === 'generate' && plan.daily_generate_limit) limit = plan.daily_generate_limit
      else if (f.key === 'export' && plan.daily_export_limit) limit = plan.daily_export_limit
      else if (f.key === 'history' && plan.history_limit) limit = plan.history_limit
      // 简单映射其他限制
      else if (plan.plan_type === 'free') limit = f.key === 'viral' ? 3 : 5
      else limit = 999

      if (limit >= 999) {
        text += '：无限次'
      } else {
        text += `：每日 ${limit} 次`
         if (f.key === 'history') text = `保存 ${limit} 条历史`
      }
    } else if (f.bool) {
       // 处理布尔值特性
       if (f.key === 'priority') included = plan.priority || false
       if (f.key === 'template') included = plan.features?.customTemplate || false
       if (f.key === 'support') included = plan.plan_type !== 'free'
    }
    
    return { text, included, tip }
  })
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
  .pricing-header h1 { font-size: 32px; }
  .trust-badges { flex-direction: column; gap: 12px; }
  .pricing-grid { margin: 0; }
  .pricing-card:hover { transform: none; }
}
</style>
      <p>开通会员，解锁更多功能</p>
      
      <!-- 信任徽章 -->
      <div class="trust-badges">
        <div class="trust-badge">
          <el-icon><Lock /></el-icon>
          <span>安全支付</span>
        </div>
        <div class="trust-badge">
          <el-icon><CircleCheck /></el-icon>
          <span>即时生效</span>
        </div>
        <div class="trust-badge">
          <el-icon><Lock /></el-icon>
          <span>数据安全</span>
        </div>
        <div class="trust-badge">
          <el-icon><Service /></el-icon>
          <span>24小时客服</span>
        </div>
      </div>
    </div>

    <div class="pricing-cards" v-loading="loading">
      <div
        v-for="plan in plans"
        :key="plan.plan_type"
        class="pricing-card"
        :class="{ recommended: plan.plan_type === 'pro' }"
      >
        <div v-if="plan.plan_type === 'pro'" class="recommended-badge">推荐</div>
        
        <div class="plan-header">
          <h3>{{ plan.name }}</h3>
          <div class="price">
            <span class="amount">¥{{ plan.price }}</span>
            <span class="period" v-if="plan.duration_days">
              / {{ plan.duration_days }}天
            </span>
            <span class="period" v-else>/ 永久</span>
          </div>
        </div>

        <div class="plan-features">
          <div class="feature-section">
            <h4 class="section-title">工具使用</h4>
            <div class="feature-item">
              <el-icon><Check /></el-icon>
              <span>标题生成器：{{ plan.plan_type === 'free' ? '每日10次' : '无限使用' }}</span>
            </div>
            <div class="feature-item">
              <el-icon><Check /></el-icon>
              <span>爆款生成器：{{ plan.plan_type === 'free' ? '每日3次' : '无限使用' }}</span>
            </div>
            <div class="feature-item">
              <el-icon><Check /></el-icon>
              <span>图片工具：{{ plan.plan_type === 'free' ? '每日5次' : '无限使用' }}</span>
            </div>
            <div class="feature-item">
              <el-icon><Check /></el-icon>
              <span>热词洞察：{{ plan.plan_type === 'free' ? '每日20次' : '无限使用' }}</span>
            </div>
            <div class="feature-item">
              <el-icon><Check /></el-icon>
              <span>灵感话题库：{{ plan.plan_type === 'free' ? '每日20次' : '无限使用' }}</span>
            </div>
          </div>
          
          <div class="feature-section" v-if="plan.plan_type === 'pro'">
            <h4 class="section-title">高级功能</h4>
            <div class="feature-item">
              <el-icon><Check /></el-icon>
              <span>竞品分析工具（即将上线）</span>
            </div>
            <div class="feature-item">
              <el-icon><Check /></el-icon>
              <span>SEO关键词工具（即将上线）</span>
            </div>
            <div class="feature-item">
              <el-icon><Check /></el-icon>
              <span>图片编辑器（即将上线）</span>
            </div>
          </div>
          
          <div class="feature-section">
            <h4 class="section-title">其他功能</h4>
            <div class="feature-item">
              <el-icon><Check /></el-icon>
              <span>每日生成 {{ plan.daily_generate_limit === 999 ? '无限' : plan.daily_generate_limit }} 次</span>
            </div>
            <div class="feature-item">
              <el-icon><Check /></el-icon>
              <span>每日导出 {{ plan.daily_export_limit === 999 ? '无限' : plan.daily_export_limit }} 次</span>
            </div>
            <div class="feature-item">
              <el-icon><Check /></el-icon>
              <span>保存 {{ plan.history_limit === 999 ? '无限' : plan.history_limit }} 条历史</span>
            </div>
            <div class="feature-item" v-if="plan.priority">
              <el-icon><Check /></el-icon>
              <span>优先生成队列</span>
            </div>
            <div class="feature-item" v-if="plan.features?.customTemplate">
              <el-icon><Check /></el-icon>
              <span>自定义模板</span>
            </div>
            <div class="feature-item" v-if="plan.features?.earlyAccess">
              <el-icon><Check /></el-icon>
              <span>新功能优先体验</span>
            </div>
          </div>
        </div>

        <el-button
          v-if="plan.plan_type !== 'free'"
          type="primary"
          size="large"
          :loading="payingPlan === plan.plan_type"
          @click="handlePurchase(plan)"
          class="purchase-btn"
          :class="{ 'is-current': currentPlan === plan.plan_type }"
        >
          {{ currentPlan === plan.plan_type ? '当前套餐' : '立即购买' }}
        </el-button>
        <el-button
          v-else
          size="large"
          disabled
          class="purchase-btn"
        >
          当前套餐
        </el-button>
      </div>
    </div>

    <!-- 安全保证 -->
    <div class="security-guarantee">
      <el-card>
        <template #header>
          <div class="guarantee-header">
            <el-icon><Lock /></el-icon>
            <span>安全保证</span>
          </div>
        </template>
        <div class="guarantee-content">
          <div class="guarantee-item">
            <el-icon><Lock /></el-icon>
            <div>
              <strong>安全支付</strong>
              <p>使用支付宝官方支付，资金安全有保障</p>
            </div>
          </div>
          <div class="guarantee-item">
            <el-icon><CircleCheck /></el-icon>
            <div>
              <strong>数据安全</strong>
              <p>所有数据采用HTTPS加密传输，本地处理，不存储用户信息</p>
            </div>
          </div>
          <div class="guarantee-item">
            <el-icon><Service /></el-icon>
            <div>
              <strong>客服支持</strong>
              <p>24小时内响应，工作日9:00-18:00在线支持</p>
            </div>
          </div>
          <div class="guarantee-item">
            <el-icon><Document /></el-icon>
            <div>
              <strong>法律保障</strong>
              <p>完善的<router-link to="/privacy">隐私政策</router-link>和<router-link to="/terms">服务条款</router-link>，保障用户权益</p>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <div class="pricing-faq">
      <h3>常见问题</h3>
      <el-collapse>
        <el-collapse-item title="如何支付？" name="1">
          <p>本平台使用<strong>支付宝</strong>支付。点击「立即购买」后会跳转到支付宝收银台，完成支付后会员立即生效。</p>
        </el-collapse-item>
        <el-collapse-item title="购买后多久生效？" name="2">
          <p>支付成功后立即生效，您可以在个人中心查看会员状态。</p>
        </el-collapse-item>
        <el-collapse-item title="可以退款吗？" name="3">
          <p>由于是虚拟商品，一经购买不支持退款，请谨慎选择。</p>
          <p style="margin-top: 8px; color: #666;">
            如遇特殊情况（如重复支付、系统错误等），请在购买后7天内联系客服处理。
            详细退款政策请查看<router-link to="/terms" style="color: #409EFF;">服务条款</router-link>。
          </p>
        </el-collapse-item>
        <el-collapse-item title="会员到期后怎么办？" name="4">
          <p>会员到期后会自动降级为免费版，您可以随时续费。</p>
        </el-collapse-item>
      </el-collapse>
    </div>

    <!-- 开发环境：支付宝接入测试（无需登录、不写数据库） -->
    <div v-if="isDev" class="pricing-test-alipay">
      <h3>🧪 测试支付宝接入</h3>
      <p class="test-desc">仅开发环境显示。点击后创建 0.01 元测试订单并跳转支付宝（沙箱），用于验证密钥与网关配置。</p>
      <el-button
        type="warning"
        plain
        :loading="testPayLoading"
        @click="handleTestAlipay"
      >
        {{ testPayLoading ? '创建中…' : '创建 0.01 元测试订单' }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Check, Lock, CircleCheck, Service, Document } from '@element-plus/icons-vue'
import { UserService } from '@/services/userService'
import { useUserStore } from '@/stores/userStore'
import type { PlanConfig } from '@/lib/supabase'
import axios from 'axios'
import Breadcrumb from '@/components/Breadcrumb.vue'

const router = useRouter()
const userStore = useUserStore()

const plans = ref<PlanConfig[]>([])
const loading = ref(false)
const payingPlan = ref<string | null>(null)
const testPayLoading = ref(false)
const isDev = import.meta.env.DEV

const currentPlan = computed(() => userStore.planType)

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

const handlePurchase = async (plan: PlanConfig) => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login?redirect=/pricing')
    return
  }

  if (currentPlan.value === plan.plan_type) {
    ElMessage.info('您已经是该套餐用户')
    return
  }

  payingPlan.value = plan.plan_type

  try {
    // 调用后端创建订单
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'
    const response = await axios.post(`${backendUrl}/api/payment/create-order`, {
      userId: userStore.user?.id,
      planType: plan.plan_type,
    })

    if (response.data.success) {
      const { paymentForm, orderNo } = response.data.data
      
      // 保存订单号到 localStorage
      localStorage.setItem('pending_order', orderNo)
      
      // 创建一个临时表单并提交到支付宝
      const div = document.createElement('div')
      div.innerHTML = paymentForm
      document.body.appendChild(div)
      const form = div.querySelector('form')
      if (form) {
        form.submit()
      }
    } else {
      throw new Error(response.data.error || '创建订单失败')
    }
  } catch (error: any) {
    console.error('购买失败:', error)
    ElMessage.error(error.message || '购买失败，请稍后重试')
  } finally {
    payingPlan.value = null
  }
}

// 开发环境：测试支付宝（不依赖登录与数据库）
async function handleTestAlipay() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'
  testPayLoading.value = true
  try {
    const { data } = await axios.post<{ success: boolean; data?: { paymentForm: string; orderNo: string }; error?: string }>(
      `${backendUrl}/api/payment-test/test-create-order`,
      { amount: '0.01', subject: '测试订单' }
    )
    if (data.success && data.data?.paymentForm) {
      const div = document.createElement('div')
      div.innerHTML = data.data.paymentForm
      document.body.appendChild(div)
      const form = div.querySelector('form')
      if (form) {
        form.submit()
      } else {
        ElMessage.warning('未获取到支付表单，请检查后端返回')
      }
    } else {
      ElMessage.error(data.error || '创建测试订单失败')
    }
  } catch (err: any) {
    ElMessage.error(err.response?.data?.error || err.message || '请求失败')
  } finally {
    testPayLoading.value = false
  }
}
</script>

<style scoped>
.pricing-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 20px;
}

.pricing-header {
  text-align: center;
  margin-bottom: 60px;
}

.pricing-header h1 {
  font-size: 36px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
}

.pricing-header p {
  font-size: 18px;
  color: #666;
  margin: 0;
}

.pricing-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 60px;
}

.pricing-card {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 500px;
}

.pricing-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.pricing-card.recommended {
  border: 2px solid #667eea;
}

.recommended-badge {
  position: absolute;
  top: -12px;
  right: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4px 16px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.plan-header {
  text-align: center;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #eee;
}

.plan-header h3 {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
}

.price {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
}

.price .amount {
  font-size: 36px;
  font-weight: 700;
  color: #667eea;
}

.price .period {
  font-size: 14px;
  color: #999;
}

.plan-features {
  margin-bottom: 24px;
  flex: 1;
}

.feature-section {
  margin-bottom: 24px;
}

.feature-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #667eea;
  margin: 0 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  font-size: 14px;
  color: #666;
}

.feature-item .el-icon {
  color: #67c23a;
  font-size: 18px;
}

.purchase-btn {
  width: 100%;
  margin-top: auto;
}

.purchase-btn.is-current {
  background: #e0e0e0;
  border-color: #e0e0e0;
  color: #999;
}

.pricing-faq {
  max-width: 800px;
  margin: 0 auto;
}

.pricing-faq h3 {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0 0 24px 0;
  text-align: center;
}

.pricing-test-alipay {
  max-width: 800px;
  margin: 48px auto 0;
  padding: 24px;
  background: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 12px;
}

.pricing-test-alipay h3 {
  margin: 0 0 8px;
  font-size: 1rem;
  color: #ad6800;
}

.pricing-test-alipay .test-desc {
  margin: 0 0 12px;
  font-size: 13px;
  color: #876800;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .pricing-cards {
    grid-template-columns: 1fr;
  }
}
</style>
