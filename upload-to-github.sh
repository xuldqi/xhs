#!/bin/bash

# GitHub 上传脚本
# 自动检查并上传代码到 GitHub

echo "🚀 准备上传到 GitHub..."
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo -e "${RED}错误: 请在项目根目录运行此脚本${NC}"
    exit 1
fi

echo -e "${BLUE}📦 检查项目状态...${NC}"
echo ""

# 2. 检查 Git 是否初始化
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}⚠️  Git 仓库未初始化${NC}"
    echo -e "${BLUE}正在初始化 Git 仓库...${NC}"
    git init
    echo -e "${GREEN}✓ Git 仓库已初始化${NC}"
else
    echo -e "${GREEN}✓ Git 仓库已存在${NC}"
fi
echo ""

# 3. 检查 .gitignore
if [ -f ".gitignore" ]; then
    echo -e "${GREEN}✓ .gitignore 文件存在${NC}"
    
    # 检查关键排除项
    if grep -q ".env" .gitignore && grep -q "node_modules" .gitignore; then
        echo -e "${GREEN}✓ 敏感文件已配置排除${NC}"
    else
        echo -e "${RED}✗ .gitignore 配置不完整${NC}"
        exit 1
    fi
else
    echo -e "${RED}✗ .gitignore 文件不存在${NC}"
    exit 1
fi
echo ""

# 4. 检查是否有未跟踪的敏感文件
echo -e "${BLUE}🔍 检查敏感文件...${NC}"
if git status --porcelain | grep -q ".env"; then
    echo -e "${RED}✗ 发现 .env 文件未被忽略！${NC}"
    echo -e "${YELLOW}请确保 .env 在 .gitignore 中${NC}"
    exit 1
else
    echo -e "${GREEN}✓ 没有敏感文件会被上传${NC}"
fi
echo ""

# 5. 显示将要提交的文件
echo -e "${BLUE}📝 将要提交的文件:${NC}"
git status --short
echo ""

# 6. 询问是否继续
read -p "$(echo -e ${YELLOW}是否继续提交？[y/N]: ${NC})" -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}已取消${NC}"
    exit 0
fi

# 7. 添加所有文件
echo -e "${BLUE}📦 添加文件到 Git...${NC}"
git add .
echo -e "${GREEN}✓ 文件已添加${NC}"
echo ""

# 8. 提交代码
echo -e "${BLUE}💾 提交代码...${NC}"
git commit -m "feat: 完整的小红书攻略生成器

✨ 功能特性:
- 用户认证系统（支持持久化登录）
- AI 生成小红书攻略
- 会员订阅系统
- 支付宝支付集成
- 攻略导出功能
- 历史记录管理

🐛 修复:
- 认证持久化 - 刷新页面保持登录
- 定价页面布局优化
- 跨标签页状态同步

📚 文档:
- 完整的部署指南
- 测试文档
- API 文档"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 代码已提交${NC}"
else
    echo -e "${RED}✗ 提交失败${NC}"
    exit 1
fi
echo ""

# 9. 检查远程仓库
echo -e "${BLUE}🔗 检查远程仓库...${NC}"
if git remote | grep -q "origin"; then
    echo -e "${GREEN}✓ 远程仓库已配置${NC}"
    REMOTE_URL=$(git remote get-url origin)
    echo -e "${BLUE}远程仓库: ${REMOTE_URL}${NC}"
    echo ""
    
    # 推送代码
    read -p "$(echo -e ${YELLOW}是否推送到远程仓库？[y/N]: ${NC})" -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}📤 推送代码到 GitHub...${NC}"
        git push -u origin main
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ 代码已推送到 GitHub${NC}"
        else
            echo -e "${YELLOW}⚠️  推送失败，可能需要先设置远程仓库${NC}"
            echo -e "${BLUE}请运行以下命令设置远程仓库:${NC}"
            echo -e "git remote add origin https://github.com/你的用户名/xiaohongshu-guide-generator.git"
            echo -e "git push -u origin main"
        fi
    fi
else
    echo -e "${YELLOW}⚠️  远程仓库未配置${NC}"
    echo ""
    echo -e "${BLUE}请按以下步骤操作:${NC}"
    echo ""
    echo -e "${YELLOW}1. 在 GitHub 创建新仓库:${NC}"
    echo "   访问: https://github.com/new"
    echo "   仓库名: xiaohongshu-guide-generator"
    echo "   类型: Private（推荐）"
    echo ""
    echo -e "${YELLOW}2. 添加远程仓库:${NC}"
    echo "   git remote add origin https://github.com/你的用户名/xiaohongshu-guide-generator.git"
    echo ""
    echo -e "${YELLOW}3. 推送代码:${NC}"
    echo "   git push -u origin main"
fi
echo ""

# 10. 总结
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 准备完成！${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}📚 下一步:${NC}"
echo "1. 如果还没有，在 GitHub 创建仓库"
echo "2. 添加远程仓库并推送代码"
echo "3. 在 Vercel 部署前端"
echo "4. 在 Railway 部署后端"
echo ""
echo -e "${BLUE}📖 详细指南:${NC}"
echo "查看 GITHUB_UPLOAD_GUIDE.md 获取完整步骤"
echo ""
echo -e "${GREEN}祝你部署顺利！🚀${NC}"
