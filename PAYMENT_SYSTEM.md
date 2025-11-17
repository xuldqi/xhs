# 付费系统完整说明

## 📦 已实现的功能

### ✅ 用户系统
- [x] 邮箱密码注册/登录
- [x] 用户资料管理
- [x] 登录状态持久化
- [x] 路由守卫（需要登录的页面）

### ✅ VIP 会员系统
- [x] 4 个套餐（免费、基础、专业、终身）
- [x] 会员状态管理
- [x] 自动过期检查
- [x] 会员权益配置

### ✅ 权限控制
- [x] 每日生成次数限制
- [x] 每日导出次数限制
- [x] 历史记录数量限制
- [x] 权限检查中间件
- [x] 超限提示升级

### ✅ 支付系统
- [x] 支付宝网站支付集成
- [x] 通过备案域名代理
- [x] 订单创建和管理
- [x] 支付回调处理
- [x] 订单状态查询
- [x] 自动开通会员

### ✅ 用户中心
- [x] 会员信息展示
- [x] 使用记录查询
- [x] 订单历史查询
- [x] 个人设置修改

### ✅ 页面组件
- [x] 登录/注册页面
- [x] 套餐选择页面
- [x] 用户中心页面
- [x] 支付返回页面
- [x] 头部用户菜单

## 📁 新增文件列表

### 数据库
```
supabase-schema.sql              # Supabase 数据库设计
```

### 前端核心
```
src/lib/supabase.ts              # Supabase 客户端
src/services/authService.ts      # 认证服务
src/services/userService.ts      # 用户服务
src/stores/userStore.ts          # 用户状态管理
src/composables/usePermission.ts # 权限检查 Hook
```

### 前端页面
```
src/views/LoginView.vue          # 登录/注册页面
src/views/PricingView.vue        # 套餐选择页面
src/views/UserCenterView.vue     # 用户中心页面
src/views/PaymentReturnView.vue  # 支付返回页面
```

### 前端组件
```
src/components/user/VIPInfo.vue       # VIP 信息组件
src/components/user/UsageHistory.vue  # 使用记录组件
src/components/user/OrderHistory.vue  # 订单历史组件
src/components/user/UserSettings.vue  # 用户设置组件
```

### 后端服务
```
backend/src/services/paymentService.ts  # 支付服务
backend/src/routes/payment.ts           # 支付路由
```

### 配置文件
```
.env.example                     # 前端环境变量示例
backend/.env.example             # 后端环境变量示例
```

### 文档
```
PAYMENT_SETUP.md                 # 详细配置指南
PAYMENT_QUICKSTART.md            # 快速开始指南
PAYMENT_SYSTEM.md                # 系统说明（本文件）
```

## 🔄 工作流程

### 用户注册流程
```
1. 用户访问 /login
2. 填写邮箱密码注册
3. Supabase 创建用户
4. 触发器自动创建 profile 和免费订阅
5. 跳转到首页
```

### 购买会员流程
```
1. 用户访问 /pricing
2. 选择套餐点击购买
3. 前端调用后端 /api/payment/create-order
4. 后端调用备案域名支付 API
5. 获取支付链接并跳转
6. 用户在支付宝完成支付
7. 支付宝回调备案域名
8. 备案域名转发回调到当前项目后端
9. 后端更新订单状态并开通会员
10. 用户返回查看会员状态
```

### 权限检查流程
```
1. 用户点击"生成指南"
2. 调用 checkGeneratePermission()
3. 检查是否登录
4. 检查 VIP 状态
5. 检查今日使用次数
6. 允许/拒绝操作
7. 记录使用日志
```

## 🗄️ 数据库表结构

