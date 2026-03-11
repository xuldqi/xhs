<template>
  <div class="content-factory-view">
    <div class="factory-shell">
      <Breadcrumb :items="breadcrumbItems" />

      <section class="hero-panel">
        <div class="hero-copy">
          <span class="eyebrow">PRO 内容工厂</span>
          <h1 class="hero-title">一个主题，产出整套可发布内容</h1>
          <p class="hero-subtitle">
            输入一个主题，自动生成小红书、Twitter / X、LinkedIn、博客版本，
            并附带 SEO 关键词、图片提示词、短视频开场与 BGM 灵感。
          </p>

          <div class="stack-badges">
            <span class="stack-badge">LLM</span>
            <span class="stack-badge">翻译 API Ready</span>
            <span class="stack-badge">SEO API Ready</span>
            <span class="stack-badge">趋势抓取 Ready</span>
          </div>

          <div class="hero-actions">
            <el-button type="danger" size="large" @click="scrollToBuilder">
              <el-icon><MagicStick /></el-icon>
              开始生成
            </el-button>
            <el-button size="large" plain @click="goToPricing('general')">
              看付费方案
            </el-button>
          </div>

          <div class="hero-note" :class="{ premium: isPremiumUnlocked }">
            <strong>{{ isPremiumUnlocked ? '专业版已解锁' : '当前为试用模式' }}</strong>
            <span>
              {{ isPremiumUnlocked
                ? '你现在可以一键生成 4 平台内容和完整素材包。'
                : '当前可先体验小红书 starter pack，升级后解锁 4 平台改写、趋势增强、视频和音乐灵感。' }}
            </span>
          </div>
        </div>

        <div class="hero-aside">
          <div class="metric-card featured">
            <span class="metric-label">平台改写</span>
            <strong class="metric-value">4</strong>
            <p>小红书 / Twitter / LinkedIn / 博客</p>
          </div>
          <div class="metric-grid">
            <div class="metric-card">
              <span class="metric-label">资产输出</span>
              <strong class="metric-value">SEO + 图 + 视频 + 音乐</strong>
            </div>
            <div class="metric-card">
              <span class="metric-label">使用场景</span>
              <strong class="metric-value">获客 / 种草 / 品牌</strong>
            </div>
          </div>
        </div>
      </section>

      <div id="factory-builder" class="factory-grid">
        <section class="builder-panel panel-card">
          <div class="section-head">
            <div>
              <p class="section-kicker">Step 1</p>
              <h2>定义这次内容任务</h2>
            </div>
            <span class="section-tip">先做一个可成交的主题，再做平台适配</span>
          </div>

          <el-form label-position="top" class="builder-form">
            <el-form-item label="主题">
              <el-input
                v-model="form.topic"
                placeholder="例如：AI 个体创业如何稳定获客"
                size="large"
                clearable
              />
            </el-form-item>

            <div class="form-grid two-columns">
              <el-form-item label="目标受众">
                <el-input
                  v-model="form.audience"
                  placeholder="例如：知识博主 / 本地商家 / 独立咨询师"
                  clearable
                />
              </el-form-item>

              <el-form-item label="商业目标">
                <el-select v-model="form.goal" placeholder="选择目标">
                  <el-option
                    v-for="goal in goalOptions"
                    :key="goal"
                    :label="goal"
                    :value="goal"
                  />
                </el-select>
              </el-form-item>
            </div>

            <el-form-item label="内容语气">
              <el-input
                v-model="form.tone"
                placeholder="例如：真诚、犀利、有方法论"
                clearable
              />
            </el-form-item>

            <div class="form-grid two-columns">
              <el-form-item label="产品 / 服务（可选）">
                <el-input
                  v-model="form.offer"
                  placeholder="例如：咨询服务 / 训练营 / 模板包"
                  clearable
                />
              </el-form-item>

              <el-form-item label="CTA（可选）">
                <el-input
                  v-model="form.callToAction"
                  placeholder="例如：收藏并私信“模板”"
                  clearable
                />
              </el-form-item>
            </div>

            <el-form-item label="语言模式">
              <div class="mode-switches">
                <button
                  type="button"
                  class="mode-pill"
                  :class="{ active: form.languageMode === 'zh' }"
                  @click="form.languageMode = 'zh'"
                >
                  全中文
                </button>
                <button
                  type="button"
                  class="mode-pill"
                  :class="{ active: form.languageMode === 'bilingual' }"
                  @click="form.languageMode = 'bilingual'"
                >
                  多平台自动中英适配
                </button>
              </div>
            </el-form-item>
          </el-form>

          <div class="trend-section">
            <div class="subsection-head">
              <div>
                <h3>趋势加速器</h3>
                <p>当前为内置快照，后续可接 Twitter 热门、翻译 API、SEO API 实时增强。</p>
              </div>
              <span class="section-tip muted">{{ selectedTrend ? '已选趋势' : '可选增强' }}</span>
            </div>

            <div class="trend-grid">
              <button
                v-for="trend in trendSignals"
                :key="trend.id"
                type="button"
                class="trend-card"
                :class="{ active: selectedTrend?.id === trend.id }"
                @click="applyTrend(trend)"
              >
                <div class="trend-top">
                  <strong>{{ trend.label }}</strong>
                  <span>{{ trend.momentum }}</span>
                </div>
                <p>{{ trend.angle }}</p>
                <small>{{ trend.source }}</small>
              </button>
            </div>
          </div>

          <ContentSourceFinder @use-topic="applySourceTopic" />

          <div class="platform-section">
            <div class="subsection-head">
              <div>
                <h3>多模态工位</h3>
                <p>别只停留在文案，把同一主题继续扩成图、视频、长文和音频资产。</p>
              </div>
            </div>

            <div class="studio-mode-grid">
              <button
                v-for="mode in studioModeOptions"
                :key="mode.key"
                type="button"
                class="studio-mode-pill"
                :class="{
                  active: form.studioModes.includes(mode.key),
                  locked: mode.premium && !isPremiumUnlocked
                }"
                @click="toggleStudioMode(mode.key)"
              >
                <div>
                  <strong>{{ mode.icon }} {{ mode.label }}</strong>
                  <p>{{ mode.description }}</p>
                </div>
                <span class="platform-badge">{{ mode.premium ? 'PRO' : 'READY' }}</span>
              </button>
            </div>
          </div>

          <div class="platform-section">
            <div class="subsection-head">
              <div>
                <h3>选择平台与素材包</h3>
                <p>小红书 starter pack 可免费试用，其余平台与高级素材走付费解锁。</p>
              </div>
            </div>

            <div class="platform-grid-picker">
              <button
                v-for="platform in platformOptions"
                :key="platform.key"
                type="button"
                class="platform-pill"
                :class="{
                  active: form.platforms.includes(platform.key),
                  locked: platform.premium && !isPremiumUnlocked
                }"
                @click="togglePlatform(platform.key)"
              >
                <div>
                  <strong>{{ platform.label }}</strong>
                  <p>{{ platform.description }}</p>
                </div>
                <span class="platform-badge">{{ platform.premium ? 'PRO' : 'FREE' }}</span>
              </button>
            </div>

            <div class="asset-grid">
              <button
                type="button"
                class="asset-pill"
                :class="{ active: form.includeSeoKeywords }"
                @click="form.includeSeoKeywords = !form.includeSeoKeywords"
              >
                <span>SEO 关键词</span>
                <small>搜素与博客结构</small>
              </button>
              <button
                type="button"
                class="asset-pill"
                :class="{ active: form.includeImagePrompts }"
                @click="form.includeImagePrompts = !form.includeImagePrompts"
              >
                <span>图片提示词</span>
                <small>封面 / 配图 / 海报</small>
              </button>
              <button
                type="button"
                class="asset-pill"
                :class="{ active: form.includeVideoHooks, locked: !isPremiumUnlocked }"
                @click="togglePremiumAsset('includeVideoHooks')"
              >
                <span>短视频开场</span>
                <small>{{ isPremiumUnlocked ? '视频脚本切口' : 'PRO 解锁' }}</small>
              </button>
              <button
                type="button"
                class="asset-pill"
                :class="{ active: form.includeMusicIdeas, locked: !isPremiumUnlocked }"
                @click="togglePremiumAsset('includeMusicIdeas')"
              >
                <span>BGM 灵感</span>
                <small>{{ isPremiumUnlocked ? '视频氛围感' : 'PRO 解锁' }}</small>
              </button>
            </div>
          </div>
        </section>

        <section class="result-panel panel-card">
          <div class="section-head result-head">
            <div>
              <p class="section-kicker">Step 2</p>
              <h2>输出你的内容资产包</h2>
            </div>
            <div class="result-actions">
              <el-tag v-if="result" :type="result.source === 'ai' ? 'success' : 'warning'" effect="dark">
                {{ result.source === 'ai' ? 'AI 生成' : '离线演示' }}
              </el-tag>
              <el-button type="primary" size="large" :loading="generating" @click="generatePack">
                <el-icon><MagicStick /></el-icon>
                {{ generating ? '正在生成...' : (isPremiumUnlocked ? '生成内容 + 五模态资产' : '生成试用版资产包') }}
              </el-button>
            </div>
          </div>

          <div v-if="!result" class="empty-state">
            <div class="empty-icon">✦</div>
            <h3>把一个主题变成整套内容</h3>
            <p>
              先输入主题，再点生成。系统会自动给你可直接发的小红书内容，
              专业版还能继续扩成 Twitter / LinkedIn / 博客，以及图文视频素材包。
            </p>
          </div>

          <template v-else>
            <div class="strategy-strip">
              <div class="strategy-card">
                <span>内容角度</span>
                <strong>{{ result.strategy.campaignAngle }}</strong>
              </div>
              <div class="strategy-card">
                <span>受众洞察</span>
                <strong>{{ result.strategy.audienceLens }}</strong>
              </div>
              <div class="strategy-card">
                <span>趋势判断</span>
                <strong>{{ result.strategy.trendSummary }}</strong>
              </div>
              <div class="strategy-card">
                <span>商业提示</span>
                <strong>{{ result.strategy.monetizationHint }}</strong>
              </div>
            </div>

            <div class="asset-pack" v-if="assetBlocks.length">
              <div class="subsection-head compact">
                <div>
                  <h3>附加素材包</h3>
                  <p>让内容不止有文案，还能顺手扩展图、视频、搜索布局。</p>
                </div>
                <el-button text @click="copyAssetPack">
                  <el-icon><DocumentCopy /></el-icon>
                  复制素材包
                </el-button>
              </div>

              <div class="asset-blocks">
                <article v-for="block in assetBlocks" :key="block.key" class="asset-block">
                  <div class="asset-title-row">
                    <span class="asset-emoji">{{ block.emoji }}</span>
                    <div>
                      <h4>{{ block.title }}</h4>
                      <p>{{ block.subtitle }}</p>
                    </div>
                  </div>

                  <div class="asset-items">
                    <span v-for="item in block.items" :key="item" class="asset-item">
                      {{ item }}
                    </span>
                  </div>
                </article>
              </div>
            </div>

            <div class="platform-result-grid">
              <article
                v-for="platform in displayPlatforms"
                :key="platform.key"
                class="platform-card"
                :class="{ locked: platform.locked }"
              >
                <div class="platform-card-head">
                  <div>
                    <p class="platform-label">{{ platform.label }}</p>
                    <small>{{ platform.language }}</small>
                  </div>
                  <el-tag size="small" :type="platform.locked ? 'warning' : 'success'">
                    {{ platform.locked ? '待解锁' : '已生成' }}
                  </el-tag>
                </div>

                <template v-if="!platform.locked">
                  <h3>{{ platform.title }}</h3>
                  <p class="platform-hook">{{ platform.hook }}</p>

                  <ul class="platform-body">
                    <li v-for="line in platform.body" :key="line">{{ line }}</li>
                  </ul>

                  <div v-if="platform.coverLines.length" class="cover-lines">
                    <span v-for="line in platform.coverLines" :key="line" class="cover-chip">
                      {{ line }}
                    </span>
                  </div>

                  <div class="hash-tag-list">
                    <span v-for="tag in platform.hashtags" :key="tag" class="hash-tag">
                      {{ tag }}
                    </span>
                  </div>

                  <div class="tips-box">
                    <span class="tips-title">发布建议</span>
                    <ul>
                      <li v-for="tip in platform.formatTips" :key="tip">{{ tip }}</li>
                    </ul>
                  </div>

                  <div class="platform-cta">{{ platform.cta }}</div>

                  <div class="card-actions">
                    <el-button size="small" @click="copyPlatform(platform)">
                      <el-icon><DocumentCopy /></el-icon>
                      复制
                    </el-button>
                  </div>
                </template>

                <template v-else>
                  <div class="locked-preview">
                    <h3>{{ platform.title }}</h3>
                    <p class="platform-hook blurred">{{ platform.hook }}</p>
                    <ul class="platform-body blurred">
                      <li v-for="line in platform.body" :key="line">{{ line }}</li>
                    </ul>
                    <div class="locked-overlay">
                      <el-icon><Lock /></el-icon>
                      <strong>{{ platform.lockReason }}</strong>
                      <span>解锁平台改写、自动翻译、本地化语气和更完整的资产包。</span>
                      <el-button type="primary" @click="goToPricing('multi-platform')">升级会员</el-button>
                    </div>
                  </div>
                </template>
              </article>
            </div>
          </template>
        </section>
      </div>

      <FactoryStudioPanel
        v-if="studioResult && showSecondaryPanels"
        :studio-pack="studioResult"
        :is-premium-unlocked="isPremiumUnlocked"
        @upgrade="goToPricing"
      />

      <ContentPublishDashboard v-if="showSecondaryPanels" />

      <ContentAutomationQueue
        v-if="showSecondaryPanels"
        :topic="form.topic"
        :is-premium-unlocked="isPremiumUnlocked"
        :content-summary="result?.strategy.campaignAngle || ''"
        :studio-summary="studioResult?.summary || ''"
        :selected-platforms="form.platforms"
        :selected-modes="form.studioModes"
        :trend-label="selectedTrend?.label || null"
        @upgrade="goToPricing"
      />

      <ContentWorkflowBlueprints
        v-if="showSecondaryPanels"
        :is-premium-unlocked="isPremiumUnlocked"
        @upgrade="goToPricing"
      />

      <ContentMarketSignals v-if="showSecondaryPanels" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { DocumentCopy, Lock, MagicStick } from '@element-plus/icons-vue'
