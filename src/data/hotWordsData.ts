// 热词洞察工具数据适配层
// 整合概念词典数据，转换为适合小红书选题的格式

export interface HotWord {
  id: string;
  title: string;
  category: string;
  categoryId: string;
  summary: string;
  definition: string;
  tags: string[];
  viewCount: number;
  likeCount: number;
  difficulty: string;
  // 小红书相关字段
  xhsKeywords: string[]; // 适合小红书的关键词
  xhsTopics: string[]; // 可衍生的选题方向
  relevance: number; // 与小红书内容的关联度（1-10）
}

export interface HotWordCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  count: number;
}

// 从概念词典数据转换为热词数据
export function adaptConceptToHotWord(concept: any, category: any): HotWord {
  // 提取适合小红书的关键词
  const xhsKeywords = extractXHSKeywords(concept);
  
  // 生成可衍生的选题方向
  const xhsTopics = generateXHSTopics(concept);
  
  // 计算关联度（基于标签、内容等）
  const relevance = calculateRelevance(concept);

  return {
    id: concept.id,
    title: concept.title,
    category: category?.name || '未分类',
    categoryId: concept.categoryId,
    summary: concept.summary,
    definition: concept.definition,
    tags: concept.tags || [],
    viewCount: concept.viewCount || 0,
    likeCount: concept.likeCount || 0,
    difficulty: concept.difficulty || '中等',
    xhsKeywords,
    xhsTopics,
    relevance
  };
}

// 提取适合小红书的关键词
function extractXHSKeywords(concept: any): string[] {
  const keywords: string[] = [];
  
  // 从标题提取
  if (concept.title) {
    keywords.push(concept.title);
  }
  
  // 从标签提取
  if (concept.tags && Array.isArray(concept.tags)) {
    keywords.push(...concept.tags);
  }
  
  // 从摘要中提取关键词（简单实现）
  if (concept.summary) {
    const summaryKeywords = concept.summary
      .replace(/[，。！？、；：]/g, ' ')
      .split(' ')
      .filter(word => word.length >= 2 && word.length <= 6)
      .slice(0, 3);
    keywords.push(...summaryKeywords);
  }
  
  // 去重并返回
  return Array.from(new Set(keywords));
}

// 生成可衍生的选题方向
function generateXHSTopics(concept: any): string[] {
  const topics: string[] = [];
  const title = concept.title || '';
  const summary = concept.summary || '';
  
  // 基于概念生成选题模板
  const templates = [
    `什么是${title}？`,
    `${title}的5个实用技巧`,
    `如何运用${title}？`,
    `${title}背后的真相`,
    `从${title}看...`,
    `为什么${title}这么重要？`
  ];
  
  // 选择最相关的3个模板
  topics.push(...templates.slice(0, 3));
  
  // 如果有具体应用场景，添加相关选题
  if (summary.includes('生活') || summary.includes('日常')) {
    topics.push(`${title}在生活中的应用`);
  }
  if (summary.includes('职场') || summary.includes('工作')) {
    topics.push(`${title}在职场中的运用`);
  }
  if (summary.includes('学习') || summary.includes('成长')) {
    topics.push(`如何用${title}提升自己`);
  }
  
  return topics.slice(0, 5); // 最多返回5个
}

// 计算与小红书内容的关联度
function calculateRelevance(concept: any): number {
  let score = 5; // 基础分
  
  const title = (concept.title || '').toLowerCase();
  const summary = (concept.summary || '').toLowerCase();
  const tags = (concept.tags || []).map((t: string) => t.toLowerCase());
  const content = (concept.content || '').toLowerCase();
  
  // 小红书热门关键词加分
  const xhsHotKeywords = [
    '生活', '日常', '分享', '推荐', '好物', '穿搭', '美妆', '护肤',
    '美食', '旅行', '职场', '学习', '成长', '自律', '变美', '瘦身',
    '理财', '副业', '创业', '情感', '心理', '社交', '效率', '时间管理'
  ];
  
  const allText = `${title} ${summary} ${tags.join(' ')} ${content}`;
  
  xhsHotKeywords.forEach(keyword => {
    if (allText.includes(keyword)) {
      score += 0.5;
    }
  });
  
  // 心理学、经济学、管理学等类别加分（这些在小红书很受欢迎）
  const popularCategories = ['心理学', '经济学', '管理学', '认知科学'];
  if (concept.categoryId && ['1', '3', '4', '7'].includes(concept.categoryId)) {
    score += 1;
  }
  
  // 限制在1-10之间
  return Math.min(10, Math.max(1, Math.round(score)));
}

