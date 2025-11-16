<template>
  <el-dialog
    v-model="visible"
    title="隐私政策"
    width="90%"
    :style="{ maxWidth: '700px' }"
  >
    <div class="privacy-content">
      <h3>数据收集与使用</h3>
      <p>
        我们重视您的隐私。本工具在使用过程中：
      </p>
      <ul>
        <li>✅ 仅在浏览器本地处理您上传的图片</li>
        <li>✅ 不会在服务器存储您的图片或个人信息</li>
        <li>✅ AI 分析完成后立即删除临时数据</li>
        <li>✅ 生成的指南内容仅保存在您的浏览器中</li>
      </ul>

      <h3>第三方服务</h3>
      <p>
        本工具使用 DeepSeek AI API 进行图像分析和内容生成。在调用 API 时：
      </p>
      <ul>
        <li>图片数据会临时发送到 AI 服务进行处理</li>
        <li>处理完成后，AI 服务不会保留您的数据</li>
        <li>我们通过后端代理保护 API 密钥安全</li>
      </ul>

      <h3>数据安全</h3>
      <p>
        我们采取以下措施保护您的数据安全：
      </p>
      <ul>
        <li>使用 HTTPS 加密传输</li>
        <li>前后端分离架构，API 密钥不暴露</li>
        <li>不使用 Cookie 或追踪技术</li>
        <li>不收集任何个人身份信息</li>
      </ul>

      <h3>您的权利</h3>
      <p>
        您可以随时：
      </p>
      <ul>
        <li>清除浏览器缓存删除本地数据</li>
        <li>停止使用本工具</li>
        <li>联系我们了解数据处理详情</li>
      </ul>

      <p class="update-date">
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
}

.privacy-content h3 {
  font-size: 1.125rem;
  color: #1f2937;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

.privacy-content h3:first-child {
  margin-top: 0;
}

.privacy-content p {
  margin: 0.75rem 0;
}

.privacy-content ul {
  margin: 0.75rem 0;
  padding-left: 1.5rem;
}

.privacy-content li {
  margin: 0.5rem 0;
}

.update-date {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
  color: #6b7280;
  font-size: 0.875rem;
}
</style>
