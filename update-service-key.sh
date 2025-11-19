#!/bin/bash

# 交互式更新 Supabase Service Role Key

echo "🔧 更新 Supabase Service Role Key"
echo ""
echo "=========================================="
echo ""

# 检查 backend/.env 文件
if [ ! -f "backend/.env" ]; then
  echo "❌ 找不到 backend/.env 文件"
  exit 1
fi

echo "✅ 找到 backend/.env 文件"
echo ""

# 显示当前配置
source backend/.env
echo "📋 当前配置："
echo "---"
echo "SUPABASE_URL: $SUPABASE_URL"
echo "SUPABASE_SERVICE_KEY: ${SUPABASE_SERVICE_KEY:0:50}..."
echo ""

# 检查当前 key 类型
PAYLOAD=$(echo "$SUPABASE_SERVICE_KEY" | cut -d'.' -f2)
PADDING_LENGTH=$((4 - ${#PAYLOAD} % 4))
if [ $PADDING_LENGTH -ne 4 ]; then
  PAYLOAD="${PAYLOAD}$(printf '=%.0s' $(seq 1 $PADDING_LENGTH))"
fi
DECODED=$(echo "$PAYLOAD" | base64 -d 2>/dev/null)

if echo "$DECODED" | grep -q '"role":"anon"'; then
  echo "❌ 当前使用的是 anon key（错误）"
  echo ""
elif echo "$DECODED" | grep -q '"role":"service_role"'; then
  echo "✅ 当前使用的是 service_role key（正确）"
  echo ""
  echo "配置已经正确，无需更新！"
  exit 0
fi

echo "=========================================="
echo ""
echo "📝 请按照以下步骤获取正确的 key："
echo ""
echo "1. 访问: https://app.supabase.com/project/dwgrurfoxqfoeiwjytbb/settings/api"
echo "2. 找到 'Project API keys' 部分"
echo "3. 复制 'service_role' key（不是 'anon' key）"
echo ""
echo "=========================================="
echo ""

# 提示用户输入新的 key
read -p "请粘贴 service_role key（或按 Ctrl+C 取消）: " NEW_KEY

# 验证输入
if [ -z "$NEW_KEY" ]; then
  echo "❌ 未输入 key，操作取消"
  exit 1
fi

# 验证新 key 的类型
NEW_PAYLOAD=$(echo "$NEW_KEY" | cut -d'.' -f2)
NEW_PADDING_LENGTH=$((4 - ${#NEW_PAYLOAD} % 4))
if [ $NEW_PADDING_LENGTH -ne 4 ]; then
  NEW_PAYLOAD="${NEW_PAYLOAD}$(printf '=%.0s' $(seq 1 $NEW_PADDING_LENGTH))"
fi
NEW_DECODED=$(echo "$NEW_PAYLOAD" | base64 -d 2>/dev/null)

if echo "$NEW_DECODED" | grep -q '"role":"anon"'; then
  echo "❌ 你输入的仍然是 anon key，请重新获取 service_role key"
  exit 1
elif echo "$NEW_DECODED" | grep -q '"role":"service_role"'; then
  echo "✅ 验证通过：这是 service_role key"
else
  echo "⚠️  无法验证 key 类型，但将继续更新"
fi

echo ""

# 备份原文件
cp backend/.env backend/.env.backup
echo "✅ 已备份原文件到 backend/.env.backup"

# 更新 .env 文件
sed -i.tmp "s|SUPABASE_SERVICE_KEY=.*|SUPABASE_SERVICE_KEY=$NEW_KEY|" backend/.env
rm -f backend/.env.tmp

echo "✅ 已更新 backend/.env"
echo ""

# 验证更新
source backend/.env
VERIFY_PAYLOAD=$(echo "$SUPABASE_SERVICE_KEY" | cut -d'.' -f2)
VERIFY_PADDING_LENGTH=$((4 - ${#VERIFY_PAYLOAD} % 4))
if [ $VERIFY_PADDING_LENGTH -ne 4 ]; then
  VERIFY_PAYLOAD="${VERIFY_PAYLOAD}$(printf '=%.0s' $(seq 1 $VERIFY_PADDING_LENGTH))"
fi
VERIFY_DECODED=$(echo "$VERIFY_PAYLOAD" | base64 -d 2>/dev/null)

if echo "$VERIFY_DECODED" | grep -q '"role":"service_role"'; then
  echo "✅ 验证成功：配置已更新为 service_role key"
else
  echo "⚠️  更新完成，但无法验证 key 类型"
fi

echo ""
echo "=========================================="
echo ""
echo "🎉 配置更新完成！"
echo ""
echo "下一步："
echo "1. 重启后端服务: cd backend && npm run dev"
echo "2. 测试支付功能: http://localhost:5173/pricing"
echo "3. 运行诊断: ./diagnose-payment-error.sh"
echo ""
