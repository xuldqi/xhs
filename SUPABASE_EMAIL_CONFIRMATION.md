# Supabase 邮箱确认配置指南

## 问题描述

用户注册后登录时出现 "Email not confirmed" 错误，这是因为 Supabase 默认要求用户确认邮箱后才能登录。

## 解决方案

### 方案1：关闭邮箱确认要求（推荐用于开发/测试环境）

1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 选择你的项目
3. 进入 **Authentication** → **Settings**
4. 找到 **Email Auth** 部分
5. 关闭 **Enable email confirmations** 选项
6. 点击 **Save** 保存

这样用户注册后可以直接登录，无需确认邮箱。

### 方案2：配置邮件服务（推荐用于生产环境）

如果你想保留邮箱确认功能（更安全），需要配置邮件服务：

#### 2.1 使用 Supabase 默认邮件服务（有限制）

Supabase 提供默认的邮件服务，但有发送限制：
- 免费版：每小时 3 封邮件
- Pro 版：每小时 30 封邮件

#### 2.2 配置自定义 SMTP（推荐）

1. 进入 **Project Settings** → **Auth**
2. 找到 **SMTP Settings**
3. 启用 **Enable Custom SMTP**
4. 填写你的 SMTP 配置：
   - **Host**: smtp.gmail.com (Gmail) 或其他邮件服务商
   - **Port**: 587 (TLS) 或 465 (SSL)
   - **Username**: 你的邮箱地址
   - **Password**: 邮箱密码或应用专用密码
   - **Sender email**: 发件人邮箱
   - **Sender name**: 发件人名称

#### 2.3 推荐的邮件服务商

- **SendGrid**: 免费额度 100 封/天
- **Mailgun**: 免费额度 5000 封/月
- **Amazon SES**: 按量付费，价格低
- **Resend**: 免费额度 3000 封/月

### 方案3：手动确认用户（临时方案）

如果需要手动确认某个用户：

1. 进入 **Authentication** → **Users**
2. 找到需要确认的用户
3. 点击用户进入详情页
4. 找到 **Email Confirmed** 字段
5. 手动设置为 `true`

或者使用 SQL：

```sql
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'user@example.com';
```

## 当前代码改进

代码已经做了以下改进：

1. **更友好的错误提示**：当邮箱未确认时，显示清晰的中文提示
2. **背景颜色修复**：登录页面背景改为白色
3. **重新发送确认邮件功能**：添加了 `resendConfirmationEmail` 方法

## 测试步骤

1. 确保 Supabase 配置正确
2. 注册新用户
3. 如果开启了邮箱确认：
   - 检查邮箱收到确认邮件
   - 点击确认链接
   - 返回登录
4. 如果关闭了邮箱确认：
   - 注册后直接登录

## 生产环境建议

- ✅ 保持邮箱确认功能开启（安全性）
- ✅ 配置可靠的 SMTP 服务
- ✅ 设置合适的邮件模板
- ✅ 添加重新发送确认邮件功能
- ✅ 监控邮件发送状态

## 相关文件

- `src/services/authService.ts` - 认证服务
- `src/views/LoginView.vue` - 登录页面
- `src/stores/userStore.ts` - 用户状态管理
