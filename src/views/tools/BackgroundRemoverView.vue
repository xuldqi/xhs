<template>
  <div class="background-remover-view">
    <div class="container">
      <Breadcrumb :items="breadcrumbItems" />
      
      <div class="tool-header">
        <h1 class="tool-title">图片背景移除工具</h1>
        <p class="tool-description">
          适用于纯色/近似纯色背景：自动采样角落背景色，支持阈值微调与自选背景色。所有处理在浏览器本地完成，保护隐私。
        </p>
      </div>

      <!-- 使用说明 -->
      <el-card class="usage-guide" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon><InfoFilled /></el-icon>
            <span>使用说明</span>
          </div>
        </template>
        <div class="guide-content">
          <h4>📋 使用步骤：</h4>
          <ol>
            <li><strong>选择图片</strong>：点击"选择图片"按钮，上传需要处理的图片</li>
            <li><strong>自动采样</strong>：工具会自动采样图片左上角的背景色（或点击"用左上角采样"手动采样）</li>
            <li><strong>调整阈值</strong>：通过滑块调整阈值（0-100），阈值越高去除背景越彻底，但可能误删主体边缘</li>
            <li><strong>开始抠图</strong>：点击"开始抠图"按钮，工具会在浏览器本地处理图片</li>
            <li><strong>下载结果</strong>：处理完成后，点击"下载 PNG"按钮保存透明背景的图片</li>
          </ol>
          
          <h4>💡 使用技巧：</h4>
          <ul>
            <li><strong>适用场景</strong>：纯色背景、近似纯色背景的图片效果最好</li>
            <li><strong>阈值调整</strong>：如果主体边缘被误删，降低阈值；如果背景去除不彻底，提高阈值</li>
            <li><strong>背景色选择</strong>：可以手动选择背景色，或使用左上角采样功能</li>
            <li><strong>隐私保护</strong>：所有处理都在浏览器本地完成，图片不会上传到服务器</li>
          </ul>
          
          <h4>⚠️ 注意事项：</h4>
          <ul>
            <li>复杂背景（如风景、渐变等）效果可能不理想</li>
            <li>建议使用背景色单一、主体与背景对比明显的图片</li>
            <li>处理大图片可能需要较长时间，请耐心等待</li>
          </ul>
        </div>
      </el-card>

      <div class="tool-content">
        <div class="control-panel">
          <el-card>
            <template #header>
              <span>图片处理</span>
            </template>
            
            <div class="controls">
              <div class="control-item">
                <label>选择图片：</label>
                <el-upload
                  :auto-upload="false"
                  :show-file-list="false"
                  :on-change="handleFileChange"
                  accept="image/*"
                >
                  <el-button type="primary" :icon="Upload">选择图片</el-button>
                </el-upload>
              </div>

              <div class="control-item">
                <label>阈值（0-100）：<span class="threshold-value">{{ threshold }}</span></label>
                <el-slider
                  v-model="threshold"
                  :min="0"
                  :max="100"
                  :step="1"
                  show-input
                />
                <p class="hint">阈值越高，去除背景越彻底，但可能误删主体边缘</p>
              </div>

              <div class="control-item">
                <label>背景色（可选）：</label>
                <div class="color-picker-row">
                  <el-color-picker v-model="bgColor" />
                  <el-button @click="sampleTopLeft" :disabled="!hasImage">
                    用左上角采样
                  </el-button>
                </div>
              </div>

              <div class="control-item">
                <el-button
                  type="primary"
                  :icon="MagicStick"
                  @click="processImage"
                  :disabled="!hasImage"
                  :loading="processing"
                >
                  开始抠图
                </el-button>
                <el-button
                  type="success"
                  :icon="Download"
                  @click="downloadImage"
                  :disabled="!processed"
                >
                  下载 PNG
                </el-button>
              </div>
            </div>
          </el-card>
        </div>

        <div class="preview-panel">
          <el-card>
            <template #header>
              <span>预览</span>
            </template>
            <div class="canvas-container">
              <canvas
                ref="canvasRef"
                :width="canvasWidth"
                :height="canvasHeight"
                class="preview-canvas"
              ></canvas>
              <div v-if="!hasImage" class="empty-state">
                <el-empty description="请先选择图片" />
              </div>
            </div>
          </el-card>
        </div>
      </div>

      <div class="tips">
        <el-alert
          title="使用提示"
          type="info"
          :closable="false"
        >
          <ul>
            <li>适用于纯色或近似纯色背景的图片</li>
            <li>若背景不完全纯色，可提高阈值</li>
            <li>阈值过高可能误删主体边缘，建议微调至清晰且自然的效果</li>
            <li>所有处理在浏览器本地完成，图片不会上传到服务器</li>
          </ul>
        </el-alert>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Upload, MagicStick, Download, InfoFilled } from '@element-plus/icons-vue'
import Breadcrumb from '@/components/Breadcrumb.vue'
import { analytics } from '@/utils/analytics'

const breadcrumbItems = computed(() => [
  { label: '首页', path: '/' },
  { label: '工具箱', path: '/tools' },
  { label: '图片背景移除', path: '' }
])

const canvasRef = ref<HTMLCanvasElement | null>(null)
const threshold = ref(30)
const bgColor = ref('#ffffff')
const hasImage = ref(false)
const processed = ref(false)
const processing = ref(false)
const canvasWidth = ref(0)
const canvasHeight = ref(0)

let imgBitmap: ImageBitmap | null = null
let sampledBg: { r: number; g: number; b: number } | null = null

