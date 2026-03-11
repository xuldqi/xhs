/**
 * AI Service - 统一的 AI API 调用服务
 * Supports OpenAI and Gemini
 */

export interface AIServiceConfig {
    apiKey: string;
    baseURL?: string;
    model?: string;
    provider?: 'openai' | 'gemini';
}

export interface AICompletionOptions {
    temperature?: number;
    maxTokens?: number;
    responseFormat?: 'text' | 'json';
}

export class AIService {
    private config: Required<AIServiceConfig>;
    private cache: Map<string, { data: string; timestamp: number }>;
    private readonly CACHE_TTL = 3600000; // 1小时缓存

    constructor(config: AIServiceConfig) {
        this.config = {
            apiKey: config.apiKey,
            baseURL: config.baseURL || 'https://api.openai.com/v1',
            model: config.model || 'gpt-4o-mini',
            provider: config.provider || 'openai',
        };
        this.cache = new Map();
    }

    /**
     * 生成文本补全
     */
    async generateCompletion(
        prompt: string,
        options: AICompletionOptions = {}
    ): Promise<string> {
        const cacheKey = this.getCacheKey(prompt, options);

        // 检查缓存
        const cached = this.getFromCache(cacheKey);
        if (cached) {
            console.log('🎯 Cache hit for prompt');
            return cached;
        }

        try {
            const response = await this.callAPI(prompt, options);

            // 存入缓存
            this.cache.set(cacheKey, {
                data: response,
                timestamp: Date.now(),
            });

            return response;
        } catch (error) {
            console.error('AI Service Error:', error);
            throw new Error(`AI 生成失败: ${error instanceof Error ? error.message : '未知错误'}`);
        }
    }

    /**
     * 生成 JSON 格式响应
     */
    async generateJSON<T = any>(
        prompt: string,
        options: AICompletionOptions = {}
    ): Promise<T> {
        const response = await this.generateCompletion(prompt, {
            ...options,
            responseFormat: 'json',
        });

        try {
            // 尝试提取 JSON（有时 AI 会返回额外说明）
            const jsonMatch = response.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            return JSON.parse(response);
        } catch (error) {
            console.error('JSON Parse Error:', error);
            console.error('Raw response:', response);
            throw new Error('AI 返回的不是有效的 JSON 格式');
        }
    }

    /**
     * 调用 OpenAI API
     */
    private async callOpenAI(
        prompt: string,
        options: AICompletionOptions
    ): Promise<string> {
        const response = await fetch(`${this.config.baseURL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.config.apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: this.config.model,
                messages: [
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: options.temperature ?? 0.9,
                max_tokens: options.maxTokens ?? 2000,
                ...(options.responseFormat === 'json' && {
                    response_format: { type: 'json_object' },
                }),
            }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(
                `OpenAI API 错误 (${response.status}): ${error.error?.message || response.statusText}`
            );
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || '';
    }

    /**
     * 调用 Gemini API
     */
    private async callGemini(
        prompt: string,
        options: AICompletionOptions
    ): Promise<string> {
        const endpoint = `${this.config.baseURL}/v1beta/models/${this.config.model}:generateContent`;

        const response = await fetch(`${endpoint}?key=${this.config.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [{ text: prompt }],
                    },
                ],
                generationConfig: {
                    temperature: options.temperature ?? 0.9,
                    maxOutputTokens: options.maxTokens ?? 2000,
                    ...(options.responseFormat === 'json' && {
                        responseMimeType: 'application/json',
                    }),
                },
            }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(
                `Gemini API 错误 (${response.status}): ${error.error?.message || response.statusText}`
            );
        }

        const data = await response.json();
        return data.candidates[0]?.content?.parts[0]?.text || '';
    }

    /**
     * 统一 API 调用入口
     */
    private async callAPI(
        prompt: string,
        options: AICompletionOptions
    ): Promise<string> {
        if (this.config.provider === 'gemini') {
            return this.callGemini(prompt, options);
        }
        return this.callOpenAI(prompt, options);
    }

    /**
     * 获取缓存键
     */
    private getCacheKey(prompt: string, options: AICompletionOptions): string {
        return `${prompt}_${JSON.stringify(options)}`;
    }

    /**
     * 从缓存获取
     */
    private getFromCache(key: string): string | null {
        const cached = this.cache.get(key);
        if (!cached) return null;

        // 检查是否过期
        if (Date.now() - cached.timestamp > this.CACHE_TTL) {
            this.cache.delete(key);
            return null;
        }

        return cached.data;
    }

    /**
     * 清除缓存
     */
    clearCache(): void {
        this.cache.clear();
    }

    /**
     * 清除过期缓存
     */
    clearExpiredCache(): void {
        const now = Date.now();
        for (const [key, value] of this.cache.entries()) {
            if (now - value.timestamp > this.CACHE_TTL) {
                this.cache.delete(key);
            }
        }
    }
}

