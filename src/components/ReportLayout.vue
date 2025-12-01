<template>
  <div class="report-layout">
    <!-- 报告封面 -->
    <header class="report-cover">
      <div class="cover-pattern"></div>
      <div class="cover-content">
        <div class="brand-mark">
          <span class="brand-icon">📊</span>
          <span class="brand-text">小红书增长报告</span>
        </div>
        <h1 class="report-title">{{ accountName }}</h1>
        <p class="report-subtitle">涨粉实操指南</p>
        <div class="report-meta">
          <div class="meta-item">
            <span class="meta-icon">📅</span>
            <span>{{ generatedDate }}</span>
          </div>
          <div class="meta-divider"></div>
          <div class="meta-item">
            <span class="meta-icon">🎯</span>
            <span>目标 {{ targetFollowers }}</span>
          </div>
          <div class="meta-divider"></div>
          <div class="meta-item">
            <span class="meta-icon">📚</span>
            <span>共 {{ totalSections }} 章节</span>
          </div>
        </div>
      </div>
    </header>

    <!-- 账号概览卡片 -->
    <section class="overview-section">
      <div class="overview-grid">
        <div class="overview-card highlight">
          <div class="card-icon">👤</div>
          <div class="card-content">
            <div class="card-value">{{ currentFollowers }}</div>
            <div class="card-label">当前粉丝</div>
          </div>
        </div>
        <div class="overview-card">
          <div class="card-icon">📝</div>
          <div class="card-content">
            <div class="card-value">{{ totalNotes }}</div>
            <div class="card-label">笔记数量</div>
          </div>
        </div>
        <div class="overview-card">
          <div class="card-icon">📈</div>
          <div class="card-content">
            <div class="card-value">{{ growthPotential }}</div>
            <div class="card-label">增长潜力</div>
          </div>
        </div>
        <div class="overview-card">
          <div class="card-icon">🏷️</div>
          <div class="card-content">
            <div class="card-value">{{ category }}</div>
            <div class="card-label">内容领域</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 目录导航 -->
    <nav class="toc-section">
      <h2 class="toc-title">
        <span class="toc-icon">📋</span>
        章节目录
      </h2>
      <div class="toc-grid">
        <div 
          v-for="(section, index) in sections" 
          :key="section.id"
          class="toc-item"
          :class="{ 'active': activeSection === section.id }"
          @click="scrollToSection(section.id)"
        >
          <span class="toc-number">{{ String(index + 1).padStart(2, '0') }}</span>
          <span class="toc-name">{{ section.title }}</span>
        </div>
      </div>
    </nav>

    <!-- 章节内容 -->
    <main class="sections-main">
      <article 
        v-for="(section, index) in sections" 
        :key="section.id"
        :id="`section-${section.id}`"
        class="section-article"
      >
        <div class="section-header">
          <div class="section-number-badge">{{ String(index + 1).padStart(2, '0') }}</div>
          <h2 class="section-title">{{ section.title }}</h2>
        </div>
        <div class="section-body" v-html="formatContent(section.content)"></div>
      </article>
    </main>

    <!-- 页脚 -->
    <footer class="report-footer">
      <div class="footer-brand">
        <span>📊</span> 小红书流量学院
      </div>
      <div class="footer-text">
        本报告由 AI 智能分析生成，仅供参考
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  accountName: string
  generatedDate: string
  targetFollowers: string
  currentFollowers: string
  totalNotes: string
  category: string
  sections: Array<{ id: number; title: string; content: string }>
}>()

const emit = defineEmits(['section-change'])

const activeSection = ref(1)
const totalSections = computed(() => props.sections.length)
const growthPotential = computed(() => {
  const followers = parseInt(props.currentFollowers) || 0
  if (followers < 1000) return '高'
  if (followers < 10000) return '中高'
  if (followers < 100000) return '中'
  return '稳定'
})

const scrollToSection = (id: number) => {
  activeSection.value = id
  const element = document.getElementById(`section-${id}`)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  emit('section-change', id)
}

