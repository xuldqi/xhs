# 🔧 修复登录状态持久化问题

## 问题描述
页面刷新后登录状态丢失

## 已修复的问题

### 1. ✅ 修复了 main.ts 中的异步初始化
**问题**: `userStore.init()` 是异步函数，但被同步调用
**修复**: 改为异步调用并添加错误处理

```typescript
// 修复前
userStore.init()

// 修复后
userStore.init().then(() => {
  console.log('✅ 用户状态初始化完成')
}).catch((error) => {
  console.error('❌ 用户状态初始化失败:', error)
})
```

## 需要检查的配置

### 2. Supabase 邮箱确认设置

**选项 A: 禁用邮箱确认（推荐用于开发）**

1. 登录 Supabase Dashboard
2. 进入项目设置: `Authentication` → `Providers` → `Email`
3. 找到 `Confirm email` 选项
4. **取消勾选** `Enable email confirmations`
5. 点击 `Save`

**选项 B: 手动确认用户邮箱**

在 Supabase SQL Editor 中运行：

```sql
-- 确认所有用户的邮箱
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;

-- 查看所有用户
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
ORDER BY created_at DESC;
```

### 3. 检查 Supabase 配置

确保 `.env` 文件中有正确的配置：

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. 检查浏览器 LocalStorage

打开浏览器开发者工具:
1. 按 F12 打开开发者工具
2. 切换到 `Application` 或 `存储` 标签
3. 查看 `Local Storage` → 你的域名
4. 查找 `xiaohongshu-auth` 相关的键

## 测试步骤

### 方法 1: 使用测试页面

1. 打开 `test-auth-persistence.html`
2. 替换 Supabase URL 和 Key
3. 测试注册/登录
4. 点击"刷新页面"按钮
5. 检查登录状态是否保持

### 方法 2: 使用浏览器控制台

```javascript
// 1. 检查 localStorage
console.log('LocalStorage keys:', Object.keys(localStorage))

// 2. 查看 Supabase session
const { data } = await supabase.auth.getSession()
console.log('Current session:', data)

// 3. 监听状态变化
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth event:', event, session)
})
```

## 常见问题

### Q1: 登录成功但刷新后丢失
**原因**: 
- Session 没有正确保存到 localStorage
- 初始化时机不对

**解决**: 
- 已修复 main.ts 的初始化逻辑
- 确保 Supabase 配置正确

### Q2: 提示"邮箱尚未确认"
**原因**: Supabase 默认要求邮箱确认

**解决**: 
- 禁用邮箱确认（见上面选项 A）
- 或手动确认邮箱（见上面选项 B）

### Q3: 后台没有用户数据
**原因**: 
- 注册失败
- 邮箱确认被阻止

**解决**: 
1. 先禁用邮箱确认
2. 重新注册
3. 检查 Supabase Dashboard 的 `Authentication` → `Users` 表

## 验证修复

运行以下命令启动开发服务器：

```bash
cd xiaohongshu-guide-generator
npm run dev
```

然后:
1. 打开应用
2. 注册/登录
3. 打开浏览器控制台，应该看到: `✅ 用户状态初始化完成`
4. 刷新页面
5. 检查是否仍然登录

## 调试日志

在浏览器控制台中，你应该看到：

```
✅ 用户状态初始化完成
🔔 Auth State Changed: SIGNED_IN
```

如果看到错误，请检查：
- Supabase URL 和 Key 是否正确
- 网络连接是否正常
- 浏览器是否阻止了 localStorage
