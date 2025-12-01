<template>
  <Teleport to="body">
    <Transition name="mobile-menu">
      <div v-if="isOpen" class="mobile-menu-overlay" @click="handleClose">
        <div class="mobile-menu-container" @click.stop>
          <!-- 头部 -->
          <div class="mobile-menu-header">
            <BrandLogo size="small" :clickable="false" />
            <button class="close-button" @click="handleClose" aria-label="关闭菜单">
              <el-icon><Close /></el-icon>
            </button>
          </div>

          <!-- 菜单内容 -->
          <nav class="mobile-menu-content">
            <div
              v-for="item in items"
              :key="item.id"
              class="menu-item-wrapper"
            >
              <!-- 有子菜单的项 -->
              <template v-if="item.children && item.children.length > 0">
                <div
                  class="menu-item has-children"
                  :class="{ expanded: expandedItems.includes(item.id) }"
                  @click="toggleExpand(item.id)"
                >
                  <div class="menu-item-content">
                    <span class="menu-label">{{ item.label }}</span>
                    <el-tag v-if="item.badge" :type="getBadgeType(item.badge)" size="small">
                      {{ getBadgeText(item.badge) }}
                    </el-tag>
                  </div>
                  <el-icon class="expand-icon">
                    <ArrowDown />
                  </el-icon>
                </div>
                
                <!-- 子菜单 -->
                <Transition name="submenu">
                  <div v-if="expandedItems.includes(item.id)" class="submenu">
                    <router-link
                      v-for="child in item.children"
                      :key="child.id"
                      :to="child.path"
                      class="submenu-item"
                      @click="handleClose"
                    >
                      <span class="submenu-label">{{ child.label }}</span>
                      <el-tag v-if="child.badge" :type="getBadgeType(child.badge)" size="small">
                        {{ getBadgeText(child.badge) }}
                      </el-tag>
                    </router-link>
                  </div>
                </Transition>
              </template>

              <!-- 无子菜单的项 -->
              <router-link
                v-else
                :to="item.path"
                class="menu-item"
                @click="handleClose"
              >
                <div class="menu-item-content">
                  <span class="menu-label">{{ item.label }}</span>
                  <el-tag v-if="item.badge" :type="getBadgeType(item.badge)" size="small">
                    {{ getBadgeText(item.badge) }}
                  </el-tag>
                </div>
              </router-link>
            </div>
          </nav>

          <!-- 底部操作 -->
          <div class="mobile-menu-footer">
            <template v-if="userStore.isLoggedIn">
              <div class="user-info">
                <el-avatar :size="40" :src="userStore.profile?.avatar_url">
                  {{ userStore.profile?.nickname?.[0] || 'U' }}
                </el-avatar>
                <div class="user-details">
                  <div class="user-name">{{ userStore.profile?.nickname || '用户' }}</div>
                  <div class="user-plan">{{ userStore.currentPlan?.name || '免费版' }}</div>
                </div>
              </div>
              <el-button type="primary" plain @click="handleUserCenter">个人中心</el-button>
            </template>
            <template v-else>
              <el-button type="primary" @click="handleLogin" block>登录 / 注册</el-button>
            </template>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Close, ArrowDown } from '@element-plus/icons-vue'
import BrandLogo from './BrandLogo.vue'
import { useUserStore } from '@/stores/userStore'
import type { NavigationItem } from '@/types/navigation'

interface Props {
  isOpen: boolean
  items: NavigationItem[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

const router = useRouter()
const userStore = useUserStore()
const expandedItems = ref<string[]>([])

const handleClose = () => {
  emit('close')
}

const toggleExpand = (itemId: string) => {
  const index = expandedItems.value.indexOf(itemId)
  if (index > -1) {
    expandedItems.value.splice(index, 1)
  } else {
    expandedItems.value.push(itemId)
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

const handleLogin = () => {
  handleClose()
  router.push('/login')
}

const handleUserCenter = () => {
  handleClose()
  router.push('/user-center')
}

// 监听 isOpen 变化，控制 body 滚动
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
    expandedItems.value = []
  }
})
</script>

<script lang="ts">
import { watch } from 'vue'
export default {
  name: 'MobileMenu'
}
</script>

<style scoped>
.mobile-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: var(--z-modal);
  display: flex;
  justify-content: flex-end;
}

.mobile-menu-container {
  width: 80%;
  max-width: 320px;
  height: 100%;
  background: white;
  display: flex;
  flex-direction: column;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
}

.mobile-menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--border-light);
}

.close-button {
  width: 36px;
  height: 36px;
  border: none;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background var(--transition-fast);
  font-size: 20px;
  color: var(--text-secondary);
}

.close-button:hover {
  background: var(--bg-tertiary);
}

.mobile-menu-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.menu-item-wrapper {
  margin: 4px 0;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  color: var(--text-primary);
  text-decoration: none;
  transition: background var(--transition-fast);
  cursor: pointer;
  min-height: var(--mobile-min-touch-size);
}

.menu-item:hover,
.menu-item:active {
  background: var(--bg-secondary);
}

.menu-item.has-children {
  background: transparent;
}

.menu-item-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.menu-label {
  font-size: 16px;
  font-weight: var(--font-medium);
}

.expand-icon {
  transition: transform var(--transition-base);
  color: var(--text-tertiary);
}

.menu-item.expanded .expand-icon {
  transform: rotate(180deg);
}

.submenu {
  background: var(--bg-secondary);
  padding: 4px 0;
}

.submenu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px 12px 40px;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all var(--transition-fast);
  min-height: var(--mobile-min-touch-size);
}

.submenu-item:hover,
.submenu-item:active {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.submenu-label {
  font-size: 15px;
}

.mobile-menu-footer {
  padding: 16px;
  border-top: 1px solid var(--border-light);
  background: var(--bg-secondary);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding: 12px;
  background: white;
  border-radius: var(--radius-md);
}

.user-details {
  flex: 1;
}

.user-name {
  font-size: 15px;
  font-weight: var(--font-medium);
  color: var(--text-primary);
  margin-bottom: 2px;
}

.user-plan {
  font-size: 13px;
  color: var(--text-tertiary);
}

/* 动画 */
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: opacity var(--transition-base);
}

.mobile-menu-enter-active .mobile-menu-container,
.mobile-menu-leave-active .mobile-menu-container {
  transition: transform var(--transition-base);
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
}

.mobile-menu-enter-from .mobile-menu-container,
.mobile-menu-leave-to .mobile-menu-container {
  transform: translateX(100%);
}

.submenu-enter-active,
.submenu-leave-active {
  transition: all var(--transition-base);
  overflow: hidden;
}

.submenu-enter-from,
.submenu-leave-to {
  opacity: 0;
  max-height: 0;
}

.submenu-enter-to,
.submenu-leave-from {
  opacity: 1;
  max-height: 500px;
}
</style>
