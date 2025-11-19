#!/bin/bash

echo "🧪 支付宝支付和会员流程完整测试"
echo "=================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

API_BASE="http://localhost:3001"

echo "步骤 1: 检查配置"
echo "----------------"
CONFIG_RESPONSE=$(curl -s "$API_BASE/api/payment/check-config")
echo "$CONFIG_RESPONSE" | python3 -m json.tool

ALL_READY=$(echo "$CONFIG_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['allReady'])")

if [ "$ALL_READY" = "True" ]; then
    echo -e "${GREEN}✅ 配置检查通过${NC}"
else
    echo -e "${RED}❌ 配置检查失败，请先修复配置${NC}"
    exit 1
fi

echo ""
echo "步骤 2: 创建测试订单"
echo "----------------"

# 创建订单
ORDER_RESPONSE=$(curl -s -X POST "$API_BASE/api/payment/create-order" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-'$(date +%s)'",
    "planType": "pro",
    "testAmount": 0.01
  }')

echo "$ORDER_RESPONSE" | python3 -m json.tool

# 提取订单号
ORDER_NO=$(echo "$ORDER_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['data']['orderNo'] if data.get('success') else '')")

if [ -z "$ORDER_NO" ]; then
    echo -e "${RED}❌ 创建订单失败${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 订单创建成功: $ORDER_NO${NC}"
echo ""

echo "步骤 3: 查询订单状态"
echo "----------------"
QUERY_RESPONSE=$(curl -s "$API_BASE/api/payment/query-order?orderNo=$ORDER_NO")
echo "$QUERY_RESPONSE" | python3 -m json.tool

ORDER_STATUS=$(echo "$QUERY_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['order']['status'] if data.get('success') else '')")

echo -e "${YELLOW}订单状态: $ORDER_STATUS${NC}"
echo ""

echo "步骤 4: 支付指引"
echo "----------------"
echo -e "${YELLOW}⚠️  请手动完成以下步骤：${NC}"
echo ""
echo "1. 打开测试页面："
echo "   file://$(pwd)/xiaohongshu-guide-generator/test-payment-flow.html"
echo ""
echo "2. 或者使用以下命令启动简单服务器："
echo "   cd xiaohongshu-guide-generator && python3 -m http.server 8000"
echo "   然后访问: http://localhost:8000/test-payment-flow.html"
echo ""
echo "3. 在测试页面中："
echo "   - 输入订单号: $ORDER_NO"
echo "   - 点击'查询订单'查看状态"
echo "   - 或创建新订单并完成支付"
echo ""
echo "4. 使用支付宝沙箱账号完成支付"
echo "   - 沙箱账号获取: https://open.alipay.com/develop/sandbox/app"
echo ""
echo "5. 支付完成后，再次运行查询命令："
echo "   curl -s '$API_BASE/api/payment/query-order?orderNo=$ORDER_NO' | python3 -m json.tool"
echo ""

echo "=================================="
echo -e "${GREEN}✅ 测试准备完成！${NC}"
echo ""
echo "📝 测试记录："
echo "   订单号: $ORDER_NO"
echo "   金额: ¥0.01"
echo "   套餐: 专业会员"
echo "   状态: $ORDER_STATUS"
echo ""
