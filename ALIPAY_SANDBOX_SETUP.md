# 支付宝沙箱配置指南

## 📋 你的沙箱应用信息

- **APPID**: `9021000157676998`
- **商家账号(PID)**: `2088721087825815`
- **网关地址**: `https://openapi-sandbox.dl.alipaydev.com/gateway.do`

## 🔑 配置步骤

### 步骤 1: 生成应用密钥

1. **下载密钥生成工具**
   - 访问: https://opendocs.alipay.com/common/02kipl
   - 下载适合你系统的密钥生成工具

2. **生成密钥对**
   - 打开密钥生成工具
   - 选择密钥格式: `PKCS8(Java适用)`
   - 选择密钥长度: `RSA2(推荐)`
   - 点击"生成密钥"
   - 会生成两个文件:
     - `应用私钥.txt` (保密，用于后端)
     - `应用公钥.txt` (需要上传到支付宝)

### 步骤 2: 配置应用公钥到支付宝

1. **访问沙箱应用**
   - 地址: https://open.alipay.com/develop/sandbox/app
   - 找到"接口加签方式"部分

2. **设置公钥**
   - 点击"设置"或"查看"
   - 选择"公钥模式"
   - 将 `应用公钥.txt` 的内容复制粘贴进去
   - 点击"保存"

3. **获取支付宝公钥**
   - 保存后，页面会显示"支付宝公钥"
   - 复制这个公钥（用于后端验证签名）

### 步骤 3: 更新后端配置

编辑 `backend/.env` 文件：

```bash
# 支付宝配置
ALIPAY_APP_ID=9021000157676998
ALIPAY_PRIVATE_KEY=你的应用私钥内容（不要包含BEGIN/END标记）
ALIPAY_PUBLIC_KEY=支付宝公钥内容（不要包含BEGIN/END标记）
ALIPAY_GATEWAY=https://openapi-sandbox.dl.alipaydev.com/gateway.do
```

**注意事项：**
- 私钥和公钥都不要包含 `-----BEGIN PRIVATE KEY-----` 和 `-----END PRIVATE KEY-----` 这样的标记
- 只需要中间的密钥内容
- 密钥内容应该是一长串字符，可以包含换行

### 步骤 4: 重启后端服务

```bash
# 停止当前服务（如果在运行）
# 然后重新启动
cd xiaohongshu-guide-generator/backend
npm run dev
```

### 步骤 5: 验证配置

```bash
curl http://localhost:3001/api/payment/check-config
```

应该看到：
```json
{
  "success": true,
  "data": {
    "alipay": {
      "hasAppId": true,
      "hasPrivateKey": true,
      "hasPublicKey": true,
      "initialized": true
    },
    "allReady": true
  }
}
```

## 🧪 获取沙箱测试账号

1. **访问沙箱应用页面**
   - https://open.alipay.com/develop/sandbox/app

2. **查看买家账号**
   - 在页面下方找到"沙箱账号"部分
   - 会显示:
     - 买家账号（用于测试支付）
     - 登录密码
     - 支付密码（通常是 111111）

3. **可选：下载沙箱钱包APP**
   - 扫描页面上的二维码
   - 安装沙箱版支付宝
   - 使用买家账号登录

## 📱 测试支付流程

配置完成后，运行测试：

```bash
cd xiaohongshu-guide-generator
./quick-test-payment.sh
```

或者打开测试页面：
```bash
open test-payment-flow.html
```

## ❓ 常见问题

### Q1: 密钥格式错误
**症状**: 提示 "invalid key format" 或签名失败

**解决**:
- 确保使用 PKCS8 格式
- 确保没有包含 BEGIN/END 标记
- 确保密钥内容完整，没有多余的空格或换行

### Q2: 签名验证失败
**症状**: 支付回调时提示签名无效

**解决**:
- 确认使用的是"支付宝公钥"，不是"应用公钥"
- 检查密钥是否正确复制
- 确认网关地址正确

### Q3: APPID 不匹配
**症状**: 提示 APPID 错误

**解决**:
- 确认使用的是沙箱 APPID: `9021000157676998`
- 不要使用正式环境的 APPID

## 🔒 安全提示

1. **永远不要提交私钥到 Git**
   - `.env` 文件已在 `.gitignore` 中
   - 确保不要将私钥分享给他人

2. **生产环境使用不同的密钥**
   - 沙箱密钥仅用于测试
   - 上线前需要申请正式应用并生成新密钥

3. **定期更换密钥**
   - 如果怀疑密钥泄露，立即更换

## 📞 需要帮助？

- 支付宝开放平台文档: https://opendocs.alipay.com/
- 沙箱环境说明: https://opendocs.alipay.com/common/02kkv7
- 密钥工具下载: https://opendocs.alipay.com/common/02kipl

---

**配置完成后，你就可以开始测试支付功能了！** 🎉
