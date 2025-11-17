# 背景图设置指南

## 📸 添加纹理背景图

### 方法 1：使用本地图片（推荐）

1. **保存图片**
   - 将纹理图片保存到 `public/` 目录
   - 命名为 `texture-bg.jpg` 或 `texture-bg.png`

2. **更新 CSS**
   
   在 `src/views/AnalysisView.vue` 中修改样式：
   
   ```css
   .analysis-view {
     min-height: 100vh;
     display: flex;
     align-items: center;
     justify-content: center;
     padding: 20px;
     background: #f5f5f0 url('/texture-bg.jpg') center/cover;
   }
   ```

### 方法 2：使用 CSS 模拟纹理（当前方案）

当前使用了 CSS 渐变来模拟石材纹理效果：

```css
.analysis-view {
  background: #f5f5f0;
  background-image: 
    radial-gradient(circle at 20% 50%, rgba(210, 200, 190, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(200, 190, 180, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 40% 20%, rgba(220, 210, 200, 0.2) 0%, transparent 50%);
}
```

### 方法 3：使用在线图片

```css
.analysis-view {
  background: url('https://example.com/texture.jpg') center/cover;
}
```

## 🎨 其他页面也可以添加背景

### GuideView（指南页面）

```css
.guide-view {
  background: #f5f5f0 url('/texture-bg.jpg') center/cover;
}
```

### HomeView（首页）

```css
.home-view {
  background: #f5f5f0 url('/texture-bg.jpg') center/cover;
}
```

## 💡 优化建议

1. **图片优化**
   - 压缩图片大小（建议 < 500KB）
   - 使用 WebP 格式以获得更好的性能
   - 设置合适的分辨率（1920x1080 足够）

2. **性能优化**
   ```css
   .analysis-view {
     background: #f5f5f0 url('/texture-bg.jpg') center/cover no-repeat fixed;
     background-size: cover;
   }
   ```

3. **响应式设计**
   ```css
   @media (max-width: 768px) {
     .analysis-view {
       background-size: auto 100%;
     }
   }
   ```

## 📝 当前效果

目前使用 CSS 渐变模拟了米白色石材纹理，效果类似但更轻量。如果需要更真实的纹理效果，建议使用方法 1 添加真实图片。
