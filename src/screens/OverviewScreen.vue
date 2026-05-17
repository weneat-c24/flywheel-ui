<template>
  <div class="page-inner narrow">
    <!-- Loading -->
    <template v-if="isLoading">
      <div class="page-header">
        <div class="sk" style="height:28px;width:280px;margin-bottom:8px" />
        <div class="sk" style="height:18px;width:480px" />
      </div>
      <div class="metric-strip" style="margin-bottom:28px">
        <div v-for="i in 4" :key="i" class="metric"><div class="sk" style="height:60px" /></div>
      </div>
    </template>

    <template v-else-if="data">
      <!-- Greeting -->
      <div class="page-header">
        <h1 class="page-title">Good afternoon, Avery.</h1>
        <p class="page-sub">
          Across your <b>{{ activeAgents.length }} active agents</b>,
          <b class="tnum">23 sessions</b> in the last 24h need attention — pass rate slipped on the After-Hours Booking Agent, and the
          <code style="font-family:var(--mono);font-size:12px;background:var(--surface-2);padding:1px 5px;border-radius:3px">lookup_history</code>
          tool is being claimed but not called.
        </p>
      </div>

      <!-- Metric strip -->
      <div class="metric-strip" style="margin-bottom:28px">
        <div class="metric">
          <div class="metric-label">
            Total sessions
            <Tooltip tip="Sessions ingested in the last 7 days across all active agents."><span class="help">?</span></Tooltip>
          </div>
          <div class="metric-value">{{ totalSessions.toLocaleString() }}</div>
          <div class="metric-sub">
            <Delta :value="sessionsDelta" />
            <span class="muted tnum">{{ voiceSessions }} voice · {{ chatSessions }} chat</span>
          </div>
        </div>
        <div class="metric">
          <div class="metric-label">
            Pass rate
            <Tooltip tip="Weighted average across all KPIs and active agents. Graded by the external system."><span class="help">?</span></Tooltip>
          </div>
          <div class="metric-value">{{ overallPass }}%</div>
          <div class="metric-sub">
            <Delta :value="passDelta" />
            <span class="muted">vs. previous 7d</span>
          </div>
        </div>
        <div class="metric">
          <div class="metric-label">
            Tool honesty
            <Tooltip tip="Share of sessions with zero false-positive tool claims."><span class="help">?</span></Tooltip>
          </div>
          <div class="metric-value" :style="{ color: honestyAvg < 90 ? 'var(--warning)' : 'var(--ink-1)' }">
            {{ honestyAvg }}<span style="font-size:18px;color:var(--ink-3)">/100</span>
          </div>
          <div class="metric-sub">
            <Delta :value="honestyAvg - honestyPrev" />
            <span class="muted">vs. previous 7d</span>
          </div>
        </div>
        <div class="metric">
          <div class="metric-label">Open insights</div>
          <div class="metric-value">{{ totalOpen + totalSuggested }}</div>
          <div class="metric-sub muted tnum">{{ totalOpen }} prompt fixes · {{ totalSuggested }} suggested KPI{{ totalSuggested === 1 ? '' : 's' }}</div>
        </div>
      </div>

      <!-- Needs attention -->
      <div style="margin-bottom:32px">
        <div class="sec-head">
          <div class="sec-title">Agents needing attention <span class="sec-sub">sorted by 7-day drop</span></div>
          <RouterLink to="/agents" class="sec-link">View all agents <Icons.ArrowRight :size="12" /></RouterLink>
        </div>
        <div class="card" style="overflow:hidden">
          <div
            v-for="(a, i) in needAttention"
            :key="a.id"
            :style="{ display:'grid', gridTemplateColumns:'minmax(0,1.8fr) 100px 200px minmax(0,1.4fr) auto', alignItems:'center', gap:'18px', padding:'16px 20px', borderTop: i ? '1px solid var(--border)' : 'none', cursor:'pointer' }"
            @click="$router.push(`/agents/${a.id}/dashboard`)"
          >
            <div style="min-width:0">
              <div class="row" style="gap:8px">
                <span :class="'sev ' + dropSev(a)" />
                <div style="font-weight:600;font-size:13.5px" class="ellipsis">{{ a.name }}</div>
                <SessionType v-for="t in a.sessionTypes" :key="t" :type="t" />
              </div>
              <div class="muted" style="font-size:11.5px;margin-top:3px;margin-left:14px">
                <span class="mono">{{ a.currentVersion }}</span> · {{ a.sessions7d }} sessions · honesty {{ a.honestyScore }}/100
                <span v-if="a.honestyScore - a.honestyPrev !== 0" :style="{ color: a.honestyScore - a.honestyPrev < 0 ? 'var(--critical)' : 'var(--success)' }">
                  ({{ a.honestyScore - a.honestyPrev > 0 ? '+' : '' }}{{ a.honestyScore - a.honestyPrev }})
                </span>
              </div>
            </div>
            <div>
              <div class="tnum" style="font-weight:600;font-size:15px">{{ a.passRate }}%</div>
              <div style="font-size:11.5px;color:var(--ink-3)">pass rate</div>
            </div>
            <div class="row" style="gap:10px">
              <Sparkline :data="a.passSpark" :w="84" :h="22" :color="a.passRate - a.passRatePrev < 0 ? 'var(--critical)' : 'var(--success)'" />
              <span v-if="a.passRate - a.passRatePrev !== 0" :class="'delta tnum ' + (a.passRate - a.passRatePrev < 0 ? 'down' : 'up')">
                {{ a.passRate - a.passRatePrev < 0 ? '↓' : '↑' }} {{ Math.abs(a.passRate - a.passRatePrev) }}%
              </span>
            </div>
            <div style="min-width:0">
              <div style="font-size:11.5px;color:var(--ink-3);margin-bottom:2px">
                {{ a.topFPTool ? 'Top tool-honesty FP' : 'Top failing KPI' }}
              </div>
              <div class="ellipsis" style="font-size:12.5px">
                <template v-if="a.topFPTool">
                  <code class="mono" style="color:var(--critical)">{{ a.topFPTool }}</code>
                  <span class="muted" style="font-size:11px"> · {{ a.topFPRate }}% FP</span>
                </template>
                <template v-else>{{ a.topFailKPI }}</template>
              </div>
            </div>
            <button class="btn sm">Open agent <Icons.ArrowRight :size="11" /></button>
          </div>
        </div>
      </div>

      <!-- Recent insights -->
      <div style="margin-bottom:32px">
        <div class="sec-head">
          <div class="sec-title">Recent insights <span class="sec-sub">prompt fixes &amp; suggested KPIs across all agents</span></div>
        </div>
        <div class="col" style="gap:10px">
          <div
            v-for="ins in mixedInsights"
            :key="ins.id"
            class="rec"
            style="padding:14px 18px;cursor:pointer"
            @click="openInsight(ins)"
          >
            <div class="between">
              <div style="min-width:0">
                <div class="row" style="gap:8px">
                  <component :is="ins._kind === 'kpi' ? Icons.Target : Icons.Bulb" :size="14" :style="{ color: ins._kind === 'kpi' ? 'var(--accent)' : 'var(--warning)', flexShrink: 0 }" />
                  <h3 style="font-size:14px">{{ ins.title }}</h3>
                  <span v-if="ins._kind === 'kpi'" style="font-size:10px;padding:2px 6px;border-radius:3px;background:var(--accent-soft);color:var(--accent);font-weight:600;letter-spacing:.04em;text-transform:uppercase">Suggested KPI</span>
                  <span v-else style="font-size:10px;padding:2px 6px;border-radius:3px;background:var(--warning-soft);color:var(--warning);font-weight:600;letter-spacing:.04em;text-transform:uppercase">Prompt fix</span>
                </div>
                <div class="meta" style="margin-top:6px">
                  <span>{{ agentName(ins.agentId) }}</span>
                  <span>·</span>
                  <span>{{ insightBasis(ins) }}</span>
                  <template v-if="insightLift(ins)">
                    <span>·</span>
                    <span class="rec-lift">{{ insightLift(ins) }}</span>
                  </template>
                </div>
              </div>
              <Icons.ChevronRight :size="16" class="subtle" />
            </div>
          </div>
        </div>
      </div>

      <!-- Activity ticker -->
      <div>
        <div class="sec-head">
          <button @click="tickerOpen = !tickerOpen" style="display:flex;align-items:center;gap:6px">
            <span class="sec-title">Live ingestion</span>
            <span class="sec-sub">last events received from your agents</span>
            <component :is="tickerOpen ? Icons.ChevronUp : Icons.ChevronDown" :size="14" />
          </button>
          <span class="row" style="gap:6px;font-size:11.5px;color:var(--success);font-weight:550">
            <span style="width:7px;height:7px;border-radius:50%;background:var(--success);animation:pulse 1.4s ease-in-out infinite" />
            Last event 4s ago
          </span>
        </div>
        <div v-if="tickerOpen" class="card card-body" style="padding:4px 18px">
          <div v-for="(t, i) in tickerItems" :key="i" class="ticker-row">
            <span class="when tnum muted">{{ t.when }}</span>
            <Icons.Bulb v-if="t.kind === 'rec'" :size="12" style="color:var(--warning)" />
            <Icons.AlertOctagon v-else-if="t.kind === 'alert'" :size="12" style="color:var(--critical)" />
            <Icons.Dot v-else :size="12" class="subtle" />
            <span>{{ t.text }}</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { apiFetch } from '@/api/client'
