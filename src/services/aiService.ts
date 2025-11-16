import type { 
  AIAnalysisRequest, 
  AIGenerationRequest, 
  AIResponse, 
  AccountData 
} from '@/types'
import { API_CONFIG, PERFORMANCE_CONFIG, ERROR_MESSAGES } from '@/types'

class AIService {
  private useProxy: boolean
  private proxyUrl: string
  private apiKey: string
  private baseUrl: string
  private provider: 'openai' | 'deepseek' | 'gemini'
  
  constructor() {
    // 优先使用代理模式（生产环境）
    this.useProxy = import.meta.env.VITE_USE_PROXY !== 'false'
    this.proxyUrl = import.meta.env.VITE_PROXY_URL || '/api/ai'
    
    // 开发模式可以直接使用 API Key
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || ''
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://api.openai.com'
    
    // 根据 baseUrl 判断使用哪个提供商
    if (this.baseUrl.includes('deepseek')) {
      this.provider = 'deepseek'
    } else if (this.baseUrl.includes('generativelanguage.googleapis.com')) {
      this.provider = 'gemini'
    } else {
      this.provider = 'openai'
    }
  }
  
  /**
   * 分析图片，提取账号信息
   */
  async analyzeImage(request: AIAnalysisRequest): Promise<AIResponse<AccountData>> {
    return this.retryRequest(async () => {
      try {
        // 使用代理模式
        if (this.useProxy) {
          const response = await fetch(`${this.proxyUrl}/analyze`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              prompt: request.prompt,
              image: request.image
            })
          })
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.message || `代理请求失败: ${response.statusText}`)
          }
          
          const data = await response.json()
          const content = data.choices[0]?.message?.content
          
          if (!content) {
            throw new Error('AI 返回内容为空')
          }
          
          const accountData = JSON.parse(content) as AccountData
          
