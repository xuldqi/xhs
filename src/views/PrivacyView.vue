<template>
  <div class="privacy-page">
    <div class="privacy-container">
      <div class="privacy-header">
        <h1>隐私政策</h1>
        <p class="subtitle">Privacy Policy</p>
      </div>

      <div class="privacy-content">
        <p class="intro">
          欢迎使用小红书涨粉助手（以下简称"本工具"）。我们非常重视您的隐私保护和个人信息安全。
          本隐私政策将帮助您了解我们如何收集、使用、存储和保护您的信息。
        </p>

        <section>
          <h2>1. 信息收集</h2>
          <h3>1.1 您主动提供的信息</h3>
          <ul>
            <li>您上传的小红书主页截图（仅用于 AI 分析）</li>
            <li>截图中包含的公开账号信息（账号名、粉丝数、笔记数等）</li>
          </ul>
          
          <h3>1.2 我们不会收集的信息</h3>
          <ul>
            <li>❌ 您的真实姓名、身份证号、手机号等个人身份信息</li>
            <li>❌ 您的小红书账号密码或登录凭证</li>
            <li>❌ 您的设备信息、IP 地址或浏览记录</li>
            <li>❌ 任何 Cookie 或追踪数据</li>
          </ul>
        </section>

        <section>
          <h2>2. 信息使用</h2>
          <p>我们收集的信息仅用于以下目的：</p>
          <ul>
            <li>✅ 分析您的小红书账号现状</li>
            <li>✅ 生成个性化的涨粉实操指南</li>
            <li>✅ 提供 AI 内容生成服务</li>
          </ul>
          
          <div class="highlight">
            <strong>重要承诺：</strong>我们不会将您的信息用于任何营销、广告或其他商业目的。
          </div>
        </section>

        <section>
          <h2>3. 信息存储与保护</h2>
          <h3>3.1 本地处理</h3>
          <ul>
            <li>您上传的图片在浏览器本地进行预处理</li>
            <li>生成的指南内容仅保存在您的浏览器缓存中</li>
            <li>您可以随时清除浏览器数据删除所有本地信息</li>
          </ul>

          <h3>3.2 临时传输</h3>
          <ul>
            <li>图片数据会通过加密连接（HTTPS）临时发送到 AI 服务</li>
            <li>AI 分析完成后，所有数据立即从服务器删除</li>
            <li>我们的服务器不会永久存储您的任何图片或账号信息</li>
          </ul>

          <h3>3.3 安全措施</h3>
          <ul>
            <li>🔒 全程使用 HTTPS 加密传输</li>
            <li>🔒 API 密钥通过后端代理保护，不暴露给前端</li>
            <li>🔒 采用前后端分离架构，增强安全性</li>
            <li>🔒 定期进行安全审计和更新</li>
          </ul>
        </section>

        <section>
          <h2>4. 第三方服务</h2>
          <p>本工具使用以下第三方 AI 服务：</p>
          <ul>
            <li><strong>DeepSeek AI</strong>：用于文本内容生成</li>
            <li><strong>Google Gemini</strong>：用于图像识别和分析</li>
          </ul>
          
          <p>这些服务提供商有各自的隐私政策。我们已采取措施确保：</p>
          <ul>
            <li>数据传输经过加密</li>
            <li>处理完成后数据不被保留</li>
            <li>符合相关数据保护法规</li>
          </ul>
        </section>

        <section>
          <h2>5. 数据共享</h2>
          <div class="highlight">
            <strong>我们承诺：</strong>
          </div>
          <ul>
            <li>❌ 不会出售您的任何信息</li>
            <li>❌ 不会与第三方共享您的个人数据</li>
            <li>❌ 不会将您的数据用于训练 AI 模型</li>
            <li>✅ 仅在法律要求的情况下配合执法部门</li>
          </ul>
        </section>

        <section>
          <h2>6. 您的权利</h2>
          <p>您对自己的信息拥有完全控制权：</p>
          <ul>
            <li><strong>访问权：</strong>您可以随时查看生成的指南内容</li>
            <li><strong>删除权：</strong>清除浏览器缓存即可删除所有本地数据</li>
            <li><strong>拒绝权：</strong>您可以随时停止使用本工具</li>
            <li><strong>知情权：</strong>您有权了解数据处理的详细信息</li>
          </ul>
        </section>

        <section>
          <h2>7. 未成年人保护</h2>
          <p>
            本工具面向 18 岁以上用户。如果您未满 18 岁，请在监护人同意和指导下使用。
          </p>
        </section>

        <section>
          <h2>8. 政策更新</h2>
          <p>
            我们可能会不定期更新本隐私政策。重大变更时，我们会在网站上显著位置通知您。
            继续使用本工具即表示您接受更新后的政策。
          </p>
        </section>

        <section>
          <h2>9. 联系我们</h2>
          <p>如果您对本隐私政策有任何疑问或建议，请通过以下方式联系我们：</p>
          <ul>
            <li>📧 邮箱：novemeber11@gmail.com</li>
            <li>💬 GitHub Issues：<a href="https://github.com/xuldqi/xhs/issues" target="_blank">提交反馈</a></li>
          </ul>
        </section>

        <div class="update-info">
          <p>生效日期：2024年1月1日</p>
          <p>最后更新：{{ currentDate }}</p>
        </div>
      </div>

      <div class="back-button">
        <el-button type="primary" @click="goBack">返回首页</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const currentDate = computed(() => {
  return new Date().toLocaleDateString('zh-CN')
})

