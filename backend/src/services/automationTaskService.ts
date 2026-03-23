import { query } from '../db'
import { getNextCronRunAt, getTaskScheduleCron, getTaskScheduleRunAt, isValidCronExpression } from './cronSchedule'
import { createAutomationSignedHeaders } from './automationWebhookSecurity'
import { executeAutomationProviderChain } from './providerAdapters'

export type AutomationWorkflowId = 'trend-scraper' | 'multi-platform-remix' | 'auto-content-engine'
export type AutomationTaskStatus = 'queued' | 'dispatched' | 'completed' | 'failed' | 'rejected' | 'replaced'
export type AutomationTriggerMode = 'manual' | 'scheduled'

export interface AutomationTaskPayload {
  workflowId: AutomationWorkflowId
  topic: string
  payload?: Record<string, any>
  triggerMode?: AutomationTriggerMode
  source?: string
  autoDispatch?: boolean
}

export interface AutomationTaskUpdateInput {
  status: AutomationTaskStatus
  externalId?: string | null
  errorMessage?: string | null
  resultPayload?: Record<string, any> | null
  dispatched?: boolean
  completed?: boolean
  nextRunAtTouched?: boolean
  nextRunAt?: string | null
}

export interface AutomationTaskRecord {
  id: string
  workflow_id: AutomationWorkflowId
  workflow_title: string
  topic: string
  status: AutomationTaskStatus
  trigger_mode: AutomationTriggerMode
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

export interface AutomationTaskEnriched extends AutomationTaskRecord {
  artifact_urls: string[]
  published_platforms: string[]
}

export interface AutomationHistoryFilters {
  status?: AutomationTaskStatus
  workflowId?: AutomationWorkflowId
  triggerMode?: AutomationTriggerMode
  q?: string
  limit?: number
  offset?: number
}

export interface AutomationHistoryResult {
  items: AutomationTaskEnriched[]
  total: number
  limit: number
  offset: number
}

export interface AutomationDashboardResult {
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

const workflowMeta: Record<AutomationWorkflowId, { title: string; webhookEnv: string }> = {
  'trend-scraper': {
    title: '趋势抓取流水线',
    webhookEnv: 'N8N_TREND_SCRAPER_WEBHOOK_URL'
  },
  'multi-platform-remix': {
    title: '多平台改写流水线',
    webhookEnv: 'N8N_MULTI_PLATFORM_WEBHOOK_URL'
  },
  'auto-content-engine': {
    title: '自动内容生产流水线',
    webhookEnv: 'N8N_AUTO_CONTENT_WEBHOOK_URL'
  }
}

let memoryTasks: AutomationTaskRecord[] = []

function isWorkflowId(value: string): value is AutomationWorkflowId {
  return value in workflowMeta
}

function getWebhookUrl(workflowId: AutomationWorkflowId): string | null {
  return process.env[workflowMeta[workflowId].webhookEnv] || process.env.N8N_WEBHOOK_URL || null
}

function getCallbackBaseUrl(): string {
  return process.env.AUTOMATION_CALLBACK_BASE_URL
    || process.env.PUBLIC_API_BASE_URL
    || process.env.BACKEND_PUBLIC_URL
    || `http://localhost:${process.env.PORT || 3001}`
}

function getNextRunAtFromPayload(payload?: Record<string, any>, fromDate = new Date()): string | null {
  const runAt = getTaskScheduleRunAt(payload)
  if (runAt) {
    const runAtMs = Date.parse(runAt)
    if (Number.isFinite(runAtMs) && runAtMs > fromDate.getTime()) {
      return new Date(runAtMs).toISOString()
    }
    return null
  }

  const cron = getTaskScheduleCron(payload)
  if (!cron) return null

  const nextRun = getNextCronRunAt(cron, fromDate)
  return nextRun ? nextRun.toISOString() : null
}

function shouldUseProviderChain(task: AutomationTaskRecord): boolean {
  const payloadMode = typeof task.payload?.dispatchMode === 'string'
    ? String(task.payload.dispatchMode).toLowerCase()
    : ''

  if (payloadMode === 'provider' || payloadMode === 'provider-chain' || payloadMode === 'direct') {
    return true
  }
  if (payloadMode === 'n8n' || payloadMode === 'webhook') {
    return false
  }

  return process.env.AUTOMATION_PROVIDER_DIRECT_MODE === 'true'
}

function mapRow(row: any): AutomationTaskRecord {
  return {
    id: row.id,
    workflow_id: row.workflow_id,
    workflow_title: row.workflow_title,
    topic: row.topic,
    status: row.status,
    trigger_mode: row.trigger_mode,
    source: row.source,
    payload: row.payload || {},
    external_id: row.external_id || null,
    error_message: row.error_message || null,
    result_payload: row.result_payload || null,
    created_at: row.created_at,
    updated_at: row.updated_at,
    dispatched_at: row.dispatched_at || null,
    completed_at: row.completed_at || null,
    next_run_at: row.next_run_at || null,
  }
}

function normalizeStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter(Boolean)
  }
  return []
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.map((item) => item.trim()).filter(Boolean))]
}

