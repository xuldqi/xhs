import { FILE_CONFIG, ERROR_MESSAGES } from '@/types'

/**
 * 验证文件类型和大小
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  // 验证文件类型
  if (!FILE_CONFIG.ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: ERROR_MESSAGES.INVALID_FILE_TYPE
    }
  }
  
  // 验证文件大小
  if (file.size > FILE_CONFIG.MAX_SIZE) {
    return {
      valid: false,
      error: ERROR_MESSAGES.FILE_TOO_LARGE
    }
  }
  
  return { valid: true }
}

/**
 * 检查文件扩展名
 */
export function checkFileExtension(filename: string): boolean {
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'))
  return FILE_CONFIG.ALLOWED_EXTENSIONS.includes(ext)
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * 验证图片尺寸
 */
export function validateImageDimensions(
  file: File,
  minWidth = 320,
  minHeight = 320
): Promise<{ valid: boolean; error?: string; width?: number; height?: number }> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    
    img.onload = () => {
      URL.revokeObjectURL(url)
      
      if (img.width < minWidth || img.height < minHeight) {
        resolve({
          valid: false,
          error: `图片尺寸太小，最小尺寸为 ${minWidth}x${minHeight}`,
          width: img.width,
          height: img.height
        })
      } else {
        resolve({
          valid: true,
          width: img.width,
          height: img.height
        })
      }
    }
    
    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve({
        valid: false,
        error: '无法读取图片文件'
      })
    }
    
    img.src = url
  })
}
