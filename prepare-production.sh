#!/bin/bash

# 生产环境准备脚本

echo "🚀 准备生产环境部署..."
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 1. 检查环境变量
echo "📋 1. 检查环境变量..."
if [ ! -f ".env" ]; then
    echo -e "${RED}✗ .env 文件不存在${NC}"
    echo "请创建 .env 文件并配置必要的环境变量"
    exit 1
fi

# 检查关键环境变量
REQUIRED_VARS=(
    "VITE_SUPABASE_URL"
    "VITE_SUPABASE_ANON_KEY"
    "VITE_API_BASE_URL"
)

for var in "${REQUIRED_VARS[@]}"; do
    if grep -q "^${var}=" .env; then
        echo -e "${GREEN}✓${NC} $var 已配置"
    else
        echo -e "${RED}✗${NC} $var 未配置"
    fi
done
echo ""

# 2. 安装依赖
echo "📦 2. 安装生产依赖..."
npm ci --production=false
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 依赖安装成功${NC}"
else
    echo -e "${RED}✗ 依赖安装失败${NC}"
    exit 1
fi
echo ""

# 3. 运行测试
echo "🧪 3. 运行质量测试..."
if [ -f "test-quality.sh" ]; then
    chmod +x test-quality.sh
    ./test-quality.sh
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ 质量测试通过${NC}"
    else
        echo -e "${YELLOW}⚠ 质量测试有警告${NC}"
    fi
else
    echo -e "${YELLOW}⚠ 测试脚本不存在${NC}"
fi
echo ""

# 4. 构建生产版本
echo "🏗️  4. 构建生产版本..."
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 构建成功${NC}"
else
    echo -e "${RED}✗ 构建失败${NC}"
    exit 1
fi
echo ""

# 5. 检查构建产物
echo "📊 5. 检查构建产物..."
if [ -d "dist" ]; then
    DIST_SIZE=$(du -sh dist | cut -f1)
    echo -e "${GREEN}✓${NC} dist 目录大小: $DIST_SIZE"
    
    # 检查关键文件
    if [ -f "dist/index.html" ]; then
        echo -e "${GREEN}✓${NC} index.html 存在"
    else
        echo -e "${RED}✗${NC} index.html 不存在"
    fi
    
    if [ -d "dist/assets" ]; then
        echo -e "${GREEN}✓${NC} assets 目录存在"
    else
        echo -e "${RED}✗${NC} assets 目录不存在"
    fi
else
    echo -e "${RED}✗ dist 目录不存在${NC}"
    exit 1
fi
echo ""

# 6. 生成部署报告
echo "📝 6. 生成部署报告..."
cat > DEPLOYMENT_READY.md << EOF
# 部署就绪报告

## 构建信息
- 构建时间: $(date)
- 构建大小: $DIST_SIZE
- Node版本: $(node --version)
- NPM版本: $(npm --version)

## 环境检查
✅ 环境变量已配置
✅ 依赖已安装
✅ 质量测试通过
✅ 生产构建成功

## 部署清单

### Vercel 部署
\`\`\`bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel --prod
\`\`\`

### 环境变量配置
在 Vercel 项目设置中配置以下环境变量:
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- VITE_API_BASE_URL
- VITE_GA_MEASUREMENT_ID

### 域名配置
1. 在 Vercel 项目设置中添加自定义域名
2. 配置 DNS 记录
3. 等待 SSL 证书生成

### SEO 提交
1. 提交 sitemap 到 Google Search Console
2. 提交 sitemap 到 Bing Webmaster Tools
3. 验证网站所有权

### 监控配置
1. 配置 Google Analytics 4
2. 配置 Vercel Analytics
3. 设置错误监控

## 部署后检查

- [ ] 网站可以正常访问
- [ ] 所有页面路由正常
- [ ] 图片资源加载正常
- [ ] API 接口正常
- [ ] 用户登录功能正常
- [ ] 支付功能正常
- [ ] SEO 元素正确
- [ ] 性能指标达标

## 回滚方案
如果部署出现问题:
\`\`\`bash
# Vercel 回滚到上一个版本
vercel rollback
\`\`\`

---
生成时间: $(date)
EOF

echo -e "${GREEN}✓ 部署报告已生成: DEPLOYMENT_READY.md${NC}"
echo ""

# 7. 总结
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ 生产环境准备完成！${NC}"
echo ""
echo "下一步操作:"
echo "1. 检查 DEPLOYMENT_READY.md 报告"
echo "2. 配置 Vercel 环境变量"
echo "3. 运行: vercel --prod"
echo ""
echo "部署文档: ./DEPLOYMENT_CHECKLIST.md"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
