import { aiService } from './aiService'
import { getSectionTemplate, getAllTemplates } from './promptTemplates'
import type { AccountData, GuideContent, Section } from '@/types'

/**
 * 生成完整指南
 */
export async function generateGuide(
  accountData: AccountData,
  onProgress?: (current: number, total: number) => void
): Promise<GuideContent> {
  const templates = getAllTemplates()
  const sections: Section[] = []
  
  for (let i = 0; i < templates.length; i++) {
    const template = templates[i]
    
    // 通知进度
    if (onProgress) {
      onProgress(i + 1, templates.length)
    }
    
    // 生成单个章节
    const section = await generateSection(template.id, accountData)
    sections.push(section)
  }
  
  return {
    sections,
    metadata: {
      generatedAt: new Date(),
      accountName: accountData.username,
      targetFollowers: 1000
    }
  }
}

/**
 * 生成单个章节
 */
export async function generateSection(
  sectionId: number,
  accountData: AccountData
): Promise<Section> {
  const template = getSectionTemplate(sectionId)
  
  if (!template) {
    throw new Error(`未找到章节模板: ${sectionId}`)
  }
  
  try {
    // 调用 AI 生成内容（支持代理模式）
    const response = await aiService.generateContent({
      accountData,
      sectionId,
      template: template.promptTemplate,
      context: ''
    })
    
    if (response.success && response.data) {
      return {
        id: sectionId,
        title: template.title,
        content: response.data,
        tables: extractTables(response.data),
        checklists: extractChecklists(response.data)
      }
    } else {
      // AI 生成失败，抛出错误
      throw new Error(response.error || 'AI 生成失败')
    }
  } catch (error) {
    console.error(`生成章节 ${sectionId} 失败:`, error)
    // 直接抛出错误，不使用模拟数据
    throw error
  }
}

/**
 * 生成模拟章节内容
 */
