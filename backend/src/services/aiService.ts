import fetch from 'node-fetch'

export class AIService {
  private deepseekApiKey: string
  private geminiApiKey: string
  private baseUrl: string

  constructor() {
    this.deepseekApiKey = process.env.DEEPSEEK_API_KEY || ''
    this.geminiApiKey = process.env.GEMINI_API_KEY || ''
    this.baseUrl = process.env.API_BASE_URL || 'https://api.deepseek.com'

    if (!this.deepseekApiKey) {
      console.warn('⚠️ Warning: DEEPSEEK_API_KEY is not configured')
    }
    if (!this.geminiApiKey) {
      console.warn('⚠️ Warning: GEMINI_API_KEY is not configured')
    }
  }

  /**
   * 分析图片 - 使用 Gemini 2.5 Flash
   */
  async analyzeImage(prompt: string, imageBase64: string): Promise<any> {
    console.log('🔍 使用 Gemini 2.5 Flash 分析图片...')
    
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`
    
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': this.geminiApiKey
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
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Gemini API error (${response.status}): ${errorText}`)
    }

    const data = await response.json()
    
    // 提取 Gemini 返回的文本内容
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text
    
    if (!content) {
      throw new Error('Gemini 返回内容为空')
    }
    
    console.log('✅ Gemini 分析完成')
    
    // 转换为统一格式
    return {
      choices: [{
        message: {
          content: content
        }
      }],
      usage: {
        total_tokens: 0
      }
    }
  }

  /**
   * 生成内容 - 使用 DeepSeek
   */
  async generateContent(systemPrompt: string, userPrompt: string): Promise<any> {
    console.log('🔑 DeepSeek API Key:', this.deepseekApiKey ? `${this.deepseekApiKey.substring(0, 10)}...` : 'NOT SET')
    console.log('🔗 Base URL:', this.baseUrl)
    
    const requestBody = {
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 2000,
      temperature: 0.7
    }
    
    console.log('📤 Request:', JSON.stringify(requestBody).substring(0, 200))
    
    const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.deepseekApiKey}`
      },
      body: JSON.stringify(requestBody)
    })

    console.log('📥 Response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Error response:', errorText)
      throw new Error(`DeepSeek API error (${response.status}): ${errorText}`)
    }

    return await response.json()
  }

  /**
   * 检查配置
   */
  isConfigured(): boolean {
    return !!this.deepseekApiKey && !!this.geminiApiKey
  }
}
