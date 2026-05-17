<template>
  <div class="page-inner">
    <div class="page-header page-header-row">
      <div>
        <h1 class="page-title">Agents</h1>
        <p class="page-sub" v-if="agents">{{ agents.length }} observed · {{ agents.filter(a => a.status === 'active').length }} active · streamed in from your agent platform</p>
      </div>
      <div class="row" style="gap:8px">
        <button class="btn"><Icons.Download :size="12" /> Export</button>
      </div>
    </div>

    <div class="banner" style="margin-bottom:16px">
      <Icons.Info :size="14" class="ic" />
      <div><b>Agents appear automatically</b> as their first session is ingested. We don't create or configure agents — that happens in your agent platform.</div>
    </div>

    <div class="chips" style="margin-bottom:16px">
      <button
        v-for="c in filterChips"
        :key="c.id"
        :class="['chip', filter === c.id ? 'active' : '']"
        @click="filter = c.id"
      >{{ c.label }}</button>
    </div>

    <div v-if="isLoading">
      <div class="sk" style="height:200px;border-radius:var(--r-lg)" />
    </div>

    <div v-else-if="filtered" class="card" style="overflow:hidden">
      <table class="tbl">
        <thead>
          <tr>
            <th>Agent</th>
            <th>Type</th>
            <th>Status</th>
            <th class="num">Sessions 7d</th>
            <th>Pass rate</th>
            <th>Honesty</th>
            <th class="num">Open insights</th>
            <th>Version</th>
            <th>Last session</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="a in filtered" :key="a.id" @click="$router.push(`/agents/${a.id}/dashboard`)">
            <td>
              <div style="font-weight:550">{{ a.name }}</div>
              <div class="muted" style="font-size:11px;margin-top:2px">since {{ a.firstSeenAt }}</div>
            </td>
            <td>
              <div class="row" style="gap:4px">
                <SessionType v-for="t in a.sessionTypes" :key="t" :type="t" label />
              </div>
            </td>
            <td>
              <Pill v-if="a.status === 'active'" kind="ok" dot>Active</Pill>
              <Pill v-else-if="a.status === 'quiet'" kind="info" dot>Quiet</Pill>
              <Pill v-else kind="info" dot>Dormant</Pill>
            </td>
            <td class="num tnum">{{ a.sessions7d || '—' }}</td>
            <td>
              <div class="row" style="gap:10px">
                <span class="tnum" style="font-weight:600;min-width:36px">{{ a.passRate }}%</span>
                <Sparkline :data="a.passSpark" :w="70" :h="20" :color="(a.passRate - a.passRatePrev) < 0 ? 'var(--critical)' : 'var(--success)'" />
                <Delta v-if="a.passRate - a.passRatePrev !== 0" :value="a.passRate - a.passRatePrev" />
              </div>
            </td>
            <td>
              <div class="row" style="gap:8px">
                <span class="tnum" style="font-weight:600" :style="{ color: a.honestyScore < 90 ? 'var(--warning)' : 'var(--ink-1)' }">{{ a.honestyScore }}</span>
                <Sparkline :data="a.honestySpark" :w="50" :h="18" :color="a.honestyScore < 90 ? 'var(--warning)' : 'var(--success)'" />
              </div>
            </td>
            <td class="num tnum">{{ (a.openRecs + a.suggestedKpiCount) || '—' }}</td>
            <td class="mono muted">{{ a.currentVersion }}</td>
            <td class="muted">{{ a.lastSessionAt }}</td>
            <td style="width:40px">
              <button class="iconbtn" @click.stop><Icons.More :size="14" /></button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAgents } from '@/api/queries'
import { Icons } from '@/components/icons/Icons'
import Sparkline from '@/components/primitives/Sparkline.vue'
import Delta from '@/components/primitives/Delta.vue'
import Pill from '@/components/primitives/Pill.vue'
import SessionType from '@/components/primitives/SessionType.vue'

const { data: agents, isLoading } = useAgents()
const filter = ref('all')

const filterChips = computed(() => {
  const all = agents.value ?? []
  return [
    { id: 'all',       label: `All · ${all.length}` },
    { id: 'active',    label: `Active · ${all.filter(a => a.status === 'active').length}` },
    { id: 'attention', label: 'Needs attention · 1' },
    { id: 'voice',     label: `Voice · ${all.filter(a => a.sessionTypes.includes('voice')).length}` },
    { id: 'chat',      label: `Chat · ${all.filter(a => a.sessionTypes.includes('chat')).length}` },
  ]
})

const filtered = computed(() => {
  const all = agents.value ?? []
  if (filter.value === 'active')    return all.filter(a => a.status === 'active')
  if (filter.value === 'quiet')     return all.filter(a => a.status === 'quiet' || a.status === 'dormant')
  if (filter.value === 'attention') return all.filter(a => a.status === 'active' && a.passRate < a.passRatePrev)
  if (filter.value === 'voice')     return all.filter(a => a.sessionTypes.includes('voice'))
  if (filter.value === 'chat')      return all.filter(a => a.sessionTypes.includes('chat'))
  return all
})
</script>
