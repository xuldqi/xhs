import fetch from 'node-fetch'

export class AIService {
  private apiKey: string
  private baseUrl: string

  constructor() {
    this.apiKey = process.env.DEEPSEEK_API_KEY || ''
    this.baseUrl = process.env.API_BASE_URL || 'https://api.deepseek.com'

    if (!this.apiKey) {
      console.warn('⚠️ Warning: DEEPSEEK_API_KEY is not configured')
    }
  }

  /**
   * 分析图片
   */
  async analyzeImage(prompt: string, imageBase64: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: { url: `data:image/jpeg;base64,${imageBase64}` }
              }
            ]
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`DeepSeek API error (${response.status}): ${errorText}`)
    }

    return await response.json()
  }

  /**
   * 生成内容
   */
  async generateContent(systemPrompt: string, userPrompt: string): Promise<any> {
    console.log('🔑 API Key:', this.apiKey ? `${this.apiKey.substring(0, 10)}...` : 'NOT SET')
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
        'Authorization': `Bearer ${this.apiKey}`
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
    return !!this.apiKey
  }
}