const formatContent = (content: string) => {
  if (!content) return ''
  
  let html = content
    // 处理emoji开头的标题行
    .replace(/^([🎯📊💡✅📝🔥⚡💰📈🎨📅🏆💎🚀✨🎉📌⭐🔑💪🎓📱💻🎬📸🎵🎤🎭🎪🎨🖼️📷🎥🎮🎯🏅🥇🥈🥉🏆🎖️🏵️🎗️🎫🎟️🎪🎭🎨🖼️📷🎥🎬📹📼📺📻🎙️🎚️🎛️📱💻🖥️🖨️⌨️🖱️🖲️💾💿📀🎞️📽️📠📟📡🔌🔋💡🔦🕯️🧯🛢️💵💴💶💷💰💳💎⚖️🔧🔨⛏️⚒️🛠️⚙️🔩⚗️🧪🧫🧬🔬🔭📡💉💊🏥🏨🏩🏪🏫🏬🏭🏯🏰💒🗼🗽⛪🕌🕍⛩️🕋⛲⛺🌁🌃🏙️🌄🌅🌆🌇🌉🎠🎡🎢🚂🚃🚄🚅🚆🚇🚈🚉🚊🚝🚞🚋🚌🚍🚎🚐🚑🚒🚓🚔🚕🚖🚗🚘🚚🚛🚜🛴🚲🛵🏍️🚨🚥🚦🚧⚓⛵🚤🛳️⛴️🛥️🚢✈️🛩️🛫🛬💺🚁🚟🚠🚡🚀🛸🛶⚓🚧🚏⛽🚨🚥🚦🚧⛽🛤️🛣️]).+$/gm, '<h3 class="content-heading">$&</h3>')
    // 处理列表项
    .replace(/^[-•]\s*(.+)$/gm, '<li>$1</li>')
    // 处理数字列表
    .replace(/^\d+[.、]\s*(.+)$/gm, '<li class="numbered">$1</li>')
    // 包装列表
    .replace(/(<li.*<\/li>\n?)+/g, '<ul class="content-list">$&</ul>')
    // 处理粗体
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // 处理段落
    .replace(/\n\n/g, '</p><p class="content-para">')
    // 处理换行
    .replace(/\n/g, '<br>')
  
  return `<p class="content-para">${html}</p>`
}
</script>

<style scoped>
/* 变量定义 */
.report-layout {
  --primary: #1a1a2e;
  --primary-light: #16213e;
  --accent: #e94560;
  --accent-light: #ff6b6b;
  --gold: #f4a261;
  --bg: #0f0f23;
  --bg-card: #1a1a2e;
  --bg-surface: #16213e;
  --text: #edf2f4;
  --text-muted: #8d99ae;
  --border: rgba(255, 255, 255, 0.08);
  
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  line-height: 1.6;
}

/* 封面 */
.report-cover {
  position: relative;
  padding: 80px 40px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--bg) 100%);
  overflow: hidden;
}

