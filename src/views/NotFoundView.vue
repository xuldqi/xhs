<template>
  <div class="not-found-view">
    <div class="not-found-container">
      <div class="error-code">404</div>
      <h1>页面未找到</h1>
      <p class="error-message">
        抱歉，您访问的页面不存在或已被移除
      </p>
      
      <div class="suggestions">
        <h3>您可以尝试：</h3>
        <ul>
          <li>检查URL是否正确</li>
          <li>返回首页重新开始</li>
          <li>使用搜索功能查找内容</li>
        </ul>
      </div>
      
      <div class="actions">
        <router-link to="/" class="btn-primary">
          返回首页
        </router-link>
        <button @click="goBack" class="btn-secondary">
          返回上一页
        </button>
      </div>
      
      <div class="popular-links">
        <h3>热门页面</h3>
        <div class="links-grid">
          <router-link to="/knowledge" class="link-card">
            <span class="icon">📚</span>
            <span class="text">知识库</span>
          </router-link>
          <router-link to="/cases" class="link-card">
            <span class="icon">📈</span>
            <span class="text">案例库</span>
          </router-link>
          <router-link to="/tools" class="link-card">
            <span class="icon">🛠️</span>
            <span class="text">工具箱</span>
          </router-link>
          <router-link to="/community" class="link-card">
            <span class="icon">💬</span>
            <span class="text">社区</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}
</script>

<style scoped>
.not-found-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.not-found-container {
  max-width: 600px;
  width: 100%;
  background: white;
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
}

.error-code {
  font-size: 8rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
  margin-bottom: 1rem;
}

h1 {
  font-size: 2rem;
  color: #333;
  margin-bottom: 1rem;
}

.error-message {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 2rem;
}

.suggestions {
  text-align: left;
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
}

.suggestions h3 {
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 1rem;
}

.suggestions ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.suggestions li {
  padding: 0.5rem 0;
  padding-left: 1.5rem;
  position: relative;
  color: #666;
}

.suggestions li::before {
  content: '→';
  position: absolute;
  left: 0;
  color: #667eea;
  font-weight: 700;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-secondary:hover {
  background: #667eea;
  color: white;
}

.popular-links {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px dashed #e0e0e0;
}

.popular-links h3 {
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 1rem;
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.link-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 12px;
  text-decoration: none;
  color: #333;
  transition: all 0.3s ease;
}

.link-card:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.link-card .icon {
  font-size: 2rem;
}

.link-card .text {
  font-size: 0.9rem;
  font-weight: 600;
}

@media (max-width: 768px) {
  .not-found-container {
    padding: 2rem;
  }

  .error-code {
    font-size: 6rem;
  }

  h1 {
    font-size: 1.5rem;
  }

  .actions {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
  }

  .links-grid {
    grid-template-columns: 1fr;
  }
}
</style>
