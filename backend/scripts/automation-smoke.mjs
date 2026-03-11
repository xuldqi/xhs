#!/usr/bin/env node

import crypto from 'node:crypto'

const BASE_URL = (process.env.AUTOMATION_SMOKE_BASE_URL || process.env.BACKEND_URL || 'http://127.0.0.1:3001').replace(/\/+$/, '')
const WEBHOOK_SECRET = process.env.AUTOMATION_WEBHOOK_SECRET || ''
const REQUIRE_SIGNATURE = process.env.AUTOMATION_SMOKE_REQUIRE_SIGNATURE === 'true'
const POLL_INTERVAL_MS = Number(process.env.AUTOMATION_SMOKE_POLL_INTERVAL_MS || 3000)
const POLL_TIMEOUT_MS = Number(process.env.AUTOMATION_SMOKE_POLL_TIMEOUT_MS || 95_000)

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function makeSignature(secret, timestamp, rawBody) {
  return crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${rawBody}`)
    .digest('hex')
}

async function requestJson(path, init = {}) {
  const response = await fetch(`${BASE_URL}${path}`, init)
  const text = await response.text()
  let json = null
  try {
    json = text ? JSON.parse(text) : null
  } catch {
    json = null
  }
  return { response, json, text }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

async function createTask(input) {
  const body = JSON.stringify(input)
  const { response, json, text } = await requestJson('/api/automation/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  })

  if (!response.ok) {
    throw new Error(`create task failed (${response.status}): ${text}`)
  }
  return json?.task
}

async function getTask(taskId) {
  const { response, json, text } = await requestJson(`/api/automation/tasks/${taskId}`)
  if (!response.ok) {
    throw new Error(`get task failed (${response.status}): ${text}`)
  }
  return json?.task
}

async function testSignedCallback(taskId, statusSnapshot) {
  const signatureEnabled = Boolean(statusSnapshot?.webhookSecurity?.signatureEnabled)
  const allowedSources = Array.isArray(statusSnapshot?.webhookSecurity?.sourceAllowlist)
    ? statusSnapshot.webhookSecurity.sourceAllowlist
    : []

  if (!signatureEnabled) {
    if (REQUIRE_SIGNATURE) {
      throw new Error('signature test is required but server signature verification is disabled')
    }
    console.log('[skip] callback signature test skipped: server signature is disabled')
    return
  }

  const callbackBody = {
    status: 'completed',
    externalId: `smoke-callback-${Date.now()}`,
    resultPayload: {
      message: 'smoke callback signed',
      publishedPlatforms: ['twitter'],
      artifactUrls: ['https://example.com/smoke-artifact'],
    },
  }
  const rawBody = JSON.stringify(callbackBody)

  const source = allowedSources[0] || process.env.AUTOMATION_WEBHOOK_SOURCE || 'n8n'
  const unauthorized = await requestJson(`/api/automation/tasks/${taskId}/status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-automation-source': source,
    },
    body: rawBody,
  })
  assert(unauthorized.response.status === 401, `unsigned callback expected 401 but got ${unauthorized.response.status}`)
  console.log('[ok] unsigned callback blocked')

  assert(WEBHOOK_SECRET, 'AUTOMATION_WEBHOOK_SECRET is required to verify signed callback')
  const timestamp = Math.floor(Date.now() / 1000).toString()
  const signature = makeSignature(WEBHOOK_SECRET, timestamp, rawBody)

  const signed = await requestJson(`/api/automation/tasks/${taskId}/status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-automation-source': source,
      'x-automation-timestamp': timestamp,
      'x-automation-signature': signature,
    },
    body: rawBody,
  })
  assert(signed.response.ok, `signed callback failed (${signed.response.status}): ${signed.text}`)
  console.log('[ok] signed callback accepted')
}

async function waitForScheduledDispatch(taskId) {
  const startedAt = Date.now()
  while (Date.now() - startedAt <= POLL_TIMEOUT_MS) {
    const task = await getTask(taskId)
    if (task?.status && task.status !== 'queued') {
      return task
    }
    await sleep(POLL_INTERVAL_MS)
  }
  const latest = await getTask(taskId)
  throw new Error(`scheduler did not dispatch task within timeout, latest status=${latest?.status || 'unknown'}`)
}

async function main() {
  console.log(`[info] automation smoke started, baseUrl=${BASE_URL}`)

  const statusResult = await requestJson('/api/automation/status')
  assert(statusResult.response.ok, `load /api/automation/status failed: ${statusResult.response.status}`)
  const statusSnapshot = statusResult.json || {}
  console.log('[ok] status endpoint reachable')

  const callbackTask = await createTask({
    workflowId: 'trend-scraper',
    topic: `smoke-callback-${Date.now()}`,
    triggerMode: 'manual',
    source: 'automation-smoke',
    autoDispatch: false,
    payload: {
      dispatchMode: 'n8n',
      schedule: null,
    },
  })
  assert(callbackTask?.id, 'create callback task returned empty id')
  console.log(`[ok] callback task created: ${callbackTask.id}`)

  await testSignedCallback(callbackTask.id, statusSnapshot)

  const scheduledTopic = `smoke-scheduler-${Date.now()}`
  const scheduledTask = await createTask({
    workflowId: 'trend-scraper',
    topic: scheduledTopic,
    triggerMode: 'scheduled',
    source: 'automation-smoke',
    autoDispatch: false,
    payload: {
      dispatchMode: 'provider',
      schedule: {
        id: 'smoke-every-minute',
        label: 'Smoke Every Minute',
        cron: '* * * * *',
      },
    },
  })
  assert(scheduledTask?.id, 'create scheduled task returned empty id')
  assert(scheduledTask?.next_run_at, 'scheduled task next_run_at should not be empty')
  console.log(`[ok] scheduled task created: ${scheduledTask.id}, nextRunAt=${scheduledTask.next_run_at}`)

  const scheduledAfterDispatch = await waitForScheduledDispatch(scheduledTask.id)
  console.log(`[ok] scheduler dispatched scheduled task, status=${scheduledAfterDispatch.status}`)

  const dashboardResult = await requestJson('/api/automation/dashboard?windowDays=7&recentLimit=20')
  assert(dashboardResult.response.ok, `dashboard failed: ${dashboardResult.response.status}`)
  const dashboard = dashboardResult.json?.dashboard
  assert(dashboard && typeof dashboard.totals?.total === 'number', 'dashboard payload invalid')
  console.log(`[ok] dashboard reachable, total=${dashboard.totals.total}, failed=${dashboard.totals.failed}, completed=${dashboard.totals.completed}`)

  const historyResult = await requestJson(`/api/automation/history?limit=20&q=${encodeURIComponent(scheduledTopic)}`)
  assert(historyResult.response.ok, `history failed: ${historyResult.response.status}`)
  const historyItems = Array.isArray(historyResult.json?.items) ? historyResult.json.items : []
  assert(historyItems.some((item) => item.topic === scheduledTopic), 'history does not contain scheduled smoke task')
  console.log('[ok] history query matched scheduled task')

  console.log('[pass] automation smoke finished')
  console.log(JSON.stringify({
    callbackTaskId: callbackTask.id,
    scheduledTaskId: scheduledTask.id,
    scheduledTaskStatus: scheduledAfterDispatch.status,
    dashboardTotals: dashboard.totals,
  }, null, 2))
}

main().catch((error) => {
  console.error('[fail] automation smoke failed')
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
