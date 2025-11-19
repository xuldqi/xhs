# 🚀 立即修复"套餐不存在"错误

## 问题确认 ✅

已通过诊断脚本确认：你的 `backend/.env` 使用了错误的 Supabase Key（`anon` key 而不是 `service_role` key）

## 修复方法（选择一种）

### 方法 1: 自动修复（推荐）⚡

运行交互式脚本，按提示操作：

```bash
cd xiaohongshu-guide-generator
./update-service-key.sh
```

脚本会：
1. 检查当前配置
2. 提示你输入新的 service_role key
3. 自动验证 key 类型
4. 备份并更新配置文件

### 方法 2: 手动修复 ✏️

#### 步骤 1: 获取 service_role key

访问：https://app.supabase.com/project/dwgrurfoxqfoeiwjytbb/settings/api

在 "Project API keys" 部分，复制 **service_role** key（不是 anon key）

#### 步骤 2: 更新配置

打开 `backend/.env`，找到这一行：

```bash
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3Z3J1cmZveHFmb2Vpd2p5dGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MDY3MTUsImV4cCI6MjA3ODk4MjcxNX0.mnxt7CxyLCudn8awQfqzqmUKNmXQMlfF8LGwmmxOZpQ
```

替换为你复制的 service_role key。

#### 步骤 3: 保存文件

## 验证修复

### 1. 重启后端

```bash
cd backend
npm run dev
```

### 2. 运行诊断

```bash
./diagnose-payment-error.sh
```

应该看到：
```
✅ SUPABASE_SERVICE_KEY 使用的是 service_role key（正确）
```

### 3. 测试支付

访问：http://localhost:5173/pricing

尝试购买任意套餐，应该不再出现"套餐不存在"错误。

## 如果还需要初始化数据库

如果修复后仍然报错，可能需要初始化 `plan_configs` 表：

1. 访问 Supabase Dashboard: https://app.supabase.com/project/dwgrurfoxqfoeiwjytbb
2. 点击 SQL Editor
3. 运行 `fix-plan-configs.sql` 文件的内容

## 相关文件

- `GET_SERVICE_KEY.md` - 详细的 key 获取指南
- `update-service-key.sh` - 自动更新脚本
- `diagnose-payment-error.sh` - 诊断脚本
- `fix-plan-configs.sql` - 数据库初始化脚本
- `QUICK_FIX.md` - 快速修复指南
- `FIX_PLAN_ERROR.md` - 完整的问题分析

## 需要帮助？

如果问题仍然存在：

1. 查看后端日志输出
2. 运行 `./diagnose-payment-error.sh` 获取详细信息
3. 检查 Supabase Dashboard 中的日志

## 安全提示 ⚠️

- `service_role` key 是敏感信息，不要分享或提交到 Git
- 确保 `.gitignore` 包含 `backend/.env`
- 定期轮换密钥以提高安全性
