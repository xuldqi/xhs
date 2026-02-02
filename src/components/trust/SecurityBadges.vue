<template>
  <div class="security-badges">
    <div class="badge-item">
      <el-icon><Lock /></el-icon>
      <div class="badge-content">
        <div class="badge-title">数据安全</div>
        <div class="badge-desc">HTTPS加密传输</div>
      </div>
    </div>
    <div class="badge-item">
      <el-icon><CircleCheck /></el-icon>
      <div class="badge-content">
        <div class="badge-title">隐私保护</div>
        <div class="badge-desc">本地处理，不存储</div>
      </div>
    </div>
    <div class="badge-item">
      <el-icon><Lock /></el-icon>
      <div class="badge-content">
        <div class="badge-title">安全可靠</div>
        <div class="badge-desc">独立开发运营</div>
      </div>
    </div>
    <div class="badge-item">
      <el-icon><Clock /></el-icon>
      <div class="badge-content">
        <div class="badge-title">24小时响应</div>
        <div class="badge-desc">快速客服支持</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Lock, CircleCheck, Clock } from '@element-plus/icons-vue'
</script>

<style scoped>
.security-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
}

.badge-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  min-width: 140px;
}

.badge-item .el-icon {
  font-size: 20px;
  color: #0284c7;
  flex-shrink: 0;
}

.badge-content {
  flex: 1;
}

.badge-title {
  font-size: 14px;
  font-weight: 600;
  color: #0c4a6e;
  margin-bottom: 2px;
}

.badge-desc {
  font-size: 12px;
  color: #075985;
}

@media (max-width: 768px) {
  .security-badges {
    flex-direction: column;
  }
  
  .badge-item {
    width: 100%;
  }
}
</style>