function extractArtifactUrls(resultPayload: Record<string, any> | null): string[] {
  if (!resultPayload) return []

  const urls: string[] = []
  urls.push(...normalizeStringArray(resultPayload.artifactUrls))

  if (Array.isArray(resultPayload.artifacts)) {
    for (const artifact of resultPayload.artifacts) {
      if (artifact && typeof artifact === 'object' && typeof artifact.url === 'string') {
        urls.push(artifact.url.trim())
      }
    }
  }

  if (resultPayload.image && typeof resultPayload.image === 'object' && typeof resultPayload.image.url === 'string') {
    urls.push(resultPayload.image.url.trim())
  }

  return uniqueStrings(urls)
}

function extractPublishedPlatforms(task: AutomationTaskRecord): string[] {
  const fromResult = normalizeStringArray(task.result_payload?.publishedPlatforms)
  const fromPayload = normalizeStringArray(task.payload?.selectedPlatforms || task.payload?.platforms)
  return uniqueStrings([...fromResult, ...fromPayload])
}

function enrichTask(task: AutomationTaskRecord): AutomationTaskEnriched {
  return {
    ...task,
    artifact_urls: extractArtifactUrls(task.result_payload),
    published_platforms: extractPublishedPlatforms(task),
  }
}

function createMemoryTask(input: AutomationTaskPayload): AutomationTaskRecord {
  const now = new Date().toISOString()
  const nextRunAt = input.triggerMode === 'scheduled'
    ? getNextRunAtFromPayload(input.payload)
    : null
  const record: AutomationTaskRecord = {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    workflow_id: input.workflowId,
    workflow_title: workflowMeta[input.workflowId].title,
    topic: input.topic,
    status: 'queued',
    trigger_mode: input.triggerMode || 'manual',
    source: input.source || 'content-factory',
    payload: input.payload || {},
    external_id: null,
    error_message: null,
    result_payload: null,
    created_at: now,
    updated_at: now,
    dispatched_at: null,
    completed_at: null,
    next_run_at: nextRunAt,
  }
  memoryTasks = [record, ...memoryTasks].slice(0, 100)
  return record
}

async function persistTask(input: AutomationTaskPayload): Promise<AutomationTaskRecord> {
  const nextRunAt = input.triggerMode === 'scheduled'
    ? getNextRunAtFromPayload(input.payload)
    : null
  const result = await query(
    `INSERT INTO automation_tasks (
      workflow_id,
      workflow_title,
      topic,
      status,
      trigger_mode,
      source,
      payload,
      next_run_at
    ) VALUES ($1, $2, $3, 'queued', $4, $5, $6, $7)
    RETURNING *`,
    [
      input.workflowId,
      workflowMeta[input.workflowId].title,
      input.topic,
      input.triggerMode || 'manual',
      input.source || 'content-factory',
      JSON.stringify(input.payload || {}),
      nextRunAt,
    ]
  )

  return mapRow(result.rows[0])
}

