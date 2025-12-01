<template>
  <div v-if="loading" class="page-loader" :class="{ fullscreen }">
    <div class="loader-content">
      <div class="spinner" :class="size">
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
      </div>
      <p v-if="message" class="loader-message">{{ message }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  loading?: boolean
  message?: string
  fullscreen?: boolean
  size?: 'small' | 'medium' | 'large'
}

withDefaults(defineProps<Props>(), {
  loading: false,
  fullscreen: true,
  size: 'medium'
})
</script>

<style scoped>
.page-loader {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
}

.page-loader.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  z-index: 9999;
}

.loader-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.spinner {
  position: relative;
  display: inline-block;
}

.spinner.small {
  width: 40px;
  height: 40px;
}

.spinner.medium {
  width: 60px;
  height: 60px;
}

.spinner.large {
  width: 80px;
  height: 80px;
}

.spinner-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
}

.spinner-ring:nth-child(2) {
  border-top-color: #764ba2;
  animation-delay: -0.5s;
}

.spinner-ring:nth-child(3) {
  border-top-color: #f093fb;
  animation-delay: -1s;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loader-message {
  font-size: 1rem;
  color: #666;
  text-align: center;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@media (max-width: 768px) {
  .page-loader {
    padding: 2rem;
  }

  .spinner.medium {
    width: 50px;
    height: 50px;
  }

  .loader-message {
    font-size: 0.9rem;
  }
}
</style>
