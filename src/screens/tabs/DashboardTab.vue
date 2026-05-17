<template>
  <div v-if="agent && sessions && kpiData && toolData">
    <div class="between" style="margin-bottom:18px;flex-wrap:wrap;gap:10px">
      <div class="row" style="gap:12px;flex-wrap:wrap">
        <Pill kind="crit" dot>Pass rate dropped 16% in 7d</Pill>
        <Pill kind="warn" dot>Tool honesty slipped to 87/100</Pill>
        <span class="muted" style="font-size:12px">
          Most failures cluster on <b style="color:var(--ink-1)">Timezone confirmed</b> ·
          top tool-honesty issue: <code class="mono" style="color:var(--critical)">lookup_history</code>
        </span>
      </div>
      <div class="row" style="gap:8px">
        <button class="btn"><Icons.Plus :size="11" /> Add widget</button>
        <DateRange v-model="range" />
      </div>
    </div>

    <div class="widget-grid">
      <!-- KPI scorecard -->
      <div class="card w-8">
        <div class="card-head">
          <div class="card-title">KPI scorecard</div>
          <span class="card-sub">5 KPIs · last {{ range }}</span>
          <span class="mock-tag" style="margin-left:auto">External grading</span>
        </div>
        <div style="padding:14px;display:grid;grid-template-columns:repeat(5,1fr);gap:12px">
          <div
            v-for="k in kpiData"
            :key="k.id"
            :style="{ padding:'12px 12px 14px', border:'1px solid var(--border)', borderRadius:'var(--r-md)', background: kpiSev(k.passRate) === 'crit' ? 'var(--critical-soft)' : 'var(--surface)' }"
          >
            <div style="font-size:11.5px;color:var(--ink-3);line-height:1.35;min-height:32px">{{ k.name }}</div>
            <div class="row" style="gap:6px;margin-top:6px;align-items:baseline">
              <span :style="{ fontSize:'22px', fontWeight:600, fontVariantNumeric:'tabular-nums', color: kpiSev(k.passRate) === 'crit' ? 'var(--critical)' : 'var(--ink-1)' }">{{ k.passRate }}%</span>
              <Severity :level="kpiSev(k.passRate)" />
            </div>
            <div class="row" style="justify-content:space-between;margin-top:8px;align-items:center">
              <Sparkline :data="trendFor(k.passRate)" :w="66" :h="18" :color="kpiSev(k.passRate) === 'crit' ? 'var(--critical)' : 'var(--ink-3)'" />
              <span class="muted tnum" style="font-size:10.5px">{{ k.sessions }} sess</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Tool honesty mini -->
      <div class="card w-4">
        <div class="card-head">
          <Icons.Shield :size="13" style="color:var(--warning)" />
          <div class="card-title">Tool honesty</div>
          <span class="card-sub">last {{ range }}</span>
          <RouterLink :to="`/agents/${agentId}/tool-reliability`" class="sec-link" style="margin-left:auto">Drill in <Icons.ArrowRight :size="11" /></RouterLink>
        </div>
        <div style="padding:14px 18px">
          <div class="row" style="gap:12px;align-items:baseline">
            <span :style="{ fontSize:'28px', fontWeight:600, fontVariantNumeric:'tabular-nums', letterSpacing:'-0.02em', color: agent.honestyScore < 90 ? 'var(--warning)' : 'var(--ink-1)' }">
              {{ agent.honestyScore }}<span style="font-size:15px;color:var(--ink-3)">/100</span>
            </span>
            <Delta :value="agent.honestyScore - agent.honestyPrev" />
          </div>
          <div class="muted" style="font-size:11.5px;margin-top:2px">
            <b class="tnum" style="color:var(--critical)">{{ toolData.sessionsWithAnyFP }}</b> of {{ toolData.sessionsTotal }} sessions had a false-positive tool claim
          </div>
          <div style="margin-top:14px;border-top:1px solid var(--border);padding-top:10px">
            <div class="muted" style="font-size:10.5px;text-transform:uppercase;letter-spacing:.06em;font-weight:600;margin-bottom:6px">Top FP tools</div>
            <div
              v-for="t in topFPTools"
              :key="t.tool"
              class="row"
              style="gap:8px;font-size:12px;padding:5px 0"
            >
              <span :class="'sev ' + fpSev(t)" />
              <code class="mono ellipsis" style="flex:1" :style="{ color: fpSev(t) === 'ok' ? 'var(--ink-2)' : 'var(--ink-1)' }">{{ t.tool }}</code>
              <span class="tnum muted" style="font-size:11px">{{ t.fp }} FP</span>
              <span class="tnum" style="font-weight:600;min-width:36px;text-align:right" :style="{ color: fpSev(t) === 'crit' ? 'var(--critical)' : fpSev(t) === 'warn' ? 'var(--warning)' : 'var(--success)' }">{{ fpRate(t) }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Augmented findings -->
      <div class="card w-12" style="border-style:dashed;border-color:var(--border-strong)" v-if="augData">
        <div class="card-head" style="border-bottom-style:dashed">
          <Icons.Sparkles :size="13" style="color:var(--accent)" />
          <div class="card-title">Copilot analysis · findings beyond the external grade</div>
          <span class="card-sub">last {{ range }}</span>
          <span class="mock-tag" style="margin-left:auto;border-style:dashed;border-color:var(--accent);color:var(--accent)">Our analysis</span>
        </div>
        <div :style="{ padding:'14px 18px', display:'grid', gridTemplateColumns:`repeat(${augData.findings.length}, 1fr)`, gap:'14px' }">
          <div
            v-for="f in augData.findings"
            :key="f.id"
            :style="{ padding:'12px 14px', borderRadius:'var(--r-md)', border:'1px dashed', borderColor: f.sev === 'crit' ? 'var(--critical-border)' : f.sev === 'warn' ? 'var(--warning-border)' : 'var(--border-strong)', background:'var(--surface)', cursor: f.clusterId ? 'pointer' : 'default' }"
            @click="f.clusterId && navigateToRec(f.clusterId)"
          >
            <div class="row" style="gap:6px;margin-bottom:5px">
              <span :class="'sev ' + f.sev" />
              <span class="muted" style="font-size:10.5px;text-transform:uppercase;letter-spacing:.05em;font-weight:600">
                {{ f.sev === 'crit' ? 'Critical' : f.sev === 'warn' ? 'Warning' : 'Info' }}
              </span>
            </div>
            <div class="row" style="gap:8px;align-items:baseline">
              <span :style="{ fontSize:'24px', fontWeight:600, fontVariantNumeric:'tabular-nums', color: f.sev === 'crit' ? 'var(--critical)' : 'var(--ink-1)' }">{{ f.count }}</span>
              <span v-if="f.clusterId" style="font-size:11px;color:var(--accent);font-weight:550">→ suggestion</span>
            </div>
            <div style="font-size:12px;color:var(--ink-2);margin-top:4px;line-height:1.4">{{ f.label }}</div>
          </div>
        </div>
      </div>

      <!-- Failure heatmap -->
      <div class="card w-8">
        <div class="card-head">
          <div class="card-title">Failure heatmap</div>
          <span class="card-sub">10 most recent sessions × 5 KPIs</span>
          <span style="margin-left:auto" class="row">
            <span class="row muted" style="font-size:11px;gap:8px">
              <span class="row" style="gap:4px"><span style="width:10px;height:10px;background:var(--success-soft);border-radius:2px;border:1px solid var(--success-border)" />Pass</span>
              <span class="row" style="gap:4px"><span style="width:10px;height:10px;background:var(--warning-soft);border-radius:2px;border:1px solid var(--warning-border)" />Warn</span>
              <span class="row" style="gap:4px"><span style="width:10px;height:10px;background:var(--critical-soft);border-radius:2px;border:1px solid var(--critical-border)" />Critical</span>
            </span>
          </span>
        </div>
        <div style="padding:14px">
          <div style="display:grid;grid-template-columns:120px repeat(5, 1fr);gap:3px;font-size:11px">
            <div></div>
            <div v-for="k in kpiData" :key="k.id" class="muted ellipsis" style="padding:4px 2px;font-size:10.5px;text-align:center;border-bottom:1px solid var(--border)" :title="k.name">
              {{ k.name.split(' ').slice(0, 2).join(' ') }}
            </div>
            <template v-for="(row, ri) in heatmap" :key="ri">
              <div class="muted tnum" style="padding:4px 4px;font-size:11px;align-self:center">{{ sessions[ri].time.replace('Today ', '') }}</div>
              <div
                v-for="(cell, ci) in row"
                :key="ci"
                class="heatcell"
                :style="{ background: heatBg(cell), borderColor: heatBorder(cell), border: `1px solid ${heatBorder(cell)}` }"
                :title="cell"
              />
            </template>
          </div>
        </div>
      </div>

      <!-- Recent failures -->
      <div class="card w-4">
        <div class="card-head">
          <div class="card-title">Recent failures</div>
          <span class="card-sub">{{ recentFails.length }} sessions</span>
        </div>
        <div>
          <button
            v-for="(c, i) in recentFails"
            :key="c.id"
            @click="$router.push(`/agents/${agentId}/sessions/${c.id}`)"
            :style="{ display:'grid', gridTemplateColumns:'auto 1fr auto', gap:'10px', alignItems:'center', padding:'10px 16px', borderTop: i ? '1px solid var(--border)' : 'none', width:'100%', textAlign:'left' }"
          >
            <span :class="'sev ' + c.maxSev" />
            <div style="min-width:0">
              <div class="row" style="gap:6px;font-size:12.5px">
                <span class="tnum muted">{{ c.time.replace('Today ', '') }}</span>
                <span>·</span>
                <span>{{ c.passed }}</span>
                <Pill v-if="c.fp > 0" kind="crit">FP</Pill>
              </div>
              <div class="muted ellipsis" style="font-size:11px;margin-top:2px">{{ c.caller }}</div>
            </div>
            <Icons.ChevronRight :size="12" class="subtle" />
          </button>
        </div>
      </div>

      <!-- Top recommendations -->
      <div class="card w-6">
        <div class="card-head">
          <Icons.Bulb :size="13" style="color:var(--warning)" />
          <div class="card-title">Top recommendations</div>
          <span class="card-sub">{{ topRecs.length + topSuggested.length }}</span>
        </div>
        <div style="padding:10px 14px">
          <button
            v-for="(r, i) in topRecs"
            :key="r.id"
            @click="$router.push(`/agents/${agentId}/recommendations?focus=${r.id}&type=prompt`)"
            :style="{ padding:'10px 0', borderTop: i ? '1px solid var(--border)' : 'none', textAlign:'left', width:'100%' }"
          >
            <div class="row" style="gap:6px;align-items:flex-start">
              <span style="font-size:9px;padding:2px 5px;border-radius:3px;background:var(--warning-soft);color:var(--warning);font-weight:600;letter-spacing:.04em;text-transform:uppercase;margin-top:2px">Prompt fix</span>
              <div style="min-width:0;flex:1">
                <div style="font-size:13px;font-weight:550;line-height:1.35">{{ r.title }}</div>
                <div class="muted" style="font-size:11.5px;margin-top:3px">Cluster of {{ r.clusterSize }} · {{ r.lift }}</div>
              </div>
            </div>
          </button>
          <button
            v-for="s in topSuggested"
            :key="s.id"
            @click="$router.push(`/agents/${agentId}/recommendations?focus=${s.id}&type=kpi`)"
            style="padding:10px 0;border-top:1px solid var(--border);text-align:left;width:100%"
          >
            <div class="row" style="gap:6px;align-items:flex-start">
              <span style="font-size:9px;padding:2px 5px;border-radius:3px;background:var(--accent-soft);color:var(--accent);font-weight:600;letter-spacing:.04em;text-transform:uppercase;margin-top:2px">Suggested KPI</span>
              <div style="min-width:0;flex:1">
                <div style="font-size:13px;font-weight:550;line-height:1.35">{{ s.title }}</div>
                <div class="muted" style="font-size:11.5px;margin-top:3px">Based on {{ s.basis }}</div>
              </div>
            </div>
          </button>
        </div>
      </div>

      <!-- Latency -->
      <div class="card w-6">
        <div class="card-head">
          <div class="card-title">Response latency</div>
          <span class="card-sub">p50 / p95 · ms</span>
        </div>
        <div style="padding:14px 18px">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:14px">
            <div>
              <div class="muted" style="font-size:11.5px">p50</div>
              <div class="row" style="gap:6px;align-items:baseline">
                <span style="font-size:22px;font-weight:600;font-variant-numeric:tabular-nums">412</span>
                <span class="muted" style="font-size:12px">ms</span>
                <Delta :value="-4" :invert="true" />
              </div>
            </div>
            <div>
              <div class="muted" style="font-size:11.5px">p95</div>
              <div class="row" style="gap:6px;align-items:baseline">
                <span style="font-size:22px;font-weight:600;font-variant-numeric:tabular-nums">1,084</span>
                <span class="muted" style="font-size:12px">ms</span>
                <Delta :value="3" :invert="true" />
              </div>
            </div>
          </div>
          <Sparkbar :data="[420,418,410,432,408,402,412,420,415,412,408,412]" :w="420" :h="32" color="var(--primary)" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAgent, useSessions, useKpis, useToolReliability, useRecommendations } from '@/api/queries'
