// 灵感话题库数据适配层
// 整合"人生第一次"数据，转换为适合小红书选题的格式

export interface TopicInspiration {
  id: string;
  title: string;
  category: string;
  categoryId: string;
  subCategoryId?: string;
  tags: string[];
  keywords: string[];
  intro: string;
  // 小红书相关字段
  xhsTitle: string; // 适合小红书的标题
  xhsTopics: string[]; // 可衍生的选题方向
  xhsKeywords: string[]; // 适合小红书的关键词
  relevance: number; // 与小红书内容的关联度（1-10）
  difficulty: string;
  duration?: string;
  cost?: string;
  featured: boolean;
  // 原始数据
  steps?: Array<{ title: string; detail: string }>;
  tips?: string[];
  pitfalls?: string[];
}

export interface TopicCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  children?: TopicCategory[];
  count?: number;
}

// 从"人生第一次"数据转换为话题灵感数据
export function adaptTopicToInspiration(topic: any, category?: any): TopicInspiration {
  // 生成适合小红书的标题
  const xhsTitle = generateXHSTitle(topic);
  
  // 生成可衍生的选题方向
  const xhsTopics = generateXHSTopics(topic);
  
  // 提取适合小红书的关键词
  const xhsKeywords = extractXHSKeywords(topic);
  
  // 计算关联度
  const relevance = calculateRelevance(topic);

  return {
    id: topic.id,
    title: topic.title,
    category: topic.category || category?.name || '未分类',
    categoryId: topic.categoryId || '',
    subCategoryId: topic.subCategoryId,
    tags: topic.tags || [],
    keywords: topic.keywords || [],
    intro: topic.intro || '',
    xhsTitle,
    xhsTopics,
    xhsKeywords,
    relevance,
    difficulty: topic.stats?.difficulty || '中等',
    duration: topic.stats?.duration,
    cost: topic.stats?.cost,
    featured: topic.featured || false,
    steps: topic.steps,
    tips: topic.tips,
    pitfalls: topic.pitfalls
  };
}

// 生成适合小红书的标题
function generateXHSTitle(topic: any): string {
  const title = topic.title || '';
  
  // 如果标题已经是"第一次XX"格式，直接使用
  if (title.includes('第一次')) {
    return title;
  }
  
  // 否则添加"第一次"前缀
  return `第一次${title}`;
}

// 生成可衍生的选题方向
function generateXHSTopics(topic: any): string[] {
  const topics: string[] = [];
  const title = topic.title || '';
  
  // 基于"第一次XX"生成选题模板
  const templates = [
    `${title}全攻略`,
    `${title}避坑指南`,
    `${title}需要准备什么？`,
    `${title}的5个注意事项`,
    `${title}经验分享`,
    `如何${title}？`,
    `${title}新手必看`,
    `${title}完整流程`
  ];
  
  topics.push(...templates.slice(0, 6));
  
  // 如果有具体场景，添加相关选题
  if (topic.intro) {
    if (topic.intro.includes('攻略') || topic.intro.includes('流程')) {
      topics.push(`${title}详细步骤`);
    }
    if (topic.intro.includes('避坑') || topic.intro.includes('注意')) {
      topics.push(`${title}常见问题`);
    }
  }
  
  return topics.slice(0, 8); // 最多返回8个
}

// 提取适合小红书的关键词
function extractXHSKeywords(topic: any): string[] {
  const keywords: string[] = [];
  
  // 从标题提取
  if (topic.title) {
    keywords.push(topic.title);
  }
  
  // 从keywords字段提取
  if (topic.keywords && Array.isArray(topic.keywords)) {
    keywords.push(...topic.keywords);
  }
  
  // 从tags提取
  if (topic.tags && Array.isArray(topic.tags)) {
    keywords.push(...topic.tags);
  }
  
  // 从intro中提取关键词
  if (topic.intro) {
    const introKeywords = topic.intro
      .replace(/[，。！？、；：]/g, ' ')
      .split(' ')
      .filter((word: string) => word.length >= 2 && word.length <= 6)
      .slice(0, 3);
    keywords.push(...introKeywords);
  }
  
  // 添加"第一次"相关关键词
  keywords.push('第一次', '新手', '攻略', '避坑');
  
  // 去重并返回
  return Array.from(new Set(keywords));
}