function generateMockSectionContent(
  id: number,
  title: string,
  accountData: AccountData
): string {
  const templates: Record<number, string> = {
    1: `
      <h3>📊 账号现状分析</h3>
      <p>账号名称：<strong>${accountData.username}</strong></p>
      <p>当前粉丝：<strong>${accountData.followerCount}</strong></p>
      <p>发布笔记：<strong>${accountData.postCount}</strong></p>
      <p>内容类别：<strong>${accountData.contentCategory}</strong></p>
      
      <h3>✅ 优势分析</h3>
      <ul>
        <li>内容定位清晰，专注于${accountData.contentCategory}领域</li>
        <li>已有${accountData.postCount}篇笔记积累，具备一定内容基础</li>
        <li>起号阶段，增长空间大</li>
      </ul>
      
      <h3>⚠️ 需要改进</h3>
      <ul>
        <li>粉丝基数较低，需要加强冷启动策略</li>
        <li>内容曝光度有待提升</li>
        <li>互动率需要优化</li>
      </ul>
      
      <h3>🎯 涨粉难度评估</h3>
      <p><strong>难度等级：中等</strong></p>
      <p>预计时间：<strong>4-6周</strong></p>
      <p>通过系统化运营和优质内容输出，预计可在1-2个月内达到1000粉丝目标。</p>
    `,
    2: `
      <h3>📅 Day 1：对标研究与选题</h3>
      <p><strong>上午 9:00-12:00</strong></p>
      <ul>
        <li>搜索关键词：${accountData.contentCategory}、${accountData.contentCategory}干货、${accountData.contentCategory}教程</li>
        <li>筛选3-5个对标账号（500-3000粉，近期有爆文）</li>
        <li>分析爆款笔记的标题、封面、内容结构</li>
      </ul>
      
      <p><strong>下午 14:00-18:00</strong></p>
      <ul>
        <li>确定3个选题方向</li>
        <li>制作第一篇笔记（70%参考爆款结构 + 30%个人观点）</li>
        <li>使用官方图文模板制作封面</li>
      </ul>
      
      <p><strong>晚上 19:00-20:00</strong></p>
      <ul>
        <li>发布第一篇笔记</li>
        <li>立即投放5元薯条（智能推荐）</li>
        <li>监控前1小时数据</li>
      </ul>
      
      <h3>📅 Day 2：持续输出</h3>
      <p>重复Day 1流程，发布第二篇笔记</p>
      
      <h3>📅 Day 3：数据复盘</h3>
      <p>分析3天数据，优化内容方向</p>
      <p><strong>验证标准：</strong>3天总曝光 > 3000</p>
      
      <h3>📅 Day 3：数据复盘</h3>
      <p>分析3天数据，优化内容方向</p>
      <p><strong>验证标准：</strong>3天总曝光 > 3000</p>
    `,
    3: `
      <h3>🎯 对标账号特征</h3>
      <p>寻找以下特征的账号：</p>
      <ul>
        <li>粉丝量：${accountData.followerCount * 10} - ${accountData.followerCount * 20}</li>
        <li>内容类别：${accountData.contentCategory}</li>
        <li>近期有爆款笔记（点赞500+）</li>
      </ul>
      
      <h3>📋 18维度拆解清单</h3>
      <h4>内容层（7项）</h4>
      <ol>
        <li>标题情绪词使用</li>
        <li>标题长度（字数）</li>
        <li>标题中的数字使用</li>
        <li>Tag数量和类型</li>
        <li>Emoji使用频次</li>
        <li>正文结构（开头/中间/结尾）</li>
        <li>段落长度</li>
      </ol>
      
      <h4>视觉层（6项）</h4>
      <ol>
        <li>封面布局方式</li>
        <li>字体颜色</li>
        <li>字体类型</li>
        <li>主色调</li>
        <li>文字占比</li>
        <li>图片风格</li>
      </ol>
      
      <h4>账号层（5项）</h4>
      <ol>
        <li>头像色调</li>
        <li>简介格式</li>
        <li>更新频率</li>
        <li>发布时间</li>
        <li>互动话术</li>
      </ol>
      
      <h3>⭐ 重点模仿的5个细节</h3>
      <ol>
        <li><strong>标题公式：</strong>数字 + 痛点 + 解决方案</li>
        <li><strong>封面设计：</strong>大字报风格，文字占比60%+</li>
        <li><strong>开头钩子：</strong>前3句话抓住注意力</li>
        <li><strong>内容结构：</strong>总-分-总，每段不超过3行</li>
        <li><strong>结尾引导：</strong>明确的行动号召</li>
      </ol>
    `,
    4: `
      <h3>📊 内容规划表</h3>
      <table>
        <tr>
          <th>周次</th>
          <th>主题</th>
          <th>发布频率</th>
          <th>目标粉丝</th>
        </tr>
        <tr>
          <td>Week 1</td>
          <td>${accountData.contentCategory}基础知识</td>
          <td>3篇/周</td>
          <td>100</td>
        </tr>
        <tr>
          <td>Week 2</td>
          <td>${accountData.contentCategory}进阶技巧</td>
          <td>4篇/周</td>
          <td>250</td>
        </tr>
        <tr>
          <td>Week 3-4</td>
          <td>${accountData.contentCategory}实战案例</td>
          <td>4篇/周</td>
          <td>500</td>
        </tr>
        <tr>
          <td>Week 5-6</td>
          <td>${accountData.contentCategory}深度干货</td>
          <td>5篇/周</td>
          <td>1000</td>
        </tr>
      </table>
      
      <h3>⏰ 黄金发布时间</h3>
      <ul>
        <li><strong>工作日：</strong>7:00-9:00、12:00-13:00、19:00-22:00</li>
        <li><strong>周末：</strong>10:00-12:00、15:00-17:00、20:00-22:00</li>
      </ul>
      
      <h3>📝 内容类型配比</h3>
      <ul>
        <li>教程类：40%</li>
        <li>干货类：30%</li>
        <li>互动类：20%</li>
        <li>个人故事：10%</li>
      </ul>
    `
  }
  
  // 如果没有预设模板，返回通用模板
  if (!templates[id]) {
    return `
      <h3>${title}</h3>
      <p>基于您的账号情况（<strong>${accountData.username}</strong>，<strong>${accountData.contentCategory}</strong>类别），我们为您准备了专业的${title}内容。</p>
      
      <h4>📋 核心要点</h4>
      <ul>
        <li>根据您的${accountData.contentCategory}定位，制定针对性策略</li>
        <li>当前粉丝基础：${accountData.followerCount}，具有较大增长空间</li>
        <li>已发布${accountData.postCount}篇内容，建议优化内容质量和发布频率</li>
      </ul>
      
      <p><em>💡 提示：实际使用时，系统会调用 AI 生成更详细、更个性化的内容。当前显示的是演示内容。</em></p>
    `
  }
  
  return templates[id]
}

/**
 * 从内容中提取表格
 */
function extractTables(content: string): any[] {
  // TODO: 实现表格提取逻辑
  return []
}

/**
 * 从内容中提取清单
 */
function extractChecklists(content: string): any[] {
  // TODO: 实现清单提取逻辑
  return []
}
