<template>
  <section class="source-panel">
    <div class="source-head">
      <div>
        <h3>现成选题库，直接拿来生成</h3>
        <p>这里收编了旧项目里的热词洞察和灵感话题库，省掉手动想题。</p>
      </div>
      <el-tag type="danger" effect="plain">旧轮子已接入</el-tag>
    </div>

    <div v-if="loading" class="source-loading">
      <el-skeleton :rows="4" animated />
    </div>

    <div v-else class="source-grid">
      <article class="source-card">
        <div class="card-head">
          <div>
            <span class="source-badge">热词洞察</span>
            <h4>热门概念词</h4>
          </div>
          <small>来自 `hotWordsData`</small>
        </div>
        <div class="entry-list">
          <button
            v-for="item in hotWordEntries"
            :key="item.id"
            type="button"
            class="entry-button"
            @click="selectHotWord(item)"
          >
            <strong>{{ item.title }}</strong>
            <p>{{ item.summary }}</p>
          </button>
        </div>
      </article>

      <article class="source-card">
        <div class="card-head">
          <div>
            <span class="source-badge secondary">灵感话题</span>
            <h4>高转化内容切口</h4>
          </div>
          <small>来自 `topicInspirationData`</small>
        </div>
        <div class="entry-list">
          <button
            v-for="item in topicEntries"
            :key="item.id"
            type="button"
            class="entry-button"
            @click="selectTopic(item)"
          >
            <strong>{{ item.xhsTitle }}</strong>
            <p>{{ item.intro || item.title }}</p>
          </button>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { loadHotWordsData, type HotWord } from '@/data/hotWordsData'
import { loadTopicInspirationData, type TopicInspiration } from '@/data/topicInspirationData'

const loading = ref(false)
const hotWordEntries = ref<HotWord[]>([])
const topicEntries = ref<TopicInspiration[]>([])

const emit = defineEmits<{
  useTopic: [{
    topic: string
    source: string
    note?: string
  }]
}>()

function selectHotWord(item: HotWord) {
  emit('useTopic', {
    topic: item.title,
    source: 'hot-words',
    note: item.xhsTopics?.[0] || item.summary,
  })
}

function selectTopic(item: TopicInspiration) {
  emit('useTopic', {
    topic: item.xhsTitle,
    source: 'topic-inspiration',
    note: item.xhsTopics?.[0] || item.intro,
  })
}

onMounted(async () => {
  loading.value = true
  try {
    const [hotWordData, topicData] = await Promise.all([
      loadHotWordsData(),
      loadTopicInspirationData(),
    ])

    hotWordEntries.value = hotWordData.hotWords
      .slice()
      .sort((left, right) => right.relevance - left.relevance)
      .slice(0, 4)

    topicEntries.value = topicData.topics
      .slice()
      .sort((left, right) => right.relevance - left.relevance)
      .slice(0, 4)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.source-panel {
  margin-top: 24px;
  padding: 20px;
  border-radius: 24px;
  background: #fffaf8;
  border: 1px solid rgba(17, 24, 39, 0.08);
}

.source-head,
.card-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.source-head h3,
.source-card h4 {
  margin: 0;
  color: #111827;
}

.source-head p,
.entry-button p,
.card-head small {
  color: #6b7280;
  line-height: 1.6;
}

.source-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.source-card {
  padding: 18px;
  border-radius: 20px;
  background: #ffffff;
  border: 1px solid rgba(17, 24, 39, 0.08);
}

.source-badge {
  display: inline-flex;
  margin-bottom: 8px;
  padding: 6px 10px;
  border-radius: 999px;
  background: #fff0f3;
  color: #be123c;
  font-size: 0.78rem;
  font-weight: 700;
}

.source-badge.secondary {
  background: #eef2ff;
  color: #4f46e5;
}

.entry-list {
  display: grid;
  gap: 10px;
  margin-top: 14px;
}

.entry-button {
  text-align: left;
  border: 1px solid rgba(17, 24, 39, 0.08);
  background: #f9fafb;
  padding: 14px;
  border-radius: 16px;
  cursor: pointer;
  transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
}

.entry-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 24px rgba(17, 24, 39, 0.08);
  border-color: rgba(255, 36, 66, 0.18);
}

.entry-button strong {
  display: block;
  color: #111827;
  margin-bottom: 6px;
}

.entry-button p {
  margin: 0;
  font-size: 0.92rem;
}

.source-loading {
  margin-top: 16px;
}

@media (max-width: 980px) {
  .source-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .source-head,
  .card-head {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
