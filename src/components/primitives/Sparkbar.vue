<template>
  <svg v-if="data && data.length" :width="w" :height="h" class="spark" style="display:block">
    <rect
      v-for="(v, i) in data"
      :key="i"
      :x="i * (bw + 2)"
      :y="h - barHeight(v)"
      :width="bw"
      :height="barHeight(v)"
      rx="1.5"
      :fill="color"
      opacity="0.85"
    />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  data: number[]
  w?: number
  h?: number
  color?: string
}>(), {
  w: 80,
  h: 22,
  color: 'currentColor',
})

const bw = computed(() => (props.w - (props.data.length - 1) * 2) / props.data.length)
const maxVal = computed(() => Math.max(...props.data) || 1)

function barHeight(v: number): number {
  return Math.max(2, (v / maxVal.value) * (props.h - 2))
}
</script>
