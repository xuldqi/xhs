import { dispatchDueScheduledTasks, hydrateScheduledTaskNextRuns } from './automationTaskService'

const DEFAULT_INTERVAL_MS = 30_000
const DEFAULT_BATCH_SIZE = 10

let timer: NodeJS.Timeout | null = null
let isRunning = false

function parsePositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback
  }
  return parsed
}

function schedulerEnabled(): boolean {
  return process.env.AUTOMATION_SCHEDULER_ENABLED !== 'false'
}

export function startAutomationScheduler(): void {
  if (!schedulerEnabled()) {
    console.log('⏸️ Automation scheduler disabled by AUTOMATION_SCHEDULER_ENABLED=false')
    return
  }

  if (timer) {
    return
  }

  const intervalMs = Math.max(parsePositiveInt(process.env.AUTOMATION_SCHEDULER_INTERVAL_MS, DEFAULT_INTERVAL_MS), 5_000)
  const batchSize = Math.min(parsePositiveInt(process.env.AUTOMATION_SCHEDULER_BATCH_SIZE, DEFAULT_BATCH_SIZE), 100)

  const tick = async () => {
    if (isRunning) return
    isRunning = true

    try {
      await hydrateScheduledTaskNextRuns(batchSize * 5)
      const dispatched = await dispatchDueScheduledTasks(batchSize)
      if (dispatched.length > 0) {
        console.log(`🕒 Scheduler dispatched ${dispatched.length} scheduled task(s)`)
      }
    } catch (error) {
      console.error('❌ Automation scheduler tick failed:', error)
    } finally {
      isRunning = false
    }
  }

  timer = setInterval(() => {
    void tick()
  }, intervalMs)
  timer.unref?.()

  console.log(`🕒 Automation scheduler started (interval=${intervalMs}ms, batch=${batchSize})`)
  void tick()
}

export function stopAutomationScheduler(): void {
  if (timer) {
    clearInterval(timer)
    timer = null
    console.log('🛑 Automation scheduler stopped')
  }
}
