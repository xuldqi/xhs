/**
 * PDF 导出工具
 * 使用 jspdf 和 html2canvas 将指南内容导出为 PDF
 */

export interface ExportOptions {
  filename?: string
  quality?: number
  scale?: number
}

/**
 * 导出 PDF
 */
export async function exportToPDF(
  element: HTMLElement,
  options: ExportOptions = {}
): Promise<void> {
  const {
    filename = '小红书涨粉指南.pdf',
    quality = 0.95,
    scale = 2
  } = options

  try {
    const { default: jsPDF } = await import('jspdf');
    const { default: html2canvas } = await import('html2canvas');
    // 1. 将 HTML 转换为 Canvas
    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    })

    // 2. 获取图片数据
    const imgData = canvas.toDataURL('image/jpeg', quality)
    
    // 3. 计算 PDF 尺寸
    const imgWidth = 210 // A4 宽度 (mm)
    const pageHeight = 297 // A4 高度 (mm)
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight
    
    // 4. 创建 PDF
    const pdf = new jsPDF('p', 'mm', 'a4')
    let position = 0

    // 5. 添加第一页
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    // 6. 如果内容超过一页，添加更多页
    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    // 7. 保存 PDF
    pdf.save(filename)
  } catch (error) {
    console.error('PDF 导出失败:', error)
    throw new Error('PDF 导出失败，请重试')
  }
}

/**
 * 准备导出元素（展开所有折叠面板）
 */
export function prepareElementForExport(element: HTMLElement): () => void {
  // 保存原始状态
  const originalDisplay = element.style.display
  const originalPosition = element.style.position
  
  // 临时修改样式以便完整渲染
  element.style.display = 'block'
  element.style.position = 'relative'
  
  // 展开所有 el-collapse
  const collapseItems = element.querySelectorAll('.el-collapse-item')
  const originalStates: boolean[] = []
  
  collapseItems.forEach((item, index) => {
    const isActive = item.classList.contains('is-active')
    originalStates[index] = isActive
    if (!isActive) {
      item.classList.add('is-active')
      const content = item.querySelector('.el-collapse-item__wrap')
      if (content instanceof HTMLElement) {
        content.style.display = 'block'
        content.style.height = 'auto'
      }
    }
  })
  
  // 返回恢复函数
  return () => {
    element.style.display = originalDisplay
    element.style.position = originalPosition
    
    collapseItems.forEach((item, index) => {
      if (!originalStates[index]) {
        item.classList.remove('is-active')
        const content = item.querySelector('.el-collapse-item__wrap')
        if (content instanceof HTMLElement) {
          content.style.display = ''
          content.style.height = ''
        }
      }
    })
  }
}
