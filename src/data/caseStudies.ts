// 案例库数据
export interface CaseStudy {
  id: string
  title: string
  slug: string
  category: string
  niche: string
  excerpt: string
  coverImage: string
  accountName: string
  followersBefore: number
  followersAfter: number
  growthPeriod: string
  growthRate: string
  keyStrategies: string[]
  timeline: TimelineEvent[]
  dataPoints: DataPoint[]
  lessons: string[]
  publishDate: string
  featured: boolean
}

export interface TimelineEvent {
  date: string
  milestone: string
  description: string
  followers: number
}

export interface DataPoint {
  metric: string
  value: string
  change: string
}

export const caseStudies: CaseStudy[] = [
  {
    id: '1',
    title: '美妆博主@小美酱：3个月从0到5万粉丝的逆袭之路',
    slug: 'beauty-blogger-growth',
    category: '美妆护肤',
    niche: '平价美妆',
    excerpt: '一个普通女孩如何通过精准定位和优质内容，在竞争激烈的美妆赛道脱颖而出，3个月涨粉5万。',
    coverImage: '/images/cases/beauty-case.jpg',
    accountName: '@小美酱',
    followersBefore: 0,
    followersAfter: 50000,
    growthPeriod: '3个月',
    growthRate: '+5000%',
    keyStrategies: [
      '差异化定位：专注平价美妆',
      '真人测评：真实使用感受',
      '对比评测：同价位产品横评',
      '互动引导：评论区答疑解惑',
      '持续更新：每周3-5篇笔记'
    ],
    timeline: [
      {
        date: '2024-08',
        milestone: '账号启动',
        description: '确定"平价美妆测评"定位，发布第一篇笔记',
        followers: 0
      },
      {
        date: '2024-09',
        milestone: '首个爆款',
        description: '《50元以下的神仙面膜》获得10万+阅读，涨粉5000',
        followers: 5000
      },
      {
        date: '2024-10',
        milestone: '持续爆款',
        description: '连续产出3篇爆款笔记，粉丝突破2万',
        followers: 20000
      },
      {
        date: '2024-11',
        milestone: '品牌合作',
        description: '开始接品牌合作，粉丝突破5万',
        followers: 50000
      }
    ],
    dataPoints: [
      {
        metric: '平均阅读量',
        value: '8000+',
        change: '+400%'
      },
      {
        metric: '平均点赞数',
        value: '500+',
        change: '+350%'
      },
      {
        metric: '平均收藏数',
        value: '300+',
        change: '+380%'
      },
      {
        metric: '互动率',
        value: '12%',
        change: '+8%'
      }
    ],
    lessons: [
      '差异化定位是突围的关键：在竞争激烈的美妆赛道，选择"平价美妆"这个细分领域，避开了与大博主的正面竞争',
      '真实测评建立信任：坚持真人出镜，真实分享使用感受，不夸大效果，赢得了用户信任',
      '持续输出保持活跃：保持每周3-5篇的更新频率，让用户养成关注习惯',
      '数据驱动优化内容：通过分析数据，发现用户更喜欢对比评测类内容，及时调整内容方向',
      '积极互动增强粘性：每天花1小时回复评论和私信，建立了良好的用户关系'
    ],
    publishDate: '2024-11-20',
    featured: true
  },
  {
    id: '2',
    title: '职场博主@职场小白：如何用干货内容月涨2万精准粉丝',
    slug: 'career-blogger-growth',
    category: '职场干货',
    niche: '职场新人',
    excerpt: '聚焦职场新人痛点，通过系统化的干货内容，快速建立专业形象，实现精准涨粉和高效变现。',
    coverImage: '/images/cases/career-case.jpg',
    accountName: '@职场小白',
    followersBefore: 500,
    followersAfter: 20500,
    growthPeriod: '1个月',
    growthRate: '+4000%',
    keyStrategies: [
      '精准定位：聚焦职场新人群体',
      '系统化内容：打造职场成长体系',
      '干货为王：每篇都有实操价值',
      '模板工具：提供可下载的资源',
      '社群运营：建立私域流量池'
    ],
    timeline: [
      {
        date: '2024-10-01',
        milestone: '重新定位',
        description: '从泛职场内容转向职场新人细分赛道',
        followers: 500
      },
      {
        date: '2024-10-10',
        milestone: '爆款笔记',
        description: '《应届生简历模板》获得50万+阅读，涨粉8000',
        followers: 8500
      },
      {
        date: '2024-10-20',
        milestone: '系列内容',
        description: '推出"职场新人生存指南"系列，持续涨粉',
        followers: 15000
      },
      {
        date: '2024-10-31',
        milestone: '知识付费',
        description: '推出职场课程，粉丝突破2万',
        followers: 20500
      }
    ],
    dataPoints: [
      {
        metric: '平均阅读量',
        value: '15000+',
        change: '+600%'
      },
      {
        metric: '平均收藏数',
        value: '800+',
        change: '+500%'
      },
      {
        metric: '粉丝转化率',
        value: '8%',
        change: '+5%'
      },
      {
        metric: '课程转化率',
        value: '3%',
        change: 'new'
      }
    ],
    lessons: [
      '细分定位更容易突围：从泛职场转向职场新人后，内容更聚焦，用户更精准',
      '系统化内容建立专业度：不是零散的干货，而是成体系的知识，让用户感受到专业性',
      '提供实操工具增加价值：简历模板、面试话术等可下载资源，大大提升了内容价值',
      '私域运营提升变现：通过社群运营，建立了稳定的私域流量，为知识付费打下基础',
      '数据分析指导内容：发现用户对"简历"和"面试"话题最感兴趣，重点产出相关内容'
    ],
    publishDate: '2024-11-18',
    featured: true
  },
  {
    id: '3',
    title: '美食博主@吃货日记：从兼职到全职，月入5万的成长之路',
    slug: 'food-blogger-monetization',
    category: '美食探店',
    niche: '本地探店',
    excerpt: '一个普通上班族如何通过美食探店，从兼职副业做到全职博主，实现月入5万的商业化。',
    coverImage: '/images/cases/food-case.jpg',
    accountName: '@吃货日记',
    followersBefore: 2000,
    followersAfter: 80000,
    growthPeriod: '6个月',
    growthRate: '+3900%',
    keyStrategies: [
      '本地化定位：深耕本地美食',
      '真实探店：不接受虚假推广',
      '视频为主：短视频更有代入感',
      '商家合作：建立长期合作关系',
      '矩阵运营：多平台同步运营'
    ],
    timeline: [
      {
        date: '2024-05',
        milestone: '兼职起步',
        description: '利用周末时间探店，发布美食笔记',
        followers: 2000
      },
      {
        date: '2024-07',
        milestone: '粉丝破万',
        description: '持续输出优质内容，粉丝突破1万',
        followers: 10000
      },
      {
        date: '2024-09',
        milestone: '商业化起步',
        description: '开始接商家合作，月收入突破1万',
        followers: 30000
      },
      {
        date: '2024-11',
        milestone: '全职转型',
        description: '辞职全职做博主，月收入突破5万',
        followers: 80000
      }
    ],
    dataPoints: [
      {
        metric: '月收入',
        value: '50000元',
        change: '+2400%'
      },
      {
        metric: '合作商家',
        value: '30+',
        change: 'new'
      },
      {
        metric: '视频播放量',
        value: '50万+',
        change: '+800%'
      },
      {
        metric: '粉丝活跃度',
        value: '15%',
        change: '+10%'
      }
    ],
    lessons: [
      '本地化定位建立壁垒：深耕本地美食，成为本地美食的代名词，建立了竞争壁垒',
      '真实性是最大的竞争力：坚持真实探店，不接受虚假推广，赢得了用户信任和商家认可',
      '视频内容更有优势：美食类内容用视频呈现更有代入感，播放量和互动率都更高',
      '长期合作更稳定：与优质商家建立长期合作关系，收入更稳定，合作更深入',
      '多平台运营扩大影响：同步运营小红书、抖音、B站，扩大了影响力和收入来源'
    ],
    publishDate: '2024-11-15',
    featured: true
  },
  {
    id: '4',
    title: '家居博主@温馨小窝：租房改造赛道的黑马，半年涨粉10万',
    slug: 'home-decor-growth',
    category: '家居装修',
    niche: '租房改造',
    excerpt: '聚焦租房改造这个细分赛道，用低成本改造案例打动年轻人，半年时间涨粉10万。',
    coverImage: '/images/cases/home-case.jpg',
    accountName: '@温馨小窝',
    followersBefore: 0,
    followersAfter: 100000,
    growthPeriod: '6个月',
    growthRate: '+10000%',
    keyStrategies: [
      '痛点定位：解决租房党的改造需求',
      '低成本方案：500-2000元改造方案',
      '前后对比：视觉冲击力强',
      '详细教程：可复制的改造步骤',
      '好物推荐：精选性价比产品'
    ],
    timeline: [
      {
        date: '2024-05',
        milestone: '账号启动',
        description: '发布第一个租房改造案例',
        followers: 0
      },
      {
        date: '2024-07',
        milestone: '爆款出现',
        description: '《500元改造出租屋》获得100万+阅读',
        followers: 15000
      },
      {
        date: '2024-09',
        milestone: '系列内容',
        description: '推出"租房改造系列"，持续爆款',
        followers: 50000
      },
      {
        date: '2024-11',
        milestone: '品牌合作',
        description: '与家居品牌深度合作，粉丝破10万',
        followers: 100000
      }
    ],
    dataPoints: [
      {
        metric: '平均阅读量',
        value: '30000+',
        change: '+1000%'
      },
      {
        metric: '平均收藏数',
        value: '2000+',
        change: '+900%'
      },
      {
        metric: '带货转化率',
        value: '5%',
        change: 'new'
      },
      {
        metric: '月收入',
        value: '30000元',
        change: 'new'
      }
    ],
    lessons: [
      '细分赛道机会更大：租房改造是家居赛道的细分领域，竞争相对较小，更容易出头',
      '痛点内容更受欢迎：解决租房党的实际痛点，内容更有价值，用户更愿意互动',
      '视觉冲击很重要：前后对比图的视觉冲击力，是吸引用户的关键',
      '可复制性增加价值：提供详细的改造步骤和产品链接，让用户可以照着做',
      '带货是主要变现方式：通过推荐改造用品，实现了稳定的带货收入'
    ],
    publishDate: '2024-11-12',
    featured: true
  },
  {
    id: '5',
    title: '母婴博主@新手妈妈：从焦虑到自信，用真实记录涨粉8万',
    slug: 'parenting-blogger-growth',
    category: '母婴育儿',
    niche: '新手妈妈',
    excerpt: '一个新手妈妈用真实的育儿记录，分享成长经验，与用户共同成长，8个月涨粉8万。',
    coverImage: '/images/cases/parenting-case.jpg',
    accountName: '@新手妈妈',
    followersBefore: 0,
    followersAfter: 80000,
    growthPeriod: '8个月',
    growthRate: '+8000%',
    keyStrategies: [
      '真实记录：分享真实的育儿经历',
      '共同成长：与用户一起学习进步',
      '避坑指南：分享踩过的坑',
      '好物推荐：精选实用母婴用品',
      '情感共鸣：理解新手妈妈的焦虑'
    ],
    timeline: [
      {
        date: '2024-03',
        milestone: '账号启动',
        description: '宝宝出生，开始记录育儿日常',
        followers: 0
      },
      {
        date: '2024-05',
        milestone: '找到方向',
        description: '确定"新手妈妈成长记"定位',
        followers: 5000
      },
      {
        date: '2024-08',
        milestone: '持续输出',
        description: '每周分享育儿经验，粉丝稳步增长',
        followers: 30000
      },
      {
        date: '2024-11',
        milestone: '社群运营',
        description: '建立新手妈妈社群，粉丝破8万',
        followers: 80000
      }
    ],
    dataPoints: [
      {
        metric: '平均阅读量',
        value: '12000+',
        change: '+500%'
      },
      {
        metric: '评论互动率',
        value: '18%',
        change: '+12%'
      },
      {
        metric: '社群成员',
        value: '5000+',
        change: 'new'
      },
      {
        metric: '月收入',
        value: '20000元',
        change: 'new'
      }
    ],
    lessons: [
      '真实性建立信任：不装专家，真实分享自己的育儿经历，更容易获得用户信任',
      '情感共鸣很重要：理解新手妈妈的焦虑和困惑，提供情感支持，建立了强连接',
      '避坑内容受欢迎：分享自己踩过的坑，帮助其他妈妈避坑，内容价值高',
      '社群运营增强粘性：建立新手妈妈社群，大家互相支持，用户粘性很高',
      '精准推荐更有效：只推荐自己用过的好物，转化率更高，用户更信任'
    ],
    publishDate: '2024-11-10',
    featured: false
  }
]

// 按分类获取案例
export function getCasesByCategory(category: string): CaseStudy[] {
  return caseStudies.filter(c => c.category === category)
}

// 获取精选案例
export function getFeaturedCases(): CaseStudy[] {
  return caseStudies.filter(c => c.featured)
}

// 根据slug获取案例
export function getCaseBySlug(slug: string): CaseStudy | undefined {
  return caseStudies.find(c => c.slug === slug)
}

// 案例分类
export const caseCategories = [
  '美妆护肤',
  '穿搭时尚',
  '美食探店',
  '旅行攻略',
  '家居装修',
  '母婴育儿',
  '职场干货',
  '学习成长'
]
