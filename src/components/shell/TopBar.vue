<template>
  <header class="topbar">
    <div class="search">
      <Icons.Search :size="13" />
      <span>Search sessions, agents, KPIs…</span>
      <kbd>⌘K</kbd>
    </div>
    <div class="topbar-right">
      <button class="iconbtn has-dot" aria-label="Notifications">
        <Icons.Bell :size="15" />
      </button>
      <button class="iconbtn" aria-label="Help">
        <Icons.Info :size="15" />
      </button>
      <div style="width:1px;height:20px;background:var(--border);margin:0 4px" />
      <span class="mock-tag" title="Streaming session events from your GHL workspace">
        <span style="width:6px;height:6px;border-radius:50%;background:var(--success);animation:pulse 1.4s ease-in-out infinite" />
        Ingesting · GHL
      </span>
    </div>
  </header>
</template>

<script setup lang="ts">
import { Icons } from '@/components/icons/Icons'
</script>