// 计算与小红书内容的关联度
function calculateRelevance(topic: any): number {
  let score = 6; // 基础分（"第一次"类内容在小红书很受欢迎）
  
  const title = (topic.title || '').toLowerCase();
  const intro = (topic.intro || '').toLowerCase();
  const keywords = (topic.keywords || []).map((k: string) => k.toLowerCase());
  const tags = (topic.tags || []).map((t: string) => t.toLowerCase());
  
  // 小红书热门关键词加分
  const xhsHotKeywords = [
    '攻略', '避坑', '新手', '第一次', '经验', '分享',
    '生活', '日常', '实用', '技巧', '方法', '流程',
    '租房', '旅行', '美食', '穿搭', '美妆', '护肤',
    '职场', '学习', '成长', '理财', '社交', '健康'
  ];
  
  const allText = `${title} ${intro} ${keywords.join(' ')} ${tags.join(' ')}`;
  
  xhsHotKeywords.forEach(keyword => {
    if (allText.includes(keyword)) {
      score += 0.3;
    }
  });
  
  // 热门分类加分
  const popularCategories = ['出行', '财务', '居家', '社交', '职场', '旅行'];
  if (topic.category && popularCategories.includes(topic.category)) {
    score += 1;
  }
  
  // featured 话题加分
  if (topic.featured) {
    score += 0.5;
  }
  
  // 限制在1-10之间
  return Math.min(10, Math.max(1, Math.round(score * 10) / 10));
}

// 模拟数据（实际应该从"人生第一次"项目加载）
let cachedTopics: TopicInspiration[] | null = null;
let cachedCategories: TopicCategory[] | null = null;

// 加载话题数据
export async function loadTopicInspirationData(): Promise<{
  topics: TopicInspiration[];
  categories: TopicCategory[];
}> {
  // 如果已缓存，直接返回
  if (cachedTopics && cachedCategories) {
    return {
      topics: cachedTopics,
      categories: cachedCategories
    };
  }

  // TODO: 后续可以将"人生第一次"的数据文件复制到 public/data 目录
  // 然后通过 fetch('/data/topics.json') 加载
  // 目前先使用模拟数据
  
  const data = getMockTopicData();
  cachedTopics = data.topics;
  cachedCategories = data.categories;
  return data;
}

