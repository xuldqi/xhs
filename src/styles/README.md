# 设计系统文档

## 概述

本设计系统基于首页 UI 视觉优化需求文档，提供统一的设计令牌、组件样式和响应式布局规则，确保视觉一致性和可维护性。

## 文件结构

```
src/styles/
├── design-tokens.css    # 设计令牌（颜色、字体、间距等）
├── components.css       # 组件样式规范
├── responsive.css       # 响应式布局系统
└── README.md           # 本文档
```

## 设计令牌

### 颜色系统

**主色（限制为 2 种）**
- `--color-primary-500`: #667EEA（主色基准）
- `--color-secondary-500`: #764BA2（次色基准）

**辅助色（限制为 3 种）**
- `--color-success`: #10B981
- `--color-warning`: #F59E0B
- `--color-error`: #EF4444

**中性色**
- `--color-gray-50` 到 `--color-gray-900`
- `--color-white`, `--color-black`

### 字体系统

**字体家族**
- `--font-sans`: Inter 等西文字体
- `--font-sans-zh`: Noto Sans SC 等中文字体

**字号（符合设计规范）**
- `--font-base`: 1rem (16px) - 正文最小字号
- `--font-lg`: 1.125rem (18px) - 副标题最小字号
- `--font-2xl`: 1.5rem (24px) - 标题最小字号
- `--font-5xl`: 3rem (48px) - 首屏标题桌面端
- `--mobile-title-size`: 2rem (32px) - 首屏标题移动端

**字重**
- `--font-semibold`: 600 - 标题最小字重
- `--font-bold`: 700

**行高**
- `--leading-relaxed`: 1.6 - 正文最小行高

### 间距系统（4px 基准）

- `--spacing-3`: 0.75rem (12px) - 按钮/表单元素最小间距
- `--spacing-4`: 1rem (16px) - 段落最小间距
- `--spacing-5`: 1.25rem (20px) - 移动端容器最小留白
- `--spacing-6`: 1.5rem (24px) - 卡片最小内边距
- `--spacing-10`: 2.5rem (40px) - 桌面端容器最小留白
- `--spacing-15`: 3.75rem (60px) - 区块最小间距

### 圆角系统（统一使用 8px、12px、16px）

- `--radius-base`: 0.5rem (8px) - 标准圆角
- `--radius-md`: 0.75rem (12px) - 中等圆角
- `--radius-lg`: 1rem (16px) - 大圆角

### 阴影系统（3 级层次）

- `--shadow-sm`: 轻微阴影
- `--shadow-base`: 标准阴影
- `--shadow-md`: 中等阴影

## 组件样式

### 按钮

**基础按钮**
```html
<button class="btn btn-primary">主按钮</button>
<button class="btn btn-secondary">次按钮</button>
<button class="btn btn-text">文字按钮</button>
```

**按钮尺寸**
```html
<button class="btn btn-primary btn-large">大按钮 (56px)</button>
<button class="btn btn-primary">标准按钮 (48px)</button>
<button class="btn btn-primary btn-small">小按钮 (40px)</button>
```

**设计规范**
- 主按钮内边距：12px 上下、24px 左右
- 字号：16px
- 字重：600
- 最小高度：48px（移动端）、56px（首屏 CTA）

### 卡片

**基础卡片**
```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">卡片标题</h3>
    <p class="card-description">卡片描述</p>
  </div>
  <div class="card-body">
    卡片内容
  </div>
  <div class="card-footer">
    卡片底部
  </div>
</div>
```

**设计规范**
- 内边距：24px（桌面端）、20px（移动端）
- 圆角：12px
- 阴影：标准阴影，悬停时加深
- 悬停效果：向上移动 4px

### 排版

**标题**
```html
<h1 class="heading-1">一级标题 (48px/32px)</h1>
<h2 class="heading-2">二级标题 (36px/24px)</h2>
<h3 class="heading-3">三级标题 (24px/20px)</h3>
<h4 class="heading-4">四级标题 (18px/16px)</h4>
```

**正文**
```html
<p class="body-text">正文内容 (16px, 行高 1.6)</p>
<p class="body-text-secondary">次要正文</p>
<p class="caption">说明文字 (14px)</p>
```

**设计规范**
- 标题字重：>= 600
- 正文字号：>= 16px
- 正文行高：>= 1.6
- 段落间距：>= 16px
- 行长度限制：50-75 字符

## 响应式布局

### 断点

- 移动端：< 768px
- 平板：768-1023px
- 桌面端：>= 1024px

### 容器

```html
<div class="container">
  <!-- 内容 -->
</div>
```

