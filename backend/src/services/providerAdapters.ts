import type { AutomationTaskRecord } from './automationTaskService'

interface ProviderStepResult {
  provider: string
  action: string
  success: boolean
  message: string
  externalId?: string | null
  payload?: Record<string, any>
}

export interface ProviderChainSummary {
  mode: 'provider-chain'
  success: boolean
  message: string
  providerResults: ProviderStepResult[]
  publishedPlatforms: string[]
  artifactUrls: string[]
}

const REQUEST_TIMEOUT_MS = 12_000

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean)
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.map((item) => item.trim()).filter(Boolean))]
}

function buildBasePublishText(task: AutomationTaskRecord): string {
  const textCandidates = [
    task.payload?.publishText,
    task.payload?.summary,
    task.payload?.contentSummary,
    task.payload?.topic,
    task.topic,
  ]
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean)

  const baseText = textCandidates[0] || task.topic
  return baseText.length > 240 ? baseText.slice(0, 240) : baseText
}

function getSelectedPlatforms(task: AutomationTaskRecord): string[] {
  const selected = normalizeStringArray(task.payload?.selectedPlatforms || task.payload?.platforms)
  if (selected.length > 0) {
    return uniqueStrings(selected.map((item) => item.toLowerCase()))
  }

  if (task.workflow_id === 'multi-platform-remix') {
    return ['twitter', 'weibo']
  }
  if (task.workflow_id === 'auto-content-engine') {
    return ['twitter', 'weibo', 'xiaohongshu']
  }
  return []
}

async function fetchWithTimeout(url: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timer)
  }
}

async function callTwitterTrend(topic: string): Promise<ProviderStepResult> {
  const token = (process.env.TWITTER_BEARER_TOKEN || '').trim()
  if (!token) {
    return {
      provider: 'twitter',
      action: 'trend_search',
      success: false,
      message: 'TWITTER_BEARER_TOKEN not configured',
    }
  }

  try {
    const query = encodeURIComponent(`${topic} -is:retweet lang:en`)
    const response = await fetchWithTimeout(`https://api.twitter.com/2/tweets/search/recent?query=${query}&max_results=10`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    if (!response.ok) {
      return {
        provider: 'twitter',
        action: 'trend_search',
        success: false,
        message: `Twitter trend API failed: ${response.status}`,
      }
    }

    const data: any = await response.json().catch(() => ({}))
    return {
      provider: 'twitter',
      action: 'trend_search',
      success: true,
      message: 'Twitter trend data fetched',
      payload: {
        count: Array.isArray(data?.data) ? data.data.length : 0,
        items: (Array.isArray(data?.data) ? data.data : []).slice(0, 5),
      },
    }
  } catch (error) {
    return {
      provider: 'twitter',
      action: 'trend_search',
      success: false,
      message: error instanceof Error ? error.message : 'Twitter trend request failed',
    }
  }
}

async function publishTwitter(text: string): Promise<ProviderStepResult> {
  const token = (process.env.TWITTER_BEARER_TOKEN || '').trim()
  if (!token) {
    return {
      provider: 'twitter',
      action: 'publish',
      success: false,
      message: 'TWITTER_BEARER_TOKEN not configured',
    }
  }

  const content = text.length > 280 ? `${text.slice(0, 277)}...` : text

  try {
    const response = await fetchWithTimeout('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: content }),
    })

    if (!response.ok) {
      return {
        provider: 'twitter',
        action: 'publish',
        success: false,
        message: `Twitter publish failed: ${response.status}`,
      }
    }

    const data: any = await response.json().catch(() => ({}))
    return {
      provider: 'twitter',
      action: 'publish',
      success: true,
      message: 'Twitter publish success',
      externalId: data?.data?.id || null,
      payload: data,
    }
  } catch (error) {
    return {
      provider: 'twitter',
      action: 'publish',
      success: false,
      message: error instanceof Error ? error.message : 'Twitter publish failed',
    }
  }
}

async function callWeiboTrend(topic: string): Promise<ProviderStepResult> {
  const token = (process.env.WEIBO_ACCESS_TOKEN || '').trim()
  if (!token) {
    return {
      provider: 'weibo',
      action: 'trend_search',
      success: false,
      message: 'WEIBO_ACCESS_TOKEN not configured',
    }
  }

  try {
    const query = encodeURIComponent(topic)
    const response = await fetchWithTimeout(`https://api.weibo.com/2/search/topics.json?access_token=${token}&q=${query}&count=5`)
    if (!response.ok) {
      return {
        provider: 'weibo',
        action: 'trend_search',
        success: false,
        message: `Weibo trend API failed: ${response.status}`,
      }
    }

    const data: any = await response.json().catch(() => ({}))
    return {
      provider: 'weibo',
      action: 'trend_search',
      success: true,
      message: 'Weibo trend data fetched',
      payload: {
        items: Array.isArray(data?.statuses) ? data.statuses.slice(0, 5) : [],
      },
    }
  } catch (error) {
    return {
      provider: 'weibo',
      action: 'trend_search',
      success: false,
      message: error instanceof Error ? error.message : 'Weibo trend request failed',
    }
  }
}

