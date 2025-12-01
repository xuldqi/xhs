<template>
  <div class="infographic" :class="theme">
    <div class="infographic-header" v-if="title">
      <h2>{{ title }}</h2>
      <p v-if="subtitle">{{ subtitle }}</p>
    </div>

    <div class="infographic-content">
      <div
        v-for="(section, index) in sections"
        :key="index"
        class="infographic-section"
        :class="section.layout || 'vertical'"
      >
        <div class="section-icon" v-if="section.icon">
          <component :is="section.icon" />
        </div>

        <div class="section-content">
          <h3 v-if="section.title">{{ section.title }}</h3>
          <p v-if="section.description">{{ section.description }}</p>

          <div v-if="section.stats" class="section-stats">
            <div
              v-for="(stat, statIndex) in section.stats"
              :key="statIndex"
              class="stat-item"
            >
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </div>

          <ul v-if="section.items" class="section-items">
            <li v-for="(item, itemIndex) in section.items" :key="itemIndex">
              {{ item }}
            </li>
          </ul>
        </div>

        <div class="section-connector" v-if="index < sections.length - 1">
          <svg width="2" height="40" viewBox="0 0 2 40">
            <line x1="1" y1="0" x2="1" y2="40" stroke="currentColor" stroke-width="2" stroke-dasharray="4 4" />
          </svg>
        </div>
      </div>
    </div>

    <div class="infographic-footer" v-if="footer">
      <p>{{ footer }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Stat {
  value: string | number
  label: string
}

interface Section {
  icon?: any
  title?: string
  description?: string
  stats?: Stat[]
  items?: string[]
  layout?: 'vertical' | 'horizontal' | 'grid'
}

interface Props {
  title?: string
  subtitle?: string
  sections: Section[]
  footer?: string
  theme?: 'light' | 'dark' | 'colorful'
}

withDefaults(defineProps<Props>(), {
  theme: 'light'
})
</script>

<style scoped>
.infographic {
  padding: 2rem;
  border-radius: 12px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.infographic.dark {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.infographic.colorful {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.infographic-header {
  text-align: center;
  margin-bottom: 3rem;
}

.infographic-header h2 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.infographic-header p {
  font-size: 1.1rem;
  opacity: 0.9;
}

.infographic-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.infographic-section {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.infographic.dark .infographic-section,
.infographic.colorful .infographic-section {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
}

.infographic-section.horizontal {
  flex-direction: row;
}

.infographic-section.vertical {
  flex-direction: column;
  text-align: center;
}

.infographic-section.grid {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1.5rem;
}

.section-icon {
  flex-shrink: 0;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  color: white;
  font-size: 1.5rem;
}

.section-content {
  flex: 1;
}

.section-content h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: inherit;
}

.section-content p {
  font-size: 1rem;
  line-height: 1.6;
  opacity: 0.9;
}

.section-stats {
  display: flex;
  gap: 2rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #667eea;
}

.infographic.dark .stat-value,
.infographic.colorful .stat-value {
  color: white;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.8;
  margin-top: 0.25rem;
}

.section-items {
  list-style: none;
  padding: 0;
  margin-top: 1rem;
}

.section-items li {
  padding: 0.5rem 0;
  padding-left: 1.5rem;
  position: relative;
}

.section-items li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #667eea;
  font-weight: 700;
}

.infographic.dark .section-items li::before,
.infographic.colorful .section-items li::before {
  color: white;
}

.section-connector {
  display: flex;
  justify-content: center;
  color: #667eea;
  opacity: 0.5;
}

.infographic-footer {
  text-align: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px dashed rgba(0, 0, 0, 0.1);
  font-size: 0.9rem;
  opacity: 0.8;
}

@media (max-width: 768px) {
  .infographic {
    padding: 1.5rem;
  }

  .infographic-header h2 {
    font-size: 1.5rem;
  }

  .infographic-section {
    flex-direction: column !important;
    text-align: center;
  }

  .section-stats {
    justify-content: center;
  }

  .stat-value {
    font-size: 1.5rem;
  }
}
</style>
