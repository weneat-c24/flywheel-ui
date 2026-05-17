<template>
  <span :class="cls">
    <span v-if="dot" class="dot" />
    <slot />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  kind?: 'default' | 'crit' | 'warn' | 'ok' | 'info'
  square?: boolean
  dot?: boolean
}>(), { kind: 'default' })

const cls = computed(() => {
  const base = { crit: 'pill crit', warn: 'pill warn', ok: 'pill ok', info: 'pill info', default: 'pill' }[props.kind] || 'pill'
  return base + (props.square ? ' pill-sq' : '')
})
</script>
