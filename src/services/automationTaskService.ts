export type AutomationWorkflowId = 'trend-scraper' | 'multi-platform-remix' | 'auto-content-engine'
export type AutomationTaskStatus = 'queued' | 'dispatched' | 'completed' | 'failed' | 'rejected' | 'replaced'

export interface AutomationTask {
  id: string
  workflow_id: AutomationWorkflowId
  workflow_title: string
  topic: string
  status: AutomationTaskStatus
  trigger_mode: 'manual' | 'scheduled'
  source: string
  payload: Record<string, any>
  external_id: string | null
  error_message: string | null
  result_payload: Record<string, any> | null
  created_at: string
  updated_at: string
  dispatched_at: string | null
  completed_at: string | null
  next_run_at: string | null
}

export interface AutomationTaskEnriched extends AutomationTask {
  artifact_urls: string[]
  published_platforms: string[]
}

export interface AutomationDashboard {
  windowDays: number
  totals: {
    total: number
    queued: number
    dispatched: number
    completed: number
    failed: number
    rejected: number
    replaced: number
  }
  rates: {
    successRate: number
    failureRate: number
  }
  lastExecutionAt: string | null
  workflowSummary: Array<{
    workflowId: AutomationWorkflowId
    workflowTitle: string
    total: number
    completed: number
    failed: number
  }>
  platformSummary: Array<{
    platform: string
    total: number
    success: number
    failed: number
  }>
  recentExecutions: AutomationTaskEnriched[]
}

export interface AutomationHistoryResponse {
  items: AutomationTaskEnriched[]
  total: number
  limit: number
  offset: number
}

export interface CreateAutomationTaskInput {
  workflowId: AutomationWorkflowId
  topic: string
  payload?: Record<string, any>
  triggerMode?: 'manual' | 'scheduled'
  source?: string
  autoDispatch?: boolean
}

const API_BASE = import.meta.env.VITE_BACKEND_URL || ''
const LOCAL_STORAGE_KEY = 'xhs_automation_tasks'

function readLocalTasks(): AutomationTask[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeLocalTasks(tasks: AutomationTask[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks.slice(0, 30)))
}

function getLocalNextRunAt(payload?: Record<string, any>): string | null {
  const runAt = payload?.schedule?.runAt || payload?.plannedAt
  if (typeof runAt === 'string') {
    const timestamp = Date.parse(runAt)
    if (Number.isFinite(timestamp) && timestamp > Date.now()) {
      return new Date(timestamp).toISOString()
    }
  }
  return null
}

export async function getAutomationTasks(limit = 20): Promise<AutomationTask[]> {
  if (!API_BASE) {
    return readLocalTasks().slice(0, limit)
  }

  try {
    const response = await fetch(`${API_BASE}/api/automation/tasks?limit=${limit}`)
    if (!response.ok) throw new Error(`status ${response.status}`)
    const data = await response.json()
    return Array.isArray(data.tasks) ? data.tasks : []
  } catch (error) {
    console.warn('getAutomationTasks fallback:', error)
    return readLocalTasks().slice(0, limit)
  }
}

export async function getAutomationTask(taskId: string): Promise<AutomationTask | null> {
  if (!API_BASE) {
    return readLocalTasks().find((task) => task.id === taskId) || null
  }

  try {
    const response = await fetch(`${API_BASE}/api/automation/tasks/${taskId}`)
    if (!response.ok) throw new Error(`status ${response.status}`)
    const data = await response.json()
    return data.task || null
  } catch (error) {
    console.warn('getAutomationTask fallback:', error)
    return readLocalTasks().find((task) => task.id === taskId) || null
  }
}

