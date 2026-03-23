interface CronField {
  values: Set<number>
  wildcard: boolean
}

interface ParsedCronExpression {
  minute: CronField
  hour: CronField
  dayOfMonth: CronField
  month: CronField
  dayOfWeek: CronField
}

const MAX_CRON_LOOKAHEAD_MINUTES = 60 * 24 * 366

function normalizeDayOfWeek(value: number): number {
  return value === 7 ? 0 : value
}

function expandRange(
  start: number,
  end: number,
  step: number,
  min: number,
  max: number,
  normalize?: (value: number) => number
): number[] {
  if (step <= 0 || start > end || start < min || end > max) {
    return []
  }

  const values: number[] = []
  for (let value = start; value <= end; value += step) {
    values.push(normalize ? normalize(value) : value)
  }
  return values
}

function parseFieldToken(
  token: string,
  min: number,
  max: number,
  normalize?: (value: number) => number
): number[] {
  if (!token) return []

  if (token === '*') {
    return expandRange(min, max, 1, min, max, normalize)
  }

  if (token.startsWith('*/')) {
    const step = Number(token.slice(2))
    return expandRange(min, max, step, min, max, normalize)
  }

  const [base, stepPart] = token.split('/')
  const step = stepPart ? Number(stepPart) : 1
  if (!Number.isInteger(step) || step <= 0) {
    return []
  }

  if (base.includes('-')) {
    const [startRaw, endRaw] = base.split('-')
    const start = Number(startRaw)
    const end = Number(endRaw)
    if (!Number.isInteger(start) || !Number.isInteger(end)) {
      return []
    }
    return expandRange(start, end, step, min, max, normalize)
  }

  const single = Number(base)
  if (!Number.isInteger(single) || single < min || single > max) {
    return []
  }
  return [normalize ? normalize(single) : single]
}

function parseField(
  rawField: string,
  min: number,
  max: number,
  normalize?: (value: number) => number
): CronField | null {
  const field = rawField.trim()
  if (!field) return null

  const parts = field.split(',').map((part) => part.trim()).filter(Boolean)
  if (!parts.length) return null

  const values = new Set<number>()
  let wildcard = false

  for (const part of parts) {
    if (part === '*') {
      wildcard = true
    }

    const parsedValues = parseFieldToken(part, min, max, normalize)
    if (!parsedValues.length) {
      return null
    }
    parsedValues.forEach((value) => values.add(value))
  }

  return { values, wildcard }
}

function parseCronExpression(expression: string): ParsedCronExpression | null {
  const cron = expression.trim()
  if (!cron) return null

  const parts = cron.split(/\s+/)
  if (parts.length !== 5) return null

  const minute = parseField(parts[0], 0, 59)
  const hour = parseField(parts[1], 0, 23)
  const dayOfMonth = parseField(parts[2], 1, 31)
  const month = parseField(parts[3], 1, 12)
  const dayOfWeek = parseField(parts[4], 0, 7, normalizeDayOfWeek)

  if (!minute || !hour || !dayOfMonth || !month || !dayOfWeek) {
    return null
  }

  return { minute, hour, dayOfMonth, month, dayOfWeek }
}

function matchesDay(date: Date, cron: ParsedCronExpression): boolean {
  const dayOfMonth = date.getDate()
  const dayOfWeek = date.getDay()

  const domMatch = cron.dayOfMonth.values.has(dayOfMonth)
  const dowMatch = cron.dayOfWeek.values.has(dayOfWeek)

  if (cron.dayOfMonth.wildcard && cron.dayOfWeek.wildcard) {
    return true
  }
  if (cron.dayOfMonth.wildcard) {
    return dowMatch
  }
  if (cron.dayOfWeek.wildcard) {
    return domMatch
  }
  return domMatch || dowMatch
}

function matchesCron(date: Date, cron: ParsedCronExpression): boolean {
  return (
    cron.minute.values.has(date.getMinutes()) &&
    cron.hour.values.has(date.getHours()) &&
    cron.month.values.has(date.getMonth() + 1) &&
    matchesDay(date, cron)
  )
}

export function isValidCronExpression(expression: string): boolean {
  return Boolean(parseCronExpression(expression))
}

export function getNextCronRunAt(expression: string, fromDate = new Date()): Date | null {
  const cron = parseCronExpression(expression)
  if (!cron) return null

  const cursor = new Date(fromDate)
  cursor.setSeconds(0, 0)
  cursor.setMinutes(cursor.getMinutes() + 1)

  for (let i = 0; i < MAX_CRON_LOOKAHEAD_MINUTES; i += 1) {
    if (matchesCron(cursor, cron)) {
      return new Date(cursor)
    }
    cursor.setMinutes(cursor.getMinutes() + 1)
  }

  return null
}

export function getTaskScheduleCron(payload?: Record<string, any>): string | null {
  const cron = payload?.schedule?.cron
  if (typeof cron !== 'string') return null

  const trimmed = cron.trim()
  return trimmed || null
}

export function getTaskScheduleRunAt(payload?: Record<string, any>): string | null {
  const runAt = payload?.schedule?.runAt ?? payload?.plannedAt
  if (typeof runAt !== 'string') return null

  const trimmed = runAt.trim()
  if (!trimmed) return null

  const timestamp = Date.parse(trimmed)
  if (!Number.isFinite(timestamp)) {
    return null
  }

  return new Date(timestamp).toISOString()
}