**设计规范**
- 最大宽度：1200px
- 移动端留白：>= 20px
- 桌面端留白：>= 40px

### 网格系统

```html
<div class="grid grid-cols-3">
  <div>列 1</div>
  <div>列 2</div>
  <div>列 3</div>
</div>
```

**响应式行为**
- 移动端：自动调整为单列
- 平板：2 列
- 桌面端：3-4 列

### Flexbox

```html
<div class="flex items-center justify-between gap-4">
  <div>项目 1</div>
  <div>项目 2</div>
</div>
```

## 工具类

### 间距

```html
<div class="mt-15">区块间距 (60px)</div>
<div class="mb-4">段落间距 (16px)</div>
<div class="p-6">卡片内边距 (24px)</div>
```

### 圆角

```html
<div class="rounded-base">8px 圆角</div>
<div class="rounded-md">12px 圆角</div>
<div class="rounded-lg">16px 圆角</div>
```

### 阴影

```html
<div class="shadow-base">标准阴影</div>
<div class="shadow-md">中等阴影</div>
```

### 悬停效果

```html
<div class="hover-lift">悬停上移</div>
<div class="hover-scale">悬停放大</div>
```

## 使用示例

### 功能卡片

```html
<div class="card hover-lift">
  <div class="icon icon-xl mb-4">📊</div>
  <h3 class="heading-3 mb-3">功能标题</h3>
  <p class="body-text-secondary">
    功能描述不超过 50 个字
  </p>
</div>
```

### 首屏 Hero Section

```html
<section class="container text-center py-15">
  <h1 class="heading-1 mb-6">
    核心价值主张不超过 30 字
  </h1>
  <p class="body-text-secondary mb-8">
    副标题描述
  </p>
  <button class="btn btn-primary btn-large">
    开始使用
  </button>
</section>
```

### 成功案例卡片

```html
<div class="card">
  <div class="flex items-center gap-4 mb-6">
    <div class="icon icon-xl rounded-full">👩</div>
    <div>
      <h4 class="heading-4">用户名称</h4>
      <p class="caption">用户类别</p>
    </div>
  </div>
  <p class="body-text mb-4">
    用户评价不超过 100 个字
  </p>
  <div class="flex gap-2">
    <span class="badge badge-success">✓ 成就 1</span>
    <span class="badge badge-success">✓ 成就 2</span>
  </div>
</div>
```

## 设计原则

### 视觉一致性

1. **颜色限制**：主色不超过 2 种，辅助色不超过 3 种
2. **圆角统一**：使用 8px、12px、16px
3. **阴影层级**：不超过 3 种
4. **字体一致**：标题使用统一字体和字重

### 可读性

1. **文字对比度**：>= 4.5:1（WCAG AA 标准）
2. **正文行高**：>= 1.6
3. **段落行长**：50-75 字符
4. **标题字号**：>= 24px

### 简洁性

1. **首屏标题**：<= 30 字
2. **功能描述**：<= 50 字
3. **用户评价**：<= 100 字
4. **FAQ 回答**：<= 150 字

### 响应式

1. **移动端文字**：>= 16px
2. **移动端按钮**：>= 48px 高
3. **移动端布局**：单列
4. **图片响应式**：自适应宽度

## 可访问性

### 颜色对比度

所有文字与背景的对比度必须 >= 4.5:1，符合 WCAG AA 标准。

### 键盘导航

所有交互元素支持键盘导航，焦点状态清晰可见。

### 触摸目标

移动端按钮最小高度 48px，确保易于点击。

## 维护指南

### 添加新颜色

1. 在 `design-tokens.css` 中定义
2. 确保不超过主色 2 种、辅助色 3 种的限制
3. 检查对比度是否符合可访问性标准

### 添加新组件

1. 在 `components.css` 中定义
2. 使用设计令牌而非硬编码值
3. 确保响应式适配
4. 添加悬停和焦点状态

### 修改间距

1. 使用 4px 基准的间距刻度
2. 确保符合最小间距要求
3. 更新 `design-tokens.css` 和 `responsive.css`

## 测试清单

- [ ] 颜色对比度 >= 4.5:1
- [ ] 标题字重 >= 600
- [ ] 正文字号 >= 16px
- [ ] 正文行高 >= 1.6
- [ ] 段落间距 >= 16px
- [ ] 卡片内边距 >= 24px（桌面）/ 20px（移动）
- [ ] 区块间距 >= 60px
- [ ] 移动端按钮 >= 48px 高
- [ ] 圆角使用 8px/12px/16px
- [ ] 阴影不超过 3 种层级
- [ ] 移动端单列布局
- [ ] 图片自适应宽度
