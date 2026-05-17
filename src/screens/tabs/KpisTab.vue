<template>
  <div v-if="isLoading">
    <div class="sk" style="height:400px;border-radius:var(--r-lg)" />
  </div>

  <template v-else-if="kpis">
    <div class="banner" style="margin-bottom:16px">
      <Icons.Info :size="14" class="ic" />
      <div>
        <b>KPIs are managed in your agent platform.</b> This page is a read-only mirror — to change a KPI, edit it there and the new definition will sync on the next session.
      </div>
    </div>

    <div class="between" style="margin-bottom:14px">
      <div class="muted" style="font-size:12.5px">
        {{ kpis.length }} KPIs · last synced 2 minutes ago
      </div>
      <div class="row" style="gap:8px">
        <button class="btn"><Icons.History :size="11" /> Version history</button>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:minmax(0,1fr) 460px;gap:20px">
      <!-- KPI list -->
      <div class="col" style="gap:8px">
        <div
          v-for="k in kpis"
          :key="k.id"
          class="card"
          style="padding:14px 16px;cursor:pointer"
          :style="{
            borderColor: selected === k.id ? 'var(--primary)' : 'var(--border)',
            boxShadow: selected === k.id ? '0 0 0 3px rgba(15,23,42,.06)' : 'var(--shadow-1)'
          }"
          @click="selected = k.id"
        >
          <div class="between">
            <div class="row" style="gap:10px;min-width:0;flex:1">
              <span :class="'sev ' + kpiSev(k.passRate)" />
              <div style="min-width:0">
                <div class="row" style="gap:6px">
                  <div style="font-size:13.5px;font-weight:600" class="ellipsis">{{ k.name }}</div>
                  <Pill v-if="k.sinceVersion !== 'v1'" kind="info">since {{ k.sinceVersion }}</Pill>
                </div>
                <div class="muted" style="font-size:11.5px;margin-top:3px">
                  <code class="mono" style="font-size:11px">{{ k.type }}</code> · weight {{ k.weight }}
                  <template v-if="k.dependency"> · <i>{{ k.dependency.toLowerCase() }}</i></template>
                </div>
              </div>
            </div>
            <div style="text-align:right">
              <div class="tnum" style="font-size:16px;font-weight:600" :style="{ color: kpiSev(k.passRate) === 'crit' ? 'var(--critical)' : 'var(--ink-1)' }">
                {{ k.passRate }}%
              </div>
              <div class="muted tnum" style="font-size:11px">{{ k.sessions }} sessions</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Detail panel -->
      <div v-if="selectedKpi" class="card" style="position:sticky;top:0;height:fit-content">
        <div class="card-head">
          <div class="card-title">{{ selectedKpi.name }}</div>
          <span class="mock-tag" style="margin-left:auto">Read-only · since {{ selectedKpi.sinceVersion }}</span>
        </div>
        <div class="card-body col" style="gap:16px">
          <div>
            <div class="muted" style="font-size:10.5px;text-transform:uppercase;letter-spacing:.06em;font-weight:600;margin-bottom:4px">Type</div>
            <code class="mono" style="font-size:12.5px">{{ selectedKpi.type }}</code>
          </div>
          <div>
            <div class="muted" style="font-size:10.5px;text-transform:uppercase;letter-spacing:.06em;font-weight:600;margin-bottom:4px">Natural-language definition</div>
            <div style="padding:12px;background:var(--surface-2);border-radius:var(--r-sm);font-size:12.5px;font-style:italic;color:var(--ink-2);line-height:1.55;border:1px solid var(--border)">
              "{{ selectedKpi.definition }}"
            </div>
            <div class="muted" style="font-size:11px;margin-top:6px">This is the prompt the external grader uses to judge sessions against this KPI.</div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <div>
              <div class="muted" style="font-size:10.5px;text-transform:uppercase;letter-spacing:.06em;font-weight:600;margin-bottom:4px">Weight</div>
              <div class="tnum" style="font-size:18px;font-weight:600">
                {{ selectedKpi.weight }}<span class="muted" style="font-size:11px;font-weight:400"> / 5</span>
              </div>
            </div>
            <div>
              <div class="muted" style="font-size:10.5px;text-transform:uppercase;letter-spacing:.06em;font-weight:600;margin-bottom:4px">Current pass rate</div>
              <div class="tnum" style="font-size:18px;font-weight:600">{{ selectedKpi.passRate }}%</div>
            </div>
          </div>
          <div v-if="selectedKpi.dependency">
            <div class="muted" style="font-size:10.5px;text-transform:uppercase;letter-spacing:.06em;font-weight:600;margin-bottom:4px">Dependency</div>
            <div style="font-size:12.5px;color:var(--ink-2)">{{ selectedKpi.dependency }}</div>
            <div class="muted" style="font-size:11px;margin-top:4px">The KPI is only evaluated when this condition is met.</div>
          </div>
          <!-- Pass-rate trend by version -->
          <div>
            <div class="muted" style="font-size:10.5px;text-transform:uppercase;letter-spacing:.06em;font-weight:600;margin-bottom:4px">Pass-rate trend by version</div>
            <div style="padding:14px 12px;background:var(--surface-2);border-radius:var(--r-sm);border:1px solid var(--border)">
              <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;align-items:flex-end;height:90px">
                <div
                  v-for="b in versionBars"
                  :key="b.v"
                  class="col"
                  style="gap:4px;align-items:center;justify-content:flex-end;height:100%"
                >
                  <span class="tnum" style="font-size:11px;font-weight:600">{{ b.p }}%</span>
                  <div :style="{
                    width: '100%',
                    height: (b.p / 100 * 60) + 'px',
                    background: b.v === 'v4' ? 'var(--success)' : 'var(--primary)',
                    borderRadius: '3px 3px 0 0',
                    opacity: b.v === 'v3' ? 1 : 0.6
                  }" />
                  <span class="mono muted" style="font-size:10.5px">{{ b.v }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Prompt suggestion -->
          <div v-if="selectedKpi.promptSuggestion" style="border-top:1px dashed var(--accent);padding-top:14px;margin:2px -18px -16px;padding:14px 18px;background:linear-gradient(180deg,var(--accent-soft) 0%,white 80%);border-radius:0 0 var(--r-lg) var(--r-lg)">
            <div class="row" style="gap:6px;margin-bottom:6px">
              <Icons.Sparkles :size="12" style="color:var(--accent)" />
              <span class="muted" style="font-size:10px;text-transform:uppercase;letter-spacing:.06em;font-weight:700;color:var(--accent)">Copilot · suggested prompt improvement</span>
            </div>
            <div style="font-size:13px;font-weight:600;line-height:1.35;margin-bottom:5px">{{ selectedKpi.promptSuggestion.headline }}</div>
            <div class="muted" style="font-size:11.5px;line-height:1.5;margin-bottom:8px">{{ selectedKpi.promptSuggestion.whyMatters }}</div>
            <div class="row" style="gap:8px;margin-bottom:10px;flex-wrap:wrap">
              <span class="rec-lift"><Icons.Trend :size="11" /> {{ selectedKpi.promptSuggestion.lift }}</span>
              <Pill kind="default">Based on {{ selectedKpi.promptSuggestion.clusterSize }} sessions</Pill>
            </div>
            <div class="diff" style="font-size:11.5px;padding:10px 0">
              <div v-for="(l, i) in selectedKpi.promptSuggestion.currentBehavior" :key="'c'+i" class="diff-line rem">{{ l.replace(/^  /, '') }}</div>
              <div v-for="(l, i) in selectedKpi.promptSuggestion.suggestedPrompt" :key="'a'+i" class="diff-line add">{{ l.replace(/^  /, '') }}</div>
            </div>
            <div class="row" style="justify-content:flex-end;gap:6px;margin-top:10px">
              <button class="btn sm"><Icons.Copy :size="11" /> Copy prompt</button>
              <button v-if="selectedKpi.promptSuggestion.relatedRecId" class="btn sm primary">
                View full recommendation <Icons.ArrowRight :size="11" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useKpis } from '@/api/queries'
import { Icons } from '@/components/icons/Icons'
import Pill from '@/components/primitives/Pill.vue'

const route = useRoute()
const agentId = computed(() => route.params.agentId as string)

const { data: kpis, isLoading } = useKpis(agentId.value)

const selected = ref('k2')

const selectedKpi = computed(() => kpis.value?.find(k => k.id === selected.value))

const versionBars = computed(() => {
  const p = selectedKpi.value?.passRate ?? 50
  return [
    { v: 'v1', p: Math.max(20, p - 30) },
    { v: 'v2', p: Math.max(20, p - 15) },
    { v: 'v3', p },
    { v: 'v4', p: Math.min(95, p + 18) },
  ]
})

function kpiSev(passRate: number): 'ok' | 'warn' | 'crit' {
  return passRate >= 80 ? 'ok' : passRate >= 60 ? 'warn' : 'crit'
}
</script>