async function publishWeibo(text: string): Promise<ProviderStepResult> {
  const token = (process.env.WEIBO_ACCESS_TOKEN || '').trim()
  if (!token) {
    return {
      provider: 'weibo',
      action: 'publish',
      success: false,
      message: 'WEIBO_ACCESS_TOKEN not configured',
    }
  }

  const status = text.length > 140 ? `${text.slice(0, 137)}...` : text
  const body = new URLSearchParams({
    access_token: token,
    status,
  }).toString()

  try {
    const response = await fetchWithTimeout('https://api.weibo.com/2/statuses/update.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    })

    if (!response.ok) {
      return {
        provider: 'weibo',
        action: 'publish',
        success: false,
        message: `Weibo publish failed: ${response.status}`,
      }
    }

    const data: any = await response.json().catch(() => ({}))
    return {
      provider: 'weibo',
      action: 'publish',
      success: true,
      message: 'Weibo publish success',
      externalId: data?.idstr || data?.id || null,
      payload: data,
    }
  } catch (error) {
    return {
      provider: 'weibo',
      action: 'publish',
      success: false,
      message: error instanceof Error ? error.message : 'Weibo publish failed',
    }
  }
}

async function fetchUnsplashImage(topic: string): Promise<ProviderStepResult> {
  const accessKey = (process.env.UNSPLASH_ACCESS_KEY || '').trim()
  if (!accessKey) {
    return {
      provider: 'unsplash',
      action: 'search_image',
      success: false,
      message: 'UNSPLASH_ACCESS_KEY not configured',
    }
  }

  try {
    const query = encodeURIComponent(topic)
    const response = await fetchWithTimeout(`https://api.unsplash.com/search/photos?query=${query}&per_page=1`, {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
      },
    })

    if (!response.ok) {
      return {
        provider: 'unsplash',
        action: 'search_image',
        success: false,
        message: `Unsplash request failed: ${response.status}`,
      }
    }

    const data: any = await response.json().catch(() => ({}))
    const first = Array.isArray(data?.results) ? data.results[0] : null
    const imageUrl = first?.urls?.regular || first?.urls?.full || null

    if (!imageUrl) {
      return {
        provider: 'unsplash',
        action: 'search_image',
        success: false,
        message: 'No Unsplash image found',
      }
    }

    return {
      provider: 'unsplash',
      action: 'search_image',
      success: true,
      message: 'Unsplash image fetched',
      payload: {
        url: imageUrl,
        photographer: first?.user?.name || '',
      },
    }
  } catch (error) {
    return {
      provider: 'unsplash',
      action: 'search_image',
      success: false,
      message: error instanceof Error ? error.message : 'Unsplash request failed',
    }
  }
}

async function publishXiaohongshuByWebhook(task: AutomationTaskRecord, text: string): Promise<ProviderStepResult> {
  const webhookUrl = (process.env.XIAOHONGSHU_WEBHOOK_URL || '').trim()
  if (!webhookUrl) {
    return {
      provider: 'xiaohongshu',
      action: 'publish',
      success: false,
      message: 'XIAOHONGSHU_WEBHOOK_URL not configured',
    }
  }

  try {
    const response = await fetchWithTimeout(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        taskId: task.id,
        topic: task.topic,
        text,
        payload: task.payload,
      }),
    })

    if (!response.ok) {
      return {
        provider: 'xiaohongshu',
        action: 'publish',
        success: false,
        message: `Xiaohongshu webhook failed: ${response.status}`,
      }
    }

    const data: any = await response.json().catch(() => ({}))
    return {
      provider: 'xiaohongshu',
      action: 'publish',
      success: true,
      message: 'Xiaohongshu webhook accepted',
      externalId: data?.id || data?.executionId || null,
      payload: data,
    }
  } catch (error) {
    return {
      provider: 'xiaohongshu',
      action: 'publish',
      success: false,
      message: error instanceof Error ? error.message : 'Xiaohongshu webhook failed',
    }
  }
}

function summarizeProviderResults(results: ProviderStepResult[]): { success: boolean; message: string } {
  const successCount = results.filter((item) => item.success).length
  if (results.length === 0) {
    return {
      success: false,
      message: 'No provider steps executed',
    }
  }
  if (successCount === 0) {
    return {
      success: false,
      message: 'All provider steps failed',
    }
  }
  if (successCount < results.length) {
    return {
      success: true,
      message: `Partial success: ${successCount}/${results.length} provider steps passed`,
    }
  }
  return {
    success: true,
    message: `All provider steps passed (${results.length})`,
  }
}

export async function executeAutomationProviderChain(
  task: AutomationTaskRecord,
  _callbackUrl: string
): Promise<ProviderChainSummary> {
  const providerResults: ProviderStepResult[] = []
  const publishedPlatforms: string[] = []
  const artifactUrls: string[] = []
  const publishText = buildBasePublishText(task)

  if (task.workflow_id === 'trend-scraper') {
    providerResults.push(await callTwitterTrend(task.topic))
    providerResults.push(await callWeiboTrend(task.topic))
  } else {
    if (task.workflow_id === 'auto-content-engine') {
      const imageStep = await fetchUnsplashImage(task.topic)
      providerResults.push(imageStep)
      if (imageStep.success && imageStep.payload?.url) {
        artifactUrls.push(String(imageStep.payload.url))
      }
    }

    const targets = getSelectedPlatforms(task)
    for (const target of targets) {
      if (target === 'twitter' || target === 'x') {
        const step = await publishTwitter(publishText)
        providerResults.push(step)
        if (step.success) publishedPlatforms.push('twitter')
        continue
      }

      if (target === 'weibo') {
        const step = await publishWeibo(publishText)
        providerResults.push(step)
        if (step.success) publishedPlatforms.push('weibo')
        continue
      }

      if (target === 'xiaohongshu') {
        const step = await publishXiaohongshuByWebhook(task, publishText)
        providerResults.push(step)
        if (step.success) publishedPlatforms.push('xiaohongshu')
      }
    }
  }

  const summary = summarizeProviderResults(providerResults)
  return {
    mode: 'provider-chain',
    success: summary.success,
    message: summary.message,
    providerResults,
    publishedPlatforms: uniqueStrings(publishedPlatforms),
    artifactUrls: uniqueStrings(artifactUrls),
  }
}
