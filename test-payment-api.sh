#!/bin/bash

echo "🧪 支付宝 API 直接测试"
echo "======================="
echo ""

API_BASE="http://localhost:3001"

# 颜色
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}1. 检查配置${NC}"
curl -s "$API_BASE/api/payment/check-config" | python3 -m json.tool
echo ""

echo -e "${BLUE}2. 创建测试订单${NC}"
RESPONSE=$(curl -s -X POST "$API_BASE/api/payment-test/test-create-order" \
  -H "Content-Type: application/json" \
  -d '{"amount": "0.01", "subject": "测试订单"}')

echo "$RESPONSE" | python3 -m json.tool
echo ""

# 提取支付表单并保存
ORDER_NO=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('data', {}).get('orderNo', ''))" 2>/dev/null)
PAYMENT_FORM=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('data', {}).get('paymentForm', ''))" 2>/dev/null)

if [ -n "$PAYMENT_FORM" ]; then
    echo -e "${GREEN}✅ 订单创建成功！${NC}"
    echo "订单号: $ORDER_NO"
    echo ""
    
    # 保存支付表单到文件
    echo "$PAYMENT_FORM" > /tmp/alipay-payment-form.html
    echo -e "${YELLOW}支付表单已保存到: /tmp/alipay-payment-form.html${NC}"
    echo ""
    echo -e "${BLUE}3. 打开支付页面${NC}"
    open /tmp/alipay-payment-form.html
    echo "✅ 已在浏览器中打开支付页面"
    echo ""
    echo -e "${YELLOW}请在支付宝沙箱页面完成支付${NC}"
    echo "支付密码通常是: 111111"
    echo ""
    echo "支付完成后，运行以下命令查询订单状态："
    echo -e "${BLUE}curl -s \"$API_BASE/api/payment-test/test-query-order?orderNo=$ORDER_NO\" | python3 -m json.tool${NC}"
else
    echo "❌ 创建订单失败"
fi
