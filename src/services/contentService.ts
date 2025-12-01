import { supabase } from '@/lib/supabase'
import type { Article, CaseStudy, Template, Intelligence } from '@/types/content'
// 导入本地数据作为 fallback
import { knowledgeArticles } from '@/data/knowledgeArticles'
import { caseStudies } from '@/data/caseStudies'
import { intelligencePosts } from '@/data/intelligenceData'

interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

interface FilterParams {
  category?: string
  tags?: string[]
  difficulty?: string
  featured?: boolean
  templateType?: string
  fileFormat?: string
  author?: string
  dateRange?: {
    start: string
    end: string
  }
}

interface SearchParams {
  query?: string
  fields?: string[]
}

type ContentParams = PaginationParams & FilterParams & SearchParams

interface ContentResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

class ContentService {
  // 是否使用本地数据（当 Supabase 没有数据时）
  private useLocalData = true

  // 将本地文章数据转换为组件期望的格式
  private adaptLocalArticle(localArticle: typeof knowledgeArticles[0]): any {
    return {
      id: localArticle.id,
      title: localArticle.title,
      slug: localArticle.slug,
      category: localArticle.category,
      description: localArticle.excerpt,
      content: localArticle.content,
      author: localArticle.author,
      readingTime: localArticle.readTime,
      publishedAt: localArticle.publishDate,
      updatedAt: localArticle.updateDate,
      tags: localArticle.tags,
      featured: localArticle.featured,
      viewCount: localArticle.views,
      likeCount: 0, // 本地数据没有，默认0
      difficulty: 'beginner', // 默认值
      coverImage: null
    }
  }

  // 将本地案例数据转换为组件期望的格式
  private adaptLocalCase(localCase: typeof caseStudies[0]): any {
    return {
      id: localCase.id,
      title: localCase.title,
      slug: localCase.slug,
      category: localCase.category,
      accountType: localCase.niche,
      description: localCase.excerpt,
      content: '', // 案例详情页会单独加载
      coverImage: localCase.coverImage,
      accountName: localCase.accountName,
      followersBefore: localCase.followersBefore,
      followersAfter: localCase.followersAfter,
      growthPeriod: localCase.growthPeriod,
      growthRate: localCase.growthRate,
      keyStrategies: localCase.keyStrategies,
      timeline: localCase.timeline,
      dataPoints: localCase.dataPoints,
      lessons: localCase.lessons,
      publishDate: localCase.publishDate,
      featured: localCase.featured,
      viewCount: 0, // 默认值
      likeCount: 0, // 默认值
      author: localCase.accountName
    }
  }

  // 将本地情报数据转换为组件期望的格式
  private adaptLocalIntelligence(localIntelligence: typeof intelligencePosts[0]): any {
    return {
      id: localIntelligence.id,
      title: localIntelligence.title,
      slug: localIntelligence.slug,
      category: localIntelligence.type,
      description: localIntelligence.excerpt,
      content: localIntelligence.content,
      publishedAt: localIntelligence.publishDate,
      isBreaking: localIntelligence.isNew && localIntelligence.importance === 'high',
      urgency: localIntelligence.importance,
      tags: localIntelligence.tags,
      viewCount: 0, // 默认值
      likeCount: 0, // 默认值
      source: '平台官方'
    }
  }

  // 通用内容获取方法
  private async getContent<T>(
    table: string,
    params: ContentParams = {}
  ): Promise<ContentResponse<T>> {
    const {
      page = 1,
      limit = 20,
      sortBy = 'created_at',
      sortOrder = 'desc',
      category,
      tags,
      difficulty,
      featured,
      templateType,
      fileFormat,
      author,
      dateRange,
      query,
      fields = ['title', 'description', 'content']
    } = params

    let queryBuilder = supabase
      .from(table)
      .select('*', { count: 'exact' })

    // 应用筛选条件
    if (category) {
      queryBuilder = queryBuilder.eq('category', category)
    }

    if (tags && tags.length > 0) {
      queryBuilder = queryBuilder.contains('tags', tags)
    }

    if (difficulty) {
      queryBuilder = queryBuilder.eq('difficulty', difficulty)
    }

    if (featured !== undefined) {
      queryBuilder = queryBuilder.eq('featured', featured)
    }

    if (templateType) {
      queryBuilder = queryBuilder.eq('template_type', templateType)
    }

    if (fileFormat) {
      queryBuilder = queryBuilder.eq('file_format', fileFormat)
    }

    if (author) {
      queryBuilder = queryBuilder.eq('author', author)
    }

    if (dateRange) {
      queryBuilder = queryBuilder
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end)
    }