import { augmentedSummary } from '@/mocks/fixtures/overview'
import { Icons } from '@/components/icons/Icons'
import Sparkline from '@/components/primitives/Sparkline.vue'
import Sparkbar from '@/components/primitives/Sparkbar.vue'
import Delta from '@/components/primitives/Delta.vue'
import Pill from '@/components/primitives/Pill.vue'
import Severity from '@/components/primitives/Severity.vue'
import DateRange from '@/components/primitives/DateRange.vue'
import type { ToolEntry } from '@/api/types'

const route = useRoute()
const router = useRouter()
const agentId = route.params.agentId as string
const range = ref('7d')

const { data: agent }   = useAgent(agentId)
const { data: sessions } = useSessions(agentId)
const { data: kpiData }  = useKpis(agentId)
const { data: toolData } = useToolReliability(agentId)
const { data: recsData } = useRecommendations(agentId)
const augData = augmentedSummary

const topRecs      = computed(() => (recsData.value?.recs ?? []).filter(r => r.status === 'open').slice(0, 2))
const topSuggested = computed(() => (recsData.value?.suggestedKpis ?? []).slice(0, 1))
const recentFails  = computed(() => (sessions.value ?? []).filter(c => c.maxSev === 'crit' || c.maxSev === 'warn').slice(0, 5))

