// 文件上传配置
export const FILE_CONFIG = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/png', 'image/jpeg', 'image/jpg'],
  ALLOWED_EXTENSIONS: ['.png', '.jpg', '.jpeg']
} as const

// 错误消息
export const ERROR_MESSAGES = {
  INVALID_FILE_TYPE: '请上传PNG、JPG或JPEG格式的图片',
  FILE_TOO_LARGE: '文件大小不能超过10MB',
  UPLOAD_FAILED: '上传失败，请重试',
  ANALYSIS_FAILED: 'AI分析失败，请重试或手动输入',
  GENERATION_FAILED: '指南生成失败，请重试',
  EXPORT_FAILED: 'PDF导出失败，请重试',
  NETWORK_ERROR: '网络连接失败，请检查网络',
  PROCESSING_TIMEOUT: '处理时间较长，请稍候'
} as const

// 性能配置
export const PERFORMANCE_CONFIG = {
  UPLOAD_TIMEOUT: 3000,        // 3秒
  ANALYSIS_TIMEOUT: 10000,     // 10秒
  GENERATION_TIMEOUT: 30000,   // 30秒
  RETRY_MAX_ATTEMPTS: 3,       // 最多重试3次
  RETRY_DELAY: 1000           // 重试延迟1秒
} as const

// 指南章节标题
export const SECTION_TITLES = [
  '账号诊断',
  '起号三天计划',
  '对标账号拆解',
  '内容规划',
  '爆款笔记公式',
  '冷启动技巧',
  '每日固定动作',
  '数据复盘模板',
  '避坑指南',
  '变现路径规划',
  '冲刺计划总结表',
  '立刻行动清单'
] as const

// 隐私声明
export const PRIVACY_NOTICE = '您的数据仅用于生成指南，不会被存储或分享' as const

// API 配置
export const API_CONFIG = {
  OPENAI_MODEL: 'deepseek-chat',  // DeepSeek 的视觉模型
  OPENAI_TEXT_MODEL: 'deepseek-chat',  // DeepSeek 的文本模型
  MAX_TOKENS: 4096,
  TEMPERATURE: 0.7
} as const

// 响应式断点
export const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1920
} as const

// 最小触摸目标尺寸
export const MIN_TOUCH_TARGET = 44 // 44x44 pixels
