import fetch from 'node-fetch'

// 错误类型枚举
export enum AIErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_ERROR = 'API_ERROR',
  CONFIG_ERROR = 'CONFIG_ERROR',
  PARSE_ERROR = 'PARSE_ERROR'
}

// 结构化错误响应
export interface AIErrorResponse {
  success: false
  error: string
  errorType: AIErrorType
  details?: string
  retryable: boolean
}

export class AIService {
  private deepseekApiKey: string
  private geminiApiKey: string
  private baseUrl: string
  private geminiBaseUrl: string
  private geminiProxyApiKey: string

  constructor() {
    this.deepseekApiKey = process.env.DEEPSEEK_API_KEY || ''
    this.geminiApiKey = process.env.GEMINI_API_KEY || ''
    this.baseUrl = process.env.API_BASE_URL || 'https://api.deepseek.com'
    // 第三方中转 API 地址
    this.geminiBaseUrl = process.env.GEMINI_BASE_URL || 'https://www.packyapi.com'
    // 第三方中转 API 密钥
    this.geminiProxyApiKey = process.env.GEMINI_PROXY_API_KEY || ''

    if (!this.deepseekApiKey) {
      console.warn('⚠️ Warning: DEEPSEEK_API_KEY is not configured')
    }
    if (!this.geminiApiKey) {
      console.warn('⚠️ Warning: GEMINI_API_KEY is not configured')
    }
    if (!this.geminiProxyApiKey) {
      console.warn('⚠️ Warning: GEMINI_PROXY_API_KEY is not configured')
    }
  }

  /**
   * 分类错误类型
   */
  private categorizeError(error: any, statusCode?: number): { type: AIErrorType; retryable: boolean } {
    // 网络错误
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
      return { type: AIErrorType.NETWORK_ERROR, retryable: true }
    }

    // API错误
    if (statusCode) {
      if (statusCode === 503 || statusCode === 429) {
        return { type: AIErrorType.API_ERROR, retryable: true }
      }
      if (statusCode === 401 || statusCode === 403) {
        return { type: AIErrorType.CONFIG_ERROR, retryable: false }
      }
      if (statusCode >= 400 && statusCode < 500) {
        return { type: AIErrorType.API_ERROR, retryable: false }
      }
      if (statusCode >= 500) {
        return { type: AIErrorType.API_ERROR, retryable: true }
      }
    }

    // 解析错误
    if (error.message?.includes('JSON') || error.message?.includes('parse')) {
      return { type: AIErrorType.PARSE_ERROR, retryable: false }
    }

    // 配置错误
    if (error.message?.includes('API key') || error.message?.includes('configured')) {
      return { type: AIErrorType.CONFIG_ERROR, retryable: false }
    }

