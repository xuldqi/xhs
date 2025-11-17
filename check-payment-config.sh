#!/bin/bash

# 付费系统配置检查脚本

echo "🔍 检查付费系统配置..."
echo ""

# 检查前端环境变量
echo "📦 检查前端配置..."
if [ -f ".env" ]; then
    if grep -q "VITE_SUPABASE_URL=https://your-project-id" .env; then
        echo "❌ 前端 Supabase URL 未配置"
        echo "   请编辑 .env 文件，填入你的 Supabase URL"
        FRONTEND_OK=false
    else
        echo "✅ 前端 Supabase URL 已配置"
        FRONTEND_OK=true
    fi
    
    if grep -q "VITE_SUPABASE_ANON_KEY=your-anon-public-key" .env; then
        echo "❌ 前端 Supabase Anon Key 未配置"
        echo "   请编辑 .env 文件，填入你的 Anon Key"
        FRONTEND_OK=false
    else
        echo "✅ 前端 Supabase Anon Key 已配置"
    fi
else
    echo "❌ 前端 .env 文件不存在"
    FRONTEND_OK=false
fi

echo ""

# 检查后端环境变量
echo "🔧 检查后端配置..."
if [ -f "backend/.env" ]; then
    if grep -q "SUPABASE_URL=https://your-project-id" backend/.env; then
        echo "❌ 后端 Supabase URL 未配置"
        echo "   请编辑 backend/.env 文件，填入你的 Supabase URL"
        BACKEND_OK=false
    else
        echo "✅ 后端 Supabase URL 已配置"
        BACKEND_OK=true
    fi
    
    if grep -q "SUPABASE_SERVICE_KEY=your-service-role-key" backend/.env; then
        echo "❌ 后端 Supabase Service Key 未配置"
        echo "   请编辑 backend/.env 文件，填入你的 Service Role Key"
        BACKEND_OK=false
    else
        echo "✅ 后端 Supabase Service Key 已配置"
    fi
else
    echo "❌ 后端 .env 文件不存在"
    BACKEND_OK=false
fi

echo ""

# 检查依赖
echo "📚 检查依赖..."
if [ -d "node_modules/@supabase" ]; then
    echo "✅ 前端 Supabase 依赖已安装"
else
    echo "❌ 前端 Supabase 依赖未安装"
    echo "   运行: npm install"
fi

if [ -d "backend/node_modules/@supabase" ]; then
    echo "✅ 后端 Supabase 依赖已安装"
else
    echo "❌ 后端 Supabase 依赖未安装"
    echo "   运行: cd backend && npm install"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$FRONTEND_OK" = true ] && [ "$BACKEND_OK" = true ]; then
    echo "✅ 配置检查通过！"
    echo ""
    echo "📝 下一步："
    echo "1. 确保 Supabase 数据库脚本已执行（supabase-schema.sql）"
    echo "2. 启动后端: cd backend && npm run dev"
    echo "3. 启动前端: npm run dev"
    echo "4. 访问: http://localhost:5173"
    echo ""
    echo "📖 详细测试步骤请查看: TEST_PAYMENT.md"
else
    echo "❌ 配置未完成"
    echo ""
    echo "📝 请按照以下步骤配置："
    echo "1. ��问 https://supabase.com/ 创建项目"
    echo "2. 执行 supabase-schema.sql 脚本"
    echo "3. 获取 API 密钥并填入 .env 文件"
    echo ""
    echo "📖 详细步骤请查看: TEST_PAYMENT.md"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
