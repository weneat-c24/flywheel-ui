<template>
  <div class="seg">
    <button
      v-for="o in opts"
      :key="o"
      :class="modelValue === o ? 'active' : ''"
      @click="$emit('update:modelValue', o)"
    >{{ o }}</button>
  </div>
</template>

<script setup lang="ts">
defineProps<{ modelValue: string }>()
defineEmits<{ (e: 'update:modelValue', v: string): void }>()
const opts = ['24h', '7d', '30d', 'Custom']
</script>
