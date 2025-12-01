#!/bin/bash

# 部署后验证脚本
# 自动检查部署后的网站功能

echo "🔍 部署后验证检查"
echo "================================"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查计数
PASSED=0
FAILED=0
WARNINGS=0

# 获取部署 URL
read -p "请输入部署的 URL (例如: https://your-app.vercel.app): " DEPLOY_URL

if [ -z "$DEPLOY_URL" ]; then
  echo -e "${RED}错误: URL 不能为空${NC}"
  exit 1
fi

# 移除末尾的斜杠
DEPLOY_URL=${DEPLOY_URL%/}

echo ""
echo "正在验证: $DEPLOY_URL"
echo ""

# 1. 检查网站可访问性
echo -e "${BLUE}1. 检查网站可访问性...${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOY_URL")
if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✓ 网站可访问 (HTTP $HTTP_CODE)${NC}"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}✗ 网站不可访问 (HTTP $HTTP_CODE)${NC}"
  FAILED=$((FAILED + 1))
fi
echo ""

# 2. 检查关键页面
echo -e "${BLUE}2. 检查关键页面...${NC}"
PAGES=(
  "/"
  "/knowledge"
  "/cases"
  "/intelligence"
  "/tools"
  "/community"
  "/blog"
  "/about"
  "/pricing"
)

for page in "${PAGES[@]}"; do
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOY_URL$page")
  if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓${NC} $page (HTTP $HTTP_CODE)"
    PASSED=$((PASSED + 1))
  else
    echo -e "${RED}✗${NC} $page (HTTP $HTTP_CODE)"
    FAILED=$((FAILED + 1))
  fi
done
echo ""

# 3. 检查 SEO 文件
echo -e "${BLUE}3. 检查 SEO 文件...${NC}"
SEO_FILES=(
  "/sitemap.xml"
  "/robots.txt"
  "/manifest.json"
)

for file in "${SEO_FILES[@]}"; do
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOY_URL$file")
  if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓${NC} $file 可访问"
    PASSED=$((PASSED + 1))
  else
    echo -e "${YELLOW}⚠${NC} $file 不可访问 (HTTP $HTTP_CODE)"
    WARNINGS=$((WARNINGS + 1))
  fi
done
echo ""

# 4. 检查 meta 标签
echo -e "${BLUE}4. 检查首页 meta 标签...${NC}"
HTML=$(curl -s "$DEPLOY_URL")

# 检查 title
if echo "$HTML" | grep -q "<title>"; then
  echo -e "${GREEN}✓${NC} Title 标签存在"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}✗${NC} Title 标签缺失"
  FAILED=$((FAILED + 1))
fi

# 检查 description
if echo "$HTML" | grep -q 'name="description"'; then
  echo -e "${GREEN}✓${NC} Description meta 标签存在"
  PASSED=$((PASSED + 1))
else
  echo -e "${YELLOW}⚠${NC} Description meta 标签缺失"
  WARNINGS=$((WARNINGS + 1))
fi

# 检查 OG 标签
if echo "$HTML" | grep -q 'property="og:'; then
  echo -e "${GREEN}✓${NC} Open Graph 标签存在"
  PASSED=$((PASSED + 1))
else
  echo -e "${YELLOW}⚠${NC} Open Graph 标签缺失"
  WARNINGS=$((WARNINGS + 1))
fi

# 检查 viewport
if echo "$HTML" | grep -q 'name="viewport"'; then
  echo -e "${GREEN}✓${NC} Viewport meta 标签存在"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}✗${NC} Viewport meta 标签缺失"
  FAILED=$((FAILED + 1))
fi
echo ""

# 5. 检查 JavaScript 加载
echo -e "${BLUE}5. 检查 JavaScript 资源...${NC}"
if echo "$HTML" | grep -q '<script'; then
  echo -e "${GREEN}✓${NC} JavaScript 文件已引用"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}✗${NC} 未找到 JavaScript 引用"
  FAILED=$((FAILED + 1))
fi
echo ""

# 6. 检查 CSS 加载
echo -e "${BLUE}6. 检查 CSS 资源...${NC}"
if echo "$HTML" | grep -q '<link.*stylesheet'; then
  echo -e "${GREEN}✓${NC} CSS 文件已引用"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}✗${NC} 未找到 CSS 引用"
  FAILED=$((FAILED + 1))
fi
echo ""

# 7. 检查 HTTPS
echo -e "${BLUE}7. 检查 HTTPS 配置...${NC}"
if [[ "$DEPLOY_URL" == https://* ]]; then
  echo -e "${GREEN}✓${NC} 使用 HTTPS"
  PASSED=$((PASSED + 1))
else
  echo -e "${YELLOW}⚠${NC} 未使用 HTTPS"
  WARNINGS=$((WARNINGS + 1))
fi
echo ""

# 8. 性能建议
echo -e "${BLUE}8. 性能测试建议...${NC}"
echo "建议使用以下工具进行详细测试:"
echo "  • Google PageSpeed Insights: https://pagespeed.web.dev/"
echo "  • GTmetrix: https://gtmetrix.com/"
echo "  • WebPageTest: https://www.webpagetest.org/"
echo ""
echo "运行 Lighthouse 测试:"
echo "  lighthouse $DEPLOY_URL --view"
echo ""

# 9. SEO 提交建议
echo -e "${BLUE}9. SEO 提交建议...${NC}"
echo "完成以下步骤以提高搜索引擎可见性:"
echo ""
echo "  1. Google Search Console"
echo "     • 访问: https://search.google.com/search-console"
echo "     • 添加网站: $DEPLOY_URL"
echo "     • 提交 sitemap: $DEPLOY_URL/sitemap.xml"
echo ""
echo "  2. Bing Webmaster Tools"
echo "     • 访问: https://www.bing.com/webmasters"
echo "     • 添加网站并提交 sitemap"
echo ""
echo "  3. Google Analytics"
echo "     • 验证 GA 代码是否正常工作"
echo "     • 检查实时报告"
echo ""

# 总结
echo "================================"
echo "验证完成！"
echo ""
echo -e "${GREEN}通过: $PASSED${NC}"
echo -e "${YELLOW}警告: $WARNINGS${NC}"
echo -e "${RED}失败: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  if [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ 所有检查通过！网站已成功部署。${NC}"
    exit 0
  else
    echo -e "${YELLOW}⚠ 部署成功，但有一些警告需要注意。${NC}"
    exit 0
  fi
else
  echo -e "${RED}✗ 发现 $FAILED 个问题，请检查并修复。${NC}"
  exit 1
fi
