<template>
  <div class="user-settings">
    <el-card>
      <template #header>
        <span>个人设置</span>
      </template>

      <el-form :model="form" label-width="100px">
        <el-form-item label="昵称">
          <el-input v-model="form.nickname" placeholder="请输入昵称" />
        </el-form-item>

        <el-form-item label="邮箱">
          <el-input v-model="form.email" disabled />
        </el-form-item>

        <el-form-item label="手机号">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSave" :loading="saving">
            保存修改
          </el-button>
          <el-button @click="handleLogout" :loading="logouting">
            退出登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const userStore = useUserStore()

const saving = ref(false)
const logouting = ref(false)

const form = reactive({
  nickname: '',
  email: '',
  phone: '',
})

watch(
  () => userStore.profile,
  (profile) => {
    if (profile) {
      form.nickname = profile.nickname || ''
      form.email = profile.email || ''
      form.phone = profile.phone || ''
    }
  },
  { immediate: true }
)

const handleSave = async () => {
  saving.value = true
  try {
    await userStore.updateProfile({
      nickname: form.nickname,
      phone: form.phone,
    })
    ElMessage.success('保存成功')
  } catch (error: any) {
    ElMessage.error(error.message || '保存失败')
  } finally {
    saving.value = false
  }
}

const handleLogout = async () => {
  logouting.value = true
  try {
    await userStore.logout()
    ElMessage.success('已退出登录')
    router.push('/')
  } catch (error: any) {
    ElMessage.error(error.message || '退出失败')
  } finally {
    logouting.value = false
  }
}
</script>
