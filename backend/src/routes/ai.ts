import { Router, Request, Response } from 'express'
import { AIService } from '../services/aiService'

export const aiRouter = Router()

// 延迟实例化 AIService，确保环境变量已加载
let aiService: AIService | null = null
const getAIService = () => {
  if (!aiService) {
    aiService = new AIService()
  }
  return aiService
}

// 图像分析接口
aiRouter.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { prompt, image } = req.body

    if (!prompt || !image) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'prompt and image are required'
      })
    }

    console.log('📸 Analyzing image...')
    const result = await getAIService().analyzeImage(prompt, image)

    res.json(result)
  } catch (error) {
    console.error('❌ Analysis error:', error)
    res.status(500).json({
      error: 'Analysis failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// 内容生成接口
aiRouter.post('/generate', async (req: Request, res: Response) => {
  try {
    const { systemPrompt, userPrompt } = req.body

    if (!systemPrompt || !userPrompt) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'systemPrompt and userPrompt are required'
      })
    }

    console.log('✍️ Generating content...')
    const result = await getAIService().generateContent(systemPrompt, userPrompt)

    res.json(result)
  } catch (error) {
    console.error('❌ Generation error:', error)
    res.status(500).json({
      error: 'Generation failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// 统一入口（兼容 Vercel serverless 格式）
aiRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { type, data } = req.body

    if (!type || !data) {
      return res.status(400).json({
        error: 'Invalid request format',
        message: 'type and data are required'
      })
    }

    if (type === 'analyze') {
      const { prompt, image } = data
      if (!prompt || !image) {
        return res.status(400).json({
          error: 'Missing required fields',
          message: 'prompt and image are required'
        })
      }

      console.log('📸 Analyzing image...')
      const result = await getAIService().analyzeImage(prompt, image)
      return res.json(result)
    } else if (type === 'generate') {
      const { systemPrompt, userPrompt } = data
      if (!systemPrompt || !userPrompt) {
        return res.status(400).json({
          error: 'Missing required fields',
          message: 'systemPrompt and userPrompt are required'
        })
      }

      console.log('✍️ Generating content...')
      const result = await getAIService().generateContent(systemPrompt, userPrompt)
      return res.json(result)
    } else {
      return res.status(400).json({
        error: 'Invalid request type',
        message: 'type must be "analyze" or "generate"'
      })
    }
  } catch (error) {
    console.error('❌ API error:', error)
    res.status(500).json({
      error: 'Request failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// 测试接口
aiRouter.get('/test', (req: Request, res: Response) => {
  res.json({
    message: 'AI API is working',
    configured: getAIService().isConfigured()
  })
})
