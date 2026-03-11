<template>
  <div class="max-w-4xl mx-auto p-6">
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent mb-3">
        📝 小红书爆款标题生成器
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        AI 一键生成吸睛标题，助你打造 10w+ 爆款笔记
      </p>
    </div>

    <div class="mb-6 p-4 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-xl border border-pink-200 dark:border-pink-800">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-2xl">💎</span>
          <span class="text-gray-700 dark:text-gray-300">
            剩余次数：
            <span class="font-bold text-pink-600 dark:text-pink-400 text-xl ml-1">{{ userCredits }}</span>
          </span>
        </div>
      </div>
    </div>

    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        输入主题或关键词
      </label>
      <div class="relative">
        <input
          v-model="topic"
          type="text"
          placeholder="例如：减肥方法、护肤技巧、穿搭灵感..."
          :disabled="loading"
          @keypress="handleKeyPress"
          class="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-pink-500 dark:focus:border-pink-500 outline-none transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400"
        />
        <button
          v-if="topic"
          type="button"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          @click="topic = ''"
        >
          ✕
        </button>
      </div>
    </div>

    <button
      type="button"
      :disabled="loading || !topic.trim() || userCredits <= 0"
      class="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none mb-6"
      @click="handleGenerate"
    >
      <span v-if="loading" class="flex items-center justify-center gap-2">
        <span class="animate-spin">⚡</span>
        AI 正在生成中...
      </span>
      <span v-else>🚀 一键生成爆款标题</span>
    </button>

    <div
      v-if="error"
      class="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400"
    >
      ⚠️ {{ error }}
    </div>

    <div v-if="titles.length > 0" class="space-y-3">
      <h3 class="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
        ✨ 为你生成了 {{ titles.length }} 个爆款标题：
      </h3>
      <div
        v-for="(title, index) in titles"
        :key="`${index}-${title}`"
        class="group p-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-pink-300 dark:hover:border-pink-600 transition-all cursor-pointer"
        @click="handleCopy(title, index)"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-sm font-bold text-pink-500">#{{ index + 1 }}</span>
            </div>
            <p class="text-gray-800 dark:text-gray-200 text-lg leading-relaxed">{{ title }}</p>
          </div>
          <button
            type="button"
            class="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-pink-100 dark:hover:bg-pink-900/30 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
          >
            {{ copiedIndex === index ? '✓ 已复制' : '📋 复制' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { createGeminiService, createOpenAIService } from '@/services/aiService'
import { generateTitlePrompt } from '@/utils/xhsPrompts'

interface Props {
  apiKey?: string
  provider?: 'openai' | 'gemini'
  userCredits?: number
  onCreditUpdate?: (newCredits: number) => void
}

const props = withDefaults(defineProps<Props>(), {
  apiKey: '',
  provider: 'openai',
  userCredits: 3,
})

const emit = defineEmits<{
  'credit-update': [newCredits: number]
}>()

const topic = ref('')
const titles = ref<string[]>([])
const loading = ref(false)
const error = ref('')
const copiedIndex = ref<number | null>(null)

function notifyCreditUpdate(next: number) {
  props.onCreditUpdate?.(next)
  emit('credit-update', next)
}

async function handleGenerate() {
  if (!topic.value.trim()) {
    error.value = '请输入主题或关键词'
    return
  }

  if (props.userCredits <= 0) {
    error.value = '使用次数已用完，请升级会员或购买次数'
    return
  }

  loading.value = true
  error.value = ''
  titles.value = []

  try {
    const aiService = props.provider === 'gemini'
      ? createGeminiService(props.apiKey)
      : createOpenAIService(props.apiKey)

    const prompt = generateTitlePrompt(topic.value)
    const result = await aiService.generateJSON<string[]>(prompt)
    titles.value = Array.isArray(result) ? result : []
    notifyCreditUpdate(props.userCredits - 1)
  } catch (err) {
    error.value = err instanceof Error ? err.message : '生成失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

async function handleCopy(title: string, index: number) {
  await navigator.clipboard.writeText(title)
  copiedIndex.value = index
  setTimeout(() => {
    copiedIndex.value = null
  }, 2000)
}

function handleKeyPress(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    void handleGenerate()
  }
}
</script>

