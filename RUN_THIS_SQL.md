# 🎯 运行这个 SQL 文件

## 步骤

### 1. 打开 Supabase SQL Editor
```
https://app.supabase.com/project/dwgrurfoxqfoeiwjytbb/sql/new
```

### 2. 打开 SQL 文件
在你的编辑器中打开：
```
init-database-complete.sql
```

### 3. 复制所有内容
复制文件中的**所有 SQL 代码**（从第一行到最后一行）

### 4. 粘贴到 Supabase
将复制的 SQL 代码粘贴到 Supabase SQL Editor 中

### 5. 点击 Run
点击右下角的 **Run** 按钮

### 6. 验证结果
你应该看到类似这样的输出：
```
table_name              | count
------------------------|------
plan_configs            | 4
order_policies          | 3
subscription_policies   | 3
```

## 完成！

现在访问：http://localhost:5174/pricing

尝试购买套餐，应该可以正常工作了！

## 如果还有问题

查看后端日志或运行：
```bash
./diagnose-payment-error.sh
```
