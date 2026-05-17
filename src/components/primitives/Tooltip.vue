<template>
  <span class="tt" :data-tip="tip"><slot /></span>
</template>

<script setup lang="ts">
defineProps<{ tip: string }>()
</script>
