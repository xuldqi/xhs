<template>
  <div class="manga-generator-view">
    <div class="container">
      <Breadcrumb :items="breadcrumbItems" />
      
      <div class="tool-header">
        <h1 class="tool-title">漫画风生成器</h1>
        <p class="tool-description">
          上传图片，一键生成漫画风效果：边缘描线、阈值、色调分级、网点（Halftone），并导出成图。
        </p>
      </div>

      <div class="tool-content">
        <div class="control-panel">
          <el-card>
            <template #header>
              <span>效果设置</span>
            </template>
            
            <div class="controls">
              <div class="control-item">
                <label>上传图片：</label>
                <el-upload
                  :auto-upload="false"
                  :show-file-list="false"
                  :on-change="handleFileChange"
                  accept="image/*"
                >
                  <el-button type="primary" :icon="Upload">选择图片</el-button>
                </el-upload>
                <p class="hint">支持 JPG / PNG / WebP</p>
              </div>

              <el-divider />

              <div class="control-item">
                <h3>基础滤镜</h3>
                <el-checkbox v-model="enableEdges">边缘描线（Sobel）</el-checkbox>
                <el-checkbox v-model="enableHalftone">网点（Halftone）</el-checkbox>
              </div>

              <div class="control-item">
                <label>阈值（黑白）：<span class="value">{{ threshold }}</span></label>
                <el-slider
                  v-model="threshold"
                  :min="0"
                  :max="255"
                  :step="1"
                  show-input
                />
              </div>

              <div class="control-item">
                <label>色调分级等级：<span class="value">{{ posterize }}</span></label>
                <el-slider
                  v-model="posterize"
                  :min="2"
                  :max="8"
                  :step="1"
                  show-input
                />
              </div>

              <div class="control-item">
                <label>网点单元大小：<span class="value">{{ cell }}</span></label>
                <el-slider
                  v-model="cell"
                  :min="4"
                  :max="16"
                  :step="1"
                  show-input
                />
              </div>

              <el-divider />

              <div class="control-item">
                <el-button
                  type="primary"
                  :icon="MagicStick"
                  @click="applyEffects"
                  :disabled="!hasImage"
                  :loading="processing"
                  style="width: 100%"
                >
                  应用效果
                </el-button>
                <el-button
                  @click="resetImage"
                  :disabled="!hasImage"
                  style="width: 100%; margin-top: 8px"
                >
                  重置图像
                </el-button>
                <el-button
                  type="success"
                  :icon="Download"
                  @click="downloadImage"
                  :disabled="!hasImage"
                  style="width: 100%; margin-top: 8px"
                >
                  导出图像
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
          <p>漫画风通常由"粗黑边 + 网点 + 高对比"组成。上传清晰、对比度高的照片效果更佳。</p>
        </el-alert>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Upload, MagicStick, Download } from '@element-plus/icons-vue'
import Breadcrumb from '@/components/Breadcrumb.vue'
import { analytics } from '@/utils/analytics'

const breadcrumbItems = computed(() => [
  { label: '首页', path: '/' },
  { label: '工具箱', path: '/tools' },
  { label: '漫画风生成器', path: '' }
])

const canvasRef = ref<HTMLCanvasElement | null>(null)
const enableEdges = ref(false)
const enableHalftone = ref(false)
const threshold = ref(160)
const posterize = ref(4)
const cell = ref(8)
const hasImage = ref(false)
const processing = ref(false)
const canvasWidth = ref(720)
const canvasHeight = ref(480)

let origCanvas: HTMLCanvasElement | null = null
let origCtx: CanvasRenderingContext2D | null = null

const handleFileChange = async (file: any) => {
  const fileObj = file.raw || file
  if (!fileObj) return

  try {
    const url = URL.createObjectURL(fileObj)
    const img = new Image()
    
    img.onload = () => {
      drawImageToCanvases(img)
      URL.revokeObjectURL(url)
      hasImage.value = true

      analytics.track('manga_generator_upload', {
        imageSize: fileObj.size,
        imageType: fileObj.type
      })
    }
    
    img.src = url
  } catch (error) {
    console.error('Failed to load image:', error)
  }
}

const drawImageToCanvases = (img: HTMLImageElement) => {
  const canvas = canvasRef.value
  if (!canvas) return

  const maxW = 720
  const maxH = 480
  let { width: w, height: h } = img
  const ratio = Math.min(maxW / w, maxH / h)
  const dw = Math.max(1, Math.floor(w * ratio))
  const dh = Math.max(1, Math.floor(h * ratio))

  canvas.width = dw
  canvas.height = dh
  canvasWidth.value = dw
  canvasHeight.value = dh

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // 创建原始画布
  origCanvas = document.createElement('canvas')
  origCanvas.width = dw
  origCanvas.height = dh
  origCtx = origCanvas.getContext('2d')
  if (!origCtx) return

  origCtx.drawImage(img, 0, 0, dw, dh)
  ctx.drawImage(img, 0, 0, dw, dh)
}

const resetImage = () => {
  const canvas = canvasRef.value
  if (!canvas || !origCanvas || !origCtx) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(origCanvas, 0, 0)
}

