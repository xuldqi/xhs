#!/bin/bash

# 快速部署脚本
# 自动执行所有部署前检查和部署步骤

echo "🚀 小红书知识平台 - 快速部署"
echo "================================"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. 运行部署前检查
echo -e "${BLUE}步骤 1/5: 运行部署前检查...${NC}"
if ./pre-deploy-check.sh; then
  echo -e "${GREEN}✓ 部署前检查通过${NC}"
else
  echo -e "${RED}✗ 部署前检查失败，请修复错误后重试${NC}"
  exit 1
fi
echo ""

# 2. 清理旧的构建产物
echo -e "${BLUE}步骤 2/5: 清理旧的构建产物...${NC}"
if [ -d "dist" ]; then
  rm -rf dist
  echo -e "${GREEN}✓ 已清理 dist 目录${NC}"
else
  echo -e "${YELLOW}⚠ dist 目录不存在，跳过清理${NC}"
fi
echo ""

# 3. 安装依赖
echo -e "${BLUE}步骤 3/5: 检查并安装依赖...${NC}"
if [ ! -d "node_modules" ]; then
  echo "正在安装依赖..."
  npm install
  echo -e "${GREEN}✓ 依赖安装完成${NC}"
else
  echo -e "${GREEN}✓ 依赖已存在${NC}"
fi
echo ""

# 4. 构建项目
echo -e "${BLUE}步骤 4/5: 构建生产版本...${NC}"
if npm run build; then
  echo -e "${GREEN}✓ 构建成功${NC}"
  
  # 显示构建产物大小
  if [ -d "dist" ]; then
    DIST_SIZE=$(du -sh dist | cut -f1)
    echo -e "${GREEN}  构建产物大小: $DIST_SIZE${NC}"
  fi
else
  echo -e "${RED}✗ 构建失败${NC}"
  exit 1
fi
echo ""

# 5. 部署选项
echo -e "${BLUE}步骤 5/5: 选择部署方式${NC}"
echo ""
echo "请选择部署方式:"
echo "1) 使用 Vercel CLI 部署（推荐）"
echo "2) 生成部署说明（手动部署）"
echo "3) 仅构建，不部署"
echo ""
read -p "请输入选项 (1-3): " choice

case $choice in
  1)
    echo ""
    echo -e "${BLUE}使用 Vercel CLI 部署...${NC}"
    
    # 检查 Vercel CLI 是否安装
    if ! command -v vercel &> /dev/null; then
      echo -e "${YELLOW}⚠ Vercel CLI 未安装${NC}"
      echo "正在安装 Vercel CLI..."
      npm install -g vercel
    fi
    
    # 部署
    echo ""
    echo "开始部署到生产环境..."
    vercel --prod
    
    if [ $? -eq 0 ]; then
      echo ""
      echo -e "${GREEN}✓ 部署成功！${NC}"
      echo ""
      echo "下一步:"
      echo "1. 访问你的网站验证部署"
      echo "2. 提交 sitemap 到 Google Search Console"
      echo "3. 验证 Google Analytics 是否正常工作"
    else
      echo -e "${RED}✗ 部署失败${NC}"
      exit 1
    fi
    ;;
    
  2)
    echo ""
    echo -e "${GREEN}✓ 构建完成！${NC}"
    echo ""
    echo "手动部署步骤:"
    echo ""
    echo "1. 登录 Vercel Dashboard: https://vercel.com/dashboard"
    echo "2. 点击 'New Project'"
    echo "3. 导入你的 GitHub 仓库"
    echo "4. 配置项目:"
    echo "   - Framework: Vite"
    echo "   - Build Command: npm run build"
    echo "   - Output Directory: dist"
    echo "5. 添加环境变量（从 .env.production 复制）"
    echo "6. 点击 'Deploy'"
    echo ""
    echo "详细说明请查看: DEPLOYMENT_GUIDE.md"
    ;;
    
  3)
    echo ""
    echo -e "${GREEN}✓ 构建完成！${NC}"
    echo ""
    echo "构建产物位于 dist/ 目录"
    echo "你可以:"
    echo "1. 使用 'npm run preview' 本地预览"
    echo "2. 手动上传到你的服务器"
    echo "3. 稍后使用 Vercel CLI 部署"
    ;;
    
  *)
    echo -e "${RED}无效的选项${NC}"
    exit 1
    ;;
esac

echo ""
echo "================================"
echo -e "${GREEN}部署流程完成！${NC}"
echo ""
