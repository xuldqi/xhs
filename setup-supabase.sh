#!/bin/bash

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}  Supabase 快速配置向导${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# 检查 .env 文件
ENV_FILE="backend/.env"

if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}错误: 找不到 backend/.env 文件${NC}"
    exit 1
fi

echo -e "${YELLOW}请按照以下步骤操作：${NC}"
echo ""
echo "1. 访问 https://supabase.com/"
echo "2. 登录并创建新项目（如果还没有）"
echo "3. 进入项目 Settings → API"
echo "4. 复制以下信息："
echo ""

# 获取 Supabase URL
echo -e "${GREEN}请输入 Supabase Project URL:${NC}"
echo -e "${YELLOW}(格式: https://xxxxx.supabase.co)${NC}"
read -p "> " SUPABASE_URL

if [ -z "$SUPABASE_URL" ]; then
    echo -e "${RED}错误: URL 不能为空${NC}"
    exit 1
fi

# 获取 Service Key
echo ""
echo -e "${GREEN}请输入 Supabase Service Role Key:${NC}"
echo -e "${YELLOW}(很长的字符串，以 eyJ 开头)${NC}"
read -p "> " SUPABASE_KEY

if [ -z "$SUPABASE_KEY" ]; then
    echo -e "${RED}错误: Service Key 不能为空${NC}"
    exit 1
fi

# 更新 .env 文件
echo ""
echo -e "${BLUE}正在更新配置文件...${NC}"

# 使用 sed 更新配置
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s|SUPABASE_URL=.*|SUPABASE_URL=$SUPABASE_URL|g" "$ENV_FILE"
    sed -i '' "s|SUPABASE_SERVICE_KEY=.*|SUPABASE_SERVICE_KEY=$SUPABASE_KEY|g" "$ENV_FILE"
else
    # Linux
    sed -i "s|SUPABASE_URL=.*|SUPABASE_URL=$SUPABASE_URL|g" "$ENV_FILE"
    sed -i "s|SUPABASE_SERVICE_KEY=.*|SUPABASE_SERVICE_KEY=$SUPABASE_KEY|g" "$ENV_FILE"
fi

echo -e "${GREEN}✅ 配置文件已更新${NC}"
echo ""

# 显示 SQL 文件路径
echo -e "${YELLOW}下一步: 创建数据库表${NC}"
echo ""
echo "1. 在 Supabase 项目中，点击左侧的 'SQL Editor'"
echo "2. 点击 'New query'"
echo "3. 复制以下文件的内容并执行:"
echo -e "   ${GREEN}$(pwd)/supabase-schema.sql${NC}"
echo ""
echo "或者直接复制下面的命令，然后粘贴到 Supabase SQL Editor:"
echo ""
echo -e "${BLUE}cat supabase-schema.sql${NC}"
echo ""

# 询问是否显示 SQL
read -p "是否现在显示 SQL 内容? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${BLUE}================================${NC}"
    cat supabase-schema.sql
    echo -e "${BLUE}================================${NC}"
    echo ""
fi

echo -e "${GREEN}配置完成！${NC}"
echo ""
echo -e "${YELLOW}重要提示：${NC}"
echo "1. 确保在 Supabase SQL Editor 中执行了 supabase-schema.sql"
echo "2. 重启后端服务以应用新配置"
echo ""
echo -e "${BLUE}重启后端命令：${NC}"
echo "  cd backend && npm run dev"
echo ""
echo -e "${BLUE}验证配置命令：${NC}"
echo "  curl http://localhost:3001/api/payment/check-config"
echo ""
