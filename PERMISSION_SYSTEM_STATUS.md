# 权限系统和会员限制状态

## ✅ 已实现的功能

### 1. 会员套餐配置

| 套餐类型 | 名称 | 价格 | 有效期 | 每日生成次数 | 每日导出次数 | 历史记录数 |
|---------|------|------|--------|------------|------------|-----------|
| free | 免费体验 | ¥0 | 永久 | 1次/天 | 1次/天 | 3条 |
| basic | 基础会员 | ¥29.9 | 30天 | 10次/天 | 999次/天 | 50条 |
| pro | 专业会员 | ¥99 | 30天 | 999次/天 | 999次/天 | 999条 |
| lifetime | 终身会员 | ¥299 | 永久 | 999次/天 | 999次/天 | 999条 |

### 2. 权限检查机制 ✅

**文件：** `src/composables/usePermission.ts`

- ✅ `checkGeneratePermission()` - 检查是否可以生成指南
- ✅ `checkExportPermission()` - 检查是否可以导出
- ✅ `logUsage()` - 记录使用日志

**检查流程：**
1. 检查是否登录
2. 检查会员是否激活
3. 检查会员是否过期
4. 检查今日使用次数是否超限
5. 返回是否允许 + 剩余次数

### 3. 会员到期检测 ✅

**数据库函数：** `get_user_vip_status()`

```sql
CASE 
  WHEN s.plan_type = 'lifetime' THEN TRUE  -- 终身会员永不过期
  WHEN s.plan_type = 'free' THEN TRUE      -- 免费会员永不过期
  WHEN s.expires_at IS NULL THEN FALSE     -- 没有过期时间
  WHEN s.expires_at > NOW() THEN TRUE      -- 未到期
  ELSE FALSE                                -- 已过期
END as is_active
```

**前端检测：** `src/services/userService.ts`

```typescript
// 检查会员是否激活
if (!vipStatus || !vipStatus.is_active) {
  // 检查是否是因为过期
  if (vipStatus && vipStatus.expires_at) {
    const expiresAt = new Date(vipStatus.expires_at)
    if (expiresAt < new Date()) {
      return { allowed: false, reason: '您的会员已过期，请续费' }
    }
  }
  return { allowed: false, reason: '请先开通会员' }
}
```

### 4. 使用次数限制 ✅

**数据库函数：** `get_today_usage_count()`

- 统计用户今日的使用次数
- 按操作类型分别统计（生成/导出）
- 每日 00:00 自动重置

**前端检查：**
```typescript
const todayCount = await this.getTodayUsageCount(userId, actionType)
const limit = actionType === 'generate_guide' 
  ? planConfig.daily_generate_limit 
  : planConfig.daily_export_limit

if (todayCount >= limit) {
  return { 
    allowed: false, 
    reason: `今日${actionType === 'generate_guide' ? '生成' : '导出'}次数已用完`,
    remaining: 0
  }
}
```

### 5. 用户体验优化 ✅

**权限不足时的提示：**
- 未登录 → 提示登录，跳转到登录页
- 会员过期 → 提示"您的会员已过期，请续费"，跳转到定价页
- 次数用完 → 提示"今日生成/导出次数已用完"，跳转到定价页

### 6. 支付系统 ✅

**支付宝集成：**
- ✅ 支付宝沙箱环境配置
- ✅ 支付接口实现
- ✅ 支付回调处理
- ✅ 订单状态更新
- ✅ 自动开通会员

## 📋 使用流程

### 用户生成指南流程

1. 用户点击"生成指南"
2. 调用 `checkGeneratePermission()`
3. 检查登录状态
4. 检查会员状态（是否激活、是否过期）
5. 检查今日使用次数
6. 如果通过 → 允许生成，记录使用日志
7. 如果不通过 → 显示提示，引导升级

### 会员到期处理流程

1. 用户尝试使用功能
2. 调用 `getVIPStatus()` 获取会员状态
3. 数据库函数自动检查 `expires_at > NOW()`
4. 如果已过期 → `is_active = FALSE`
5. 前端检测到过期 → 显示"会员已过期"提示
6. 引导用户续费

## 🔧 自动过期订阅标记（可选）

**文件：** `expire-subscriptions.sql`

提供了自动标记过期订阅的数据库函数和定时任务配置：

```sql
-- 手动执行
SELECT expire_old_subscriptions();

-- 或使用 pg_cron 定时任务（每小时执行）
SELECT cron.schedule(
  'expire-subscriptions',
  '0 * * * *',
  'SELECT expire_old_subscriptions();'
);
```

**注意：** 即使不运行定时任务，前端也会实时检测过期状态，不影响功能。

## ✅ 测试清单

- [x] 免费用户每天只能生成1次
- [x] 基础会员每天可以生成10次
- [x] 专业会员每天可以生成999次
- [x] 终身会员永不过期
- [x] 会员到期后无法使用付费功能
- [x] 会员到期提示"会员已过期，请续费"
- [x] 未登录用户提示登录
- [x] 次数用完提示升级会员
- [x] 支付成功后自动开通会员
- [x] 历史记录功能已完整实现

## 🎯 总结

所有权限限制和会员到期检测功能都已完整实现：

1. ✅ 支付系统正常工作
2. ✅ 会员等级限制已设置
3. ✅ 每日使用次数限制已实现
4. ✅ 会员到期自动检测
5. ✅ 到期后无法使用付费功能
6. ✅ 友好的用户提示和引导

系统已经可以正常运行，会员到期后会自动检测并阻止使用，提示用户续费！