### profiles（用户资料）
```sql
- id: UUID (主键)
- email: TEXT
- phone: TEXT
- nickname: TEXT
- avatar_url: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### subscriptions（订阅）
```sql
- id: UUID (主键)
- user_id: UUID (外键)
- plan_type: TEXT (free/basic/pro/lifetime)
- status: TEXT (active/expired/cancelled)
- started_at: TIMESTAMP
- expires_at: TIMESTAMP
- auto_renew: BOOLEAN
```

### usage_logs（使用记录）
```sql
- id: UUID (主键)
- user_id: UUID (外键)
- action_type: TEXT (generate_guide/export_html/view_history)
- metadata: JSONB
- created_at: TIMESTAMP
```

### orders（订单）
```sql
- id: UUID (主键)
- user_id: UUID (外键)
- order_no: TEXT (唯一)
- plan_type: TEXT
- amount: DECIMAL
- status: TEXT (pending/paid/failed/refunded/cancelled)
- alipay_trade_no: TEXT
- paid_at: TIMESTAMP
```

### guide_history（历史记录）
```sql
- id: UUID (主键)
- user_id: UUID (外键)
- account_name: TEXT
- account_data: JSONB
- guide_content: JSONB
- created_at: TIMESTAMP
```

### plan_configs（套餐配置）
```sql
- plan_type: TEXT (主键)
- name: TEXT
- price: DECIMAL
- duration_days: INTEGER
- daily_generate_limit: INTEGER
- daily_export_limit: INTEGER
- history_limit: INTEGER
- priority: BOOLEAN
- features: JSONB
```

## 🔐 安全机制

### Row Level Security (RLS)
- 所有表都启用了 RLS
- 用户只能访问自己的数据
- 使用 Supabase 的 auth.uid() 进行权限控制

### API 密钥保护
- 前端使用 Anon Key（只读权限）
- 后端使用 Service Key（完全权限）
- 支付 API 使用内部密钥鉴权

### 支付安全
- 支付宝签名验证
- 订单状态防重复处理
- 回调日志记录

## 📊 套餐对比

| 功能 | 免费 | 基础 | 专业 | 终身 |
|------|------|------|------|------|
| 价格 | ¥0 | ¥29.9/月 | ¥99/月 | ¥299 |
| 每日生成 | 1次 | 10次 | 无限 | 无限 |
| 每日导出 | 1次 | 无限 | 无限 | 无限 |
| 历史记录 | 3条 | 50条 | 无限 | 无限 |
| 优先队列 | ❌ | ❌ | ✅ | ✅ |
| 自定义模板 | ❌ | ❌ | ✅ | ✅ |
| 新功能优先 | ❌ | ❌ | ❌ | ✅ |

## 🚀 部署清单

### Supabase 配置
- [ ] 创建项目
- [ ] 执行数据库脚本
- [ ] 配置 Email Auth
- [ ] 获取 API 密钥

### 环境变量
- [ ] 前端 .env
- [ ] 后端 .env
- [ ] 备案域名 .env

### 支付配置
- [ ] 备案域名添加内部 API
- [ ] 配置支付宝回调
- [ ] 测试支付流程

### 部署
- [ ] 前端部署到 Vercel
- [ ] 后端部署到 Railway
- [ ] 配置域名和 HTTPS
- [ ] 测试生产环境

## 🧪 测试清单

### 用户系统
- [ ] 注册新用户
- [ ] 登录已有用户
- [ ] 修改个人资料
- [ ] 退出登录

### 权限控制
- [ ] 免费用户生成限制
- [ ] 付费用户无限制
- [ ] 超限提示升级
- [ ] 使用记录正确

### 支付流程
- [ ] 创建订单
- [ ] 跳转支付宝
- [ ] 完成支付
- [ ] 回调处理
- [ ] 会员开通

### 用户中心
- [ ] 查看会员状态
- [ ] 查看使用记录
- [ ] 查看订单历史
- [ ] 修改个人设置

## 📞 技术支持

### 文档
- `PAYMENT_QUICKSTART.md` - 5分钟快速开始
- `PAYMENT_SETUP.md` - 详细配置指南
- `PAYMENT_SYSTEM.md` - 系统说明（本文件）

### 外部资源
- [Supabase 文档](https://supabase.com/docs)
- [支付宝开放平台](https://open.alipay.com/)
- [Element Plus 文档](https://element-plus.org/)

---

**付费系统已完整实现！** 🎉

按照 `PAYMENT_QUICKSTART.md` 快速开始使用。
