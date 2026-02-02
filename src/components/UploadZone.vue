<template>
  <div class="tool-card">
    <!-- 上传区域 -->
    <div
      class="upload-zone"
      :class="{ 'is-dragging': isDragging, 'has-images': uploadedImages.length > 0 }"
      @drop.prevent="handleDrop"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @click="triggerFileInput"
    >
      <input
        ref="fileInputRef"
        type="file"
        accept=".png,.jpg,.jpeg"
        multiple
        style="display: none"
        @change="handleFileSelect"
      />
      
      <!-- 有预览图 -->
      <div v-if="uploadedImages.length > 0" class="preview-grid">
        <div
          v-for="(img, index) in uploadedImages"
          :key="index"
          class="preview-item"
        >
          <img :src="img.dataUrl" alt="预览" class="preview-img" />
          <div class="preview-badge">{{ index + 1 }}</div>
          <el-button
            class="remove-btn"
            circle
            size="small"
            type="danger"
            @click.stop="removeImage(index)"
          >
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
        
        <!-- 添加更多按钮 -->
        <div
          v-if="uploadedImages.length < 3"
          class="add-more"
          @click.stop="triggerFileInput"
        >
          <el-icon :size="32" color="#FF2442">
            <Plus />
          </el-icon>
          <p>添加图片</p>
          <p class="hint">{{ uploadedImages.length }}/3</p>
        </div>
      </div>
      
      <!-- 无预览图 -->
      <div v-else class="upload-placeholder">
        <el-icon :size="64" color="#FF2442">
          <Upload />
        </el-icon>
        <p class="upload-text">上传 1-3 张小红书主页截图</p>
        <p class="upload-hint">
          <el-icon><InfoFilled /></el-icon>
          第一张必须包含主页信息（账号名、粉丝数、笔记数）
        </p>
        <p class="upload-hint">其他图片可以是笔记列表，帮助分析内容风格</p>
        <p class="upload-hint-small">支持 PNG、JPG、JPEG 格式，单张不超过 10MB</p>
      </div>
    </div>

    <!-- 进度条 -->
    <div v-if="isUploading" class="progress-section">
      <el-progress :percentage="uploadProgress" :stroke-width="8" />
      <p class="progress-tip">{{ progressText }}</p>
    </div>

    <!-- 错误提示 -->
    <el-alert
      v-if="error"
      :title="error"
      type="error"
      :closable="true"
      @close="error = null"
      show-icon
    />

    <!-- 开始按钮 -->
    <el-button
      v-if="uploadedImages.length > 0 && !isUploading"
      type="primary"
      size="large"
      class="start-button"
      @click="handleStartAnalysis"
    >
      开始 AI 分析（{{ uploadedImages.length }} 张图片）
    </el-button>

    <!-- 底部提示 -->
    <div class="bottom-tips">
      <div class="tip-item">
        <el-icon color="#67C23A"><CircleCheck /></el-icon>
        <span>AI 智能识别</span>
      </div>
      <div class="tip-item">
        <el-icon color="#67C23A"><CircleCheck /></el-icon>
        <span>12 章节指南</span>
      </div>
      <div class="tip-item">
        <el-icon color="#67C23A"><CircleCheck /></el-icon>
        <span>一键导出</span>
      </div>
      <div class="tip-item">
        <el-icon color="#FF2442"><Lock /></el-icon>
        <span>数据不存储</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Upload, Lock, CircleCheck, Close, Plus, InfoFilled } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { analyticsService } from '@/services/analyticsService';

const router = useRouter();

interface UploadedImage {
  file: File;
  dataUrl: string;
}

const isDragging = ref(false);
const isUploading = ref(false);
const uploadProgress = ref(0);
const uploadedImages = ref<UploadedImage[]>([]);
const error = ref<string | null>(null);
const fileInputRef = ref<HTMLInputElement>();

const progressText = computed(() => {
  if (uploadProgress.value < 30) return '正在读取图片...';
  if (uploadProgress.value < 70) return '正在压缩处理...';
  return '即将完成...';
});

const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  if (files && files.length > 0) {
    processFiles(Array.from(files));
  }
  target.value = '';
};

const handleDrop = (event: DragEvent) => {
  isDragging.value = false;
  const files = event.dataTransfer?.files;
  if (files && files.length > 0) {
    processFiles(Array.from(files));
  }
};

const handleDragOver = () => {
  isDragging.value = true;
};

const handleDragLeave = () => {
  isDragging.value = false;
};

const processFiles = async (files: File[]) => {
  error.value = null;

  const remainingSlots = 3 - uploadedImages.value.length;
  if (files.length > remainingSlots) {
    error.value = `最多只能上传 3 张图片，当前还可以上传 ${remainingSlots} 张`;
    return;
  }

  try {
    const { validateFile } = await import('@/utils/fileValidator');
    const { compressImage } = await import('@/utils/imageProcessor');
    
    isUploading.value = true;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      uploadProgress.value = Math.floor(((i + 0.5) / files.length) * 100);
      
      const validation = validateFile(file);
      if (!validation.valid) {
        error.value = `${file.name}: ${validation.error || '文件验证失败'}`;
        continue;
      }
      
      const compressed = await compressImage(file, 1920, 1920, 0.85);
      
      uploadedImages.value.push({
        file,
        dataUrl: compressed.dataUrl
      });
    }
    
    uploadProgress.value = 100;
    
    setTimeout(() => {
      isUploading.value = false;
      uploadProgress.value = 0;
    }, 500);
    
  } catch (err) {
    error.value = err instanceof Error ? err.message : '处理失败，请重试';
    isUploading.value = false;
    uploadProgress.value = 0;
  }
};