const applyEffects = () => {
  const canvas = canvasRef.value
  if (!canvas || !origCanvas || !origCtx) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  processing.value = true

  setTimeout(() => {
    const w = origCanvas!.width
    const h = origCanvas!.height
    const base = origCtx!.getImageData(0, 0, w, h)
    let imgData = new ImageData(new Uint8ClampedArray(base.data), w, h)

    // 色调分级
    imgData = posterizeEffect(imgData, posterize.value)

    // 阈值
    imgData = thresholdEffect(imgData, threshold.value)

    // 先画出阈值结果
    ctx.putImageData(imgData, 0, 0)

    // 边缘叠加
    if (enableEdges.value) {
      const edges = sobelEffect(origCtx!.getImageData(0, 0, w, h))
      const eData = edges.data
      const current = ctx.getImageData(0, 0, w, h)
      const cData = current.data

      for (let i = 0; i < eData.length; i += 4) {
        const v = eData[i]
        if (v > 40) {
          cData[i] = 0
          cData[i + 1] = 0
          cData[i + 2] = 0
          cData[i + 3] = 255
        }
      }
      ctx.putImageData(current, 0, 0)
    }

    // 网点
    if (enableHalftone.value) {
      const src = ctx.getImageData(0, 0, w, h)
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, w, h)
      halftoneDots(ctx, src, cell.value)
    }

    processing.value = false

    analytics.track('manga_generator_process', {
      edges: enableEdges.value,
      halftone: enableHalftone.value,
      threshold: threshold.value,
      posterize: posterize.value
    })
  }, 100)
}

const downloadImage = () => {
  const canvas = canvasRef.value
  if (!canvas) return

  const link = document.createElement('a')
  link.download = '漫画风图像.png'
  link.href = canvas.toDataURL('image/png')
  link.click()

  analytics.track('manga_generator_download')
}

function posterizeEffect(imageData: ImageData, levels: number): ImageData {
  const data = imageData.data
  const step = Math.floor(256 / levels)
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.floor(data[i] / step) * step + (step >> 1)
    data[i + 1] = Math.floor(data[i + 1] / step) * step + (step >> 1)
    data[i + 2] = Math.floor(data[i + 2] / step) * step + (step >> 1)
  }
  return imageData
}

function thresholdEffect(imageData: ImageData, t: number): ImageData {
  const d = imageData.data
  for (let i = 0; i < d.length; i += 4) {
    const v = d[i] * 0.2126 + d[i + 1] * 0.7152 + d[i + 2] * 0.0722
    const bw = v >= t ? 255 : 0
    d[i] = bw
    d[i + 1] = bw
    d[i + 2] = bw
    d[i + 3] = 255
  }
  return imageData
}

function sobelEffect(imageData: ImageData): ImageData {
  const w = imageData.width
  const h = imageData.height
  const src = imageData.data
  const gray = new Uint8ClampedArray(w * h)

  for (let i = 0, j = 0; i < src.length; i += 4, j++) {
    gray[j] = (src[i] * 0.2126 + src[i + 1] * 0.7152 + src[i + 2] * 0.0722) | 0
  }

  const gxK = [-1, 0, 1, -2, 0, 2, -1, 0, 1]
  const gyK = [-1, -2, -1, 0, 0, 0, 1, 2, 1]
  const out = new Uint8ClampedArray(w * h * 4)

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      let gx = 0
      let gy = 0
      let idx = 0

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const v = gray[(y + ky) * w + (x + kx)]
          gx += v * gxK[idx]
          gy += v * gyK[idx]
          idx++
        }
      }

      const g = Math.min(255, Math.hypot(gx, gy) | 0)
      const o = (y * w + x) * 4
      out[o] = g
      out[o + 1] = g
      out[o + 2] = g
      out[o + 3] = 255
    }
  }

  return new ImageData(out, w, h)
}

function halftoneDots(ctx: CanvasRenderingContext2D, srcData: ImageData, cell: number) {
  const w = srcData.width
  const h = srcData.height
  const d = srcData.data

  for (let y = 0; y < h; y += cell) {
    for (let x = 0; x < w; x += cell) {
      const cx = Math.min(w - 1, x + (cell >> 1))
      const cy = Math.min(h - 1, y + (cell >> 1))
      const i = (cy * w + cx) * 4
      const v = (d[i] * 0.2126 + d[i + 1] * 0.7152 + d[i + 2] * 0.0722) / 255
      const radius = (1 - v) * (cell / 2)

      ctx.beginPath()
      ctx.arc(cx, cy, Math.max(0.5, radius), 0, Math.PI * 2)
      ctx.fillStyle = '#000'
      ctx.fill()
    }
  }
}

onMounted(() => {
  analytics.track('manga_generator_view')
})
</script>

<style scoped>
.manga-generator-view {
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
  gap: 20px;
}

.control-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-item h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 8px 0;
}

.control-item label {
  font-weight: 500;
  color: #374151;
}

.value {
  color: #667eea;
  font-weight: 600;
}

.hint {
  font-size: 0.875rem;
  color: #9ca3af;
  margin: 0;
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
  background: #fff;
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

.tips p {
  margin: 0;
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