async function updateTaskState(id: string, data: AutomationTaskUpdateInput): Promise<AutomationTaskRecord | null> {
  try {
    const result = await query(
      `UPDATE automation_tasks
       SET status = $2,
           external_id = COALESCE($3, external_id),
           error_message = $4,
           result_payload = COALESCE($5, result_payload),
           dispatched_at = CASE WHEN $6::boolean THEN CURRENT_TIMESTAMP ELSE dispatched_at END,
           completed_at = CASE WHEN $7::boolean THEN CURRENT_TIMESTAMP ELSE completed_at END,
           next_run_at = CASE WHEN $8::boolean THEN $9::timestamptz ELSE next_run_at END,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [
        id,
        data.status,
        data.externalId || null,
        data.errorMessage || null,
        data.resultPayload ? JSON.stringify(data.resultPayload) : null,
        Boolean(data.dispatched),
        Boolean(data.completed),
        Boolean(data.nextRunAtTouched),
        data.nextRunAt || null,
      ]
    )

    return result.rows[0] ? mapRow(result.rows[0]) : null
  } catch {
    const index = memoryTasks.findIndex((item) => item.id === id)
    if (index === -1) return null
    const existing = memoryTasks[index]
    const now = new Date().toISOString()
    const updated: AutomationTaskRecord = {
      ...existing,
      status: data.status,
      external_id: data.externalId ?? existing.external_id,
      error_message: data.errorMessage ?? existing.error_message,
      result_payload: data.resultPayload ?? existing.result_payload,
      dispatched_at: data.dispatched ? now : existing.dispatched_at,
      completed_at: data.completed ? now : existing.completed_at,
      next_run_at: data.nextRunAtTouched ? (data.nextRunAt ?? null) : existing.next_run_at,
      updated_at: now,
    }
    memoryTasks[index] = updated
    return updated
  }
}

export async function listAutomationTasks(limit = 20): Promise<AutomationTaskRecord[]> {
  try {
    const result = await query(
      `SELECT * FROM automation_tasks
       ORDER BY created_at DESC
       LIMIT $1`,
      [Math.min(Math.max(limit, 1), 100)]
    )
    return result.rows.map(mapRow)
  } catch {
    return memoryTasks.slice(0, limit)
  }
}

export async function getAutomationTask(id: string): Promise<AutomationTaskRecord | null> {
  try {
    const result = await query(`SELECT * FROM automation_tasks WHERE id = $1 LIMIT 1`, [id])
    return result.rows[0] ? mapRow(result.rows[0]) : null
  } catch {
    return memoryTasks.find((item) => item.id === id) || null
  }
}

export async function createAutomationTask(input: AutomationTaskPayload): Promise<AutomationTaskRecord> {
  if (!isWorkflowId(input.workflowId)) {
    throw new Error('Unsupported workflow id')
  }

  if (!input.topic.trim()) {
    throw new Error('Topic is required')
  }

  if (input.triggerMode === 'scheduled') {
    const cron = getTaskScheduleCron(input.payload)
    const runAt = getTaskScheduleRunAt(input.payload)

    if (!cron && !runAt) {
      throw new Error('Scheduled task requires payload.schedule.cron or payload.schedule.runAt')
    }
    if (cron && !isValidCronExpression(cron)) {
      throw new Error('Invalid schedule cron expression')
    }
    if (runAt && Date.parse(runAt) <= Date.now()) {
      throw new Error('Scheduled task runAt must be in the future')
    }
  }

  let record: AutomationTaskRecord
  try {
    record = await persistTask(input)
  } catch (error) {
    console.warn('Falling back to in-memory automation task storage:', error)
    record = createMemoryTask(input)
  }

  if (input.autoDispatch) {
    const dispatched = await dispatchAutomationTask(record.id)
    return dispatched || record
  }

  return record
}

export async function dispatchAutomationTask(id: string): Promise<AutomationTaskRecord | null> {
  const task = await getAutomationTask(id)
  if (!task) {
    return null
  }

  const webhookUrl = getWebhookUrl(task.workflow_id)
  const callbackBaseUrl = getCallbackBaseUrl()
  const callbackUrl = `${callbackBaseUrl}/api/automation/tasks/${task.id}/status`

  if (!webhookUrl || shouldUseProviderChain(task)) {
    const providerSummary = await executeAutomationProviderChain(task, callbackUrl)
    return updateTaskState(task.id, {
      status: providerSummary.success ? 'completed' : 'failed',
      errorMessage: providerSummary.success ? null : providerSummary.message,
      resultPayload: {
        ...(task.result_payload || {}),
        callbackUrl,
        dispatchAccepted: providerSummary.success,
        ...providerSummary,
      },
      dispatched: true,
      completed: true,
    })
  }

  try {
    const requestBody = JSON.stringify({
      taskId: task.id,
      workflowId: task.workflow_id,
      workflowTitle: task.workflow_title,
      topic: task.topic,
      source: task.source,
      triggerMode: task.trigger_mode,
      payload: task.payload,
      callbackUrl,
    })

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...createAutomationSignedHeaders(requestBody),
      },
      body: requestBody
    })

    if (!response.ok) {
      throw new Error(`Webhook responded ${response.status}`)
    }

    const data: any = await response.json().catch(() => ({}))
    return updateTaskState(task.id, {
      status: 'dispatched',
      externalId: data?.id || data?.executionId || null,
      errorMessage: null,
      resultPayload: {
        ...(task.result_payload || {}),
        dispatchAccepted: true,
        callbackUrl,
        response: data,
      },
      dispatched: true,
    })
  } catch (error) {
    return updateTaskState(task.id, {
      status: 'failed',
      errorMessage: error instanceof Error ? error.message : 'Dispatch failed',
      resultPayload: {
        ...(task.result_payload || {}),
        callbackUrl,
        dispatchAccepted: false,
      }
    })
  }
}

export async function retryAutomationTask(id: string): Promise<AutomationTaskRecord | null> {
  const reset = await updateTaskState(id, {
    status: 'queued',
    errorMessage: null,
    resultPayload: null,
  })

  if (!reset) return null
  return dispatchAutomationTask(id)
}

export async function updateAutomationTask(id: string, input: AutomationTaskUpdateInput): Promise<AutomationTaskRecord | null> {
  return updateTaskState(id, input)
}

async function listTasksWithoutNextRun(limit: number): Promise<AutomationTaskRecord[]> {
  const normalizedLimit = Math.min(Math.max(limit, 1), 200)
  try {
    const result = await query(
      `SELECT *
       FROM automation_tasks
       WHERE trigger_mode = 'scheduled'
         AND next_run_at IS NULL
       ORDER BY created_at DESC
       LIMIT $1`,
      [normalizedLimit]
    )
    return result.rows.map(mapRow)
  } catch {
    return memoryTasks
      .filter((task) => task.trigger_mode === 'scheduled' && !task.next_run_at)
      .slice(0, normalizedLimit)
  }
}

async function listDueScheduledTasks(limit: number, nowIso: string): Promise<AutomationTaskRecord[]> {
  const normalizedLimit = Math.min(Math.max(limit, 1), 100)
  try {
    const result = await query(
      `SELECT *
       FROM automation_tasks
       WHERE trigger_mode = 'scheduled'
         AND next_run_at IS NOT NULL
         AND next_run_at <= $1::timestamptz
         AND status IN ('queued', 'completed', 'failed')
       ORDER BY next_run_at ASC
       LIMIT $2`,
      [nowIso, normalizedLimit]
    )
    return result.rows.map(mapRow)
  } catch {
    const now = new Date(nowIso).getTime()
    return memoryTasks
      .filter((task) => {
        if (task.trigger_mode !== 'scheduled' || !task.next_run_at) return false
        if (!['queued', 'completed', 'failed'].includes(task.status)) return false
        const dueAt = Date.parse(task.next_run_at)
        return Number.isFinite(dueAt) && dueAt <= now
      })
      .sort((a, b) => Date.parse(a.next_run_at || '') - Date.parse(b.next_run_at || ''))
      .slice(0, normalizedLimit)
  }
}

export async function hydrateScheduledTaskNextRuns(limit = 100): Promise<number> {
  const tasks = await listTasksWithoutNextRun(limit)
  let updatedCount = 0

  for (const task of tasks) {
    const nextRunAt = getNextRunAtFromPayload(task.payload)
    if (!nextRunAt) continue

    const updated = await updateTaskState(task.id, {
      status: task.status,
      nextRunAtTouched: true,
      nextRunAt,
    })

    if (updated) {
      updatedCount += 1
    }
  }

  return updatedCount
}

export async function dispatchDueScheduledTasks(limit = 10): Promise<AutomationTaskRecord[]> {
  const now = new Date()
  const dueTasks = await listDueScheduledTasks(limit, now.toISOString())
  const dispatchedTasks: AutomationTaskRecord[] = []

  for (const task of dueTasks) {
    const nextRunAt = getNextRunAtFromPayload(task.payload, now)

    await updateTaskState(task.id, {
      status: 'queued',
      errorMessage: null,
      nextRunAtTouched: true,
      nextRunAt,
    })

    const dispatched = await dispatchAutomationTask(task.id)
    if (dispatched) {
      dispatchedTasks.push(dispatched)
    }
  }

  return dispatchedTasks
}

function clampLimit(value: number | undefined, fallback: number, max: number): number {
  const n = Number(value)
  if (!Number.isFinite(n) || n <= 0) return fallback
  return Math.min(Math.floor(n), max)
}

function parseFiltersWhere(
  filters: AutomationHistoryFilters,
  params: any[]
): string {
  const clauses: string[] = []

  if (filters.status) {
    params.push(filters.status)
    clauses.push(`status = $${params.length}`)
  }
  if (filters.workflowId) {
    params.push(filters.workflowId)
    clauses.push(`workflow_id = $${params.length}`)
  }
  if (filters.triggerMode) {
    params.push(filters.triggerMode)
    clauses.push(`trigger_mode = $${params.length}`)
  }
  if (filters.q && filters.q.trim()) {
    params.push(`%${filters.q.trim()}%`)
    clauses.push(`topic ILIKE $${params.length}`)
  }

  return clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''
}

export async function listAutomationTaskHistory(filters: AutomationHistoryFilters = {}): Promise<AutomationHistoryResult> {
  const limit = clampLimit(filters.limit, 20, 100)
  const offset = Math.max(Math.floor(Number(filters.offset || 0)), 0)

  try {
    const params: any[] = []
    const whereClause = parseFiltersWhere(filters, params)

    const totalQuery = await query(
      `SELECT COUNT(*)::int AS total
       FROM automation_tasks
       ${whereClause}`,
      params
    )
    const total = Number(totalQuery.rows[0]?.total || 0)

    params.push(limit)
    const limitIndex = params.length
    params.push(offset)
    const offsetIndex = params.length

    const listQuery = await query(
      `SELECT *
       FROM automation_tasks
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${limitIndex}
       OFFSET $${offsetIndex}`,
      params
    )

    return {
      items: listQuery.rows.map((row) => enrichTask(mapRow(row))),
      total,
      limit,
      offset,
    }
  } catch {
    let rows = [...memoryTasks]
    if (filters.status) {
      rows = rows.filter((item) => item.status === filters.status)
    }
    if (filters.workflowId) {
      rows = rows.filter((item) => item.workflow_id === filters.workflowId)
    }
    if (filters.triggerMode) {
      rows = rows.filter((item) => item.trigger_mode === filters.triggerMode)
    }
    if (filters.q && filters.q.trim()) {
      const q = filters.q.trim().toLowerCase()
      rows = rows.filter((item) => item.topic.toLowerCase().includes(q))
    }

    const total = rows.length
    const items = rows
      .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
      .slice(offset, offset + limit)
      .map((item) => enrichTask(item))

    return { items, total, limit, offset }
  }
}

function roundPercent(value: number): number {
  return Math.round(value * 100) / 100
}

export async function getAutomationDashboard(windowDays = 7, recentLimit = 12): Promise<AutomationDashboardResult> {
  const normalizedDays = clampLimit(windowDays, 7, 90)
  const normalizedRecentLimit = clampLimit(recentLimit, 12, 50)

  let tasks: AutomationTaskRecord[] = []
  try {
    const result = await query(
      `SELECT *
       FROM automation_tasks
       WHERE created_at >= NOW() - ($1::int * interval '1 day')
       ORDER BY created_at DESC
       LIMIT 2000`,
      [normalizedDays]
    )
    tasks = result.rows.map(mapRow)
  } catch {
    const minTimestamp = Date.now() - normalizedDays * 24 * 60 * 60 * 1000
    tasks = memoryTasks.filter((task) => Date.parse(task.created_at) >= minTimestamp)
  }

  const totals = {
    total: tasks.length,
    queued: 0,
    dispatched: 0,
    completed: 0,
    failed: 0,
    rejected: 0,
    replaced: 0,
  }

  const workflowMap = new Map<AutomationWorkflowId, { workflowTitle: string; total: number; completed: number; failed: number }>()
  const platformMap = new Map<string, { total: number; success: number; failed: number }>()

  for (const task of tasks) {
    if (task.status === 'queued') totals.queued += 1
    if (task.status === 'dispatched') totals.dispatched += 1
    if (task.status === 'completed') totals.completed += 1
    if (task.status === 'failed') totals.failed += 1
    if (task.status === 'rejected') totals.rejected += 1
    if (task.status === 'replaced') totals.replaced += 1

    if (!workflowMap.has(task.workflow_id)) {
      workflowMap.set(task.workflow_id, {
        workflowTitle: task.workflow_title,
        total: 0,
        completed: 0,
        failed: 0,
      })
    }

    const workflowEntry = workflowMap.get(task.workflow_id)!
    workflowEntry.total += 1
    if (task.status === 'completed') workflowEntry.completed += 1
    if (task.status === 'failed') workflowEntry.failed += 1

    const platforms = extractPublishedPlatforms(task)
    for (const platform of platforms) {
      if (!platformMap.has(platform)) {
        platformMap.set(platform, { total: 0, success: 0, failed: 0 })
      }
      const platformEntry = platformMap.get(platform)!
      platformEntry.total += 1
      if (task.status === 'completed') platformEntry.success += 1
      if (task.status === 'failed') platformEntry.failed += 1
    }
  }

  const successRate = totals.total > 0 ? roundPercent((totals.completed / totals.total) * 100) : 0
  const failureRate = totals.total > 0 ? roundPercent((totals.failed / totals.total) * 100) : 0

  const lastExecution = tasks
    .filter((item) => item.completed_at || item.dispatched_at)
    .sort((a, b) => {
      const aTs = Date.parse(a.completed_at || a.dispatched_at || a.updated_at)
      const bTs = Date.parse(b.completed_at || b.dispatched_at || b.updated_at)
      return bTs - aTs
    })[0]

  return {
    windowDays: normalizedDays,
    totals,
    rates: {
      successRate,
      failureRate,
    },
    lastExecutionAt: lastExecution ? (lastExecution.completed_at || lastExecution.dispatched_at || lastExecution.updated_at) : null,
    workflowSummary: Array.from(workflowMap.entries()).map(([workflowId, value]) => ({
      workflowId,
      workflowTitle: value.workflowTitle,
      total: value.total,
      completed: value.completed,
      failed: value.failed,
    })),
    platformSummary: Array.from(platformMap.entries()).map(([platform, value]) => ({
      platform,
      total: value.total,
      success: value.success,
      failed: value.failed,
    })),
    recentExecutions: tasks
      .slice(0, normalizedRecentLimit)
      .map((task) => enrichTask(task)),
  }
}
