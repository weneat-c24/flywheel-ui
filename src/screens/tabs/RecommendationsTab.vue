<template>
  <div>
    <!-- Sub-tabs -->
    <div class="recs-subtabs">
      <button :class="['recs-subtab', sub === 'prompt' ? 'active' : '']" @click="sub = 'prompt'">
        <Icons.Bulb :size="14" />
        <span>Prompt improvements</span>
        <span class="count tnum">{{ openPromptCount }}</span>
      </button>
      <button :class="['recs-subtab', sub === 'kpi' ? 'active' : '']" @click="sub = 'kpi'">
        <Icons.Target :size="14" />
        <span>Suggested new KPIs</span>
        <span class="count tnum">{{ openKpiCount }}</span>
      </button>
    </div>

    <div class="between" style="margin-bottom:16px;margin-top:14px">
      <div class="chips">
        <button :class="['chip', filter === 'open' ? 'active' : '']" @click="filter = 'open'">Open</button>
        <button :class="['chip', filter === 'applied' ? 'active' : '']" @click="filter = 'applied'">
          Marked applied · {{ Object.keys(appliedMap).length }}
        </button>
        <button :class="['chip', filter === 'dismissed' ? 'active' : '']" @click="filter = 'dismissed'">Dismissed · 0</button>
        <button :class="['chip', filter === 'all' ? 'active' : '']" @click="filter = 'all'">All</button>
      </div>
      <div class="row" style="gap:8px">
        <span class="mock-tag">Re-analyzed 2h ago</span>
        <button class="btn"><Icons.Reset :size="11" /> Run analysis now</button>
      </div>
    </div>

    <!-- Prompt improvements -->
    <div v-if="sub === 'prompt'" class="col" style="gap:14px">
      <div v-if="filteredRecs.length === 0" class="empty">
        <h3>No prompt recommendations match this filter</h3>
      </div>
      <div
        v-for="r in filteredRecs"
        :key="r.id"
        class="rec"
        :ref="el => { if (r.id === focusId) focusEl = el as HTMLElement }"
        :style="appliedMap[r.id] ? { opacity: 0.85, borderColor: 'var(--success-border)', background: 'var(--success-soft)' } : {}"
      >
        <div class="between">
          <div style="min-width:0;flex:1">
            <div class="row" style="gap:8px">
              <Icons.Bulb :size="15" :style="{ color: appliedMap[r.id] ? 'var(--success)' : 'var(--warning)', flexShrink: 0 }" />
              <h3>{{ r.title }}</h3>
              <Pill v-if="appliedMap[r.id]" kind="ok" dot>Marked applied</Pill>
            </div>
            <p class="muted" style="font-size:12.5px;margin:6px 0 0;line-height:1.5;max-width:780px">{{ r.summary }}</p>
            <div class="meta" style="margin-top:10px">
              <span class="row" style="gap:4px">
                <Icons.Layers :size="11" />
                Based on <b style="color:var(--ink-1)">{{ r.clusterSize }} of {{ r.sampleSize }}</b> sessions · last {{ r.windowDays }}d
              </span>
              <span>·</span>
              <span class="row" style="gap:6px">
                Affected KPIs:
                <Pill v-for="k in r.affectedKPIs" :key="k" kind="default">{{ k.split(' ').slice(0, 3).join(' ') }}</Pill>
              </span>
              <span>·</span>
              <span class="rec-lift">
                <Icons.Trend :size="11" /> {{ r.lift }}
                <Tooltip tip="Modeled estimate based on the failure cluster. Not guaranteed.">
                  <span class="help" style="background:rgba(22,163,74,.15);color:var(--success)">?</span>
                </Tooltip>
              </span>
            </div>
          </div>
          <button class="btn ghost sm" @click="toggleExpand(r.id)">
            {{ expandedSet.has(r.id) ? 'Collapse' : 'Expand' }}
            <component :is="expandedSet.has(r.id) ? Icons.ChevronUp : Icons.ChevronDown" :size="11" />
          </button>
        </div>

        <template v-if="expandedSet.has(r.id)">
          <hr class="sep" />
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
            <div>
              <div class="muted" style="font-size:11px;text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px;font-weight:600">Current prompt excerpt</div>
              <div class="diff">
                <div v-for="(l, i) in r.promptCurrent" :key="i" class="diff-line rem">{{ l.replace(/^  /, '') }}</div>
              </div>
            </div>
            <div>
              <div class="muted" style="font-size:11px;text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px;font-weight:600">Suggested change</div>
              <div class="diff">
                <div v-for="(l, i) in r.promptSuggested" :key="i" class="diff-line add">{{ l.replace(/^  /, '') }}</div>
              </div>
            </div>
          </div>

          <template v-if="r.sampleSessions.length > 0">
            <div class="muted" style="font-size:11px;text-transform:uppercase;letter-spacing:.06em;margin:16px 0 8px;font-weight:600">Sample failing sessions</div>
            <div class="col" style="gap:6px">
              <button
                v-for="cid in r.sampleSessions"
                :key="cid"
                class="rec-mini"
                @click="navigateToSession(cid)"
              >
                <span :class="'sev ' + (sessionSev(cid) || 'info')" />
                <span class="tnum muted" style="min-width:130px">{{ sessionTime(cid) }}</span>
                <SessionType :type="sessionType(cid)" />
                <span class="mono">{{ sessionCaller(cid) }}</span>
                <span class="grow" />
                <OutcomeBadge :outcome="sessionOutcome(cid)" />
                <Icons.ChevronRight :size="12" class="subtle" />
              </button>
            </div>
          </template>

          <div class="row" style="justify-content:space-between;gap:8px;margin-top:16px">
            <span class="muted" style="font-size:11.5px;font-style:italic">
              We don't write back to your agent platform. Edit there, then mark applied here to track.
            </span>
            <div class="row" style="gap:8px">
              <button class="btn ghost">Dismiss</button>
              <template v-if="!appliedMap[r.id]">
                <button class="btn" @click="fakeCopy('Prompt diff')">
                  <Icons.Copy :size="11" /> Copy diff
                </button>
                <button class="btn primary" @click="markApplied(r.id)">
                  <Icons.Check :size="11" /> Mark applied
                </button>
              </template>
              <Pill v-else kind="ok" dot>Tracking · waiting for next session</Pill>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Suggested KPIs -->
    <div v-if="sub === 'kpi'" class="col" style="gap:14px">
      <div v-if="filteredKpis.length === 0" class="empty">
        <h3>No KPI suggestions match this filter</h3>
        <p>Our analysis surfaces KPIs you may want to add when transcripts show failure patterns the existing grader can't catch.</p>
      </div>
      <div
        v-for="s in filteredKpis"
        :key="s.id"
        class="rec"
        :ref="el => { if (s.id === focusId) focusEl = el as HTMLElement }"
        :style="{
          borderStyle: appliedMap[s.id] ? 'solid' : 'dashed',
          borderColor: appliedMap[s.id] ? 'var(--success-border)' : 'var(--accent)',
          background: appliedMap[s.id] ? 'var(--success-soft)' : 'linear-gradient(180deg,var(--accent-soft) 0%,white 30%)',
        }"
      >
        <div class="between">
          <div style="min-width:0;flex:1">
            <div class="row" style="gap:8px">
              <Icons.Target :size="15" :style="{ color: appliedMap[s.id] ? 'var(--success)' : 'var(--accent)', flexShrink: 0 }" />
              <h3>{{ s.title }}</h3>
              <span style="font-size:10px;padding:2px 6px;border-radius:3px;background:var(--accent-soft);color:var(--accent);font-weight:600;letter-spacing:.04em;text-transform:uppercase;border:1px dashed var(--accent)">Copilot analysis</span>
              <Pill v-if="appliedMap[s.id]" kind="ok" dot>Marked applied</Pill>
            </div>
            <div style="font-size:13px;color:var(--ink-2);margin:8px 0 0;line-height:1.55;max-width:780px">
              <b style="color:var(--ink-1)">Why this matters: </b>{{ s.whyMatters }}
            </div>
            <div class="meta" style="margin-top:10px">
              <span class="row" style="gap:4px"><Icons.Layers :size="11" />Based on <b style="color:var(--ink-1)">{{ s.basis }}</b></span>
              <span>·</span>
              <span>Proposed weight {{ s.proposed.weight }}</span>
              <span>·</span>
              <span>Type: <code class="mono" style="font-size:11.5px">{{ s.proposed.type }}</code></span>
            </div>
          </div>
          <button class="btn ghost sm" @click="toggleExpand(s.id)">
            {{ expandedSet.has(s.id) ? 'Collapse' : 'Expand' }}
            <component :is="expandedSet.has(s.id) ? Icons.ChevronUp : Icons.ChevronDown" :size="11" />
          </button>
        </div>

        <template v-if="expandedSet.has(s.id)">
          <hr class="sep" />
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
            <div>
              <div class="muted" style="font-size:11px;text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px;font-weight:600">Proposed KPI definition</div>
              <div style="padding:14px;background:var(--surface-2);border-radius:var(--r-md);border:1px solid var(--border)">
                <div style="font-size:13.5px;font-weight:600;margin-bottom:8px">{{ s.proposed.name }}</div>
                <div class="row" style="gap:6px;margin-bottom:10px;flex-wrap:wrap">
                  <Pill kind="default">Type: <code class="mono" style="font-size:11px">{{ s.proposed.type }}</code></Pill>
                  <Pill kind="default">Weight {{ s.proposed.weight }}</Pill>
                  <Pill v-if="s.proposed.dependency" kind="default">Conditional</Pill>
                </div>
                <div style="font-size:12.5px;color:var(--ink-2);line-height:1.55;font-style:italic">
                  "{{ s.proposed.definition }}"
                </div>
                <div v-if="s.proposed.dependency" class="muted" style="font-size:11.5px;margin-top:8px;padding-top:8px;border-top:1px solid var(--border)">
                  <b>Dependency:</b> {{ s.proposed.dependency }}
                </div>
              </div>
            </div>
            <div>
              <div class="muted" style="font-size:11px;text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px;font-weight:600">Prompt language to support it</div>
              <div class="diff">
                <div v-for="(l, i) in s.promptLanguage" :key="i" class="diff-line add">{{ l.replace(/^  /, '') }}</div>
              </div>
              <div class="muted" style="font-size:11px;margin-top:6px;font-style:italic">
                Add this to the system prompt so the agent actively addresses the new KPI.
              </div>
            </div>
          </div>

          <template v-if="s.sampleSessions.length > 0">
            <div class="muted" style="font-size:11px;text-transform:uppercase;letter-spacing:.06em;margin:16px 0 8px;font-weight:600">Sample motivating sessions</div>
            <div class="col" style="gap:6px">
              <button
                v-for="cid in s.sampleSessions"
                :key="cid"
                class="rec-mini"
                @click="navigateToSession(cid)"
              >
                <span :class="'sev ' + (sessionSev(cid) || 'info')" />
                <span class="tnum muted" style="min-width:130px">{{ sessionTime(cid) }}</span>
                <SessionType :type="sessionType(cid)" />
                <span class="mono">{{ sessionCaller(cid) }}</span>
                <span class="grow" />
                <OutcomeBadge :outcome="sessionOutcome(cid)" />
                <Icons.ChevronRight :size="12" class="subtle" />
              </button>
            </div>
          </template>

          <div class="row" style="justify-content:space-between;gap:8px;margin-top:16px">
            <span class="muted" style="font-size:11.5px;font-style:italic">
              Add the KPI in your agent platform; we'll auto-detect it when the next config snapshot streams in.
            </span>
            <div class="row" style="gap:8px">
              <button class="btn ghost">Dismiss</button>
              <template v-if="!appliedMap[s.id]">
                <button class="btn" @click="fakeCopy('KPI definition')">
                  <Icons.Copy :size="11" /> Copy KPI definition
                </button>
                <button class="btn" @click="fakeCopy('Prompt language')">
                  <Icons.Copy :size="11" /> Copy prompt language
                </button>
                <button class="btn primary" @click="markApplied(s.id)">
                  <Icons.Check :size="11" /> Mark applied
                </button>
              </template>
              <Pill v-else kind="ok" dot>Tracking · waiting for next config</Pill>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Copy toast -->
    <Teleport to="body">
      <div v-if="copyToast" style="position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--ink-1);color:white;padding:10px 16px;border-radius:var(--r-md);font-size:12.5px;font-weight:500;box-shadow:var(--shadow-3);display:flex;align-items:center;gap:8px;z-index:50">
        <Icons.Check :size="13" style="color:var(--success)" />
        {{ copyToast }} copied to clipboard
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRecommendations, useSessions } from '@/api/queries'
import type { SessionOutcome, SessionType as SessionTypeEnum } from '@/api/types'
import { Icons } from '@/components/icons/Icons'
import Pill from '@/components/primitives/Pill.vue'
import Tooltip from '@/components/primitives/Tooltip.vue'
import SessionType from '@/components/primitives/SessionType.vue'
import OutcomeBadge from '@/components/primitives/OutcomeBadge.vue'

