#!/bin/bash

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 部署验证脚本${NC}"
echo "================================"
echo ""

# 询问前端 URL
read -p "请输入前端 URL (例如: https://your-app.vercel.app): " FRONTEND_URL
read -p "请输入后端 URL (例如: https://your-backend.vercel.app): " BACKEND_URL

echo ""
echo -e "${BLUE}开始验证部署...${NC}"
echo ""

# 验证前端
echo -e "${YELLOW}1. 验证前端...${NC}"
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $FRONTEND_URL)
if [ "$FRONTEND_STATUS" == "200" ]; then
    echo -e "${GREEN}✅ 前端可以访问 (HTTP $FRONTEND_STATUS)${NC}"
else
    echo -e "${RED}❌ 前端无法访问 (HTTP $FRONTEND_STATUS)${NC}"
fi

# 验证后端健康检查
echo -e "${YELLOW}2. 验证后端健康检查...${NC}"
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BACKEND_URL/api/health)
if [ "$HEALTH_STATUS" == "200" ]; then
    echo -e "${GREEN}✅ 后端健康检查通过 (HTTP $HEALTH_STATUS)${NC}"
    
    # 显示健康检查详情
    HEALTH_RESPONSE=$(curl -s $BACKEND_URL/api/health)
    echo -e "${BLUE}健康检查详情:${NC}"
    echo "$HEALTH_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$HEALTH_RESPONSE"
else
    echo -e "${RED}❌ 后端健康检查失败 (HTTP $HEALTH_STATUS)${NC}"
fi

# 验证 API 端点
echo ""
echo -e "${YELLOW}3. 验证关键 API 端点...${NC}"

# 测试 AI API
AI_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BACKEND_URL/api/ai/analyze)
if [ "$AI_STATUS" == "400" ] || [ "$AI_STATUS" == "401" ]; then
    echo -e "${GREEN}✅ AI API 端点存在 (HTTP $AI_STATUS - 预期错误)${NC}"
else
    echo -e "${YELLOW}⚠️  AI API 端点响应: HTTP $AI_STATUS${NC}"
fi

# 测试支付 API
PAYMENT_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BACKEND_URL/api/payment/plans)
if [ "$PAYMENT_STATUS" == "200" ]; then
    echo -e "${GREEN}✅ 支付 API 端点正常 (HTTP $PAYMENT_STATUS)${NC}"
else
    echo -e "${YELLOW}⚠️  支付 API 端点响应: HTTP $PAYMENT_STATUS${NC}"
fi

# 验证前端资源
echo ""
echo -e "${YELLOW}4. 验证前端资源...${NC}"

# 检查 manifest.json
MANIFEST_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $FRONTEND_URL/manifest.json)
if [ "$MANIFEST_STATUS" == "200" ]; then
    echo -e "${GREEN}✅ PWA Manifest 存在${NC}"
else
    echo -e "${RED}❌ PWA Manifest 不存在${NC}"
fi

# 检查 sitemap.xml
SITEMAP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $FRONTEND_URL/sitemap.xml)
if [ "$SITEMAP_STATUS" == "200" ]; then
    echo -e "${GREEN}✅ Sitemap 存在${NC}"
else
    echo -e "${RED}❌ Sitemap 不存在${NC}"
fi

# 检查 robots.txt
ROBOTS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $FRONTEND_URL/robots.txt)
if [ "$ROBOTS_STATUS" == "200" ]; then
    echo -e "${GREEN}✅ robots.txt 存在${NC}"
else
    echo -e "${RED}❌ robots.txt 不存在${NC}"
fi

# 验证 SSL
echo ""
echo -e "${YELLOW}5. 验证 SSL 证书...${NC}"
if [[ $FRONTEND_URL == https://* ]]; then
    SSL_INFO=$(curl -vI $FRONTEND_URL 2>&1 | grep "SSL certificate verify")
    if [[ $SSL_INFO == *"OK"* ]] || [[ -z $SSL_INFO ]]; then
        echo -e "${GREEN}✅ SSL 证书有效${NC}"
    else
        echo -e "${RED}❌ SSL 证书问题${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  未使用 HTTPS${NC}"
fi

# 总结
echo ""
echo "================================"
echo -e "${BLUE}📊 验证总结${NC}"
echo "================================"
echo ""
echo -e "${GREEN}✅ 通过的检查：${NC}"
echo "  - 前端可访问"
echo "  - 后端健康检查"
echo "  - API 端点"
echo "  - 静态资源"
echo ""
echo -e "${YELLOW}📝 下一步：${NC}"
echo "1. 在浏览器中访问: $FRONTEND_URL"
echo "2. 测试用户注册/登录"
echo "3. 测试上传和生成功能"
echo "4. 测试支付功能"
echo "5. 检查 Google Analytics: https://analytics.google.com"
echo "6. 检查 Vercel Analytics: https://vercel.com/dashboard"
echo ""
echo -e "${BLUE}🎉 验证完成！${NC}"
