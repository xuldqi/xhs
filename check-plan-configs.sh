#!/bin/bash

# 检查套餐配置的脚本

echo "🔍 检查套餐配置..."
echo ""

# 读取环境变量
if [ -f "backend/.env" ]; then
  source backend/.env
else
  echo "❌ 找不到 backend/.env 文件"
  exit 1
fi

# 检查必要的环境变量
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_KEY" ]; then
  echo "❌ Supabase 配置缺失"
  echo "   请确保 backend/.env 中有以下配置："
  echo "   - SUPABASE_URL"
  echo "   - SUPABASE_SERVICE_KEY"
  exit 1
fi

echo "✅ Supabase 配置已找到"
echo "   URL: $SUPABASE_URL"
echo ""

# 调用后端 API 检查配置
echo "📡 调用后端 API 检查配置..."
BACKEND_URL="${BACKEND_URL:-http://localhost:3000}"

# 检查后端是否运行
if ! curl -s "$BACKEND_URL/api/health" > /dev/null 2>&1; then
  echo "❌ 后端服务未运行"
  echo "   请先启动后端: cd backend && npm run dev"
  exit 1
fi

echo "✅ 后端服务正在运行"
echo ""

# 检查支付配置
echo "🔍 检查支付配置..."
curl -s "$BACKEND_URL/api/payment/check-config" | jq '.'
echo ""

# 提供修复建议
echo "📝 修复建议："
echo ""
echo "1. 如果 Supabase 连接失败，请检查："
echo "   - SUPABASE_URL 是否正确"
echo "   - SUPABASE_SERVICE_KEY 是否正确（使用 service_role key，不是 anon key）"
echo ""
echo "2. 如果套餐配置不存在，请执行："
echo "   - 在 Supabase Dashboard 的 SQL Editor 中运行 fix-plan-configs.sql"
echo "   - 或使用 psql 命令: psql \$DATABASE_URL -f fix-plan-configs.sql"
echo ""
echo "3. 验证套餐配置："
echo "   - 访问 Supabase Dashboard > Table Editor > plan_configs"
echo "   - 确保有 4 条记录：free, basic, pro, lifetime"
echo ""