// 模拟数据
function getMockTopicData(): {
  topics: TopicInspiration[];
  categories: TopicCategory[];
} {
  const mockTopics: TopicInspiration[] = [
    {
      id: 'ride-metro-first-time',
      title: '第一次坐地铁',
      category: '出行',
      categoryId: 'travel',
      subCategoryId: 'travel-local',
      tags: ['地铁', '公共交通', '出行礼仪'],
      keywords: ['公共交通', '地铁', '通勤', '出行攻略', '新手'],
      intro: '学会从购票、进站到出站的全流程，熟悉站台礼仪与安全边界。',
      xhsTitle: '第一次坐地铁',
      xhsTopics: [
        '第一次坐地铁全攻略',
        '第一次坐地铁避坑指南',
        '第一次坐地铁需要准备什么？',
        '第一次坐地铁的5个注意事项',
        '第一次坐地铁经验分享',
        '如何第一次坐地铁？',
        '第一次坐地铁新手必看',
        '第一次坐地铁完整流程'
      ],
      xhsKeywords: ['第一次坐地铁', '地铁', '公共交通', '通勤', '出行攻略', '新手', '第一次', '避坑'],
      relevance: 9.5,
      difficulty: '容易',
      duration: '30–60 分钟',
      cost: '3–8 元',
      featured: true,
      steps: [
        { title: '到达地铁站', detail: '观察站外导向牌确认入口，先经过安检，将金属物品放入安检机。' },
        { title: '购票或刷码进站', detail: '单程票可在自助机选择目的地，扫码/刷卡直接进站，进站后靠右侧步行。' },
        { title: '候车与乘车', detail: '站台停在安全线外，列车进站时先让乘客下车，再从两侧上车，站稳扶好。' },
        { title: '出站与换乘', detail: '提前一站听报站，接近目标站时移动到车门；出站刷卡/扫码，按指示找到出口。' }
      ],
      tips: [
        '使用官方 App 可实时查看列车到站时间。',
        '新城市可先乘坐一站体验，熟悉报站与换乘指示。'
      ],
      pitfalls: [
        '高峰期人流密集，尽量提前规划时间，错峰出行或选择首节/末节车厢。'
      ]
    },
    {
      id: 'open-bank-account',
      title: '第一次开银行卡',
      category: '财务',
      categoryId: 'finance',
      subCategoryId: 'finance-bank',
      tags: ['银行卡', '实名登记', '网点办理'],
      keywords: ['银行', '银行卡', '开户', '理财', '工资卡'],
      intro: '准备好证件、了解开户流程，顺利办到第一张借记卡。',
      xhsTitle: '第一次开银行卡',
      xhsTopics: [
        '第一次开银行卡全攻略',
        '第一次开银行卡避坑指南',
        '第一次开银行卡需要准备什么？',
        '第一次开银行卡的5个注意事项',
        '第一次开银行卡经验分享',
        '如何第一次开银行卡？',
        '第一次开银行卡新手必看',
        '第一次开银行卡完整流程'
      ],
      xhsKeywords: ['第一次开银行卡', '银行卡', '开户', '银行', '理财', '工资卡', '第一次', '新手'],
      relevance: 9,
      difficulty: '中等',
      duration: '40–90 分钟',
      cost: '0 元（部分银行需首存 10–20 元）',
      featured: true,
      tips: [
        '如果只为线上支付，可考虑先申办数字人民币 App 或虚拟银行卡。',
        '学生开卡时可询问是否有免年费或校园权益。'
      ],
      pitfalls: [
        '部分银行午休窗口少、排队久，建议上午 10 点前或下午 3 点后办理。'
      ]
    },
    {
      id: 'rent-apartment-first',
      title: '第一次租房看房',
      category: '居家',
      categoryId: 'home',
      subCategoryId: 'home-renting',
      tags: ['租房', '合同', '安全'],
      keywords: ['租房', '看房', '合同', '公寓', '安全'],
      intro: '掌握自助看房要点，识别合同风险，确保安全入住。',
      xhsTitle: '第一次租房看房',
      xhsTopics: [
        '第一次租房看房全攻略',
        '第一次租房看房避坑指南',
        '第一次租房看房需要准备什么？',
        '第一次租房看房的5个注意事项',
        '第一次租房看房经验分享',
        '如何第一次租房看房？',
        '第一次租房看房新手必看',
        '第一次租房看房完整流程'
      ],
      xhsKeywords: ['第一次租房看房', '租房', '看房', '合同', '公寓', '安全', '第一次', '避坑'],
      relevance: 9.5,
      difficulty: '中等偏上',
      duration: '1–3 小时（含路程）',
      cost: '看房免费，签约需押金与首月房租',
      featured: false,
      tips: [
        '随身携带身份证件，保留看房聊天记录与合同照片。',
        '签前请第三方（朋友、法律咨询）再审阅一次合同重点条款。'
      ],
      pitfalls: [
        '二房东或非正规中介可能签"阴阳合同"，务必留存双方签署版。',
        '确保房内电器与家具清单写入合同，避免退租扯皮。'
      ]
    },
    {
      id: 'first-job-interview',
      title: '第一次面试',
      category: '职场',
      categoryId: 'career',
      subCategoryId: 'career-job',
      tags: ['面试', '求职', '职场'],
      keywords: ['面试', '求职', '职场', '简历', 'HR'],
      intro: '准备充分、自信表达，顺利通过第一次面试。',
      xhsTitle: '第一次面试',
      xhsTopics: [
        '第一次面试全攻略',
        '第一次面试避坑指南',
        '第一次面试需要准备什么？',
        '第一次面试的5个注意事项',
        '第一次面试经验分享',
        '如何第一次面试？',
        '第一次面试新手必看',
        '第一次面试常见问题'
      ],
      xhsKeywords: ['第一次面试', '面试', '求职', '职场', '简历', 'HR', '第一次', '新手'],
      relevance: 9.5,
      difficulty: '中等',
      duration: '30–60 分钟',
      featured: true,
      tips: [
        '提前了解公司背景和岗位要求，准备3-5个问题提问面试官。',
        '穿着得体，提前10-15分钟到达，保持自信和微笑。'
      ],
      pitfalls: [
        '不要迟到，不要过度紧张，不要问薪资待遇（等对方主动提及）。'
      ]
    },
    {
      id: 'first-travel-alone',
      title: '第一次独自旅行',
      category: '旅行',
      categoryId: 'travel',
      subCategoryId: 'travel-long-distance',
      tags: ['旅行', '独自', '自由行'],
      keywords: ['旅行', '独自', '自由行', '攻略', '安全'],
      intro: '规划路线、预订住宿、注意安全，享受第一次独自旅行的自由。',
      xhsTitle: '第一次独自旅行',
      xhsTopics: [
        '第一次独自旅行全攻略',
        '第一次独自旅行避坑指南',
        '第一次独自旅行需要准备什么？',
        '第一次独自旅行的5个注意事项',
        '第一次独自旅行经验分享',
        '如何第一次独自旅行？',
        '第一次独自旅行新手必看',
        '第一次独自旅行安全指南'
      ],
      xhsKeywords: ['第一次独自旅行', '旅行', '独自', '自由行', '攻略', '安全', '第一次', '新手'],
      relevance: 10,
      difficulty: '中等',
      featured: true,
      tips: [
        '提前规划路线，预订好住宿，告知家人行程。',
        '随身携带重要证件复印件，保持手机电量充足。'
      ],
      pitfalls: [
        '不要轻信陌生人，不要在陌生环境独自夜行。',
        '注意保管好财物，避免在人多的地方暴露贵重物品。'
      ]
    },
    {
      id: 'first-cook',
      title: '第一次做饭',
      category: '生活',
      categoryId: 'life',
      subCategoryId: 'life-cooking',
      tags: ['做饭', '烹饪', '美食'],
      keywords: ['做饭', '烹饪', '美食', '新手', '食谱'],
      intro: '从简单的菜开始，掌握基本烹饪技巧，享受自己动手的乐趣。',
      xhsTitle: '第一次做饭',
      xhsTopics: [
        '第一次做饭全攻略',
        '第一次做饭避坑指南',
        '第一次做饭需要准备什么？',
        '第一次做饭的5个注意事项',
        '第一次做饭经验分享',
        '如何第一次做饭？',
        '第一次做饭新手必看',
        '第一次做饭简单食谱'
      ],
      xhsKeywords: ['第一次做饭', '做饭', '烹饪', '美食', '新手', '食谱', '第一次', '避坑'],
      relevance: 9,
      difficulty: '容易',
      featured: true,
      tips: [
        '从简单的菜开始，如番茄鸡蛋、青椒土豆丝。',
        '准备好所有食材再开始，注意火候控制。'
      ],
      pitfalls: [
        '不要同时做多个菜，容易手忙脚乱。',
        '注意用火安全，不要离开厨房。'
      ]
    }
  ];

  const mockCategories: TopicCategory[] = [
    {
      id: 'travel',
      name: '出行与交通',
      description: '公共交通、长途出行、交通安全等主题',
      icon: '🚗',
      count: 45
    },
    {
      id: 'finance',
      name: '财务与公共服务',
      description: '银行、理财、证件办理等',
      icon: '💰',
      count: 32
    },
    {
      id: 'home',
      name: '居家与生活',
      description: '租房、装修、生活技巧等',
      icon: '🏠',
      count: 28
    },
    {
      id: 'career',
      name: '职场与工作',
      description: '面试、求职、职场技能等',
      icon: '💼',
      count: 25
    },
    {
      id: 'life',
      name: '日常生活',
      description: '做饭、购物、生活技巧等',
      icon: '🌟',
      count: 35
    }
  ];

  return {
    topics: mockTopics,
    categories: mockCategories
  };
}

