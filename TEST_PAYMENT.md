# 付费系统测试指南

## 步骤 1：创建 Supabase 项目（5分钟）

### 1.1 注册/登录 Supabase

访问：https://supabase.com/

如果没有账号，使用 GitHub 账号登录即可（免费）。

### 1.2 创建新项目

1. 点击 "New Project"
2. 填写信息：
   - **Organization**: 选择或创建一个
   - **Name**: `xiaohongshu-guide`（或任意名称）
   - **Database Password**: 设置一个强密码（记住它！）
   - **Region**: 选择 `Northeast Asia (Tokyo)` 或 `Southeast Asia (Singapore)`
   - **Pricing Plan**: 选择 `Free` （免费版足够测试）

3. 点击 "Create new project"
4. 等待 1-2 分钟，项目创建完成

### 1.3 执行数据库脚本

1. 在 Supabase Dashboard 左侧，点击 **"SQL Editor"**
2. 点击 **"New query"**
3. 打开项目中的 `supabase-schema.sql` 文件
4. 复制全部内容（约 300 行）
5. 粘贴到 SQL Editor
6. 点击右下角 **"Run"** 按钮
7. 看到 "Success. No rows returned" 表示成功

### 1.4 获取 API 密钥

1. 在 Supabase Dashboard 左侧，点击 **"Settings"** (齿轮图标)
2. 点击 **"API"**
3. 找到并复制以下信息：

```
Project URL: https://xxxxx.supabase.co
anon public: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**重要**：
- `anon public` 用于前端
- `service_role` 用于后端（保密！）

---

## 步骤 2：配置环境变量（2分钟）

### 2.1 配置前端环境变量

编辑 `xiaohongshu-guide-generator/.env`，添加：

```env
# Supabase 配置
VITE_SUPABASE_URL=https://你的项目ID.supabase.co
VITE_SUPABASE_ANON_KEY=你的anon-public-key

# 后端地址
VITE_BACKEND_URL=http://localhost:3001

# 现有配置保持不变
VITE_USE_PROXY=true
VITE_PROXY_URL=/api/ai
VITE_MAX_FILE_SIZE=10485760
```

### 2.2 配置后端环境变量

编辑 `xiaohongshu-guide-generator/backend/.env`，添加：

```env
# Supabase 配置
SUPABASE_URL=https://你的项目ID.supabase.co
SUPABASE_SERVICE_KEY=你的service-role-key

# 支付配置（测试阶段可以先不配置）
PAYMENT_API_URL=https://your-payment-domain.com
INTERNAL_API_KEY=test-key-12345

# 前端地址
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3001

# 现有配置保持不变
PORT=3001
NODE_ENV=development
DEEPSEEK_API_KEY=sk-783505fb70064a26a2338e04f46b7df3
# ... 其他配置
```

---

## 步骤 3：安装依赖并启动（2分钟）

### 3.1 安装前端依赖

```bash
cd xiaohongshu-guide-generator
npm install
```

### 3.2 安装后端依赖

```bash
cd backend
npm install
cd ..
```

### 3.3 启动后端

```bash
# 在 xiaohongshu-guide-generator/backend 目录
npm run dev
```

应该看到：
```
🚀 Server is running on http://localhost:3001
📡 Environment: development
🔑 API Key configured: true
🌐 Allowed origins: http://localhost:5173, ...
```

### 3.4 启动前端（新终端）

```bash
# 在 xiaohongshu-guide-generator 目录
npm run dev
```

应该看到：
```
VITE v5.x.x ready in xxx ms

