#!/bin/bash

# 测试 plan_configs 表是否有数据

echo "🔍 测试套餐配置..."
echo ""

BACKEND_URL="${BACKEND_URL:-http://localhost:3001}"

# 测试创建订单接口
echo "📡 测试创建订单接口..."
echo ""

# 使用一个测试用户 ID 和套餐类型
RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/payment/create-order" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "00000000-0000-0000-0000-000000000000",
    "planType": "basic"
  }')

echo "响应："
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

# 检查是否还有"套餐不存在"错误
if echo "$RESPONSE" | grep -q "套餐不存在"; then
  echo "❌ 仍然报错：套餐不存在"
  echo ""
  echo "需要初始化数据库，请执行："
  echo "1. 访问 https://app.supabase.com/project/dwgrurfoxqfoeiwjytbb"
  echo "2. 点击 SQL Editor"
  echo "3. 运行 fix-plan-configs.sql 文件的内容"
  echo ""
elif echo "$RESPONSE" | grep -q "success"; then
  echo "✅ 套餐配置正常！"
  echo ""
else
  echo "⚠️  收到其他响应，请检查后端日志"
  echo ""
fi
