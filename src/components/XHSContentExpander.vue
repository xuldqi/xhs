<template>
  <div class="max-w-4xl mx-auto p-6">
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-3">
        ✍️ 小红书文案扩写器
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        输入标题和大纲，AI 自动扩写成完整的小红书文案
      </p>
    </div>

    <div class="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
      <div class="flex items-center gap-2">
        <span class="text-2xl">💎</span>
        <span class="text-gray-700 dark:text-gray-300">
          剩余次数：
          <span class="font-bold text-purple-600 dark:text-purple-400 text-xl ml-1">{{ userCredits }}</span>
        </span>
      </div>
    </div>

    <div class="space-y-4 mb-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">笔记标题</label>
        <input
          v-model="title"
          type="text"
          placeholder="例如：30天瘦20斤的减肥方法"
          :disabled="loading"
          class="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-purple-500 dark:focus:border-purple-500 outline-none transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          大纲/要点 <span class="text-gray-400">（每行一个要点）</span>
        </label>
        <textarea
          v-model="outline"
          rows="6"
          placeholder="例如：&#10;- 早上空腹喝水&#10;- 三餐怎么吃&#10;- 运动计划&#10;- 我的真实效果"
          :disabled="loading"
          class="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-purple-500 dark:focus:border-purple-500 outline-none transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
        />
      </div>
    </div>

    <button
      type="button"
      :disabled="loading || !title.trim() || !outline.trim() || userCredits <= 0"
      class="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-6"
      @click="handleGenerate"
    >
      <span v-if="loading" class="flex items-center justify-center gap-2">
        <span class="animate-spin">⚡</span>
        AI 正在创作中...
      </span>
      <span v-else>🚀 一键生成完整文案</span>
    </button>

    <div
      v-if="error"
      class="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400"
    >
      ⚠️ {{ error }}
    </div>

    <div v-if="content" class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-xl font-bold text-gray-800 dark:text-gray-200">✨ 生成的文案</h3>
        <div class="flex items-center gap-3">
          <span class="text-sm text-gray-500">共 {{ wordCount }} 字</span>
          <button
            type="button"
            class="px-4 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors"
            @click="handleCopy"
          >
            {{ copied ? '✓ 已复制' : '📋 复制全文' }}
          </button>
        </div>
      </div>

      <div class="p-6 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
        <div class="prose prose-lg dark:prose-invert max-w-none">
          <pre class="whitespace-pre-wrap font-sans text-gray-800 dark:text-gray-200 leading-relaxed">{{ content }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { createGeminiService, createOpenAIService } from '@/services/aiService'
import { generateContentPrompt } from '@/utils/xhsPrompts'

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
const outline = ref('')
const content = ref('')
const loading = ref(false)
const error = ref('')
const copied = ref(false)

const wordCount = computed(() => content.value.length)

function notifyCreditUpdate(next: number) {
  props.onCreditUpdate?.(next)
  emit('credit-update', next)
}

async function handleGenerate() {
  if (!title.value.trim()) {
    error.value = '请输入标题'
    return
  }
  if (!outline.value.trim()) {
    error.value = '请输入大纲或要点'
    return
  }
  if (props.userCredits <= 0) {
    error.value = '使用次数已用完，请升级会员或购买次数'
    return
  }

  loading.value = true
  error.value = ''
  content.value = ''

  try {
    const aiService = props.provider === 'gemini'
      ? createGeminiService(props.apiKey)
      : createOpenAIService(props.apiKey)
    const prompt = generateContentPrompt(title.value, outline.value)
    content.value = await aiService.generateCompletion(prompt)
    notifyCreditUpdate(props.userCredits - 1)
  } catch (err) {
    error.value = err instanceof Error ? err.message : '生成失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

async function handleCopy() {
  await navigator.clipboard.writeText(content.value)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}
</script>

