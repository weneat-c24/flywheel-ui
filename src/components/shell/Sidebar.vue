<template>
  <aside class="rail">
    <div class="rail-head">
      <div class="rail-logo"></div>
      <div class="rail-name">
        Copilot
        <small>Voice AI · Observer</small>
      </div>
      <button class="rail-toggle" @click="toggleCollapsed" aria-label="Collapse sidebar">
        <Icons.PanelLeft :size="14" />
      </button>
    </div>
    <div v-if="!collapsed" class="rail-section">Workspace</div>
    <nav class="rail-nav">
      <RouterLink
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        custom
        v-slot="{ isActive, navigate }"
      >
        <button
          :class="['rail-item', isActive || isRouteActive(item) ? 'active' : '']"
          @click="navigate"
        >
          <component :is="item.icon" class="ic" :size="16" />
          <span>{{ item.label }}</span>
          <span v-if="item.count != null && !collapsed" class="count tnum">{{ item.count }}</span>
          <span
            v-if="item.live && !collapsed"
            style="margin-left:auto;width:6px;height:6px;border-radius:50%;background:var(--success);animation:pulse 1.4s ease-in-out infinite"
          />
        </button>
      </RouterLink>
    </nav>
    <div class="rail-foot">
      <div class="avatar">RA</div>
      <div v-if="!collapsed" class="rail-user grow ellipsis">
        <div class="ellipsis"><b>Reliable Air HVAC</b></div>
        <small class="ellipsis">avery@reliableair.io</small>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useUiState } from '@/composables/useUiState'
import { Icons } from '@/components/icons/Icons'

defineProps<{ agentCount?: number }>()

const { collapsed, toggleCollapsed } = useUiState()
const route = useRoute()

const items: Array<{ to: string; label: string; icon: unknown; count?: number; live?: boolean }> = [
  { to: '/overview',  label: 'Overview',     icon: Icons.Home },
  { to: '/agents',    label: 'Agents',       icon: Icons.Agents },
  { to: '/monitor',   label: 'Live stream',  icon: Icons.Activity, live: true },
  { to: '/settings',  label: 'Settings',     icon: Icons.Settings },
]

function isRouteActive(item: { to: string }): boolean {
  if (item.to === '/agents') return route.path.startsWith('/agents')
  return route.path === item.to || route.path.startsWith(item.to + '/')
}
</script>