// 搜索话题
export function searchTopics(
  topics: TopicInspiration[],
  query: string,
  categoryId?: string
): TopicInspiration[] {
  let results = [...topics];

  // 按分类筛选
  if (categoryId) {
    results = results.filter(topic => 
      topic.categoryId === categoryId || topic.subCategoryId === categoryId
    );
  }

  // 文本搜索
  if (query.trim()) {
    const searchTerm = query.toLowerCase().trim();
    results = results.filter(topic =>
      topic.title.toLowerCase().includes(searchTerm) ||
      topic.intro.toLowerCase().includes(searchTerm) ||
      topic.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      topic.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm)) ||
      topic.xhsKeywords.some(keyword => keyword.toLowerCase().includes(searchTerm))
    );
  }

  return results;
}

// 获取热门话题（按关联度排序）
export function getPopularTopics(topics: TopicInspiration[], limit: number = 20): TopicInspiration[] {
  return [...topics]
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, limit);
}

// 获取精选话题（featured）
export function getFeaturedTopics(topics: TopicInspiration[], limit: number = 10): TopicInspiration[] {
  return topics
    .filter(topic => topic.featured)
    .slice(0, limit);
}

// 获取随机推荐话题
export function getRandomTopics(topics: TopicInspiration[], limit: number = 6): TopicInspiration[] {
  const shuffled = [...topics].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, limit);
}

