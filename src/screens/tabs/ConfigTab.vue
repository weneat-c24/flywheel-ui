<template>
  <div class="col" style="gap:14px">
    <div class="banner" style="margin-bottom:2px">
      <Icons.Info :size="14" class="ic" />
      <div>
        <b>This is a read-only mirror of the config received from your agent platform.</b>
        To make changes, edit in your platform and a new version will sync automatically.
      </div>
    </div>

    <div class="between" style="margin-bottom:2px">
      <div>
        <div style="font-size:13.5px"><b>Viewing <span class="mono">v4</span></b> · received 1 day ago</div>
        <div class="muted" style="font-size:11.5px;margin-top:2px">From: agent platform · last config snapshot pushed to ingestion endpoint.</div>
      </div>
      <RouterLink :to="`/agents/${agentId}/versions`" class="btn">
        <Icons.History :size="11" /> View previous versions
      </RouterLink>
    </div>

    <!-- System prompt -->
    <div class="card">
      <div class="card-head">
        <Icons.Doc :size="14" class="muted" />
        <div class="card-title">System prompt</div>
        <span class="card-sub">324 tokens</span>
        <span class="mock-tag" style="margin-left:auto">Read-only</span>
      </div>
      <div style="position:relative">
        <div style="display:grid;grid-template-columns:40px 1fr;font-family:var(--mono);font-size:12.5px;line-height:1.7">
          <div style="padding:14px 0;background:var(--surface-2);color:var(--ink-4);text-align:right;user-select:none;border-right:1px solid var(--border)">
            <div v-for="i in 14" :key="i" style="padding:0 10px">{{ i }}</div>
          </div>
          <div style="padding:14px 16px">
            <div>You are <span style="color:var(--accent)">Avery</span>, the after-hours scheduling assistant for <b>Reliable Air HVAC</b>.</div>
            <div>Your job is to book HVAC service appointments, route emergencies, and capture lead information.</div>
            <div style="height:8px"></div>
            <div style="color:var(--ink-3)">// Opening turn</div>
            <div>Greet the caller, identify yourself, ask how you can help.</div>
            <div style="height:8px"></div>
            <div style="color:var(--ink-3)">// Booking flow</div>
            <div>When a caller wants to schedule service:</div>
            <div>&nbsp;&nbsp;1. Confirm service address</div>
            <div>&nbsp;&nbsp;2. Offer available slots from <span style="color:var(--accent)">check_availability</span></div>
            <div>&nbsp;&nbsp;3. Confirm caller timezone before booking</div>
            <div>&nbsp;&nbsp;4. Call <span style="color:var(--accent)">book_appointment</span> with chosen slot</div>
            <div style="height:8px"></div>
            <div style="color:var(--ink-3)">// Emergency handling</div>
            <div>If caller indicates urgency, ask "is this an emergency".</div>
            <div>If yes, immediately call <span style="color:var(--accent)">escalate_emergency</span>.</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tools -->
    <div class="card">
      <div class="card-head">
        <Icons.Wrench :size="14" class="muted" />
        <div class="card-title">Tools</div>
        <span class="card-sub">4 available</span>
        <span class="mock-tag" style="margin-left:auto">Read-only</span>
      </div>
      <div>
        <details
          v-for="(t, i) in tools"
          :key="t.name"
          :style="{ borderTop: i ? '1px solid var(--border)' : 'none' }"
        >
          <summary style="padding:12px 18px;cursor:pointer;list-style:none;display:flex;align-items:center;gap:10px">
            <Icons.ChevronDown :size="12" class="muted" />
            <code class="mono" style="font-size:13px;font-weight:550">{{ t.name }}</code>
            <span class="muted" style="font-size:11.5px">{{ t.description }}</span>
            <span style="margin-left:auto"><Pill kind="ok" dot>Available</Pill></span>
          </summary>
        </details>
      </div>
    </div>

    <!-- Voice & model -->
    <div class="card">
      <div class="card-head">
        <Icons.Mic :size="14" class="muted" />
        <div class="card-title">Voice &amp; model</div>
        <span class="mock-tag" style="margin-left:auto">Read-only</span>
      </div>
      <div class="card-body" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px">
        <div>
          <div class="muted" style="font-size:11px;text-transform:uppercase;letter-spacing:.04em;font-weight:600;margin-bottom:4px">Voice</div>
          <div style="font-size:13px">Avery — Warm female (en-US)</div>
        </div>
        <div>
          <div class="muted" style="font-size:11px;text-transform:uppercase;letter-spacing:.04em;font-weight:600;margin-bottom:4px">Model</div>
          <code class="mono" style="font-size:12.5px">gpt-4o-mini-realtime</code>
        </div>
        <div>
          <div class="muted" style="font-size:11px;text-transform:uppercase;letter-spacing:.04em;font-weight:600;margin-bottom:4px">Temperature</div>
          <span class="mono tnum">0.40</span>
        </div>
      </div>
    </div>

    <!-- VAD config -->
    <details class="card">
      <summary style="padding:14px 18px;cursor:pointer;list-style:none;display:flex;align-items:center;gap:10px;font-weight:600;font-size:13px">
        <Icons.ChevronDown :size="12" class="muted" />
        VAD configuration
        <span class="muted" style="font-size:11.5px;font-weight:400">Voice activity detection</span>
      </summary>
    </details>

    <!-- Post-call analytics -->
    <details class="card">
      <summary style="padding:14px 18px;cursor:pointer;list-style:none;display:flex;align-items:center;gap:10px;font-weight:600;font-size:13px">
        <Icons.ChevronDown :size="12" class="muted" />
        Post-call analytics endpoints
        <span class="muted" style="font-size:11.5px;font-weight:400">where the platform pushes session-end data</span>
      </summary>
    </details>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Icons } from '@/components/icons/Icons'
import Pill from '@/components/primitives/Pill.vue'

const route = useRoute()
const agentId = computed(() => route.params.agentId as string)

const tools = [
  { name: 'check_availability', description: 'Look up appointment slots' },
  { name: 'book_appointment',   description: 'Create a service appointment' },
  { name: 'lookup_history',     description: 'Pull caller account & past service history' },
  { name: 'escalate_emergency', description: 'Route emergency to on-call dispatcher' },
]
</script>