const route = useRoute()
const router = useRouter()
const agentId = computed(() => route.params.agentId as string)
const focusId = computed(() => route.query.focus as string | undefined)
const focusType = computed(() => route.query.type as string | undefined)

const { data: recsData } = useRecommendations(agentId.value)
const { data: sessions } = useSessions(agentId.value)

const sub = ref(focusType.value === 'kpi' ? 'kpi' : 'prompt')
const filter = ref('open')
const expandedSet = ref<Set<string>>(new Set([focusId.value ?? 'r1']))
const appliedMap = ref<Record<string, boolean>>({})
const copyToast = ref<string | null>(null)
const focusEl = ref<HTMLElement | null>(null)

watch(focusEl, async (el) => {
  if (el) {
    await nextTick()
    el.scrollIntoView({ block: 'start', behavior: 'smooth' })
  }
})

const recs = computed(() => recsData.value?.recs ?? [])
const suggestedKpis = computed(() => recsData.value?.suggestedKpis ?? [])

const openPromptCount = computed(() => recs.value.filter(r => !appliedMap.value[r.id] && r.status === 'open').length)
const openKpiCount = computed(() => suggestedKpis.value.filter(s => !appliedMap.value[s.id] && s.status === 'open').length)

function passesFilter<T extends { status: string; id: string }>(item: T): boolean {
  if (filter.value === 'applied') return !!appliedMap.value[item.id]
  if (filter.value === 'open') return !appliedMap.value[item.id] && item.status === 'open'
  if (filter.value === 'dismissed') return item.status === 'dismissed'
  return true
}

