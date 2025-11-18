import { formatContent } from './src/utils/contentFormatter.ts'

const testContent = `
✅ 账号优势
- 内容垂直度高，定位清晰在【美食探店】领域
- 粉丝互动率达到 8.5%，高于行业平均水平
- 发布时间稳定，保持在 19:00-21:00 黄金时段

⚠️ 需要改进的地方
- 封面图设计缺乏统一风格，建议使用【固定模板】
- 标题吸引力不足，点击率仅为 2.3%
- 发布频率不稳定，建议保持【每周3-5篇】的节奏

💡 专业建议
- 在 7:00-9:00 和 19:00-22:00 发布内容
- 使用【情感共鸣】+【实用干货】的内容策略
- 每篇笔记控制在 800-1200字 之间
`

console.log('原始内容：')
console.log(testContent)
console.log('\n\n格式化后的HTML：')
console.log(formatContent(testContent))