import Breadcrumb from '@/components/Breadcrumb.vue'
import ContentSourceFinder from '@/components/content/ContentSourceFinder.vue'
const ContentWorkflowBlueprints = defineAsyncComponent(() => import('@/components/content/ContentWorkflowBlueprints.vue'))
const ContentMarketSignals = defineAsyncComponent(() => import('@/components/content/ContentMarketSignals.vue'))
const FactoryStudioPanel = defineAsyncComponent(() => import('@/components/content/FactoryStudioPanel.vue'))
const ContentAutomationQueue = defineAsyncComponent(() => import('@/components/content/ContentAutomationQueue.vue'))
const ContentPublishDashboard = defineAsyncComponent(() => import('@/components/content/ContentPublishDashboard.vue'))
import { analyticsService } from '@/services/analyticsService'
import { useUserStore } from '@/stores/userStore'
import {
  generateMultiPlatformPack,
  PLATFORM_META,
  TREND_SIGNALS,
  type MultiPlatformPack,
  type PlatformDraft,
  type PlatformKey,
  type TrendSignal,
} from '@/services/multiPlatformContentService'
import {
  generateFactoryStudioPack,
  STUDIO_MODE_META,
  type FactoryStudioPack,
  type StudioModeKey,
} from '@/services/factoryStudioService'

