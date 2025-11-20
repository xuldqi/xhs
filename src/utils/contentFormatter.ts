/**
 * 内容格式化工具
 * 将 AI 生成的文本内容转换为结构化的 HTML
 */

export interface ContentBlock {
  type: 'success' | 'warning' | 'info' | 'purple' | 'orange' | 'pink' | 'default'
  title: string
  content: string[]
  icon?: string
}

export interface ParsedContent {
  blocks: ContentBlock[]
  rawHtml: string
}

/**
 * 解析内容块
 * 识别特殊标记的内容块（如 ✅、⚠️、💡 等）
 * 也支持 ◆ ◆ 这种双符号格式
 */
export function parseContentBlocks(content: string): ParsedContent {
  const lines = content.split('\n').map(line => line.trim()).filter(line => line)
  const blocks: ContentBlock[] = []
  let currentBlock: ContentBlock | null = null
  
  for (const line of lines) {
    // 检测块标题 - 支持多种格式：
    // 1. emoji + 标题：✅ 账号优势、🚀 零粉丝启动方案、💬 互动维护
    // 2. 双符号 + 标题：◆ ◆ 账号定位
    // 3. 单符号 + 标题：◆ 账号定位
    // 使用Unicode范围匹配所有emoji（包括变体选择符）
    // 涵盖所有emoji区域：表情、符号、交通、物品、活动等
    const blockMatch = line.match(/^([\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}][\uFE00-\uFE0F]?|[◆●▶★■]+)\s+(.+)$/u)
    
    if (blockMatch) {
      // 保存上一个块
      if (currentBlock) {
        blocks.push(currentBlock)
      }
      
      // 创建新块
      let icon = blockMatch[1].trim()
      const title = blockMatch[2].trim()
      
      // 处理双符号情况：◆ ◆ -> ◆
      icon = icon.replace(/\s+/g, '')
      
      // 提取第一个emoji（包含变体选择符）
      // 使用正则匹配完整的emoji序列（基础字符 + 可选的变体选择符）
      const emojiMatch = icon.match(/^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}][\uFE00-\uFE0F]?/u)
      if (emojiMatch) {
        icon = emojiMatch[0]
      } else {
        // 如果不是emoji，使用Array.from提取第一个字符
        const chars = Array.from(icon)
        icon = chars[0]
        
        // 将 Unicode 符号转换为对应 emoji
        const iconMap: Record<string, string> = {
          '◆': '💡',
          '●': '📌',
          '▶': '▶️',
          '★': '⭐',
          '■': '📋'
        }
        
        if (iconMap[icon]) {
          icon = iconMap[icon]
        }
      }
      
      currentBlock = {
        type: getBlockType(icon),
        title,
        content: [],
        icon
      }
    } else if (currentBlock) {
      // 添加内容到当前块
      currentBlock.content.push(line)
    }
  }
  
  // 保存最后一个块
  if (currentBlock) {
    blocks.push(currentBlock)
  }
  
  // 生成 HTML
  const rawHtml = generateBlocksHtml(blocks)
  
  return { blocks, rawHtml }
}

/**
 * 根据 emoji 判断块类型
 * 支持6种颜色：success(绿), warning(黄), info(蓝), purple(紫), orange(橙), pink(粉)
 */
