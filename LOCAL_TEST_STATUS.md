# 本地测试状态

## ✅ 前端服务器状态

**状态**: 正常运行  
**地址**: http://localhost:5174/  
**Vite 版本**: 5.4.21

## ⚠️ 后端 API 服务状态

**状态**: 未启动  
**错误**: `connect ECONNREFUSED ::1:3001`

这意味着后端 Node.js 服务器没有运行。

### 🔧 如何启动后端服务

如果需要完整测试（包括 AI 生成功能），需要启动后端：

```bash
cd xiaohongshu-guide-generator/backend
npm run dev
```

### 📝 不启动后端也能测试的功能

即使后端没启动，你仍然可以测试：

1. **格式选择器** - 前端组件，不需要后端
2. **格式切换** - 纯前端功能
3. **专业文档样式** - CSS 样式，不需要后端
4. **历史记录查看** - 使用 localStorage，不需要后端

### ❌ 需要后端才能测试的功能

- AI 生成指南
- 保存和分享功能
- 用户登录/注册

## 🎯 推荐的测试方案

### 方案 1：使用历史记录测试（推荐）

如果你之前生成过指南，可以：

1. 访问 http://localhost:5174/
2. 点击"历史记录"
3. 选择一个之前的指南
4. 测试格式切换功能

### 方案 2：使用线上数据测试

1. 访问线上版本生成一个指南
2. 在本地访问历史记录
3. 测试格式切换功能

### 方案 3：启动完整环境

```bash
# 终端 1 - 启动后端
cd xiaohongshu-guide-generator/backend
npm run dev

# 终端 2 - 前端已经在运行
# 访问 http://localhost:5174/
```

## 🐛 本地和线上的差异

### 可能的原因

1. **环境变量不同**
   - 本地 `.env` 文件可能缺少配置
   - 线上使用 Vercel 环境变量

2. **后端服务状态**
   - 线上后端自动运行
   - 本地需要手动启动

3. **数据库连接**
   - 线上连接到 Supabase
   - 本地可能没有配置数据库连接

### 🔍 检查本地配置

检查这些文件是否存在且配置正确：

```bash
# 前端环境变量
xiaohongshu-guide-generator/.env

# 后端环境变量
xiaohongshu-guide-generator/backend/.env
```

应该包含：
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_BASE_URL`
- `DEEPSEEK_API_KEY`（后端）

## 💡 快速测试建议

**最简单的方法**：

1. 打开浏览器访问 http://localhost:5174/
2. 打开浏览器开发者工具（F12）
3. 在 Console 中运行：

```javascript
// 创建测试数据
const testGuide = {
  metadata: {
    accountName: '测试账号',
    generatedAt: new Date().toISOString(),
    targetFollowers: 50000
  },
  sections: [
    {
      id: 1,
      title: '账号诊断',
      content: '这是测试内容。\n\n**重点**：测试粗体文本。\n\n- 列表项 1\n- 列表项 2'
    },
    {
      id: 2,
      title: '内容策略',
      content: '第二章节的内容...'
    }
  ]
}

const testAccount = {
  username: '测试账号',
  followers: 10000,
  notes: 150,
  category: '美妆'
}

// 保存到 localStorage
localStorage.setItem('test-guide', JSON.stringify(testGuide))
localStorage.setItem('test-account', JSON.stringify(testAccount))

console.log('测试数据已创建！刷新页面后可以使用。')
```

4. 刷新页面
5. 测试格式切换功能

## 📊 当前状态总结

| 组件 | 状态 | 说明 |
|------|------|------|
| 前端服务器 | ✅ 运行中 | http://localhost:5174/ |
| 后端 API | ❌ 未启动 | 需要手动启动 |
| 格式选择器 | ✅ 已实现 | 可以测试 |
| 专业文档格式 | ✅ 已实现 | 可以测试 |
| AI 生成功能 | ❌ 不可用 | 需要后端 |

---

**建议**: 先测试格式切换功能（不需要后端），确认功能正常后再考虑是否需要启动后端进行完整测试。
