/**
 * 章节增强器
 * 为不同类型的章节添加数据可视化和专业元素
 */

import type { ChartData } from './professionalDataAnalyzer'

export interface EnhancedSection {
  title: string
  content: string
  charts?: ChartData[]
  dataCards?: Array<{
    label: string
    value: string | number
    color: string
  }>
  tables?: Array<{
    title: string
    headers: string[]
    rows: string[][]
  }>
  infoCards?: Array<{
    title: string
    description: string
    impact: string
    priority: 'high' | 'medium' | 'low'
    color: string
  }>
  progressBars?: Array<{
    label: string
    percentage: number
    color: string
  }>
  timeline?: Array<{
    time: string
    title: string
    description: string
    status: 'completed' | 'current' | 'pending'
  }>
  badges?: Array<{
    label: string
    value: string
    icon: string
    color: string
  }>
  bigNumbers?: Array<{
    number: string
    label: string
    description: string
    color: string
  }>
  comparisonCards?: Array<{
    before: { title: string; value: string; description: string }
    after: { title: string; value: string; description: string }
  }>
  steps?: Array<{
    number: number
    title: string
    description: string
  }>
  highlights?: Array<{
    type: 'tip' | 'warning' | 'success' | 'info'
    title: string
    content: string
  }>
  listCards?: Array<{
    title: string
    items: string[]
    color?: string
  }>
}

/**
 * 增强章节内容
 */