// 模拟数据（实际应该从概念词典项目加载）
// 这里先创建一个简化的数据加载函数
let cachedHotWords: HotWord[] | null = null;
let cachedCategories: HotWordCategory[] | null = null;

// 加载热词数据
export async function loadHotWordsData(): Promise<{
  hotWords: HotWord[];
  categories: HotWordCategory[];
}> {
  // 如果已缓存，直接返回
  if (cachedHotWords && cachedCategories) {
    return {
      hotWords: cachedHotWords,
      categories: cachedCategories
    };
  }

  // TODO: 后续可以将概念词典的数据文件复制到 public/data 目录
  // 然后通过 fetch('/data/categories.json') 加载
  // 目前先使用模拟数据
  
  // 如果加载失败，使用模拟数据
  const data = getMockHotWordsData();
  cachedHotWords = data.hotWords;
  cachedCategories = data.categories;
  return data;
}

// 模拟数据（用于开发和测试）
// 后续可以将概念词典的实际数据文件复制到 public/data 目录
function getMockHotWordsData(): {
  hotWords: HotWord[];
  categories: HotWordCategory[];
} {
  const mockHotWords: HotWord[] = [
    {
      id: '1',
      title: '第一性原理',
      category: '哲学',
      categoryId: '2',
      summary: '从最基本的已知条件开始，逐步推导出结论的思维方法',
      definition: '第一性原理就是从最基础的事实出发，一步步推理得出结论',
      tags: ['思维方法', '逻辑推理', '问题解决'],
      viewCount: 1250,
      likeCount: 89,
      difficulty: '中等',
      xhsKeywords: ['第一性原理', '思维方法', '逻辑推理', '问题解决'],
      xhsTopics: [
        '什么是第一性原理？',
        '第一性原理的5个实用技巧',
        '如何运用第一性原理？',
        '第一性原理背后的真相',
        '从第一性原理看成功'
      ],
      relevance: 8
    },
    {
      id: '2',
      title: '习得性无助',
      category: '心理学',
      categoryId: '1',
      summary: '个体在面对无法控制的负面事件后，产生的一种消极心理状态',
      definition: '习得性无助就是被困难打击多了，即使后来有机会改变，也不愿意再尝试了',
      tags: ['心理学', '认知偏差', '行为模式'],
      viewCount: 2100,
      likeCount: 156,
      difficulty: '初级',
      xhsKeywords: ['习得性无助', '心理学', '认知偏差', '行为模式', '心理状态'],
      xhsTopics: [
        '什么是习得性无助？',
        '如何摆脱习得性无助？',
        '习得性无助在生活中的表现',
        '从习得性无助看成长',
        '如何用心理学提升自己'
      ],
      relevance: 9
    },
    {
      id: '3',
      title: '沉没成本谬误',
      category: '经济学',
      categoryId: '3',
      summary: '因为已经投入成本而继续错误决策的认知偏差',
      definition: '沉没成本谬误就是明知道继续下去不划算，但因为已经投入了很多，舍不得放弃',
      tags: ['认知偏差', '决策理论', '行为经济学'],
      viewCount: 1420,
      likeCount: 112,
      difficulty: '中等',
      xhsKeywords: ['沉没成本', '认知偏差', '决策', '经济学', '理财'],
      xhsTopics: [
        '什么是沉没成本谬误？',
        '沉没成本谬误的5个实用技巧',
        '如何避免沉没成本谬误？',
        '从沉没成本看理财',
        '沉没成本在职场中的运用'
      ],
      relevance: 9
    },
    {
      id: '4',
      title: '马斯洛需求层次理论',
      category: '心理学',
      categoryId: '1',
      summary: '人类需求从基本生理需求到自我实现的五个层次',
      definition: '马斯洛把人的需求分成五个层次，从最基本的吃饭睡觉，到最高级的自我实现',
      tags: ['需求理论', '人本主义', '动机'],
      viewCount: 1560,
      likeCount: 123,
      difficulty: '初级',
      xhsKeywords: ['马斯洛', '需求层次', '心理学', '成长', '自我实现'],
      xhsTopics: [
        '什么是马斯洛需求层次理论？',
        '马斯洛需求层次在生活中的应用',
        '如何用需求层次理论提升自己',
        '从需求层次看成长',
        '需求层次理论在职场中的运用'
      ],
      relevance: 8
    },
    {
      id: '5',
      title: '确认偏差',
      category: '心理学',
      categoryId: '1',
      summary: '倾向于寻找和解释支持自己既有观点的信息',
      definition: '确认偏差就是我们总喜欢找那些支持自己想法的信息，而忽略或排斥那些反对的声音',
      tags: ['认知偏差', '信息处理', '心理学'],
      viewCount: 980,
      likeCount: 67,
      difficulty: '初级',
      xhsKeywords: ['确认偏差', '认知偏差', '心理学', '思维', '信息'],
      xhsTopics: [
        '什么是确认偏差？',
        '如何避免确认偏差？',
        '确认偏差在生活中的表现',
        '从确认偏差看信息茧房',
        '如何用心理学提升认知'
      ],
      relevance: 7
    },
    {
      id: '6',
      title: '二八定律',
      category: '经济学',
      categoryId: '3',
      summary: '80%的结果往往来自20%的原因',
      definition: '二八定律就是80%的结果往往来自20%的原因，比如80%的财富掌握在20%的人手中',
      tags: ['经济学', '效率', '管理'],
      viewCount: 1890,
      likeCount: 145,
      difficulty: '初级',
      xhsKeywords: ['二八定律', '效率', '时间管理', '理财', '成长'],
      xhsTopics: [
        '什么是二八定律？',
        '如何运用二八定律提升效率？',
        '二八定律在生活中的应用',
        '从二八定律看时间管理',
        '二八定律在职场中的运用'
      ],
      relevance: 9
    },
    {
      id: '7',
      title: '费曼学习法',
      category: '认知科学',
      categoryId: '7',
      summary: '通过教别人来检验自己是否真正理解',
      definition: '费曼学习法就是通过教别人来检验自己是否真正理解，用简单的话解释复杂的概念',
      tags: ['学习方法', '认知科学', '效率'],
      viewCount: 2340,
      likeCount: 198,
      difficulty: '初级',
      xhsKeywords: ['费曼学习法', '学习方法', '学习效率', '成长', '教育'],
      xhsTopics: [
        '什么是费曼学习法？',
        '费曼学习法的5个步骤',
        '如何用费曼学习法提升学习效率？',
        '费曼学习法在生活中的应用',
        '从费曼学习法看高效学习'
      ],
      relevance: 9
    },
    {
      id: '8',
      title: '墨菲定律',
      category: '心理学',
      categoryId: '1',
      summary: '如果事情有变坏的可能，不管可能性多小，它总会发生',
      definition: '墨菲定律就是如果事情有变坏的可能，不管可能性多小，它总会发生',
      tags: ['心理学', '风险管理', '思维'],
      viewCount: 1670,
      likeCount: 112,
      difficulty: '初级',
      xhsKeywords: ['墨菲定律', '心理学', '风险管理', '思维', '生活'],
      xhsTopics: [
        '什么是墨菲定律？',
        '如何应对墨菲定律？',
        '墨菲定律在生活中的表现',
        '从墨菲定律看风险管理',
        '如何用心理学思维提升生活'
      ],
      relevance: 8
    },
    {
      id: '9',
      title: '帕累托最优',
      category: '经济学',
      categoryId: '3',
      summary: '在不使任何人境况变坏的情况下，不可能再使某些人的处境变好',
      definition: '帕累托最优是一种资源配置状态，在不使任何人境况变坏的情况下，不可能再使某些人的处境变好',
      tags: ['经济学', '资源配置', '效率'],
      viewCount: 980,
      likeCount: 67,
      difficulty: '中等',
      xhsKeywords: ['帕累托最优', '经济学', '效率', '资源配置', '管理'],
      xhsTopics: [
        '什么是帕累托最优？',
        '帕累托最优在生活中的应用',
        '如何理解资源配置效率',
        '从帕累托最优看管理',
        '经济学思维在职场中的运用'
      ],
      relevance: 7
    },
    {
      id: '10',
      title: '心流状态',
      category: '心理学',
      categoryId: '1',
      summary: '完全沉浸在某项活动中，忘记时间流逝的心理状态',
      definition: '心流状态就是完全沉浸在某项活动中，忘记时间流逝，感觉时间过得很快的心理状态',
      tags: ['心理学', '专注', '效率', '成长'],
      viewCount: 2560,
      likeCount: 234,
      difficulty: '初级',
      xhsKeywords: ['心流', '专注', '效率', '心理学', '成长', '自律'],
      xhsTopics: [
        '什么是心流状态？',
        '如何进入心流状态？',
        '心流状态的5个特征',
        '如何用心理学提升专注力',
        '从心流看高效工作'
      ],
      relevance: 10
    }
  ];

  const mockCategories: HotWordCategory[] = [
    {
      id: '1',
      name: '心理学',
      icon: '🧠',
      description: '心理学相关概念和理论',
      count: 196
    },
    {
      id: '2',
      name: '哲学',
      icon: '🤔',
      description: '哲学思想和概念',
      count: 28
    },
    {
      id: '3',
      name: '经济学',
      icon: '💰',
      description: '经济学原理和概念',
      count: 240
    },
    {
      id: '4',
      name: '管理学',
      icon: '📊',
      description: '管理理论和方法',
      count: 196
    },
    {
      id: '7',
      name: '认知科学',
      icon: '💭',
      description: '认知和思维相关',
      count: 26
    }
  ];

  return {
    hotWords: mockHotWords,
    categories: mockCategories
  };
}

