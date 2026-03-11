<template>
  <section class="market-panel">
    <div class="market-head">
      <div>
        <p class="market-kicker">Market Signals</p>
        <h3>外部大仓已经验证：这条内容赛道一直有人买单</h3>
        <p>这些样本从 `seai` 大数据仓里筛出来，说明 Twitter / LinkedIn / 博客 / 多平台自动化长期有需求。</p>
      </div>
      <el-tag type="success" effect="dark">长期性 ⭐⭐⭐⭐</el-tag>
    </div>

    <div class="market-grid">
      <article v-for="signal in marketSignals" :key="signal.id" class="market-card">
        <div class="market-top">
          <div>
            <span class="platform-chip">{{ signal.platformFocus }}</span>
            <h4>{{ signal.toolName }}</h4>
          </div>
          <a :href="signal.url" target="_blank" rel="noreferrer" class="market-link">参考</a>
        </div>

        <p class="demand-angle">{{ signal.demandAngle }}</p>
        <p class="market-description">{{ signal.description }}</p>
        <small>{{ signal.source }}</small>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { marketSignals } from '@/data/contentMarketSignals'
</script>

<style scoped>
.market-panel {
  margin-top: 24px;
  padding: 24px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(17, 24, 39, 0.08);
  box-shadow: 0 18px 48px rgba(17, 24, 39, 0.06);
}

.market-head,
.market-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.market-kicker {
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

.market-head h3,
.market-card h4 {
  margin: 0;
  color: #111827;
}

.market-head p,
.market-description,
.market-card small {
  color: #6b7280;
  line-height: 1.7;
}

.market-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 18px;
}

.market-card {
  padding: 20px;
  border-radius: 22px;
  background: #fcfaf8;
  border: 1px solid rgba(17, 24, 39, 0.08);
}

.platform-chip {
  display: inline-flex;
  margin-bottom: 8px;
  padding: 6px 10px;
  border-radius: 999px;
  background: #fff0f3;
  color: #be123c;
  font-size: 0.78rem;
  font-weight: 700;
}

.market-link {
  color: #111827;
  text-decoration: none;
  font-weight: 700;
}

.demand-angle {
  margin: 14px 0 8px;
  color: #111827;
  font-weight: 700;
}

.market-description {
  margin: 0 0 10px;
}

@media (max-width: 980px) {
  .market-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .market-head {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
