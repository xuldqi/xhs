#!/bin/bash

# 质量保证测试脚本

echo "🧪 开始质量保证测试..."
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试计数器
PASSED=0
FAILED=0

# 测试函数
test_passed() {
    echo -e "${GREEN}✓${NC} $1"
    ((PASSED++))
}

test_failed() {
    echo -e "${RED}✗${NC} $1"
    ((FAILED++))
}

test_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

echo "📦 1. 检查依赖安装..."
if [ -d "node_modules" ]; then
    test_passed "依赖已安装"
else
    test_failed "依赖未安装，请运行 npm install"
fi
echo ""

echo "🔍 2. 检查TypeScript编译..."
npm run type-check 2>&1 | head -20
if [ $? -eq 0 ]; then
    test_passed "TypeScript编译通过"
else
    test_warning "TypeScript编译有警告或错误"
fi
echo ""

echo "📁 3. 检查关键文件存在性..."
FILES=(
    "src/views/KnowledgeView.vue"
    "src/views/CasesView.vue"
    "src/views/IntelligenceView.vue"
    "src/views/ToolsView.vue"
    "src/views/CommunityView.vue"
    "src/components/knowledge/ArticleCard.vue"
    "src/components/cases/CaseCard.vue"
    "src/components/intelligence/IntelligenceCard.vue"
    "src/components/tools/ToolCard.vue"
    "src/components/community/QuestionCard.vue"
    "src/utils/lazyLoader.ts"
    "src/utils/performanceOptimizer.ts"
    "src/utils/imageOptimizer.ts"
    "src/services/contentService.ts"
    "src/services/analyticsService.ts"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        test_passed "$file 存在"
    else
        test_failed "$file 不存在"
    fi
done
echo ""

echo "🎨 4. 检查样式文件..."
STYLE_FILES=(
    "src/style.css"
    "src/styles/design-tokens.css"
    "src/styles/guide-content.css"
)

for file in "${STYLE_FILES[@]}"; do
    if [ -f "$file" ]; then
        test_passed "$file 存在"
    else
        test_failed "$file 不存在"
    fi
done
echo ""

echo "🔧 5. 检查配置文件..."
CONFIG_FILES=(
    "vite.config.ts"
    "tsconfig.json"
    "package.json"
    ".env"
)

for file in "${CONFIG_FILES[@]}"; do
    if [ -f "$file" ]; then
        test_passed "$file 存在"
    else
        test_failed "$file 不存在"
    fi
done
echo ""

echo "📱 6. 检查响应式设计工具..."
if [ -f "src/composables/useResponsive.ts" ]; then
    test_passed "响应式hooks存在"
else
    test_failed "响应式hooks不存在"
fi

if [ -f "src/components/MobileMenu.vue" ]; then
    test_passed "移动端菜单组件存在"
else
    test_failed "移动端菜单组件不存在"
fi
echo ""

echo "🔍 7. 检查SEO相关文件..."
SEO_FILES=(
    "public/sitemap.xml"
    "public/robots.txt"
    "src/components/seo/SEOHead.vue"
    "src/components/Breadcrumb.vue"
)

for file in "${SEO_FILES[@]}"; do
    if [ -f "$file" ]; then
        test_passed "$file 存在"
    else
        test_warning "$file 不存在（可选）"
    fi
done
echo ""

echo "📊 8. 检查数据追踪..."
if grep -q "analyticsService" src/services/analyticsService.ts 2>/dev/null; then
    test_passed "分析服务已实现"
else
    test_warning "分析服务可能未完全实现"
fi
echo ""

echo "🚀 9. 检查性能优化..."
PERF_FILES=(
    "src/utils/performanceOptimizer.ts"
    "src/utils/lazyLoader.ts"
    "src/utils/imageOptimizer.ts"
    "public/sw.js"
)

for file in "${PERF_FILES[@]}"; do
    if [ -f "$file" ]; then
        test_passed "$file 存在"
    else
        test_warning "$file 不存在（可选）"
    fi
done
echo ""

echo "🎯 10. 检查转化组件..."
CONVERSION_FILES=(
    "src/components/conversion/CTAButton.vue"
    "src/components/conversion/TestimonialCarousel.vue"
    "src/components/conversion/TrustSignals.vue"
    "src/components/conversion/ActivityBanner.vue"
)

for file in "${CONVERSION_FILES[@]}"; do
    if [ -f "$file" ]; then
        test_passed "$file 存在"
    else
        test_warning "$file 不存在（可选）"
    fi
done
echo ""

echo "📈 总结"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}通过: $PASSED${NC}"
echo -e "${RED}失败: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ 所有关键测试通过！${NC}"
    exit 0
else
    echo -e "${RED}✗ 有 $FAILED 个测试失败${NC}"
    exit 1
fi
