<template>
  <div v-if="agent" class="page-inner">
    <!-- Agent header -->
    <div class="agent-header">
      <div class="agent-header-left">
        <h1 style="font-size:22px;font-weight:600;letter-spacing:-0.015em;margin:0 0 6px">
          <span class="row" style="gap:10px">
            {{ agent.name }}
            <SessionType v-for="t in agent.sessionTypes" :key="t" :type="t" />
            <Pill v-if="agent.status === 'active'" kind="ok" dot>Active</Pill>
            <Pill v-else kind="info" dot>{{ agent.status }}</Pill>
          </span>
        </h1>
        <div class="agent-header-meta">
          <span class="mono">{{ agent.currentVersion }}</span>
          <span>·</span>
          <span>{{ agent.sessions7d.toLocaleString() }} sessions in last 7d</span>
          <span>·</span>
          <span>First seen {{ agent.firstSeenAt }}</span>
        </div>
      </div>
      <div class="row" style="gap:8px">
        <RouterLink to="/ghl-panel" class="btn">
          <Icons.GHL :size="12" /> View in GHL
        </RouterLink>
      </div>
    </div>

    <!-- Tabs -->
    <AgentTabs
      :agentId="agentId"
      :agent="agent"
      :recs="agentRecs"
      :suggested="agentSuggested"
    />

    <!-- Tab content -->
    <RouterView />
  </div>

  <div v-else-if="isLoading" class="page-inner">
    <div class="sk" style="height:60px;margin-bottom:20px;border-radius:var(--r-md)" />
    <div class="sk" style="height:44px;margin-bottom:22px;border-radius:var(--r-md)" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAgent, useRecommendations } from '@/api/queries'
import { Icons } from '@/components/icons/Icons'
import Pill from '@/components/primitives/Pill.vue'
import SessionType from '@/components/primitives/SessionType.vue'
import AgentTabs from '@/components/agent/AgentTabs.vue'

const route = useRoute()
const agentId = computed(() => route.params.agentId as string)

const { data: agent, isLoading } = useAgent(agentId.value)
const { data: recsData } = useRecommendations(agentId.value)

const agentRecs      = computed(() => recsData.value?.recs ?? [])
const agentSuggested = computed(() => recsData.value?.suggestedKpis ?? [])
</script>
