<template>
  <span :class="`pill ${meta.kind}`">
    <component :is="meta.icon" v-if="meta.icon" :size="11" />
    {{ meta.label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icons } from '@/components/icons/Icons'
import type { SessionOutcome } from '@/api/types'

const props = defineProps<{ outcome: SessionOutcome | string }>()

const meta = computed(() => {
  const map: Record<string, { kind: string; label: string; icon?: typeof Icons.Check }> = {
    booked:      { kind: 'ok',   label: 'Booked',       icon: Icons.Check },
    voicemail:   { kind: 'info', label: 'Voicemail',    icon: Icons.Voicemail },
    hangup:      { kind: 'crit', label: 'Hangup',       icon: Icons.Hangup },
    transferred: { kind: 'warn', label: 'Transferred',  icon: Icons.Transfer },
  }
  return map[props.outcome] ?? { kind: 'info', label: props.outcome }
})
</script>
