import { Router } from 'express'
import {
  createAutomationTask,
  dispatchAutomationTask,
  getAutomationDashboard,
  getAutomationTask,
  listAutomationTaskHistory,
  listAutomationTasks,
  retryAutomationTask,
  updateAutomationTask,
} from '../services/automationTaskService'
import {
  isAutomationSignatureRequired,
  isAutomationWebhookMisconfigured,
  verifyAutomationCallbackRequest,
} from '../services/automationWebhookSecurity'

export const automationRouter = Router()

const providers = [
  {
    key: 'deepseek',
    label: 'DeepSeek',
    configured: Boolean(process.env.DEEPSEEK_API_KEY),
    recommendedFor: '长文 / 多平台改写'
  },
  {
    key: 'gemini',
    label: 'Gemini',
    configured: Boolean(process.env.GEMINI_API_KEY),
    recommendedFor: '图像理解 / 轻量生成'
  },
  {
    key: 'unsplash',
    label: 'Unsplash',
    configured: Boolean(process.env.UNSPLASH_ACCESS_KEY),
    recommendedFor: '自动配图'
  },
  {
    key: 'twitter',
    label: 'Twitter API',
    configured: Boolean(process.env.TWITTER_BEARER_TOKEN),
    recommendedFor: '趋势抓取 / 发布'
  },
  {
    key: 'weibo',
    label: 'Weibo API',
    configured: Boolean(process.env.WEIBO_ACCESS_TOKEN),
    recommendedFor: '中文分发'
  },
  {
    key: 'xiaohongshu',
    label: '小红书渠道',
    configured: Boolean(process.env.XIAOHONGSHU_ACCESS_TOKEN),
    recommendedFor: '人工 / 半自动分发'
  },
]

const workflows = [
  {
    id: 'trend-scraper',
    title: '趋势抓取流水线',
    downloadPath: '/workflows/intelligent-scraper.json',
    importReady: true,
  },
  {
    id: 'multi-platform-remix',
    title: '多平台改写流水线',
    downloadPath: '/workflows/multi-platform-publisher.json',
    importReady: true,
  },
  {
    id: 'auto-content-engine',
    title: '自动内容生产流水线',
    downloadPath: '/workflows/auto-content-generation.json',
    importReady: true,
  },
]

automationRouter.get('/status', (_req, res) => {
  const signatureEnabled = Boolean(process.env.AUTOMATION_WEBHOOK_SECRET)
  res.json({
    providers,
    workflows,
    providerExecution: {
      directMode: process.env.AUTOMATION_PROVIDER_DIRECT_MODE === 'true',
      xiaohongshuWebhookConfigured: Boolean(process.env.XIAOHONGSHU_WEBHOOK_URL),
    },
    scheduler: {
      enabled: process.env.AUTOMATION_SCHEDULER_ENABLED !== 'false',
      intervalMs: Number(process.env.AUTOMATION_SCHEDULER_INTERVAL_MS || 30000),
      batchSize: Number(process.env.AUTOMATION_SCHEDULER_BATCH_SIZE || 10),
    },
    webhookSecurity: {
      signatureEnabled,
      signatureRequired: isAutomationSignatureRequired(),
      productionUnsafe: isAutomationWebhookMisconfigured(),
      sourceAllowlist: (process.env.AUTOMATION_WEBHOOK_ALLOWED_SOURCES || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    },
    note: '工作流 JSON 已内置到前端 public/workflows，可直接下载导入 n8n。',
  })
})

automationRouter.get('/tasks', async (req, res) => {
  try {
    const limit = Number(req.query.limit || 20)
    const tasks = await listAutomationTasks(limit)
    res.json({ success: true, tasks })
  } catch (error) {
    console.error('❌ Failed to load automation tasks:', error)
    res.status(500).json({ success: false, error: 'Failed to load automation tasks' })
  }
})

automationRouter.get('/tasks/:id', async (req, res) => {
  try {
    const task = await getAutomationTask(req.params.id)
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' })
    }
    res.json({ success: true, task })
  } catch (error) {
    console.error('❌ Failed to load automation task:', error)
    res.status(500).json({ success: false, error: 'Failed to load automation task' })
  }
})

automationRouter.get('/dashboard', async (req, res) => {
  try {
    const windowDays = Number(req.query.windowDays || 7)
    const recentLimit = Number(req.query.recentLimit || 12)
    const dashboard = await getAutomationDashboard(windowDays, recentLimit)
    res.json({ success: true, dashboard })
  } catch (error) {
    console.error('❌ Failed to load automation dashboard:', error)
    res.status(500).json({ success: false, error: 'Failed to load automation dashboard' })
  }
})

automationRouter.get('/history', async (req, res) => {
  try {
    const history = await listAutomationTaskHistory({
      status: typeof req.query.status === 'string' ? (req.query.status as any) : undefined,
      workflowId: typeof req.query.workflowId === 'string' ? (req.query.workflowId as any) : undefined,
      triggerMode: typeof req.query.triggerMode === 'string' ? (req.query.triggerMode as any) : undefined,
      q: typeof req.query.q === 'string' ? req.query.q : undefined,
      limit: Number(req.query.limit || 20),
      offset: Number(req.query.offset || 0),
    })

    res.json({ success: true, ...history })
  } catch (error) {
    console.error('❌ Failed to load automation history:', error)
    res.status(500).json({ success: false, error: 'Failed to load automation history' })
  }
})

