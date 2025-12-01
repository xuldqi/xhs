<template>
  <div class="flow-chart" :class="direction">
    <div
      v-for="(step, index) in steps"
      :key="index"
      class="flow-step-container"
    >
      <div class="flow-step" :class="step.type || 'default'">
        <div class="step-number" v-if="showNumbers">{{ index + 1 }}</div>
        <div class="step-icon" v-if="step.icon">
          <component :is="step.icon" />
        </div>
        <div class="step-content">
          <h4 v-if="step.title">{{ step.title }}</h4>
          <p v-if="step.description">{{ step.description }}</p>
          <div v-if="step.details" class="step-details">
            <ul>
              <li v-for="(detail, detailIndex) in step.details" :key="detailIndex">
                {{ detail }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="flow-connector" v-if="index < steps.length - 1">
        <svg v-if="direction === 'vertical'" width="2" height="60" viewBox="0 0 2 60">
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
              <polygon points="0 0, 10 5, 0 10" fill="currentColor" />
            </marker>
          </defs>
          <line x1="1" y1="0" x2="1" y2="60" stroke="currentColor" stroke-width="2" marker-end="url(#arrowhead)" />
        </svg>
        <svg v-else width="60" height="2" viewBox="0 0 60 2">
          <defs>
            <marker id="arrowhead-h" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
              <polygon points="0 0, 10 5, 0 10" fill="currentColor" />
            </marker>
          </defs>
          <line x1="0" y1="1" x2="60" y2="1" stroke="currentColor" stroke-width="2" marker-end="url(#arrowhead-h)" />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Step {
  title?: string
  description?: string
  details?: string[]
  icon?: any
  type?: 'default' | 'start' | 'end' | 'decision' | 'process'
}

interface Props {
  steps: Step[]
  direction?: 'vertical' | 'horizontal'
  showNumbers?: boolean
}

withDefaults(defineProps<Props>(), {
  direction: 'vertical',
  showNumbers: true
})
</script>

<style scoped>
.flow-chart {
  display: flex;
  padding: 2rem;
}

.flow-chart.vertical {
  flex-direction: column;
  align-items: center;
}

.flow-chart.horizontal {
  flex-direction: row;
  align-items: flex-start;
  overflow-x: auto;
  padding-bottom: 1rem;
}

.flow-step-container {
  display: flex;
  align-items: center;
}

.flow-chart.vertical .flow-step-container {
  flex-direction: column;
}

.flow-chart.horizontal .flow-step-container {
  flex-direction: row;
}

.flow-step {
  position: relative;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-width: 250px;
  max-width: 400px;
  transition: all 0.3s ease;
}

.flow-step:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.flow-step.start {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.flow-step.end {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.flow-step.decision {
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
  padding: 2rem;
}

.flow-step.process {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
}

.step-number {
  position: absolute;
  top: -12px;
  left: -12px;
  width: 32px;
  height: 32px;
  background: #667eea;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.step-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 50%;
  color: #667eea;
  font-size: 1.5rem;
}

.flow-step.start .step-icon,
.flow-step.end .step-icon {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.step-content {
  text-align: center;
}

.step-content h4 {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: inherit;
}

.step-content p {
  font-size: 0.95rem;
  line-height: 1.6;
  opacity: 0.9;
  margin-bottom: 0.5rem;
}

.step-details {
  margin-top: 1rem;
  text-align: left;
}

.step-details ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.step-details li {
  padding: 0.4rem 0;
  padding-left: 1.5rem;
  position: relative;
  font-size: 0.9rem;
}

.step-details li::before {
  content: '•';
  position: absolute;
  left: 0.5rem;
  color: #667eea;
  font-weight: 700;
}

.flow-step.start .step-details li::before,
.flow-step.end .step-details li::before {
  color: white;
}

.flow-connector {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
  margin: 0.5rem 0;
}

.flow-chart.horizontal .flow-connector {
  margin: 0 0.5rem;
}

@media (max-width: 768px) {
  .flow-chart {
    padding: 1rem;
  }

  .flow-chart.horizontal {
    flex-direction: column;
    align-items: center;
  }

  .flow-chart.horizontal .flow-step-container {
    flex-direction: column;
  }

  .flow-chart.horizontal .flow-connector svg {
    transform: rotate(90deg);
  }

  .flow-step {
    min-width: 200px;
    max-width: 100%;
  }

  .step-content h4 {
    font-size: 1.1rem;
  }

  .step-content p {
    font-size: 0.9rem;
  }
}
</style>
