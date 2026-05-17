<template>
  <span class="avatar" :style="color ? { background: color } : {}">{{ initials }}</span>
</template>

<script setup lang="ts">
defineProps<{ initials: string; color?: string }>()
</script>
