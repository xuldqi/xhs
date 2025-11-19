<template>
  <div class="pricing-container">
    <div class="pricing-header">
      <h1>选择适合你的套餐</h1>
      <p>开通会员，解锁更多功能</p>
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

    <div class="pricing-faq">
      <h3>常见问题</h3>
      <el-collapse>
        <el-collapse-item title="如何支付？" name="1">
          <p>我们支持支付宝支付，点击购买后会跳转到支付宝支付页面。</p>
        </el-collapse-item>
        <el-collapse-item title="购买后多久生效？" name="2">
          <p>支付成功后立即生效，您可以在个人中心查看会员状态。</p>
        </el-collapse-item>
        <el-collapse-item title="可以退款吗？" name="3">
          <p>由于是虚拟商品，一经购买不支持退款，请谨慎选择。</p>
        </el-collapse-item>
        <el-collapse-item title="会员到期后怎么办？" name="4">
          <p>会员到期后会自动降级为免费版，您可以随时续费。</p>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Check } from '@element-plus/icons-vue'
import { UserService } from '@/services/userService'
import { useUserStore } from '@/stores/userStore'
import type { PlanConfig } from '@/lib/supabase'
import axios from 'axios'

const router = useRouter()
const userStore = useUserStore()

const plans = ref<PlanConfig[]>([])
const loading = ref(false)
const payingPlan = ref<string | null>(null)

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
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'
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

@media (max-width: 768px) {
  .pricing-cards {
    grid-template-columns: 1fr;
  }
}
</style>
