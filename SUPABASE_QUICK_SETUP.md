# Supabase 快速配置指南（5分钟）

## 🚀 步骤 1: 创建 Supabase 项目

1. 访问 https://supabase.com/
2. 点击 "Start your project" 或 "Sign in"
3. 使用 GitHub 账号登录（推荐）或邮箱注册
4. 点击 "New Project"
5. 填写项目信息：
   - Name: `xiaohongshu-guide-generator`（或任意名称）
   - Database Password: 设置一个强密码（记住它！）
   - Region: 选择 `Northeast Asia (Tokyo)` 或最近的区域
6. 点击 "Create new project"
7. 等待 1-2 分钟，项目创建完成

## 🔑 步骤 2: 获取 API 密钥

1. 在项目页面，点击左侧菜单的 **Settings** (齿轮图标)
2. 点击 **API**
3. 你会看到：
   - **Project URL**: 类似 `https://xxxxx.supabase.co`
   - **anon public**: 公开密钥（不需要）
   - **service_role**: 服务端密钥（需要这个！）

4. 复制这两个值：
   ```
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...（很长的字符串）
   ```

## 📝 步骤 3: 更新环境变量

打开 `backend/.env` 文件，更新以下内容：

```env
# Supabase 配置
SUPABASE_URL=你的项目URL
SUPABASE_SERVICE_KEY=你的service_role密钥
```

## 🗄️ 步骤 4: 创建数据库表

1. 在 Supabase 项目页面，点击左侧的 **SQL Editor**
2. 点击 **New query**
3. 复制 `supabase-schema.sql` 文件的全部内容
4. 粘贴到 SQL 编辑器
5. 点击 **Run** 按钮执行

或者直接在终端执行：

```bash
# 复制 SQL 内容
cat xiaohongshu-guide-generator/supabase-schema.sql
# 然后粘贴到 Supabase SQL Editor 执行
```

## ✅ 步骤 5: 验证配置

重启后端服务，然后访问：

```bash
curl http://localhost:3001/api/payment/check-config
```

应该看到：
```json
{
  "supabase": {
    "connected": true,
    "error": null
  },
  "alipay": {
    "initialized": true,
    "error": null
  },
  "allReady": true
}
```

## 🎉 完成！

现在可以测试完整的支付流程了：

1. 打开 http://localhost:5174
2. 注册账号
3. 购买会员
4. 完成支付
5. 验证会员权益

---

## 💡 快速命令

```bash
# 1. 重启后端（配置更新后）
cd xiaohongshu-guide-generator/backend
npm run dev

# 2. 检查配置
curl http://localhost:3001/api/payment/check-config | python3 -m json.tool

# 3. 查看后端日志
# 在运行后端的终端查看
```

## 🆘 遇到问题？

### 问题 1: "Project URL not found"
- 确保复制的是完整的 URL，包括 `https://`
- 检查是否有多余的空格

### 问题 2: "Invalid API key"
- 确保复制的是 `service_role` 密钥，不是 `anon` 密钥
- 密钥应该很长（几百个字符）

### 问题 3: "Table does not exist"
- 确保在 SQL Editor 中执行了 `supabase-schema.sql`
- 检查是否有执行错误

### 问题 4: 连接超时
- 检查网络连接
- 尝试切换到其他区域的项目
