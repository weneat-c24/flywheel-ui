<template>
  <div style="display:grid;grid-template-columns:220px 1fr;gap:24px;min-height:0">
    <!-- Filter rail -->
    <aside class="filter-rail">
      <div class="filter-grp">
        <h4>Date range</h4>
        <DateRange v-model="dateRange" />
      </div>
      <div class="filter-grp">
        <h4>Outcome</h4>
        <label v-for="o in outcomeOptions" :key="o.id" class="checkrow">
          <input type="checkbox" :checked="outcomes.has(o.id)" @change="toggleOutcome(o.id)" />
          <component :is="o.icon" :size="12" class="subtle" />
          <span class="grow">{{ o.label }}</span>
          <span class="muted tnum">{{ o.count }}</span>
        </label>
      </div>
      <div class="filter-grp">
        <h4>KPI result</h4>
        <label class="checkrow">
          <input type="checkbox" v-model="failedOnly" />
          <span>Failed any KPI</span>
        </label>
        <div style="margin-top:6px">
          <select class="input" style="height:28px;font-size:12px" v-model="kpiFilter">
            <option value="">Filter by specific KPI…</option>
            <option v-for="k in kpis" :key="k.id" :value="k.id">{{ k.name }}</option>
          </select>
        </div>
      </div>
      <div class="filter-grp">
        <h4>Tool honesty</h4>
        <label class="checkrow">
          <input type="checkbox" v-model="fpOnly" />
          <span>Any FP tool claim</span>
        </label>
      </div>
      <div class="filter-grp">
        <h4>Duration</h4>
        <div class="row" style="gap:6px">
          <input class="input" placeholder="min" style="height:28px;font-size:12px" />
          <span class="muted">–</span>
          <input class="input" placeholder="max" style="height:28px;font-size:12px" />
        </div>
      </div>
      <div class="filter-grp">
        <h4>Agent version</h4>
        <select class="input" style="height:28px;font-size:12px" v-model="versionFilter">
          <option value="all">All versions</option>
          <option value="v4">v4 (current)</option>
          <option value="v3">v3</option>
          <option value="v2">v2</option>
        </select>
      </div>
    </aside>

    <!-- Main content -->
    <div style="min-width:0">
      <div class="between" style="margin-bottom:12px">
        <div class="row" style="gap:10px">
          <div class="search" style="width:280px">
            <Icons.Search :size="13" />
            <input
              v-model="search"
              placeholder="Search transcripts, caller…"
              style="border:0;outline:none;background:transparent;flex:1;color:var(--ink-1);min-width:0"
            />
          </div>
          <span class="muted" style="font-size:12px">{{ filtered.length }} of {{ sessions?.length ?? 0 }} sessions</span>
        </div>
        <div class="row" style="gap:8px">
          <button class="btn"><Icons.Download :size="12" /> Export</button>
        </div>
      </div>

      <!-- Active filter chips -->
      <div v-if="activeChips.length" class="chips" style="margin-bottom:14px">
        <span class="muted" style="font-size:12px;margin-right:4px">Active filters:</span>
        <span
          v-for="c in activeChips"
          :key="c.id"
          class="chip active"
          @click="c.clear()"
          style="cursor:pointer"
        >
          {{ c.label }}
          <Icons.X :size="11" />
        </span>
        <button class="chip" @click="clearAll">Clear all</button>
      </div>

      <div v-if="isLoading">
        <div class="sk" style="height:300px;border-radius:var(--r-lg)" />
      </div>

      <div v-else class="card" style="overflow:hidden">
        <table class="tbl">
          <thead>
            <tr>
              <th>Time</th>
              <th>Type</th>
              <th>Duration</th>
              <th>Caller</th>
              <th>Outcome</th>
              <th>KPIs</th>
              <th>Honesty</th>
              <th>Severity</th>
              <th>Version</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="s in filtered"
              :key="s.id"
              :class="s.id === 'c4' ? 'selected' : ''"
              @click="navigateTo(s.id)"
              style="cursor:pointer"
            >
              <td class="tnum muted">{{ s.time }}</td>
              <td><SessionType :type="s.type" /></td>
              <td class="mono tnum">{{ s.dur }}</td>
              <td class="mono">{{ s.caller }}</td>
              <td><OutcomeBadge :outcome="s.outcome" /></td>
              <td>
                <span class="tnum" style="font-weight:550">{{ s.passed }}</span>
                <span v-if="s.failedKpis?.length" class="muted" style="font-size:11.5px;margin-left:8px">
                  {{ kpiNames(s.failedKpis).join(', ') }}
                  <template v-if="(s.failedKpis?.length ?? 0) > 2"> +{{ (s.failedKpis?.length ?? 0) - 2 }}</template>
                </span>
              </td>
              <td>
                <Pill v-if="s.fp > 0" kind="crit">⚠ {{ s.fp }} FP</Pill>
                <span v-else class="row" style="gap:4px;color:var(--success);font-size:11.5px;font-weight:550">
                  <Icons.Check :size="11" />
                </span>
              </td>
              <td>
                <template v-if="s.maxSev === 'crit' || s.maxSev === 'warn'">
                  <Pill :kind="s.maxSev === 'crit' ? 'crit' : 'warn'" dot>{{ s.maxSev === 'crit' ? 'Critical' : 'Warning' }}</Pill>
                </template>
                <span v-else-if="s.maxSev === 'info'" class="muted">—</span>
                <Pill v-else kind="ok" dot>OK</Pill>
              </td>
              <td class="mono muted">{{ s.version }}</td>
              <td><Icons.ChevronRight :size="13" class="subtle" /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSessions, useKpis } from '@/api/queries'
