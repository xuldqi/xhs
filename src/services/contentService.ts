import { supabase } from '@/lib/supabase'
import type { Article, CaseStudy, Template, Intelligence } from '@/types/content'

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
  /** 情报专用：是否突发 */
  isBreaking?: boolean
  /** 情报专用：紧急程度 high | medium | low */
  urgency?: string
  /** 案例专用：账号类型，映射到 category */
  accountType?: string
  /** 案例专用：粉丝数下限 */
  followersMin?: number
  /** 案例专用：粉丝数上限 */
  followersMax?: number
  /** 案例专用：增长率下限 */
  growthRateMin?: number
  /** 案例专用：增长率上限 */
  growthRateMax?: number
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
      fields = ['title', 'description', 'content'],
      isBreaking,
      urgency,
      accountType,
      followersMin,
      followersMax,
      growthRateMin,
      growthRateMax
    } = params

    let queryBuilder = supabase
      .from(table)
      .select('*', { count: 'exact' })

    // 应用筛选条件
    const categoryValue = category || (table === 'case_studies' && accountType ? accountType : undefined)
    if (categoryValue) {
      queryBuilder = queryBuilder.eq('category', categoryValue)
    }

    // 案例表专用筛选
    if (table === 'case_studies') {
      if (followersMin != null) queryBuilder = queryBuilder.gte('follower_count', followersMin)
      if (followersMax != null) queryBuilder = queryBuilder.lte('follower_count', followersMax)
      if (growthRateMin != null) queryBuilder = queryBuilder.gte('growth_rate', growthRateMin)
      if (growthRateMax != null) queryBuilder = queryBuilder.lte('growth_rate', growthRateMax)
    }

    // 情报表专用筛选
    if (table === 'intelligence') {
      if (isBreaking !== undefined) {
        queryBuilder = queryBuilder.eq('is_breaking', isBreaking)
      }
      if (urgency) {
        queryBuilder = queryBuilder.eq('urgency', urgency)
      }
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

    // 排序字段：前端 camelCase 转 DB snake_case
    const sortByColumn =
      sortBy === 'publishedAt'
        ? 'published_at'
        : sortBy === 'viewCount'
          ? 'view_count'
          : sortBy === 'growthRate'
            ? 'growth_rate'
            : sortBy === 'createdAt'
              ? 'created_at'
              : sortBy

    // 应用排序和分页
    queryBuilder = queryBuilder
      .order(sortByColumn, { ascending: sortOrder === 'asc' })
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

  /** 分类列表（从文章表去重，或从 categories 表读取） */
  async getCategories(): Promise<{ id: string; name: string; slug: string }[]> {
    const { data } = await supabase.from('articles').select('category')
    const set = new Set<string>()
    ;(data || []).forEach(row => {
      if (row?.category) set.add(String(row.category))
    })
    return Array.from(set).map(c => ({ id: c, name: c, slug: c }))
  }

  /** 点赞/收藏：递增 like_count 并返回最新数量（真实“取消”需用户维度的 likes 表，此处仅做递增） */
  async toggleLike(table: string, id: string): Promise<{ liked: boolean; count: number }> {
    const tableName = table === 'case-studies' ? 'case_studies' : table
    const { data: row, error: fetchError } = await supabase
      .from(tableName)
      .select('like_count')
      .eq('id', id)
      .single()
    if (fetchError || row == null) {
      throw new Error(`Failed to get row for like: ${fetchError?.message || 'not found'}`)
    }
    const current = Number(row.like_count) || 0
    const newCount = current + 1
    const { error: updateError } = await supabase
      .from(tableName)
      .update({ like_count: newCount })
      .eq('id', id)
    if (updateError) {
      throw new Error(`Failed to update like: ${updateError.message}`)
    }
    return { liked: true, count: newCount }
  }

  /** 通用相关内容：文章用 getRelatedArticles，其他表可后续扩展 */
  async getRelatedContent<T>(id: string, table: string, limit: number): Promise<T[]> {
    if (table === 'articles') {
      return this.getRelatedArticles(id, limit) as Promise<T[]>
    }
    return []
  }

  // 文章相关方法
  async getArticles(params: ContentParams = {}): Promise<ContentResponse<Article>> {
    return this.getContent<Article>('articles', params)
  }

  async getArticleById(id: string): Promise<Article> {
    return this.getContentById<Article>('articles', id)
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
    const { data: row } = await supabase
      .from('articles')
      .select('tags')
      .eq('id', articleId)
      .single()
    const tags = (row?.tags as string[] | undefined) || []
    if (tags.length === 0) return []

    const response = await this.getArticles({
      tags,
      limit: limit + 1
    })
    return response.data.filter(item => item.id !== articleId).slice(0, limit)
  }

  // 案例相关方法
  async getCases(params: ContentParams = {}): Promise<ContentResponse<CaseStudy>> {
    return this.getContent<CaseStudy>('case_studies', params)
  }

  async getCaseById(id: string): Promise<CaseStudy> {
    return this.getContentById<CaseStudy>('case_studies', id)
  }

  /** 案例列表（与 getCases 同表，支持 accountType/followers/growthRate 筛选） */
  async getCaseStudies(params: ContentParams = {}): Promise<ContentResponse<CaseStudy>> {
    return this.getContent<CaseStudy>('case_studies', params)
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
    return this.getContent<Intelligence>('intelligence', params)
  }

  async getIntelligenceById(id: string): Promise<Intelligence> {
    return this.getContentById<Intelligence>('intelligence', id)
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