import { queryKeys } from '@/api/keys'
import type { Agent, AugmentedSummary, PromptRec, SuggestedKpi } from '@/api/types'
import { ticker as tickerItems } from '@/mocks/fixtures/ticker'
import { recs, suggestedKpis } from '@/mocks/fixtures/recommendations'
import { Icons } from '@/components/icons/Icons'
import Sparkline from '@/components/primitives/Sparkline.vue'
import Delta from '@/components/primitives/Delta.vue'
import Tooltip from '@/components/primitives/Tooltip.vue'
import SessionType from '@/components/primitives/SessionType.vue'

const router = useRouter()
const tickerOpen = ref(true)

const { data, isLoading } = useQuery({
  queryKey: queryKeys.overview(),
  queryFn: () => apiFetch<{ agents: Agent[]; augmentedSummary: AugmentedSummary }>('/overview'),
})

const allAgents = computed(() => data.value?.agents ?? [])
const activeAgents = computed(() => allAgents.value.filter(a => a.status === 'active'))

const totalSessions = computed(() => allAgents.value.reduce((s, a) => s + a.sessions7d, 0))
const prevSessions  = computed(() => allAgents.value.reduce((s, a) => s + a.sessionsPrev7d, 0))
const overallPass   = computed(() => Math.round(allAgents.value.reduce((s, a) => s + a.passRate * a.sessions7d, 0) / (totalSessions.value || 1)))
const prevPass      = computed(() => Math.round(allAgents.value.reduce((s, a) => s + a.passRatePrev * a.sessionsPrev7d, 0) / (prevSessions.value || 1)))
const honestyAvg    = computed(() => Math.round(allAgents.value.reduce((s, a) => s + a.honestyScore * a.sessions7d, 0) / (totalSessions.value || 1)))
const honestyPrev   = computed(() => Math.round(allAgents.value.reduce((s, a) => s + a.honestyPrev * a.sessionsPrev7d, 0) / (prevSessions.value || 1)))
const voiceSessions = computed(() => allAgents.value.filter(a => a.sessionTypes.includes('voice')).reduce((s, a) => s + a.sessions7d, 0))
const chatSessions  = computed(() => totalSessions.value - voiceSessions.value)
const sessionsDelta = computed(() => Math.round(((totalSessions.value - prevSessions.value) / (prevSessions.value || 1)) * 100))
const passDelta     = computed(() => overallPass.value - prevPass.value)

