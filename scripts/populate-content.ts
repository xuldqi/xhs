/**
 * @description 内容填充脚本
 * 
 * 运行此脚本，可以自动生成一批高质量的知识库文章和社区问答，并以 JSON 格式保存，
 * 用于解决网站内容空洞的问题。
 *
 * 运行逻辑:
 * 1. 检查是否存在 VUE_APP_OPENAI_API_KEY 环境变量。
 * 2. 如果存在，则调用 OpenAI API 生成真实内容。
 * 3. 如果不存在，则生成一批高质量的、预设的模拟数据。
 *
 * 如何运行:
 * 1. (可选) 在 .env 文件中配置 VUE_APP_OPENAI_API_KEY
 * 2. 安装 ts-node: npm install -g ts-node
 * 3. 运行: ts-node --project tsconfig.node.json scripts/populate-content.ts
 */
import { generateArticle, generateQAPair } from '../src/services/contentGenerator'
import { promises as fs } from 'fs'
import path from 'path'
import type { Article, QAPair } from '../src/types/models'
import { MOCK_ARTICLES, MOCK_QA_PAIRS } from '../src/data/mockData'

// =================================================================
// 预设内容种子
// =================================================================

const ARTICLE_TOPICS = [
  '如何写出小红书爆款笔记的标题？',
  '小红书养号的正确姿势是什么？',
  '2024年，小红书平台的流量分发机制解读',
  '从零到一，如何定位你的小红书账号？',
  '内容质量不错，但笔记流量差的原因分析',
  '小红书图文笔记和视频笔记的优缺点对比',
  '如何有效利用小红书的评论区进行导流？',
  '小红书店铺的开通条件和运营技巧',
  '品牌如何在小红书上进行有效的KOL投放？',
  '分析你的小红书竞品账号：你需要关注的5个维度'
]

const QA_QUESTIONS = [
  '我的笔记发出去了，一个赞都没有，是不是被限流了？',
  '每天应该发几篇笔记最合适？',
  '做穿搭类的博主，是应该真人出镜还是只拍产品？',
  '刚开始做号，要不要和别人互关互赞？',
  '小红书的流量是不是越来越差了，感觉现在好难做。',
  '怎么才能接到第一单广告？需要多少粉丝？',
  '笔记发出后，发现有错别字，是修改好还是删除重发？',
  '大家说的“养号”到底是在养什么？真的有用吗？'
]

// =================================================================
// 脚本主逻辑
// =================================================================

const DATA_DIR = path.resolve(__dirname, '../src/data')
const API_KEY = process.env.VUE_APP_OPENAI_API_KEY

async function main() {
  if (API_KEY && API_KEY !== 'YOUR_API_KEY') {
    console.log('🚀 检测到 OpenAI API Key，将生成真实的 AI 内容...')
    await generateRealContent()
  } else {
    console.log('🤔 未检测到 OpenAI API Key，将生成高质量的模拟内容...')
    await generateMockContent()
  }
}

/**
 * 生成真实的 AI 内容
 */
async function generateRealContent() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })

    // --- 1. 生成知识库文章 ---
    console.log('\n📚 正在生成知识库文章...')
    const articles: Article[] = []
    for (const topic of ARTICLE_TOPICS) {
      console.log(`  - 正在生成: "${topic}"`)
      const articleData = await generateArticle(topic)
      articles.push({
        ...articleData,
        id: (articles.length + 1).toString(),
        createdAt: new Date()
      })
    }
    const articlesPath = path.join(DATA_DIR, 'articles.json')
    await fs.writeFile(articlesPath, JSON.stringify(articles, null, 2))
    console.log(`✅ 成功生成 ${articles.length} 篇文章，已保存至: ${articlesPath}`)

    // --- 2. 生成社区问答 ---
    console.log('\n💬 正在生成社区问答...')
    const qaPairs: QAPair[] = []
    for (const question of QA_QUESTIONS) {
      console.log(`  - 正在生成回答: "${question}"`)
      const qaData = await generateQAPair(question)
      qaPairs.push({
        ...qaData,
        id: (qaPairs.length + 1).toString(),
        createdAt: new Date()
      })
    }
    const qaPath = path.join(DATA_DIR, 'qa.json')
    await fs.writeFile(qaPath, JSON.stringify(qaPairs, null, 2))
    console.log(`✅ 成功生成 ${qaPairs.length} 个问答，已保存至: ${qaPath}`)

    console.log('\n🎉 所有 AI 内容已成功生成！')

  } catch (error) {
    console.error('\n❌ AI 内容生成过程中发生严重错误:')
    if (error instanceof Error) {
      console.error(error.message)
    } else {
      console.error(error)
    }
    process.exit(1)
  }
}

/**
 * 生成模拟内容
 */
async function generateMockContent() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })

    // --- 1. 保存模拟文章 ---
    const articlesPath = path.join(DATA_DIR, 'articles.json')
    await fs.writeFile(articlesPath, JSON.stringify(MOCK_ARTICLES, null, 2))
    console.log(`✅ 成功保存 ${MOCK_ARTICLES.length} 篇模拟文章，已保存至: ${articlesPath}`)

    // --- 2. 保存模拟问答 ---
    const qaPath = path.join(DATA_DIR, 'qa.json')
    await fs.writeFile(qaPath, JSON.stringify(MOCK_QA_PAIRS, null, 2))
    console.log(`✅ 成功保存 ${MOCK_QA_PAIRS.length} 个模拟问答，已保存至: ${qaPath}`)

    console.log('\n🎉 所有模拟内容已成功生成！')
    console.log('现在，你可以在前端组件中直接导入这些 JSON 文件来展示数据。')

  } catch (error) {
    console.error('\n❌ 模拟内容生成过程中发生严重错误:')
    if (error instanceof Error) {
      console.error(error.message)
    } else {
      console.error(error)
    }
    process.exit(1)
  }
}


main()