const filteredRecs = computed(() => recs.value.filter(passesFilter))
const filteredKpis = computed(() => suggestedKpis.value.filter(passesFilter))

function toggleExpand(id: string) {
  const s = new Set(expandedSet.value)
  if (s.has(id)) s.delete(id); else s.add(id)
  expandedSet.value = s
}

function fakeCopy(label: string) {
  copyToast.value = label
  setTimeout(() => { copyToast.value = null }, 1800)
}

function markApplied(id: string) {
  appliedMap.value = { ...appliedMap.value, [id]: true }
}

function sessionTime(cid: string): string {
  return sessions.value?.find(s => s.id === cid)?.time ?? '—'
}
function sessionCaller(cid: string): string {
  return sessions.value?.find(s => s.id === cid)?.caller ?? cid
}
function sessionSev(cid: string): string {
  return sessions.value?.find(s => s.id === cid)?.maxSev ?? 'info'
}
function sessionType(cid: string): SessionTypeEnum {
  return (sessions.value?.find(s => s.id === cid)?.type ?? 'voice') as SessionTypeEnum
}
function sessionOutcome(cid: string): SessionOutcome {
  return (sessions.value?.find(s => s.id === cid)?.outcome ?? 'hangup') as SessionOutcome
}
function navigateToSession(cid: string) {
  router.push(`/agents/${agentId.value}/sessions/${cid}`)
}
</script>