          return {
            success: true,
            data: accountData,
            tokensUsed: data.usage?.total_tokens || 0
          }
        }
        
        // 直接调用模式（开发环境）
        if (this.provider === 'gemini') {
          return await this.analyzeImageGemini(request)
        }
        
        const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: JSON.stringify({
            model: this.getVisionModel(),
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: request.prompt
                  },
                  {
                    type: 'image_url',
                    image_url: {
                      url: `data:image/jpeg;base64,${request.image}`
                    }
                  }
                ]
              }
            ],
            max_tokens: API_CONFIG.MAX_TOKENS,
            temperature: API_CONFIG.TEMPERATURE
          })
        })
        
        if (!response.ok) {
          throw new Error(`API 请求失败: ${response.statusText}`)
        }
        
        const data = await response.json()
        const content = data.choices[0]?.message?.content
        
        if (!content) {
          throw new Error('AI 返回内容为空')
        }
        
        // 解析 JSON 响应
        const accountData = JSON.parse(content) as AccountData
        
        return {
          success: true,
          data: accountData,
          tokensUsed: data.usage?.total_tokens || 0
        }
      } catch (error) {
        return {
          success: false,
          data: {} as AccountData,
          error: error instanceof Error ? error.message : ERROR_MESSAGES.ANALYSIS_FAILED,
          tokensUsed: 0
        }
      }
    })
  }
  
  /**
   * 生成指南内容
   */
  async generateContent(request: AIGenerationRequest): Promise<AIResponse<string>> {
    return this.retryRequest(async () => {
      try {
        console.log(`🤖 [章节 ${request.sectionId}] 开始生成...`)
        console.log(`📡 使用模式: ${this.useProxy ? '代理模式' : '直连模式'}`)
        
        const systemPrompt = '你是一位小红书运营专家，精通平台算法和用户心理。'
        const userPrompt = this.buildPrompt(request)
        
        // 使用代理模式
        if (this.useProxy) {
          const response = await fetch(`${this.proxyUrl}/generate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              systemPrompt,
              userPrompt
            })
          })
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.message || `代理请求失败: ${response.statusText}`)
          }
          
          const data = await response.json()
          const content = data.choices[0]?.message?.content
          
          if (!content) {
            throw new Error('AI 返回内容为空')
          }
          
          console.log(`✅ [章节 ${request.sectionId}] 生成成功，长度: ${content.length}`)
          
          return {
            success: true,
            data: content,
            tokensUsed: data.usage?.total_tokens || 0
          }
        }
        
        // 直接调用模式（开发环境）
        console.log(`🔗 API 地址: ${this.baseUrl}`)
        
        if (this.provider === 'gemini') {
          return await this.generateContentGemini(request)
        }
        
        // 构建请求体 - DeepSeek 兼容格式
        const messages: any[] = []
        
        // DeepSeek 支持 system role
        if (this.provider === 'deepseek') {
          messages.push({
            role: 'system',
            content: systemPrompt
          })
          messages.push({
            role: 'user',
            content: userPrompt
          })
        } else {
          messages.push({
            role: 'user',
            content: `${systemPrompt}\n\n${userPrompt}`
          })
        }
        
        const requestBody: any = {
          model: this.getTextModel(),
          messages: messages,
          temperature: API_CONFIG.TEMPERATURE,
          max_tokens: 2000
        }
        
        console.log(`📤 请求体:`, JSON.stringify(requestBody).substring(0, 200) + '...')
        
        const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: JSON.stringify(requestBody)
        })
        
        console.log(`📥 响应状态: ${response.status} ${response.statusText}`)
        
        if (!response.ok) {
          let errorText = ''
          let errorJson: any = null
          
          try {
            errorText = await response.text()
            errorJson = JSON.parse(errorText)
            console.error(`❌ API 错误响应 (JSON):`, errorJson)
          } catch {
            console.error(`❌ API 错误响应 (Text):`, errorText)
          }
          
          const errorMessage = errorJson?.error?.message || errorJson?.message || errorText || response.statusText
          throw new Error(`API 请求失败 (${response.status}): ${errorMessage}`)
        }
        
        const data = await response.json()
        const content = data.choices[0]?.message?.content
        
        if (!content) {
          console.error(`❌ AI 返回内容为空`, data)
          throw new Error('AI 返回内容为空')
        }
        
        console.log(`✅ [章节 ${request.sectionId}] 生成成功，长度: ${content.length}`)
        
        return {
          success: true,
          data: content,
          tokensUsed: data.usage?.total_tokens || 0
        }
      } catch (error) {
        console.error(`❌ [章节 ${request.sectionId}] 生成失败:`, error)
        return {
          success: false,
          data: '',
          error: error instanceof Error ? error.message : ERROR_MESSAGES.GENERATION_FAILED,
          tokensUsed: 0
        }
      }
    })
  }
  
  /**
   * 构建生成提示词
   */
  private buildPrompt(request: AIGenerationRequest): string {
    const { accountData, template, context } = request
    
    let prompt = template
    
    // 替换模板变量
    prompt = prompt.replace(/\{username\}/g, accountData.username)
    prompt = prompt.replace(/\{followerCount\}/g, accountData.followerCount.toString())
    prompt = prompt.replace(/\{postCount\}/g, accountData.postCount.toString())
    prompt = prompt.replace(/\{contentCategory\}/g, accountData.contentCategory)
    
    if (context) {
      prompt += `\n\n额外上下文：${context}`
    }
    
    return prompt
  }
  
  /**
   * 重试机制
   */
  private async retryRequest<T>(
    fn: () => Promise<AIResponse<T>>,
    maxAttempts = PERFORMANCE_CONFIG.RETRY_MAX_ATTEMPTS
  ): Promise<AIResponse<T>> {
    let lastError: AIResponse<T> | null = null
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const result = await fn()
      
      if (result.success) {
        return result
      }
      
      lastError = result
      
      // 如果不是最后一次尝试，等待后重试
      if (attempt < maxAttempts) {
        await this.delay(PERFORMANCE_CONFIG.RETRY_DELAY * attempt)
      }
    }
    
    return lastError || {
      success: false,
      data: {} as T,
      error: ERROR_MESSAGES.AI_SERVICE_ERROR,
      tokensUsed: 0
    }
  }
  
  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
  
  /**
   * Gemini 图像分析
   */
  private async analyzeImageGemini(request: AIAnalysisRequest): Promise<AIResponse<AccountData>> {
    const response = await fetch(
      `${this.baseUrl}/v1beta/models/gemini-pro-vision:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: request.prompt },
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: request.image
                }
              }
            ]
          }]
        })
      }
    )
    
    if (!response.ok) {
      throw new Error(`Gemini API 请求失败: ${response.statusText}`)
    }
    
    const data = await response.json()
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text
    
    if (!content) {
      throw new Error('Gemini 返回内容为空')
    }
    
    const accountData = JSON.parse(content) as AccountData
    
    return {
      success: true,
      data: accountData,
      tokensUsed: data.usageMetadata?.totalTokenCount || 0
    }
  }
  
  /**
   * Gemini 内容生成
   */
  private async generateContentGemini(request: AIGenerationRequest): Promise<AIResponse<string>> {
    const prompt = '你是一位小红书运营专家，精通平台算法和用户心理。\n\n' + this.buildPrompt(request)
    
    const response = await fetch(
      `${this.baseUrl}/v1beta/models/gemini-pro:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: API_CONFIG.TEMPERATURE,
            maxOutputTokens: API_CONFIG.MAX_TOKENS
          }
        })
      }
    )
    
    if (!response.ok) {
      throw new Error(`Gemini API 请求失败: ${response.statusText}`)
    }
    
    const data = await response.json()
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text
    
    if (!content) {
      throw new Error('Gemini 返回内容为空')
    }
    
    return {
      success: true,
      data: content,
      tokensUsed: data.usageMetadata?.totalTokenCount || 0
    }
  }
  
  /**
   * 获取视觉模型名称
   */
  private getVisionModel(): string {
    if (this.provider === 'deepseek') {
      return 'deepseek-chat'
    } else if (this.provider === 'gemini') {
      return 'gemini-pro-vision'
    }
    return API_CONFIG.OPENAI_MODEL
  }
  
  /**
   * 获取文本模型名称
   */
  private getTextModel(): string {
    if (this.provider === 'deepseek') {
      return 'deepseek-chat'
    } else if (this.provider === 'gemini') {
      return 'gemini-pro'
    }
    return API_CONFIG.OPENAI_TEXT_MODEL
  }
  
  /**
   * 检查 API 密钥是否配置
   */
  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey !== ''
  }
  
  /**
   * 获取当前使用的提供商
   */
  getProvider(): string {
    return this.provider
  }
}

// 导出单例
export const aiService = new AIService()
