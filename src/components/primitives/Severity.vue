<template>
  <Pill :kind="level" dot>{{ label ?? map[level] }}</Pill>
</template>

<script setup lang="ts">
import Pill from './Pill.vue'

const props = withDefaults(defineProps<{
  level?: 'crit' | 'warn' | 'ok' | 'info'
  label?: string
}>(), { level: 'info' })

const map = { crit: 'Critical', warn: 'Warning', ok: 'OK', info: 'Info' } as const
</script>
