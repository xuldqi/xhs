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
  },
  {
    id: '6',
    title: '旅行博主@环游世界：6个月从500到10万粉丝的爆款策略',
    slug: 'travel-blogger-growth',
    category: '旅行攻略',
    niche: '深度旅行',
    excerpt: '通过"避坑攻略+真实体验"的内容策略，6个月涨粉10万，成为旅行领域的头部账号。',
    coverImage: '/images/cases/travel-case.jpg',
    accountName: '@环游世界',
    followersBefore: 500,
    followersAfter: 100000,
    growthPeriod: '6个月',
    growthRate: '+19900%',
    keyStrategies: [
      '避坑攻略：分享旅行中的真实踩坑经历',
      '路线规划：提供详细的旅行路线和攻略',
      '真实体验：不美化，真实记录旅行感受',
      '视频+图文：多形式内容展示',
      '互动引导：评论区答疑，建立信任'
    ],
    timeline: [
      {
        date: '2024-05',
        milestone: '账号启动',
        description: '确定"深度旅行攻略"定位，发布第一篇避坑攻略',
        followers: 500
      },
      {
        date: '2024-06',
        milestone: '首个爆款',
        description: '《云南7天避坑攻略》获得50万+阅读，涨粉2万',
        followers: 20000
      },
      {
        date: '2024-08',
        milestone: '持续爆款',
        description: '连续产出5篇爆款攻略，粉丝突破5万',
        followers: 50000
      },
      {
        date: '2024-11',
        milestone: '品牌合作',
        description: '开始接旅行品牌合作，粉丝突破10万',
        followers: 100000
      }
    ],
    dataPoints: [
      {
        metric: '平均阅读量',
        value: '15000+',
        change: '+500%'
      },
      {
        metric: '平均点赞数',
        value: '1200+',
        change: '+600%'
      },
      {
        metric: '平均收藏数',
        value: '800+',
        change: '+550%'
      },
      {
        metric: '互动率',
        value: '12%',
        change: '+8%'
      },
      {
        metric: '月收入',
        value: '30000元',
        change: 'new'
      }
    ],
    lessons: [
      '避坑内容价值高：用户更关注如何避坑，而不是美化后的旅行',
      '详细攻略受欢迎：提供具体的路线、费用、注意事项，用户更愿意收藏',
      '真实体验建立信任：不美化，真实记录，包括不好的体验，用户更信任',
      '多形式内容：视频展示风景，图文提供攻略，满足不同需求',
      '持续更新：保持每周2-3篇更新，建立用户期待'
    ],
    publishDate: '2024-11-15',
    featured: true
  },
  {
    id: '7',
    title: '职场博主@职场小助手：4个月从0到8万粉丝的知识变现之路',
    slug: 'career-blogger-growth',
    category: '职场干货',
    niche: '职场技能',
    excerpt: '通过"实用技能+真实案例"的内容策略，4个月涨粉8万，实现知识付费变现。',
    coverImage: '/images/cases/career-case.jpg',
    accountName: '@职场小助手',
    followersBefore: 0,
    followersAfter: 80000,
    growthPeriod: '4个月',
    growthRate: '+80000%',
    keyStrategies: [
      '实用技能：分享Excel、PPT等职场必备技能',
      '真实案例：用真实工作场景举例说明',
      '系统教程：从基础到进阶，系统化内容',
      '互动答疑：评论区解答用户问题',
      '知识付费：转化到课程和咨询'
    ],
    timeline: [
      {
        date: '2024-07',
        milestone: '账号启动',
        description: '确定"职场技能"定位，发布第一篇Excel教程',
        followers: 0
      },
      {
        date: '2024-08',
        milestone: '首个爆款',
        description: '《Excel10个必学函数》获得30万+阅读，涨粉3万',
        followers: 30000
      },
      {
        date: '2024-09',
        milestone: '持续爆款',
        description: '连续产出教程系列，粉丝突破5万',
        followers: 50000
      },
      {
        date: '2024-11',
        milestone: '知识变现',
        description: '推出付费课程，粉丝突破8万，月收入5万+',
        followers: 80000
      }
    ],
    dataPoints: [
      {
        metric: '平均阅读量',
        value: '12000+',
        change: '+400%'
      },
      {
        metric: '平均点赞数',
        value: '900+',
        change: '+350%'
      },
      {
        metric: '平均收藏数',
        value: '1500+',
        change: '+500%'
      },
      {
        metric: '互动率',
        value: '10%',
        change: '+7%'
      },
      {
        metric: '课程收入',
        value: '50000元/月',
        change: 'new'
      }
    ],
    lessons: [
      '实用技能受欢迎：职场技能类内容收藏率高，用户需求强烈',
      '系统化内容：从基础到进阶，形成完整体系，用户更愿意付费',
      '真实案例：用真实工作场景举例，用户更容易理解和应用',
      '互动答疑：评论区解答问题，建立专业形象，提升信任',
      '知识付费转化：通过免费内容引流，付费课程变现，形成闭环'
    ],
    publishDate: '2024-11-12',
    featured: true
  },
  {
    id: '8',
    title: 'AI虚拟人博主@数字Lucy：3个月打造虚拟IP，广告报价翻3倍',
    slug: 'ai-avatar-growth',
    category: '学习成长',
    niche: 'AI虚拟人',
    excerpt: '结合AIGC与真人运营团队，仅用3个月打造出高辨识度的虚拟人IP，单篇笔记平均曝光6万，广告报价从5k涨到15k。',
    coverImage: '/images/cases/ai-avatar.jpg',
    accountName: '@数字Lucy',
    followersBefore: 0,
    followersAfter: 35000,
    growthPeriod: '3个月',
    growthRate: 'new',
    keyStrategies: [
      '人设差异化：定位“多语言旅游向导+科技少女”',
      '内容矩阵：AI视频+幕后制作+教程拆解三条线并行',
      '技术透明：公开建模、配音、渲染流程，建立专业感',
      '合作联动：与旅游、数码品牌共创虚拟体验内容',
      '直播互动：固定周末直播，与粉丝进行AI问答'
    ],
    timeline: [
      {
        date: '2024-09',
        milestone: '形象搭建',
        description: '选定AI虚拟人定位，输出第一支角色设定视频',
        followers: 0
      },
      {
        date: '2024-10',
        milestone: '内容爆发',
        description: '“AI虚拟人带你云旅行巴黎”视频播放破80万，粉丝破2万',
        followers: 20000
      },
      {
        date: '2024-11',
        milestone: '商业化',
        description: '联动旅游品牌上线虚拟体验项目，报价提升至15k/条',
        followers: 35000
      }
    ],
    dataPoints: [
      { metric: '平均曝光量', value: '6万', change: 'new' },
      { metric: '平均完播率', value: '68%', change: '+20%' },
      { metric: '品牌合作单价', value: '15,000元', change: 'x3' },
      { metric: '直播峰值在线', value: '8,500', change: 'new' }
    ],
    lessons: [
      'AI虚拟人需要真人团队运营，脚本与互动决定用户粘性',
      '透明分享制作流程能够建立专业信任，更容易获得B端合作',
      '将AI内容与垂直赛道结合（旅行、教育）比单纯炫技更有商业价值',
      '直播是建立情感链接的关键场景，即便是虚拟形象亦然'
    ],
    publishDate: '2024-11-22',
    featured: true
  },
  {
    id: '9',
    title: '美食探店@深夜食堂：线下小店联名计划让单月营收翻4倍',
    slug: 'food-biz-growth',
    category: '美食探店',
    niche: '城市夜宵',
    excerpt: '通过“小红书探店+线下联名菜单”的组合打法，为本地夜宵店打造新流量入口，单月带客2100人次，联名菜单曝光累计260万。',
    coverImage: '/images/cases/food-case.jpg',
    accountName: '@深夜食堂',
    followersBefore: 3000,
    followersAfter: 60000,
    growthPeriod: '5个月',
    growthRate: '+1900%',
    keyStrategies: [
      '城市夜宵地图：以路线形式呈现，收藏率极高',
      '联名菜单：与小店合作推出限定菜品，粉丝限定价',
      '线下打卡任务：设置“夜宵护照”，鼓励用户线下盖章',
      '数据化复盘：用表格追踪到店人数、客单价、复购率',
      '本地社群：建立「夜食爱好者」群，组织线下聚会'
    ],
    timeline: [
      {
        date: '2024-06',
        milestone: '夜宵地图上线',
        description: '第一期《上海深夜小馆指南》登上城市热榜Top3',
        followers: 10000
      },
      {
        date: '2024-08',
        milestone: '联名计划启动',
        description: '与4家小店推出联名菜品，单月带客1200人',
        followers: 30000
      },
      {
        date: '2024-10',
        milestone: '线下活动',
        description: '举办“夜宵市集”，联名店单日营收破15万',
        followers: 60000
      }
    ],
    dataPoints: [
      { metric: '月GMV', value: '¥420,000', change: 'x4' },
      { metric: '线下带客', value: '2,100人/月', change: '+350%' },
      { metric: '联名菜品曝光', value: '260万+', change: 'new' },
      { metric: '社群复购', value: '62%', change: '+18%' }
    ],
    lessons: [
      '本地生活账号要从“记录”升级到“策划”，才能掌握议价权',
      '把线上内容转化为线下互动（护照、集章、联名）能提升用户仪式感',
      '数据可视化（到店人数、客单）让小店看到真实价值，合作更顺畅',
      '社群+线下活动的组合，可以持续沉淀高频用户'
    ],
    publishDate: '2024-11-25',
    featured: true
  },
  {
    id: '8',
    title: '内容创作者@吕白聊内容：12周从0到3万粉丝，变现40万',
    slug: 'lvbai-content-creator',
    category: '学习成长',
    niche: '内容创作',
    excerpt: '真实案例：新账号"吕白聊内容"在12周内从0粉丝增长到3万粉丝，并成功变现40万元。本文详细解析其增长策略和变现路径。',
    coverImage: '/images/cases/lvbai-case.jpg',
    accountName: '@吕白聊内容',
    followersBefore: 0,
    followersAfter: 30000,
    growthPeriod: '12周',
    growthRate: '+30000',
    keyStrategies: [
      '明确账号定位：内容创作领域，面向内容创作者和运营人员',
      '内容策略：方法论30% + 案例分享30% + 工具推荐20% + 行业洞察20%',
      '标题策略：数字+方法+结果，问题+解决方案，对比+优势',
      '发布频率：工作日每天1-2篇，周末每天1篇',
      '互动管理：及时回复评论，引导用户互动，参与话题讨论',
      '数据分析：每日数据查看，周度数据分析，月度策略调整',
      '变现策略：先提供价值建立信任，再考虑变现，提供真实价值'
    ],
    timeline: [
      {
        date: '第1-2周',
        milestone: '账号定位',
        description: '明确账号定位，完成账号包装，粉丝0-500',
        followers: 500
      },
      {
        date: '第3-4周',
        milestone: '内容积累',
        description: '开始内容创作，建立内容模板，粉丝500-2000',
        followers: 2000
      },
      {
        date: '第5-6周',
        milestone: '内容爆发',
        description: '多篇内容获得推荐，粉丝快速增长，粉丝2000-5000',
        followers: 5000
      },
      {
        date: '第7-8周',
        milestone: '持续增长',
        description: '内容质量稳定，粉丝持续增长，粉丝5000-10000',
        followers: 10000
      },
      {
        date: '第9-10周',
        milestone: '加速增长',
        description: '账号权重提升，内容获得更多推荐，粉丝10000-20000',
        followers: 20000
      },
      {
        date: '第11-12周',
        milestone: '稳定增长',
        description: '账号成熟，开始探索变现，粉丝20000-30000',
        followers: 30000
      }
    ],
    dataPoints: [
      { metric: '总发布数', value: '80+篇', change: '持续更新' },
      { metric: '爆文数', value: '15+篇', change: '18.75%' },
      { metric: '平均阅读量', value: '5000+', change: '稳定增长' },
      { metric: '平均互动率', value: '8%+', change: '高于行业平均' },
      { metric: '总变现', value: '¥400,000', change: '12周达成' },
      { metric: '课程销售', value: '¥250,000', change: '主要收入' },
      { metric: '咨询服务', value: '¥100,000', change: '高价值服务' },
      { metric: '品牌合作', value: '¥50,000', change: '额外收入' }
    ],
    lessons: [
      '账号定位要清晰：选择擅长的领域，明确目标用户，提供独特价值',
      '内容质量是根本：原创内容、实用价值、持续输出是关键',
      '运营策略要系统：发布频率稳定、互动管理及时、数据分析持续',
      '变现要循序渐进：先建立信任，再考虑变现，提供真实价值',
      '数据驱动优化：基于数据持续改进，而不是盲目尝试',
      '用户价值优先：只有持续为用户提供价值，才能实现真正的增长'
    ],
    publishDate: '2024-12-05',
    featured: true
  },
  {
    id: '9',
    title: '美妆品牌矩阵运营案例：多账号协同实现85万粉丝',
    slug: 'beauty-brand-matrix',
    category: '美妆护肤',
    niche: '品牌矩阵',
    excerpt: '某美妆品牌通过矩阵运营策略，建立主账号+子账号体系，总粉丝量达到85万+，品牌曝光率提升200%。',
    coverImage: '/images/cases/beauty-matrix-case.jpg',
    accountName: '美妆品牌矩阵',
    followersBefore: 0,
    followersAfter: 850000,
    growthPeriod: '6个月',
    growthRate: '+850000',
    keyStrategies: [
      '主账号定位：品牌官方账号，发布核心内容，粉丝50万',
      '子账号1：平价美妆账号，针对学生党，粉丝20万',
      '子账号2：高端美妆账号，针对轻奢人群，粉丝15万',
      '内容分发：同一内容在不同账号发布，根据定位调整',
      '账号管理：使用AdsPower指纹浏览器，避免账号关联',
      '内容统一：保持内容质量标准，避免低质量内容',
      '数据监控：跟踪各账号数据表现，持续优化策略'
    ],
    timeline: [
      {
        date: '第1个月',
        milestone: '账号建立',
        description: '建立主账号和2个子账号，完成账号定位和包装',
        followers: 50000
      },
      {
        date: '第2-3个月',
        milestone: '内容积累',
        description: '各账号开始内容输出，建立内容库，粉丝快速增长',
        followers: 300000
      },
      {
        date: '第4-5个月',
        milestone: '矩阵协同',
        description: '矩阵运营策略成熟，各账号协同发力，粉丝持续增长',
        followers: 600000
      },
      {
        date: '第6个月',
        milestone: '稳定运营',
        description: '矩阵体系稳定，品牌曝光率提升200%，总粉丝85万+',
        followers: 850000
      }
    ],
    dataPoints: [
      { metric: '总粉丝量', value: '85万+', change: '矩阵效应' },
      { metric: '品牌曝光', value: '提升200%', change: '显著提升' },
      { metric: '内容发布', value: '300+篇/月', change: '多账号协同' },
      { metric: '平均互动率', value: '6%+', change: '高于行业平均' }
    ],
    lessons: [
      '矩阵运营可以快速扩大品牌曝光，但需要投入较多资源',
      '账号定位要清晰，避免同质化竞争',
      '内容质量要统一，避免低质量内容影响整体',
      '账号管理要规范，避免账号关联风险',
      '数据监控要持续，根据数据调整策略'
    ],
    publishDate: '2024-12-05',
    featured: true
  },
  {
    id: '10',
    title: '本地生活账号@城市探索者：矩阵运营实现55万粉丝',
    slug: 'local-life-matrix',
    category: '旅行攻略',
    niche: '本地生活',
    excerpt: '本地生活账号通过矩阵运营，建立城市探索主账号+美食探店+夜生活子账号体系，总粉丝量达到55万+。',
    coverImage: '/images/cases/local-life-case.jpg',
    accountName: '@城市探索者矩阵',
    followersBefore: 3000,
    followersAfter: 550000,
    growthPeriod: '8个月',
    growthRate: '+18233%',
    keyStrategies: [
      '主账号：城市探索（30万粉丝），发布城市攻略、路线规划',
      '子账号1：美食探店（15万粉丝），发布美食推荐、探店体验',
      '子账号2：夜生活（10万粉丝），发布夜宵、酒吧、娱乐推荐',
      '内容联动：主账号和子账号内容相互引流，形成流量闭环',
      '本地合作：与本地商家合作，推出联名活动，提升影响力',
      '社群运营：建立本地生活社群，组织线下活动，提升用户粘性'
    ],
    timeline: [
      {
        date: '第1-2个月',
        milestone: '账号建立',
        description: '建立主账号和子账号，完成账号定位，粉丝3000-10000',
        followers: 10000
      },
      {
        date: '第3-4个月',
        milestone: '内容积累',
        description: '各账号开始内容输出，建立内容库，粉丝10000-200000',
        followers: 200000
      },
      {
        date: '第5-6个月',
        milestone: '矩阵协同',
        description: '矩阵运营策略成熟，内容联动效果明显，粉丝200000-400000',
        followers: 400000
      },
      {
        date: '第7-8个月',
        milestone: '稳定运营',
        description: '矩阵体系稳定，本地合作增多，总粉丝55万+',
        followers: 550000
      }
    ],
    dataPoints: [
      { metric: '总粉丝量', value: '55万+', change: '矩阵效应' },
      { metric: '本地合作', value: '50+商家', change: '深度合作' },
      { metric: '线下活动', value: '20+场', change: '用户粘性提升' },
      { metric: '社群成员', value: '5000+', change: '私域沉淀' }
    ],
    lessons: [
      '本地生活账号适合矩阵运营，可以覆盖不同场景',
      '内容联动可以形成流量闭环，提升整体效果',
      '本地合作可以提升影响力，但需要建立信任',
      '社群运营可以沉淀用户，提升用户粘性',
      '线下活动可以增强用户连接，提升品牌影响力'
    ],
    publishDate: '2024-12-05',
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
