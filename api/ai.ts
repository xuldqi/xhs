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
    const deepseekApiKey = process.env.DEEPSEEK_API_KEY
    const geminiApiKey = process.env.GEMINI_API_KEY
    const geminiProxyApiKey = process.env.GEMINI_PROXY_API_KEY
    const baseUrl = process.env.API_BASE_URL || 'https://api.deepseek.com'
    const geminiBaseUrl = process.env.GEMINI_BASE_URL || 'https://www.packyapi.com'

    // 根据请求类型调用不同的 API
    if (type === 'analyze') {
      // 图像分析 - 首先尝试原生 Gemini API，失败后使用第三方中转 API
      try {
        console.log('🔍 尝试使用原生 Gemini API 分析图片...')
        
        // 使用原生 Gemini API
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`;
        
        const geminiResponse = await fetch(geminiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${geminiApiKey}`
          },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: data.prompt },
                {
                  inline_data: {
                    mime_type: 'image/jpeg',
                    data: data.image
                  }
                }
              ]
            }]
          })
        });

        if (!geminiResponse.ok) {
          throw new Error(`原生 Gemini API 错误 (${geminiResponse.status})`);
        }

        const geminiResult: any = await geminiResponse.json();
        
        // 提取 Gemini 返回的文本内容
        const content = geminiResult.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!content) {
          throw new Error('Gemini 返回内容为空');
        }
        
        // 转换为统一格式
        const result = {
          choices: [{
            message: {
              content: content
            }
          }],
          usage: {
            total_tokens: geminiResult.usageMetadata?.totalTokenCount || 0
          }
        };
        
        console.log('✅ 原生 Gemini API 调用成功');
        return res.status(200).json(result);
      } catch (error: any) {
        // 检查是否是503错误（服务过载）
        if (error.message.includes('503') || error.message.includes('overloaded') || error.message.includes('UNAVAILABLE')) {
          console.log('⚠️ 原生 Gemini API 服务过载，立即尝试第三方中转 API...');
        } else {
          console.warn('⚠️ 原生 Gemini API 调用失败:', error.message);
        }
        
        // 尝试第三方中转 API
        try {
          console.log('🔍 使用第三方中转 API 分析图片 (Gemini 原生格式)...');
          
          const proxyResponse = await fetch(`${geminiBaseUrl}/v1beta/models/gemini-2.5-flash:generateContent`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${geminiProxyApiKey}`
            },
            body: JSON.stringify({
              contents: [{
                parts: [
                  { text: data.prompt },
                  {
                    inline_data: {
                      mime_type: 'image/jpeg',
                      data: data.image
                    }
                  }
                ]
              }]
            })
          });

          if (!proxyResponse.ok) {
            throw new Error(`Gemini 中转 API 错误 (${proxyResponse.status})`);
          }

          const proxyResult: any = await proxyResponse.json();
          
          // 提取 Gemini 返回的文本内容
          const content = proxyResult.candidates?.[0]?.content?.parts?.[0]?.text;
          
          if (!content) {
            throw new Error('Gemini 返回内容为空');
          }
          
          // 转换为统一格式
          const result = {
            choices: [{
              message: {
                content: content
              }
            }],
            usage: {
              total_tokens: proxyResult.usageMetadata?.totalTokenCount || 0
            }
          };
          
          console.log('✅ 第三方中转 API 调用成功');
          return res.status(200).json(result);
        } catch (proxyError: any) {
          console.error('❌ 第三方中转 API 调用也失败:', proxyError.message);
          // 当两个API都失败时，返回更友好的错误信息
          return res.status(500).json({
            error: 'AI服务暂时不可用，请稍后重试'
          });
        }
      }
    } else if (type === 'generate') {
      // 内容生成 - 使用 DeepSeek
      if (!deepseekApiKey) {
        return res.status(500).json({ error: 'DeepSeek API Key not configured' })
      }
      
      const response = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${deepseekApiKey}`
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