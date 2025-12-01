<template>
  <div class="order-history">
    <el-card>
      <template #header>
        <span>订单记录</span>
      </template>

      <el-table :data="orders" v-loading="loading">
        <el-table-column prop="order_no" label="订单号" width="180" />
        <el-table-column prop="plan_type" label="套餐" width="120">
          <template #default="{ row }">
            {{ getPlanName(row.plan_type) }}
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金额" width="100">
          <template #default="{ row }">
            ¥{{ row.amount }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)">
              {{ getStatusName(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'pending'"
              type="primary"
              size="small"
              @click="continuePay(row)"
            >
              继续支付
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { supabase } from '@/lib/supabase'
import { useUserStore } from '@/stores/userStore'
import type { Order } from '@/lib/supabase'
import axios from 'axios'

const userStore = useUserStore()
const orders = ref<Order[]>([])
const loading = ref(false)

onMounted(() => {
  loadOrders()
})

const loadOrders = async () => {
  if (!userStore.user) return

  loading.value = true
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userStore.user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    orders.value = data || []
  } catch (error) {
    console.error('加载订单记录失败:', error)
  } finally {
    loading.value = false
  }
}

const getPlanName = (planType: string) => {
  const names: Record<string, string> = {
    free: '免费体验',
    basic: '基础会员',
    pro: '专业会员',
    lifetime: '终身会员',
  }
  return names[planType] || planType
}

const getStatusName = (status: string) => {
  const names: Record<string, string> = {
    pending: '待支付',
    paid: '已支付',
    failed: '失败',
    refunded: '已退款',
    cancelled: '已取消',
  }
  return names[status] || status
}

const getStatusTag = (status: string) => {
  const tags: Record<string, any> = {
    pending: 'warning',
    paid: 'success',
    failed: 'danger',
    refunded: 'info',
    cancelled: 'info',
  }
  return tags[status] || ''
}

const formatDateTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

const continuePay = async (order: Order) => {
  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'
    const response = await axios.get(`${backendUrl}/api/payment/query-order`, {
      params: { orderNo: order.order_no },
    })

    if (response.data.success && response.data.data.status === 'paid') {
      ElMessage.success('订单已支付成功')
      await loadOrders()
      await userStore.refresh()
    } else {
      ElMessage.info('订单未支付，请重新创建订单')
    }
  } catch (error) {
    console.error('查询订单失败:', error)
    ElMessage.error('查询订单失败')
  }
}
</script>
