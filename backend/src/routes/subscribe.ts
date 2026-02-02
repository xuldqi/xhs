import { Router, Request, Response } from 'express'
import fs from 'fs/promises'
import path from 'path'

const router = Router()

const SUBSCRIPTIONS_FILE = path.join(process.cwd(), 'data', 'subscriptions.json')

interface SubscribeBody {
  email?: string
  wechat?: string
}

interface SubscriberRow {
  email?: string
  wechat?: string
  source: string
  createdAt: string
}

async function ensureDataDir() {
  const dir = path.dirname(SUBSCRIPTIONS_FILE)
  await fs.mkdir(dir, { recursive: true })
}

async function readSubscriptions(): Promise<SubscriberRow[]> {
  try {
    const raw = await fs.readFile(SUBSCRIPTIONS_FILE, 'utf-8')
    const data = JSON.parse(raw)
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

async function saveSubscriptions(rows: SubscriberRow[]) {
  await ensureDataDir()
  await fs.writeFile(SUBSCRIPTIONS_FILE, JSON.stringify(rows, null, 2), 'utf-8')
}

/**
 * 首页订阅（每日涨粉 Tips + 日历提醒）
 * 数据存本地 data/subscriptions.json，不依赖 Supabase
 * POST /api/subscribe
 * Body: { email?: string, wechat?: string }
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { email, wechat } = req.body as SubscribeBody
    const e = typeof email === 'string' ? email.trim() : ''
    const w = typeof wechat === 'string' ? wechat.trim() : ''

    if (!e && !w) {
      res.status(400).json({ success: false, message: '请填写邮箱或微信号' })
      return
    }

    const list = await readSubscriptions()
    const exists = list.some(
      (row) => (e && row.email === e) || (w && row.wechat === w)
    )
    if (exists) {
      res.status(200).json({ success: true, message: '您已订阅过，感谢支持' })
      return
    }

    list.push({
      email: e || undefined,
      wechat: w || undefined,
      source: 'homepage',
      createdAt: new Date().toISOString()
    })
    await saveSubscriptions(list)

    console.log('[Subscribe] 新订阅:', { email: e || undefined, wechat: w || undefined })
    res.status(200).json({ success: true, message: '订阅成功' })
  } catch (err) {
    console.error('[Subscribe] 处理失败:', err)
    res.status(500).json({ success: false, message: '订阅失败，请稍后重试' })
  }
})

export default router
