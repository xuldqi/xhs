<template>
  <div class="about-view">
    <AppHeader />
    
    <div class="container">
      <div class="about-header">
        <h1>关于我们</h1>
        <p class="subtitle">专业的小红书涨粉解决方案</p>
      </div>

      <div class="content-section">
        <h2>🎯 产品介绍</h2>
        <p>
          小红书涨粉实操指南生成器是一款基于 AI 技术的智能工具，专为小红书运营者打造。
          通过上传主页截图，AI 自动分析账号数据，生成包含 12 个核心章节的完整涨粉方案。
        </p>
        <p>
          我们的目标是帮助每一位小红书运营者快速找到涨粉方向，节省时间，提高效率。
        </p>
      </div>

      <div class="content-section">
        <h2>✨ 核心优势</h2>
        <ul class="advantage-list">
          <li>
            <strong>AI 智能分析：</strong>
            使用先进的 DeepSeek AI 技术，自动识别账号信息，准确率高达 95%
          </li>
          <li>
            <strong>专业内容：</strong>
            基于 1000+ 成功案例总结，涵盖账号诊断、内容规划、爆款公式等 12 个核心模块
          </li>
          <li>
            <strong>快速生成：</strong>
            30-60 秒即可生成完整指南，大幅节省时间成本
          </li>
          <li>
            <strong>数据安全：</strong>
            图片仅用于分析，不存储任何个人信息，保护用户隐私
          </li>
          <li>
            <strong>持续更新：</strong>
            根据小红书平台规则变化，持续优化内容模板
          </li>
        </ul>
      </div>

      <div class="content-section">
        <h2>📊 适用人群</h2>
        <div class="audience-grid">
          <div class="audience-card">
            <h3>新手博主</h3>
            <p>刚开始做小红书，不知道如何涨粉，需要系统的指导方案</p>
          </div>
          <div class="audience-card">
            <h3>兼职运营</h3>
            <p>有正职工作，时间有限，需要高效的运营方法</p>
          </div>
          <div class="audience-card">
            <h3>MCN 机构</h3>
            <p>管理多个账号，需要标准化的诊断和运营工具</p>
          </div>
          <div class="audience-card">
            <h3>知识博主</h3>
            <p>教别人做小红书，需要专业工具辅助教学</p>
          </div>
        </div>
      </div>

      <div class="content-section">
        <h2>🔧 技术架构</h2>
        <p>
          我们采用前后端分离的现代化架构，确保系统的稳定性和安全性：
        </p>
        <ul>
          <li><strong>前端：</strong>Vue 3 + TypeScript + Element Plus</li>
          <li><strong>后端：</strong>Node.js + Express</li>
          <li><strong>AI 服务：</strong>DeepSeek API</li>
          <li><strong>部署：</strong>Vercel + Railway</li>
        </ul>
      </div>

      <div class="content-section">
        <h2>📞 联系我们</h2>
        <div class="contact-info">
          <p><strong>联系邮箱：</strong>novemeber11@gmail.com</p>
          <p><strong>工作时间：</strong>周一至周五 9:00-18:00</p>
        </div>
        <p class="contact-note">
          如有任何问题或建议，欢迎随时联系我们。我们会在 24 小时内回复您的邮件。
        </p>
      </div>

      <div class="content-section">
        <h2>🎖️ 版权声明</h2>
        <p>
          本工具由 [您的公司/个人名称] 开发和运营。所有内容、设计、代码均受版权保护。
          未经授权，不得复制、修改、传播或用于商业用途。
        </p>
        <p class="copyright-text">
          © {{ currentYear }} 小红书涨粉助手. All rights reserved.
        </p>
      </div>
    </div>
    
    <AppFooter @show-privacy="$router.push('/privacy')" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped>
.about-view {
  min-height: 100vh;
  background: white;
  display: flex;
  flex-direction: column;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 60px 20px;
  flex: 1;
}

.about-header {
  text-align: center;
  margin-bottom: 60px;
}

.about-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 16px 0;
}

.subtitle {
  font-size: 1.25rem;
  color: #6b7280;
  margin: 0;
}

.content-section {
  margin-bottom: 48px;
}

.content-section h2 {
  font-size: 1.75rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 24px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #e5e7eb;
}

.content-section p {
  font-size: 1rem;
  line-height: 1.8;
  color: #374151;
  margin: 0 0 16px 0;
}

.content-section ul {
  margin: 16px 0;
  padding-left: 24px;
}

.content-section li {
  font-size: 1rem;
  line-height: 1.8;
  color: #374151;
  margin: 12px 0;
}

.advantage-list li strong {
  color: #409EFF;
}

.audience-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 24px;
}

.audience-card {
  background: #f9fafb;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
}

.audience-card h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 12px 0;
}

.audience-card p {
  font-size: 0.9375rem;
  color: #6b7280;
  line-height: 1.6;
  margin: 0;
}

.contact-info {
  background: #f9fafb;
  border-radius: 12px;
  padding: 24px;
  margin: 24px 0;
}

.contact-info p {
  margin: 8px 0;
}

.contact-note {
  color: #6b7280;
  font-size: 0.9375rem;
}

.copyright-text {
  text-align: center;
  color: #9ca3af;
  font-size: 0.875rem;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

@media (max-width: 768px) {
  .container {
    padding: 40px 16px;
  }

  .about-header h1 {
    font-size: 2rem;
  }

  .subtitle {
    font-size: 1.125rem;
  }

  .content-section h2 {
    font-size: 1.5rem;
  }

  .audience-grid {
    grid-template-columns: 1fr;
  }
}
</style>
