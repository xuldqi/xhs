/**
 * 格式化 Markdown 内容为 HTML
 */
export function formatMarkdown(content: string): string {
  let html = content
  
  // 转换标题
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>')
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>')
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>')
  
  // 转换粗体
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/__(.*?)__/g, '<strong>$1</strong>')
  
  // 转换斜体
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')
  html = html.replace(/_(.*?)_/g, '<em>$1</em>')
  
  // 转换列表
  html = html.replace(/^\* (.*$)/gim, '<li>$1</li>')
  html = html.replace(/^- (.*$)/gim, '<li>$1</li>')
  html = html.replace(/^(\d+)\. (.*$)/gim, '<li>$2</li>')
  
  // 包装列表
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
  
  // 转换段落
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
 * 添加 emoji 和样式标记
 */
export function enhanceContent(content: string): string {
  let enhanced = content
  
  // 为关键词添加样式
  const keywords = ['注意', '重点', '技巧', '提示', '警告']
  keywords.forEach(keyword => {
    const regex = new RegExp(`(${keyword})`, 'g')
    enhanced = enhanced.replace(regex, '<span class="keyword">$1</span>')
  })
  
  // 为数字添加高亮
  enhanced = enhanced.replace(/(\d+)/g, '<span class="number">$1</span>')
  
  return enhanced
}

/**
 * 解析表格
 */
export function parseTable(content: string): { headers: string[], rows: string[][] } | null {
  const lines = content.split('\n').filter(line => line.trim())
  
  if (lines.length < 2) return null
  
  // 检查是否是表格格式
  if (!lines[1].includes('|---')) return null
  
  // 解析表头
  const headers = lines[0]
    .split('|')
    .map(h => h.trim())
    .filter(h => h)
  
  // 解析行
  const rows = lines.slice(2).map(line =>
    line.split('|')
      .map(cell => cell.trim())
      .filter(cell => cell)
  )
  
  return { headers, rows }
}

/**
 * 渲染表格为 HTML
 */
export function renderTable(headers: string[], rows: string[][]): string {
  let html = '<table class="content-table">'
  
  // 表头
  html += '<thead><tr>'
  headers.forEach(header => {
    html += `<th>${header}</th>`
  })
  html += '</tr></thead>'
  
  // 表体
  html += '<tbody>'
  rows.forEach(row => {
    html += '<tr>'
    row.forEach(cell => {
      html += `<td>${cell}</td>`
    })
    html += '</tr>'
  })
  html += '</tbody>'
  
  html += '</table>'
  
  return html
}

/**
 * 解析清单
 */
export function parseChecklist(content: string): { id: string, text: string, checked: boolean }[] {
  const lines = content.split('\n')
  const checklist: { id: string, text: string, checked: boolean }[] = []
  
  lines.forEach((line, index) => {
    const match = line.match(/^- \[([ x])\] (.+)$/)
    if (match) {
      checklist.push({
        id: `item-${index}`,
        text: match[2],
        checked: match[1] === 'x'
      })
    }
  })
  
  return checklist
}

/**
 * 渲染清单为 HTML
 */
export function renderChecklist(items: { id: string, text: string, checked: boolean }[]): string {
  let html = '<ul class="checklist">'
  
  items.forEach(item => {
    const checkedClass = item.checked ? 'checked' : ''
    html += `
      <li class="checklist-item ${checkedClass}">
        <input type="checkbox" ${item.checked ? 'checked' : ''} disabled />
        <span>${item.text}</span>
      </li>
    `
  })
  
  html += '</ul>'
  
  return html
}

/**
 * 完整格式化内容
 */
export function formatContent(content: string): string {
  // 先处理表格
  const tableMatch = content.match(/\|.*\|[\s\S]*?\n\|[-:| ]+\|[\s\S]*?(?=\n\n|\n#|$)/g)
  if (tableMatch) {
    tableMatch.forEach(tableStr => {
      const table = parseTable(tableStr)
      if (table) {
        const tableHtml = renderTable(table.headers, table.rows)
        content = content.replace(tableStr, tableHtml)
      }
    })
  }
  
  // 处理清单
  const checklistMatch = content.match(/(?:^- \[[ x]\] .+$\n?)+/gm)
  if (checklistMatch) {
    checklistMatch.forEach(checklistStr => {
      const checklist = parseChecklist(checklistStr)
      if (checklist.length > 0) {
        const checklistHtml = renderChecklist(checklist)
        content = content.replace(checklistStr, checklistHtml)
      }
    })
  }
  
  // 格式化 Markdown
  let formatted = formatMarkdown(content)
  
  // 增强内容
  formatted = enhanceContent(formatted)
  
  return formatted
}