const openRecs       = computed(() => recs.filter(r => r.status === 'open'))
const openSuggested  = computed(() => suggestedKpis.filter(s => s.status === 'open'))
const totalOpen      = computed(() => openRecs.value.length)
const totalSuggested = computed(() => openSuggested.value.length)

const needAttention = computed(() =>
  [...activeAgents.value].sort((a, b) => (a.passRate - a.passRatePrev) - (b.passRate - b.passRatePrev))
)

type MixedInsight = (PromptRec & { _kind: 'prompt' }) | (SuggestedKpi & { _kind: 'kpi' })

const mixedInsights = computed<MixedInsight[]>(() => [
  ...openRecs.value.slice(0, 3).map(r => ({ ...r, _kind: 'prompt' as const })),
  ...openSuggested.value.slice(0, 2).map(s => ({ ...s, _kind: 'kpi' as const })),
].slice(0, 5))

function insightBasis(ins: MixedInsight): string {
  if (ins._kind === 'prompt') return `Based on ${ins.clusterSize} of ${ins.sampleSize} sessions`
  return `Based on ${ins.basis}`
}

function insightLift(ins: MixedInsight): string | undefined {
  if (ins._kind === 'prompt') return ins.lift
  return undefined
}

function agentName(id: string) {
  return allAgents.value.find(a => a.id === id)?.name ?? id
}

function dropSev(a: Agent): string {
  const drop = a.passRate - a.passRatePrev
  return drop <= -10 ? 'crit' : drop <= -3 ? 'warn' : drop < 0 ? 'info' : 'ok'
}

function openInsight(ins: MixedInsight) {
  if (ins._kind === 'kpi') {
    router.push(`/agents/${ins.agentId}/recommendations?focus=${ins.id}&type=kpi`)
  } else {
    router.push(`/agents/${ins.agentId}/recommendations?focus=${ins.id}&type=prompt`)
  }
}
</script>
