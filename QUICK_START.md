# 快速启动指南

## 🚀 5分钟快速上手

### 1. 环境准备

确保已安装：
- Node.js 16+
- npm 或 yarn

### 2. 安装依赖

```bash
cd xiaohongshu-guide-generator
npm install
```

### 3. 配置环境变量

复制环境变量模板：
```bash
cp .env.example .env
```

编辑 `.env` 文件，填入必要的配置：

```env
# OpenAI API（用于AI生成）
VITE_OPENAI_API_KEY=sk-your-openai-api-key

# Supabase（用于数据库和认证）
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# 其他配置
VITE_API_BASE_URL=https://api.openai.com
VITE_MAX_FILE_SIZE=10485760
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问: http://localhost:5174

## 📝 功能测试

### 测试1: 查看示例（无需登录）
1. 打开首页
2. 点击"查看示例"按钮
3. 查看演示指南

### 测试2: 注册登录
1. 点击右上角"登录"
2. 切换到"注册"标签
3. 输入邮箱和密码
4. 注册成功后自动登录

### 测试3: 生成指南（需要登录）
1. 登录后点击"开始生成"
2. 上传小红书主页截图
3. 等待AI分析账号信息
4. 确认信息后生成指南
5. 查看生成的12部分指南

### 测试4: 查看历史
1. 点击右上角"历史记录"图标
2. 查看本地历史（最近5条）
3. 登录后可查看云端历史

### 测试5: 分享指南
1. 在指南页面点击"分享"
2. 复制分享链接
3. 在新窗口打开链接测试

## 🔑 会员功能测试

### 免费用户限制
- 每天1次生成
- 每天1次导出
- 最多3条云端历史

### 升级会员
1. 点击"升级会员"
2. 选择套餐
3. 使用支付宝支付
4. 支付成功后自动开通

## 🗄️ 数据库设置（Supabase）

### 1. 创建 Supabase 项目
1. 访问 https://supabase.com
2. 创建新项目
3. 获取 URL 和 anon key

### 2. 执行数据库脚本
1. 打开 Supabase SQL Editor
2. 复制 `supabase-schema.sql` 内容
3. 执行脚本创建表和策略

### 3. 配置认证
1. 在 Supabase Dashboard 启用 Email 认证
2. 配置邮件模板（可选）

## 🎨 自定义配置

### 修改套餐价格
编辑 `supabase-schema.sql` 中的 `plan_configs` 表：

```sql
INSERT INTO public.plan_configs (...) VALUES
  ('free', '免费体验', 0, ...),
  ('basic', '基础会员', 29.9, ...),  -- 修改这里
  ('pro', '专业会员', 99, ...),      -- 修改这里
  ('lifetime', '终身会员', 299, ...); -- 修改这里
```

### 修改使用限制
编辑 `supabase-schema.sql` 中的限制参数：
- `daily_generate_limit`: 每日生成次数
- `daily_export_limit`: 每日导出次数
- `history_limit`: 历史记录数量

### 修改AI提示词
编辑 `src/services/promptTemplates.ts`

## 🐛 常见问题

### Q1: 无法连接数据库
**A**: 检查 `.env` 中的 Supabase 配置是否正确

### Q2: AI生成失败
**A**: 检查 OpenAI API Key 是否有效，是否有余额

### Q3: 支付功能无法使用
**A**: 需要配置支付宝商户信息，参考 `PAYMENT_SETUP.md`

### Q4: 图片上传失败
**A**: 检查图片大小是否超过10MB，格式是否为 PNG/JPG/JPEG

### Q5: 历史记录不显示
**A**: 
- 本地历史：检查浏览器 localStorage
- 云端历史：确保已登录，检查数据库连接

## 📚 更多文档

- [完整功能说明](./FEATURES_STATUS.md)
- [支付系统配置](./PAYMENT_SETUP.md)
- [部署指南](./DEPLOYMENT.md)
- [项目状态](./PROJECT_STATUS.md)

## 🎯 开发模式 vs 生产模式

### 开发模式（当前）
- 使用模拟数据演示
- 本地开发服务器
- 热更新

### 生产模式
```bash
# 构建
npm run build

# 预览
npm run preview

# 部署到 Vercel
vercel deploy
```

## 💡 提示

1. **首次使用**: 建议先注册账号，体验完整功能
2. **测试支付**: 使用支付宝沙箱环境测试
3. **AI配置**: 如果没有 OpenAI API，可以使用演示模式
4. **数据备份**: 定期备份 Supabase 数据库

## 🆘 获取帮助

遇到问题？
1. 查看 [常见问题](#常见问题)
2. 检查浏览器控制台错误
3. 查看 Supabase 日志
4. 提交 Issue

---

**祝你使用愉快！** 🎉