const handleFileChange = async (file: any) => {
  const fileObj = file.raw || file
  if (!fileObj) return

  try {
    imgBitmap = await createImageBitmap(fileObj)
    const canvas = canvasRef.value
    if (!canvas || !imgBitmap) return

    canvas.width = imgBitmap.width
    canvas.height = imgBitmap.height
    canvasWidth.value = imgBitmap.width
    canvasHeight.value = imgBitmap.height

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(imgBitmap, 0, 0)
    
    // 自动采样左上角背景色
    sampledBg = samplePixel(ctx, 0, 0)
    const hex = rgbToHex(sampledBg.r, sampledBg.g, sampledBg.b)
    bgColor.value = hex
    
    hasImage.value = true
    processed.value = false

    analytics.track('bg_remover_upload', {
      imageSize: fileObj.size,
      imageType: fileObj.type
    })
  } catch (error) {
    console.error('Failed to load image:', error)
  }
}

const sampleTopLeft = () => {
  const canvas = canvasRef.value
  if (!canvas || !imgBitmap) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  sampledBg = samplePixel(ctx, 0, 0)
  bgColor.value = rgbToHex(sampledBg.r, sampledBg.g, sampledBg.b)
}

const processImage = () => {
  const canvas = canvasRef.value
  if (!canvas || !imgBitmap) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  processing.value = true

  // 确定背景色
  let targetBg = sampledBg
  if (bgColor.value) {
    targetBg = hexToRgb(bgColor.value)
  }

  if (!targetBg) {
    processing.value = false
    return
  }

  setTimeout(() => {
    removeBackground(ctx, targetBg, threshold.value)
    processed.value = true
    processing.value = false

    analytics.track('bg_remover_process', {
      threshold: threshold.value
    })
  }, 100)
}

const downloadImage = () => {
  const canvas = canvasRef.value
  if (!canvas) return

  const url = canvas.toDataURL('image/png')
  const a = document.createElement('a')
  a.href = url
  a.download = 'removed-bg.png'
  document.body.appendChild(a)
  a.click()
  a.remove()

  analytics.track('bg_remover_download')
}

function samplePixel(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const imageData = ctx.getImageData(x, y, 1, 1).data
  return { r: imageData[0], g: imageData[1], b: imageData[2] }
}

function rgbDistance(p: { r: number; g: number; b: number }, q: { r: number; g: number; b: number }) {
  const dr = p.r - q.r
  const dg = p.g - q.g
  const db = p.b - q.b
  return Math.sqrt(dr * dr + dg * dg + db * db)
}

function removeBackground(ctx: CanvasRenderingContext2D, bg: { r: number; g: number; b: number }, thresholdValue: number) {
  const w = ctx.canvas.width
  const h = ctx.canvas.height
  const imageData = ctx.getImageData(0, 0, w, h)
  const data = imageData.data

  // 将 0-100 阈值映射到颜色距离
  const maxDist = Math.sqrt(255 * 255 * 3)
  const thrDist = (thresholdValue / 100) * maxDist

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const d = rgbDistance({ r, g, b }, bg)
    if (d <= thrDist) {
      data[i + 3] = 0 // 透明
    }
  }

  ctx.putImageData(imageData, 0, 0)
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => n.toString(16).padStart(2, '0')
  return '#' + toHex(r) + toHex(g) + toHex(b)
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  return { r, g, b }
}

onMounted(() => {
  analytics.track('bg_remover_view')
})
</script>

<style scoped>
.background-remover-view {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 24px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.tool-header {
  text-align: center;
  margin-bottom: 32px;
}

.tool-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 12px 0;
}

.tool-description {
  font-size: 1.125rem;
  color: #6b7280;
  max-width: 800px;
  margin: 0 auto;
}

.usage-guide {
  margin-bottom: 24px;
  border: 1px solid #e5e7eb;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.guide-content {
  line-height: 1.8;
}

.guide-content h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 16px 0 8px 0;
}

.guide-content h4:first-child {
  margin-top: 0;
}

.guide-content ol,
.guide-content ul {
  margin: 8px 0;
  padding-left: 24px;
}

.guide-content li {
  margin-bottom: 6px;
}
  margin: 0 auto;
}

.tool-content {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

.control-panel {
  position: sticky;
  top: 24px;
  height: fit-content;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.control-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-item label {
  font-weight: 500;
  color: #374151;
}

.threshold-value {
  color: #667eea;
  font-weight: 600;
}

.hint {
  font-size: 0.875rem;
  color: #9ca3af;
  margin: 0;
}

.color-picker-row {
  display: flex;
  gap: 12px;
  align-items: center;
}

.preview-panel {
  min-height: 500px;
}

.canvas-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 500px;
  background: #fff;
  border-radius: 8px;
}

.preview-canvas {
  max-width: 100%;
  max-height: 600px;
  border: 1px dashed #e5e7eb;
  border-radius: 6px;
  background-image: 
    linear-gradient(45deg, #f3f4f6 25%, transparent 25%),
    linear-gradient(-45deg, #f3f4f6 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #f3f4f6 75%),
    linear-gradient(-45deg, transparent 75%, #f3f4f6 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
}

.empty-state {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.tips {
  max-width: 800px;
  margin: 0 auto;
}

.tips ul {
  margin: 12px 0 0 0;
  padding-left: 20px;
}

.tips li {
  margin-bottom: 8px;
  color: #6b7280;
}

@media (max-width: 1024px) {
  .tool-content {
    grid-template-columns: 1fr;
  }

  .control-panel {
    position: static;
  }
}
</style>


