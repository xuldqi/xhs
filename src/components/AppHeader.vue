<template>
  <header class="app-header">
    <div class="header-container">
      <BrandLogo size="medium" />
      
      <!-- 桌面端导航 -->
      <nav class="nav-links desktop-nav">
        <template v-for="item in navigationItems" :key="item.id">
          <!-- 有子菜单的导航项 -->
          <el-dropdown v-if="item.children && item.children.length > 0" trigger="hover" @command="handleNavCommand">
            <div class="nav-link dropdown-trigger">
              <span>{{ item.label }}</span>
              <el-tag v-if="item.badge" :type="getBadgeType(item.badge)" size="small" class="nav-badge">
                {{ getBadgeText(item.badge) }}
              </el-tag>
              <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  v-for="child in item.children"
                  :key="child.id"
                  :command="child.path"
                >
                  <div class="dropdown-item-content">
                    <span>{{ child.label }}</span>
                    <el-tag v-if="child.badge" :type="getBadgeType(child.badge)" size="small">
                      {{ getBadgeText(child.badge) }}
                    </el-tag>
                  </div>
                  <div v-if="child.description" class="dropdown-item-desc">
                    {{ child.description }}
                  </div>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <!-- 无子菜单的导航项 -->
          <router-link v-else :to="item.path" class="nav-link">
            <span>{{ item.label }}</span>
            <el-tag v-if="item.badge" :type="getBadgeType(item.badge)" size="small" class="nav-badge">
              {{ getBadgeText(item.badge) }}
            </el-tag>
          </router-link>
        </template>
        
        <!-- 用户菜单 -->
        <template v-if="userStore.isLoggedIn">
          <el-dropdown @command="handleUserCommand">
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

      <!-- 移动端菜单按钮 -->
      <button class="mobile-menu-button" @click="toggleMobileMenu" aria-label="打开菜单">
        <el-icon><Menu /></el-icon>
      </button>
    </div>

    <!-- 移动端菜单 -->
    <MobileMenu
      :is-open="isMobileMenuOpen"
      :items="mobileNavigationItems"
      @close="closeMobileMenu"
    />
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowDown, User, Star, SwitchButton, Menu } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/userStore'
import BrandLogo from './BrandLogo.vue'
import MobileMenu from './MobileMenu.vue'
import { navigationStructure, mobileNavigationStructure } from '@/data/navigationData'

const router = useRouter()
const userStore = useUserStore()
const isMobileMenuOpen = ref(false)

// 过滤掉会员套餐，放到用户菜单中
const navigationItems = computed(() => {
  return navigationStructure.filter(item => item.id !== 'pricing')
})

const mobileNavigationItems = computed(() => {
  return mobileNavigationStructure
})

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

const handleNavCommand = (path: string) => {
  router.push(path)
}

const handleUserCommand = async (command: string) => {
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

const getBadgeType = (badge: string) => {
  const types: Record<string, any> = {
    new: 'success',
    hot: 'danger',
    vip: 'warning'
  }
  return types[badge] || 'info'
}

const getBadgeText = (badge: string) => {
  const texts: Record<string, string> = {
    new: '新',
    hot: '热',
    vip: 'VIP'
  }
  return texts[badge] || badge
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



.nav-links {
  display: flex;
  gap: 24px;
  align-items: center;
}

.desktop-nav {
  display: flex;
}

.nav-link {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 15px;
  transition: color var(--transition-fast);
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  white-space: nowrap;
}

.nav-link:hover {
  color: var(--brand-primary);
}

.nav-link.router-link-active {
  color: var(--brand-primary);
  font-weight: var(--font-medium);
}

.dropdown-trigger {
  padding: 8px 12px;
  border-radius: var(--radius-md);
  transition: background var(--transition-fast);
}

.dropdown-trigger:hover {
  background: var(--bg-secondary);
}

.dropdown-icon {
  font-size: 12px;
  transition: transform var(--transition-fast);
}

.nav-badge {
  margin-left: 4px;
}

.dropdown-item-content {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: space-between;
  width: 100%;
}

.dropdown-item-desc {
  font-size: 12px;
  color: var(--text-tertiary);
  margin-top: 4px;
}

.mobile-menu-button {
  display: none;
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 24px;
  color: var(--text-primary);
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  transition: background var(--transition-fast);
}

.mobile-menu-button:hover {
  background: var(--bg-secondary);
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
  
  .desktop-nav {
    display: none;
  }

  .mobile-menu-button {
    display: flex;
  }
}
</style>
