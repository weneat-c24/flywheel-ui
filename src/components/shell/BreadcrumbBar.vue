<template>
  <div class="crumbbar">
    <template v-for="(crumb, i) in crumbs" :key="i">
      <span v-if="i > 0" class="crumb-sep">/</span>
      <template v-if="crumb.agentPicker">
        <div style="position:relative">
          <button class="crumb-pick" @click="pickerOpen = !pickerOpen">
            {{ currentAgentName || crumb.label }}
            <Icons.ChevronDown :size="12" />
          </button>
          <template v-if="pickerOpen">
            <div style="position:fixed;inset:0;z-index:55" @click="pickerOpen = false" />
            <div class="pop" style="top:calc(100% + 4px);left:0">
              <button
                v-for="a in agents"
                :key="a.id"
                :class="['pop-item', a.id === currentAgentId ? 'active' : '']"
                @click="() => { $emit('agent-change', a.id); pickerOpen = false }"
              >
                <span :class="'sev ' + (a.passRate >= 85 ? 'ok' : a.passRate >= 70 ? 'warn' : 'crit')" />
                <span class="grow ellipsis">{{ a.name }}</span>
                <span class="muted tnum">{{ a.passRate }}%</span>
              </button>
            </div>
          </template>
        </div>
      </template>
      <template v-else>
        <button v-if="crumb.onClick" :class="['crumb', i === crumbs.length - 1 ? 'current' : '']" @click="crumb.onClick">{{ crumb.label }}</button>
        <span v-else :class="['crumb', i === crumbs.length - 1 ? 'current' : '']">{{ crumb.label }}</span>
      </template>
    </template>
    <div class="crumbbar-right">
      <slot name="right" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icons } from '@/components/icons/Icons'
import type { Agent } from '@/api/types'

const props = defineProps<{
  crumbs: Array<{ label: string; onClick?: () => void; agentPicker?: boolean }>
  agents?: Agent[]
  currentAgentId?: string
}>()

const emit = defineEmits<{ (e: 'agent-change', id: string): void }>()

const pickerOpen = ref(false)
const currentAgentName = computed(() => props.agents?.find(a => a.id === props.currentAgentId)?.name)
</script>
