<template>
  <div class="page-inner">
    <div class="page-header page-header-row">
      <div>
        <h1 class="page-title">GHL Panel</h1>
        <p class="page-sub">Preview of the Copilot Insights card as it appears inside GoHighLevel's Voice AI agent view.</p>
      </div>
      <div class="row" style="gap:8px">
        <RouterLink to="/agents/a1/dashboard" class="btn primary">
          Open full Copilot <Icons.ArrowRight :size="11" />
        </RouterLink>
      </div>
    </div>

    <div class="ghl-stage">
      <!-- Fake GHL chrome -->
      <div class="ghl-fake">
        <div style="border-bottom:1px solid var(--border);padding-bottom:14px;margin-bottom:14px;display:flex;align-items:center;gap:10px">
          <span style="width:24px;height:24px;border-radius:5px;background:#2563EB;color:white;display:grid;place-items:center;font-weight:700;font-size:10px">G</span>
          <span style="font-weight:600;color:var(--ink-1)">Voice AI Agent · After-Hours Booking</span>
          <span style="margin-left:auto;font-size:12px" class="muted">native GHL view (mocked)</span>
        </div>
        <div style="padding:30px 20px;text-align:center;color:var(--ink-4);border:1px dashed var(--border-strong);border-radius:var(--r-md);font-size:12px">
          GHL's native agent editor renders here. Copilot Insights ▸
        </div>
        <div class="banner" style="margin-top:20px">
          <Icons.Info :size="14" class="ic" />
          <div>This mock shows where the <b>Copilot Insights</b> card sits in GHL's native Voice AI agent page. The full Copilot app lives in the main nav.</div>
        </div>
      </div>

      <!-- The Copilot panel card -->
      <div>
        <div style="width:360px;background:white;border:1px solid var(--border);border-radius:var(--r-lg);box-shadow:var(--shadow-2);overflow:hidden;font-size:13px;color:var(--ink-1)">
          <!-- Header -->
          <div style="padding:12px 14px;display:flex;align-items:center;gap:10px;border-bottom:1px solid var(--border)">
            <div class="rail-logo" style="width:22px;height:22px;border-radius:5px" />
            <div style="min-width:0;flex:1">
              <div style="font-size:11.5px;color:var(--ink-3);letter-spacing:.04em;text-transform:uppercase;font-weight:600">Copilot Insights</div>
              <div class="ellipsis" style="font-size:12.5px;font-weight:550">After-Hours Booking Agent</div>
            </div>
            <button class="iconbtn" title="Open in Copilot"><Icons.More :size="12" /></button>
          </div>

          <!-- Metrics -->
          <div style="padding:14px 14px 4px">
            <div style="font-size:10.5px;color:var(--ink-3);text-transform:uppercase;letter-spacing:.06em;font-weight:600;margin-bottom:10px">Last 7 days</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">
              <div style="padding:10px 12px;background:var(--surface-2);border-radius:var(--r-md)">
                <div style="font-size:10.5px;color:var(--ink-3)">Pass rate</div>
                <div class="row" style="gap:6px;align-items:baseline">
                  <span class="tnum" style="font-size:20px;font-weight:600;color:var(--critical)">62%</span>
                  <Delta :value="-16" />
                </div>
              </div>
              <div style="padding:10px 12px;background:var(--surface-2);border-radius:var(--r-md)">
                <div style="font-size:10.5px;color:var(--ink-3)">Open recs</div>
                <div class="row" style="gap:6px;align-items:baseline">
                  <span class="tnum" style="font-size:20px;font-weight:600">3</span>
                  <span style="font-size:11px;color:var(--critical)">1 high-impact</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Top failures -->
          <div style="padding:4px 14px 10px">
            <div style="font-size:10.5px;color:var(--ink-3);text-transform:uppercase;letter-spacing:.06em;font-weight:600;margin-bottom:8px">Top 3 failures</div>
            <div
              v-for="(f, i) in topFailures"
              :key="i"
              style="display:flex;align-items:center;gap:8px;padding:6px 0;font-size:12px"
              :style="{ borderTop: i ? '1px solid var(--border)' : 'none' }"
            >
              <span :class="'sev ' + f.sev" />
              <span style="flex:1;min-width:0" class="ellipsis">{{ f.name }}</span>
              <span class="tnum" style="color:var(--ink-3);font-size:11.5px">{{ f.count }} calls</span>
            </div>
          </div>

          <!-- Top recommendation -->
          <div style="padding:10px 14px;border-top:1px solid var(--border);background:var(--warning-soft)">
            <div class="row" style="gap:6px;align-items:flex-start;margin-bottom:6px">
              <Icons.Bulb :size="12" style="color:var(--warning);margin-top:2px;flex-shrink:0" />
              <div style="font-size:10.5px;color:var(--warning);text-transform:uppercase;letter-spacing:.06em;font-weight:600">Top recommendation</div>
            </div>
            <div style="font-size:12.5px;font-weight:550;line-height:1.4;margin-bottom:6px">
              Confirm caller timezone before offering time slots
            </div>
            <div class="row" style="gap:8px;font-size:11px;color:var(--ink-3)">
              <span>Based on 47 calls</span>
              <span>·</span>
              <span class="rec-lift">Est. +18% booking rate</span>
            </div>
          </div>

          <!-- CTA -->
          <div style="padding:10px 14px;border-top:1px solid var(--border)">
            <RouterLink to="/agents/a1/dashboard" class="btn primary" style="width:100%;justify-content:center;height:32px;display:flex">
              Open in Copilot <Icons.ArrowRight :size="11" />
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icons } from '@/components/icons/Icons'
import Delta from '@/components/primitives/Delta.vue'

const topFailures = [
  { name: 'Timezone confirmed before booking', count: 47, sev: 'crit' },
  { name: 'Emergency detection', count: 12, sev: 'warn' },
  { name: 'Appointment booked', count: 8, sev: 'warn' },
]
</script>
