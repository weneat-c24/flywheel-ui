<template>
  <div class="page-inner">
    <div class="page-header page-header-row">
      <div>
        <h1 class="page-title row" style="display:flex;align-items:center;gap:10px">
          Monitor
          <span class="row" :style="{
            gap: '6px', fontSize: '12px', fontWeight: 500,
            color: paused ? 'var(--ink-3)' : 'var(--success)',
            textTransform: 'uppercase', letterSpacing: '.08em',
            padding: '3px 10px', borderRadius: '999px',
            background: paused ? 'var(--surface-2)' : 'var(--success-soft)',
            border: `1px solid ${paused ? 'var(--border)' : 'var(--success-border)'}`,
          }">
            <span :style="{
              width: '7px', height: '7px', borderRadius: '50%',
              background: paused ? 'var(--ink-4)' : 'var(--success)',
              animation: paused ? 'none' : 'pulse 1.4s ease-in-out infinite',
              display: 'inline-block',
            }" />
            {{ paused ? 'Paused' : 'Live' }}
          </span>
        </h1>
        <p class="page-sub">External-grader KPIs and Copilot-suggested queries running across your active agents. Streaming results as sessions finish.</p>
      </div>
      <div class="row" style="gap:8px">
        <button class="btn" @click="paused = !paused">
          <template v-if="paused"><Icons.Play :size="11" /> Resume</template>
          <template v-else><span style="display:inline-block;width:8px;height:10px;border-left:2.5px solid currentColor;border-right:2.5px solid currentColor" /> Pause</template>
        </button>
        <button class="btn"><Icons.Download :size="11" /> Export</button>
      </div>
    </div>

    <!-- Live metric strip -->
    <div class="metric-strip" style="margin-bottom:24px">
      <div class="metric">
        <div class="metric-label">
          Active queries
          <Tooltip tip="User-defined KPIs running across all active agents."><span class="help">?</span></Tooltip>
        </div>
        <div class="metric-value">{{ queries.length }}</div>
        <div class="metric-sub muted">across {{ activeAgentCount }} agents</div>
      </div>
      <div class="metric">
        <div class="metric-label">Sessions being graded</div>
        <div class="metric-value row" style="display:flex;align-items:baseline;gap:8px">
          3
          <span style="width:8px;height:8px;border-radius:50%;background:var(--success);animation:pulse 1.4s ease-in-out infinite;align-self:center;display:inline-block" />
        </div>
        <div class="metric-sub muted">avg latency 412ms</div>
      </div>
      <div class="metric">
        <div class="metric-label">Pass rate · last 5 min</div>
        <div class="metric-value" :style="{ color: recentRate >= 80 ? 'var(--success)' : recentRate >= 60 ? 'var(--warning)' : 'var(--critical)' }">
          {{ recentRate }}%
        </div>
        <div class="metric-sub muted tnum">{{ recentPass }} pass · {{ recentFail }} fail</div>
      </div>
      <div class="metric" :style="activeAlerts > 0 ? { borderColor: 'var(--critical-border)', background: 'var(--critical-soft)' } : {}">
        <div class="metric-label">Active alerts</div>
        <div class="metric-value" :style="{ color: activeAlerts > 0 ? 'var(--critical)' : 'var(--ink-1)' }">{{ activeAlerts }}</div>
        <div class="metric-sub">
          <Pill v-if="activeAlerts > 0" kind="crit" dot>queries below threshold</Pill>
          <span v-else class="muted">all queries healthy</span>
        </div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:minmax(0,1fr) 360px;gap:20px">
      <!-- Query grid -->
      <div>
        <div class="between" style="margin-bottom:14px">
          <div class="chips">
            <button :class="['chip', filter === 'all' ? 'active' : '']" @click="filter = 'all'">All · {{ queries.length }}</button>
            <button :class="['chip', filter === 'failing' ? 'active' : '']" @click="filter = 'failing'">
              <span class="sev crit" /> Failing · {{ queries.filter(q => q.sev === 'crit').length }}
            </button>
            <button :class="['chip', filter === 'warning' ? 'active' : '']" @click="filter = 'warning'">
              <span class="sev warn" /> Warning · {{ queries.filter(q => q.sev === 'warn').length }}
            </button>
            <button :class="['chip', filter === 'healthy' ? 'active' : '']" @click="filter = 'healthy'">
              <span class="sev ok" /> Healthy · {{ queries.filter(q => q.sev === 'ok').length }}
            </button>
          </div>
          <div class="muted" style="font-size:12px">Sorted by health · last 7d</div>
        </div>

        <div class="col" style="gap:10px">
          <div v-if="filteredQueries.length === 0" class="empty">
            <h3>No queries match this filter</h3>
          </div>
          <button
            v-for="q in filteredQueries"
            :key="q.id"
            class="card"
            @click="selectedQuery = q"
            style="padding:14px 18px;display:grid;grid-template-columns:auto minmax(0,1.6fr) minmax(0,1fr) auto auto auto auto;gap:18px;align-items:center;cursor:pointer;text-align:left;border-left-width:3px;border-left-style:solid"
            :style="{ borderLeftColor: q.sev === 'crit' ? 'var(--critical)' : q.sev === 'warn' ? 'var(--warning)' : 'var(--success-border)' }"
          >
            <span :class="'sev ' + q.sev" />
            <div style="min-width:0">
              <div class="row" style="gap:6px">
                <span style="font-size:13.5px;font-weight:600" class="ellipsis">{{ q.kpiName }}</span>
                <Pill kind="default">{{ q.kpiType.replace('_', ' ') }}</Pill>
              </div>
              <div class="muted" style="font-size:11.5px;margin-top:3px">
                {{ q.agentName }} · weight {{ q.weight }}
              </div>
            </div>
            <div class="muted" style="font-size:11.5px">
              <div>Last evaluated</div>
              <div class="tnum" style="color:var(--ink-1);margin-top:2px">{{ q.last }}</div>
            </div>
            <div style="text-align:right">
              <div class="tnum" :style="{ fontSize: '16px', fontWeight: 600, color: q.sev === 'crit' ? 'var(--critical)' : 'var(--ink-1)' }">{{ q.passRate }}%</div>
              <div class="muted" style="font-size:10.5px">7d</div>
            </div>
            <Sparkline :data="q.spark" :w="70" :h="22" :color="q.sev === 'crit' ? 'var(--critical)' : q.sev === 'warn' ? 'var(--warning)' : 'var(--success)'" />
            <div class="row" style="gap:6px;font-size:11.5px">
              <span class="row tnum" style="gap:3px;color:var(--success)">
                <Icons.Check :size="11" /> {{ q.pass5min }}
              </span>
              <span class="row tnum" style="gap:3px;color:var(--critical)">
                <Icons.X :size="11" /> {{ q.fail5min }}
              </span>
            </div>
            <Icons.ChevronRight :size="13" class="subtle" />
          </button>
        </div>
      </div>

      <!-- Live event ticker -->
      <aside style="position:sticky;top:0;align-self:start">
        <div class="card" style="overflow:hidden">
          <div class="card-head">
            <div class="row" style="gap:6px">
              <Icons.Activity :size="13" />
              <div class="card-title">Live event stream</div>
            </div>
            <span class="card-sub">{{ events.length }} events</span>
            <span style="margin-left:auto;width:7px;height:7px;border-radius:50%;display:inline-block"
              :style="{ background: paused ? 'var(--ink-4)' : 'var(--success)', animation: paused ? 'none' : 'pulse 1.4s ease-in-out infinite' }"
            />
          </div>
          <div style="max-height:68vh;overflow-y:auto">
            <div
              v-for="(e, i) in events"
              :key="e.id"
              style="padding:10px 14px;display:grid;grid-template-columns:auto 1fr;gap:10px;font-size:12px"
              :style="{
                borderTop: i ? '1px solid var(--border)' : 'none',
                background: i === 0 && !paused ? 'var(--surface-2)' : 'transparent',
                animation: i === 0 && !paused ? 'fadeIn .3s ease-out' : 'none',
              }"
            >
              <span class="tnum muted" style="font-size:10.5px;padding-top:3px;font-family:var(--mono)">{{ e.ago }}</span>
              <div style="min-width:0">
                <div class="row" style="gap:6px;align-items:flex-start">
                  <Icons.Check v-if="e.kind === 'pass'" :size="11" style="color:var(--success);margin-top:2px;flex-shrink:0" />
                  <Icons.X v-else-if="e.kind === 'fail'" :size="11" style="color:var(--critical);margin-top:2px;flex-shrink:0" />
                  <Icons.Sparkles v-else-if="e.kind === 'graded'" :size="11" style="color:var(--accent);margin-top:2px;flex-shrink:0" />
                  <Icons.AlertOctagon v-else-if="e.kind === 'alert'" :size="11" style="color:var(--critical);margin-top:2px;flex-shrink:0" />
                  <div style="min-width:0;flex:1;line-height:1.4">
                    <div class="ellipsis" style="font-weight:500">{{ e.title }}</div>
                    <div class="muted ellipsis" style="font-size:11px;margin-top:2px">{{ e.agent }} · {{ e.detail }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>

    <!-- Query drill-in modal -->
    <Modal v-if="selectedQuery" :open="true" @close="selectedQuery = null" size="lg" :title="selectedQuery.kpiName">
      <template #footer>
        <button class="btn" @click="selectedQuery = null">Close</button>
        <RouterLink :to="`/agents/${selectedQuery.agentId}/dashboard`" class="btn primary" @click="selectedQuery = null">
          Open agent <Icons.ArrowRight :size="11" />
        </RouterLink>
      </template>

      <div class="row" style="gap:8px;margin-bottom:14px">
        <span :class="'sev ' + selectedQuery.sev" />
        <span class="muted">{{ selectedQuery.agentName }}</span>
        <span class="muted">·</span>
        <Pill kind="default">{{ selectedQuery.kpiType.replace('_', ' ') }}</Pill>
        <Pill kind="default">weight {{ selectedQuery.weight }}</Pill>
      </div>

      <div style="padding:14px;background:var(--surface-2);border-radius:var(--r-md);border:1px solid var(--border);margin-bottom:14px">
        <div class="muted" style="font-size:11px;text-transform:uppercase;letter-spacing:.06em;font-weight:600;margin-bottom:6px">Query definition</div>
        <div style="font-size:13px;line-height:1.55;font-style:italic;color:var(--ink-2)">
          "{{ selectedQuery.definition }}"
        </div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px">
        <div style="padding:10px;background:var(--surface-2);border-radius:var(--r-sm)">
          <div class="muted" style="font-size:10.5px">Pass rate · 7d</div>
          <div class="tnum" style="font-size:18px;font-weight:600" :style="{ color: selectedQuery.sev === 'crit' ? 'var(--critical)' : 'var(--ink-1)' }">
            {{ selectedQuery.passRate }}%
          </div>
        </div>
        <div style="padding:10px;background:var(--surface-2);border-radius:var(--r-sm)">
          <div class="muted" style="font-size:10.5px">Sessions evaluated</div>
          <div class="tnum" style="font-size:18px;font-weight:600">{{ selectedQuery.sessions }}</div>
        </div>
        <div style="padding:10px;background:var(--surface-2);border-radius:var(--r-sm)">
          <div class="muted" style="font-size:10.5px">Pass · 5m</div>
          <div class="tnum" style="font-size:18px;font-weight:600;color:var(--success)">{{ selectedQuery.pass5min }}</div>
        </div>
        <div style="padding:10px;background:var(--surface-2);border-radius:var(--r-sm)">
          <div class="muted" style="font-size:10.5px">Fail · 5m</div>
          <div class="tnum" style="font-size:18px;font-weight:600;color:var(--critical)">{{ selectedQuery.fail5min }}</div>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { apiFetch } from '@/api/client'
import { queryKeys } from '@/api/keys'
import type { Agent } from '@/api/types'
import { Icons } from '@/components/icons/Icons'
import Pill from '@/components/primitives/Pill.vue'
import Tooltip from '@/components/primitives/Tooltip.vue'
import Sparkline from '@/components/primitives/Sparkline.vue'
import Modal from '@/components/primitives/Modal.vue'
import { useSSE } from '@/composables/useSSE'
import { isMockMode } from '@/utils/mockMode'

interface MonitorQuery {
  id: string
  agentId: string
  agentName: string
  kpiName: string
  kpiType: string
  weight: number
  sev: 'ok' | 'warn' | 'crit'
  passRate: number
  sessions: number
  last: string
  spark: number[]
  pass5min: number
  fail5min: number
  definition: string
}


const filter = ref('all')
const selectedQuery = ref<MonitorQuery | null>(null)

const { events, paused } = useSSE()

const { data: overviewData } = useQuery({
  queryKey: queryKeys.overview(),
  queryFn: () => apiFetch<{ agents: Agent[] }>('/overview'),
})

const activeAgentCount = computed(() => overviewData.value?.agents.filter(a => a.status === 'active').length ?? 0)

const kpiDefs = [
  { id: 'k1', name: 'Appointment booked', type: 'binary', weight: 5, passRate: 68, sessions: 84, definition: 'Did the agent successfully create an appointment for the caller before the call ended?' },
  { id: 'k2', name: 'Timezone confirmed before booking', type: 'compliance_phrase', weight: 5, passRate: 38, sessions: 84, definition: "Did the agent explicitly confirm the caller's timezone before stating time slots or confirming the booking?" },
  { id: 'k3', name: 'Service address collected', type: 'binary', weight: 4, passRate: 91, sessions: 84, definition: 'Did the agent collect a complete service address before booking?' },
  { id: 'k4', name: 'Emergency detection', type: 'binary', weight: 5, passRate: 74, sessions: 84, definition: 'Did the agent ask whether this was an emergency within the first 30 seconds?' },
  { id: 'k5', name: 'Stayed under 4 minutes', type: 'numeric_threshold', weight: 2, passRate: 81, sessions: 84, definition: 'Did the call duration stay below 4 minutes?' },
  { id: 's1', name: 'Satisfaction question asked', type: 'compliance_phrase', weight: 5, passRate: 96, sessions: 184, definition: 'Did the agent ask the caller to rate their satisfaction before ending the call?' },
  { id: 's2', name: 'Issue captured if dissatisfied', type: 'binary', weight: 4, passRate: 78, sessions: 28, definition: 'When caller expressed dissatisfaction, did the agent capture the issue details?' },
  { id: 'm1', name: 'Reschedule offer made', type: 'binary', weight: 4, passRate: 84, sessions: 96, definition: 'Did the agent offer to reschedule if the caller could not make the suggested time?' },
  { id: 'm2', name: 'Confirmed maintenance type', type: 'binary', weight: 3, passRate: 92, sessions: 96, definition: 'Did the agent confirm the type of maintenance required before ending the call?' },
]

const lastMap: Record<string, string> = {
  k1: '12s ago', k2: '4s ago', k3: '38s ago', k4: '1m ago', k5: '2m ago',
  s1: '22s ago', s2: '5m ago', m1: '3m ago', m2: '14m ago',
}

function makeSpark(passRate: number, id: string): number[] {
  const seed = id.charCodeAt(id.length - 1)
  return Array.from({ length: 12 }, (_, i) => {
    const variance = ((seed * (i + 1)) % 12) - 6
    return Math.max(20, Math.min(100, passRate + variance))
  })
}

const agentKpiMap: Record<string, { agentId: string; agentName: string; kpiIds: string[] }> = {
  a1: { agentId: 'a1', agentName: 'After-Hours Booking Agent', kpiIds: ['k1','k2','k3','k4','k5'] },
  a2: { agentId: 'a2', agentName: 'Service Follow-Up Agent', kpiIds: ['s1','s2'] },
  a4: { agentId: 'a4', agentName: 'Maintenance Reminder Caller', kpiIds: ['m1','m2'] },
}

const mockQueries = computed<MonitorQuery[]>(() => {
  const result: MonitorQuery[] = []
  for (const [, info] of Object.entries(agentKpiMap)) {
    for (const kpiId of info.kpiIds) {
      const kpi = kpiDefs.find(k => k.id === kpiId)
      if (!kpi) continue
      const sev: 'ok' | 'warn' | 'crit' = kpi.passRate >= 80 ? 'ok' : kpi.passRate >= 60 ? 'warn' : 'crit'
      const pass5min = Math.max(0, Math.round((kpi.passRate / 100) * (3 + (kpiId.length % 4))))
      const fail5min = Math.max(0, Math.round(((100 - kpi.passRate) / 100) * (2 + (kpiId.length % 3))))
      result.push({
        id: info.agentId + ':' + kpiId,
        agentId: info.agentId,
        agentName: info.agentName,
        kpiName: kpi.name,
        kpiType: kpi.type,
        weight: kpi.weight,
        sev,
        passRate: kpi.passRate,
        sessions: kpi.sessions,
        last: lastMap[kpiId] ?? 'just now',
        spark: makeSpark(kpi.passRate, kpiId),
        pass5min,
        fail5min,
        definition: kpi.definition,
      })
    }
  }
  return result.sort((a, b) => {
    const rank = (s: string) => s === 'crit' ? 0 : s === 'warn' ? 1 : 2
    return rank(a.sev) - rank(b.sev)
  })
})

const { data: apiQueries } = useQuery({
  queryKey: ['monitor', 'queries'],
  queryFn: () => apiFetch<MonitorQuery[]>('/monitor/queries'),
  enabled: computed(() => !isMockMode()),
})

const queries = computed<MonitorQuery[]>(() => {
  if (isMockMode()) return mockQueries.value
  return apiQueries.value ?? []
})

const filteredQueries = computed(() => {
  if (filter.value === 'failing') return queries.value.filter(q => q.sev === 'crit')
  if (filter.value === 'warning') return queries.value.filter(q => q.sev === 'warn')
  if (filter.value === 'healthy') return queries.value.filter(q => q.sev === 'ok')
  return queries.value
})


const recentPass = computed(() => events.value.filter(e => e.kind === 'pass').slice(0, 30).length)
const recentFail = computed(() => events.value.filter(e => e.kind === 'fail').slice(0, 30).length)
const recentRate = computed(() => {
  const total = recentPass.value + recentFail.value
  return total > 0 ? Math.round(recentPass.value / total * 100) : 0
})
const activeAlerts = computed(() => queries.value.filter(q => q.sev === 'crit').length)
</script>