function getBlockType(icon: string): ContentBlock['type'] {
  // 使用includes来匹配，因为emoji可能有变体选择符
  const iconStr = icon.toString()
  
  // 绿色成功类 - success (✅💪📈✨⭐)
  if (iconStr.includes('✅') || iconStr.includes('💪') || iconStr.includes('📈') || 
      iconStr.includes('✨') || iconStr.includes('⭐')) {
    return 'success'
  }
  
  // 黄色警告类 - warning (⚠️🔔❌)
  if (iconStr.includes('⚠') || iconStr.includes('🔔') || iconStr.includes('❌')) {
    return 'warning'
  }
  
  // 蓝色提示类 - info (💡📊📅🎯📝📄⏰📱📌📋▶️)
  if (iconStr.includes('💡') || iconStr.includes('📊') || iconStr.includes('📅') || 
      iconStr.includes('🎯') || iconStr.includes('📝') || iconStr.includes('📄') ||
      iconStr.includes('⏰') || iconStr.includes('📱') || iconStr.includes('📌') ||
      iconStr.includes('📋') || iconStr.includes('▶')) {
    return 'info'
  }
  
  // 紫色类 - purple (🚀👑💎🎓🔮💜)
  if (iconStr.includes('🚀') || iconStr.includes('👑') || iconStr.includes('💎') ||
      iconStr.includes('🎓') || iconStr.includes('🔮') || iconStr.includes('💜')) {
    return 'purple'
  }
  
  // 橙色类 - orange (🔥💰💥⚡🎁)
  if (iconStr.includes('🔥') || iconStr.includes('💰') || iconStr.includes('💥') ||
      iconStr.includes('⚡') || iconStr.includes('🎁')) {
    return 'orange'
  }
  
  // 粉色类 - pink (💖🌸🎨💕❤️)
  if (iconStr.includes('💖') || iconStr.includes('🌸') || iconStr.includes('🎨') ||
      iconStr.includes('💕') || iconStr.includes('❤')) {
    return 'pink'
  }
  
  // 时间相关 - info (🌙☀️🌅🌞)
  if (iconStr.includes('🌙') || iconStr.includes('☀') || iconStr.includes('🌅') || 
      iconStr.includes('🌞')) {
    return 'info'
  }
  
  // 默认类 - info (蓝色)
  return 'info'
}

/**
 * 生成块的 HTML - 使用卡片布局
 * 简单规则：
 * 1. 有 - 开头的 → 列表项
 * 2. 没有 - 开头的 → 小标题
 */
function generateBlocksHtml(blocks: ContentBlock[]): string {
  return blocks.map(block => {
    const className = `content-block ${block.type}-block`
    
    let inList = false
    const contentHtml: string[] = []
    
    block.content.forEach((line) => {
      // 检查是否是列表项（以 - 或 • 开头）
      const listMatch = line.match(/^[-•]\s(.+)$/)
      
      if (listMatch) {
        // 列表项
        const text = listMatch[1]
        if (!inList) {
          contentHtml.push('<ul>')
          inList = true
        }
        contentHtml.push(`<li>${text}</li>`)
      } else {
        // 不是列表项，就是小标题
        if (inList) {
          contentHtml.push('</ul>')
          inList = false
        }
        
        // 如果包含冒号，将冒号前的部分加粗
        let formattedLine = line
        const colonMatch = line.match(/^([\u4e00-\u9fa5a-zA-Z0-9\s]{1,15}[：:])/)
        if (colonMatch) {
          formattedLine = line.replace(/^([\u4e00-\u9fa5a-zA-Z0-9\s]{1,15}[：:])/, '<strong>$1</strong>')
        }
        
        contentHtml.push(`<h4 class="block-subtitle">${formattedLine}</h4>`)
      }
    })
    
    // 关闭未闭合的列表
    if (inList) {
      contentHtml.push('</ul>')
    }
    
    return `
      <div class="${className}">
        <div class="block-header">
          <span class="block-icon">${block.icon}</span>
          <span class="block-title">${block.title}</span>
        </div>
        <div class="block-content">
          ${contentHtml.join('\n')}
        </div>
      </div>
    `
  }).join('\n')
}

/**
 * 格式化完整内容
 * 处理 Markdown、表格、标签等
 */
