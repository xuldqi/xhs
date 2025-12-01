<template>
  <transition
    :name="transitionName"
    :mode="mode"
    @before-enter="onBeforeEnter"
    @enter="onEnter"
    @after-enter="onAfterEnter"
    @before-leave="onBeforeLeave"
    @leave="onLeave"
    @after-leave="onAfterLeave"
  >
    <slot />
  </transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

interface Props {
  name?: string
  mode?: 'in-out' | 'out-in' | 'default'
  duration?: number
}

const props = withDefaults(defineProps<Props>(), {
  name: 'fade',
  mode: 'out-in',
  duration: 300
})

const route = useRoute()
const transitionName = ref(props.name)

// 根据路由深度决定过渡方向
watch(() => route.path, (to, from) => {
  const toDepth = to.split('/').length
  const fromDepth = from.split('/').length
  
  if (toDepth > fromDepth) {
    transitionName.value = 'slide-left'
  } else if (toDepth < fromDepth) {
    transitionName.value = 'slide-right'
  } else {
    transitionName.value = props.name
  }
})

function onBeforeEnter(el: Element) {
  const element = el as HTMLElement
  element.style.opacity = '0'
}

function onEnter(el: Element, done: () => void) {
  const element = el as HTMLElement
  const transitionDuration = props.duration || 300
  setTimeout(() => {
    element.style.transition = `opacity ${transitionDuration}ms ease`
    element.style.opacity = '1'
    setTimeout(done, transitionDuration)
  }, 10)
}

function onAfterEnter(el: Element) {
  const element = el as HTMLElement
  element.style.transition = ''
}

function onBeforeLeave(el: Element) {
  const element = el as HTMLElement
  element.style.opacity = '1'
}

function onLeave(el: Element, done: () => void) {
  const element = el as HTMLElement
  const transitionDuration = props.duration || 300
  element.style.transition = `opacity ${transitionDuration}ms ease`
  element.style.opacity = '0'
  setTimeout(done, transitionDuration)
}

function onAfterLeave(el: Element) {
  const element = el as HTMLElement
  element.style.transition = ''
}
</script>

<style scoped>
/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Slide left transition */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s ease;
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* Slide right transition */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease;
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* Scale transition */
.scale-enter-active,
.scale-leave-active {
  transition: all 0.3s ease;
}

.scale-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.scale-leave-to {
  opacity: 0;
  transform: scale(1.1);
}
</style>
