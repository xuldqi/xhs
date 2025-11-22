<template>
  <header class="app-header">
    <div class="header-container">
      <div class="logo-section" @click="$router.push('/')">
        <img src="/favicon.svg" alt="小红书学院" class="logo-icon" />
        <span class="logo-text">小红书学院</span>
      </div>
      
      <nav class="nav-links">
        <router-link to="/" class="nav-link">首页</router-link>
        <router-link to="/secrets" class="nav-link">
          <span>涨粉秘籍</span>
          <el-tag size="small" type="danger" style="margin-left: 4px;">VIP</el-tag>
        </router-link>
        <router-link to="/pricing" class="nav-link">会员套餐</router-link>
        <router-link to="/about" class="nav-link">关于工具</router-link>
        
        <template v-if="userStore.isLoggedIn">
          <el-dropdown @command="handleCommand">
            <div class="user-dropdown">
              <el-avatar :size="32" :src="userStore.profile?.avatar_url">
                {{ userStore.profile?.nickname?.[0] || 'U' }}
              </el-avatar>
              <span class="user-name">{{ userStore.profile?.nickname || '用户' }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="user-center">
                  <el-icon><User /></el-icon>
                  个人中心
                </el-dropdown-item>
                <el-dropdown-item command="pricing" v-if="!userStore.isVIP">
                  <el-icon><Star /></el-icon>
                  升级会员
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        
        <template v-else>
          <el-button type="primary" size="small" @click="$router.push('/login')">
            登录 / 注册
          </el-button>
        </template>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowDown, User, Star, SwitchButton } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const userStore = useUserStore()

const handleCommand = async (command: string) => {
  switch (command) {
    case 'user-center':
      router.push('/user-center')
      break
    case 'pricing':
      router.push('/pricing')
      break
    case 'logout':
      try {
        await userStore.logout()
        ElMessage.success('已退出登录')
        router.push('/')
      } catch (error: any) {
        ElMessage.error(error.message || '退出失败')
      }
      break
  }
}
</script>

<style scoped>
.app-header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.logo-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.nav-links {
  display: flex;
  gap: 32px;
  align-items: center;
}

.nav-link {
  color: #6b7280;
  text-decoration: none;
  font-size: 0.9375rem;
  transition: color 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
}

.nav-link:hover {
  color: #409EFF;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.user-dropdown:hover {
  background-color: #f5f7fa;
}

.user-name {
  font-size: 0.9375rem;
  color: #1f2937;
  font-weight: 500;
}

@media (max-width: 768px) {
  .header-container {
    padding: 12px 16px;
  }
  
  .logo-text {
    font-size: 1.125rem;
  }
  
  .nav-links {
    gap: 16px;
  }
  
  .nav-link {
    font-size: 0.875rem;
  }
}
</style>