const goBack = () => {
  router.push('/')
}
</script>

<style scoped>
.privacy-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
}

.privacy-container {
  max-width: 900px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.privacy-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 60px 40px;
  text-align: center;
}

.privacy-header h1 {
  font-size: 2.5rem;
  margin: 0 0 10px 0;
  font-weight: 700;
}

.privacy-header .subtitle {
  font-size: 1.125rem;
  margin: 0;
  opacity: 0.9;
}

.privacy-content {
  padding: 60px 40px;
  line-height: 1.8;
  color: #374151;
}

.privacy-content .intro {
  background: #f3f4f6;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 40px;
  font-size: 1rem;
  border-left: 4px solid #667eea;
}

.privacy-content section {
  margin-bottom: 40px;
}

.privacy-content h2 {
  font-size: 1.5rem;
  color: #1f2937;
  margin: 0 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 3px solid #667eea;
  font-weight: 600;
}

.privacy-content h3 {
  font-size: 1.125rem;
  color: #374151;
  margin: 20px 0 12px 0;
  font-weight: 600;
}

.privacy-content p {
  margin: 12px 0;
}

.privacy-content ul {
  margin: 12px 0;
  padding-left: 24px;
}

.privacy-content li {
  margin: 8px 0;
}

.privacy-content strong {
  color: #1f2937;
  font-weight: 600;
}

.privacy-content a {
  color: #667eea;
  text-decoration: none;
  transition: color 0.2s;
}

.privacy-content a:hover {
  color: #764ba2;
  text-decoration: underline;
}

.highlight {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  padding: 16px 20px;
  border-left: 4px solid #f59e0b;
  border-radius: 8px;
  margin: 16px 0;
}

.update-info {
  margin-top: 60px;
  padding-top: 30px;
  border-top: 2px solid #e5e7eb;
  text-align: center;
  color: #6b7280;
  font-size: 0.875rem;
}

.update-info p {
  margin: 4px 0;
}

.back-button {
  padding: 40px;
  text-align: center;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

@media (max-width: 768px) {
  .privacy-page {
    padding: 20px 10px;
  }

  .privacy-header {
    padding: 40px 20px;
  }

  .privacy-header h1 {
    font-size: 1.875rem;
  }

  .privacy-content {
    padding: 40px 20px;
  }

  .privacy-content h2 {
    font-size: 1.25rem;
  }

  .back-button {
    padding: 30px 20px;
  }
}
</style>
