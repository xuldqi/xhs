import crypto from 'crypto'
import type { Request } from 'express'

export const AUTOMATION_SIGNATURE_HEADER = 'x-automation-signature'
export const AUTOMATION_TIMESTAMP_HEADER = 'x-automation-timestamp'
export const AUTOMATION_SOURCE_HEADER = 'x-automation-source'

const DEFAULT_MAX_SKEW_SECONDS = 300

function normalizeHeaderValue(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) {
    const first = value[0]
    return typeof first === 'string' && first.trim() ? first.trim() : null
  }
  if (typeof value === 'string' && value.trim()) {
    return value.trim()
  }
  return null
}

function getWebhookSecret(): string {
  return (process.env.AUTOMATION_WEBHOOK_SECRET || '').trim()
}

function isProduction(): boolean {
  return (process.env.NODE_ENV || '').toLowerCase() === 'production'
}

function getAllowedSources(): string[] {
  return (process.env.AUTOMATION_WEBHOOK_ALLOWED_SOURCES || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function getSourceHeaderValue(): string {
  return process.env.AUTOMATION_WEBHOOK_SOURCE || 'content-factory-backend'
}

function getMaxSkewSeconds(): number {
  const parsed = Number(process.env.AUTOMATION_WEBHOOK_MAX_SKEW_SECONDS)
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return DEFAULT_MAX_SKEW_SECONDS
  }
  return parsed
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)
  if (leftBuffer.length !== rightBuffer.length) {
    return false
  }
  return crypto.timingSafeEqual(leftBuffer, rightBuffer)
}

function makeSignature(secret: string, timestamp: string, rawBody: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${rawBody}`)
    .digest('hex')
}

function getRawBody(req: Request): string {
  const rawBody = (req as Request & { rawBody?: string }).rawBody
  if (typeof rawBody === 'string') {
    return rawBody
  }
  return JSON.stringify(req.body || {})
}

export function isAutomationSignatureRequired(): boolean {
  return Boolean(getWebhookSecret()) || isProduction()
}

export function isAutomationWebhookMisconfigured(): boolean {
  return isProduction() && !getWebhookSecret()
}

export function createAutomationSignedHeaders(rawBody: string): Record<string, string> {
  const secret = getWebhookSecret()
  if (!secret) {
    return {
      [AUTOMATION_SOURCE_HEADER]: getSourceHeaderValue(),
    }
  }

  const timestamp = Math.floor(Date.now() / 1000).toString()
  const signature = makeSignature(secret, timestamp, rawBody)

  return {
    [AUTOMATION_TIMESTAMP_HEADER]: timestamp,
    [AUTOMATION_SIGNATURE_HEADER]: signature,
    [AUTOMATION_SOURCE_HEADER]: getSourceHeaderValue(),
  }
}

export interface VerifyAutomationCallbackResult {
  ok: boolean
  reason?: string
}

export function verifyAutomationCallbackRequest(req: Request): VerifyAutomationCallbackResult {
  const secret = getWebhookSecret()
  const signatureRequired = isAutomationSignatureRequired()
  const source = normalizeHeaderValue(req.headers[AUTOMATION_SOURCE_HEADER])
  const allowedSources = getAllowedSources()

  if (allowedSources.length > 0) {
    if (!source) {
      return { ok: false, reason: `${AUTOMATION_SOURCE_HEADER} is required` }
    }
    if (!allowedSources.includes(source)) {
      return { ok: false, reason: 'source is not allowed' }
    }
  }

  if (!secret && signatureRequired) {
    return { ok: false, reason: 'AUTOMATION_WEBHOOK_SECRET is required in production' }
  }

  if (!signatureRequired) {
    return { ok: true }
  }

  const signature = normalizeHeaderValue(req.headers[AUTOMATION_SIGNATURE_HEADER])
  if (!signature) {
    return { ok: false, reason: `${AUTOMATION_SIGNATURE_HEADER} is required` }
  }

  const timestamp = normalizeHeaderValue(req.headers[AUTOMATION_TIMESTAMP_HEADER])
  if (!timestamp) {
    return { ok: false, reason: `${AUTOMATION_TIMESTAMP_HEADER} is required` }
  }

  const timestampSeconds = Number(timestamp)
  if (!Number.isFinite(timestampSeconds)) {
    return { ok: false, reason: 'invalid timestamp' }
  }

  const nowSeconds = Math.floor(Date.now() / 1000)
  const skew = Math.abs(nowSeconds - timestampSeconds)
  if (skew > getMaxSkewSeconds()) {
    return { ok: false, reason: 'timestamp expired' }
  }

  const expectedSignature = makeSignature(secret, timestamp, getRawBody(req))
  if (!safeEqual(expectedSignature, signature)) {
    return { ok: false, reason: 'signature mismatch' }
  }

  return { ok: true }
}
