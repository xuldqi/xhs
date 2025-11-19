<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h2>{{ isRegister ? '注册账号' : '登录账号' }}</h2>
        <p>{{ isRegister ? '创建账号开始使用' : '欢迎回来' }}</p>
      </div>

      <el-form :model="form" :rules="rules" ref="formRef" @submit.prevent="handleSubmit">
        <el-form-item prop="email">
          <el-input
            v-model="form.email"
            placeholder="邮箱地址"
            size="large"
            prefix-icon="Message"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="密码"
            size="large"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item v-if="isRegister" prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="确认密码"
            size="large"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-button
          type="primary"
          size="large"
          :loading="loading"
          @click="handleSubmit"
          class="submit-btn"
        >
          {{ isRegister ? '注册' : '登录' }}
        </el-button>
      </el-form>

      <div class="login-footer">
        <span>{{ isRegister ? '已有账号？' : '还没有账号？' }}</span>
        <el-button type="text" @click="toggleMode">
          {{ isRegister ? '立即登录' : '立即注册' }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const userStore = useUserStore()

const isRegister = ref(false)
const loading = ref(false)
const formRef = ref<FormInstance>()

const form = reactive({
  email: '',
  password: '',
  confirmPassword: '',
})

const validateConfirmPassword = (rule: any, value: any, callback: any) => {
  if (value !== form.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' },
  ],
}

const toggleMode = () => {
  isRegister.value = !isRegister.value
  form.confirmPassword = ''
  formRef.value?.clearValidate()
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      if (isRegister.value) {
        await userStore.register(form.email, form.password)
        ElMessage.success('注册成功！请查收确认邮件。')
      } else {
        await userStore.login(form.email, form.password)
        ElMessage.success('登录成功！')
      }
      
      // 跳转到首页或之前的页面
      const redirect = router.currentRoute.value.query.redirect as string
      router.push(redirect || '/')
    } catch (error: any) {
      const errorMsg = error.message || (isRegister.value ? '注册失败' : '登录失败')
      
      // 如果是邮箱未确认错误，显示重新发送按钮
      if (errorMsg.includes('邮箱尚未确认')) {
        ElMessage({
          message: errorMsg,
          type: 'warning',
          duration: 5000,
          showClose: true,
        })
      } else {
        ElMessage.error(errorMsg)
      }
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-header h2 {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.login-header p {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.submit-btn {
  width: 100%;
  margin-top: 8px;
}

.login-footer {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: #666;
}

.login-footer .el-button {
  padding: 0;
  margin-left: 4px;
}
</style>
