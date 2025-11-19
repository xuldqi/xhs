# ✅ 生产环境检查清单

## 📊 当前配置状态

### ✅ 已配置（开发/测试环境）
- Supabase 数据库: `dwgrurfoxqfoeiwjytbb.supabase.co`
- 支付宝: 沙箱环境
- AI 服务: DeepSeek + Gemini
- 前端: 准备部署到 Vercel
- 后端: 准备部署到 Railway

### ⚠️ 需要升级到正式环境

---

## 🔧 正式环境配置

### 1. 数据库（Supabase）✅

**当前状态**: 已配置，可以直接用于生产

**检查项**:
- [x] 数据库已初始化
- [x] 表结构已创建
- [x] RLS 策略已配置
- [x] 套餐配置已添加
- [ ] 数据库备份策略已设置

**建议**:
```bash
# 1. 在 Supabase 控制台设置自动备份
# 2. 定期导出数据
# 3. 监控数据库性能
```

---

### 2. 支付宝配置 ⚠️

**当前状态**: 沙箱环境（仅供测试）

**升级到正式环境**:

#### 步骤 1: 申请正式商户账号
1. 访问 https://open.alipay.com
2. 注册企业账号
3. 创建应用
4. 提交审核（需要营业执照）

#### 步骤 2: 配置应用
1. 上传应用图标和截图
2. 配置应用信息
3. 申请支付功能权限
4. 等待审核通过

#### 步骤 3: 获取正式密钥
```bash
# 1. 生成密钥对
# 2. 上传公钥到支付宝
# 3. 下载支付宝公钥
# 4. 更新环境变量
```

#### 步骤 4: 更新配置
```env
# 正式环境配置
ALIPAY_APP_ID=你的正式应用ID
ALIPAY_PRIVATE_KEY=你的正式私钥
ALIPAY_PUBLIC_KEY=支付宝正式公钥
ALIPAY_GATEWAY=https://openapi.alipay.com/gateway.do  # 注意：不是沙箱网关
```

**时间估计**: 3-7 个工作日

---

### 3. AI 服务配置 ✅

**当前状态**: 已配置，可以直接用于生产

**API 密钥**:
- DeepSeek: `sk-783505fb70064a26a2338e04f46b7df3`
- Gemini: `AIzaSyDR3EfRD5bEgpH2X6wOQydUZFmxSz4bPJY`

**检查项**:
- [x] API 密钥有效
- [ ] 监控使用量
- [ ] 设置使用限额告警
- [ ] 准备备用 API 密钥

**建议**:
```bash
# 1. 在 DeepSeek 控制台设置使用限额
# 2. 监控 API 调用次数
# 3. 准备备用方案（如果超额）
```

---

### 4. 域名和 SSL ⚠️

**当前状态**: 使用 Vercel 提供的域名

**升级到自定义域名**:

#### 步骤 1: 购买域名
推荐域名注册商：
- 阿里云（万网）
- 腾讯云
- GoDaddy
- Namecheap

#### 步骤 2: 配置 DNS
```bash
# 在域名注册商添加 DNS 记录
A 记录: @ -> Vercel IP
CNAME 记录: www -> cname.vercel-dns.com
```

#### 步骤 3: 在 Vercel 添加域名
1. 进入 Vercel 项目设置
2. Domains > Add Domain
3. 输入你的域名
4. 按照提示配置 DNS
5. 等待 SSL 证书自动配置

**时间估计**: 1-24 小时（DNS 生效时间）

---

## 📋 部署前检查清单

### 代码质量
- [ ] 所有功能已测试
- [ ] 没有 console.log 调试代码
- [ ] 没有 TODO 注释
- [ ] 代码已通过 ESLint 检查

### 安全性
- [ ] API 密钥已保护
- [ ] 环境变量已正确配置
- [ ] CORS 已正确设置
- [ ] XSS 防护已实现
- [ ] SQL 注入防护已实现

### 性能
- [ ] 图片已压缩
- [ ] 代码已打包优化
- [ ] CDN 已配置（Vercel 自动）
- [ ] 缓存策略已设置

