<template>
  <div class="terms-view">
    <div class="container">
      <div class="terms-header">
        <h1>服务条款</h1>
        <p class="subtitle">Terms of Service</p>
        <p class="update-date">最后更新：{{ currentDate }}</p>
      </div>

      <div class="terms-content">
        <section>
          <h2>1. 服务说明</h2>
          <p>
            小红书流量学院（以下简称"本平台"）是一个独立开发的第三方学习平台，为小红书运营者、内容创作者和爱好者提供运营工具、知识内容、案例分析和社区交流服务。
          </p>
          <p>
            本平台提供的服务包括但不限于：涨粉指南生成、内容创作工具、知识库、案例库、情报局、社区问答等功能。
          </p>
        </section>

        <section>
          <h2>2. 用户账户</h2>
          <h3>2.1 账户注册</h3>
          <ul>
            <li>用户需要提供有效的邮箱地址进行注册</li>
            <li>用户有责任保护账户安全，不得将账户信息泄露给第三方</li>
            <li>用户对账户下的所有活动负责</li>
          </ul>

          <h3>2.2 账户使用</h3>
          <ul>
            <li>用户不得使用本平台进行任何违法或不当行为</li>
            <li>用户不得恶意注册多个账户或使用自动化工具</li>
            <li>用户不得干扰或破坏平台正常运行</li>
          </ul>
        </section>

        <section>
          <h2>3. 服务使用规则</h2>
          <h3>3.1 内容使用</h3>
          <ul>
            <li>用户生成的内容归用户所有，但用户授予本平台使用这些内容提供服务的权利</li>
            <li>用户不得上传包含违法、侵权、色情、暴力等不当内容</li>
            <li>用户不得将本平台内容用于商业用途（除非获得授权）</li>
          </ul>

          <h3>3.2 工具使用</h3>
          <ul>
            <li>免费用户需遵守每日使用次数限制</li>
            <li>会员用户享有更多使用权限，具体以套餐说明为准</li>
            <li>用户不得使用技术手段绕过使用限制</li>
          </ul>
        </section>

        <section>
          <h2>4. 付费服务</h2>
          <h3>4.1 会员服务</h3>
          <ul>
            <li>本平台提供免费和付费会员服务</li>
            <li>付费会员服务以套餐形式提供，具体功能以页面说明为准</li>
            <li>会员服务有效期以购买时选择的套餐为准</li>
          </ul>

          <h3>4.2 支付与退款</h3>
          <ul>
            <li>支付成功后，会员服务立即生效</li>
            <li>由于是虚拟商品，一经购买不支持退款，请谨慎选择</li>
            <li>如遇特殊情况需要退款，请联系客服处理</li>
          </ul>

          <h3>4.3 服务变更</h3>
          <ul>
            <li>本平台保留修改、暂停或终止服务的权利</li>
            <li>如服务发生重大变更，将提前通知用户</li>
            <li>已付费用户的服务权益将得到保障</li>
          </ul>
        </section>

        <section>
          <h2>5. 知识产权</h2>
          <ul>
            <li>本平台的所有内容、设计、代码均受版权保护</li>
            <li>未经授权，不得复制、修改、传播或用于商业用途</li>
            <li>用户生成的内容，用户保留所有权，但授予本平台使用权</li>
          </ul>
        </section>

        <section>
          <h2>6. 免责声明</h2>
          <div class="disclaimer-box">
            <p><strong>重要提示：</strong></p>
            <ul>
              <li>本平台为第三方学习工具，与小红书官方无任何关联</li>
              <li>平台提供的所有内容仅供学习参考，不构成任何运营建议</li>
              <li>用户应遵守小红书平台规则，自行承担运营风险</li>
              <li>本平台不对用户使用服务产生的任何损失承担责任</li>
              <li>AI生成的内容仅供参考，用户需自行判断和验证</li>
            </ul>
          </div>
        </section>

        <section>
          <h2>7. 服务中断与终止</h2>
          <ul>
            <li>本平台可能因维护、升级等原因暂停服务</li>
            <li>如用户违反服务条款，本平台有权终止服务</li>
            <li>用户可随时注销账户，注销后数据将被删除</li>
          </ul>
        </section>

        <section>
          <h2>8. 隐私保护</h2>
          <p>
            本平台高度重视用户隐私保护。详细的隐私政策请查看
            <router-link to="/privacy">《隐私政策》</router-link>。
          </p>
        </section>

        <section>
          <h2>9. 条款修改</h2>
          <ul>
            <li>本平台保留修改服务条款的权利</li>
            <li>重大修改将提前30天通知用户</li>
            <li>继续使用服务视为接受修改后的条款</li>
          </ul>
        </section>

        <section>
          <h2>10. 联系我们</h2>
          <p>如对本服务条款有任何疑问，请通过以下方式联系我们：</p>
          <div class="contact-box">
            <p><strong>邮箱：</strong>novemeber11@gmail.com</p>
            <p><strong>工作时间：</strong>周一至周五 9:00-18:00</p>
          </div>
        </section>
      </div>

      <div class="terms-footer">
        <p class="copyright">
          © {{ currentYear }} 小红书流量学院. All rights reserved.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())
const currentDate = computed(() => {
  return new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})
</script>

<style scoped>
.terms-view {
  min-height: 100vh;
  background: white;
  padding: 60px 0;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px;
}

.terms-header {
  text-align: center;
  margin-bottom: 48px;
  padding-bottom: 24px;
  border-bottom: 2px solid #e5e7eb;
}

.terms-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.subtitle {
  font-size: 1rem;
  color: #6b7280;
  margin: 0 0 8px 0;
}

.update-date {
  font-size: 0.875rem;
  color: #9ca3af;
  margin: 0;
}

.terms-content {
  line-height: 1.8;
}

.terms-content section {
  margin-bottom: 40px;
}

.terms-content h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.terms-content h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin: 24px 0 12px 0;
}

.terms-content p {
  font-size: 1rem;
  color: #374151;
  margin: 0 0 16px 0;
}

.terms-content ul {
  margin: 16px 0;
  padding-left: 24px;
}

.terms-content li {
  font-size: 1rem;
  color: #374151;
  margin: 8px 0;
  line-height: 1.8;
}

.disclaimer-box {
  background: #FEF3C7;
  border-left: 4px solid #F59E0B;
  padding: 20px 24px;
  border-radius: 8px;
  margin: 24px 0;
}

.disclaimer-box p {
  font-weight: 600;
  color: #92400E;
  margin-bottom: 12px;
}

.disclaimer-box ul {
  margin: 0;
  color: #78350F;
}

.contact-box {
  background: #f9fafb;
  border-radius: 8px;
  padding: 20px;
  margin-top: 16px;
}

.contact-box p {
  margin: 8px 0;
}

.terms-footer {
  margin-top: 60px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
  text-align: center;
}

.copyright {
  font-size: 0.875rem;
  color: #9ca3af;
  margin: 0;
}

@media (max-width: 768px) {
  .terms-header h1 {
    font-size: 2rem;
  }

  .terms-content h2 {
    font-size: 1.25rem;
  }
}
</style>

