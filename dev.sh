#!/bin/bash

# 小红书涨粉指南生成器 - 开发环境启动脚本

echo "🚀 启动开发环境..."
echo ""

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
  echo "❌ 错误：请在项目根目录运行此脚本"
  exit 1
fi

# 启动后端服务器（后台运行）
echo "📡 启动后端服务器 (http://localhost:3001)..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# 等待后端启动
sleep 2

# 启动前端开发服务器
echo "🎨 启动前端开发服务器 (http://localhost:5174)..."
npm run dev

# 当前端服务器停止时，也停止后端
echo ""
echo "🛑 停止后端服务器..."
kill $BACKEND_PID 2>/dev/null

echo "✅ 开发环境已关闭"
