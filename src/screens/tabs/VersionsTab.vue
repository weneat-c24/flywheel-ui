<template>
  <div v-if="isLoading">
    <div class="sk" style="height:400px;border-radius:var(--r-lg)" />
  </div>

  <template v-else-if="versions && compare">
    <div class="between" style="margin-bottom:18px">
      <div class="row" style="gap:8px">
        <span class="muted" style="font-size:12.5px">Comparing</span>
        <span class="mono" style="padding:2px 8px;background:var(--surface-2);border-radius:6px;font-weight:550">{{ baseVersion?.id }}</span>
        <Icons.ArrowRight :size="12" class="muted" />
        <span class="mono" style="padding:2px 8px;background:var(--primary-soft);color:var(--primary);border-radius:6px;font-weight:600">{{ headVersion?.id }}</span>
      </div>
      <div class="row" style="gap:8px">
        <button class="btn"><Icons.Download :size="11" /> Export diff</button>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:280px 1fr;gap:24px">
      <!-- Timeline -->
      <div>
        <div class="muted" style="font-size:11px;text-transform:uppercase;letter-spacing:.06em;font-weight:600;margin-bottom:10px">
          Config snapshots <span style="font-weight:400;text-transform:none;letter-spacing:0">· received from your agent platform</span>
        </div>
        <div class="timeline">
          <div
            v-for="v in versions"
            :key="v.id"
            :class="['tl-node', v.trend, (headId === v.id || baseId === v.id) ? 'selected' : '']"
            @click="handleVersionClick(v.id)"
            style="cursor:pointer"
          >
            <div class="tl-head">
              <span class="tl-ver mono">{{ v.label }}</span>
              <span class="row" style="gap:4px">
                <Pill v-if="v.fresh" kind="ok" dot>new</Pill>
                <Pill v-if="headId === v.id" kind="default">head</Pill>
                <Pill v-if="baseId === v.id" kind="default">base</Pill>
              </span>
            </div>
            <div class="tl-meta">received {{ v.when }}</div>
            <div class="tl-summary">{{ v.summary }}</div>
            <div class="tl-metric">
              <span>Pass rate</span>
              <b class="tnum">{{ v.passRate }}%</b>
              <span v-if="v.delta !== 0" :class="['delta tnum', v.delta > 0 ? 'up' : 'down']">
                {{ v.delta > 0 ? '↑' : '↓' }} {{ Math.abs(v.delta) }}%
              </span>
              <span style="margin-left:auto" class="muted tnum">{{ v.sessionsUnder }} sessions</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Comparison panel -->
      <div class="col" style="gap:14px">
        <!-- Booking rate headline -->
        <div class="card" style="background:linear-gradient(135deg,white 0%,var(--success-soft) 100%);border-color:var(--success-border)">
          <div style="padding:24px 28px">
            <div class="muted" style="font-size:11.5px;text-transform:uppercase;letter-spacing:.08em;font-weight:600;margin-bottom:6px">
              {{ compare.headline.label }} · {{ baseVersion?.id }} → {{ headVersion?.id }}
            </div>
            <div class="row" style="gap:14px;align-items:baseline">
              <div class="tnum" style="font-size:36px;font-weight:600;letter-spacing:-0.02em;color:var(--ink-3);text-decoration:line-through">
                {{ compare.headline.before }}%
              </div>
              <Icons.ArrowRight :size="20" class="muted" />
              <div class="tnum" style="font-size:52px;font-weight:600;letter-spacing:-0.025em;color:var(--success)">
                {{ compare.headline.after }}%
              </div>
              <div style="font-size:18px;font-weight:600;color:var(--success)">
                +{{ compare.headline.delta }} pts
              </div>
            </div>
            <div class="row" style="gap:8px;margin-top:10px;font-size:12px;color:var(--ink-2)">
              <span>{{ compare.sessionsBefore }} sessions under {{ baseVersion?.id }}</span>
              <span>·</span>
              <span>{{ compare.sessionsAfter }} sessions under {{ headVersion?.id }}</span>
              <template v-if="headVersion?.fresh">
                <span>·</span>
                <span class="mock-tag" style="border-style:solid;border-color:var(--success-border);background:white;color:var(--success)">fresh data</span>
              </template>
            </div>
          </div>
        </div>

        <!-- Honesty headline -->
        <div class="card" style="background:white;border-color:var(--warning-border)">
          <div style="padding:18px 22px">
            <div class="muted" style="font-size:11.5px;text-transform:uppercase;letter-spacing:.08em;font-weight:600;margin-bottom:6px">
              {{ compare.honestyHeadline.label }} · {{ baseVersion?.id }} → {{ headVersion?.id }}
            </div>
            <div class="row" style="gap:14px;align-items:baseline">
              <div class="tnum" style="font-size:28px;font-weight:600;color:var(--critical);text-decoration:line-through">
                {{ compare.honestyHeadline.before }}%
              </div>
              <Icons.ArrowRight :size="16" class="muted" />
              <div class="tnum" style="font-size:34px;font-weight:600;color:var(--success)">
                {{ compare.honestyHeadline.after }}%
              </div>
              <div style="font-size:14px;font-weight:600;color:var(--success)">
                {{ compare.honestyHeadline.delta }} pts
              </div>
            </div>
            <div class="muted" style="font-size:12px;margin-top:6px">
              Agent stopped claiming to use <code class="mono">lookup_history</code> when it wasn't going to.
            </div>
          </div>
        </div>

        <!-- Per-KPI table -->
        <div class="card">
          <div class="card-head">
            <div class="card-title">Per-KPI pass rate</div>
            <span class="card-sub">{{ baseVersion?.id }} vs. {{ headVersion?.id }}</span>
          </div>
          <table class="tbl" style="border-bottom-left-radius:var(--r-lg);border-bottom-right-radius:var(--r-lg);overflow:hidden">
            <thead>
              <tr>
                <th>KPI</th>
                <th class="num">{{ baseVersion?.id }}</th>
                <th class="num">{{ headVersion?.id }}</th>
                <th class="num">Δ</th>
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="k in compare.perKpi" :key="k.kpi" style="cursor:default">
                <td style="font-weight:550">{{ k.kpi }}</td>
                <td class="num tnum muted">{{ k.before }}%</td>
                <td class="num tnum" style="font-weight:600">{{ k.after }}%</td>
                <td class="num tnum" :style="{
                  color: k.delta > 0 ? 'var(--success)' : k.delta < 0 ? 'var(--critical)' : 'var(--ink-3)',
                  fontWeight: 600
                }">
                  {{ k.delta > 0 ? '+' : '' }}{{ k.delta }}%
                </td>
                <td>
                  <div style="height:8px;background:var(--surface-2);border-radius:4px;overflow:hidden;position:relative;max-width:180px">
                    <div :style="{ position:'absolute', left:0, top:0, height:'100%', width: k.before + '%', background: 'var(--ink-4)', borderRadius: '4px' }" />
                    <div :style="{ position:'absolute', left:0, top:0, height:'100%', width: k.after + '%', background: k.delta > 0 ? 'var(--success)' : 'var(--warning)', borderRadius: '4px', mixBlendMode: 'multiply' }" />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Prompt diff -->
        <div class="card">
          <div class="card-head">
            <div class="card-title">Prompt diff</div>
            <span class="card-sub">{{ compare.promptDiff.title }}</span>
          </div>
          <div style="padding:14px">
            <div class="diff">
              <div v-for="(l, i) in compare.promptDiff.promptCurrent" :key="'r'+i" class="diff-line rem">{{ l.replace(/^  /, '') }}</div>
              <div v-for="(l, i) in compare.promptDiff.promptSuggested" :key="'a'+i" class="diff-line add">{{ l.replace(/^  /, '') }}</div>
            </div>
          </div>
        </div>

        <!-- Applied recs -->
        <div class="card card-body">
          <div class="row" style="gap:8px;margin-bottom:6px">
            <Icons.Check :size="13" style="color:var(--success)" />
            <b style="font-size:13px">Recommendations marked applied between {{ baseVersion?.id }} and {{ headVersion?.id }}</b>
          </div>
          <div class="col" style="gap:6px;margin-top:8px">
            <div class="rec-mini">
              <Icons.Bulb :size="12" style="color:var(--warning)" />
              <span style="font-size:9px;padding:2px 5px;border-radius:3px;background:var(--warning-soft);color:var(--warning);font-weight:600;letter-spacing:.04em;text-transform:uppercase">Prompt fix</span>
              <span>Confirm timezone before booking appointments</span>
              <span class="grow" />
              <span class="rec-lift">+18% booking rate</span>
            </div>
            <div class="rec-mini">
              <Icons.Target :size="12" style="color:var(--accent)" />
              <span style="font-size:9px;padding:2px 5px;border-radius:3px;background:var(--accent-soft);color:var(--accent);font-weight:600;letter-spacing:.04em;text-transform:uppercase">Suggested KPI</span>
              <span>Tool-honesty: lookup_history</span>
              <span class="grow" />
              <span class="rec-lift">−22% FP rate</span>
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
import { useVersions, useVersionCompare } from '@/api/queries'
import { Icons } from '@/components/icons/Icons'
import Pill from '@/components/primitives/Pill.vue'

const route = useRoute()
const agentId = computed(() => route.params.agentId as string)

const { data: versions, isLoading: loadingVersions } = useVersions(agentId.value)
const { data: compare, isLoading: loadingCompare } = useVersionCompare(agentId.value)

const isLoading = computed(() => loadingVersions.value || loadingCompare.value)

const baseId = ref('v3')
const headId = ref('v4')

const baseVersion = computed(() => versions.value?.find(v => v.id === baseId.value))
const headVersion = computed(() => versions.value?.find(v => v.id === headId.value))

function handleVersionClick(id: string) {
  if (id === headId.value) return
  if (id === baseId.value) {
    // swap: make it head
    const prev = headId.value
    headId.value = id
    baseId.value = prev
  } else {
    baseId.value = id
  }
}
</script>
