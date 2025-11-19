# 🗄️ 初始化数据库套餐配置

## 当前状态

✅ Supabase Service Key 已更新（正确）
⚠️ 需要初始化 `plan_configs` 表数据

## 快速初始化（2分钟）

### 步骤 1: 访问 Supabase SQL Editor

打开浏览器，访问：
```
https://app.supabase.com/project/dwgrurfoxqfoeiwjytbb/sql/new
```

### 步骤 2: 复制并运行 SQL

复制下面的 SQL 代码，粘贴到 SQL Editor 中，然后点击 **Run**：

```sql
-- 创建 plan_configs 表（如果不存在）
CREATE TABLE IF NOT EXISTS public.plan_configs (
  plan_type TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  duration_days INTEGER,
  daily_generate_limit INTEGER NOT NULL,
  daily_export_limit INTEGER NOT NULL,
  history_limit INTEGER NOT NULL,
  priority BOOLEAN DEFAULT FALSE,
  features JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 插入套餐配置数据
INSERT INTO public.plan_configs (plan_type, name, price, duration_days, daily_generate_limit, daily_export_limit, history_limit, priority, features) VALUES
  ('free', '免费体验', 0, NULL, 1, 1, 3, FALSE, '{"customTemplate": false, "earlyAccess": false}'::jsonb),
  ('basic', '基础会员', 29.9, 30, 10, 999, 50, FALSE, '{"customTemplate": false, "earlyAccess": false}'::jsonb),
  ('pro', '专业会员', 99, 30, 999, 999, 999, TRUE, '{"customTemplate": true, "earlyAccess": false}'::jsonb),
  ('lifetime', '终身会员', 299, NULL, 999, 999, 999, TRUE, '{"customTemplate": true, "earlyAccess": true}'::jsonb)
ON CONFLICT (plan_type) 
DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  duration_days = EXCLUDED.duration_days,
  daily_generate_limit = EXCLUDED.daily_generate_limit,
  daily_export_limit = EXCLUDED.daily_export_limit,
  history_limit = EXCLUDED.history_limit,
  priority = EXCLUDED.priority,
  features = EXCLUDED.features;

-- 启用 RLS
ALTER TABLE public.plan_configs ENABLE ROW LEVEL SECURITY;

-- 删除旧策略（如果存在）
DROP POLICY IF EXISTS "所有人可以查看套餐配置" ON public.plan_configs;

-- 创建新策略：所有人可以查看套餐配置
CREATE POLICY "所有人可以查看套餐配置" ON public.plan_configs
  FOR SELECT USING (TRUE);

-- 验证数据
SELECT plan_type, name, price, duration_days FROM public.plan_configs ORDER BY price;
```

### 步骤 3: 验证结果

运行成功后，你应该看到 4 条记录：

| plan_type | name     | price | duration_days |
|-----------|----------|-------|---------------|
| free      | 免费体验 | 0.00  | NULL          |
| basic     | 基础会员 | 29.90 | 30            |
| pro       | 专业会员 | 99.00 | 30            |
| lifetime  | 终身会员 | 299.00| NULL          |

### 步骤 4: 测试支付功能

访问：http://localhost:5173/pricing

尝试购买任意套餐，应该可以正常工作了！

## 或者使用完整的 SQL 文件

如果你想使用完整的数据库架构，可以运行：

```
fix-plan-configs.sql
```

这个文件包含了更详细的配置和验证。

## 验证修复

运行测试脚本：
```bash
./test-plan-configs.sh
```

应该看到：
```
✅ 套餐配置正常！
```

## 完成！

现在你的支付系统应该完全正常工作了：
- ✅ Supabase Service Key 已更新
- ✅ plan_configs 表已初始化
- ✅ 可以正常创建订单和支付
