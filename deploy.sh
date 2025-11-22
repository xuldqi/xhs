#!/bin/bash

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 小红书涨粉助手 - 部署脚本${NC}"
echo "================================"
echo ""

# 检查是否安装了 vercel CLI
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  未检测到 Vercel CLI${NC}"
    echo -e "${BLUE}正在安装 Vercel CLI...${NC}"
    npm install -g vercel
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Vercel CLI 安装失败${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Vercel CLI 安装成功${NC}"
fi

# 检查环境变量文件
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ 未找到 .env 文件${NC}"
    echo -e "${YELLOW}请先创建 .env 文件并配置环境变量${NC}"
    exit 1
fi

if [ ! -f "backend/.env" ]; then
    echo -e "${RED}❌ 未找到 backend/.env 文件${NC}"
    echo -e "${YELLOW}请先创建 backend/.env 文件并配置环境变量${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 环境变量文件检查通过${NC}"
echo ""

# 询问部署类型
echo -e "${BLUE}请选择部署类型：${NC}"
echo "1) 仅部署前端"
echo "2) 仅部署后端"
echo "3) 部署前端和后端"
echo "4) 测试构建（不部署）"
read -p "请输入选项 (1-4): " deploy_option

case $deploy_option in
    1)
        echo -e "${BLUE}📦 开始构建前端...${NC}"
        npm run build
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ 前端构建失败${NC}"
            exit 1
        fi
        echo -e "${GREEN}✅ 前端构建成功${NC}"
        
        echo -e "${BLUE}🌐 部署前端到 Vercel...${NC}"
        vercel --prod
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ 前端部署失败${NC}"
            exit 1
        fi
        echo -e "${GREEN}✅ 前端部署成功！${NC}"
        ;;
    2)
        echo -e "${BLUE}🔧 部署后端到 Vercel...${NC}"
        cd backend
        vercel --prod
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ 后端部署失败${NC}"
            exit 1
        fi
        echo -e "${GREEN}✅ 后端部署成功！${NC}"
        ;;
    3)
        echo -e "${BLUE}📦 开始构建前端...${NC}"
        npm run build
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ 前端构建失败${NC}"
            exit 1
        fi
        echo -e "${GREEN}✅ 前端构建成功${NC}"
        
        echo -e "${BLUE}🌐 部署前端到 Vercel...${NC}"
        vercel --prod
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ 前端部署失败${NC}"
            exit 1
        fi
        echo -e "${GREEN}✅ 前端部署成功！${NC}"
        
        echo -e "${BLUE}🔧 部署后端到 Vercel...${NC}"
        cd backend
        vercel --prod
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ 后端部署失败${NC}"
            exit 1
        fi
        echo -e "${GREEN}✅ 后端部署成功！${NC}"
        ;;
    4)
        echo -e "${BLUE}📦 测试构建前端...${NC}"
        npm run build
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ 前端构建失败${NC}"
            exit 1
        fi
        echo -e "${GREEN}✅ 前端构建成功${NC}"
        
        echo -e "${BLUE}📦 测试构建后端...${NC}"
        cd backend
        npm run build
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ 后端构建失败${NC}"
            exit 1
        fi
        echo -e "${GREEN}✅ 后端构建成功${NC}"
        
        echo -e "${GREEN}✅ 所有构建测试通过！${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}❌ 无效的选项${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}🎉 部署完成！${NC}"
echo ""
echo -e "${YELLOW}📝 重要提示：${NC}"
echo "1. 请在 Vercel Dashboard 中配置环境变量"
echo "2. 如果部署了后端，记得更新前端的 VITE_BACKEND_URL"
echo "3. 访问你的网站验证所有功能"
echo "4. 检查 Google Analytics 是否正常工作"
echo ""
echo -e "${BLUE}📊 访问以下链接查看部署状态：${NC}"
echo "Vercel Dashboard: https://vercel.com/dashboard"
echo "Google Analytics: https://analytics.google.com"
echo ""