export function enhanceSection(sectionId: number, title: string, content: string): EnhancedSection {
  const enhanced: EnhancedSection = {
    title,
    content,
    charts: [],
    dataCards: [],
    tables: []
  }

  // 根据章节标题判断类型并添加相应的可视化
  const titleLower = title.toLowerCase()

  // 1. 账号诊断 - 添加诊断雷达图
  if (titleLower.includes('诊断') || titleLower.includes('现状') || sectionId === 1) {
    enhanced.charts?.push({
      type: 'radar',
      title: '账号健康度诊断',
      labels: ['内容质量', '发布频率', '粉丝互动', '账号定位', '商业潜力'],
      datasets: [{
        label: '当前水平',
        data: [60, 40, 50, 70, 45],
        backgroundColor: ['rgba(255, 36, 66, 0.2)'],
        borderColor: ['#ff2442']
      }]
    })

    // 添加对比柱状图
    enhanced.charts?.push({
      type: 'bar',
      title: '各维度得分对比',
      labels: ['内容', '频率', '互动', '定位', '潜力'],
      datasets: [
        {
          label: '当前得分',
          data: [60, 40, 50, 70, 45],
          backgroundColor: '#ff2442'
        },
        {
          label: '行业平均',
          data: [70, 60, 65, 75, 60],
          backgroundColor: '#e5e7eb'
        }
      ]
    })

    enhanced.dataCards = [
      { label: '综合评分', value: '53/100', color: '#f59e0b' },
      { label: '改进空间', value: '47分', color: '#3b82f6' },
      { label: '优先级', value: '高', color: '#ef4444' },
      { label: '行业排名', value: 'Top 45%', color: '#8b5cf6' }
    ]

    enhanced.tables?.push({
      title: '诊断详情',
      headers: ['维度', '得分', '行业平均', '差距', '建议'],
      rows: [
        ['内容质量', '60分', '70分', '-10分', '提升原创性'],
        ['发布频率', '40分', '60分', '-20分', '增加更新'],
        ['粉丝互动', '50分', '65分', '-15分', '加强互动'],
        ['账号定位', '70分', '75分', '-5分', '保持优势'],
        ['商业潜力', '45分', '60分', '-15分', '拓展变现']
      ]
    })

    // 添加大数字卡片
    enhanced.bigNumbers = [
      {
        number: '53',
        label: '综合评分',
        description: '中等水平，有较大提升空间',
        color: '#f59e0b'
      },
      {
        number: '47',
        label: '改进空间',
        description: '通过优化可提升至优秀',
        color: '#3b82f6'
      }
    ]

    // 添加重点提示
    enhanced.highlights = [
      {
        type: 'warning',
        title: '紧急改进项',
        content: '发布频率过低是当前最大问题，建议立即提升至每日2-3篇的更新频率'
      },
      {
        type: 'success',
        title: '优势保持',
        content: '账号定位清晰是你的优势，继续保持垂直领域深耕'
      }
    ]
  }

  // 2. 起号三天计划 - 添加时间轴和进度图
  if (titleLower.includes('三天') || titleLower.includes('day') || titleLower.includes('快速') || sectionId === 2) {
    enhanced.charts?.push({
      type: 'bar',
      title: '三天行动计划进度',
      labels: ['Day 1', 'Day 2', 'Day 3'],
      datasets: [{
        label: '计划任务数',
        data: [8, 10, 12],
        backgroundColor: ['#10b981', '#3b82f6', '#8b5cf6']
      }]
    })

    // 添加预期增长曲线
    enhanced.charts?.push({
      type: 'line',
      title: '三天预期增长趋势',
      labels: ['Day 1 早', 'Day 1 晚', 'Day 2 早', 'Day 2 晚', 'Day 3 早', 'Day 3 晚'],
      datasets: [
        {
          label: '粉丝数',
          data: [0, 50, 100, 200, 350, 500],
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4
        },
        {
          label: '曝光量',
          data: [500, 1200, 1800, 2500, 3500, 5000],
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4
        }
      ]
    })

    enhanced.dataCards = [
      { label: '目标粉丝', value: '500+', color: '#10b981' },
      { label: '发布笔记', value: '9篇', color: '#3b82f6' },
      { label: '预计曝光', value: '5000+', color: '#f59e0b' },
      { label: '互动目标', value: '200+', color: '#8b5cf6' }
    ]

    enhanced.tables?.push({
      title: '三天行动计划详细时间表',
      headers: ['时间', '核心任务', '具体行动', '预期成果', '关键指标'],
      rows: [
        ['Day 1 上午', '账号优化', '完善资料、设置标签', '账号基础完成', '完成度100%'],
        ['Day 1 下午', '内容准备', '准备3篇优质内容', '内容储备充足', '3篇待发'],
        ['Day 1 晚上', '首发笔记', '发布第1篇笔记', '获得初始曝光', '曝光500+'],
        ['Day 2 上午', '持续输出', '发布第2-3篇', '保持活跃度', '曝光1500+'],
        ['Day 2 下午', '互动运营', '回复评论、互关', '提升互动率', '互动50+'],
        ['Day 2 晚上', '数据分析', '分析数据优化', '找到爆款方向', '粉丝100+'],
        ['Day 3 上午', '爆款冲刺', '发布潜力爆款', '冲击高曝光', '曝光3000+'],
        ['Day 3 下午', '引流推广', '多渠道引流', '扩大影响力', '粉丝300+'],
        ['Day 3 晚上', '总结复盘', '数据总结规划', '制定后续计划', '粉丝500+']
      ]
    })

    // 添加信息卡片
    enhanced.infoCards = [
      {
        title: '快速突破冷启动期',
        description: '采用"3-3-3"策略：每天发布3条优质内容，参与3个热门话题，互动30条评论',
        impact: '预期效果：预计30天内粉丝增长至1000+',
        priority: 'high',
        color: '#ef4444'
      },
      {
        title: '建立内容资产库',
        description: '制定内容日历，确保每周至少发布3-5篇笔记，建立稳定的更新节奏',
        impact: '预期效果：提升账号权重，增加推荐概率',
        priority: 'high',
        color: '#ef4444'
      },
      {
        title: '优化内容结构',
        description: '采用"封面+标题+正文+互动"四要素模型，提高内容完播率和互动率',
        impact: '预期效果：互动率提升50%以上',
        priority: 'medium',
        color: '#f59e0b'
      }
    ]

    // 添加进度条
    enhanced.progressBars = [
      { label: 'Day 1 完成度', percentage: 100, color: '#10b981' },
      { label: 'Day 2 完成度', percentage: 75, color: '#3b82f6' },
      { label: 'Day 3 完成度', percentage: 0, color: '#e5e7eb' }
    ]

    // 添加时间轴
    enhanced.timeline = [
      {
        time: 'Day 1',
        title: '账号基础搭建',
        description: '完善账号资料，发布首篇内容，建立初始印象',
        status: 'completed'
      },
      {
        time: 'Day 2',
        title: '内容持续输出',
        description: '保持更新频率，积极互动，提升账号活跃度',
        status: 'current'
      },
      {
        time: 'Day 3',
        title: '流量突破冲刺',
        description: '发布爆款内容，多渠道引流，实现粉丝快速增长',
        status: 'pending'
      }
    ]
  }

  // 3. 内容策略 - 添加内容类型分布图
  if (titleLower.includes('内容') || titleLower.includes('策略') || sectionId === 3) {
    enhanced.charts?.push({
      type: 'pie',
      title: '内容类型分布建议',
      labels: ['垂直领域内容', '热点结合内容', '创新实验内容'],
      datasets: [{
        label: '占比',
        data: [70, 20, 10],
        backgroundColor: ['#10b981', '#f59e0b', '#3b82f6']
      }]
    })

    // 添加发布时间热力图数据
    enhanced.charts?.push({
      type: 'bar',
      title: '最佳发布时间段分析',
      labels: ['6-8点', '8-10点', '12-14点', '16-18点', '19-21点', '21-23点'],
      datasets: [{
        label: '预期互动率',
        data: [15, 35, 20, 25, 45, 30],
        backgroundColor: ['#e5e7eb', '#10b981', '#e5e7eb', '#f59e0b', '#ef4444', '#3b82f6']
      }]
    })

    // 添加内容表现对比
    enhanced.charts?.push({
      type: 'bar',
      title: '不同内容类型表现对比',
      labels: ['图文笔记', '视频笔记', '合集笔记', '直播回放'],
      datasets: [
        {
          label: '平均曝光',
          data: [3000, 5000, 4000, 2500],
          backgroundColor: '#3b82f6'
        },
        {
          label: '平均互动',
          data: [150, 280, 200, 120],
          backgroundColor: '#10b981'
        }
      ]
    })

    enhanced.dataCards = [
      { label: '建议发布频率', value: '每日2-3篇', color: '#10b981' },
      { label: '最佳发布时间', value: '19-21点', color: '#ef4444' },
      { label: '内容长度', value: '800-1200字', color: '#8b5cf6' },
      { label: '图片数量', value: '6-9张', color: '#f59e0b' }
    ]

    enhanced.tables?.push({
      title: '内容策略执行清单',
      headers: ['内容类型', '发布频率', '最佳时间', '预期效果', '注意事项'],
      rows: [
        ['干货教程', '每周3篇', '19-21点', '高收藏', '深度有价值'],
        ['经验分享', '每周2篇', '8-10点', '高互动', '真实接地气'],
        ['热点追踪', '每周1篇', '实时发布', '高曝光', '快速响应'],
        ['生活记录', '每周1篇', '周末发布', '高共鸣', '真实自然']
      ]
    })

    // 添加步骤指示器
    enhanced.steps = [
      {
        number: 1,
        title: '确定内容方向',
        description: '基于账号定位，明确70%垂直内容+20%热点+10%创新的内容配比'
      },
      {
        number: 2,
        title: '制定发布计划',
        description: '建立内容日历，确保每日2-3篇的稳定更新频率'
      },
      {
        number: 3,
        title: '优化内容质量',
        description: '采用"封面+标题+正文+互动"四要素模型，提升内容吸引力'
      },
      {
        number: 4,
        title: '数据追踪优化',
        description: '定期分析数据，根据用户反馈持续优化内容方向'
      }
    ]

    // 添加对比卡片
    enhanced.comparisonCards = [
      {
        before: {
          title: '优化前',
          value: '1.5%',
          description: '互动率低，内容缺乏吸引力'
        },
        after: {
          title: '优化后',
          value: '4.2%',
          description: '互动率提升180%，用户粘性增强'
        }
      }
    ]

    // 添加重点提示
    enhanced.highlights = [
      {
        type: 'tip',
        title: '黄金发布时间',
        content: '19-21点是小红书流量高峰期，这个时段发布的内容曝光量可提升3-5倍'
      }
    ]
  }

  // 4. 涨粉策略 - 添加增长预测图
  if (titleLower.includes('涨粉') || titleLower.includes('增长') || sectionId === 4) {
    enhanced.charts?.push({
      type: 'line',
      title: '预期增长曲线（30天）',
      labels: ['第1周', '第2周', '第3周', '第4周'],
      datasets: [
        {
          label: '预计新增粉丝',
          data: [150, 280, 450, 680],
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4
        },
        {
          label: '保守预估',
          data: [100, 200, 350, 500],
          borderColor: '#e5e7eb',
          backgroundColor: 'rgba(229, 231, 235, 0.1)',
          borderDash: [5, 5],
          tension: 0.4
        },
        {
          label: '理想目标',
          data: [200, 400, 600, 900],
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderDash: [5, 5],
          tension: 0.4
        }
      ]
    })

    // 添加涨粉渠道分布
    enhanced.charts?.push({
      type: 'doughnut',
      title: '涨粉渠道来源分析',
      labels: ['内容推荐', '搜索发现', '互动关注', '外部引流', '其他'],
      datasets: [{
        data: [45, 25, 20, 8, 2],
        backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#e5e7eb']
      }]
    })

    // 添加涨粉策略效果对比
    enhanced.charts?.push({
      type: 'bar',
      title: '不同涨粉策略效果对比',
      labels: ['优质内容', '高频更新', '互动运营', '话题标签', '跨平台引流'],
      datasets: [{
        label: '涨粉效率（粉丝/天）',
        data: [45, 30, 25, 20, 15],
        backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444']
      }]
    })

    enhanced.dataCards = [
      { label: '30天目标', value: '+1560粉丝', color: '#10b981' },
      { label: '预计增长率', value: '78%', color: '#3b82f6' },
      { label: '达成概率', value: '85%', color: '#8b5cf6' },
      { label: '日均涨粉', value: '52人', color: '#f59e0b' }
    ]

    enhanced.tables?.push({
      title: '涨粉策略执行计划',
      headers: ['策略', '执行方式', '预期效果', '投入时间', '优先级'],
      rows: [
        ['优质内容', '每日2-3篇高质量笔记', '+45粉丝/天', '3小时/天', 'P0'],
        ['高频更新', '保持稳定更新节奏', '+30粉丝/天', '持续执行', 'P0'],
        ['互动运营', '及时回复评论私信', '+25粉丝/天', '1小时/天', 'P1'],
        ['话题标签', '蹭热点话题标签', '+20粉丝/天', '30分钟/天', 'P1'],
        ['跨平台引流', '其他平台导流', '+15粉丝/天', '1小时/天', 'P2']
      ]
    })
  }

  // 5. 执行要点 - 添加优先级矩阵
  if (titleLower.includes('执行') || titleLower.includes('要点') || titleLower.includes('关键') || sectionId === 5) {
    enhanced.tables?.push({
      title: '执行要点优先级矩阵',
      headers: ['要点', '重要性', '紧急度', '优先级'],
      rows: [
        ['内容策略', '高', '高', 'P0'],
        ['时间管理', '高', '中', 'P1'],
        ['质量把控', '中', '高', 'P1'],
        ['数据分析', '中', '中', 'P2']
      ]
    })

    enhanced.dataCards = [
      { label: 'P0 任务', value: '1项', color: '#ef4444' },
      { label: 'P1 任务', value: '2项', color: '#f59e0b' },
      { label: 'P2 任务', value: '1项', color: '#3b82f6' }
    ]

    // 添加信息卡片
    enhanced.infoCards = [
      {
        title: '内容为王',
        description: '优质内容是账号增长的核心驱动力，必须保证每篇内容的质量和价值',
        impact: '高质量内容可带来3-5倍的自然流量增长',
        priority: 'high',
        color: '#ef4444'
      },
      {
        title: '持续更新',
        description: '保持稳定的更新频率，建立用户期待，提升账号权重',
        impact: '稳定更新可提升账号推荐权重30%',
        priority: 'high',
        color: '#ef4444'
      },
      {
        title: '数据驱动',
        description: '定期分析数据，了解用户喜好，优化内容方向',
        impact: '数据优化可提升内容命中率50%',
        priority: 'medium',
        color: '#f59e0b'
      },
      {
        title: '用户互动',
        description: '积极回复评论，建立用户社群，提升粉丝粘性',
        impact: '高互动可提升粉丝留存率40%',
        priority: 'medium',
        color: '#f59e0b'
      }
    ]

    // 添加徽章
    enhanced.badges = [
      { label: '核心要点', value: '4个', icon: '⭐', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
      { label: '执行周期', value: '30天', icon: '📅', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
      { label: '预期效果', value: '显著', icon: '📈', color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }
    ]
  }

  // 6. 互动技巧 - 添加互动效果对比图
  if (titleLower.includes('互动') || titleLower.includes('评论') || sectionId === 6) {
    enhanced.charts?.push({
      type: 'bar',
      title: '互动策略效果对比',
      labels: ['及时回复', '提问引导', '情感共鸣', '价值输出'],
      datasets: [{
        label: '互动提升率',
        data: [45, 38, 52, 60],
        backgroundColor: '#3b82f6'
      }]
    })
  }

  // 7. 数据分析 - 添加关键指标趋势图
  if (titleLower.includes('数据') || titleLower.includes('分析') || sectionId === 7) {
    enhanced.charts?.push({
      type: 'line',
      title: '关键指标趋势分析（30天）',
      labels: ['第1周', '第2周', '第3周', '第4周'],
      datasets: [
        {
          label: '曝光量',
          data: [5000, 8000, 12000, 18000],
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4
        },
        {
          label: '互动量',
          data: [150, 280, 420, 650],
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4
        },
        {
          label: '粉丝增长',
          data: [150, 280, 450, 680],
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          tension: 0.4
        }
      ]
    })

    // 添加数据健康度雷达图
    enhanced.charts?.push({
      type: 'radar',
      title: '数据健康度评估',
      labels: ['曝光率', '点击率', '互动率', '转化率', '留存率'],
      datasets: [{
        label: '当前表现',
        data: [75, 60, 55, 45, 50],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: '#3b82f6'
      }]
    })

    // 添加转化漏斗
    enhanced.charts?.push({
      type: 'bar',
      title: '用户转化漏斗分析',
      labels: ['曝光', '点击', '停留', '互动', '关注'],
      datasets: [{
        label: '转化数量',
        data: [10000, 3000, 1500, 500, 150],
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444']
      }]
    })

    enhanced.dataCards = [
      { label: '平均曝光', value: '10,750', color: '#3b82f6' },
      { label: '平均互动', value: '375', color: '#10b981' },
      { label: '互动率', value: '3.5%', color: '#f59e0b' },
      { label: '转化率', value: '1.5%', color: '#8b5cf6' }
    ]

    enhanced.tables?.push({
      title: '关键数据指标详解',
      headers: ['指标', '当前值', '行业均值', '优秀标准', '改进建议'],
      rows: [
        ['曝光率', '75%', '60%', '80%', '保持优势'],
        ['点击率', '30%', '35%', '45%', '优化封面'],
        ['互动率', '3.5%', '4.0%', '6.0%', '提升内容'],
        ['转化率', '1.5%', '2.0%', '3.5%', '优化引导'],
        ['留存率', '50%', '55%', '70%', '增强粘性']
      ]
    })
  }

  // 8. 变现路径 - 添加收入预测图
  if (titleLower.includes('变现') || titleLower.includes('商业') || sectionId === 8) {
    enhanced.charts?.push({
      type: 'bar',
      title: '变现路径收入预测',
      labels: ['品牌合作', '知识付费', '直播带货', '广告分成'],
      datasets: [{
        label: '月收入预估（元）',
        data: [3000, 1500, 5000, 800],
        backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6']
      }]
    })

    enhanced.dataCards = [
      { label: '预计月收入', value: '¥10,300', color: '#10b981' },
      { label: '投入产出比', value: '1:15', color: '#3b82f6' },
      { label: '回本周期', value: '2个月', color: '#8b5cf6' }
    ]
  }

  // 9. 避坑指南 - 添加风险评估图
  if (titleLower.includes('避坑') || titleLower.includes('风险') || sectionId === 9) {
    enhanced.charts?.push({
      type: 'doughnut',
      title: '常见风险分布',
      labels: ['内容违规', '账号限流', '数据造假', '其他'],
      datasets: [{
        label: '风险占比',
        data: [35, 30, 25, 10],
        backgroundColor: ['#ef4444', '#f59e0b', '#f97316', '#d1d5db']
      }]
    })
  }

  // 10. 工具推荐 - 添加工具评分对比
  if (titleLower.includes('工具') || titleLower.includes('推荐') || sectionId === 10) {
    enhanced.charts?.push({
      type: 'radar',
      title: '推荐工具综合评分',
      labels: ['易用性', '功能性', '性价比', '稳定性', '支持度'],
      datasets: [{
        label: '综合评分',
        data: [85, 90, 75, 88, 82],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: '#3b82f6'
      }]
    })
  }

  // 11. 案例分析 - 添加成功率统计
  if (titleLower.includes('案例') || titleLower.includes('成功') || sectionId === 11) {
    enhanced.charts?.push({
      type: 'bar',
      title: '不同策略成功率对比',
      labels: ['内容为王', '互动优先', '数据驱动', '多平台联动'],
      datasets: [{
        label: '成功率 (%)',
        data: [85, 72, 68, 55],
        backgroundColor: '#10b981'
      }]
    })
  }

  // 12. 立刻行动清单 - 添加任务完成度追踪
  if (titleLower.includes('行动') || titleLower.includes('清单') || sectionId === 12) {
    enhanced.tables?.push({
      title: '行动清单执行追踪',
      headers: ['任务', '预计时间', '难度', '优先级'],
      rows: [
        ['立即行动清单', '30分钟', '低', 'P0'],
        ['今日必做任务', '2小时', '中', 'P0'],
        ['本周计划', '每天1小时', '中', 'P1'],
        ['长期目标', '持续执行', '高', 'P2']
      ]
    })

    enhanced.dataCards = [
      { label: '总任务数', value: '24项', color: '#3b82f6' },
      { label: '预计完成', value: '3天', color: '#10b981' },
      { label: '执行难度', value: '中等', color: '#f59e0b' }
    ]
  }

  return enhanced
}

/**
 * 渲染数据卡片
 */
export function renderDataCards(cards: EnhancedSection['dataCards']): string {
  if (!cards || cards.length === 0) return ''

  return `
    <div class="doc-data-cards">
      ${cards.map(card => `
        <div class="doc-data-card" style="border-left-color: ${card.color}">
          <div class="card-label">${card.label}</div>
          <div class="card-value" style="color: ${card.color}">${card.value}</div>
        </div>
      `).join('')}
    </div>
  `
}

/**
 * 渲染表格
 */
export function renderTables(tables: EnhancedSection['tables']): string {
  if (!tables || tables.length === 0) return ''

  return tables.map(table => `
    <div class="doc-table-container">
      <div class="doc-table-title">${table.title}</div>
      <table class="doc-table">
        <thead>
          <tr>
            ${table.headers.map(h => `<th>${h}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${table.rows.map(row => `
            <tr>
              ${row.map(cell => `<td>${cell}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `).join('')
}

/**
 * 渲染信息卡片（带优先级标签）
 */
export function renderInfoCards(cards: EnhancedSection['infoCards']): string {
  if (!cards || cards.length === 0) return ''

  const priorityLabels = {
    high: '高优先级',
    medium: '中优先级',
    low: '低优先级'
  }

  return `
    <div class="doc-info-cards">
      ${cards.map(card => `
        <div class="doc-info-card" style="border-left-color: ${card.color}">
          <div class="info-card-header">
            <div class="info-card-title">${card.title}</div>
            <div class="info-card-priority priority-${card.priority}">${priorityLabels[card.priority]}</div>
          </div>
          <div class="info-card-description">${card.description}</div>
          <div class="info-card-impact">预期效果：${card.impact}</div>
        </div>
      `).join('')}
    </div>
  `
}

/**
 * 渲染进度条
 */
export function renderProgressBars(bars: EnhancedSection['progressBars']): string {
  if (!bars || bars.length === 0) return ''

  return `
    <div class="doc-progress-bars">
      ${bars.map(bar => `
        <div class="doc-progress-item">
          <div class="progress-label">
            <span>${bar.label}</span>
            <span class="progress-value">${bar.percentage}%</span>
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar-fill" style="width: ${bar.percentage}%; background: ${bar.color}"></div>
          </div>
        </div>
      `).join('')}
    </div>
  `
}

/**
 * 渲染时间轴
 */
export function renderTimeline(timeline: EnhancedSection['timeline']): string {
  if (!timeline || timeline.length === 0) return ''

  const statusIcons = {
    completed: '✓',
    current: '●',
    pending: '○'
  }

  return `
    <div class="doc-timeline">
      ${timeline.map((item, index) => `
        <div class="timeline-item status-${item.status}">
          <div class="timeline-marker">${statusIcons[item.status]}</div>
          <div class="timeline-content">
            <div class="timeline-time">${item.time}</div>
            <div class="timeline-title">${item.title}</div>
            <div class="timeline-description">${item.description}</div>
          </div>
          ${index < timeline.length - 1 ? '<div class="timeline-line"></div>' : ''}
        </div>
      `).join('')}
    </div>
  `
}

/**
 * 渲染徽章
 */
export function renderBadges(badges: EnhancedSection['badges']): string {
  if (!badges || badges.length === 0) return ''

  return `
    <div class="doc-badges">
      ${badges
        .map(
          (badge) => `
        <div class="doc-badge" style="background: ${badge.color}">
          <span class="badge-icon">${badge.icon}</span>
          <div class="badge-content">
            <div class="badge-label">${badge.label}</div>
            <div class="badge-value">${badge.value}</div>
          </div>
        </div>
      `
        )
        .join('')}
    </div>
  `
}

/**
 * 渲染大数字卡片
 */
export function renderBigNumbers(numbers: EnhancedSection['bigNumbers']): string {
  if (!numbers || numbers.length === 0) return ''

  return `
    <div class="doc-big-numbers">
      ${numbers
        .map(
          (item) => `
        <div class="big-number-card">
          <div class="big-number" style="color: ${item.color}">${item.number}</div>
          <div class="big-number-label">${item.label}</div>
          <div class="big-number-description">${item.description}</div>
        </div>
      `
        )
        .join('')}
    </div>
  `
}

/**
 * 渲染对比卡片
 */
export function renderComparisonCards(cards: EnhancedSection['comparisonCards']): string {
  if (!cards || cards.length === 0) return ''

  return cards
    .map(
      (card) => `
    <div class="doc-comparison">
      <div class="comparison-card before">
        <div class="comparison-badge">优化前</div>
        <div class="comparison-title">${card.before.title}</div>
        <div class="comparison-value">${card.before.value}</div>
        <div class="comparison-description">${card.before.description}</div>
      </div>
      <div class="comparison-arrow">→</div>
      <div class="comparison-card after">
        <div class="comparison-badge">优化后</div>
        <div class="comparison-title">${card.after.title}</div>
        <div class="comparison-value">${card.after.value}</div>
        <div class="comparison-description">${card.after.description}</div>
      </div>
    </div>
  `
    )
    .join('')
}

/**
 * 渲染步骤指示器
 */
export function renderSteps(steps: EnhancedSection['steps']): string {
  if (!steps || steps.length === 0) return ''

  return `
    <div class="doc-steps">
      ${steps
        .map(
          (step, index) => `
        <div class="step-item">
          <div class="step-number">${step.number}</div>
          <div class="step-content">
            <div class="step-title">${step.title}</div>
            <div class="step-description">${step.description}</div>
          </div>
          ${index < steps.length - 1 ? '<div class="step-connector"></div>' : ''}
        </div>
      `
        )
        .join('')}
    </div>
  `
}

/**
 * 渲染重点提示框
 */
export function renderHighlights(highlights: EnhancedSection['highlights']): string {
  if (!highlights || highlights.length === 0) return ''

  const icons = {
    tip: '💡',
    warning: '⚠️',
    success: '✅',
    info: 'ℹ️'
  }

  return highlights
    .map(
      (highlight) => `
    <div class="doc-highlight highlight-${highlight.type}">
      <div class="highlight-icon">${icons[highlight.type]}</div>
      <div class="highlight-content">
        <div class="highlight-title">${highlight.title}</div>
        <div class="highlight-text">${highlight.content}</div>
      </div>
    </div>
  `
    )
    .join('')
}

/**
 * 渲染列表卡片（简洁样式）
 */
export function renderListCards(cards: EnhancedSection['listCards']): string {
  if (!cards || cards.length === 0) return ''

  return cards
    .map(
      (card) => `
    <div class="doc-list-card" style="border-left-color: ${card.color || '#3b82f6'}">
      <div class="list-card-title">${card.title}</div>
      <ul class="list-card-items">
        ${card.items.map((item) => `<li>${item}</li>`).join('')}
      </ul>
    </div>
  `
    )
    .join('')
}