export async function getAutomationDashboard(windowDays = 7, recentLimit = 12): Promise<AutomationDashboard> {
  if (!API_BASE) {
    const tasks = readLocalTasks()
    const total = tasks.length
    const completed = tasks.filter((item) => item.status === 'completed').length
    const failed = tasks.filter((item) => item.status === 'failed').length
    return {
      windowDays,
      totals: {
        total,
        queued: tasks.filter((item) => item.status === 'queued').length,
        dispatched: tasks.filter((item) => item.status === 'dispatched').length,
        completed,
        failed,
        rejected: tasks.filter((item) => item.status === 'rejected').length,
        replaced: tasks.filter((item) => item.status === 'replaced').length,
      },
      rates: {
        successRate: total > 0 ? Math.round((completed / total) * 10000) / 100 : 0,
        failureRate: total > 0 ? Math.round((failed / total) * 10000) / 100 : 0,
      },
      lastExecutionAt: tasks[0]?.updated_at || null,
      workflowSummary: [],
      platformSummary: [],
      recentExecutions: tasks.slice(0, recentLimit).map((item) => ({
        ...item,
        artifact_urls: [],
        published_platforms: Array.isArray(item.payload?.selectedPlatforms)
          ? item.payload.selectedPlatforms.filter((platform: unknown) => typeof platform === 'string')
          : [],
      })),
    }
  }

  const response = await fetch(`${API_BASE}/api/automation/dashboard?windowDays=${windowDays}&recentLimit=${recentLimit}`)
  if (!response.ok) {
    throw new Error(`status ${response.status}`)
  }
  const data = await response.json()
  return data.dashboard
}

export async function getAutomationHistory(params: {
  status?: AutomationTaskStatus
  workflowId?: AutomationWorkflowId
  triggerMode?: 'manual' | 'scheduled'
  q?: string
  limit?: number
  offset?: number
} = {}): Promise<AutomationHistoryResponse> {
  if (!API_BASE) {
    let tasks = readLocalTasks()
      .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))

    if (params.status) {
      tasks = tasks.filter((item) => item.status === params.status)
    }
    if (params.workflowId) {
      tasks = tasks.filter((item) => item.workflow_id === params.workflowId)
    }
    if (params.triggerMode) {
      tasks = tasks.filter((item) => item.trigger_mode === params.triggerMode)
    }
    if (params.q && params.q.trim()) {
      const q = params.q.trim().toLowerCase()
      tasks = tasks.filter((item) => item.topic.toLowerCase().includes(q))
    }

    const limit = params.limit || 20
    const offset = params.offset || 0
    return {
      items: tasks.slice(offset, offset + limit).map((item) => ({
        ...item,
        artifact_urls: [],
        published_platforms: [],
      })),
      total: tasks.length,
      limit,
      offset,
    }
  }

  const query = new URLSearchParams()
  if (params.status) query.set('status', params.status)
  if (params.workflowId) query.set('workflowId', params.workflowId)
  if (params.triggerMode) query.set('triggerMode', params.triggerMode)
  if (params.q) query.set('q', params.q)
  if (typeof params.limit === 'number') query.set('limit', String(params.limit))
  if (typeof params.offset === 'number') query.set('offset', String(params.offset))

  const response = await fetch(`${API_BASE}/api/automation/history?${query.toString()}`)
  if (!response.ok) {
    throw new Error(`status ${response.status}`)
  }

  const data = await response.json()
  return {
    items: data.items || [],
    total: data.total || 0,
    limit: data.limit || (params.limit || 20),
    offset: data.offset || (params.offset || 0),
  }
}

