// 账号信息数据模型
export interface AccountData {
  username: string              // 账号名称
  followerCount: number         // 当前粉丝数
  postCount: number            // 发布笔记数
  contentCategory: string      // 内容类别
  contentDirection?: string    // 内容方向描述（可选）
  exampleTitles?: string       // 示例标题列表（可选）
  recentPosts: PostInfo[]      // 最近发布的笔记
  analysisDate: Date           // 分析日期
}

// 笔记信息
export interface PostInfo {
  title: string
  likes: number
  comments: number
  imageUrl: string
}

// 指南内容
export interface GuideContent {
  sections: Section[]
  metadata: GuideMetadata
}

// 指南元数据
export interface GuideMetadata {
  generatedAt: Date
  accountName: string
  targetFollowers: number
}

// 指南章节
export interface Section {
  id: number
  title: string
  content: string
  tables: Table[]
  checklists: Checklist[]
}

// 表格数据
export interface Table {
  headers: string[]
  rows: string[][]
}

// 清单项
export interface Checklist {
  id: string
  text: string
  checked: boolean
}

// 指南模板
export interface GuideTemplate {
  sections: SectionTemplate[]
}

// 章节模板
export interface SectionTemplate {
  id: number
  title: string
  promptTemplate: string       // AI生成提示词模板
  requiredData: string[]       // 需要的数据字段
  format: 'text' | 'table' | 'checklist' | 'mixed'
}

// AI 图像分析请求
export interface AIAnalysisRequest {
  image: string                // Base64编码的图片
  prompt: string              // 分析提示词
}

// AI 内容生成请求
export interface AIGenerationRequest {
  accountData: AccountData
  sectionId: number
  template: string
  context: string             // 额外上下文
}

// AI 响应
export interface AIResponse<T = any> {
  success: boolean
  data: T
  error?: string
  tokensUsed: number
}

// 错误类型枚举
export enum ErrorType {
  UPLOAD_ERROR = 'UPLOAD_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AI_SERVICE_ERROR = 'AI_SERVICE_ERROR',
  GENERATION_ERROR = 'GENERATION_ERROR',
  EXPORT_ERROR = 'EXPORT_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR'
}

// 应用错误
export interface AppError {
  type: ErrorType
  message: string
  details?: any
  timestamp: Date
}

// 上传状态
export interface UploadState {
  isDragging: boolean
  isUploading: boolean
  uploadProgress: number
  previewUrl: string | null
  error: string | null
}

// 分析状态
export interface AnalysisState {
  isAnalyzing: boolean
  accountData: AccountData | null
  isEditing: boolean
  validationErrors: string[]
}

// 生成状态
export interface GuideState {
  isGenerating: boolean
  currentSection: number
  guideContent: GuideContent | null
  generationProgress: number
}
