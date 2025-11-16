# 快速开始指南

## 1. 安装依赖

```bash
cd xiaohongshu-guide-generator
npm install
```

## 2. 配置环境变量

复制环境变量模板：
```bash
cp .env.example .env
```

编辑 `.env` 文件，填入你的 OpenAI API 密钥：
```
VITE_OPENAI_API_KEY=sk-your-actual-api-key-here
```

**获取 API 密钥：**

**选项 1：Google Gemini（推荐 - 免费额度大）**
1. 访问 https://makersuite.google.com/app/apikey
2. 登录 Google 账号
3. 创建 API 密钥
4. 在 `.env` 文件中配置：
   ```
   VITE_OPENAI_API_KEY=your-gemini-api-key
   VITE_API_BASE_URL=https://generativelanguage.googleapis.com
   ```

**选项 2：DeepSeek（推荐国内用户 - 便宜）**
1. 访问 https://platform.deepseek.com
2. 注册账号并获取 API 密钥
3. 在 `.env` 文件中配置：
   ```
   VITE_OPENAI_API_KEY=your-deepseek-api-key
   VITE_API_BASE_URL=https://api.deepseek.com
   ```

**选项 3：OpenAI（质量最好但贵）**
1. 访问 https://platform.openai.com/api-keys
2. 登录或注册账号
3. 创建新的 API 密钥
4. 复制密钥到 `.env` 文件

**价格对比：**
- Google Gemini: 免费（每分钟60次请求）
- DeepSeek: ~$0.001/1K tokens
- OpenAI GPT-4: ~$0.03/1K tokens

## 3. 启动开发服务器

```bash
npm run dev
```

浏览器访问：http://localhost:5173

## 4. 使用说明

1. **上传截图**：点击"开始生成"，上传小红书主页截图
2. **确认信息**：AI 会自动识别账号信息，你可以修改
3. **生成指南**：确认后系统会生成完整的12部分涨粉指南
4. **导出 PDF**：点击"导出 PDF"保存指南

## 5. 注意事项

- 如果没有配置 OpenAI API 密钥，系统会使用演示数据
- 图片大小限制：10MB
- 支持格式：PNG、JPG、JPEG
- 生成时间：约 30 秒

## 6. 构建生产版本

```bash
npm run build
```

构建产物在 `dist/` 目录。

## 7. 部署

推荐部署平台：
- Vercel：https://vercel.com
- Netlify：https://netlify.com
- GitHub Pages

## 常见问题

**Q: API 调用失败怎么办？**
A: 检查 API 密钥是否正确，账户是否有余额。

**Q: 可以不用 OpenAI 吗？**
A: 可以！支持以下选项：
   1. 使用 DeepSeek（更便宜，质量相近）
   2. 不配置 API（使用演示数据）

**Q: 支持哪些 AI 模型？**
A: 目前支持三种：
   1. **Google Gemini** - 免费额度大，推荐新手
   2. **DeepSeek** - 便宜，中文好，推荐国内用户
   3. **OpenAI GPT-4** - 质量最好但最贵

**Q: 推荐使用哪个？**
A: 
   - 新手/测试：Gemini（免费）
   - 国内用户：DeepSeek（便宜+中文好）
   - 追求质量：OpenAI（贵但好）

**Q: 如何切换 AI 模型？**
A: 只需修改 `.env` 文件中的 `VITE_API_BASE_URL`：
   - Gemini: `https://generativelanguage.googleapis.com`
   - DeepSeek: `https://api.deepseek.com`
   - OpenAI: `https://api.openai.com`