automationRouter.post('/tasks', async (req, res) => {
  try {
    const { workflowId, topic, payload, triggerMode, source, autoDispatch } = req.body || {}

    if (!workflowId || !topic) {
      return res.status(400).json({
        success: false,
        error: 'workflowId and topic are required'
      })
    }

    const task = await createAutomationTask({
      workflowId,
      topic,
      payload,
      triggerMode,
      source,
      autoDispatch,
    })

    res.status(201).json({ success: true, task })
  } catch (error) {
    console.error('❌ Failed to create automation task:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create automation task'
    })
  }
})

automationRouter.post('/tasks/:id/dispatch', async (req, res) => {
  try {
    const task = await dispatchAutomationTask(req.params.id)
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' })
    }

    res.json({ success: true, task })
  } catch (error) {
    console.error('❌ Failed to dispatch automation task:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to dispatch automation task'
    })
  }
})

automationRouter.post('/tasks/:id/retry', async (req, res) => {
  try {
    const task = await retryAutomationTask(req.params.id)
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' })
    }

    res.json({ success: true, task })
  } catch (error) {
    console.error('❌ Failed to retry automation task:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retry automation task'
    })
  }
})

automationRouter.post('/tasks/:id/review', async (req, res) => {
  try {
    const existing = await getAutomationTask(req.params.id)
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Task not found' })
    }

    if (existing.status !== 'queued') {
      return res.status(409).json({ success: false, error: 'Only queued tasks can be reviewed' })
    }

    const action = typeof req.body?.action === 'string' ? req.body.action.trim() : ''
    const note = typeof req.body?.note === 'string' ? req.body.note.trim() : ''
    const replacementTaskId = typeof req.body?.replacementTaskId === 'string'
      ? req.body.replacementTaskId.trim()
      : ''

    if (!['approved', 'rejected', 'replaced'].includes(action)) {
      return res.status(400).json({ success: false, error: 'Invalid review action' })
    }

    const baseResultPayload = {
      ...(existing.result_payload || {}),
      reviewAction: action,
      reviewNote: note || null,
      reviewedAt: new Date().toISOString(),
    }

    const updateInput = action === 'approved'
      ? {
          status: 'queued' as const,
          errorMessage: null,
          resultPayload: baseResultPayload,
        }
      : action === 'replaced'
        ? {
            status: 'replaced' as const,
            errorMessage: note || null,
            resultPayload: {
              ...baseResultPayload,
              replacementTaskId: replacementTaskId || null,
            },
            completed: true,
          }
        : {
            status: 'rejected' as const,
            errorMessage: note || 'Rejected in review queue',
            resultPayload: baseResultPayload,
            completed: true,
          }

    const task = await updateAutomationTask(req.params.id, updateInput)
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' })
    }

    res.json({ success: true, task })
  } catch (error) {
    console.error('❌ Failed to review automation task:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to review automation task'
    })
  }
})

automationRouter.post('/tasks/:id/reject', async (req, res) => {
  try {
    const existing = await getAutomationTask(req.params.id)
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Task not found' })
    }

    if (existing.status !== 'queued') {
      return res.status(409).json({ success: false, error: 'Only queued tasks can be rejected' })
    }

    const reason = typeof req.body?.reason === 'string' && req.body.reason.trim()
      ? req.body.reason.trim()
      : 'Rejected in review queue'

    const task = await updateAutomationTask(req.params.id, {
      status: 'rejected',
      errorMessage: reason,
      resultPayload: {
        ...(existing.result_payload || {}),
        reviewAction: 'rejected',
        reviewReason: reason,
        rejectedAt: new Date().toISOString(),
      },
      completed: true,
    })

    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' })
    }

    res.json({ success: true, task })
  } catch (error) {
    console.error('❌ Failed to reject automation task:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reject automation task'
    })
  }
})

automationRouter.post('/tasks/:id/status', async (req, res) => {
  try {
    const verification = verifyAutomationCallbackRequest(req)
    if (!verification.ok) {
      return res.status(401).json({
        success: false,
        error: `Callback verification failed: ${verification.reason || 'unauthorized'}`
      })
    }

    const { status, externalId, errorMessage, resultPayload } = req.body || {}

    if (!status) {
      return res.status(400).json({ success: false, error: 'status is required' })
    }

    const normalizedStatus = String(status)
    if (!['queued', 'dispatched', 'completed', 'failed'].includes(normalizedStatus)) {
      return res.status(400).json({ success: false, error: 'Invalid status' })
    }

    const task = await updateAutomationTask(req.params.id, {
      status: normalizedStatus as any,
      externalId,
      errorMessage,
      resultPayload,
      completed: normalizedStatus === 'completed',
      dispatched: normalizedStatus === 'dispatched',
    })

    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' })
    }

    res.json({ success: true, task })
  } catch (error) {
    console.error('❌ Failed to update automation task status:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update automation task status'
    })
  }
})
