<template>
  <div v-if="isLoading">
    <div class="sk" style="height:80px;margin-bottom:16px;border-radius:var(--r-md)" />
    <div class="sk" style="height:500px;border-radius:var(--r-md)" />
  </div>

  <template v-else-if="session">
    <!-- Back + actions -->
    <div class="between" style="margin-bottom:18px">
      <button class="btn ghost" @click="$router.back()">
        <Icons.ArrowLeft :size="12" /> Back to sessions
      </button>
      <div class="row" style="gap:8px">
        <button class="btn"><Icons.Share :size="12" /> Share link</button>
        <button class="btn"><Icons.Bookmark :size="12" /> Mark reviewed</button>
      </div>
    </div>

    <!-- Header strip -->
    <div class="card" style="padding:14px 18px;margin-bottom:16px;display:grid;grid-template-columns:auto auto 1fr auto auto auto auto;gap:24px;align-items:center">
      <div>
        <div class="muted" style="font-size:11px">Caller</div>
        <div class="mono" style="font-size:13.5px;font-weight:550">{{ session.caller }}</div>
      </div>
      <div>
        <div class="muted" style="font-size:11px">Type</div>
        <SessionType :type="session.type" label />
      </div>
      <div>
        <div class="muted" style="font-size:11px">Started</div>
        <div class="tnum" style="font-size:13.5px;font-weight:550">{{ session.time }}</div>
      </div>
      <div>
        <div class="muted" style="font-size:11px">Duration</div>
        <div class="mono tnum" style="font-size:13.5px;font-weight:550">{{ session.duration }}</div>
      </div>
      <div>
        <div class="muted" style="font-size:11px">Outcome</div>
        <OutcomeBadge :outcome="session.outcome" />
      </div>
      <div>
        <div class="muted" style="font-size:11px">Version</div>
        <button class="mono" @click="$router.push(`/agents/${agentId}/versions`)" style="font-size:13px;font-weight:550;color:var(--accent)">
          {{ session.version }} →
        </button>
      </div>
      <div>
        <div class="muted" style="font-size:11px">Grading</div>
        <div style="font-size:13.5px;font-weight:550">
          <span style="color:var(--critical)">{{ failedCount }} failed</span>
          of {{ session.grading.length }} ·
          <span style="color:var(--critical)">{{ fpTotal }} FP</span>
        </div>
      </div>
    </div>

    <!-- Split layout -->
    <div class="split">
      <!-- Transcript -->
      <div class="card" style="overflow:hidden;min-height:0;display:flex;flex-direction:column">
        <div class="card-head">
          <div class="card-title">Transcript</div>
          <div class="row" style="margin-left:auto;gap:8px">
            <div class="search" style="width:200px;padding:3px 8px">
              <Icons.Search :size="12" />
              <input placeholder="Search transcript…" style="border:0;outline:none;background:transparent;flex:1;font-size:12px;min-width:0" />
            </div>
            <button v-if="session.type === 'voice'" class="btn sm"><Icons.Play :size="11" /> Play audio</button>
          </div>
        </div>
        <div class="legend-bar">
          <span class="row" style="gap:5px">
            <span style="width:10px;height:10px;background:var(--critical-soft);border:1px solid var(--critical-border);border-left:3px solid var(--critical)" />
            External grading flag
          </span>
          <span class="row" style="gap:5px">
            <span style="width:10px;height:10px;background:var(--accent-soft);border:1px dashed var(--accent);border-left:3px dashed var(--accent)" />
            Copilot analysis flag
          </span>
          <span class="row" style="gap:5px">
            <span style="width:10px;height:10px;background:var(--warning-soft);border:1px solid var(--warning-border)" />
            Tool-honesty FP
          </span>
        </div>
        <div class="transcript transcript-scroll">
          <template v-for="(turn, i) in session.transcript" :key="i">
            <!-- Tool call row -->
            <details v-if="turn.spk === 'tool'" class="tr-tool" open>
              <summary>
                <Icons.Chevron :size="12" class="arr" />
                <span class="mono tnum muted" style="min-width:36px">{{ turn.ts }}</span>
                <Icons.Wrench :size="12" class="muted" />
                <code style="color:var(--ink-1)">{{ turn.name }}</code>
                <span style="margin-left:auto" :class="turn.ok ? 'succ' : 'fail'">
                  {{ turn.ok ? '✓' : '✗' }} {{ turn.result }}
                </span>
              </summary>
              <div class="body">
                <div><span class="muted">args:</span> <code>{{ turn.args }}</code></div>
                <div><span class="muted">result:</span> <code>{{ turn.result }}</code></div>
              </div>
            </details>

            <!-- Transcript turn -->
            <div
              v-else
              :ref="el => setTurnRef(turn.ts, el)"
              :class="turnClasses(turn, i)"
            >
              <div class="ts tnum">{{ turn.ts }}</div>
              <div>
                <div class="speaker">{{ turn.spk }}</div>
                <div class="body">{{ turn.text }}</div>
                <div v-if="turn.flagged" class="turn-flag turn-flag-ext">
                  <Icons.AlertOctagon :size="11" />
                  {{ turn.flagText }}
                </div>
                <div v-if="turn.fpFlag" class="turn-flag turn-flag-fp">
                  <Icons.Shield :size="11" />
                  {{ turn.fpText }}
                </div>
                <div v-if="turn.augFlag" class="turn-flag turn-flag-aug">
                  <Icons.Sparkles :size="11" />
                  {{ turn.augText }}
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- Right column -->
      <div style="min-width:0;display:flex;flex-direction:column;gap:14px">
        <!-- External grading -->
        <div class="card">
          <div class="card-head">
            <div class="card-title">External grading</div>
            <span class="card-sub">ground truth</span>
            <span class="mock-tag" style="margin-left:auto">From agent platform</span>
          </div>
          <div style="padding:12px 16px;background:var(--critical-soft);border-bottom:1px solid var(--critical-border)">
            <div class="row" style="gap:8px">
              <Icons.X :size="14" style="color:var(--critical)" />
              <b style="color:var(--critical)">Failed {{ failedCount }} of {{ session.grading.length }} KPIs</b>
            </div>
            <div class="muted" style="font-size:11.5px;margin-top:4px;margin-left:22px">
              {{ critCount }} critical · {{ warnCount }} warning
            </div>
          </div>
          <div>
            <div
              v-for="(g, i) in session.grading"
              :key="i"
              style="padding:12px 16px"
              :style="{ borderTop: i ? '1px solid var(--border)' : 'none' }"
            >
              <div class="row" style="gap:8px;align-items:flex-start">
                <Icons.Check v-if="g.result === 'pass'" :size="14" style="color:var(--success);margin-top:1px;flex-shrink:0" />
                <Icons.X v-else :size="14" :style="{ color: g.sev === 'crit' ? 'var(--critical)' : 'var(--warning)', marginTop: '1px', flexShrink: 0 }" />
                <div style="min-width:0;flex:1">
                  <div class="between" style="gap:8px">
                    <div style="font-size:12.5px;font-weight:550">{{ g.kpi }}</div>
                    <Pill v-if="g.result === 'fail'" :kind="g.sev === 'crit' ? 'crit' : 'warn'" dot>
                      {{ g.sev === 'crit' ? 'Critical' : 'Warning' }}
                    </Pill>
                  </div>
                  <div v-if="g.reasoning" class="muted" style="font-size:11.5px;margin-top:4px;line-height:1.5">
                    {{ g.reasoning }}
                  </div>
                  <button
                    v-if="g.anchorTs"
                    @click="scrollToTurn(g.anchorTs)"
                    style="margin-top:6px;font-size:11.5px;color:var(--accent);font-weight:500;display:inline-flex;align-items:center;gap:4px"
                  >
                    <Icons.Eye :size="11" /> Show evidence at {{ g.anchorTs }}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <!-- Tool honesty inline -->
          <div style="padding:12px 16px;border-top:1px solid var(--border);background:var(--surface-2)">
            <div class="muted" style="font-size:10.5px;text-transform:uppercase;letter-spacing:.06em;font-weight:600;margin-bottom:6px">Tool honesty (this session)</div>
            <div style="display:grid;grid-template-columns:1fr auto auto auto auto;gap:6px;font-size:11.5px">
              <span class="muted" style="font-size:10.5px;text-transform:uppercase;letter-spacing:.04em;font-weight:600">Tool</span>
              <span class="muted tnum" style="font-size:10.5px;text-transform:uppercase">TP</span>
              <span class="muted tnum" style="font-size:10.5px;text-transform:uppercase">FP</span>
              <span class="muted tnum" style="font-size:10.5px;text-transform:uppercase">TN</span>
              <span class="muted tnum" style="font-size:10.5px;text-transform:uppercase">FN</span>
              <template v-for="t in session.toolHonesty" :key="t.tool">
                <code class="mono ellipsis" :style="{ fontSize: '11.5px', color: t.fp > 0 ? 'var(--critical)' : 'var(--ink-1)' }">{{ t.tool }}</code>
                <span class="tnum">{{ t.tp || '' }}</span>
                <span class="tnum" :style="{ color: t.fp > 0 ? 'var(--critical)' : 'var(--ink-4)', fontWeight: t.fp > 0 ? 700 : 400 }">{{ t.fp || '' }}</span>
                <span class="tnum muted">{{ t.tn || '' }}</span>
                <span class="tnum muted">{{ t.fn || '' }}</span>
              </template>
            </div>
          </div>
        </div>

        <!-- Copilot analysis -->
        <div class="card" style="border-style:dashed;border-color:var(--accent);background:linear-gradient(180deg,var(--accent-soft) 0%,white 60%)">
          <div class="card-head" style="border-bottom-style:dashed;border-bottom-color:var(--accent)">
            <Icons.Sparkles :size="13" style="color:var(--accent)" />
            <div class="card-title">Copilot analysis</div>
            <span class="card-sub">findings beyond the external grade</span>
          </div>
          <div>
            <div
              v-for="(f, i) in session.augmentedFindings"
              :key="i"
              style="padding:12px 16px"
              :style="{ borderTop: i ? '1px dashed var(--border)' : 'none' }"
            >
              <div class="row" style="gap:8px;align-items:flex-start">
                <span :class="'sev ' + f.sev" style="margin-top:6px;flex-shrink:0" />
                <div style="min-width:0;flex:1">
                  <div class="between" style="gap:8px">
                    <div style="font-size:12.5px;font-weight:550">{{ f.type }}</div>
                    <span :style="{
                      fontSize: '10.5px', padding: '1px 6px', borderRadius: '3px',
                      border: '1px dashed',
                      borderColor: f.sev === 'crit' ? 'var(--critical-border)' : f.sev === 'warn' ? 'var(--warning-border)' : 'var(--border-strong)',
                      color: f.sev === 'crit' ? 'var(--critical)' : f.sev === 'warn' ? 'var(--warning)' : 'var(--ink-3)',
                      fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em'
                    }">
                      {{ f.sev === 'crit' ? 'Critical' : f.sev === 'warn' ? 'Warning' : 'Info' }}
                    </span>
                  </div>
                  <div class="muted" style="font-size:11.5px;margin-top:4px;line-height:1.5">{{ f.reasoning }}</div>
                  <div class="row" style="margin-top:6px;gap:10px">
                    <button
                      v-if="f.anchorTs"
                      @click="scrollToTurn(f.anchorTs)"
                      style="font-size:11.5px;color:var(--accent);font-weight:500;display:inline-flex;align-items:center;gap:4px"
                    >
                      <Icons.Eye :size="11" /> Show at {{ f.anchorTs }}
                    </button>
                    <button
                      v-if="f.clusterId"
                      @click="$router.push(`/agents/${agentId}/recommendations?focus=${f.clusterId}&type=kpi`)"
                      style="font-size:11.5px;color:var(--accent);font-weight:500;display:inline-flex;align-items:center;gap:4px"
                    >
                      <Icons.Cluster :size="11" /> Contributes to cluster
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div style="padding:10px 16px;border-top:1px dashed var(--accent);background:rgba(238,242,255,0.5);font-size:11.5px;color:var(--ink-2)">
            <Icons.Info :size="11" style="vertical-align:middle;margin-right:4px;color:var(--accent)" />
            This session contributes to
            <button
              @click="$router.push(`/agents/${agentId}/recommendations?focus=sk1&type=kpi`)"
              style="color:var(--accent);font-weight:550"
            >2 open clusters</button> in Recommendations.
          </div>
        </div>
      </div>
    </div>
  </template>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSessionDetail } from '@/api/queries'