const removeImage = (index: number) => {
  uploadedImages.value.splice(index, 1);
};

const handleStartAnalysis = async () => {
  if (uploadedImages.value.length === 0) return;

  analyticsService.trackUpload(uploadedImages.value.length);
  analyticsService.trackFunnelStep('upload_complete', 1);

  const { useAppStore } = await import('@/stores/appStore');
  const store = useAppStore();
  
  store.setUploadedImages(uploadedImages.value.map(img => ({
    dataUrl: img.dataUrl,
    file: img.file
  })));
  
  router.push('/analysis');
};
</script>

<style scoped>
/* 工具卡片 */
.tool-card {
  background: var(--bg-primary);
  border-radius: var(--radius-2xl);  /* 24px */
  padding: var(--spacing-12);  /* 48px */
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-light);
}

/* 上传区域 */
.upload-zone {
  border: 3px dashed var(--border-medium);
  border-radius: var(--radius-xl);  /* 20px */
  padding: 64px 40px;
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-slow);
  background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--color-primary-50) 100%);
  margin-bottom: var(--spacing-8);  /* 32px */
  position: relative;
  overflow: hidden;
}

.upload-zone::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%);
  opacity: 0;
  transition: opacity var(--transition-slow);
}

.upload-zone:hover {
  border-color: var(--color-primary-500);
  background: linear-gradient(135deg, var(--color-primary-50) 0%, var(--color-secondary-50) 100%);
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(102, 126, 234, 0.15);
}

.upload-zone:hover::before {
  opacity: 1;
}

.upload-zone.is-dragging {
  border-color: var(--color-primary-500);
  background: linear-gradient(135deg, var(--color-primary-100) 0%, var(--color-secondary-100) 100%);
  transform: scale(1.02);
  box-shadow: 0 16px 48px rgba(102, 126, 234, 0.2);
}

.upload-zone.has-images {
  padding: var(--spacing-6);  /* 24px */
  border: 3px solid var(--color-primary-500);
  background: linear-gradient(135deg, var(--color-primary-50) 0%, var(--color-secondary-50) 100%);
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.preview-item {
  position: relative;
  border-radius: var(--radius-md);  /* 12px */
  overflow: hidden;
  border: 2px solid var(--border-light);
  aspect-ratio: 9/16;
  background: var(--bg-secondary);
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.preview-badge {
  position: absolute;
  top: var(--spacing-2);  /* 8px */
  left: var(--spacing-2);
  background: var(--color-primary-500);
  color: var(--text-inverse);
  width: 28px;
  height: 28px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-bold);  /* 700 */
  font-size: var(--font-sm);  /* 14px */
  box-shadow: var(--shadow-sm);
}

.remove-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  opacity: 0;
  transition: opacity 0.2s;
}

.preview-item:hover .remove-btn {
  opacity: 1;
}

.add-more {
  border: 2px dashed var(--color-primary-400);
  border-radius: var(--radius-md);  /* 12px */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  background: var(--bg-primary);
  aspect-ratio: 9/16;
}

.add-more:hover {
  background: var(--color-primary-50);
  border-color: var(--color-primary-500);
}

.add-more p {
  margin: var(--spacing-2) 0 0 0;  /* 8px */
  color: var(--color-primary-500);
  font-size: var(--font-sm);  /* 14px */
}

.add-more .hint {
  color: var(--text-tertiary);
  font-size: var(--font-xs);  /* 12px */
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
}

.upload-text {
  font-size: var(--font-lg);  /* 18px */
  color: var(--text-primary);
  margin: 0;
  font-weight: var(--font-medium);  /* 500 */
}

.upload-hint {
  font-size: var(--font-sm);  /* 14px */
  color: var(--text-secondary);
  margin: var(--spacing-2) 0;  /* 8px */
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);  /* 8px */
  text-align: center;
}

.upload-hint-small {
  font-size: var(--font-xs);  /* 12px */
  color: var(--text-tertiary);
  margin: var(--spacing-1) 0 0 0;  /* 4px */
  text-align: center;
}

/* 进度 */
.progress-section {
  margin-bottom: 24px;
}

.progress-tip {
  text-align: center;
  margin-top: var(--spacing-2);  /* 8px */
  color: var(--text-secondary);
  font-size: var(--font-sm);  /* 14px */
}

/* 开始按钮 */
.start-button {
  width: 100%;
  height: 56px;
  font-size: var(--font-lg);  /* 18px */
  font-weight: var(--font-bold);  /* 700 */
  margin-bottom: var(--spacing-8);  /* 32px */
  border-radius: var(--radius-lg);  /* 16px */
  background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-secondary-500) 100%);
  border: none;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
  transition: all var(--transition-slow);
}

.start-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(102, 126, 234, 0.4);
}

.start-button:active {
  transform: translateY(0);
}

/* 底部提示 */
.bottom-tips {
  display: flex;
  justify-content: center;
  gap: var(--spacing-6);  /* 24px */
  flex-wrap: wrap;
  padding-top: var(--spacing-6);
  border-top: 1px solid var(--border-light);
}

.tip-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);  /* 8px */
  color: var(--text-secondary);
  font-size: var(--font-sm);  /* 14px */
}

@media (max-width: 768px) {
  .tool-card {
    padding: 24px;
  }

  .upload-zone {
    padding: 40px 20px;
  }

  .bottom-tips {
    gap: 16px;
  }
}
</style>
