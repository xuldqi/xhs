import { supabase } from '@/lib/supabase'

export interface CommunityQuestion {
  id: string
  title: string
  description: string
  author: { id: string; name: string; avatar: string }
  category: string
  tags: string[]
  viewCount: number
  answerCount: number
  likeCount: number
  isResolved: boolean
  isLiked: boolean
  isCollected: boolean
  createdAt: string
}

export interface CommunityAnswer {
  id: string
  questionId: string
  content: string
  author: { id: string; name: string; avatar: string }
  isAccepted: boolean
  likeCount: number
  createdAt: string
}

function mapQuestion(row: any): CommunityQuestion {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    author: {
      id: row.author_id || 'anon',
      name: row.author_name || '匿名用户',
      avatar: row.author_avatar || ''
    },
    category: row.category || '',
    tags: Array.isArray(row.tags) ? row.tags : [],
    viewCount: row.view_count ?? 0,
    answerCount: row.answer_count ?? 0,
    likeCount: row.like_count ?? 0,
    isResolved: row.is_resolved ?? false,
    isLiked: false,
    isCollected: false,
    createdAt: row.created_at
  }
}

function mapAnswer(row: any): CommunityAnswer {
  return {
    id: row.id,
    questionId: row.question_id,
    content: row.content,
    author: {
      id: row.author_id || 'anon',
      name: row.author_name || '匿名用户',
      avatar: row.author_avatar || ''
    },
    isAccepted: row.is_accepted ?? false,
    likeCount: row.like_count ?? 0,
    createdAt: row.created_at
  }
}

export const communityService = {
  async getQuestions(params: {
    page?: number
    limit?: number
    category?: string
    isResolved?: boolean
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }): Promise<{ data: CommunityQuestion[]; total: number }> {
    const { page = 1, limit = 20, category, isResolved, sortBy = 'created_at', sortOrder = 'desc' } = params
    let q = supabase
      .from('community_questions')
      .select('*', { count: 'exact' })
    if (category) q = q.eq('category', category)
    if (isResolved !== undefined) q = q.eq('is_resolved', isResolved)
    const orderCol = sortBy === 'createdAt' ? 'created_at' : sortBy === 'answerCount' ? 'answer_count' : sortBy === 'likeCount' ? 'like_count' : sortBy === 'viewCount' ? 'view_count' : 'created_at'
    q = q.order(orderCol, { ascending: sortOrder === 'asc' })
      .range((page - 1) * limit, page * limit - 1)
    const { data, error, count } = await q
    if (error) throw new Error(error.message)
    return { data: (data || []).map(mapQuestion), total: count ?? 0 }
  },

  async getQuestionById(id: string): Promise<CommunityQuestion | null> {
    const { data, error } = await supabase
      .from('community_questions')
      .select('*')
      .eq('id', id)
      .single()
    if (error || !data) return null
    const viewCount = (data.view_count ?? 0) + 1
    await supabase.from('community_questions').update({ view_count: viewCount }).eq('id', id)
    return mapQuestion({ ...data, view_count: viewCount })
  },

  async createQuestion(payload: {
    title: string
    description: string
    category: string
    tags?: string[]
    authorId?: string
    authorName?: string
    authorAvatar?: string
  }): Promise<CommunityQuestion> {
    const { data, error } = await supabase
      .from('community_questions')
      .insert({
        title: payload.title,
        description: payload.description,
        category: payload.category,
        tags: payload.tags ?? [],
        author_id: payload.authorId ?? null,
        author_name: payload.authorName || '匿名用户',
        author_avatar: payload.authorAvatar || null
      })
      .select()
      .single()
    if (error) throw new Error(error.message)
    return mapQuestion(data)
  },

  async getAnswers(questionId: string): Promise<CommunityAnswer[]> {
    const { data, error } = await supabase
      .from('community_answers')
      .select('*')
      .eq('question_id', questionId)
      .order('created_at', { ascending: true })
    if (error) throw new Error(error.message)
    return (data || []).map(mapAnswer)
  },

  async createAnswer(questionId: string, payload: {
    content: string
    authorId?: string
    authorName?: string
    authorAvatar?: string
  }): Promise<CommunityAnswer> {
    const { data: answer, error: errAnswer } = await supabase
      .from('community_answers')
      .insert({
        question_id: questionId,
        content: payload.content,
        author_id: payload.authorId ?? null,
        author_name: payload.authorName || '匿名用户',
        author_avatar: payload.authorAvatar ?? null
      })
      .select()
      .single()
    if (errAnswer) throw new Error(errAnswer.message)
    const { data: q } = await supabase.from('community_questions').select('answer_count').eq('id', questionId).single()
    const nextCount = (q?.answer_count ?? 0) + 1
    await supabase.from('community_questions').update({ answer_count: nextCount, updated_at: new Date().toISOString() }).eq('id', questionId)
    return mapAnswer(answer)
  },

  async incrementQuestionLike(id: string): Promise<{ count: number }> {
    const { data: row } = await supabase.from('community_questions').select('like_count').eq('id', id).single()
    const next = (row?.like_count ?? 0) + 1
    await supabase.from('community_questions').update({ like_count: next }).eq('id', id)
    return { count: next }
  }
}
