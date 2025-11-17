// 模型常量定义

/**
 * Gemini模型名称
 */
export const GEMINI_MODELS = {
  // 最新的Gemini Flash模型，用于图像分析和内容生成
  FLASH: 'gemini-2.5-flash',
  
  // 用于图像分析的模型端点
  FLASH_VISION: 'gemini-2.5-flash',
  
  // 用于文本生成的模型端点
  FLASH_TEXT: 'gemini-2.5-flash'
} as const;

/**
 * DeepSeek模型名称
 */
export const DEEPSEEK_MODELS = {
  // 主要使用的聊天模型
  CHAT: 'deepseek-chat',
  
  // 视觉模型
  VISION: 'deepseek-chat'
} as const;

/**
 * OpenAI模型名称
 */
export const OPENAI_MODELS = {
  // GPT-4视觉模型
  GPT4_VISION: 'gpt-4-vision-preview',
  
  // GPT-4文本模型
  GPT4: 'gpt-4-turbo'
} as const;