    // 默认为API错误
    return { type: AIErrorType.API_ERROR, retryable: false }
  }

  /**
   * 创建结构化错误响应
   */
  private createErrorResponse(error: any, statusCode?: number): AIErrorResponse {
    const { type, retryable } = this.categorizeError(error, statusCode)
    
    let errorMessage = error.message || 'Unknown error'
    let details = ''

    // 根据错误类型提供更友好的消息
    switch (type) {
      case AIErrorType.NETWORK_ERROR:
        errorMessage = '网络连接失败，请检查网络后重试'
        details = error.message
        break
      case AIErrorType.CONFIG_ERROR:
        errorMessage = 'AI 服务未配置，请联系管理员配置 API 密钥'
        details = error.message
        break
      case AIErrorType.PARSE_ERROR:
        errorMessage = 'AI 返回格式错误，请重试'
        details = error.message
        break
      case AIErrorType.API_ERROR:
        if (statusCode === 503) {
          errorMessage = 'AI 服务繁忙，请稍后重试'
        } else if (statusCode === 429) {
          errorMessage = 'API 调用频率超限，请稍后重试'
        } else {
          errorMessage = 'AI 服务异常，请稍后重试'
        }
        details = error.message
        break
    }

    console.error(`❌ [${type}] ${errorMessage}`, details ? `- ${details}` : '')

    return {
      success: false,
      error: errorMessage,
      errorType: type,
      details: details || undefined,
      retryable
    }
  }

  /**
   * 分析图片 - 首先尝试原生 Gemini API，失败后使用第三方中转 API
   */
  async analyzeImage(prompt: string, imageBase64: string): Promise<any> {
    console.log('🔍 尝试使用原生 Gemini API 分析图片...')
    
    // 首先尝试原生 Gemini API
    try {
      const result = await this.analyzeImageWithNativeGemini(prompt, imageBase64);
      console.log('✅ 原生 Gemini API 调用成功');
      return result;
    } catch (error: any) {
      // 检查是否是503错误（服务过载）
      if (error.message.includes('503') || error.message.includes('overloaded') || error.message.includes('UNAVAILABLE')) {
        console.log('⚠️ 原生 Gemini API 服务过载，立即尝试第三方中转 API...');
      } else {
        console.warn('⚠️ 原生 Gemini API 调用失败:', error.message);
      }
      
      // 尝试第三方中转 API
      try {
        const result = await this.analyzeImageWithProxyAPI(prompt, imageBase64);
        console.log('✅ 第三方中转 API 调用成功');
        return result;
      } catch (proxyError: any) {
        console.error('❌ 第三方中转 API 调用也失败:', proxyError.message);
        // 当两个API都失败时，抛出更友好的错误信息
        throw new Error('AI服务暂时不可用，请稍后重试');
      }
    }
  }

  /**
   * 使用原生 Gemini API 分析图片
   */
  private async analyzeImageWithNativeGemini(prompt: string, imageBase64: string): Promise<any> {
    console.log('📡 调用原生 Gemini API...')
    
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.geminiApiKey}`;
    
    try {
      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: imageBase64
                }
              }
            ]
          }]
        })
      });

      console.log(`📥 响应状态: ${response.status}`)

      if (!response.ok) {
        const errorText = await response.text();
        const error = new Error(`原生 Gemini API 错误: ${errorText}`);
        throw this.createErrorResponse(error, response.status);
      }

      const data: any = await response.json();
      
      // 提取 Gemini 返回的文本内容
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!content) {
        throw this.createErrorResponse(new Error('Gemini 返回内容为空'));
      }
      
      console.log('✅ 原生 Gemini API 调用成功')
      
      // 转换为统一格式
      return {
        choices: [{
          message: {
            content: content
          }
        }],
        usage: {
          total_tokens: data.usageMetadata?.totalTokenCount || 0
        }
      };
    } catch (error: any) {
      if (error.success === false) {
        throw error; // 已经是结构化错误
      }
      throw this.createErrorResponse(error);
    }
  }

  /**
   * 使用第三方中转 API 分析图片
   */
  private async analyzeImageWithProxyAPI(prompt: string, imageBase64: string): Promise<any> {
    console.log('📡 调用第三方中转 API (Gemini 原生格式)...');
    
    try {
      // 使用 Gemini 原生格式端点
      const response = await fetch(`${this.geminiBaseUrl}/v1beta/models/gemini-2.5-flash:generateContent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.geminiProxyApiKey}`
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: imageBase64
                }
              }
            ]
          }]
        })
      });

      console.log(`📥 响应状态: ${response.status}`)

      if (!response.ok) {
        const errorText = await response.text();
        const error = new Error(`Gemini 中转 API 错误: ${errorText}`);
        throw this.createErrorResponse(error, response.status);
      }

      const data: any = await response.json();
      
      // 提取 Gemini 返回的文本内容
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!content) {
        throw this.createErrorResponse(new Error('Gemini 返回内容为空'));
      }
      
      console.log('✅ 第三方中转 API 调用成功')
      
      // 转换为统一格式
      return {
        choices: [{
          message: {
            content: content
          }
        }],
        usage: {
          total_tokens: data.usageMetadata?.totalTokenCount || 0
        }
      };
    } catch (error: any) {
      if (error.success === false) {
        throw error; // 已经是结构化错误
      }
      throw this.createErrorResponse(error);
    }
  }

  /**
   * 生成内容 - 使用 DeepSeek
   */
  async generateContent(systemPrompt: string, userPrompt: string): Promise<any> {
    console.log('📡 调用 DeepSeek API...');
    console.log('🔑 API Key:', this.deepseekApiKey ? `${this.deepseekApiKey.substring(0, 10)}...` : 'NOT SET');
    console.log('🔗 Base URL:', this.baseUrl);
    
    if (!this.deepseekApiKey) {
      throw this.createErrorResponse(new Error('DeepSeek API key is not configured'));
    }
    
    const requestBody = {
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 2000,
      temperature: 0.7
    };
    
    console.log('📤 请求体:', JSON.stringify(requestBody).substring(0, 200) + '...');
    
    try {
      const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.deepseekApiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📥 响应状态:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ 错误响应:', errorText);
        const error = new Error(`DeepSeek API 错误: ${errorText}`);
        throw this.createErrorResponse(error, response.status);
      }

      const data = await response.json();
      console.log('✅ DeepSeek API 调用成功');
      return data;
    } catch (error: any) {
      if (error.success === false) {
        throw error; // 已经是结构化错误
      }
      throw this.createErrorResponse(error);
    }
  }

  /**
   * 检查配置
   */
  isConfigured(): boolean {
    return !!this.deepseekApiKey && !!this.geminiApiKey;
  }
}