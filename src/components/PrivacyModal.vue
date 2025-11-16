<template>
  <el-dialog
    v-model="visible"
    title="隐私政策"
    width="90%"
    :style="{ maxWidth: '700px' }"
  >
    <div class="privacy-content">
      <h2>隐私政策</h2>
      
      <p class="intro">
        欢迎使用小红书涨粉助手（以下简称"本工具"）。我们非常重视您的隐私保护和个人信息安全。
        本隐私政策将帮助您了解我们如何收集、使用、存储和保护您的信息。
      </p>

      <h3>1. 信息收集</h3>
      <p>
        <strong>1.1 您主动提供的信息</strong>
      </p>
      <ul>
        <li>您上传的小红书主页截图（仅用于 AI 分析）</li>
        <li>截图中包含的公开账号信息（账号名、粉丝数、笔记数等）</li>
      </ul>
      
      <p>
        <strong>1.2 我们不会收集的信息</strong>
      </p>
      <ul>
        <li>❌ 您的真实姓名、身份证号、手机号等个人身份信息</li>
        <li>❌ 您的小红书账号密码或登录凭证</li>
        <li>❌ 您的设备信息、IP 地址或浏览记录</li>
        <li>❌ 任何 Cookie 或追踪数据</li>
      </ul>

      <h3>2. 信息使用</h3>
      <p>
        我们收集的信息仅用于以下目的：
      </p>
      <ul>
        <li>✅ 分析您的小红书账号现状</li>
        <li>✅ 生成个性化的涨粉实操指南</li>
        <li>✅ 提供 AI 内容生成服务</li>
      </ul>
      
      <p class="highlight">
        <strong>重要承诺：</strong>我们不会将您的信息用于任何营销、广告或其他商业目的。
      </p>

      <h3>3. 信息存储与保护</h3>
      <p>
        <strong>3.1 本地处理</strong>
      </p>
      <ul>
        <li>您上传的图片在浏览器本地进行预处理</li>
        <li>生成的指南内容仅保存在您的浏览器缓存中</li>
        <li>您可以随时清除浏览器数据删除所有本地信息</li>
      </ul>

      <p>
        <strong>3.2 临时传输</strong>
      </p>
      <ul>
        <li>图片数据会通过加密连接（HTTPS）临时发送到 AI 服务</li>
        <li>AI 分析完成后，所有数据立即从服务器删除</li>
        <li>我们的服务器不会永久存储您的任何图片或账号信息</li>
      </ul>

      <p>
        <strong>3.3 安全措施</strong>
      </p>
      <ul>
        <li>🔒 全程使用 HTTPS 加密传输</li>
        <li>🔒 API 密钥通过后端代理保护，不暴露给前端</li>
        <li>🔒 采用前后端分离架构，增强安全性</li>
        <li>🔒 定期进行安全审计和更新</li>
      </ul>

      <h3>4. 第三方服务</h3>
      <p>
        本工具使用以下第三方 AI 服务：
      </p>
      <ul>
        <li><strong>DeepSeek AI</strong>：用于文本内容生成</li>
        <li><strong>Google Gemini</strong>：用于图像识别和分析</li>
      </ul>
      
      <p>
        这些服务提供商有各自的隐私政策。我们已采取措施确保：
      </p>
      <ul>
        <li>数据传输经过加密</li>
        <li>处理完成后数据不被保留</li>
        <li>符合相关数据保护法规</li>
      </ul>

      <h3>5. 数据共享</h3>
      <p class="highlight">
        <strong>我们承诺：</strong>
      </p>
      <ul>
        <li>❌ 不会出售您的任何信息</li>
        <li>❌ 不会与第三方共享您的个人数据</li>
        <li>❌ 不会将您的数据用于训练 AI 模型</li>
        <li>✅ 仅在法律要求的情况下配合执法部门</li>
      </ul>

      <h3>6. 您的权利</h3>
      <p>
        您对自己的信息拥有完全控制权：
      </p>
      <ul>
        <li><strong>访问权：</strong>您可以随时查看生成的指南内容</li>
        <li><strong>删除权：</strong>清除浏览器缓存即可删除所有本地数据</li>
        <li><strong>拒绝权：</strong>您可以随时停止使用本工具</li>
        <li><strong>知情权：</strong>您有权了解数据处理的详细信息</li>
      </ul>

      <h3>7. 未成年人保护</h3>
      <p>
        本工具面向 18 岁以上用户。如果您未满 18 岁，请在监护人同意和指导下使用。
      </p>

      <h3>8. 政策更新</h3>
      <p>
        我们可能会不定期更新本隐私政策。重大变更时，我们会在网站上显著位置通知您。
        继续使用本工具即表示您接受更新后的政策。
      </p>

      <h3>9. 联系我们</h3>
      <p>
        如果您对本隐私政策有任何疑问或建议，请通过以下方式联系我们：
      </p>
      <ul>
        <li>📧 邮箱：privacy@xiaohongshu-helper.com</li>
        <li>💬 GitHub Issues：<a href="https://github.com/xuldqi/xhs/issues" target="_blank">提交反馈</a></li>
      </ul>

      <p class="update-date">
        生效日期：2024年1月1日<br>
        最后更新：{{ new Date().toLocaleDateString('zh-CN') }}
      </p>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const visible = ref(false)

const show = () => {
  visible.value = true
}

const hide = () => {
  visible.value = false
}

defineExpose({
  show,
  hide
})
</script>

<style scoped>
.privacy-content {
  line-height: 1.8;
  color: #374151;
  max-height: 70vh;
  overflow-y: auto;
  padding-right: 10px;
}

.privacy-content h2 {
  font-size: 1.5rem;
  color: #1f2937;
  margin-bottom: 1rem;
  text-align: center;
}

.privacy-content h3 {
  font-size: 1.125rem;
  color: #1f2937;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e5e7eb;
}

.privacy-content h3:first-of-type {
  margin-top: 1rem;
}

.privacy-content p {
  margin: 0.75rem 0;
}

.privacy-content .intro {
  background: #f3f4f6;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
}

.privacy-content .highlight {
  background: #fef3c7;
  padding: 0.75rem;
  border-left: 4px solid #f59e0b;
  border-radius: 4px;
  margin: 1rem 0;
}

.privacy-content ul {
  margin: 0.75rem 0;
  padding-left: 1.5rem;
}

.privacy-content li {
  margin: 0.5rem 0;
}

.privacy-content strong {
  color: #1f2937;
  font-weight: 600;
}

.privacy-content a {
  color: #3b82f6;
  text-decoration: none;
}

.privacy-content a:hover {
  text-decoration: underline;
}

.update-date {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 2px solid #e5e7eb;
  color: #6b7280;
  font-size: 0.875rem;
  text-align: center;
}
</style>
