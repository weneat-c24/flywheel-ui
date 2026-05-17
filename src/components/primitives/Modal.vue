<template>
  <Teleport to="body">
    <div v-if="open" class="modal-bg" @click="$emit('close')">
      <div :class="`modal${size === 'lg' ? ' lg' : ''}`" @click.stop>
        <div v-if="title" class="modal-head"><h3>{{ title }}</h3></div>
        <div class="modal-body"><slot /></div>
        <div v-if="$slots.footer" class="modal-foot"><slot name="footer" /></div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{ open: boolean; title?: string; size?: 'sm' | 'lg' }>()
defineEmits<{ (e: 'close'): void }>()
</script>