export function formatContent(content: string, isProfessional = false): string {
  if (!content) {
    return '<p style="color: #999;">内容为空</p>'
  }
  
  let formatted = content
  
  // 专业模式：保留结构但使用正式格式
  if (isProfessional) {
    return formatProfessionalContent(formatted)
  }
  
  // 1. 处理 Markdown 标题（在解析内容块之前）
  formatted = formatted.replace(/^#### (.+)$/gm, '<h4 class="content-h4">$1</h4>')
  formatted = formatted.replace(/^### (.+)$/gm, '<h3 class="content-h3">$1</h3>')
  formatted = formatted.replace(/^## (.+)$/gm, '<h2 class="content-h2">$1</h2>')
  
  // 2. 尝试解析内容块
  const { rawHtml } = parseContentBlocks(formatted)
  
  if (rawHtml) {
    formatted = rawHtml
  }
  
  // 3. 处理【】括号内容 - 转换为小标签
  formatted = formatted.replace(/【(.+?)】/g, '<span class="tag-badge">$1</span>')
  
  // 4. 处理加粗 **text**
  formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong class="text-highlight">$1</strong>')
  
  // 5. 处理表格
  formatted = formatTables(formatted)
  
  // 6. 处理时间格式
  formatted = formatted.replace(/(\d{1,2}:\d{2}-\d{1,2}:\d{2})\s+(\d{1,2}:\d{2}-\d{1,2}:\d{2})/g, 
    '<span class="time-badge">$1</span> <span class="time-badge">$2</span>')
  
  // 7. 处理普通段落
  formatted = formatParagraphs(formatted)
  
  return formatted
}

/**
 * 专业文档格式化
 * 移除 emoji，但保留卡片和结构化布局
 */
function formatProfessionalContent(content: string): string {
  // 1. 先解析内容块（保留原始结构）
  const { blocks } = parseContentBlocks(content)
  
  if (blocks.length === 0) {
    // 如果没有内容块，使用简单格式化
    return formatSimpleProfessionalContent(content)
  }
  
  // 2. 为每个块生成专业格式的 HTML
  return blocks.map((block, index) => {
    // 移除标题中的 emoji
    const cleanTitle = block.title.replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}]/gu, '').trim()
    
    // 根据块的类型选择样式
    const cardClass = `doc-info-card doc-card-${index % 3 + 1}`
    
    // 格式化内容
    const formattedContent = block.content.map(line => {
      // 移除 emoji
      let cleanLine = line.replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}]/gu, '').trim()
      
      // 处理加粗
      cleanLine = cleanLine.replace(/\*\*(.+?)\*\*/g, '<strong class="doc-strong">$1</strong>')
      // 处理标签
      cleanLine = cleanLine.replace(/【(.+?)】/g, '<span class="doc-tag">$1</span>')
      // 处理时间
      cleanLine = cleanLine.replace(/(\d{1,2}:\d{2})/g, '<span class="doc-time">$1</span>')
      
      // 检查是否是列表项
      if (cleanLine.match(/^[-•]\s/)) {
        return `<li class="doc-card-item">${cleanLine.substring(2)}</li>`
      }
      
      // 检查是否是小标题（带冒号）
      if (cleanLine.includes('：') || cleanLine.includes(':')) {
        const colonIndex = cleanLine.indexOf('：') !== -1 ? cleanLine.indexOf('：') : cleanLine.indexOf(':')
        const subtitle = cleanLine.substring(0, colonIndex).trim()
        const subcontent = cleanLine.substring(colonIndex + 1).trim()
        
        if (subcontent) {
          return `<div class="doc-card-subtitle">${subtitle}：</div><p class="doc-card-text">${subcontent}</p>`
        } else {
          return `<div class="doc-card-subtitle">${subtitle}</div>`
        }
      }
      
      return `<p class="doc-card-text">${cleanLine}</p>`
    }).join('\n')
    
    // 检查是否有列表项
    const hasListItems = block.content.some(line => line.match(/^[-•]\s/))
    
    return `
      <div class="${cardClass}">
        <h3 class="doc-card-title">${cleanTitle}</h3>
        <div class="doc-card-content">
          ${hasListItems ? '<ul class="doc-card-list">' : ''}
          ${formattedContent}
          ${hasListItems ? '</ul>' : ''}
        </div>
      </div>
    `
  }).join('\n')
}

/**
 * 简单的专业格式化（当没有内容块时使用）
 */
function formatSimpleProfessionalContent(content: string): string {
  let formatted = content
  
  // 移除 emoji
  formatted = formatted.replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}]/gu, ' ')
  formatted = formatted.replace(/[◆●▶★■]/g, ' ')
  formatted = formatted.replace(/[^\S\n]+/g, ' ')
  
  const lines = formatted.split('\n').map(line => line.trim()).filter(line => line)
  const result: string[] = []
  let inList = false
  
  for (const line of lines) {
    if (!line) continue
    
    // 检测标题
    if (line.length < 30 && !line.match(/^[-•]/) && !(line.includes('：') || line.includes(':'))) {
      if (inList) {
        result.push('</ol>')
        inList = false
      }
      result.push(`<h3 class="doc-h3">${line}</h3>`)
    }
    // 列表项
    else if (line.match(/^[-•]\s/)) {
      if (!inList) {
        result.push('<ol class="doc-list doc-list-ordered">')
        inList = true
      }
      const text = line.substring(2).trim()
      result.push(`<li class="doc-list-item">${text}</li>`)
    }
    // 普通段落
    else {
      if (inList) {
        result.push('</ol>')
        inList = false
      }
      let formattedLine = line.replace(/\*\*(.+?)\*\*/g, '<strong class="doc-strong">$1</strong>')
      formattedLine = formattedLine.replace(/【(.+?)】/g, '<span class="doc-tag">$1</span>')
      result.push(`<p class="doc-paragraph">${formattedLine}</p>`)
    }
  }
  
  if (inList) {
    result.push('</ol>')
  }
  
  return result.join('\n')
}