interface DisplayPlatformCard extends PlatformDraft {
  label: string
  language: string
  locked?: boolean
  lockReason?: string
}

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const allPlatforms = Object.keys(PLATFORM_META) as PlatformKey[]
const allStudioModes = Object.keys(STUDIO_MODE_META) as StudioModeKey[]
const goalOptions = ['获客转化', '涨粉拉新', '建立专业度', '引流私域', '卖课 / 卖服务']
const trendSignals = TREND_SIGNALS

const form = ref({
  topic: '',
  audience: '想稳定增长的内容创作者',
  goal: '获客转化',
  tone: '真诚、利落、有方法论',
  offer: '',
  callToAction: '收藏这条并私信我领取模板',
  languageMode: 'bilingual' as 'zh' | 'bilingual',
  includeSeoKeywords: true,
  includeImagePrompts: true,
  includeVideoHooks: false,
  includeMusicIdeas: false,
  platforms: ['xiaohongshu'] as PlatformKey[],
  studioModes: ['image', 'article'] as StudioModeKey[],
})

const generating = ref(false)
const result = ref<MultiPlatformPack | null>(null)
const studioResult = ref<FactoryStudioPack | null>(null)
const selectedTrend = ref<TrendSignal | null>(null)
const showSecondaryPanels = ref(false)

