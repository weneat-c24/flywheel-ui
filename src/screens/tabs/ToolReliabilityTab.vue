<template>
  <div v-if="isLoading">
    <div class="sk" style="height:180px;margin-bottom:18px;border-radius:var(--r-lg)" />
    <div class="sk" style="height:300px;border-radius:var(--r-lg)" />
  </div>

  <template v-else-if="tr">
    <!-- Honesty headline -->
    <div class="card" style="padding:24px 28px;margin-bottom:18px;background:linear-gradient(135deg,white 0%,var(--warning-soft) 100%)"
      :style="{ borderColor: tr.honestyScore < 90 ? 'var(--warning-border)' : 'var(--border)' }"
    >
      <div class="between" style="align-items:flex-start;gap:24px;flex-wrap:wrap">
        <div>
          <div class="muted" style="font-size:11.5px;text-transform:uppercase;letter-spacing:.08em;font-weight:600;margin-bottom:8px">Honesty score</div>
          <div class="row" style="gap:14px;align-items:baseline">
            <div class="tnum" style="font-size:54px;font-weight:600;letter-spacing:-0.025em"
              :style="{ color: tr.honestyScore < 90 ? 'var(--warning)' : 'var(--success)' }"
            >
              {{ tr.honestyScore }}<span style="font-size:24px;color:var(--ink-3)">/100</span>
            </div>
            <Delta :value="tr.honestyScore - tr.honestyPrev" />
          </div>
          <div style="font-size:13.5px;color:var(--ink-2);margin-top:8px;line-height:1.5;max-width:540px">
            <b class="tnum" style="color:var(--critical)">{{ tr.sessionsWithAnyFP }}</b> of
            <b class="tnum">{{ tr.sessionsTotal }}</b> sessions
            ({{ Math.round(tr.sessionsWithAnyFP / tr.sessionsTotal * 100) }}%) had at least one
            <b>false-positive tool claim</b> — the agent told a caller it was using a tool it didn't actually invoke.
          </div>
        </div>
        <div style="min-width:260px">
          <div class="muted" style="font-size:11px;text-transform:uppercase;letter-spacing:.06em;font-weight:600;margin-bottom:8px">What this measures</div>
          <div style="font-size:12.5px;color:var(--ink-2);line-height:1.55">
            For every tool the agent has access to, the external system reports per-session
            <span class="mono" style="font-size:11.5px">TP / FP / TN / FN</span>.
            Our analysis surfaces the killer pattern — <b>false positives</b> — and clusters them across sessions.
          </div>
        </div>
      </div>
    </div>

    <!-- Pills row -->
    <div class="between" style="margin-bottom:14px">
      <div class="row" style="gap:8px">
        <Pill kind="default">Window: last {{ tr.windowDays }}d</Pill>
        <Pill kind="default">Version: <span class="mono" style="margin-left:3px">{{ tr.version }}</span></Pill>
        <Pill kind="default">{{ tr.tools.length }} tools observed</Pill>
      </div>
      <div class="row" style="gap:8px">
        <button class="btn"><Icons.Download :size="11" /> Export</button>
      </div>
    </div>

    <!-- Per-tool table -->
    <div class="card" style="overflow:hidden;margin-bottom:16px">
      <table class="tbl">
        <thead>
          <tr>
            <th style="min-width:200px">Tool</th>
            <th class="num">Sessions</th>
            <th class="num">
              <span class="tt" data-tip="Claimed & Used — agent said it would use this tool, and it did.">TP <span class="help">?</span></span>
            </th>
            <th class="num">
              <span class="tt" data-tip="Claimed, Not Used — agent said it would use this tool, but it didn't.">FP <span class="help">?</span></span>
            </th>
            <th class="num">
              <span class="tt" data-tip="Not Claimed, Not Used — agent didn't claim to use it, didn't use it.">TN <span class="help">?</span></span>
            </th>
            <th class="num">
              <span class="tt" data-tip="Used, Not Claimed — agent used it without telling the caller.">FN <span class="help">?</span></span>
            </th>
            <th>
              FP Rate
              <Icons.ArrowDown :size="11" style="margin-left:4px;vertical-align:middle" />
            </th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <template v-for="t in sorted" :key="t.tool">
            <tr @click="toggleExpand(t.tool)" :class="expanded === t.tool ? 'selected' : ''" style="cursor:pointer">
              <td>
                <div class="row" style="gap:8px">
                  <Icons.Wrench :size="12" class="muted" />
                  <div>
                    <code class="mono" style="font-size:13px;font-weight:600">{{ t.tool }}</code>
                    <div class="muted" style="font-size:11px;margin-top:2px">{{ t.description }}</div>
                  </div>
                </div>
              </td>
              <td class="num tnum muted">{{ t.total }}</td>
              <td class="num tnum" style="color:var(--success)">{{ t.tp }}</td>
              <td class="num tnum" :style="{ color: t.fp > 0 ? 'var(--critical)' : 'var(--ink-3)', fontWeight: t.fp > 0 ? 700 : 400 }">{{ t.fp }}</td>
              <td class="num tnum muted">{{ t.tn }}</td>
              <td class="num tnum muted">{{ t.fn }}</td>
              <td>
                <div class="row" style="gap:8px">
                  <span class="tnum" :style="{
                    fontWeight: 700, fontSize: '14px', minWidth: '44px',
                    color: fpSev(t.fpRate) === 'crit' ? 'var(--critical)' : fpSev(t.fpRate) === 'warn' ? 'var(--warning)' : 'var(--success)'
                  }">{{ t.fpRate }}%</span>
                  <div style="flex:1;max-width:120px;height:6px;background:var(--surface-2);border-radius:3px;overflow:hidden">
                    <div :style="{
                      width: Math.max(2, t.fpRate) + '%', height: '100%', borderRadius: '3px',
                      background: fpSev(t.fpRate) === 'crit' ? 'var(--critical)' : fpSev(t.fpRate) === 'warn' ? 'var(--warning)' : 'var(--success)'
                    }" />
                  </div>
                  <Pill v-if="fpSev(t.fpRate) !== 'ok'" :kind="fpSev(t.fpRate) === 'crit' ? 'crit' : 'warn'" dot>
                    {{ fpSev(t.fpRate) === 'crit' ? 'Critical' : 'Warning' }}
                  </Pill>
                </div>
              </td>
              <td>
                <Icons.Chevron :size="12" class="subtle" :style="{ transform: expanded === t.tool ? 'rotate(90deg)' : 'rotate(0)', transition: '.15s' }" />
              </td>
            </tr>
            <!-- Expanded detail row -->
            <tr v-if="expanded === t.tool" style="cursor:default">
              <td colspan="8" style="background:var(--surface-2);padding:14px 18px">
                <template v-if="t.fp > 0">
                  <div class="row" style="gap:8px;margin-bottom:10px">
                    <Icons.AlertOctagon :size="13" style="color:var(--critical)" />
                    <span style="font-size:12.5px;font-weight:550">
                      Sample false-positive sessions — agent claimed to use <code class="mono" style="font-size:12px">{{ t.tool }}</code> but never invoked it
                    </span>
                  </div>
                  <div class="col" style="gap:6px;margin-bottom:14px">
                    <button
                      v-for="sid in t.sampleFPSessions"
                      :key="sid"
                      class="rec-mini"
                      @click="navigateToSession(sid)"
                    >
                      <Icons.AlertOctagon :size="12" style="color:var(--critical)" />
                      <span class="tnum muted" style="min-width:130px">{{ sessionTime(sid) }}</span>
                      <span class="mono">{{ sessionCaller(sid) }}</span>
                      <span class="grow" />
                      <span style="font-size:11.5px;color:var(--critical);font-weight:550">1 FP claim</span>
                      <Icons.ChevronRight :size="12" class="subtle" />
                    </button>
                  </div>
                </template>
                <div v-else class="muted" style="font-size:12.5px;padding:8px 0" :style="{ marginBottom: t.promptSuggestion ? '14px' : '0' }">
                  <Icons.Check :size="12" style="vertical-align:middle;color:var(--success);margin-right:6px" />
                  No false positives in the last {{ tr.windowDays }} days. The agent consistently called this tool when it said it would.
                </div>

                <!-- Per-tool prompt suggestion -->
                <div v-if="t.promptSuggestion" style="padding:14px 16px;background:white;border:1px dashed var(--accent);border-radius:var(--r-md);background-image:linear-gradient(180deg,var(--accent-soft) 0%,white 100%)">
                  <div class="row" style="gap:6px;margin-bottom:6px">
                    <Icons.Sparkles :size="12" style="color:var(--accent)" />
                    <span class="muted" style="font-size:10px;text-transform:uppercase;letter-spacing:.06em;font-weight:700;color:var(--accent)">Copilot · suggested prompt to improve tool honesty</span>
                  </div>
                  <div style="font-size:13px;font-weight:600;line-height:1.35;margin-bottom:5px">{{ t.promptSuggestion.headline }}</div>
                  <div class="muted" style="font-size:11.5px;line-height:1.5;margin-bottom:8px">{{ t.promptSuggestion.whyMatters }}</div>
                  <div class="row" style="gap:8px;margin-bottom:10px;flex-wrap:wrap">
                    <span class="rec-lift"><Icons.Trend :size="11" /> {{ t.promptSuggestion.lift }}</span>
                    <Pill v-if="t.promptSuggestion.severity === 'crit'" kind="crit" dot>High-impact</Pill>
                    <Pill v-else-if="t.promptSuggestion.severity === 'warn'" kind="warn" dot>Worth fixing</Pill>
                    <Pill v-else kind="info">Minor</Pill>
                  </div>
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
                    <div>
                      <div class="muted" style="font-size:10.5px;text-transform:uppercase;letter-spacing:.06em;font-weight:600;margin-bottom:4px">Current behavior</div>
                      <div class="diff" style="font-size:11px;padding:8px 0">
                        <div v-for="(l, li) in t.promptSuggestion.currentBehavior" :key="li" class="diff-line rem">{{ l.replace(/^  /, '') }}</div>
                      </div>
                    </div>
                    <div>
                      <div class="muted" style="font-size:10.5px;text-transform:uppercase;letter-spacing:.06em;font-weight:600;margin-bottom:4px">Suggested prompt</div>
                      <div class="diff" style="font-size:11px;padding:8px 0">
                        <div v-for="(l, li) in t.promptSuggestion.suggestedPrompt" :key="li" class="diff-line add">{{ l.replace(/^  /, '') }}</div>
                      </div>
                    </div>
                  </div>
                  <div class="row" style="justify-content:flex-end;gap:6px;margin-top:10px">
                    <button class="btn sm"><Icons.Copy :size="11" /> Copy prompt</button>
                    <button class="btn sm">Dismiss</button>
                    <button class="btn sm primary"><Icons.Check :size="11" /> Mark applied</button>
                  </div>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- Explainer card -->
    <div class="card">
      <button @click="explainerOpen = !explainerOpen" style="width:100%;padding:14px 18px;display:flex;align-items:center;gap:10px;text-align:left">
        <Icons.Info :size="13" class="muted" />
        <span style="font-size:13px;font-weight:600">What do TP / FP / TN / FN mean in plain language?</span>
        <component :is="explainerOpen ? Icons.ChevronUp : Icons.ChevronDown" :size="13" style="margin-left:auto" />
      </button>
      <div v-if="explainerOpen" style="padding:4px 18px 18px">
        <div class="col" style="gap:10px">
          <div v-for="e in tr.explainer" :key="e.code" class="row" style="gap:10px;align-items:flex-start">
            <span class="mono" :style="{
              fontSize: '11px', fontWeight: 700, padding: '2px 8px',
              background: e.sev === 'crit' ? 'var(--critical-soft)' : e.sev === 'warn' ? 'var(--warning-soft)' : e.sev === 'ok' ? 'var(--success-soft)' : 'var(--surface-2)',
              color: e.sev === 'crit' ? 'var(--critical)' : e.sev === 'warn' ? 'var(--warning)' : e.sev === 'ok' ? 'var(--success)' : 'var(--ink-2)',
              borderRadius: '3px', minWidth: '32px', textAlign: 'center'
            }">{{ e.code }}</span>
            <span style="font-size:12.5px;color:var(--ink-2);line-height:1.5;flex:1">{{ e.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </template>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToolReliability, useSessions } from '@/api/queries'
import { Icons } from '@/components/icons/Icons'
import Pill from '@/components/primitives/Pill.vue'
import Delta from '@/components/primitives/Delta.vue'

const route = useRoute()
const router = useRouter()
const agentId = computed(() => route.params.agentId as string)

const { data: tr, isLoading } = useToolReliability(agentId.value)
const { data: sessions } = useSessions(agentId.value)

const expanded = ref<string | null>('lookup_history')
const explainerOpen = ref(false)

const sorted = computed(() => {
  if (!tr.value) return []
  return [...tr.value.tools]
    .map(t => ({
      ...t,
      total: t.tp + t.fp + t.tn + t.fn,
      fpRate: Math.round(t.fp / (t.tp + t.fp || 1) * 100),
    }))
    .sort((a, b) => b.fpRate - a.fpRate)
})

function fpSev(rate: number): 'crit' | 'warn' | 'ok' {
  return rate >= 20 ? 'crit' : rate >= 10 ? 'warn' : 'ok'
}

function toggleExpand(tool: string) {
  expanded.value = expanded.value === tool ? null : tool
}

function sessionTime(sid: string): string {
  return sessions.value?.find(s => s.id === sid)?.time ?? '—'
}

function sessionCaller(sid: string): string {
  return sessions.value?.find(s => s.id === sid)?.caller ?? sid
}

function navigateToSession(sid: string) {
  router.push(`/agents/${agentId.value}/sessions/${sid}`)
}
</script>
