# 小红书知识平台 - 部署指南

## 📋 部署前准备清单

### 1. 环境配置

#### Supabase 配置
- [ ] 确认 Supabase 项目已创建
- [ ] 获取 Supabase URL 和 Anon Key
- [ ] 运行数据库迁移脚本
- [ ] 配置 RLS 策略
- [ ] 测试数据库连接

#### 环境变量配置
- [ ] 复制 `.env.production.example` 为 `.env.production`
- [ ] 填写所有必需的环境变量
- [ ] 配置 Google Analytics ID
- [ ] 配置后端 API 地址

### 2. SEO 配置

- [ ] 生成 `sitemap.xml`
- [ ] 创建 `robots.txt`
- [ ] 配置 `manifest.json`
- [ ] 准备 OG 图片
- [ ] 验证所有页面的 meta 标签

### 3. 性能优化

- [ ] 压缩所有图片资源
- [ ] 启用代码分割
- [ ] 配置 CDN（如果需要）
- [ ] 启用 PWA 功能
- [ ] 配置缓存策略

### 4. 安全配置

- [ ] 配置 CORS 策略
- [ ] 设置安全响应头
- [ ] 验证 API 密钥安全性
- [ ] 配置 CSP（内容安全策略）

## 🚀 部署步骤

### 方式一：通过 Vercel CLI 部署

1. **安装 Vercel CLI**
```bash
npm install -g vercel
```

2. **登录 Vercel**
```bash
vercel login
```

3. **运行部署前检查**
```bash
./pre-deploy-check.sh
```

4. **部署到生产环境**
```bash
vercel --prod
```

### 方式二：通过 Vercel Dashboard 部署

1. **连接 GitHub 仓库**
   - 访问 [Vercel Dashboard](https://vercel.com/dashboard)
   - 点击 "New Project"
   - 导入你的 GitHub 仓库

2. **配置项目**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **配置环境变量**
   在 Vercel Dashboard 中添加以下环境变量：
   ```
   VITE_SUPABASE_URL=你的Supabase URL
   VITE_SUPABASE_ANON_KEY=你的Supabase Anon Key
   VITE_GA_MEASUREMENT_ID=你的Google Analytics ID
   VITE_BACKEND_URL=/api
   VITE_USE_PROXY=true
   VITE_PROXY_URL=/api/ai
   ```

4. **部署**
   - 点击 "Deploy"
   - 等待构建完成

### 方式三：通过 Git Push 自动部署

1. **配置自动部署**
   - 在 Vercel 中连接 GitHub 仓库
   - 启用自动部署

2. **推送代码**
```bash
git add .
git commit -m "Ready for production deployment"
git push origin main
```

3. **Vercel 会自动触发部署**

## 🔍 部署后验证

### 1. 功能测试

- [ ] 访问首页，检查加载速度
- [ ] 测试所有导航链接
- [ ] 测试知识库页面
- [ ] 测试案例库页面
- [ ] 测试情报局页面
- [ ] 测试工具箱功能
- [ ] 测试社区功能
- [ ] 测试用户登录/注册
- [ ] 测试移动端响应式

### 2. SEO 验证

- [ ] 验证 sitemap.xml 可访问
- [ ] 验证 robots.txt 可访问
- [ ] 检查所有页面的 meta 标签
- [ ] 验证结构化数据
- [ ] 使用 Google Search Console 提交 sitemap

### 3. 性能测试

- [ ] 运行 Lighthouse 测试
- [ ] 检查首屏加载时间（目标 < 3s）
- [ ] 检查 Core Web Vitals
  - LCP < 2.5s
  - FID < 100ms
  - CLS < 0.1

### 4. 分析配置

- [ ] 验证 Google Analytics 正常工作
- [ ] 测试事件追踪
- [ ] 配置转化目标
- [ ] 设置自定义报告

## 📊 监控和维护

### 1. 设置监控

```bash
# 使用 Vercel Analytics
# 在 Vercel Dashboard 中启用 Analytics
```

### 2. 错误追踪

- 配置 Sentry 或其他错误追踪服务
- 设置错误通知

### 3. 性能监控

- 定期运行 Lighthouse 测试
- 监控 Core Web Vitals
- 检查服务器响应时间

### 4. 定期更新

- 每周检查依赖更新
- 每月审查性能指标
- 定期备份数据库

## 🔧 常见问题

### 构建失败

**问题**: 构建时出现 TypeScript 错误
**解决**: 
```bash
npm run build:check
# 修复所有 TypeScript 错误后再部署
```

### 环境变量未生效

**问题**: 部署后环境变量不正确
**解决**: 
1. 检查 Vercel Dashboard 中的环境变量配置
2. 确保变量名以 `VITE_` 开头
3. 重新部署项目

### API 请求失败

**问题**: 前端无法连接后端 API
**解决**:
1. 检查 `VITE_BACKEND_URL` 配置
2. 验证 Vercel Serverless Functions 是否正常
3. 检查 CORS 配置

### 图片加载慢

**问题**: 图片加载速度慢
**解决**:
1. 使用图片压缩工具
2. 启用 WebP 格式
3. 配置 CDN
4. 使用懒加载

## 📝 部署检查清单

使用以下命令运行完整的部署前检查：

```bash
./pre-deploy-check.sh
```

## 🎯 性能目标

- **首屏加载时间**: < 3 秒
- **Lighthouse 性能分数**: > 90
- **SEO 分数**: > 95
- **可访问性分数**: > 90
- **最佳实践分数**: > 90

## 📞 支持

如果遇到部署问题，请：
1. 查看 Vercel 部署日志
2. 检查浏览器控制台错误
3. 参考 Vercel 官方文档
4. 联系技术支持

## 🔄 回滚策略

如果部署出现问题：

1. **通过 Vercel Dashboard 回滚**
   - 访问 Deployments 页面
   - 找到上一个稳定版本
   - 点击 "Promote to Production"

2. **通过 Git 回滚**
```bash
git revert HEAD
git push origin main
```

## 📈 部署后优化

1. **监控用户行为**
   - 使用 Google Analytics 分析用户路径
   - 识别高跳出率页面
   - 优化转化漏斗

2. **A/B 测试**
   - 测试不同的 CTA 文案
   - 测试不同的页面布局
   - 优化用户体验

3. **持续优化**
   - 定期审查性能指标
   - 收集用户反馈
   - 迭代改进功能

---

**最后更新**: 2024年1月
**维护者**: 开发团队