/**
 * 创建 AI Service 实例的工厂函数
 */
export function createAIService(config: AIServiceConfig): AIService {
    return new AIService(config);
}

/**
 * 默认配置 - OpenAI
 */
export function createOpenAIService(apiKey: string): AIService {
    return new AIService({
        apiKey,
        provider: 'openai',
        model: 'gpt-4o-mini',
        baseURL: 'https://api.openai.com/v1',
    });
}

/**
 * 默认配置 - Gemini
 */
export function createGeminiService(apiKey: string): AIService {
    return new AIService({
        apiKey,
        provider: 'gemini',
        model: 'gemini-1.5-flash',
        baseURL: 'https://generativelanguage.googleapis.com',
    });
}

// ============ 后端 API 客户端（供 AnalysisView、guideGenerator 使用） ============
const API_BASE = import.meta.env.VITE_BACKEND_URL || ''

async function apiPost(path: string, body: any) {
    const res = await fetch(`${API_BASE}/api/ai${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
    return res.json()
}

async function apiGet(path: string) {
    const res = await fetch(`${API_BASE}/api/ai${path}`)
    return res.json()
}

export const aiService = {
    isConfigured(): boolean {
        return !!API_BASE
    },
    async isConfiguredAsync(): Promise<boolean> {
        try {
            const data = await apiGet('/health')
            return data?.configured === true
        } catch {
            return false
        }
    },
    async analyzeImage(params: { image: string; prompt: string }) {
        return apiPost('/analyze', { image: params.image, prompt: params.prompt })
    },
    async generateContent(params: { accountData: any; sectionId: number; template: string; context: string }) {
        const { accountData, sectionId, template, context } = params
        const systemPrompt = `你是小红书运营专家。根据账号数据生成涨粉指南章节。
账号：${accountData?.username || '未知'}，粉丝：${accountData?.followers ?? 0}，笔记数：${accountData?.notes ?? 0}，类别：${accountData?.category || '未分类'}
严格遵守格式规范，使用 emoji + 列表格式，不要用 Markdown 标题或加粗。`
        const userPrompt = `章节 ${sectionId}：\n${template}\n\n上下文：${context || '无'}`
        return apiPost('/generate', { systemPrompt, userPrompt })
    },
    async generateKeywords(topic: string, subNiche?: string) {
        const systemPrompt = `你是小红书 SEO 专家。根据用户提供的内容领域，输出适合小红书搜索优化的关键词。
必须严格返回 JSON 格式，不要包含任何其他文字：
{
  "coreKeywords": ["核心词1", "核心词2", "核心词3", "核心词4", "核心词5"],
  "longTailKeywords": ["长尾词1", "长尾词2", "长尾词3", "长尾词4", "长尾词5"],
  "relatedKeywords": ["相关词1", "相关词2", "相关词3"],
  "usageTips": "50-100字的使用建议，说明如何在标题、正文、话题标签中布局这些关键词"
}
coreKeywords: 用户最可能搜索的主关键词，3-5个。
longTailKeywords: 更具体的长尾词，竞争小、转化高，如「平价学生党护肤推荐」。
relatedKeywords: 拓展相关词，可用于话题标签。
usageTips: 简短实用的布局建议。`
        const userPrompt = subNiche
            ? `领域：${topic}，细分方向：${subNiche}\n请输出适合该细分领域的关键词 JSON。`
            : `领域：${topic}\n请输出适合该领域的关键词 JSON。`
        return apiPost('/generate', { systemPrompt, userPrompt })
    },
    async generateTitles(params: { topic: string; keywords?: string; style: string; count: number }) {
        const styleNames: Record<string, string> = {
            catchy: '吸睛型（夸张、惊叹、吸引点击）',
            professional: '专业型（术语、权威感）',
            emotional: '情感型（共鸣、走心）',
            question: '疑问型（引发好奇）',
            numeric: '数字型（具体数字、可信）'
        }
        const styleDesc = styleNames[params.style] || '吸睛型'
        const systemPrompt = `你是小红书标题专家。根据用户的内容主题和风格，生成指定数量的小红书笔记标题。
必须严格返回 JSON 数组，不要包含任何其他文字，格式如下：
[
  { "text": "标题文案1", "score": 85 },
  { "text": "标题文案2", "score": 90 }
]
要求：每个标题 15-25 字，包含 emoji，符合小红书风格；score 为 70-95 的吸引力评分。`
        const userPrompt = `主题：${params.topic}
${params.keywords ? `关键词（可融入标题）：${params.keywords}` : ''}
风格：${styleDesc}
生成数量：${params.count} 个标题。请直接输出 JSON 数组。`
        return apiPost('/generate', { systemPrompt, userPrompt })
    },
    async generateMultiPlatformPack(params: {
        topic: string
        audience: string
        goal: string
        tone: string
        offer?: string
        callToAction?: string
        trendContext?: string
        platforms: string[]
        premium: boolean
        languageMode?: 'zh' | 'bilingual'
        includeSeoKeywords?: boolean
        includeImagePrompts?: boolean
        includeVideoHooks?: boolean
        includeMusicIdeas?: boolean
    }) {
        const systemPrompt = `你是顶级内容总编、增长策略师、多平台本地化编辑。
请根据用户输入，生成一个“多平台内容资产包”。

必须严格返回 JSON 对象，不要包含任何额外说明，格式如下：
{
  "strategy": {
    "campaignAngle": "20-40字",
    "audienceLens": "20-40字",
    "trendSummary": "20-50字",
    "seoFocus": "20-50字",
    "translationNote": "20-40字",
    "monetizationHint": "20-40字"
  },
  "assets": {
    "seoKeywords": ["关键词1", "关键词2", "关键词3"],
    "imagePrompts": ["配图提示词1", "配图提示词2"],
    "videoHooks": ["短视频开场1", "短视频开场2"],
    "musicIdeas": ["BGM 灵感1", "BGM 灵感2"]
  },
  "platforms": {
    "xiaohongshu": {
      "title": "",
      "hook": "",
      "body": ["段落1", "段落2", "段落3"],
      "hashtags": ["#标签1", "#标签2"],
      "cta": "",
      "formatTips": ["建议1", "建议2"],
      "coverLines": ["封面短句1", "封面短句2"]
    },
    "twitter": {
      "title": "",
      "hook": "",
      "body": ["tweet1", "tweet2", "tweet3"],
      "hashtags": ["#tag1", "#tag2"],
      "cta": "",
      "formatTips": ["建议1", "建议2"]
    },
    "linkedin": {
      "title": "",
      "hook": "",
      "body": ["段落1", "段落2", "段落3"],
      "hashtags": ["#tag1", "#tag2"],
      "cta": "",
      "formatTips": ["建议1", "建议2"]
    },
    "blog": {
      "title": "",
      "hook": "",
      "body": ["小标题或段落1", "小标题或段落2", "小标题或段落3"],
      "hashtags": ["关键词1", "关键词2"],
      "cta": "",
      "formatTips": ["建议1", "建议2"]
    }
  }
}

要求：
1. 只输出用户请求的平台内容；未请求的平台可以省略。
2. 小红书和博客默认中文；当 languageMode=bilingual 时，Twitter / LinkedIn 默认英文表达。
3. 每个平台都要适配语气、长度、结构、CTA。
4. seoKeywords、imagePrompts、videoHooks、musicIdeas 仅在用户要求时输出；未要求则返回空数组。
5. 内容要具体、可直接发布、避免空话。
6. 不能出现 Markdown 代码块。`

        const userPrompt = `主题：${params.topic}
目标受众：${params.audience}
商业目标：${params.goal}
语气风格：${params.tone}
产品/服务：${params.offer || '未提供'}
行动引导：${params.callToAction || '引导用户收藏、评论或私信'}
趋势背景：${params.trendContext || '无'}
输出平台：${params.platforms.join('、')}
套餐模式：${params.premium ? '专业版（完整内容工厂）' : '试用版（基础 starter pack）'}
语言模式：${params.languageMode || 'bilingual'}
输出 SEO 关键词：${params.includeSeoKeywords ? '是' : '否'}
输出图片提示词：${params.includeImagePrompts ? '是' : '否'}
输出短视频钩子：${params.includeVideoHooks ? '是' : '否'}
输出音乐灵感：${params.includeMusicIdeas ? '是' : '否'}

请直接输出 JSON 对象。`

        return apiPost('/generate', { systemPrompt, userPrompt })
    },
    async analyzeTopics(domain: string, timeRange?: string) {
        const systemPrompt = `你是小红书运营专家。根据用户提供的内容领域，输出近期热门话题趋势分析。
必须严格返回 JSON 格式，不要包含任何其他文字：
{
  "hotTopics": [
    { "topic": "话题名称", "trend": "上升/稳定", "reason": "20字内说明" },
    ...
  ],
  "contentSuggestions": ["内容建议1", "内容建议2", "内容建议3"],
  "avoidTopics": ["避免的话题1", "避免的话题2"],
  "summary": "50-80字总结，给用户明确的方向建议"
}
hotTopics: 3-5个近期热门话题，trend为上升/稳定。
contentSuggestions: 3-4个可执行的内容选题建议。
avoidTopics: 1-2个应避免的话题或方向。
summary: 简明扼要的总结建议。`
        const userPrompt = timeRange
            ? `领域：${domain}，关注时段：${timeRange}\n请输出话题趋势分析 JSON。`
            : `领域：${domain}\n请输出近期热门话题趋势分析 JSON。`
        return apiPost('/generate', { systemPrompt, userPrompt })
    },
    async analyzeCompetitor(competitorDesc: string, yourPositioning?: string) {
        const systemPrompt = `你是小红书运营专家。根据用户提供的竞品账号描述，输出竞品分析报告。
必须严格返回 JSON 格式，不要包含任何其他文字：
{
  "strengths": ["优势1", "优势2", "优势3"],
  "weaknesses": ["劣势1", "劣势2"],
  "contentStrategy": "50-80字描述其内容策略",
  "differentiation": ["差异化机会1", "差异化机会2", "差异化机会3"],
  "actionItems": ["建议行动1", "建议行动2", "建议行动3"],
  "summary": "50-80字总结，给用户明确的竞品学习与差异化建议"
}
strengths: 竞品的3-4个优势。
weaknesses: 竞品的2-3个可借鉴的短板。
contentStrategy: 其内容策略简述。
differentiation: 用户可采取的3个差异化方向。
actionItems: 3-4个可执行的行动建议。
summary: 简明扼要的总结。`
        const userPrompt = yourPositioning
            ? `竞品描述：${competitorDesc}\n我的账号定位：${yourPositioning}\n请输出竞品分析 JSON。`
            : `竞品描述：${competitorDesc}\n请输出竞品分析 JSON。`
        return apiPost('/generate', { systemPrompt, userPrompt })
    },
}
