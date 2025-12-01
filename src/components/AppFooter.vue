<template>
  <footer class="app-footer">
    <div class="footer-container">
      <!-- 主要内容区 -->
      <div class="footer-main">
        <div class="footer-section">
          <h3 class="footer-title">关于工具</h3>
          <p class="footer-desc">
            基于 AI 技术的小红书涨粉指南生成器，帮助运营者快速制定专业的涨粉策略。
          </p>
        </div>
        
        <div class="footer-section">
          <h3 class="footer-title">快速链接</h3>
          <ul class="footer-links">
            <li><a href="#features">功能介绍</a></li>
            <li><a href="#how-to-use">使用教程</a></li>
            <li><a href="#faq">常见问题</a></li>
          </ul>
        </div>
        
        <div class="footer-section">
          <h3 class="footer-title">法律信息</h3>
          <ul class="footer-links">
            <li><router-link to="/privacy">隐私政策</router-link></li>
            <li><router-link to="/terms">服务条款</router-link></li>
            <li><router-link to="/about">关于我们</router-link></li>
          </ul>
        </div>
        
        <div class="footer-section">
          <h3 class="footer-title">联系我们</h3>
          <ul class="footer-links">
            <li><a href="mailto:novemeber11@gmail.com">novemeber11@gmail.com</a></li>
          </ul>
        </div>
      </div>
      
      <!-- 免责声明 -->
      <div class="footer-disclaimer">
        <el-icon class="disclaimer-icon"><InfoFilled /></el-icon>
        <p class="disclaimer-text">
          本平台为独立开发的第三方工具，非小红书官方平台。
          我们致力于为小红书运营者和爱好者提供学习交流社区。
        </p>
      </div>
      
      <!-- 底部版权 -->
      <div class="footer-bottom">
        <p class="copyright">
          © {{ currentYear }} 小红书流量学院. All rights reserved.
        </p>
        <div class="footer-badges">
          <span class="badge">
            <el-icon><Lock /></el-icon>
            数据安全
          </span>
          <span class="badge">
            <el-icon><CircleCheck /></el-icon>
            AI 驱动
          </span>
          <span class="badge">
            <el-icon><User /></el-icon>
            社区驱动
          </span>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Lock, CircleCheck, User, InfoFilled } from '@element-plus/icons-vue'

const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped>
.app-footer {
  background: #1f2937;
  color: #d1d5db;
  margin-top: auto;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 48px 24px 24px;
}

.footer-main {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 40px;
  margin-bottom: 40px;
}

.footer-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.footer-title {
  font-size: 1rem;
  font-weight: 600;
  color: white;
  margin: 0;
}

.footer-desc {
  font-size: 0.875rem;
  line-height: 1.6;
  margin: 0;
  color: #9ca3af;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.footer-links a {
  color: #9ca3af;
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.2s;
}

.footer-links a:hover {
  color: #409EFF;
}

.footer-disclaimer {
  background: #374151;
  border-radius: 8px;
  padding: 16px 20px;
  margin-bottom: 32px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.disclaimer-icon {
  color: #60A5FA;
  font-size: 20px;
  flex-shrink: 0;
  margin-top: 2px;
}

.disclaimer-text {
  font-size: 0.875rem;
  line-height: 1.6;
  color: #D1D5DB;
  margin: 0;
}

.footer-bottom {
  padding-top: 24px;
  border-top: 1px solid #374151;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.copyright {
  font-size: 0.875rem;
  color: #9ca3af;
  margin: 0;
}

.footer-badges {
  display: flex;
  gap: 16px;
}

.badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
  color: #9ca3af;
}

@media (max-width: 768px) {
  .footer-container {
    padding: 32px 16px 16px;
  }
  
  .footer-main {
    grid-template-columns: 1fr;
    gap: 32px;
  }
  
  .footer-bottom {
    flex-direction: column;
    text-align: center;
  }
}
</style>
