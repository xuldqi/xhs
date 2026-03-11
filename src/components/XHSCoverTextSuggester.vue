<template>
  <div class="max-w-4xl mx-auto p-6">
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent mb-3">
        🎨 小红书封面文字生成器
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        生成适合做封面的醒目短句，让你的笔记更吸睛
      </p>
    </div>

    <div class="mb-6 p-4 bg-gradient-to-r from-orange-50 to-rose-50 dark:from-orange-900/20 dark:to-rose-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
      <div class="flex items-center gap-2">
        <span class="text-2xl">💎</span>
        <span class="text-gray-700 dark:text-gray-300">
          剩余次数：
          <span class="font-bold text-orange-600 dark:text-orange-400 text-xl ml-1">{{ userCredits }}</span>
        </span>
      </div>
    </div>

    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">笔记标题</label>
      <input
        v-model="title"
        type="text"
        placeholder="例如：30天瘦20斤的减肥方法"
        :disabled="loading"
        @keypress="handleKeyPress"
        class="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-orange-500 dark:focus:border-orange-500 outline-none transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
      />
    </div>

    <button
      type="button"
      :disabled="loading || !title.trim() || userCredits <= 0"
      class="w-full py-4 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-6"
      @click="handleGenerate"
    >
      <span v-if="loading" class="flex items-center justify-center gap-2">
        <span class="animate-spin">⚡</span>
        AI 正在生成中...
      </span>
      <span v-else>🚀 生成封面文字</span>
    </button>

    <div
      v-if="error"
      class="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400"
    >
      ⚠️ {{ error }}
    </div>

    <div v-if="suggestions.length > 0" class="space-y-3">
      <h3 class="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
        ✨ 为你生成了 {{ suggestions.length }} 个封面文字：
      </h3>

      <div class="grid gap-4">
        <div
          v-for="(text, index) in suggestions"
          :key="`${index}-${text}`"
          class="group relative overflow-hidden"
        >
          <div class="relative p-8 bg-gradient-to-br from-orange-100 to-rose-100 dark:from-orange-900/30 dark:to-rose-900/30 rounded-2xl border-2 border-orange-200 dark:border-orange-700 hover:border-orange-400 dark:hover:border-orange-500 transition-all cursor-pointer">
            <div class="text-center">
              <p class="text-3xl font-black text-gray-800 dark:text-gray-100 leading-tight">{{ text }}</p>
            </div>

            <div class="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                class="px-3 py-1.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-orange-500 hover:text-white transition-colors shadow-lg"
                @click.stop="handleCopy(text, index)"
              >
                {{ copiedIndex === index ? '✓ 已复制' : '📋 复制' }}
              </button>
            </div>

            <div class="absolute top-3 left-3">
              <span class="px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded">#{{ index + 1 }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { createGeminiService, createOpenAIService } from '@/services/aiService'
import { generateCoverTextPrompt } from '@/utils/xhsPrompts'

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

const title = ref('')
const suggestions = ref<string[]>([])
const loading = ref(false)
const error = ref('')
const copiedIndex = ref<number | null>(null)

function notifyCreditUpdate(next: number) {
  props.onCreditUpdate?.(next)
  emit('credit-update', next)
}

async function handleGenerate() {
  if (!title.value.trim()) {
    error.value = '请输入笔记标题'
    return
  }

  if (props.userCredits <= 0) {
    error.value = '使用次数已用完，请升级会员或购买次数'
    return
  }

  loading.value = true
  error.value = ''
  suggestions.value = []

  try {
    const aiService = props.provider === 'gemini'
      ? createGeminiService(props.apiKey)
      : createOpenAIService(props.apiKey)
    const result = await aiService.generateJSON<string[]>(generateCoverTextPrompt(title.value))
    suggestions.value = Array.isArray(result) ? result : []
    notifyCreditUpdate(props.userCredits - 1)
  } catch (err) {
    error.value = err instanceof Error ? err.message : '生成失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

async function handleCopy(text: string, index: number) {
  await navigator.clipboard.writeText(text)
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

