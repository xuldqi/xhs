import fetch from 'node-fetch'

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
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.geminiApiKey}`;
    
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

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`原生 Gemini API 错误 (${response.status}): ${errorText}`);
    }

    const data: any = await response.json();
    
    // 提取 Gemini 返回的文本内容
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!content) {
      throw new Error('Gemini 返回内容为空');
    }
    
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
  }

  /**
   * 使用第三方中转 API 分析图片
   */
  private async analyzeImageWithProxyAPI(prompt: string, imageBase64: string): Promise<any> {
    console.log('🔍 使用第三方中转 API 分析图片 (Gemini 原生格式)...');
    
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

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini 中转 API 错误 (${response.status}): ${errorText}`);
    }

    const data: any = await response.json();
    
    // 提取 Gemini 返回的文本内容
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!content) {
      throw new Error('Gemini 返回内容为空');
    }
    
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
  }

  /**
   * 生成内容 - 使用 DeepSeek
   */
  async generateContent(systemPrompt: string, userPrompt: string): Promise<any> {
    console.log('🔑 DeepSeek API Key:', this.deepseekApiKey ? `${this.deepseekApiKey.substring(0, 10)}...` : 'NOT SET');
    console.log('🔗 Base URL:', this.baseUrl);
    
    const requestBody = {
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 2000,
      temperature: 0.7
    };
    
    console.log('📤 Request:', JSON.stringify(requestBody).substring(0, 200));
    
    const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.deepseekApiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📥 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      throw new Error(`DeepSeek API error (${response.status}): ${errorText}`);
    }

    return await response.json();
  }

  /**
   * 检查配置
   */
  isConfigured(): boolean {
    return !!this.deepseekApiKey && !!this.geminiApiKey;
  }
}