const isPremiumUnlocked = computed(() => userStore.isLoggedIn && userStore.isVIP)

const breadcrumbItems = computed(() => [
  { label: '首页', path: '/' },
  { label: '工具矩阵', path: '/tools' },
  { label: '多平台内容生成器', path: '' }
])

const platformOptions = computed(() => {
  return allPlatforms.map((key) => ({
    key,
    ...PLATFORM_META[key]
  }))
})

const studioModeOptions = computed(() => {
  return allStudioModes.map((key) => ({
    key,
    ...STUDIO_MODE_META[key]
  }))
})

const assetBlocks = computed(() => {
  if (!result.value) return []

  const blocks = [
    {
      key: 'seo',
      title: 'SEO 关键词',
      subtitle: '搜索与博客结构布局',
      emoji: '⌕',
      items: result.value.assets.seoKeywords,
    },
    {
      key: 'image',
      title: '图片提示词',
      subtitle: '封面、配图、海报',
      emoji: '◧',
      items: result.value.assets.imagePrompts,
    },
    {
      key: 'video',
      title: '短视频开场',
      subtitle: '口播与视频钩子',
      emoji: '▶',
      items: result.value.assets.videoHooks,
    },
    {
      key: 'music',
      title: 'BGM 灵感',
      subtitle: '氛围感与节奏参考',
      emoji: '♪',
      items: result.value.assets.musicIdeas,
    }
  ]

  return blocks.filter((block) => block.items.length > 0)
})

const displayPlatforms = computed<DisplayPlatformCard[]>(() => {
  if (!result.value) return []

  const generatedCards = result.value.platforms.map((platform) => ({
    ...platform,
    label: PLATFORM_META[platform.key].label,
    language: PLATFORM_META[platform.key].language,
  }))

  if (isPremiumUnlocked.value) {
    return generatedCards
  }

  const hasGenerated = new Set(generatedCards.map((item) => item.key))
  const lockedCards = allPlatforms
    .filter((key) => !hasGenerated.has(key))
    .map((key) => buildLockedPreview(key))

  return [...generatedCards, ...lockedCards]
})

watch(isPremiumUnlocked, (unlocked) => {
  if (unlocked) {
    form.value.platforms = uniquePlatformList([
      ...form.value.platforms,
      'twitter',
      'linkedin',
      'blog'
    ])
    form.value.studioModes = uniqueStudioModeList([
      ...form.value.studioModes,
      'video',
      'audio'
    ])
    return
  }

  form.value.platforms = ['xiaohongshu']
  form.value.includeVideoHooks = false
  form.value.includeMusicIdeas = false
  form.value.studioModes = ['image', 'article']
}, { immediate: true })

