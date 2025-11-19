#!/bin/bash

echo "🔍 检查支付宝配置"
echo "=================="
echo ""

# 读取 .env 文件
if [ ! -f "backend/.env" ]; then
    echo "❌ 找不到 backend/.env 文件"
    exit 1
fi

# 检查必要的配置项
echo "检查配置项..."
echo ""

# APPID
APPID=$(grep "ALIPAY_APP_ID=" backend/.env | cut -d '=' -f2)
if [ -z "$APPID" ]; then
    echo "❌ ALIPAY_APP_ID 未配置"
elif [ "$APPID" = "9021000157676998" ]; then
    echo "✅ ALIPAY_APP_ID: $APPID (沙箱)"
else
    echo "⚠️  ALIPAY_APP_ID: $APPID (非标准沙箱ID)"
fi

# 私钥
PRIVATE_KEY=$(grep "ALIPAY_PRIVATE_KEY=" backend/.env | cut -d '=' -f2)
if [ -z "$PRIVATE_KEY" ] || [ "$PRIVATE_KEY" = "你的应用私钥" ]; then
    echo "❌ ALIPAY_PRIVATE_KEY 未配置"
    echo "   请在支付宝开放平台生成密钥对"
elif [ ${#PRIVATE_KEY} -lt 100 ]; then
    echo "⚠️  ALIPAY_PRIVATE_KEY 长度异常（可能不完整）"
else
    echo "✅ ALIPAY_PRIVATE_KEY: 已配置 (${#PRIVATE_KEY} 字符)"
fi

# 公钥
PUBLIC_KEY=$(grep "ALIPAY_PUBLIC_KEY=" backend/.env | cut -d '=' -f2)
if [ -z "$PUBLIC_KEY" ] || [ "$PUBLIC_KEY" = "你的支付宝公钥" ]; then
    echo "❌ ALIPAY_PUBLIC_KEY 未配置"
    echo "   请从支付宝开放平台复制支付宝公钥"
elif [ ${#PUBLIC_KEY} -lt 100 ]; then
    echo "⚠️  ALIPAY_PUBLIC_KEY 长度异常（可能不完整）"
else
    echo "✅ ALIPAY_PUBLIC_KEY: 已配置 (${#PUBLIC_KEY} 字符)"
fi

# 网关
GATEWAY=$(grep "ALIPAY_GATEWAY=" backend/.env | cut -d '=' -f2)
if [ -z "$GATEWAY" ]; then
    echo "❌ ALIPAY_GATEWAY 未配置"
elif [[ "$GATEWAY" == *"sandbox"* ]] || [[ "$GATEWAY" == *"alipaydev"* ]]; then
    echo "✅ ALIPAY_GATEWAY: $GATEWAY (沙箱环境)"
else
    echo "⚠️  ALIPAY_GATEWAY: $GATEWAY (生产环境)"
fi

echo ""
echo "=================="

# 检查是否需要配置
if [ -z "$PRIVATE_KEY" ] || [ "$PRIVATE_KEY" = "你的应用私钥" ] || [ -z "$PUBLIC_KEY" ] || [ "$PUBLIC_KEY" = "你的支付宝公钥" ]; then
    echo ""
    echo "⚠️  需要配置密钥！"
    echo ""
    echo "📖 配置步骤："
    echo "1. 查看配置指南: cat ALIPAY_SANDBOX_SETUP.md"
    echo "2. 生成密钥对: https://opendocs.alipay.com/common/02kipl"
    echo "3. 在支付宝开放平台设置应用公钥"
    echo "4. 复制支付宝公钥"
    echo "5. 更新 backend/.env 文件"
    echo "6. 重启后端服务"
    echo ""
else
    echo ""
    echo "✅ 配置看起来正常！"
    echo ""
    echo "🧪 测试配置："
    echo "curl http://localhost:3001/api/payment/check-config"
    echo ""
fi
