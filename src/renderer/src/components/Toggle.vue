<template>
  <div class="toggle" :class="{ active: modelValue }" @click="$emit('update:modelValue', !modelValue)">
    <div class="toggle-knob"></div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ modelValue: boolean }>()
defineEmits<{ 'update:modelValue': [value: boolean] }>()
</script>
