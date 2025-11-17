<template>
  <div class="usage-history">
    <el-card>
      <template #header>
        <span>使用记录</span>
      </template>

      <el-table :data="usageLogs" v-loading="loading">
        <el-table-column prop="action_type" label="操作类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getActionTypeTag(row.action_type)">
              {{ getActionTypeName(row.action_type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="metadata" label="详情">
          <template #default="{ row }">
            {{ formatMetadata(row.metadata) }}
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.created_at) }}
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-if="total > pageSize"
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        @current-change="loadUsageLogs"
        style="margin-top: 16px; justify-content: center;"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import { useUserStore } from '@/stores/userStore'
import type { UsageLog } from '@/lib/supabase'

const userStore = useUserStore()
const usageLogs = ref<UsageLog[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

onMounted(() => {
  loadUsageLogs()
})

const loadUsageLogs = async () => {
  if (!userStore.user) return

  loading.value = true
  try {
    const from = (currentPage.value - 1) * pageSize.value
    const to = from + pageSize.value - 1

    const { data, error, count } = await supabase
      .from('usage_logs')
      .select('*', { count: 'exact' })
      .eq('user_id', userStore.user.id)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) throw error

    usageLogs.value = data || []
    total.value = count || 0
  } catch (error) {
    console.error('加载使用记录失败:', error)
  } finally {
    loading.value = false
  }
}

const getActionTypeName = (type: string) => {
  const names: Record<string, string> = {
    generate_guide: '生成指南',
    export_html: '导出HTML',
    view_history: '查看历史',
  }
  return names[type] || type
}

const getActionTypeTag = (type: string) => {
  const tags: Record<string, string> = {
    generate_guide: 'success',
    export_html: 'warning',
    view_history: 'info',
  }
  return tags[type] || ''
}

const formatMetadata = (metadata: any) => {
  if (!metadata) return '-'
  if (metadata.account_name) return `账号: ${metadata.account_name}`
  return JSON.stringify(metadata)
}

const formatDateTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-CN')
}
</script>
