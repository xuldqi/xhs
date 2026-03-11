# Automation Callback Guide

内容工厂派发任务到外部自动化系统（例如 n8n）后，可以通过下面的接口把执行结果回写到当前项目：

## Callback Endpoint

`POST /api/automation/tasks/:id/status`

示例：

```bash
curl -X POST http://localhost:3001/api/automation/tasks/TASK_ID/status \
  -H 'Content-Type: application/json' \
  -d '{
    "status": "completed",
    "externalId": "n8n-execution-123",
    "resultPayload": {
      "message": "多平台改写已完成",
      "publishedPlatforms": ["twitter", "xiaohongshu"],
      "artifactUrls": ["https://example.com/file1"]
    }
  }'
```

当配置了 `AUTOMATION_WEBHOOK_SECRET` 后，回调还需要带上以下 Header：

- `x-automation-timestamp`: Unix 秒级时间戳
- `x-automation-signature`: `HMAC_SHA256(secret, "${timestamp}.${rawBody}")`
- `x-automation-source`: 来源标识（需命中 `AUTOMATION_WEBHOOK_ALLOWED_SOURCES`）

生产环境（`NODE_ENV=production`）下，服务端会强制要求 `AUTOMATION_WEBHOOK_SECRET`，未配置时回调会被拒绝（fail-closed）。

## Supported Status

- `queued`
- `dispatched`
- `completed`
- `failed`

## Request Body

```json
{
  "status": "completed",
  "externalId": "optional-execution-id",
  "errorMessage": "optional-error-message",
  "resultPayload": {
    "message": "任务执行完成",
    "any": "structured result"
  }
}
```

## Recommended n8n Flow

1. 从内容工厂接收 webhook
2. 执行抓取 / 改写 / 发布工作流
3. 成功时回调 `completed`
4. 失败时回调 `failed`，并填入 `errorMessage`
5. 将执行结果、产物链接或平台发布结果放到 `resultPayload`

## Server Scheduler

- 后端已支持服务端定时调度：`trigger_mode=scheduled` 的任务会按 `payload.schedule.cron` 自动派发
- 可通过以下环境变量控制：
  - `AUTOMATION_SCHEDULER_ENABLED`
  - `AUTOMATION_SCHEDULER_INTERVAL_MS`
  - `AUTOMATION_SCHEDULER_BATCH_SIZE`
- 每个 scheduled 任务会维护 `next_run_at`，用于下一次自动执行时间

## Dashboard & History API

- `GET /api/automation/dashboard`：发布结果看板数据（成功率、失败率、最近执行、平台分布）
- `GET /api/automation/history`：执行历史分页与筛选（支持 `status/workflowId/triggerMode/q/limit/offset`）
- `GET /api/automation/tasks/:id`：单任务详情

## Provider Adapters

- 后端已支持 provider 直连执行链（Twitter / Weibo / Unsplash / 小红书 webhook）
- 默认优先走 n8n webhook；当未配置 webhook 或 `AUTOMATION_PROVIDER_DIRECT_MODE=true` 时会走 provider chain
- 可配置：
  - `TWITTER_BEARER_TOKEN`
  - `WEIBO_ACCESS_TOKEN`
  - `UNSPLASH_ACCESS_KEY`
  - `XIAOHONGSHU_WEBHOOK_URL`

## End-to-End Smoke Test

项目内置了联调脚本，可一次性验证以下链路：

- callback 验签：未签名被拒绝、已签名通过
- scheduler 自动派发：`scheduled` 任务到点自动执行
- dashboard/history 接口：执行结果可查询

启动后端（示例）：

```bash
cd backend
PORT=3001 \
AUTOMATION_PROVIDER_DIRECT_MODE=true \
AUTOMATION_SCHEDULER_ENABLED=true \
AUTOMATION_SCHEDULER_INTERVAL_MS=3000 \
AUTOMATION_WEBHOOK_SECRET=smoke-secret \
AUTOMATION_WEBHOOK_ALLOWED_SOURCES=n8n \
npm run dev
```

执行 smoke：

```bash
cd ..
AUTOMATION_SMOKE_BASE_URL=http://127.0.0.1:3001 \
AUTOMATION_WEBHOOK_SECRET=smoke-secret \
npm run smoke:automation
```

可选参数：

- `AUTOMATION_SMOKE_POLL_INTERVAL_MS`（默认 `3000`）
- `AUTOMATION_SMOKE_POLL_TIMEOUT_MS`（默认 `95000`）
- `AUTOMATION_SMOKE_REQUIRE_SIGNATURE`（默认 `false`，设为 `true` 时若服务端未开启签名会直接失败）

## Notes

- `externalId` 推荐填写 n8n execution id，便于排查
- `resultPayload` 会在前端任务详情中可视化展示
- 如果是异步长任务，建议先回调 `dispatched`，结束后再回调 `completed` / `failed`
- 若回调验签失败，接口会返回 `401 Callback verification failed`
