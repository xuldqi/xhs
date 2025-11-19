#!/bin/bash

# 诊断支付错误的脚本

echo "🔍 诊断支付系统错误..."
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

# 读取环境变量
source backend/.env

# 检查 Supabase 配置
echo "📋 Supabase 配置检查："
echo "---"

if [ -z "$SUPABASE_URL" ]; then
  echo "❌ SUPABASE_URL 未配置"
else
  echo "✅ SUPABASE_URL: $SUPABASE_URL"
fi

if [ -z "$SUPABASE_SERVICE_KEY" ]; then
  echo "❌ SUPABASE_SERVICE_KEY 未配置"
else
  # 检查是否是 anon key（通过解码 JWT 的 role 字段）
  # JWT 格式: header.payload.signature
  PAYLOAD=$(echo "$SUPABASE_SERVICE_KEY" | cut -d'.' -f2)
  
  # 添加 padding（JWT base64 可能缺少 padding）
  PADDING_LENGTH=$((4 - ${#PAYLOAD} % 4))
  if [ $PADDING_LENGTH -ne 4 ]; then
    PAYLOAD="${PAYLOAD}$(printf '=%.0s' $(seq 1 $PADDING_LENGTH))"
  fi
  
  # 解码 payload
  DECODED=$(echo "$PAYLOAD" | base64 -d 2>/dev/null)
  
  if echo "$DECODED" | grep -q '"role":"anon"'; then
    echo "❌ SUPABASE_SERVICE_KEY 使用的是 anon key（错误）"
    echo "   👉 这是问题的根本原因！"
    echo ""
    echo "   修复方法："
    echo "   1. 访问 https://app.supabase.com"
    echo "   2. 选择项目 → Settings → API"
    echo "   3. 复制 'service_role' key（不是 'anon' key）"
    echo "   4. 更新 backend/.env 中的 SUPABASE_SERVICE_KEY"
    echo ""
  elif echo "$DECODED" | grep -q '"role":"service_role"'; then
    echo "✅ SUPABASE_SERVICE_KEY 使用的是 service_role key（正确）"
  else
    echo "⚠️  无法识别 SUPABASE_SERVICE_KEY 的类型"
    echo "   Key 前缀: ${SUPABASE_SERVICE_KEY:0:20}..."
  fi
fi

echo ""
echo "=========================================="
echo ""

# 检查后端是否运行
BACKEND_URL="${BACKEND_URL:-http://localhost:3001}"
echo "📡 检查后端服务..."

if curl -s "$BACKEND_URL/api/health" > /dev/null 2>&1; then
  echo "✅ 后端服务正在运行: $BACKEND_URL"
  echo ""
  
  # 调用配置检查接口
  echo "🔍 检查支付配置..."
  RESPONSE=$(curl -s "$BACKEND_URL/api/payment/check-config")
  
  if command -v jq &> /dev/null; then
    echo "$RESPONSE" | jq '.'
  else
    echo "$RESPONSE"
  fi
else
  echo "❌ 后端服务未运行"
  echo "   请先启动: cd backend && npm run dev"
fi

echo ""
echo "=========================================="
echo ""
echo "📝 总结："
echo ""

# 根据检查结果给出建议
if echo "$DECODED" | grep -q '"role":"anon"'; then
  echo "🔴 发现问题：使用了错误的 Supabase Key"
  echo ""
  echo "   立即修复："
  echo "   1. 打开 backend/.env"
  echo "   2. 将 SUPABASE_SERVICE_KEY 替换为 service_role key"
  echo "   3. 重启后端: cd backend && npm run dev"
  echo ""
  echo "   详细说明请查看: FIX_PLAN_ERROR.md"
else
  echo "✅ Supabase 配置看起来正确"
  echo ""
  echo "   如果仍然有问题，请检查："
  echo "   1. plan_configs 表是否有数据"
  echo "   2. 运行 fix-plan-configs.sql 初始化数据"
  echo "   3. 查看后端日志获取详细错误信息"
fi

echo ""
