<template>
  <span v-if="value != null" :class="`delta ${kind} tnum`">{{ sign }} {{ Math.abs(v) }}{{ suffix }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  value?: number | null
  suffix?: string
  invert?: boolean
  showSign?: boolean
}>(), { suffix: '%', invert: false, showSign: true })

const v = computed(() => Math.round(props.value ?? 0))
const isUp = computed(() => v.value > 0)
const isDown = computed(() => v.value < 0)

const kind = computed(() => {
  if (v.value === 0) return 'flat'
  if (isUp.value) return props.invert ? 'down' : 'up'
  return props.invert ? 'up' : 'down'
})

const sign = computed(() => (isUp.value ? '↑' : isDown.value ? '↓' : '·'))
</script>
