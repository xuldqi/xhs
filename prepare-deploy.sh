#!/bin/bash

# 发布准备脚本
# 用于检查和准备发布前的所有必要步骤

echo "🚀 开始准备发布..."
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查函数
check_pass() {
    echo -e "${GREEN}✓${NC} $1"
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
}

check_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# 1. 检查 Node.js 版本
echo "📦 检查 Node.js 版本..."
NODE_VERSION=$(node -v)
if [[ $NODE_VERSION == v18* ]] || [[ $NODE_VERSION == v20* ]]; then
    check_pass "Node.js 版本: $NODE_VERSION"
else
    check_warn "Node.js 版本: $NODE_VERSION (推荐 v18 或 v20)"
fi
echo ""

# 2. 检查依赖
echo "📦 检查依赖..."
if [ -d "node_modules" ]; then
    check_pass "前端依赖已安装"
else
    check_fail "前端依赖未安装，运行: npm install"
fi

if [ -d "backend/node_modules" ]; then
    check_pass "后端依赖已安装"
else
    check_fail "后端依赖未安装，运行: cd backend && npm install"
fi
echo ""

# 3. 检查环境变量
echo "🔧 检查环境变量..."
if [ -f ".env" ]; then
    check_pass "前端 .env 文件存在"
    
    # 检查必要的环境变量
    if grep -q "VITE_SUPABASE_URL" .env && grep -q "VITE_SUPABASE_ANON_KEY" .env; then
        check_pass "Supabase 配置已设置"
    else
        check_fail "Supabase 配置缺失"
    fi
else
    check_fail "前端 .env 文件不存在"
fi

if [ -f "backend/.env" ]; then
    check_pass "后端 .env 文件存在"
    
    # 检查必要的环境变量
    if grep -q "SUPABASE_SERVICE_KEY" backend/.env && grep -q "DASHSCOPE_API_KEY" backend/.env; then
        check_pass "后端关键配置已设置"
    else
        check_fail "后端关键配置缺失"
    fi
else
    check_fail "后端 .env 文件不存在"
fi
echo ""

# 4. 检查代码质量
echo "🔍 检查代码质量..."
if command -v eslint &> /dev/null; then
    npm run lint --silent 2>&1 | grep -q "error" && check_warn "发现 ESLint 错误" || check_pass "ESLint 检查通过"
else
    check_warn "ESLint 未安装"
fi
echo ""

# 5. 尝试构建
echo "🏗️  尝试构建..."
echo "构建前端..."
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    check_pass "前端构建成功"
else
    check_fail "前端构建失败，请检查错误"
fi

echo "构建后端..."
cd backend
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    check_pass "后端构建成功"
else
    check_fail "后端构建失败，请检查错误"
fi
cd ..
echo ""

# 6. 检查 Git 状态
echo "📝 检查 Git 状态..."
if [ -d ".git" ]; then
    check_pass "Git 仓库已初始化"
    
    # 检查是否有未提交的更改
    if [ -n "$(git status --porcelain)" ]; then
        check_warn "有未提交的更改"
        echo "   运行以下命令提交："
        echo "   git add ."
        echo "   git commit -m 'Ready for deployment'"
        echo "   git push"
    else
        check_pass "所有更改已提交"
    fi
else
    check_fail "Git 仓库未初始化"
fi
echo ""

# 7. 生成检查清单
echo "📋 生成发布检查清单..."
cat > DEPLOY_CHECKLIST.txt << EOF
发布检查清单
====================

环境配置:
[ ] Supabase 生产数据库已初始化
[ ] 支付宝正式商户账号已申请
[ ] 域名已购买和配置
[ ] SSL 证书已配置

部署平台:
[ ] Vercel 账号已创建
[ ] GitHub 仓库已连接
[ ] 环境变量已配置

测试:
[ ] 本地测试通过
[ ] 认证功能正常
[ ] 支付流程正常
[ ] 移动端适配正常

监控:
[ ] 错误监控已设置
[ ] 性能监控已设置
[ ] 日志系统已配置

发布后:
[ ] 访问生产环境测试
[ ] 监控错误日志
[ ] 收集用户反馈
EOF

check_pass "检查清单已生成: DEPLOY_CHECKLIST.txt"
echo ""

# 8. 总结
echo "📊 准备总结"
echo "================================"
echo ""
echo "✅ 已完成的检查:"
echo "   - Node.js 版本"
echo "   - 依赖安装"
echo "   - 环境变量"
echo "   - 代码构建"
echo "   - Git 状态"
echo ""
echo "📚 下一步:"
echo "   1. 查看 QUICK_DEPLOY.md 快速发布指南"
echo "   2. 查看 DEPLOYMENT_CHECKLIST.md 完整检查清单"
echo "   3. 配置生产环境变量"
echo "   4. 部署到 Vercel"
echo ""
echo "🚀 准备完成！祝你发布顺利！"