import { Icons } from '@/components/icons/Icons'
import Pill from '@/components/primitives/Pill.vue'
import SessionType from '@/components/primitives/SessionType.vue'
import OutcomeBadge from '@/components/primitives/OutcomeBadge.vue'
import DateRange from '@/components/primitives/DateRange.vue'

const route = useRoute()
const router = useRouter()
const agentId = computed(() => route.params.agentId as string)

const { data: sessions, isLoading } = useSessions(agentId.value)
const { data: kpis } = useKpis(agentId.value)

const dateRange = ref('7d')
const search = ref('')
const failedOnly = ref(false)
const fpOnly = ref(false)
const kpiFilter = ref('')
const versionFilter = ref('all')
const outcomes = ref<Set<string>>(new Set())

const outcomeOptions = computed(() => [
  { id: 'booked',      label: 'Booked',      count: sessions.value?.filter(s => s.outcome === 'booked').length ?? 0,      icon: Icons.Check },
  { id: 'voicemail',   label: 'Voicemail',   count: sessions.value?.filter(s => s.outcome === 'voicemail').length ?? 0,   icon: Icons.Voicemail },
  { id: 'hangup',      label: 'Hangup',      count: sessions.value?.filter(s => s.outcome === 'hangup').length ?? 0,      icon: Icons.Hangup },
  { id: 'transferred', label: 'Transferred', count: sessions.value?.filter(s => s.outcome === 'transferred').length ?? 0, icon: Icons.Transfer },
])

function toggleOutcome(id: string) {
  const s = new Set(outcomes.value)
  if (s.has(id)) s.delete(id); else s.add(id)
  outcomes.value = s
}

function clearAll() {
  failedOnly.value = false
  fpOnly.value = false
  kpiFilter.value = ''
  outcomes.value = new Set()
}

const activeChips = computed(() => {
  const chips: { id: string; label: string; clear: () => void }[] = []
  if (failedOnly.value) chips.push({ id: 'failed', label: 'Failed only', clear: () => { failedOnly.value = false } })
  if (fpOnly.value) chips.push({ id: 'fp', label: 'Any FP tool claim', clear: () => { fpOnly.value = false } })
  if (kpiFilter.value) {
    const name = kpis.value?.find(k => k.id === kpiFilter.value)?.name ?? kpiFilter.value
    chips.push({ id: 'kpi', label: `KPI: ${name}`, clear: () => { kpiFilter.value = '' } })
  }
  for (const o of outcomes.value) {
    chips.push({ id: o, label: `Outcome: ${o}`, clear: () => toggleOutcome(o) })
  }
  return chips
})

const filtered = computed(() => {
  let list = sessions.value ?? []
  if (outcomes.value.size) list = list.filter(s => outcomes.value.has(s.outcome))
  if (failedOnly.value) list = list.filter(s => s.maxSev === 'crit' || s.maxSev === 'warn')
  if (fpOnly.value) list = list.filter(s => s.fp > 0)
  if (kpiFilter.value) list = list.filter(s => s.failedKpis?.includes(kpiFilter.value))
  if (search.value) list = list.filter(s => s.caller.includes(search.value) || s.id.includes(search.value))
  return list
})

function kpiNames(failedKpiIds: string[]): string[] {
  return failedKpiIds
    .slice(0, 2)
    .map(kid => {
      const name = kpis.value?.find(k => k.id === kid)?.name ?? kid
      return name.split(' ').slice(0, 2).join(' ')
    })
}

function navigateTo(sessionId: string) {
  router.push(`/agents/${agentId.value}/sessions/${sessionId}`)
}
</script>