    // 应用搜索
    if (query) {
      const searchConditions = fields.map(field => `${field}.ilike.%${query}%`).join(',')
      queryBuilder = queryBuilder.or(searchConditions)
    }

    // 应用排序和分页
    queryBuilder = queryBuilder
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range((page - 1) * limit, page * limit - 1)

    const { data, error, count } = await queryBuilder

    if (error) {
      throw new Error(`Failed to fetch ${table}: ${error.message}`)
    }

    return {
      data: data || [],
      total: count || 0,
      page,
      limit,
      hasMore: (count || 0) > page * limit
    }
  }

  // 获取单个内容
  async getContentById<T>(table: string, id: string): Promise<T> {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      throw new Error(`Failed to fetch ${table} by id: ${error.message}`)
    }

    // 增加浏览量
    await this.incrementViewCount(table, id)

    return data
  }

  // 增加浏览量
  async incrementViewCount(table: string, id: string): Promise<void> {
    const { error } = await supabase.rpc('increment_view_count', {
      table_name: table,
      row_id: id
    })

    if (error) {
      console.warn(`Failed to increment view count for ${table}:${id}`, error)
    }
  }

  // 文章相关方法
  async getArticles(params: ContentParams = {}): Promise<ContentResponse<Article>> {
    try {
      // 先尝试从 Supabase 获取
      const response = await this.getContent<Article>('articles', params)
      // 如果有数据，直接返回
      if (response.data && response.data.length > 0) {
        return response
      }
    } catch (error) {
      console.warn('Failed to fetch articles from Supabase, using local data:', error)
    }

    // 如果 Supabase 没有数据或出错，使用本地数据
    if (this.useLocalData) {
      return this.getLocalArticles(params)
    }

    // 如果禁用本地数据，返回空结果
    return {
      data: [],
      total: 0,
      page: params.page || 1,
      limit: params.limit || 20,
      hasMore: false
    }
  }

  // 从本地数据获取文章
  private getLocalArticles(params: ContentParams): ContentResponse<Article> {
    let filtered = [...knowledgeArticles]

    // 应用筛选
    if (params.category) {
      filtered = filtered.filter(a => a.category === params.category)
    }

    if (params.tags && params.tags.length > 0) {
      filtered = filtered.filter(a => 
        params.tags!.some(tag => a.tags.includes(tag))
      )
    }

    if (params.featured !== undefined) {
      filtered = filtered.filter(a => a.featured === params.featured)
    }

    if (params.query) {
      const query = params.query.toLowerCase()
      filtered = filtered.filter(a => 
        a.title.toLowerCase().includes(query) ||
        a.excerpt.toLowerCase().includes(query) ||
        a.content.toLowerCase().includes(query)
      )
    }

    // 应用排序
    const sortBy = params.sortBy || 'publishDate'
    const sortOrder = params.sortOrder || 'desc'
    filtered.sort((a, b) => {
      let aVal: any = a[sortBy as keyof typeof a]
      let bVal: any = b[sortBy as keyof typeof b]
      
      if (sortBy === 'publishDate') {
        aVal = new Date(aVal).getTime()
        bVal = new Date(bVal).getTime()
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })

    // 应用分页
    const page = params.page || 1
    const limit = params.limit || 20
    const start = (page - 1) * limit
    const end = start + limit
    const paginated = filtered.slice(start, end)

    // 转换数据格式
    const adapted = paginated.map(a => this.adaptLocalArticle(a))

    return {
      data: adapted as Article[],
      total: filtered.length,
      page,
      limit,
      hasMore: end < filtered.length
    }
  }

  async getArticleById(id: string): Promise<Article> {
    try {
      const article = await this.getContentById<Article>('articles', id)
      return article
    } catch (error) {
      // 如果 Supabase 没有，从本地数据查找
      if (this.useLocalData) {
        const localArticle = knowledgeArticles.find(a => a.id === id)
        if (localArticle) {
          return this.adaptLocalArticle(localArticle) as Article
        }
      }
      throw new Error(`Article with id ${id} not found`)
    }
  }

  async getFeaturedArticles(limit = 6): Promise<Article[]> {
    const response = await this.getArticles({
      featured: true,
      limit,
      sortBy: 'view_count',
      sortOrder: 'desc'
    })
    return response.data
  }

  async getRelatedArticles(articleId: string, limit = 5): Promise<Article[]> {
    const article = await this.getArticleById(articleId)
    
    if (!article.tags || article.tags.length === 0) {
      return []
    }

    const response = await this.getArticles({
      tags: article.tags,
      limit: limit + 1
    })

    return response.data.filter(item => item.id !== articleId).slice(0, limit)
  }

  // 获取分类列表
  async getCategories(): Promise<Array<{ id: string; name: string; slug: string }>> {
    // 从本地数据提取所有分类
    const categories = new Set<string>()
    knowledgeArticles.forEach(article => {
      categories.add(article.category)
    })

    // 转换为组件期望的格式
    return Array.from(categories).map((cat, index) => ({
      id: `cat-${index}`,
      name: cat,
      slug: cat.toLowerCase().replace(/\s+/g, '-')
    }))
  }

  // 案例相关方法
  async getCases(params: ContentParams = {}): Promise<ContentResponse<CaseStudy>> {
    try {
      const response = await this.getContent<CaseStudy>('case_studies', params)
      if (response.data && response.data.length > 0) {
        return response
      }
    } catch (error) {
      console.warn('Failed to fetch cases from Supabase, using local data:', error)
    }

    if (this.useLocalData) {
      return this.getLocalCases(params)
    }

    return {
      data: [],
      total: 0,
      page: params.page || 1,
      limit: params.limit || 20,
      hasMore: false
    }
  }

  // 从本地数据获取案例
  private getLocalCases(params: ContentParams): ContentResponse<CaseStudy> {
    let filtered = [...caseStudies]

    if (params.category) {
      filtered = filtered.filter(c => c.category === params.category)
    }

    if (params.query) {
      const query = params.query.toLowerCase()
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(query) ||
        c.excerpt.toLowerCase().includes(query) ||
        c.accountName.toLowerCase().includes(query)
      )
    }

    // 应用排序
    const sortBy = params.sortBy || 'publishDate'
    const sortOrder = params.sortOrder || 'desc'
    filtered.sort((a, b) => {
      let aVal: any = a[sortBy as keyof typeof a]
      let bVal: any = b[sortBy as keyof typeof b]
      
      if (sortBy === 'publishDate') {
        aVal = new Date(aVal).getTime()
        bVal = new Date(bVal).getTime()
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })

    // 应用分页
    const page = params.page || 1
    const limit = params.limit || 20
    const start = (page - 1) * limit
    const end = start + limit
    const paginated = filtered.slice(start, end)

    // 转换数据格式
    const adapted = paginated.map(c => this.adaptLocalCase(c))

    return {
      data: adapted as CaseStudy[],
      total: filtered.length,
      page,
      limit,
      hasMore: end < filtered.length
    }
  }

  // getCaseStudies 是 getCases 的别名（为了兼容）
  async getCaseStudies(params: ContentParams = {}): Promise<ContentResponse<CaseStudy>> {
    return this.getCases(params)
  }

  async getCaseById(id: string): Promise<CaseStudy> {
    try {
      const caseStudy = await this.getContentById<CaseStudy>('case_studies', id)
      return caseStudy
    } catch (error) {
      if (this.useLocalData) {
        const localCase = caseStudies.find(c => c.id === id)
        if (localCase) {
          // 需要加载完整内容
          return {
            ...this.adaptLocalCase(localCase),
            content: this.generateCaseContent(localCase)
          } as CaseStudy
        }
      }
      throw new Error(`Case with id ${id} not found`)
    }
  }

  // 生成案例的完整内容（从本地数据）
  private generateCaseContent(localCase: typeof caseStudies[0]): string {
    // 这里可以根据需要生成 Markdown 格式的内容
    return `# ${localCase.title}\n\n${localCase.excerpt}\n\n## 关键策略\n\n${localCase.keyStrategies.map(s => `- ${s}`).join('\n')}\n\n## 经验总结\n\n${localCase.lessons.map(l => `- ${l}`).join('\n')}`
  }

  // 模板相关方法
  async getTemplates(params: ContentParams = {}): Promise<ContentResponse<Template>> {
    return this.getContent<Template>('templates', params)
  }

  async getTemplateById(id: string): Promise<Template> {
    return this.getContentById<Template>('templates', id)
  }

  // 情报相关方法
  async getIntelligence(params: ContentParams = {}): Promise<ContentResponse<Intelligence>> {
    try {
      const response = await this.getContent<Intelligence>('intelligence', params)
      if (response.data && response.data.length > 0) {
        return response
      }
    } catch (error) {
      console.warn('Failed to fetch intelligence from Supabase, using local data:', error)
    }

    if (this.useLocalData) {
      return this.getLocalIntelligence(params)
    }

    return {
      data: [],
      total: 0,
      page: params.page || 1,
      limit: params.limit || 20,
      hasMore: false
    }
  }

  // 从本地数据获取情报
  private getLocalIntelligence(params: ContentParams): ContentResponse<Intelligence> {
    let filtered = [...intelligencePosts]

    if (params.category) {
      filtered = filtered.filter(i => i.type === params.category)
    }

    if (params.query) {
      const query = params.query.toLowerCase()
      filtered = filtered.filter(i => 
        i.title.toLowerCase().includes(query) ||
        i.excerpt.toLowerCase().includes(query) ||
        i.content.toLowerCase().includes(query)
      )
    }

    // 应用排序
    const sortBy = params.sortBy || 'publishDate'
    const sortOrder = params.sortOrder || 'desc'
    filtered.sort((a, b) => {
      let aVal: any = a[sortBy as keyof typeof a]
      let bVal: any = b[sortBy as keyof typeof b]
      
      if (sortBy === 'publishDate') {
        aVal = new Date(aVal).getTime()
        bVal = new Date(bVal).getTime()
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })

    // 应用分页
    const page = params.page || 1
    const limit = params.limit || 20
    const start = (page - 1) * limit
    const end = start + limit
    const paginated = filtered.slice(start, end)

    // 转换数据格式
    const adapted = paginated.map(i => this.adaptLocalIntelligence(i))

    return {
      data: adapted as Intelligence[],
      total: filtered.length,
      page,
      limit,
      hasMore: end < filtered.length
    }
  }

  async getIntelligenceById(id: string): Promise<Intelligence> {
    try {
      const intelligence = await this.getContentById<Intelligence>('intelligence', id)
      return intelligence
    } catch (error) {
      if (this.useLocalData) {
        const localIntelligence = intelligencePosts.find(i => i.id === id)
        if (localIntelligence) {
          return this.adaptLocalIntelligence(localIntelligence) as Intelligence
        }
      }
      throw new Error(`Intelligence with id ${id} not found`)
    }
  }

  // 搜索方法
  async searchContent(query: string, contentTypes: string[] = ['articles', 'case_studies', 'templates', 'intelligence']): Promise<{
    articles: Article[]
    cases: CaseStudy[]
    templates: Template[]
    intelligence: Intelligence[]
  }> {
    const results = {
      articles: [] as Article[],
      cases: [] as CaseStudy[],
      templates: [] as Template[],
      intelligence: [] as Intelligence[]
    }

    const searchPromises = []

    if (contentTypes.includes('articles')) {
      searchPromises.push(
        this.getArticles({ query, limit: 10 }).then(response => {
          results.articles = response.data
        })
      )
    }

    if (contentTypes.includes('case_studies')) {
      searchPromises.push(
        this.getCases({ query, limit: 10 }).then(response => {
          results.cases = response.data
        })
      )
    }

    if (contentTypes.includes('templates')) {
      searchPromises.push(
        this.getTemplates({ query, limit: 10 }).then(response => {
          results.templates = response.data
        })
      )
    }

    if (contentTypes.includes('intelligence')) {
      searchPromises.push(
        this.getIntelligence({ query, limit: 10 }).then(response => {
          results.intelligence = response.data
        })
      )
    }

    await Promise.all(searchPromises)
    return results
  }
}

export const contentService = new ContentService()
export default contentService
