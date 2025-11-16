import type { VercelRequest, VercelResponse } from '@vercel/node'

// Vercel Serverless Function
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { type, data } = req.body

    // 从环境变量获取 API Key（安全）
    const apiKey = process.env.DEEPSEEK_API_KEY
    const baseUrl = process.env.API_BASE_URL || 'https://api.deepseek.com'

    if (!apiKey) {
      return res.status(500).json({ error: 'API Key not configured' })
    }

    // 根据请求类型调用不同的 API
    if (type === 'analyze') {
      // 图像分析
      const response = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: data.prompt },
                {
                  type: 'image_url',
                  image_url: { url: `data:image/jpeg;base64,${data.image}` }
                }
              ]
            }
          ],
          max_tokens: 2000,
          temperature: 0.7
        })
      })

      const result = await response.json()
      return res.status(200).json(result)
    } else if (type === 'generate') {
      // 内容生成
      const response = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: data.systemPrompt },
            { role: 'user', content: data.userPrompt }
          ],
          max_tokens: 2000,
          temperature: 0.7
        })
      })

      const result = await response.json()
      return res.status(200).json(result)
    } else {
      return res.status(400).json({ error: 'Invalid request type' })
    }
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error'
    })
  }
}
