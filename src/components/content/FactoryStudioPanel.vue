<template>
  <section class="studio-panel">
    <div class="studio-head">
      <div>
        <p class="studio-kicker">Studio</p>
        <h3>五模态资产工作台</h3>
        <p>{{ studioPack.summary }}</p>
      </div>
      <el-tag :type="studioPack.source === 'ai' ? 'success' : 'warning'" effect="dark">
        {{ studioPack.source === 'ai' ? 'AI Studio' : 'Mock Studio' }}
      </el-tag>
    </div>

    <div class="studio-grid">
      <article
        v-for="mode in studioPack.modes"
        :key="mode.key"
        class="mode-card"
        :class="{ locked: mode.premiumOnly && !isPremiumUnlocked }"
      >
        <div class="mode-top">
          <div>
            <span class="mode-icon">{{ modeMeta[mode.key].icon }}</span>
            <h4>{{ mode.label }}</h4>
          </div>
          <el-tag size="small" :type="mode.premiumOnly ? 'warning' : 'success'">
            {{ mode.premiumOnly ? 'PRO' : 'READY' }}
          </el-tag>
        </div>

        <p class="mode-description">{{ mode.description }}</p>
        <p class="mode-highlight">{{ mode.highlight }}</p>
        <p class="mode-summary">{{ mode.summary }}</p>

        <ul class="mode-bullets">
          <li v-for="item in mode.bullets" :key="item">{{ item }}</li>
        </ul>

        <div v-for="section in mode.sections" :key="section.title" class="mode-section">
          <span class="section-label">{{ section.title }}</span>
          <div class="chip-list">
            <span v-for="item in section.items" :key="item" class="chip">{{ item }}</span>
          </div>
        </div>

        <div v-if="mode.toolLinks.length" class="tool-links">
          <router-link v-for="link in mode.toolLinks" :key="link.path" :to="link.path" class="tool-link">
            {{ link.label }}
          </router-link>
        </div>

        <div class="mode-actions">
          <el-button size="small" @click="copyMode(mode)">复制这一工位</el-button>
          <el-button v-if="mode.premiumOnly && !isPremiumUnlocked" size="small" type="primary" @click="$emit('upgrade')">
            解锁专业版
          </el-button>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { STUDIO_MODE_META, type FactoryStudioPack, type StudioModePack } from '@/services/factoryStudioService'

interface Props {
  studioPack: FactoryStudioPack
  isPremiumUnlocked: boolean
}

defineProps<Props>()
defineEmits<{
  upgrade: []
}>()

const modeMeta = STUDIO_MODE_META

function serializeMode(mode: StudioModePack) {
  return [
    `【${mode.label}】`,
    mode.highlight,
    mode.summary,
    ...mode.bullets,
    ...mode.sections.flatMap((section) => [`${section.title}：${section.items.join('；')}`]),
    ...mode.toolLinks.map((link) => `工具：${link.label} ${link.path}`)
  ].filter(Boolean).join('\n\n')
}

async function copyMode(mode: StudioModePack) {
  try {
    await navigator.clipboard.writeText(serializeMode(mode))
    ElMessage.success(`${mode.label}已复制`)
  } catch {
    ElMessage.error('复制失败，请稍后重试')
  }
}
</script>

<style scoped>
.studio-panel {
  margin-top: 24px;
  padding: 24px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(17, 24, 39, 0.08);
  box-shadow: 0 18px 48px rgba(17, 24, 39, 0.06);
}

.studio-head,
.mode-top,
.mode-actions,
.tool-links {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.studio-kicker {
  display: inline-flex;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(17, 24, 39, 0.08);
  color: #111827;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin: 0 0 10px;
}

.studio-head h3,
.mode-card h4 {
  margin: 0;
  color: #111827;
}

.studio-head p,
.mode-description,
.mode-summary,
.mode-bullets li {
  color: #4b5563;
  line-height: 1.7;
}

.studio-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 18px;
}

.mode-card {
  padding: 20px;
  border-radius: 22px;
  background: #fcfaf8;
  border: 1px solid rgba(17, 24, 39, 0.08);
}

.mode-card.locked {
  background: linear-gradient(180deg, #fffaf8 0%, #f3f4f6 100%);
}

.mode-icon {
  display: inline-grid;
  place-items: center;
  width: 34px;
  height: 34px;
  margin-bottom: 10px;
  border-radius: 10px;
  background: #111827;
  color: #ffffff;
}

.mode-description {
  margin: 12px 0 8px;
}

.mode-highlight {
  margin: 0 0 8px;
  color: #111827;
  font-weight: 700;
  line-height: 1.6;
}

.mode-summary {
  margin: 0;
}

.mode-bullets {
  margin: 14px 0 0;
  padding-left: 18px;
}

.mode-section {
  margin-top: 16px;
}

.section-label {
  display: inline-block;
  margin-bottom: 8px;
  color: #111827;
  font-weight: 700;
}

.chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.chip,
.tool-link {
  display: inline-flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  font-size: 0.88rem;
}

.chip {
  background: #ffffff;
  color: #374151;
}

.tool-links {
  flex-wrap: wrap;
  margin-top: 16px;
}

.tool-link {
  background: #fff0f3;
  color: #be123c;
  text-decoration: none;
}

.mode-actions {
  margin-top: 16px;
  align-items: center;
}

@media (max-width: 980px) {
  .studio-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .studio-head,
  .mode-top,
  .mode-actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
