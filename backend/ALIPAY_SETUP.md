# 支付宝接入步骤

按以下步骤配置后，即可在本项目中使用**支付宝电脑网站支付**与**手机网站支付**。

---

## 一、申请支付宝沙箱（开发测试）

1. 打开 [支付宝开放平台](https://open.alipay.com/) 并登录。
2. 进入 **开发者中心 → 沙箱环境**（或直接访问 [沙箱](https://openhome.alipay.com/develop/sandbox/app)）。
3. 在沙箱应用中查看并记录：
   - **APPID**（沙箱应用详情里）
   - **支付宝网关**：`https://openapi.alipaydev.com/gateway.do`
4. 在沙箱账号页面可获取 **买家账号**（用于沙箱环境付款测试）。

---

## 二、配置 RSA2 密钥

支付宝要求使用 **RSA2(SHA256)** 签名。需要准备：

- **应用私钥**：自己生成并妥善保管，填入 `.env` 的 `ALIPAY_PRIVATE_KEY`。
- **应用公钥**：由私钥导出，上传到支付宝开放平台。
- **支付宝公钥**：在开放平台「接口加签方式」里，上传应用公钥后，支付宝会给出，填入 `.env` 的 `ALIPAY_PUBLIC_KEY`。

### 2.1 生成密钥对

**方式 A：支付宝密钥生成工具（推荐）**

1. 下载 [支付宝密钥生成器](https://opendocs.alipay.com/common/02kipl)。
2. 选择 **RSA2(SHA256)**，密钥格式 **PKCS8**，生成密钥对。
3. 得到：
   - **应用私钥**：复制到 `ALIPAY_PRIVATE_KEY`（可保留 `-----BEGIN PRIVATE KEY-----` 等，也可去掉；多行时用 `\n` 连接成一行）。
   - **应用公钥**：在开放平台 → 沙箱应用 → 接口加签方式中上传。

**方式 B：OpenSSL**

```bash
# 生成 PKCS8 私钥
openssl genpkey -algorithm RSA -out rsa_private_key.pem -pkeyopt rsa_keygen_bits:2048
openssl pkcs8 -topk8 -inform PEM -in rsa_private_key.pem -outform PEM -nocrypt -out app_private_key.pem

# 从私钥导出公钥
openssl rsa -in app_private_key.pem -pubout -out app_public_key.pem
```

将 `app_private_key.pem` 内容作为 `ALIPAY_PRIVATE_KEY`，将 `app_public_key.pem` 内容上传到开放平台，并在开放平台复制「支付宝公钥」到 `ALIPAY_PUBLIC_KEY`。

### 2.2 上传应用公钥并获取支付宝公钥

1. 开放平台 → 沙箱应用 → **接口加签方式**。
2. 选择 **公钥** 模式，粘贴你的**应用公钥**（不含头尾、换行可保留或去掉）。
3. 保存后，页面会显示 **支付宝公钥**，复制到 `.env` 的 `ALIPAY_PUBLIC_KEY`。

---

## 三、配置后端 .env

在 `backend` 目录下复制 `.env.example` 为 `.env`，并填写：

```env
# 支付宝（沙箱示例）
ALIPAY_APP_ID=你的沙箱APPID
ALIPAY_GATEWAY=https://openapi.alipaydev.com/gateway.do

# 应用私钥：支持两种写法
# 1）完整 PEM（多行时每行末尾用 \n，或整段用引号包起来）
ALIPAY_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANB...(中间内容)...\n-----END PRIVATE KEY-----"

# 2）仅密钥内容（无 -----BEGIN/END-----），一行
# ALIPAY_PRIVATE_KEY=MIIEvQIBADANB...

# 支付宝公钥（开放平台「支付宝公钥」）
ALIPAY_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\nMIIBIjANB...(中间内容)...\n-----END PUBLIC KEY-----"

# 异步通知地址：支付宝会 POST 到该地址，必须公网可访问
# 本地开发可用 ngrok：ngrok http 3001，把生成的 https 地址填在这里
BACKEND_URL=http://localhost:3001

# 支付完成后用户跳回的前端地址
FRONTEND_URL=http://localhost:5173
```

说明：

- **BACKEND_URL**：支付宝服务器会请求 `BACKEND_URL/api/payment/notify`。本地为 localhost 时支付宝无法访问，需用 [ngrok](https://ngrok.com/) 等把本机端口暴露为 https 地址后，将 `BACKEND_URL` 设为该地址。
- **正式环境**：将 `ALIPAY_GATEWAY` 改为 `https://openapi.alipay.com/gateway.do`，并换成正式应用的 APPID 和正式密钥。

---

## 四、自检：支付宝是否接通

### 4.1 检查配置与初始化

```bash
curl "http://localhost:3001/api/payment-test/test-config"
```

期望：`serviceStatus` 为 `"初始化成功"`。若为 `"初始化失败: ..."`，按报错检查 APPID、私钥、公钥、网关是否填对。

### 4.2 创建测试订单（不依赖数据库）

```bash
curl -X POST http://localhost:3001/api/payment-test/test-create-order \
  -H "Content-Type: application/json" \
  -d '{"amount": "0.01", "subject": "测试订单"}'
```

返回里会有 `paymentForm`（HTML 表单）。把该 HTML 保存为本地 `.html` 在浏览器打开，或通过前端「测试支付宝」入口提交该表单，会跳转到支付宝收银台（沙箱会跳沙箱收银台），即表示**接入成功**。

### 4.3 前端测试入口（开发环境）

在**开发环境**下，定价页底部有「测试支付宝」区域：

1. 点击「创建 0.01 元测试订单」。
2. 自动跳转支付宝（沙箱）。
3. 使用沙箱买家账号完成付款，或仅验证能跳转即可。

该入口仅在开发环境显示，生产构建不会出现。注意：测试订单不会写入数据库，支付完成后若跳回本站「支付结果」页可能显示「订单不存在」，属正常，仅用于验证能跳转支付宝即可。

---

## 五、正式支付流程（需 Supabase）

正式购买会员会：

1. 在 Supabase 的 `plan_configs` 表读取套餐与价格。
2. 在 `orders` 表创建订单，再调支付宝生成支付表单。
3. 用户支付后，支付宝异步请求 `BACKEND_URL/api/payment/notify`，后端更新订单并写入 `subscriptions`。

请确保：

- Supabase 已配置好，且 `plan_configs`、`orders`、`subscriptions` 表及 RLS 正确。
- 用户已登录，前端传 `userId`、`planType` 调用 `POST /api/payment/create-order`。

详细表结构、RLS 与测试步骤见项目中的 `TEST_ALIPAY.md` 和数据库迁移文件。

---

## 六、常见问题

| 现象 | 可能原因 | 处理 |
|------|----------|------|
| 初始化失败: Missing Alipay configuration | 未配置 APPID/私钥/公钥 | 检查 `.env` 中三个变量是否填写且无多余空格 |
| 签名错误 / 验签失败 | 支付宝公钥与当前应用不一致；或私钥格式错误 | 在开放平台重新复制「支付宝公钥」；私钥用 PKCS8，多行时用 `\n` |
| 支付后未收到异步通知 | BACKEND_URL 非公网或未用 https | 本地用 ngrok 暴露 https，并把 BACKEND_URL 设为该地址 |
| 沙箱能跳转但正式环境报错 | 使用了沙箱网关或沙箱 APPID | 正式环境改用 `https://openapi.alipay.com/gateway.do` 和正式应用 APPID/密钥 |

接入完成后，定价页「立即购买」会使用 `/api/payment/create-order` 生成支付宝表单并跳转；支付结果以后端收到的异步通知为准，前端 `/payment/return` 仅用于展示和轮询查询订单状态。
