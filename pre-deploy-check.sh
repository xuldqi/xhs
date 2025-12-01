#!/bin/bash

# 部署前检查脚本
# 确保所有必要的配置和文件都已准备好

echo "🚀 开始部署前检查..."
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查计数
ERRORS=0
WARNINGS=0

# 1. 检查必要的文件
echo "📁 检查必要文件..."
FILES=(
  ".env.production"
  "vercel.json"
  "package.json"
  "vite.config.ts"
  "public/sitemap.xml"
  "public/robots.txt"
  "public/manifest.json"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo -e "${GREEN}✓${NC} $file 存在"
  else
    echo -e "${RED}✗${NC} $file 缺失"
    ERRORS=$((ERRORS + 1))
  fi
done
echo ""

# 2. 检查环境变量
echo "🔧 检查环境变量配置..."
if [ -f ".env.production" ]; then
  REQUIRED_VARS=(
    "VITE_SUPABASE_URL"
    "VITE_SUPABASE_ANON_KEY"
    "VITE_GA_MEASUREMENT_ID"
  )
  
  for var in "${REQUIRED_VARS[@]}"; do
    if grep -q "^$var=" .env.production; then
      value=$(grep "^$var=" .env.production | cut -d '=' -f2)
      if [ -n "$value" ] && [ "$value" != "你的" ] && [ "$value" != "YOUR_" ]; then
        echo -e "${GREEN}✓${NC} $var 已配置"
      else
        echo -e "${YELLOW}⚠${NC} $var 需要配置实际值"
        WARNINGS=$((WARNINGS + 1))
      fi
    else
      echo -e "${RED}✗${NC} $var 未找到"
      ERRORS=$((ERRORS + 1))
    fi
  done
fi
echo ""

# 3. 检查依赖
echo "📦 检查依赖..."
if [ -d "node_modules" ]; then
  echo -e "${GREEN}✓${NC} node_modules 存在"
else
  echo -e "${YELLOW}⚠${NC} node_modules 不存在，需要运行 npm install"
  WARNINGS=$((WARNINGS + 1))
fi
echo ""

# 4. 检查构建
echo "🔨 检查构建配置..."
if grep -q '"build":' package.json; then
  echo -e "${GREEN}✓${NC} build 脚本已配置"
else
  echo -e "${RED}✗${NC} build 脚本未配置"
  ERRORS=$((ERRORS + 1))
fi
echo ""

# 5. 检查 SEO 文件
echo "🔍 检查 SEO 配置..."
SEO_FILES=(
  "public/sitemap.xml"
  "public/robots.txt"
)

for file in "${SEO_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo -e "${GREEN}✓${NC} $file 存在"
  else
    echo -e "${YELLOW}⚠${NC} $file 缺失（建议添加）"
    WARNINGS=$((WARNINGS + 1))
  fi
done
echo ""

# 6. 检查 TypeScript
echo "📝 检查 TypeScript 配置..."
if [ -f "tsconfig.json" ]; then
  echo -e "${GREEN}✓${NC} tsconfig.json 存在"
else
  echo -e "${YELLOW}⚠${NC} tsconfig.json 缺失"
  WARNINGS=$((WARNINGS + 1))
fi
echo ""

# 7. 测试构建
echo "🧪 测试构建..."
echo "运行: npm run build"
if npm run build > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC} 构建成功"
  
  # 检查构建产物
  if [ -d "dist" ]; then
    echo -e "${GREEN}✓${NC} dist 目录已生成"
    
    # 检查关键文件
    if [ -f "dist/index.html" ]; then
      echo -e "${GREEN}✓${NC} index.html 已生成"
    else
      echo -e "${RED}✗${NC} index.html 未生成"
      ERRORS=$((ERRORS + 1))
    fi
  else
    echo -e "${RED}✗${NC} dist 目录未生成"
    ERRORS=$((ERRORS + 1))
  fi
else
  echo -e "${RED}✗${NC} 构建失败"
  ERRORS=$((ERRORS + 1))
fi
echo ""

# 总结
echo "================================"
echo "检查完成！"
echo ""
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo -e "${GREEN}✓ 所有检查通过！可以部署。${NC}"
  exit 0
elif [ $ERRORS -eq 0 ]; then
  echo -e "${YELLOW}⚠ 发现 $WARNINGS 个警告，建议修复后再部署。${NC}"
  exit 0
else
  echo -e "${RED}✗ 发现 $ERRORS 个错误和 $WARNINGS 个警告，请修复后再部署。${NC}"
  exit 1
fi
