/**
 * 内容格式化工具
 * 将 AI 生成的文本内容转换为结构化的 HTML
 */

export interface ContentBlock {
  type: 'success' | 'warning' | 'info' | 'default'
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
 */
export function parseContentBlocks(content: string): ParsedContent {
  const lines = content.split('\n').map(line => line.trim()).filter(line => line)
  const blocks: ContentBlock[] = []
  let currentBlock: ContentBlock | null = null
  
  for (const line of lines) {
    // 检测块标题（带 emoji 的行）
    const blockMatch = line.match(/^([✅⚠️💡📊📅🎯🔥💰📝🌙☀️])\s*(.+)$/)
    
    if (blockMatch) {
      // 保存上一个块
      if (currentBlock) {
        blocks.push(currentBlock)
      }
      
      // 创建新块
      const icon = blockMatch[1]
      const title = blockMatch[2]
      
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
 */
function getBlockType(icon: string): ContentBlock['type'] {
  switch (icon) {
    case '✅':
      return 'success'
    case '⚠️':
      return 'warning'
    case '💡':
      return 'info'
    default:
      return 'default'
  }
}

/**
 * 生成块的 HTML - 使用新的卡片布局
 */
function generateBlocksHtml(blocks: ContentBlock[]): string {
  return blocks.map(block => {
    const className = `guide-card ${block.type}-card`
    const contentHtml = block.content.map(line => {
      // 处理列表项
      if (line.match(/^[•\-]\s/)) {
        return `<li>${line.substring(2)}</li>`
      }
      if (line.match(/^\d+\.\s/)) {
        return `<li>${line.replace(/^\d+\.\s/, '')}</li>`
      }
      return `<p>${line}</p>`
    }).join('\n')
    
    // 如果有列表项，包装在 ul 中
    const hasListItems = block.content.some(line => line.match(/^[•\-\d+\.]\s/))
    const wrappedContent = hasListItems 
      ? `<ul class="card-list">${contentHtml}</ul>`
      : contentHtml
    
    return `
      <div class="${className}">
        <div class="card-header">
          <span class="card-icon">${block.icon}</span>
          <h4 class="card-title">${block.title}</h4>
        </div>
        <div class="card-body">
          ${wrappedContent}
        </div>
      </div>
    `
  }).join('\n')
}

/**
 * 格式化完整内容
 * 处理 Markdown、表格、标签等
 */
export function formatContent(content: string): string {
  if (!content) {
    return '<p style="color: #999;">内容为空</p>'
  }
  
  let formatted = content
  
  // 1. 先尝试解析内容块
  const { rawHtml } = parseContentBlocks(content)
  if (rawHtml) {
    formatted = rawHtml
  }
  
  // 2. 处理【】括号内容 - 转换为小标签
  formatted = formatted.replace(/【(.+?)】/g, '<span class="tag-badge">$1</span>')
  
  // 3. 处理 Markdown 标题
  formatted = formatted.replace(/^#### (.+)$/gm, '<h4 class="content-subtitle">$1</h4>')
  formatted = formatted.replace(/^### (.+)$/gm, '<h3 class="content-title">$1</h3>')
  formatted = formatted.replace(/^## (.+)$/gm, '<h2 class="section-heading">$1</h2>')
  
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
 */
function formatParagraphs(content: string): string {
  const lines = content.split('\n')
  const result: string[] = []
  
  for (let line of lines) {
    line = line.trim()
    if (!line) continue
    
    // 如果已经是 HTML 标签，直接添加
    if (line.startsWith('<')) {
      result.push(line)
    } else {
      // 普通文本转为段落
      result.push(`<p class="content-paragraph">${line}</p>`)
    }
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
