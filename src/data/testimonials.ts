// 用户评价数据
export interface Testimonial {
  id: string
  name: string
  avatar: string
  role: string
  content: string
  rating: number
  achievement: string
  date: string
  featured: boolean
}

export const testimonials: Testimonial[] = [
  {
    id: '1',
    name: '小美',
    avatar: '/images/avatars/user1.jpg',
    role: '美妆博主',
    content: '使用这个工具生成的攻略非常专业，帮我理清了账号定位和内容方向。按照攻略执行后，3个月涨粉5万，现在已经开始接品牌合作了！',
    rating: 5,
    achievement: '3个月涨粉5万',
    date: '2024-11-18',
    featured: true
  },
  {
    id: '2',
    name: '职场小白',
    avatar: '/images/avatars/user2.jpg',
    role: '职场博主',
    content: '攻略中的涨粉技巧和内容创作方法都很实用，特别是数据分析部分，让我知道如何优化内容。现在我的笔记平均阅读量提升了5倍！',
    rating: 5,
    achievement: '阅读量提升5倍',
    date: '2024-11-15',
    featured: true
  },
  {
    id: '3',
    name: '吃货日记',
    avatar: '/images/avatars/user3.jpg',
    role: '美食博主',
    content: '从兼职到全职，这个工具一直陪伴着我。攻略中的商业化建议特别有价值，帮我找到了适合自己的变现路径，现在月入5万！',
    rating: 5,
    achievement: '月入5万',
    date: '2024-11-12',
    featured: true
  },
  {
    id: '4',
    name: '温馨小窝',
    avatar: '/images/avatars/user4.jpg',
    role: '家居博主',
    content: '攻略帮我找到了"租房改造"这个细分赛道，避开了激烈的竞争。现在粉丝10万+，每个月都有稳定的品牌合作收入。',
    rating: 5,
    achievement: '粉丝10万+',
    date: '2024-11-10',
    featured: true
  },
  {
    id: '5',
    name: '新手妈妈',
    avatar: '/images/avatars/user5.jpg',
    role: '母婴博主',
    content: '作为一个新手妈妈，这个工具让我知道如何把育儿经历变成有价值的内容。现在不仅涨了粉，还建立了自己的社群，找到了志同道合的朋友。',
    rating: 5,
    achievement: '建立5000人社群',
    date: '2024-11-08',
    featured: false
  },
  {
    id: '6',
    name: '旅行达人',
    avatar: '/images/avatars/user6.jpg',
    role: '旅行博主',
    content: '攻略中的内容创作技巧很实用，特别是标题和封面的优化方法。我的笔记点击率提升了3倍，现在每篇笔记都能上热门！',
    rating: 5,
    achievement: '点击率提升3倍',
    date: '2024-11-05',
    featured: false
  },
  {
    id: '7',
    name: '穿搭小姐姐',
    avatar: '/images/avatars/user7.jpg',
    role: '穿搭博主',
    content: '从0到3万粉丝，只用了2个月。攻略中的差异化定位策略让我找到了自己的特色，现在已经有固定的粉丝群体了。',
    rating: 5,
    achievement: '2个月涨粉3万',
    date: '2024-11-03',
    featured: false
  },
  {
    id: '8',
    name: '学习博主',
    avatar: '/images/avatars/user8.jpg',
    role: '学习博主',
    content: '攻略中的数据分析方法让我知道什么内容更受欢迎。现在我能精准把握用户需求，每篇笔记的收藏率都很高。',
    rating: 5,
    achievement: '收藏率提升400%',
    date: '2024-11-01',
    featured: false
  },
  {
    id: '9',
    name: '健身教练',
    avatar: '/images/avatars/user9.jpg',
    role: '健身博主',
    content: '攻略帮我规划了完整的内容矩阵，从健身教程到饮食建议，内容更系统了。粉丝粘性明显提升，复购率也提高了。',
    rating: 5,
    achievement: '粉丝粘性提升60%',
    date: '2024-10-28',
    featured: false
  },
  {
    id: '10',
    name: '理财小白',
    avatar: '/images/avatars/user10.jpg',
    role: '理财博主',
    content: '作为理财赛道的新人，攻略让我知道如何用简单易懂的方式分享专业知识。现在粉丝信任度很高，知识付费转化率达到5%。',
    rating: 5,
    achievement: '知识付费转化率5%',
    date: '2024-10-25',
    featured: false
  }
]

// 获取精选评价
export function getFeaturedTestimonials(): Testimonial[] {
  return testimonials.filter(t => t.featured)
}

// 获取最新评价
export function getLatestTestimonials(limit: number = 5): Testimonial[] {
  return testimonials
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit)
}

// 按角色获取评价
export function getTestimonialsByRole(role: string): Testimonial[] {
  return testimonials.filter(t => t.role === role)
}

// 计算平均评分
export function getAverageRating(): number {
  const sum = testimonials.reduce((acc, t) => acc + t.rating, 0)
  return sum / testimonials.length
}

// 获取总评价数
export function getTotalTestimonials(): number {
  return testimonials.length
}
