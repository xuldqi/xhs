#!/bin/bash

echo "🧪 支付宝支付快速测试（不依赖数据库）"
echo "========================================="
echo ""

API_BASE="http://localhost:3001"

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}步骤 1: 检查配置${NC}"
echo "----------------"
CONFIG_RESPONSE=$(curl -s "$API_BASE/api/payment/check-config")
echo "$CONFIG_RESPONSE" | python3 -m json.tool
echo ""

ALL_READY=$(echo "$CONFIG_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['allReady'])" 2>/dev/null)

if [ "$ALL_READY" = "True" ]; then
    echo -e "${GREEN}✅ 配置检查通过${NC}"
else
    echo -e "${RED}❌ 配置检查失败${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}步骤 2: 创建测试订单（使用测试接口）${NC}"
echo "----------------"

# 使用测试接口创建订单（不依赖数据库）
ORDER_RESPONSE=$(curl -s -X POST "$API_BASE/api/payment-test/test-create-order" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": "0.01",
    "subject": "测试订单 - 专业会员"
  }')

echo "$ORDER_RESPONSE" | python3 -m json.tool
echo ""

# 提取订单号
ORDER_NO=$(echo "$ORDER_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('orderNo', ''))" 2>/dev/null)

if [ -z "$ORDER_NO" ]; then
    echo -e "${RED}❌ 创建订单失败${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 订单创建成功: $ORDER_NO${NC}"
echo ""

echo -e "${BLUE}步骤 3: 查询订单状态（支付宝）${NC}"
echo "----------------"
QUERY_RESPONSE=$(curl -s "$API_BASE/api/payment-test/test-query-order?orderNo=$ORDER_NO")
echo "$QUERY_RESPONSE" | python3 -m json.tool
echo ""

echo "========================================="
echo -e "${GREEN}✅ 基础测试完成！${NC}"
echo ""
echo -e "${YELLOW}📝 下一步：完整支付流程测试${NC}"
echo ""
echo "1. 打开测试页面："
echo -e "   ${BLUE}file://$(pwd)/test-payment-flow.html${NC}"
echo ""
echo "2. 或启动本地服务器："
echo -e "   ${BLUE}python3 -m http.server 8000${NC}"
echo "   然后访问: http://localhost:8000/test-payment-flow.html"
echo ""
echo "3. 在测试页面中："
echo "   - 点击'检查配置'确认环境正常"
echo "   - 创建新订单并跳转到支付宝"
echo "   - 使用沙箱账号完成支付"
echo "   - 查询订单状态验证支付结果"
echo ""
echo "4. 获取支付宝沙箱账号："
echo -e "   ${BLUE}https://open.alipay.com/develop/sandbox/app${NC}"
echo ""
