# 小红书涨粉实操指南生成器

> 🚀 基于 AI 的智能涨粉指南生成工具，上传截图即可获得专属的12章节实操指南

一个基于 AI 的 Web 应用，帮助小红书运营者快速生成专业的涨粉实操指南。

## ✨ 功能特性

- 📸 **智能识别** - 上传小红书主页截图，AI 自动提取账号数据
- 🤖 **AI 生成** - 基于账号现状生成12个章节的专业指南
- 📝 **完整内容** - 包含账号诊断、起号计划、对标分析、内容规划等
- 💾 **一键导出** - 支持导出为 HTML 格式，可打印为 PDF
- 📱 **响应式设计** - 完美支持桌面和移动设备
- 🔒 **安全可靠** - 前后端分离架构，API Key 不会暴露
- 👤 **用户系统** - 支持注册登录，数据云端保存
- 💎 **VIP 会员** - 多种套餐选择，解锁更多功能
- 💰 **支付集成** - 支持支付宝支付，自动开通会员

## 🏗️ 项目架构

```
xiaohongshu-guide-generator/
├── src/                    # 前端源码（Vue 3 + TypeScript）
│   ├── views/             # 页面组件
│   ├── services/          # API 服务
│   ├── stores/            # 状态管理
│   └── utils/             # 工具函数
├── backend/               # 后端服务（Node.js + Express）
│   ├── src/
│   │   ├── routes/       # API 路由
│   │   ├── services/     # AI 服务
│   │   └── middleware/   # 中间件
│   └── package.json
└── api/                   # Vercel Serverless Functions（可选）
```

## 🚀 快速开始

### 方式 1：完整部署（推荐）

**步骤 1：启动后端**

```bash
cd backend
npm install
cp .env.example .env
# 编辑 .env 文件，填入你的 DeepSeek API Key
npm run dev
```

**步骤 2：启动前端**

```bash
# 新终端窗口
npm install
npm run dev
```

访问 `http://localhost:5173` 即可使用。

详细说明请查看 [快速开始指南](./QUICKSTART.md)。

### 方式 2：仅前端演示

如果只想体验前端界面（使用模拟数据）：

```bash
npm install
npm run dev
```

## 📖 文档

- 📘 [快速开始指南](./QUICKSTART.md) - 5分钟快速启动
- 🚀 [部署指南](./DEPLOYMENT.md) - 生产环境部署方案
- 🔧 [后端文档](./backend/README.md) - 后端 API 详细说明
- 💰 [付费系统快速开始](./PAYMENT_QUICKSTART.md) - 5分钟配置付费功能
- 💎 [付费系统详细配置](./PAYMENT_SETUP.md) - 完整的付费系统配置指南
- 📊 [付费系统说明](./PAYMENT_SYSTEM.md) - 付费系统功能说明

## 🔐 安全说明

本项目采用**前后端分离 + API 代理**的架构，确保 API Key 安全：

- ✅ API Key 存储在后端环境变量中
- ✅ 前端通过后端代理调用 AI API
- ✅ 用户无法直接访问 API Key
- ✅ 支持 CORS 白名单控制

**架构图**：

```
用户浏览器 → 前端(Vue) → 后端(Express) → DeepSeek API
     ↑                                            ↓
     └──────────────── 返回结果 ──────────────────┘
```

## 🛠️ 技术栈

### 前端

- **框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **UI 组件**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router

### 后端

- **运行时**: Node.js 20+
- **框架**: Express
- **语言**: TypeScript
- **AI API**: DeepSeek

## 📦 项目结构

```
xiaohongshu-guide-generator/
├── src/                          # 前端源码
│   ├── views/                   # 页面组件
│   │   ├── HomeView.vue        # 首页
│   │   ├── UploadView.vue      # 上传页面
│   │   ├── AnalysisView.vue    # 分析页面
│   │   └── GuideView.vue       # 指南页面
│   ├── services/                # 服务层
│   │   ├── aiService.ts        # AI 服务
│   │   ├── promptTemplates.ts  # 提示词模板
│   │   └── guideGenerator.ts   # 指南生成器
│   ├── stores/                  # 状态管理
│   │   └── appStore.ts         # 应用状态
│   ├── types/                   # 类型定义
│   └── utils/                   # 工具函数
├── backend/                      # 后端服务
│   ├── src/
│   │   ├── index.ts            # 入口文件
│   │   ├── routes/             # API 路由
│   │   ├── services/           # 服务层
│   │   └── middleware/         # 中间件
│   ├── package.json
│   └── tsconfig.json
├── public/                       # 静态资源
├── .env.example                 # 环境变量示例
├── package.json
├── vite.config.ts
└── README.md
```

## 🎯 核心功能

### 1. 图片上传与验证

- 支持拖拽上传
- 文件类型验证（PNG/JPG/JPEG）
- 文件大小限制（< 10MB）
- 图片压缩和预处理

### 2. AI 智能分析

- 自动识别账号名称
- 提取粉丝数和笔记数
- 判断内容类别
- 支持手动修正

### 3. 指南生成

生成包含12个章节的完整指南：

1. 📊 账号诊断
2. 📅 起号三天计划
3. 🎯 对标账号拆解
4. 📝 内容规划
5. 💡 爆款笔记公式
6. 🚀 冷启动技巧
7. ✅ 每日固定动作
8. 📈 数据复盘模板
9. ⚠️ 避坑指南
10. 💰 变现路径规划
11. 🏃 冲刺计划总结表
12. 🎬 立刻行动清单

### 4. 导出功能

- 导出为 HTML 格式
- 保留完整格式和样式
- 支持浏览器打印为 PDF

## 🔑 获取 API Key

### DeepSeek（推荐）

1. 访问 [DeepSeek 官网](https://platform.deepseek.com/)
2. 注册/登录账号
3. 进入 API Keys 页面
4. 创建新的 API Key
5. 复制到 `backend/.env` 文件

**优势**：
- 价格便宜（约 $0.001/次）
- 国内访问速度快
- 支持图像识别

## 🚀 部署

### 推荐方案：Vercel + Railway

- **前端**: 部署到 Vercel（免费）
- **后端**: 部署到 Railway（免费 $5/月额度）

详细步骤请查看 [部署指南](./DEPLOYMENT.md)。

### 其他方案

- Netlify + Render
- 自建服务器 + Nginx
- Docker 容器化部署

## 💰 成本估算

- **前端托管**: $0（Vercel/Netlify 免费套餐）
- **后端托管**: $0-5/月（Railway/Render 免费套餐）
- **AI API**: 约 $0.001/次请求（DeepSeek）

**总计**: 每月 $5-10 可支持中等流量

## 🐛 故障排查

### CORS 错误

确保后端 `.env` 中的 `ALLOWED_ORIGINS` 包含前端域名。

### API Key 无效

检查 `backend/.env` 中的 `DEEPSEEK_API_KEY` 是否正确。

### 连接被拒绝

1. 确认后端服务是否启动
2. 检查前端 `.env` 中的 `VITE_PROXY_URL` 是否正确

更多问题请查看 [快速开始指南](./QUICKSTART.md#常见问题)。

## 📝 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 类型检查
npm run type-check

# 代码格式化
npm run format
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 License

MIT License

## 🙏 致谢

- [Vue.js](https://vuejs.org/)
- [Element Plus](https://element-plus.org/)
- [DeepSeek](https://www.deepseek.com/)
- [Vite](https://vitejs.dev/)

---

**Made with ❤️ for 小红书运营者**
