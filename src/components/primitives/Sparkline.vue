<template>
  <svg v-if="data && data.length" :width="w" :height="h" class="spark" style="display:block">
    <path v-if="fill" :d="areaPath" :fill="color" opacity="0.08" />
    <path :d="linePath" :stroke="color" :stroke-width="strokeWidth" fill="none" stroke-linejoin="round" stroke-linecap="round" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  data: number[]
  w?: number
  h?: number
  color?: string
  fill?: boolean
  strokeWidth?: number
}>(), {
  w: 80,
  h: 22,
  color: 'currentColor',
  fill: true,
  strokeWidth: 1.5,
})

const points = computed(() => {
  const { data, w, h } = props
  if (!data || data.length === 0) return []
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = (max - min) || 1
  const stepX = w / (data.length - 1 || 1)
  return data.map((v, i) => [i * stepX, h - 2 - ((v - min) / range) * (h - 4)])
})

const linePath = computed(() => {
  return points.value.map((p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ')
})

const areaPath = computed(() => {
  const { w, h } = props
  return linePath.value + ` L ${w},${h} L 0,${h} Z`
})
</script>
