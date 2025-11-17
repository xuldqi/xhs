<template>
  <div class="payment-return-container">
    <div class="payment-result">
      <div v-if="loading" class="loading-state">
        <el-icon class="is-loading" :size="60"><Loading /></el-icon>
        <h2>正在确认支付结果...</h2>
        <p>请稍候，不要关闭页面</p>
      </div>

      <div v-else-if="success" class="success-state">
        <el-icon :size="80" color="#67c23a"><CircleCheck /></el-icon>
        <h2>支付成功！</h2>
        <p>您的会员已开通，感谢您的支持</p>
        <div class="actions">
          <el-button type="primary" size="large" @click="goToUserCenter">
            查看会员信息
          </el-button>
          <el-button size="large" @click="goToHome">
            返回首页
          </el-button>
        </div>
      </div>

      <div v-else class="failed-state">
        <el-icon :size="80" color="#f56c6c"><CircleClose /></el-icon>
        <h2>支付失败</h2>
        <p>{{ errorMessage }}</p>
        <div class="actions">
          <el-button type="primary" size="large" @click="goToPricing">
            重新购买
          </el-button>
          <el-button size="large" @click="goToHome">
            返回首页
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Loading, CircleCheck, CircleClose } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/userStore'
import axios from 'axios'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(true)
const success = ref(false)
const errorMessage = ref('')

onMounted(async () => {
  await checkPaymentResult()
})

const checkPaymentResult = async () => {
  const orderNo = route.query.order_no as string

  if (!orderNo) {
    errorMessage.value = '订单号不存在'
    loading.value = false
    return
  }

  try {
    // 轮询查询订单状态（最多查询 10 次，每次间隔 2 秒）
    let attempts = 0
    const maxAttempts = 10

    while (attempts < maxAttempts) {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'
      const response = await axios.get(`${backendUrl}/api/payment/query-order`, {
        params: { orderNo },
      })

      if (response.data.success) {
        const order = response.data.data

        if (order.status === 'paid') {
          success.value = true
          loading.value = false
          
          // 刷新用户状态
          await userStore.refresh()
          
          // 清除本地存储的订单号
          localStorage.removeItem('pending_order')
          return
        } else if (order.status === 'failed' || order.status === 'cancelled') {
          errorMessage.value = '支付已取消或失败'
          loading.value = false
          return
        }
      }

      // 等待 2 秒后重试
      await new Promise((resolve) => setTimeout(resolve, 2000))
      attempts++
    }

    // 超时
    errorMessage.value = '支付确认超时，请稍后在订单记录中查看'
    loading.value = false
  } catch (error: any) {
    console.error('查询支付结果失败:', error)
    errorMessage.value = error.message || '查询支付结果失败'
    loading.value = false
  }
}

const goToUserCenter = () => {
  router.push('/user-center')
}

const goToPricing = () => {
  router.push('/pricing')
}

const goToHome = () => {
  router.push('/')
}
</script>

<style scoped>
.payment-return-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.payment-result {
  background: white;
  border-radius: 16px;
  padding: 60px 40px;
  text-align: center;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.loading-state h2,
.success-state h2,
.failed-state h2 {
  margin: 24px 0 16px 0;
  font-size: 28px;
  font-weight: 600;
  color: #333;
}

.loading-state p,
.success-state p,
.failed-state p {
  margin: 0 0 32px 0;
  font-size: 16px;
  color: #666;
}

.actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.el-icon.is-loading {
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