function uniquePlatformList(platforms: PlatformKey[]) {
  return [...new Set(platforms)]
}

function uniqueStudioModeList(modes: StudioModeKey[]): StudioModeKey[] {
  return [...new Set(modes)]
}

function scrollToBuilder() {
  document.getElementById('factory-builder')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function goToPricing(feature: string = 'general') {
  router.push({
    path: '/pricing',
    query: {
      source: 'content-factory',
      feature
    }
  })
}

function applySourceTopic(payload: { topic: string; source: string; note?: string }) {
  form.value.topic = payload.topic
  if (payload.note && !form.value.offer) {
    form.value.offer = '咨询服务 / 模板包 / 训练营'
  }

  analyticsService.trackToolUsage('multi-platform-content', 'use_source_topic', {
    success: true,
    metadata: payload
  })
}

function applyTrend(trend: TrendSignal) {
  selectedTrend.value = selectedTrend.value?.id === trend.id ? null : trend

  if (selectedTrend.value) {
    form.value.topic = trend.keyword
    if (!form.value.offer) {
      form.value.offer = '内容咨询 / 模板包 / 训练营'
    }
  }

  analyticsService.trackToolUsage('multi-platform-content', 'trend_select', {
    success: true,
    metadata: { trendId: selectedTrend.value?.id || 'cleared' }
  })
}

function togglePlatform(key: PlatformKey) {
  if (key === 'xiaohongshu') {
    form.value.platforms = form.value.platforms.includes('xiaohongshu')
      ? form.value.platforms
      : uniquePlatformList([...form.value.platforms, 'xiaohongshu'])
    return
  }

  if (!isPremiumUnlocked.value) {
    ElMessage.info('升级专业版后可解锁多平台自动改写')
    goToPricing('multi-platform')
    return
  }

  if (form.value.platforms.includes(key)) {
    form.value.platforms = form.value.platforms.filter((item) => item !== key)
    return
  }

  form.value.platforms = uniquePlatformList([...form.value.platforms, key])
}

function toggleStudioMode(key: StudioModeKey) {
  if (STUDIO_MODE_META[key].premium && !isPremiumUnlocked.value) {
    ElMessage.info(`${STUDIO_MODE_META[key].label}为专业版权益`)
    goToPricing('studio-video')
    return
  }

  if (form.value.studioModes.includes(key)) {
    const next = form.value.studioModes.filter((item) => item !== key)
    form.value.studioModes = next.length > 0 ? next : ['image']
    return
  }

  form.value.studioModes = [...new Set([...form.value.studioModes, key])]
}

function togglePremiumAsset(field: 'includeVideoHooks' | 'includeMusicIdeas') {
  if (!isPremiumUnlocked.value) {
    ElMessage.info('该素材包为专业版权益')
    goToPricing('asset-video-hooks')
    return
  }

  form.value[field] = !form.value[field]
}

function buildLockedPreview(key: PlatformKey): DisplayPlatformCard {
  const meta = PLATFORM_META[key]
  return {
    key,
    label: meta.label,
    language: meta.language,
    title: `${meta.label} 改写预览`,
    hook: `同一个主题会自动改写成适合 ${meta.label} 的语气、长度与结构。`,
    body: [
      '系统会重写开头钩子，适配该平台的阅读心流。',
      '同时重组正文顺序，让观点、证据与 CTA 更符合平台习惯。',
      '你不需要重复手写第二遍、第三遍、第四遍。'
    ],
    hashtags: [],
    cta: '升级后即可复制完整版本',
    formatTips: [],
    coverLines: [],
    locked: true,
    lockReason: '专业版解锁平台改写'
  }
}

async function generatePack() {
  if (!form.value.topic.trim()) {
    ElMessage.warning('先输入一个主题再开始生成')
    return
  }

  generating.value = true
  studioResult.value = null

  try {
    const [pack, studioPack] = await Promise.all([generateMultiPlatformPack({
      topic: form.value.topic.trim(),
      audience: form.value.audience.trim(),
      goal: form.value.goal,
      tone: form.value.tone.trim(),
      offer: form.value.offer.trim() || undefined,
      callToAction: form.value.callToAction.trim() || undefined,
      trendSignal: isPremiumUnlocked.value ? selectedTrend.value : null,
      platforms: isPremiumUnlocked.value ? form.value.platforms : ['xiaohongshu'],
      premium: isPremiumUnlocked.value,
      languageMode: form.value.languageMode,
      includeSeoKeywords: form.value.includeSeoKeywords,
      includeImagePrompts: form.value.includeImagePrompts,
      includeVideoHooks: isPremiumUnlocked.value && form.value.includeVideoHooks,
      includeMusicIdeas: isPremiumUnlocked.value && form.value.includeMusicIdeas,
    }), generateFactoryStudioPack({
      topic: form.value.topic.trim(),
      audience: form.value.audience.trim(),
      goal: form.value.goal,
      tone: form.value.tone.trim(),
      offer: form.value.offer.trim() || undefined,
      callToAction: form.value.callToAction.trim() || undefined,
      trendSignal: isPremiumUnlocked.value ? selectedTrend.value : null,
      premium: isPremiumUnlocked.value,
      languageMode: form.value.languageMode,
      modes: form.value.studioModes,
    })])

    result.value = pack
    studioResult.value = studioPack

    analyticsService.trackToolUsage('multi-platform-content', 'generate', {
      success: true,
      metadata: {
        premium: isPremiumUnlocked.value,
        platforms: isPremiumUnlocked.value ? form.value.platforms.join(',') : 'xiaohongshu',
        source: pack.source,
        studioSource: studioPack.source,
        studioModes: form.value.studioModes.join(',')
      }
    })

    if (pack.source === 'mock' || studioPack.source === 'mock') {
      ElMessage.warning('当前为演示模式：请配置后端与 API 密钥以输出真实生产内容')
    } else if (isPremiumUnlocked.value) {
      ElMessage.success('多平台 + 多模态资产包已生成')
    } else {
      ElMessage.success('试用版已生成，升级可解锁完整内容工厂')
    }
  } catch (error: any) {
    console.error(error)
    analyticsService.trackToolUsage('multi-platform-content', 'generate', {
      success: false,
      metadata: { message: error?.message || 'unknown' }
    })
    ElMessage.error(error?.message || '生成失败，请稍后重试')
  } finally {
    generating.value = false
  }
}

function serializePlatform(platform: DisplayPlatformCard) {
  return [
    `【${platform.label}】`,
    platform.title,
    platform.hook,
    ...platform.body,
    platform.coverLines.length ? `封面短句：${platform.coverLines.join(' / ')}` : '',
    platform.hashtags.length ? `标签：${platform.hashtags.join(' ')}` : '',
    platform.formatTips.length ? `发布建议：${platform.formatTips.join('；')}` : '',
    `CTA：${platform.cta}`
  ].filter(Boolean).join('\n\n')
}

async function copyPlatform(platform: DisplayPlatformCard) {
  try {
    await navigator.clipboard.writeText(serializePlatform(platform))
    ElMessage.success(`${platform.label}内容已复制`)
  } catch {
    ElMessage.error('复制失败，请稍后重试')
  }
}

async function copyAssetPack() {
  if (!result.value) return

  const text = [
    result.value.assets.seoKeywords.length ? `【SEO 关键词】${result.value.assets.seoKeywords.join('、')}` : '',
    result.value.assets.imagePrompts.length ? `【图片提示词】\n${result.value.assets.imagePrompts.join('\n')}` : '',
    result.value.assets.videoHooks.length ? `【短视频开场】\n${result.value.assets.videoHooks.join('\n')}` : '',
    result.value.assets.musicIdeas.length ? `【BGM 灵感】\n${result.value.assets.musicIdeas.join('\n')}` : ''
  ].filter(Boolean).join('\n\n')

  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('素材包已复制')
  } catch {
    ElMessage.error('复制失败，请稍后重试')
  }
}