const topFPTools = computed(() =>
  [...(toolData.value?.tools ?? [])].sort((a, b) => fpRate(b) - fpRate(a)).slice(0, 3)
)

const heatmap = computed(() => {
  const pool = (sessions.value ?? []).slice(0, 10)
  return pool.map(c => {
    const failed = c.failedKpis ?? []
    return ['k1','k2','k3','k4','k5'].map(k => {
      if (!failed.includes(k)) return c.passed === '—' ? 'na' : 'ok'
      return c.maxSev || 'warn'
    })
  })
})

function kpiSev(rate: number): 'ok' | 'warn' | 'crit' {
  return rate >= 80 ? 'ok' : rate >= 60 ? 'warn' : 'crit'
}
function trendFor(passRate: number): number[] {
  return [passRate-8, passRate-6, passRate-3, passRate-2, passRate-1, passRate-1, passRate]
}
function fpRate(t: ToolEntry): number {
  return Math.round(t.fp / (t.tp + t.fp || 1) * 100)
}
function fpSev(t: ToolEntry): 'crit' | 'warn' | 'ok' {
  const r = fpRate(t)
  return r >= 20 ? 'crit' : r >= 10 ? 'warn' : 'ok'
}
function heatBg(cell: string): string {
  return cell === 'ok' ? 'var(--success-soft)' : cell === 'warn' ? 'var(--warning-soft)' : cell === 'crit' ? 'var(--critical-soft)' : 'var(--surface-3)'
}
function heatBorder(cell: string): string {
  return cell === 'ok' ? 'var(--success-border)' : cell === 'warn' ? 'var(--warning-border)' : cell === 'crit' ? 'var(--critical-border)' : 'var(--border)'
}
function navigateToRec(clusterId: string) {
  router.push(`/agents/${agentId}/recommendations?focus=${clusterId}&type=kpi`)
}
</script>
