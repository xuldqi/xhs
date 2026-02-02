<template>
  <div class="about-view">
    <div class="container">
      <div class="about-header">
        <h1>关于我们</h1>
        <p class="subtitle">专业的小红书涨粉解决方案</p>
      </div>

      <!-- 平台定位声明 -->
      <div class="platform-notice">
        <div class="notice-icon">
          <el-icon><InfoFilled /></el-icon>
        </div>
        <div class="notice-content">
          <h3>平台定位</h3>
          <p>
            <strong>小红书流量学院</strong>是一个独立开发的第三方学习平台，<strong>非小红书官方平台</strong>。
            我们致力于为小红书运营者、内容创作者和爱好者提供一个专业的学习交流社区，
            帮助大家更好地理解平台规则、提升运营技能、实现内容增长。
          </p>
        </div>
      </div>

      <div class="content-section">
        <h2>关于小红书流量学院</h2>
        <p>
          小红书流量学院是一款基于人工智能技术的小红书运营学习平台，专为小红书博主和内容创作者设计。
          我们提供涨粉指南生成器、知识库、案例库、情报局等多种工具和内容，
          帮助运营者系统地学习小红书运营知识，制定科学的涨粉策略。
        </p>
        <p>
          我们的平台特别适合 0-1000 粉丝阶段的新手博主，帮助您快速度过冷启动期，实现粉丝增长。
          无论您是美妆博主、穿搭达人、美食分享者、旅行记录者还是知识分享者，都能在这里找到适合自己的学习路径。
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
        <h2>为什么选择小红书流量学院</h2>
        <ul class="advantage-list">
          <li><strong>系统化学习：</strong>从新手入门到高级运营，完整的知识体系</li>
          <li><strong>AI 驱动：</strong>使用最新的人工智能技术进行分析和指导</li>
          <li><strong>真实案例：</strong>中腰部账号的真实涨粉案例拆解</li>
          <li><strong>实操性强：</strong>提供可下载的 SOP、模板和工具</li>
          <li><strong>数据安全：</strong>不存储任何用户数据，保护隐私</li>
          <li><strong>持续更新：</strong>情报局实时追踪平台最新动态</li>
          <li><strong>社区驱动：</strong>爱好者和从业者的交流社区</li>
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
          本平台由独立开发者开发和运营。所有内容、设计、代码均受版权保护。
          未经授权，不得复制、修改、传播或用于商业用途。
        </p>
        <p class="disclaimer-note">
          <strong>免责声明：</strong>本平台为第三方学习工具，与小红书官方无任何关联。
          平台提供的所有内容仅供学习参考，不构成任何运营建议。
          用户应遵守小红书平台规则，自行承担运营风险。
        </p>
        <p class="copyright-text">
          © {{ currentYear }} 小红书流量学院. All rights reserved.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { InfoFilled } from '@element-plus/icons-vue'
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

.platform-notice {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 48px;
  display: flex;
  gap: 20px;
  align-items: flex-start;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.2);
}

.notice-icon {
  font-size: 32px;
  color: white;
  flex-shrink: 0;
}

.notice-content h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: white;
  margin: 0 0 12px 0;
}

.notice-content p {
  font-size: 1rem;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.95);
  margin: 0;
}

.notice-content strong {
  color: white;
  font-weight: 600;
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
  color: #FF2442;
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

.disclaimer-note {
  background: #FEF3C7;
  border-left: 4px solid #F59E0B;
  padding: 16px 20px;
  border-radius: 8px;
  margin: 24px 0;
  color: #92400E;
  font-size: 0.9375rem;
  line-height: 1.6;
}

.disclaimer-note strong {
  color: #78350F;
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

  .platform-notice {
    padding: 24px;
    flex-direction: column;
    gap: 16px;
  }

  .notice-icon {
    font-size: 28px;
  }

  .notice-content h3 {
    font-size: 1.25rem;
  }
}
</style>