➜  Local:   http://localhost:5173/
```

---

## 步骤 4：测试功能（10分钟）

### 4.1 测试注册登录 ✅

1. 访问 http://localhost:5173/login
2. 点击"立即注册"
3. 填写：
   - 邮箱：`test@example.com`
   - 密码：`test123456`
   - 确认密码：`test123456`
4. 点击"注册"
5. 应该看到"注册成功！"并跳转到首页
6. 右上角应该显示用户头像和邮箱

**验证**：
- 在 Supabase Dashboard → Authentication → Users
- 应该看到新注册的用户

### 4.2 测试套餐页面 ✅

1. 访问 http://localhost:5173/pricing
2. 应该看到 4 个套餐卡片：
   - 免费体验 ¥0
   - 基础会员 ¥29.9
   - 专业会员 ¥99（推荐标签）
   - 终身会员 ¥299
3. 每个套餐显示功能列表

**验证**：
- 套餐信息正确显示
- "当前套餐"按钮在免费套餐上

### 4.3 测试用户中心 ✅

1. 点击右上角用户头像
2. 选择"个人中心"
3. 应该看到 4 个标签页：
   - **会员信息**：显示"免费体验"，今日使用 0/1
   - **使用记录**：暂无记录
   - **订单记录**：暂无订单
   - **个人设置**：可以修改昵称

**验证**：
- 会员状态显示正确
- 可以修改昵称并保存

### 4.4 测试权限控制 ✅

这是最重要的测试！

1. 访问首页，点击"开始生成"
2. 上传一张小红书截图
3. 点击"开始分析"
4. 应该能正常生成指南（第1次）
5. 返回首页，再次尝试生成
6. 应该看到提示："今日生成次数已用完"
7. 弹窗提示"升级会员"

**验证**：
- 免费用户每天只能生成 1 次
- 超限后提示升级
- 在用户中心看到使用记录

### 4.5 测试手动升级会员（数据库操作）

由于支付宝还没配置，我们手动升级测试：

1. 访问 Supabase Dashboard
2. 点击 **"Table Editor"**
3. 选择 `subscriptions` 表
4. 找到你的用户记录（status = 'active', plan_type = 'free'）
5. 点击编辑，修改：
   - `plan_type`: 改为 `pro`
   - `expires_at`: 设置为 30 天后（如 `2024-12-18`）
6. 保存

7. 回到前端，刷新页面
8. 访问用户中心，应该看到"专业会员"
9. 今日生成次数变为 0/999（无限）
10. 再次尝试生成，应该不受限制

**验证**：
- 会员升级成功
- 权限正确生效
- 可以无限次生成

---

## 步骤 5：测试支付流程（可选）

如果你想测试完整的支付流程，需要：

1. 在你的备案域名配置支付宝 API
2. 参考 `PAYMENT_SETUP.md` 配置内部 API
3. 更新 `backend/.env` 中的 `PAYMENT_API_URL` 和 `INTERNAL_API_KEY`
4. 重启后端
5. 在套餐页面点击"立即购买"
6. 应该跳转到支付宝支付页面

---

## 常见问题

### Q1: 注册后提示"Failed to fetch"

**原因**：Supabase 配置错误或网络问题

**解决**：
1. 检查 `.env` 中的 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY` 是否正确
2. 检查 Supabase 项目是否正常运行
3. 打开浏览器控制台查看具体错误

### Q2: 数据库脚本执行失败

**原因**：SQL 语法错误或权限问题

**解决**：
1. 确保复制了完整的 `supabase-schema.sql` 内容
2. 检查是否有遗漏的分号或括号
3. 尝试分段执行（先执行表创建，再执行触发器）

### Q3: 权限检查不生效

**原因**：数据未正确初始化

**解决**：
1. 在 Supabase Table Editor 检查 `subscriptions` 表
2. 确保用户有一条 `status='active'` 的记录
3. 检查 `plan_configs` 表是否有 4 条套餐记录

### Q4: 后端启动失败

**原因**：依赖未安装或环境变量错误

**解决**：
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## 测试清单

完成以下测试后，付费系统就可以正常使用了：

- [ ] Supabase 项目创建成功
- [ ] 数据库脚本执行成功
- [ ] 环境变量配置正确
- [ ] 前后端启动成功
- [ ] 用户注册登录成功
- [ ] 套餐页面显示正确
- [ ] 用户中心功能正常
- [ ] 权限控制生效（免费用户限制）
- [ ] 手动升级会员测试通过
- [ ] 使用记录正确记录

---

## 下一步

测试通过后，你可以：

1. **调整套餐价格**：在 Supabase 的 `plan_configs` 表中修改
2. **配置支付宝**：参考 `PAYMENT_SETUP.md`
3. **部署到生产环境**：参考 `DEPLOYMENT.md`
4. **添加更多功能**：手机号登录、推荐返利等

---

**准备好了吗？开始测试吧！** 🚀

有任何问题随时告诉我。
