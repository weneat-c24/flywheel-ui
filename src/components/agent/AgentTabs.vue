<template>
  <div class="tabs">
    <RouterLink
      v-for="tab in tabs"
      :key="tab.id"
      :to="`/agents/${agentId}/${tab.path}`"
      custom
      v-slot="{ isActive, navigate }"
    >
      <button :class="['tab', isActive ? 'active' : '']" @click="navigate">
        {{ tab.label }}
        <span v-if="tab.count != null" class="count tnum">{{ tab.count }}</span>
        <span v-if="tab.dot && !isActive" style="width:6px;height:6px;border-radius:50%;background:var(--critical)" />
      </button>
    </RouterLink>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Agent, PromptRec, SuggestedKpi } from '@/api/types'

const props = defineProps<{
  agentId: string
  agent: Agent
  recs?: PromptRec[]
  suggested?: SuggestedKpi[]
}>()

const totalRecs = computed(() => (props.recs?.length ?? 0) + (props.suggested?.length ?? 0))

const tabs = computed(() => [
  { id: 'dashboard',        path: 'dashboard',         label: 'Dashboard' },
  { id: 'sessions',         path: 'sessions',           label: 'Sessions',         count: props.agent.sessions7d },
  { id: 'tool-reliability', path: 'tool-reliability',  label: 'Tool reliability', dot: props.agent.honestyScore < 90 },
  { id: 'kpis',             path: 'kpis',               label: 'KPIs',             count: 5 },
  { id: 'recommendations',  path: 'recommendations',    label: 'Recommendations',  count: totalRecs.value, dot: totalRecs.value > 0 },
  { id: 'config',           path: 'config',             label: 'Config' },
  { id: 'versions',         path: 'versions',           label: 'Versions',         count: 4 },
])
</script>