export async function createAutomationTask(input: CreateAutomationTaskInput): Promise<AutomationTask> {
  if (!API_BASE) {
    const now = new Date().toISOString()
    const task: AutomationTask = {
      id: `local-${Date.now()}`,
      workflow_id: input.workflowId,
      workflow_title: input.workflowId,
      topic: input.topic,
      status: input.autoDispatch ? 'dispatched' : 'queued',
      trigger_mode: input.triggerMode || 'manual',
      source: input.source || 'content-factory',
      payload: input.payload || {},
      external_id: null,
      error_message: null,
      result_payload: {
        mode: 'local-fallback'
      },
      created_at: now,
      updated_at: now,
      dispatched_at: input.autoDispatch ? now : null,
      completed_at: null,
      next_run_at: input.triggerMode === 'scheduled' ? getLocalNextRunAt(input.payload) : null,
    }
    writeLocalTasks([task, ...readLocalTasks()])
    return task
  }

  const response = await fetch(`${API_BASE}/api/automation/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || `status ${response.status}`)
  }

  const data = await response.json()
  return data.task
}

export async function dispatchAutomationTask(taskId: string): Promise<AutomationTask> {
  if (!API_BASE) {
    const tasks = readLocalTasks()
    const nextTasks = tasks.map((task) => task.id === taskId
      ? {
          ...task,
          status: 'dispatched' as const,
          dispatched_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      : task)
    writeLocalTasks(nextTasks)
    const updated = nextTasks.find((task) => task.id === taskId)
    if (!updated) throw new Error('Task not found')
    return updated
  }

  const response = await fetch(`${API_BASE}/api/automation/tasks/${taskId}/dispatch`, {
    method: 'POST'
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || `status ${response.status}`)
  }

  const data = await response.json()
  return data.task
}

export async function retryAutomationTask(taskId: string): Promise<AutomationTask> {
  if (!API_BASE) {
    return dispatchAutomationTask(taskId)
  }

  const response = await fetch(`${API_BASE}/api/automation/tasks/${taskId}/retry`, {
    method: 'POST'
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || `status ${response.status}`)
  }

  const data = await response.json()
  return data.task
}

export async function rejectAutomationTask(taskId: string, reason = 'Rejected in review queue'): Promise<AutomationTask> {
  if (!API_BASE) {
    const tasks = readLocalTasks()
    const nextTasks = tasks.map((task) => task.id === taskId
      ? {
          ...task,
          status: 'rejected' as const,
          error_message: reason,
          result_payload: {
            ...(task.result_payload || {}),
            reviewAction: 'rejected',
            reviewReason: reason,
          },
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      : task)
    writeLocalTasks(nextTasks)
    const updated = nextTasks.find((task) => task.id === taskId)
    if (!updated) throw new Error('Task not found')
    return updated
  }

  const response = await fetch(`${API_BASE}/api/automation/tasks/${taskId}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason })
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || `status ${response.status}`)
  }

  const data = await response.json()
  return data.task
}

export async function reviewAutomationTask(
  taskId: string,
  action: 'approved' | 'rejected' | 'replaced',
  options: { note?: string; replacementTaskId?: string } = {}
): Promise<AutomationTask> {
  if (!API_BASE) {
    const tasks = readLocalTasks()
    const now = new Date().toISOString()
    const nextTasks = tasks.map((task) => {
      if (task.id !== taskId) return task

      const nextStatus: AutomationTaskStatus =
        action === 'rejected' ? 'rejected'
          : action === 'replaced' ? 'replaced'
            : 'queued'

      return {
        ...task,
        status: nextStatus,
        error_message: action === 'approved' ? null : (options.note || task.error_message),
        result_payload: {
          ...(task.result_payload || {}),
          reviewAction: action,
          reviewNote: options.note || null,
          reviewedAt: now,
          replacementTaskId: options.replacementTaskId || null,
        },
        completed_at: action === 'approved' ? task.completed_at : now,
        updated_at: now,
      }
    })

    writeLocalTasks(nextTasks)
    const updated = nextTasks.find((task) => task.id === taskId)
    if (!updated) throw new Error('Task not found')
    return updated
  }

  const response = await fetch(`${API_BASE}/api/automation/tasks/${taskId}/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action,
      note: options.note,
      replacementTaskId: options.replacementTaskId,
    })
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || `status ${response.status}`)
  }

  const data = await response.json()
  return data.task
}