/**
 * 格式化专业表格
 */
function formatProfessionalTable(rows: string[]): string {
  if (rows.length === 0) return ''
  
  let html = '<div class="doc-table-container"><table class="doc-table">'
  
  rows.forEach((row, index) => {
    const cells = row.split('|').filter(cell => cell.trim()).map(cell => cell.trim())
    if (cells.length === 0) return
    
    // 跳过分隔行
    if (cells[0].match(/^-+$/)) return
    
    const tag = index === 0 ? 'th' : 'td'
    html += '<tr>'
    cells.forEach(cell => {
      // 检测是否是数字
      const isNumber = /^\d+(\.\d+)?%?$/.test(cell)
      const className = isNumber ? ' class="number"' : ''
      html += `<${tag}${className}>${cell}</${tag}>`
    })
    html += '</tr>'
  })
  
  html += '</table></div>'
  return html
}

/**
 * 格式化表格
 */
function formatTables(content: string): string {
  const tableRegex = /^\|(.+)\|$/gm
  if (!tableRegex.test(content)) {
    return content
  }
  
  return content.replace(/(\|.+\|\n)+/g, (match) => {
    const rows = match.trim().split('\n')
    if (rows.length < 2) return match
    
    let tableHtml = '<table class="content-table">'
    
    rows.forEach((row, index) => {
      const cells = row.split('|').filter(cell => cell.trim()).map(cell => cell.trim())
      if (cells.length === 0) return
      
      // 跳过分隔行
      if (cells[0].match(/^-+$/)) return
      
      const tag = index === 0 ? 'th' : 'td'
      tableHtml += '<tr>'
      cells.forEach(cell => {
        tableHtml += `<${tag}>${cell}</${tag}>`
      })
      tableHtml += '</tr>'
    })
    
    tableHtml += '</table>'
    return tableHtml
  })
}

/**
 * 格式化段落
 * 智能识别小标题、列表项和普通段落
 */
function formatParagraphs(content: string): string {
  const lines = content.split('\n')
  const result: string[] = []
  let inList = false
  
  for (let line of lines) {
    line = line.trim()
    if (!line) {
      if (inList) {
        result.push('</ul>')
        inList = false
      }
      continue
    }
    
    // 如果已经是 HTML 标签，直接添加
    if (line.startsWith('<')) {
      if (inList) {
        result.push('</ul>')
        inList = false
      }
      result.push(line)
    } else if (line.match(/^[-•]\s/)) {
      // 列表项
      if (!inList) {
        result.push('<ul>')
        inList = true
      }
      const text = line.substring(2).trim()
      result.push(`<li>${text}</li>`)
    } else {
      // 检查是否是小标题格式
      const isKeywordColon = /^[\u4e00-\u9fa5]{2,8}[：:]\s*.{1,50}$/.test(line)
      const isTimeSubtitle = /^(第[一二三四五六七八九十\d]+[周天日]|Day\s*\d+)[：:]/.test(line)
      
      if (isKeywordColon || isTimeSubtitle) {
        // 作为小标题处理
        if (inList) {
          result.push('</ul>')
          inList = false
        }
        
        // 将冒号前的部分加粗
        let formattedLine = line
        if (isKeywordColon) {
          formattedLine = line.replace(/^([\u4e00-\u9fa5]{2,8}[：:])/, '<strong>$1</strong>')
        }
        
        result.push(`<h4 class="block-subtitle">${formattedLine}</h4>`)
      } else {
        // 普通文本转为段落
        if (inList) {
          result.push('</ul>')
          inList = false
        }
        result.push(`<p class="content-paragraph">${line}</p>`)
      }
    }
  }
  
  // 关闭未闭合的列表
  if (inList) {
    result.push('</ul>')
  }
  
  return result.join('\n')
}

/**
 * 清理 HTML 标签（用于导出纯文本）
 */
export function stripHtmlTags(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .trim()
}
