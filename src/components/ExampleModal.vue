<template>
  <el-dialog
    v-model="visible"
    title="查看示例指南"
    width="90%"
    :style="{ maxWidth: '900px' }"
    @close="handleClose"
  >
    <div class="example-content">
      <el-alert
        title="这是一个示例指南"
        type="info"
        :closable="false"
        class="example-alert"
      >
        <p>以下是基于一个虚拟账号生成的完整指南示例，帮助您了解工具的输出效果。</p>
      </el-alert>

      <div class="example-account">
        <h3>示例账号信息</h3>
        <div class="account-stats">
          <div class="stat">
            <span class="label">账号名称：</span>
            <span class="value">小红书美妆达人</span>
          </div>
          <div class="stat">
            <span class="label">当前粉丝：</span>
            <span class="value">500</span>
          </div>
          <div class="stat">
            <span class="label">发布笔记：</span>
            <span class="value">30</span>
          </div>
          <div class="stat">
            <span class="label">内容类别：</span>
            <span class="value">美妆</span>
          </div>
        </div>
      </div>

      <div class="example-chapters">
        <h3>生成的 12 个章节</h3>
        
        <div class="chapter-preview">
          <div class="chapter-number">1</div>
          <div class="chapter-content">
            <h4>账号诊断报告</h4>
            <p>根据您的账号数据分析，当前处于起号初期阶段。粉丝基础较弱，但笔记数量适中，说明有一定的内容积累...</p>
          </div>
        </div>

        <div class="chapter-preview">
          <div class="chapter-number">2</div>
          <div class="chapter-content">
            <h4>起号三天行动计划</h4>
            <p>第一天：优化个人主页，完善简介和头像；第二天：发布 3 篇高质量笔记；第三天：主动互动 50 个同类账号...</p>
          </div>
        </div>

        <div class="chapter-preview">
          <div class="chapter-number">3</div>
          <div class="chapter-content">
            <h4>对标账号拆解清单</h4>
            <p>找到 3-5 个粉丝量在 1-5 万的对标账号，从 18 个维度进行拆解：封面风格、标题公式、内容结构...</p>
          </div>
        </div>

        <div class="more-chapters">
          <p>还有 9 个章节...</p>
          <ul>
            <li>4. 内容规划与选题方向</li>
            <li>5. 爆款笔记创作公式</li>
            <li>6. 冷启动流量获取技巧</li>
            <li>7. 每日固定动作清单</li>
            <li>8. 数据复盘分析模板</li>
            <li>9. 常见问题避坑指南</li>
            <li>10. 变现路径规划建议</li>
            <li>11. 30天冲刺计划总结表</li>
            <li>12. 立刻行动清单</li>
          </ul>
        </div>
      </div>

      <div class="example-features">
        <h3>指南特色</h3>
        <div class="features-grid">
          <div class="feature-item">
            <el-icon color="#67C23A" :size="24"><CircleCheck /></el-icon>
            <span>针对性强</span>
          </div>
          <div class="feature-item">
            <el-icon color="#67C23A" :size="24"><CircleCheck /></el-icon>
            <span>实操性高</span>
          </div>
          <div class="feature-item">
            <el-icon color="#67C23A" :size="24"><CircleCheck /></el-icon>
            <span>可导出保存</span>
          </div>
          <div class="feature-item">
            <el-icon color="#67C23A" :size="24"><CircleCheck /></el-icon>
            <span>随时查看</span>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
      <el-button type="primary" @click="handleTryNow">
        立即体验
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { CircleCheck } from '@element-plus/icons-vue'

const router = useRouter()
const visible = ref(false)

const show = () => {
  visible.value = true
}

const handleClose = () => {
  visible.value = false
}

const handleTryNow = () => {
  visible.value = false
  // 滚动到上传区域
  const uploadZone = document.querySelector('.upload-zone')
  if (uploadZone) {
    uploadZone.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

defineExpose({
  show
})
</script>

<style scoped>
.example-content {
  max-height: 70vh;
  overflow-y: auto;
  padding-right: 10px;
}

.example-alert {
  margin-bottom: 24px;
}

.example-alert p {
  margin: 8px 0 0 0;
  color: #6b7280;
}

.example-account {
  background: #f9fafb;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.example-account h3 {
  font-size: 1.125rem;
  color: #1f2937;
  margin: 0 0 16px 0;
}

.account-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat .label {
  color: #6b7280;
  font-size: 0.875rem;
}

.stat .value {
  color: #1f2937;
  font-weight: 600;
}

.example-chapters {
  margin-bottom: 24px;
}

.example-chapters h3 {
  font-size: 1.125rem;
  color: #1f2937;
  margin: 0 0 16px 0;
}

.chapter-preview {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  margin-bottom: 12px;
}

.chapter-number {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.125rem;
}

.chapter-content h4 {
  font-size: 1rem;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.chapter-content p {
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.6;
  margin: 0;
}

.more-chapters {
  background: #f9fafb;
  border-radius: 8px;
  padding: 16px;
  margin-top: 12px;
}

.more-chapters p {
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 12px 0;
}

.more-chapters ul {
  margin: 0;
  padding-left: 20px;
}

.more-chapters li {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 6px 0;
}

.example-features h3 {
  font-size: 1.125rem;
  color: #1f2937;
  margin: 0 0 16px 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
}

.feature-item span {
  font-size: 0.875rem;
  color: #1f2937;
  font-weight: 500;
}

@media (max-width: 768px) {
  .account-stats {
    grid-template-columns: 1fr;
  }
  
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
