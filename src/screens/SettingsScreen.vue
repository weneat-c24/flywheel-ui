<template>
  <div class="page-inner narrow">
    <div class="page-header">
      <h1 class="page-title">Settings</h1>
      <p class="page-sub">Ingestion, connection, team, billing.</p>
    </div>

    <div class="col" style="gap:14px;max-width:840px">
      <!-- Ingestion -->
      <div class="card">
        <div class="card-head">
          <Icons.Webhook :size="14" style="color:var(--success)" />
          <div class="card-title">Ingestion</div>
          <span class="card-sub">where session events stream in</span>
          <span class="row" style="margin-left:auto;gap:6px;font-size:11.5px;color:var(--success);font-weight:550">
            <span style="width:7px;height:7px;border-radius:50%;background:var(--success);animation:pulse 1.4s ease-in-out infinite;display:inline-block" />
            Last event {{ lastEvent }}
          </span>
        </div>
        <div class="card-body col" style="gap:14px">
          <div class="field">
            <label>Webhook URL</label>
            <div class="row" style="gap:6px">
              <code class="mono" style="flex:1;padding:8px 12px;background:var(--surface-2);border-radius:var(--r-sm);font-size:12px;border:1px solid var(--border);overflow-x:auto;white-space:nowrap">
                {{ ingestion?.webhook }}
              </code>
              <button class="btn"><Icons.Copy :size="11" /></button>
            </div>
            <span class="hint">Point your agent platform's session-event hook at this URL.</span>
          </div>
          <div class="field">
            <label>Signing secret</label>
            <div class="row" style="gap:6px">
              <code class="mono" style="flex:1;padding:8px 12px;background:var(--surface-2);border-radius:var(--r-sm);font-size:12px;border:1px solid var(--border)">
                {{ showSecret ? ingestion?.secret : '••••••••••••••••••••••••' }}
              </code>
              <button class="btn" @click="showSecret = !showSecret"><Icons.Eye :size="11" /></button>
              <button class="btn"><Icons.Reset :size="11" /> Rotate</button>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;padding-top:6px;border-top:1px solid var(--border)">
            <div>
              <div class="muted" style="font-size:11px;text-transform:uppercase;letter-spacing:.06em;font-weight:600">Events in last 24h</div>
              <div class="tnum" style="font-size:22px;font-weight:600;margin-top:2px">{{ ingestion?.last24h }}</div>
            </div>
            <div>
              <div class="muted" style="font-size:11px;text-transform:uppercase;letter-spacing:.06em;font-weight:600">Last event received</div>
              <div class="row" style="gap:6px;margin-top:6px">
                <span style="width:8px;height:8px;border-radius:50%;background:var(--success);animation:pulse 1.4s ease-in-out infinite;display:inline-block" />
                <span style="font-size:13.5px;font-weight:550">{{ lastEvent }}</span>
              </div>
            </div>
          </div>

          <!-- Sample payload -->
          <div style="padding-top:6px;border-top:1px solid var(--border)">
            <button @click="payloadOpen = !payloadOpen" class="row" style="gap:6px;font-size:12.5px;font-weight:600;color:var(--ink-1)">
              <component :is="payloadOpen ? Icons.ChevronDown : Icons.Chevron" :size="12" />
              Sample payload (last <code class="mono" style="font-size:11px;padding:1px 5px;background:var(--surface-2);border-radius:3px">session.end</code> event)
            </button>
            <pre v-if="payloadOpen" style="margin-top:10px;padding:14px 16px;background:#0F172A;color:#CBD5E1;border-radius:var(--r-md);font-family:var(--mono);font-size:11.5px;line-height:1.55;overflow-x:auto">
<code>{{ formattedPayload }}</code></pre>
          </div>
        </div>
      </div>

      <!-- GHL Connection -->
      <div class="card">
        <div class="card-head">
          <Icons.GHL :size="14" />
          <div class="card-title">GHL Connection</div>
          <span class="card-sub">GoHighLevel integration</span>
          <Pill kind="ok" dot style="margin-left:auto">Connected</Pill>
        </div>
        <div class="card-body col" style="gap:12px">
          <div class="row" style="gap:14px">
            <div style="flex:1">
              <div class="muted" style="font-size:11px;text-transform:uppercase;letter-spacing:.06em;font-weight:600;margin-bottom:4px">Location ID</div>
              <code class="mono" style="font-size:12.5px">loc_9Kx3mPqRzT</code>
            </div>
            <div style="flex:1">
              <div class="muted" style="font-size:11px;text-transform:uppercase;letter-spacing:.06em;font-weight:600;margin-bottom:4px">Connected since</div>
              <div style="font-size:13px">March 12, 2025</div>
            </div>
          </div>
          <div class="row" style="gap:8px">
            <button class="btn"><Icons.Share :size="11" /> Reconnect</button>
            <RouterLink to="/ghl-panel" class="btn">
              <Icons.GHL :size="11" /> View Copilot panel in GHL
            </RouterLink>
          </div>
        </div>
      </div>

      <!-- Team -->
      <div class="card">
        <div class="card-head">
          <Icons.Shield :size="14" class="muted" />
          <div class="card-title">Team</div>
          <span class="card-sub">1 member</span>
          <button class="btn sm" style="margin-left:auto"><Icons.Plus :size="11" /> Invite</button>
        </div>
        <div style="padding:14px 18px">
          <div class="row" style="gap:10px">
            <Avatar initials="AC" />
            <div>
              <div style="font-weight:550">Avery Chen</div>
              <div class="muted" style="font-size:11.5px">avery@reliableairhvac.com · Owner</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Danger zone -->
      <div class="card" style="border-color:var(--critical-border)">
        <div class="card-head" style="border-bottom-color:var(--critical-border)">
          <Icons.AlertOctagon :size="14" style="color:var(--critical)" />
          <div class="card-title" style="color:var(--critical)">Danger zone</div>
        </div>
        <div class="card-body row" style="gap:10px">
          <button class="btn">Purge all session data</button>
          <button class="btn">Delete account</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useIngestion } from '@/api/queries'
import { Icons } from '@/components/icons/Icons'
import Pill from '@/components/primitives/Pill.vue'
import Avatar from '@/components/primitives/Avatar.vue'

const { data: ingestion } = useIngestion()

const showSecret = ref(false)
const payloadOpen = ref(true)

// Simulate "live" last event updating
const lastEventSeconds = ref(4)
const lastEvent = computed(() => `${lastEventSeconds.value}s ago`)

const formattedPayload = computed(() => {
  if (!ingestion.value?.samplePayload) return ''
  return JSON.stringify(ingestion.value.samplePayload, null, 2)
})
</script>
