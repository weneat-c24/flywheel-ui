<template>
  <span class="row" :style="{ gap: '5px', color: type === 'chat' ? '#7C3AED' : 'var(--ink-2)', fontWeight: 550, fontSize: '11px', alignItems: 'center' }" :title="type === 'chat' ? 'Chat session' : 'Voice session'">
    <component :is="icon" :size="size" />
    <span v-if="label" style="text-transform:capitalize">{{ type }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icons } from '@/components/icons/Icons'

const props = withDefaults(defineProps<{
  type: 'voice' | 'chat'
  size?: number
  label?: boolean
}>(), { size: 12, label: false })

const icon = computed(() => props.type === 'chat' ? Icons.Chat : Icons.Phone)
</script>