onMounted(() => {
  if (typeof route.query.topic === 'string' && route.query.topic.trim()) {
    form.value.topic = route.query.topic.trim()
  }

  if ('requestIdleCallback' in window) {
    ;(window as any).requestIdleCallback(() => {
      showSecondaryPanels.value = true
    })
  } else {
    setTimeout(() => {
      showSecondaryPanels.value = true
    }, 500)
  }

  analyticsService.trackPageView('/tools/multi-platform-content', 'AI 多平台内容生成器')
})
</script>

<style scoped>
.content-factory-view {
  min-height: 100vh;
  background:
    radial-gradient(circle at top right, rgba(255, 36, 66, 0.14), transparent 22%),
    linear-gradient(180deg, #f7efe8 0%, #f7f5f2 44%, #ffffff 100%);
  padding: 32px 0 80px;
}

.factory-shell {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
}

.hero-panel {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.8fr);
  gap: 28px;
  padding: clamp(28px, 4vw, 48px);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(17, 24, 39, 0.08);
  box-shadow: 0 24px 60px rgba(17, 24, 39, 0.08);
  margin-top: 24px;
  overflow: hidden;
  position: relative;
}

.hero-panel::after {
  content: '';
  position: absolute;
  inset: auto -70px -90px auto;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 36, 66, 0.18), transparent 65%);
}

.eyebrow,
.section-kicker {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(255, 36, 66, 0.08);
  color: #c71f38;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.section-kicker {
  margin-bottom: 10px;
}

.hero-title {
  font-size: clamp(2.4rem, 5vw, 4.6rem);
  line-height: 0.98;
  margin: 18px 0 16px;
  letter-spacing: -0.05em;
  color: #171717;
}

.hero-subtitle {
  max-width: 760px;
  font-size: 1.08rem;
  line-height: 1.8;
  color: #4b5563;
  margin: 0 0 24px;
}