// 搜索热词
export function searchHotWords(
  hotWords: HotWord[],
  query: string,
  categoryId?: string
): HotWord[] {
  let results = [...hotWords];

  // 按分类筛选
  if (categoryId) {
    results = results.filter(word => word.categoryId === categoryId);
  }

  // 文本搜索
  if (query.trim()) {
    const searchTerm = query.toLowerCase().trim();
    results = results.filter(word =>
      word.title.toLowerCase().includes(searchTerm) ||
      word.summary.toLowerCase().includes(searchTerm) ||
      word.definition.toLowerCase().includes(searchTerm) ||
      word.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      word.xhsKeywords.some(keyword => keyword.toLowerCase().includes(searchTerm))
    );
  }

  return results;
}

// 获取热门热词（按浏览量排序）
export function getPopularHotWords(hotWords: HotWord[], limit: number = 20): HotWord[] {
  return [...hotWords]
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, limit);
}

// 获取高关联度热词（适合小红书）
export function getRelevantHotWords(hotWords: HotWord[], limit: number = 20): HotWord[] {
  return [...hotWords]
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, limit);
}

// 获取随机推荐热词
export function getRandomHotWords(hotWords: HotWord[], limit: number = 6): HotWord[] {
  const shuffled = [...hotWords].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, limit);
}