.cover-pattern {
  position: absolute;
  inset: 0;
  background-image: 
    radial-gradient(circle at 20% 80%, rgba(233, 69, 96, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(244, 162, 97, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.cover-content {
  position: relative;
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.brand-mark {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border);
  border-radius: 100px;
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 32px;
}

.brand-icon {
  font-size: 1.1rem;
}

.report-title {
  font-size: 3.5rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  margin: 0 0 12px;
  background: linear-gradient(135deg, #fff 0%, var(--text-muted) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.report-subtitle {
  font-size: 1.5rem;
  color: var(--accent);
  font-weight: 500;
  margin: 0 0 40px;
}

.report-meta {
  display: inline-flex;
  align-items: center;
  gap: 24px;
  padding: 16px 32px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border);
  border-radius: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: var(--text-muted);
}

.meta-icon {
  font-size: 1.1rem;
}

.meta-divider {
  width: 1px;
  height: 20px;
  background: var(--border);
}

/* 概览卡片 */
.overview-section {
  padding: 60px 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.overview-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
}

.overview-card:hover {
  transform: translateY(-4px);
  border-color: rgba(233, 69, 96, 0.3);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.overview-card.highlight {
  background: linear-gradient(135deg, var(--accent) 0%, #c53678 100%);
  border: none;
}

.overview-card.highlight .card-label {
  color: rgba(255, 255, 255, 0.8);
}

.card-icon {
  font-size: 2rem;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}

.overview-card.highlight .card-icon {
  background: rgba(255, 255, 255, 0.2);
}

.card-content {
  flex: 1;
}

.card-value {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 4px;
}

.card-label {
  font-size: 0.85rem;
  color: var(--text-muted);
}

/* 目录 */
.toc-section {
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.toc-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 24px;
  color: var(--text);
}

.toc-icon {
  font-size: 1.3rem;
}

.toc-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

.toc-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toc-item:hover {
  background: var(--bg-surface);
  border-color: var(--accent);
}

.toc-item.active {
  background: linear-gradient(135deg, rgba(233, 69, 96, 0.15) 0%, rgba(233, 69, 96, 0.05) 100%);
  border-color: var(--accent);
}

.toc-number {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--accent);
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.toc-name {
  flex: 1;
  font-size: 0.9rem;
  color: var(--text-muted);
}

.toc-item:hover .toc-name,
.toc-item.active .toc-name {
  color: var(--text);
}

/* 章节内容 */
.sections-main {
  padding: 40px;
  max-width: 900px;
  margin: 0 auto;
}

.section-article {
  margin-bottom: 60px;
  padding: 40px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 20px;
  transition: all 0.3s ease;
}

.section-article:hover {
  border-color: rgba(233, 69, 96, 0.2);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border);
}

.section-number-badge {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 100%);
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.section-title {
  flex: 1;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  color: var(--text);
}

/* 内容样式 */
.section-body {
  color: var(--text-muted);
  font-size: 1rem;
  line-height: 1.8;
}

.section-body :deep(.content-heading) {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text);
  margin: 28px 0 16px;
  padding-left: 12px;
  border-left: 3px solid var(--accent);
}

.section-body :deep(.content-para) {
  margin: 16px 0;
}

.section-body :deep(.content-list) {
  margin: 16px 0;
  padding-left: 0;
  list-style: none;
}

.section-body :deep(.content-list li) {
  position: relative;
  padding: 12px 16px 12px 32px;
  margin: 8px 0;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  border-left: 2px solid var(--accent);
}

.section-body :deep(.content-list li::before) {
  content: '→';
  position: absolute;
  left: 12px;
  color: var(--accent);
  font-weight: 600;
}

.section-body :deep(strong) {
  color: var(--gold);
  font-weight: 600;
}

/* 页脚 */
.report-footer {
  padding: 40px;
  text-align: center;
  border-top: 1px solid var(--border);
}

.footer-brand {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 8px;
}

.footer-text {
  font-size: 0.85rem;
  color: var(--text-muted);
}

/* 响应式 */
@media (max-width: 1024px) {
  .overview-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .report-cover {
    padding: 60px 20px;
  }
  
  .report-title {
    font-size: 2.5rem;
  }
  
  .report-subtitle {
    font-size: 1.2rem;
  }
  
  .report-meta {
    flex-direction: column;
    gap: 12px;
    padding: 20px;
  }
  
  .meta-divider {
    width: 40px;
    height: 1px;
  }
  
  .overview-section,
  .toc-section,
  .sections-main {
    padding: 24px 16px;
  }
  
  .overview-grid {
    grid-template-columns: 1fr;
  }
  
  .toc-grid {
    grid-template-columns: 1fr;
  }
  
  .section-article {
    padding: 24px;
    border-radius: 16px;
  }
  
  .section-title {
    font-size: 1.25rem;
  }
}

/* 打印优化 */
@media print {
  .report-layout {
    background: white;
    color: #1a1a1a;
  }
  
  .report-cover {
    background: white;
    border-bottom: 2px solid #e94560;
  }
  
  .section-article {
    break-inside: avoid;
    box-shadow: none;
    border: 1px solid #e0e0e0;
  }
}
</style>