.stack-badges,
.hero-actions,
.metric-grid,
.strategy-strip,
.asset-blocks,
.platform-result-grid,
.trend-grid,
.platform-grid-picker,
.asset-grid {
  display: grid;
  gap: 14px;
}

.stack-badges {
  grid-template-columns: repeat(auto-fit, minmax(140px, max-content));
  margin-bottom: 24px;
}

.stack-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 14px;
  border-radius: 999px;
  background: #fff5f6;
  color: #b42318;
  font-weight: 600;
  font-size: 0.9rem;
  border: 1px solid rgba(255, 36, 66, 0.12);
}

.hero-actions {
  grid-template-columns: repeat(auto-fit, minmax(180px, max-content));
  margin-bottom: 18px;
}

.hero-note {
  display: grid;
  gap: 6px;
  padding: 16px 18px;
  border-radius: 18px;
  background: #f3f4f6;
  color: #374151;
  position: relative;
  z-index: 1;
}

.hero-note.premium {
  background: #effcf6;
  color: #166534;
}

.hero-aside {
  display: grid;
  gap: 14px;
  align-content: start;
  position: relative;
  z-index: 1;
}

.metric-card {
  padding: 20px;
  border-radius: 24px;
  background: #fcfaf8;
  border: 1px solid rgba(17, 24, 39, 0.08);
}

.metric-card.featured {
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  color: #fff7f8;
}

.metric-label {
  display: block;
  font-size: 0.85rem;
  color: inherit;
  opacity: 0.8;
}

.metric-value {
  display: block;
  margin: 8px 0 6px;
  font-size: clamp(1.3rem, 3vw, 2.4rem);
  line-height: 1.1;
}

.metric-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.factory-grid {
  display: grid;
  grid-template-columns: minmax(360px, 420px) minmax(0, 1fr);
  gap: 22px;
  margin-top: 24px;
}

.panel-card {
  background: rgba(255, 255, 255, 0.94);
  border-radius: 28px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  box-shadow: 0 18px 48px rgba(17, 24, 39, 0.06);
  padding: 24px;
}

.section-head,
.subsection-head,
.result-head,
.asset-title-row,
.platform-card-head,
.card-actions,
.asset-items,
.cover-lines,
.hash-tag-list {
  display: flex;
}

.section-head,
.subsection-head,
.result-head {
  justify-content: space-between;
  align-items: start;
  gap: 16px;
}

.section-head h2,
.subsection-head h3 {
  margin: 0;
  color: #111827;
}

.section-head h2 {
  font-size: 1.65rem;
}

.section-tip {
  font-size: 0.85rem;
  color: #6b7280;
}

.section-tip.muted {
  padding-top: 10px;
}

.builder-form,
.trend-section,
.platform-section,
.asset-pack {
  margin-top: 24px;
}