### 监控
- [ ] 错误监控已设置（推荐 Sentry）
- [ ] 性能监控已设置
- [ ] 日志系统已配置
- [ ] 告警机制已设置

---

## 🚀 部署步骤

### 1. 上传到 GitHub
```bash
cd xiaohongshu-guide-generator
./upload-to-github.sh
```

### 2. 部署前端到 Vercel
1. 访问 https://vercel.com
2. Import Git Repository
3. 选择你的仓库
4. 配置环境变量
5. 部署

### 3. 部署后端到 Railway
1. 访问 https://railway.app
2. New Project > Deploy from GitHub
3. 选择你的仓库
4. 选择 `backend` 目录
5. 配置环境变量
6. 部署

### 4. 配置环境变量

#### Vercel（前端）
```env
VITE_SUPABASE_URL=https://dwgrurfoxqfoeiwjytbb.supabase.co
VITE_SUPABASE_ANON_KEY=你的匿名密钥
VITE_BACKEND_URL=https://你的railway域名.railway.app
VITE_USE_PROXY=false
VITE_MAX_FILE_SIZE=10485760
```

#### Railway（后端）
```env
# 复制 backend/.env 中的所有配置
# 注意更新以下项：
NODE_ENV=production
FRONTEND_URL=https://你的vercel域名.vercel.app
BACKEND_URL=https://你的railway域名.railway.app
ALLOWED_ORIGINS=https://你的vercel域名.vercel.app
```

---

## 🧪 部署后测试

### 基础功能测试
- [ ] 访问首页
- [ ] 用户注册
- [ ] 用户登录
- [ ] 刷新页面（保持登录）
- [ ] 生成攻略
- [ ] 导出攻略

### 支付功能测试
- [ ] 查看定价页面
- [ ] 创建订单
- [ ] 跳转支付宝
- [ ] 完成支付（沙箱）
- [ ] 支付回调
- [ ] 会员开通

### 性能测试
- [ ] 页面加载速度 < 3秒
- [ ] API 响应时间 < 500ms
- [ ] 图片加载正常

### 跨浏览器测试
- [ ] Chrome
- [ ] Safari
- [ ] Firefox
- [ ] Edge
- [ ] 移动端浏览器

---

## 📊 监控指标

### 关键指标
- **可用性**: > 99.9%
- **响应时间**: < 500ms
- **错误率**: < 0.1%
- **并发用户**: 支持 1000+

### 监控工具推荐
- **Uptime**: UptimeRobot（免费）
- **性能**: Google PageSpeed Insights
- **错误**: Sentry（免费额度）
- **分析**: Google Analytics / Umami

---

## 💰 成本估算

### 免费额度（足够初期使用）
- **Vercel**: 100 GB 带宽/月
- **Railway**: $5 免费额度/月
- **Supabase**: 500 MB 数据库，50K 月活
- **DeepSeek**: 按量付费
- **Gemini**: 免费额度

### 预计月成本（1000 用户）
- Vercel: $0（免费额度内）
- Railway: $5-10
- Supabase: $0（免费额度内）
- AI API: $10-50（取决于使用量）
- **总计**: $15-60/月

---

## 🎯 上线时间表

### 立即可以上线（测试环境）
- ✅ 使用沙箱支付宝
- ✅ 使用 Vercel 域名
- ✅ 基础功能完整

### 1-2 周后（正式环境）
- ⏳ 申请正式支付宝账号
- ⏳ 配置自定义域名
- ⏳ 设置监控和分析

---

## 🎉 准备就绪！

### 现在可以做的
1. ✅ 上传代码到 GitHub
2. ✅ 部署到 Vercel + Railway
3. ✅ 使用沙箱支付宝测试
4. ✅ 邀请用户测试

### 等待正式支付宝审核期间
1. 收集用户反馈
2. 优化功能和性能
3. 完善文档
4. 准备营销材料

---

## 📞 需要帮助？

查看相关文档：
- `GITHUB_UPLOAD_GUIDE.md` - GitHub 上传指南
- `QUICK_DEPLOY.md` - 快速部署指南
- `DEPLOYMENT_CHECKLIST.md` - 完整部署清单

---

**准备好了吗？开始部署吧！** 🚀
