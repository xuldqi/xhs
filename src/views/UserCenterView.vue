<template>
  <div class="user-center-container">
    <div class="user-header">
      <div class="user-info">
        <el-avatar :size="80" :src="profile?.avatar_url">
          {{ profile?.nickname?.[0] || profile?.email?.[0] || 'U' }}
        </el-avatar>
        <div class="user-details">
          <h2>{{ profile?.nickname || profile?.email || '用户' }}</h2>
          <p>{{ profile?.email }}</p>
        </div>
      </div>
      <div class="vip-badge" :class="planType">
        <el-icon><Crown /></el-icon>
        <span>{{ planName }}</span>
      </div>
    </div>

    <el-tabs v-model="activeTab">
      <el-tab-pane label="会员信息" name="vip">
        <VIPInfo />
      </el-tab-pane>
      <el-tab-pane label="使用记录" name="usage">
        <UsageHistory />
      </el-tab-pane>
      <el-tab-pane label="订单记录" name="orders">
        <OrderHistory />
      </el-tab-pane>
      <el-tab-pane label="个人设置" name="settings">
        <UserSettings />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Crown } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/userStore'
import VIPInfo from '@/components/user/VIPInfo.vue'
import UsageHistory from '@/components/user/UsageHistory.vue'
import OrderHistory from '@/components/user/OrderHistory.vue'
import UserSettings from '@/components/user/UserSettings.vue'

const userStore = useUserStore()
const activeTab = ref('vip')

const profile = computed(() => userStore.profile)
const planType = computed(() => userStore.planType)
const planName = computed(() => userStore.planName)

onMounted(() => {
  userStore.refresh()
})
</script>
