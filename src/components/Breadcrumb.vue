<template>
  <nav class="breadcrumb" aria-label="面包屑导航">
    <ol class="breadcrumb-list">
      <li 
        v-for="(item, index) in breadcrumbItems" 
        :key="index"
        class="breadcrumb-item"
        :class="{ 'is-active': index === breadcrumbItems.length - 1 }"
      >
        <router-link 
          v-if="item.path && index !== breadcrumbItems.length - 1"
          :to="item.path"
          class="breadcrumb-link"
        >
          <i v-if="item.icon" :class="item.icon" class="breadcrumb-icon"></i>
          {{ item.name }}
        </router-link>
        <span v-else class="breadcrumb-text">
          <i v-if="item.icon" :class="item.icon" class="breadcrumb-icon"></i>
          {{ item.name }}
        </span>
        <i 
          v-if="index < breadcrumbItems.length - 1" 
          class="breadcrumb-separator el-icon-arrow-right"
        ></i>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

interface BreadcrumbItem {
  name: string
  path?: string
  icon?: string
}

const route = useRoute()

const routeBreadcrumbMap: Record<string, BreadcrumbItem[]> = {
  '/': [
    { name: '首页', path: '/', icon: 'el-icon-house' }
  ],
  '/analysis': [
    { name: '首页', path: '/', icon: 'el-icon-house' },
    { name: '智能分析', icon: 'el-icon-data-analysis' }
  ],
  '/guide': [
    { name: '首页', path: '/', icon: 'el-icon-house' },
    { name: '涨粉指南', icon: 'el-icon-document' }
  ],
  '/user': [
    { name: '首页', path: '/', icon: 'el-icon-house' },
    { name: '用户中心', icon: 'el-icon-user' }
  ],
  '/pricing': [
    { name: '首页', path: '/', icon: 'el-icon-house' },
    { name: '会员套餐', icon: 'el-icon-medal' }
  ],
  '/calendar': [
    { name: '首页', path: '/', icon: 'el-icon-house' },
    { name: '内容日历', icon: 'el-icon-calendar' }
  ],
  '/blog': [
    { name: '首页', path: '/', icon: 'el-icon-house' },
    { name: '运营技巧', icon: 'el-icon-reading' }
  ]
}

const breadcrumbItems = computed(() => {
  const currentPath = route.path
  
  if (currentPath.startsWith('/blog/')) {
    return [
      { name: '首页', path: '/', icon: 'el-icon-house' },
      { name: '运营技巧', path: '/blog', icon: 'el-icon-reading' },
      { name: '文章详情', icon: 'el-icon-document' }
    ]
  }
  
  if (currentPath.startsWith('/share/')) {
    return [
      { name: '首页', path: '/', icon: 'el-icon-house' },
      { name: '分享指南', icon: 'el-icon-share' }
    ]
  }
  
  return routeBreadcrumbMap[currentPath] || [
    { name: '首页', path: '/', icon: 'el-icon-house' }
  ]
})
</script>

<style scoped>
.breadcrumb {
  padding: 12px 0;
  margin-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.breadcrumb-list {
  display: flex;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
  flex-wrap: wrap;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #666;
}

.breadcrumb-item.is-active {
  color: #FF2442;
  font-weight: 500;
}

.breadcrumb-link {
  color: #666;
  text-decoration: none;
  display: flex;
  align-items: center;
  transition: color 0.3s ease;
  padding: 4px 8px;
  border-radius: 4px;
}

.breadcrumb-link:hover {
  color: #FF2442;
  background-color: #fff2f2;
}

.breadcrumb-text {
  display: flex;
  align-items: center;
  padding: 4px 8px;
}

.breadcrumb-icon {
  margin-right: 4px;
  font-size: 12px;
}

.breadcrumb-separator {
  margin: 0 8px;
  color: #ccc;
  font-size: 12px;
}

@media (max-width: 768px) {
  .breadcrumb {
    padding: 8px 0;
    margin-bottom: 12px;
  }
  
  .breadcrumb-item {
    font-size: 13px;
  }
  
  .breadcrumb-separator {
    margin: 0 4px;
  }
}
</style>
