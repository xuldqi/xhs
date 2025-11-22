<template>
  <div class="paywall-overlay">
    <div class="paywall-content">
      <div class="lock-icon">
        <el-icon :size="48"><Lock /></el-icon>
      </div>
      <h3>解锁完整内容</h3>
      <p>成为月度会员或更高级别会员，即可阅读完整的涨粉秘籍</p>
      <div class="benefits">
        <div class="benefit-item">
          <el-icon color="#ff2442"><Check /></el-icon>
          <span>解锁所有涨粉秘籍文章</span>
        </div>
        <div class="benefit-item">
          <el-icon color="#ff2442"><Check /></el-icon>
          <span>每月{{ monthlyLimit }}次AI分析</span>
        </div>
        <div class="benefit-item">
          <el-icon color="#ff2442"><Check /></el-icon>
          <span>专属运营策略指导</span>
        </div>
      </div>
      <div class="action-buttons">
        <el-button type="primary" size="large" @click="goToPricing">
          立即开通会员
        </el-button>
        <el-button size="large" @click="goToLogin" v-if="!isLoggedIn">
          已有账号？登录
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { Lock, Check } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const isLoggedIn = computed(() => userStore.isLoggedIn)
const monthlyLimit = computed(() => {
  // 根据会员等级显示不同的次数
  return 50
})

const goToPricing = () => {
  router.push('/pricing')
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.paywall-overlay {
  position: relative;
  background: linear-gradient(180deg, transparent 0%, rgba(255, 255, 255, 0.95) 20%, white 40%);
  padding: 60px 20px 40px;
  margin-top: -100px;
  text-align: center;
}

.paywall-content {
  max-width: 500px;
  margin: 0 auto;
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.lock-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

h3 {
  font-size: 24px;
  color: #1a1a1a;
  margin-bottom: 12px;
}

p {
  color: #666;
  font-size: 15px;
  margin-bottom: 30px;
  line-height: 1.6;
}

.benefits {
  text-align: left;
  margin-bottom: 30px;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  font-size: 15px;
  color: #333;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-buttons .el-button {
  width: 100%;
}

@media (max-width: 768px) {
  .paywall-overlay {
    padding: 40px 16px 30px;
    margin-top: -80px;
  }
  
  .paywall-content {
    padding: 30px 20px;
  }
  
  h3 {
    font-size: 20px;
  }
}
</style>