import type { TranscriptTurn } from '@/api/types'
import { Icons } from '@/components/icons/Icons'
import Pill from '@/components/primitives/Pill.vue'
import SessionType from '@/components/primitives/SessionType.vue'
import OutcomeBadge from '@/components/primitives/OutcomeBadge.vue'

const route = useRoute()
const router = useRouter()
const agentId = computed(() => route.params.agentId as string)
const sessionId = computed(() => route.params.sessionId as string)

const { data: session, isLoading } = useSessionDetail(sessionId.value)

const highlightTs = ref<string | null>(null)
const turnRefs = ref<Record<string, Element | null>>({})

function setTurnRef(ts: string, el: unknown) {
  turnRefs.value[ts] = el as Element | null
}

function scrollToTurn(ts: string) {
  highlightTs.value = ts
  setTimeout(() => { highlightTs.value = null }, 1600)
  const el = turnRefs.value[ts]
  if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' })
}

function turnClasses(turn: TranscriptTurn, _i: number): string[] {
  const classes = ['tr-turn', turn.spk]
  if (turn.flagged) { classes.push('flagged'); if (turn.flag) classes.push('flag-' + turn.flag) }
  if (turn.fpFlag) classes.push('fp-flag')
  if (turn.augFlag) classes.push('aug-flag')
  if (highlightTs.value === turn.ts) classes.push('hl')
  return classes
}

const failedCount = computed(() => session.value?.grading.filter(g => g.result === 'fail').length ?? 0)
const critCount = computed(() => session.value?.grading.filter(g => g.result === 'fail' && g.sev === 'crit').length ?? 0)
const warnCount = computed(() => session.value?.grading.filter(g => g.result === 'fail' && g.sev === 'warn').length ?? 0)
const fpTotal = computed(() => session.value?.toolHonesty.reduce((s, t) => s + t.fp, 0) ?? 0)
</script>
