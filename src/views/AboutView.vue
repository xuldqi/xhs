<template>
  <div class="about-view">
    <AppHeader />
    
    <div class="container">
      <div class="about-header">
        <h1>关于我们</h1>
        <p class="subtitle">专业的小红书涨粉解决方案</p>
      </div>

      <div class="content-section">
        <h2>关于小红书涨粉助手</h2>
        <p>
          小红书涨粉助手是一款基于人工智能技术的免费小红书运营工具，专为小红书博主和内容创作者设计。
          通过上传小红书主页截图，AI 会自动分析您的账号数据，包括粉丝数、笔记数、内容类别等关键指标，
          并生成一份完整的 12 章节涨粉实操指南。
        </p>
        <p>
          我们的工具特别适合 0-1000 粉丝阶段的新手博主，帮助您快速度过冷启动期，实现粉丝增长。
          无论您是美妆博主、穿搭达人、美食分享者、旅行记录者还是知识分享者，都能获得针对性的运营建议。
        </p>
      </div>

      <div class="content-section">
        <h2>小红书涨粉的核心要素</h2>
        <p>
          成功的小红书涨粉需要关注以下几个方面：账号定位清晰、内容质量优秀、发布时间精准、
          封面设计吸引人、标题具有吸引力、标签使用恰当、互动及时有效、数据分析到位。
          我们的 AI 工具会根据您的账号现状，在这些方面给出具体的优化建议。
        </p>
      </div>

      <div class="content-section">
        <h2>为什么选择我们的小红书涨粉工具</h2>
        <ul class="advantage-list">
          <li><strong>完全免费：</strong>无需付费，无需注册，上传即用</li>
          <li><strong>AI 驱动：</strong>使用最新的人工智能技术进行分析</li>
          <li><strong>内容全面：</strong>12 个章节覆盖涨粉全流程</li>
          <li><strong>实操性强：</strong>提供具体可执行的行动清单</li>
          <li><strong>数据安全：</strong>不存储任何用户数据，保护隐私</li>
          <li><strong>持续更新：</strong>根据小红书平台规则及时更新策略</li>
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
    
    <AppFooter />
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
