/**
 * 简单的 Markdown 渲染器
 */
export function renderMarkdown(markdown: string): string {
  let html = markdown
  
  // 标题
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>')
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>')
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>')
  
  // 粗体
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  
  // 斜体
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')
  
  // 无序列表
  html = html.replace(/^\- (.*$)/gim, '<li>$1</li>')
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
  
  // 有序列表
  html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
  
  // 段落
  html = html.replace(/\n\n/g, '</p><p>')
  html = '<p>' + html + '</p>'
  
  // 清理多余的标签
  html = html.replace(/<p><h/g, '<h')
  html = html.replace(/<\/h(\d)><\/p>/g, '</h$1>')
  html = html.replace(/<p><ul>/g, '<ul>')
  html = html.replace(/<\/ul><\/p>/g, '</ul>')
  
  return html
}

/**
 * 提取表格
 */
export function extractTables(content: string): { tables: string[]; cleanContent: string } {
  const tables: string[] = []
  const tableRegex = /\|(.+)\|[\r\n]+\|[-:\s|]+\|[\r\n]+((?:\|.+\|[\r\n]*)+)/g
  
  let match
  while ((match = tableRegex.exec(content)) !== null) {
    tables.push(match[0])
  }
  
  const cleanContent = content.replace(tableRegex, '[TABLE]')
  
  return { tables, cleanContent }
}

/**
 * 渲染表格
 */
export function renderTable(markdown: string): string {
  const lines = markdown.trim().split('\n')
  if (lines.length < 3) return markdown
  
  const headers = lines[0].split('|').filter(cell => cell.trim())
  const rows = lines.slice(2).map(line => 
    line.split('|').filter(cell => cell.trim())
  )
  
  let html = '<table class="markdown-table">'
  
  // 表头
  html += '<thead><tr>'
  headers.forEach(header => {
    html += `<th>${header.trim()}</th>`
  })
  html += '</tr></thead>'
  
  // 表体
  html += '<tbody>'
  rows.forEach(row => {
    html += '<tr>'
    row.forEach(cell => {
      html += `<td>${cell.trim()}</td>`
    })
    html += '</tr>'
  })
  html += '</tbody>'
  
  html += '</table>'
  
  return html
}

/**
 * 完整渲染
 */
export function renderContent(content: string): string {
  // 提取表格
  const { tables, cleanContent } = extractTables(content)
  
  // 渲染 Markdown
  let html = renderMarkdown(cleanContent)
  
  // 插入表格
  tables.forEach(table => {
    html = html.replace('[TABLE]', renderTable(table))
  })
  
  return html
}