.form-grid.two-columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.mode-switches {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.mode-pill,
.trend-card,
.platform-pill,
.asset-pill,
.studio-mode-pill {
  appearance: none;
  border: 1px solid rgba(17, 24, 39, 0.08);
  background: #ffffff;
  cursor: pointer;
  transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
}

.mode-pill {
  padding: 12px 16px;
  border-radius: 999px;
  color: #4b5563;
  font-weight: 600;
}

.mode-pill.active {
  background: #111827;
  color: #ffffff;
}

.trend-grid,
.platform-grid-picker,
.asset-grid,
.asset-blocks,
.platform-result-grid {
  margin-top: 14px;
}

.trend-grid,
.asset-blocks,
.platform-result-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.trend-card {
  padding: 18px;
  border-radius: 20px;
  text-align: left;
  background: #fffaf8;
}

.trend-card.active {
  border-color: rgba(255, 36, 66, 0.32);
  box-shadow: 0 18px 34px rgba(255, 36, 66, 0.12);
  transform: translateY(-2px);
}

.trend-top,
.asset-title-row,
.platform-card-head,
.card-actions,
.hash-tag-list,
.cover-lines {
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.trend-card strong,
.platform-card h3,
.asset-block h4 {
  color: #111827;
}

.trend-card p,
.asset-block p,
.platform-hook,
.empty-state p,
.tips-box li {
  color: #4b5563;
  line-height: 1.7;
}

.trend-card small,
.platform-card small,
.asset-block p {
  color: #6b7280;
}

.platform-grid-picker,
.asset-grid,
.studio-mode-grid {
  grid-template-columns: 1fr;
}

.platform-pill,
.asset-pill {
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: left;
  gap: 12px;
  padding: 16px 18px;
  border-radius: 20px;
}

.platform-pill.active,
.asset-pill.active,
.studio-mode-pill.active {
  border-color: rgba(255, 36, 66, 0.28);
  box-shadow: 0 16px 28px rgba(255, 36, 66, 0.1);
}

.platform-pill.locked,
.asset-pill.locked,
.studio-mode-pill.locked {
  background: #f9fafb;
}

.platform-pill strong,
.asset-pill span,
.studio-mode-pill strong {
  display: block;
  color: #111827;
}

.platform-pill p,
.asset-pill small,
.studio-mode-pill p {
  margin: 4px 0 0;
  color: #6b7280;
}

.platform-badge {
  padding: 7px 10px;
  border-radius: 999px;
  background: #111827;
  color: white;
  font-size: 0.72rem;
  font-weight: 700;
}

.empty-state {
  min-height: 520px;
  display: grid;
  place-items: center;
  align-content: center;
  text-align: center;
  padding: 32px;
}

.empty-icon {
  width: 72px;
  height: 72px;
  display: grid;
  place-items: center;
  border-radius: 24px;
  background: #fff5f6;
  color: #ff2442;
  font-size: 2rem;
  margin-bottom: 14px;
}

.strategy-strip {
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-top: 20px;
}

.strategy-card {
  padding: 18px;
  border-radius: 20px;
  background: #fcfaf8;
  border: 1px solid rgba(17, 24, 39, 0.06);
}

.strategy-card span {
  display: block;
  font-size: 0.8rem;
  color: #6b7280;
  margin-bottom: 8px;
}

.strategy-card strong {
  color: #111827;
  line-height: 1.6;
}

.asset-block {
  padding: 18px;
  border-radius: 22px;
  background: #fffaf8;
  border: 1px solid rgba(17, 24, 39, 0.06);
}

.asset-title-row {
  align-items: flex-start;
}

.asset-emoji {
  width: 38px;
  height: 38px;
  display: inline-grid;
  place-items: center;
  border-radius: 12px;
  background: #111827;
  color: white;
  flex-shrink: 0;
}

.asset-items,
.cover-lines,
.hash-tag-list {
  flex-wrap: wrap;
  margin-top: 16px;
}

.asset-item,
.cover-chip,
.hash-tag {
  display: inline-flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 0.88rem;
}

.asset-item {
  background: #ffffff;
  color: #374151;
  border: 1px solid rgba(17, 24, 39, 0.08);
}

.cover-chip {
  background: #fff0f3;
  color: #be123c;
}

.hash-tag {
  background: #f3f4f6;
  color: #374151;
}

.platform-card {
  position: relative;
  padding: 20px;
  border-radius: 24px;
  background: #ffffff;
  border: 1px solid rgba(17, 24, 39, 0.08);
  min-height: 100%;
}

.platform-card.locked {
  background: linear-gradient(180deg, #fffaf8 0%, #f9fafb 100%);
}

.platform-label {
  margin: 0;
  font-size: 1rem;
  color: #111827;
  font-weight: 700;
}

.platform-card h3 {
  margin: 18px 0 12px;
  font-size: 1.28rem;
  line-height: 1.35;
}

.platform-hook {
  margin: 0 0 16px;
  font-size: 0.98rem;
}

.platform-body {
  margin: 0;
  padding-left: 18px;
  display: grid;
  gap: 10px;
}

.tips-box {
  margin-top: 18px;
  padding: 16px;
  border-radius: 18px;
  background: #f9fafb;
}

.tips-title {
  display: inline-block;
  color: #111827;
  font-weight: 700;
  margin-bottom: 8px;
}

.tips-box ul {
  margin: 0;
  padding-left: 18px;
}

.platform-cta {
  margin-top: 16px;
  padding: 14px 16px;
  border-radius: 16px;
  background: #111827;
  color: #ffffff;
  line-height: 1.6;
}

.card-actions {
  justify-content: flex-end;
  margin-top: 18px;
}

.locked-preview {
  position: relative;
  min-height: 100%;
}

.blurred {
  filter: blur(2px);
  user-select: none;
}

.locked-overlay {
  position: absolute;
  inset: 28% 16px auto 16px;
  display: grid;
  gap: 10px;
  justify-items: start;
  padding: 18px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(255, 36, 66, 0.16);
  box-shadow: 0 18px 36px rgba(17, 24, 39, 0.12);
}

.locked-overlay strong {
  color: #111827;
}

.locked-overlay span {
  color: #4b5563;
  line-height: 1.6;
}

@media (max-width: 1180px) {
  .factory-grid,
  .hero-panel,
  .strategy-strip,
  .trend-grid,
  .asset-blocks,
  .platform-result-grid {
    grid-template-columns: 1fr;
  }

  .metric-grid,
  .form-grid.two-columns {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .content-factory-view {
    padding: 20px 0 48px;
  }

  .factory-shell {
    padding: 0 16px;
  }

  .panel-card,
  .hero-panel {
    border-radius: 22px;
    padding: 20px;
  }

  .hero-title {
    font-size: 2.3rem;
  }

  .hero-actions {
    grid-template-columns: 1fr;
  }

  .result-head,
  .section-head,
  .subsection-head {
    flex-direction: column;
    align-items: stretch;
  }

  .locked-overlay {
    position: static;
    margin-top: 16px;
  }
}
</style>
