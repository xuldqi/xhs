/**
 * @description AI 内容生成服务
 *
 * 负责调用 OpenAI API，根据预设的主题和模板，
 * 生成高质量、原创的文章、问答和案例分析。
 * 这将为网站提供丰富、专业且与小红书增长高度相关的内容。
 */
import { OpenAI } from 'openai'
import type { Article, QAPair } from '@/types/models'

// 在真实项目中，API 密钥应该通过环境变量等安全方式管理
// 这里为了演示，暂时硬编码。请务必替换为您自己的密钥。
const OPENAI_API_KEY = process.env.VUE_APP_OPENAI_API_KEY || 'YOUR_API_KEY'

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // 允许在浏览器环境中使用
})

/**
 * 生成单篇知识库文章
 * @param topic - 文章主题
 */
export async function generateArticle(topic: string): Promise<Omit<Article, 'id' | 'createdAt'>> {
  try {
    const prompt = `
      你是一名顶级的社交媒体增长专家，尤其擅长小红书平台的运营。
      请围绕以下主题，撰写一篇专业、深度、实用的知识库文章，用于一个面向小红书博主的教学网站。

      主题: "${topic}"

      文章要求:
      1.  **结构清晰**: 包含引言、2-3个核心要点，和总结。
      2.  **内容翔实**: 提供具体的策略、案例或可操作的步骤。
      3.  **语言专业**: 使用行业术语，但要解释清楚，让初学者也能看懂。
      4.  **格式友好**: 使用 Markdown 格式，包含标题、列表、加粗等，以便前端展示。
      5.  **字数**: 全文 800-1200字。

      请直接返回 Markdown 格式的文章正文，不要包含其他额外说明。
    `

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1500
    })

    const content = response.choices[0].message.content || ''
    
    // 从内容中提取摘要
    const summary = content.split('\n').find(line => line.length > 50)?.substring(0, 100) + '...' || '暂无摘要'

    return {
      title: topic,
      content,
      summary,
      author: 'AI 增长专家',
      tags: ['小红书', '内容策略', 'AI生成'],
      coverImageUrl: `https://source.unsplash.com/random/800x600/?${encodeURIComponent(topic)}`
    }
  } catch (error) {
    console.error(`生成文章失败 (主题: ${topic}):`, error)
    throw new Error('AI 服务调用失败，请检查 API 密钥或网络连接。')
  }
}

/**
 * 生成一个社区问答对
 * @param question - 社区中的问题
 */
export async function generateQAPair(question: string): Promise<Omit<QAPair, 'id' | 'createdAt'>> {
  try {
    const prompt = `
      你正在一个面向小红书博主的在线社区中扮演 "增长导师" 的角色。
      请针对以下用户提问，给出一个专业、热情且富有洞察力的回答。

      用户提问: "${question}"

      回答要求:
      1.  **共情和鼓励**: 先表示理解或赞同用户的问题。
      2.  **提供核心建议**: 给出 2-3个最关键的、可操作的建议。
      3.  **举例说明**: 如果合适，可以用一个简单的例子来阐述观点。
      4.  **引导讨论**: 在结尾可以提出一个开放性问题，鼓励更多人参与讨论。
      5.  **格式**: 使用 Markdown 格式，让回答易于阅读。
      6.  **字数**: 200-400字。

      请直接返回 Markdown 格式的回答正文。
    `
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 500
    })

    const answer = response.choices[0].message.content || ''

    return {
      question,
      answer,
      author: {
        name: '增长导师 AI',
        avatarUrl: '/avatars/teacher.png'
      },
      viewCount: Math.floor(Math.random() * 2000) + 100,
      likeCount: Math.floor(Math.random() * 300) + 10,
      tags: ['问答', 'AI 回答']
    }
  } catch (error) {
    console.error(`生成问答失败 (问题: ${question}):`, error)
    throw new Error('AI 服务调用失败，请检查 API 密钥或网络连接。')
  }
}
