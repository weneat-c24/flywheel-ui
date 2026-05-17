<template>
  <div :class="['app', collapsed ? 'collapsed' : '']">
    <Sidebar />
    <div class="main">
      <TopBar />
      <div class="page">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUiState } from '@/composables/useUiState'
import Sidebar from './Sidebar.vue'
import TopBar from './TopBar.vue'

const { collapsed } = useUiState()
</script>
