<template>
  <header class="app-header">
    <div class="header-container">
      <div class="logo-section" @click="$router.push('/')">
        <img src="/favicon.svg" alt="小红书学院" class="logo-icon" />
        <span class="logo-text">小红书学院</span>
      </div>
      
      <nav class="nav-links">
        <router-link to="/" class="nav-link">首页</router-link>
        <router-link to="/about" class="nav-link">关于工具</router-link>
        <router-link to="/privacy" class="nav-link">隐私政策</router-link>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { Link } from '@element-plus/icons-vue'
</script>

<style scoped>
.app-header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
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
