<script setup lang="ts">
withDefaults(defineProps<{
  light?: boolean
}>(), {
  light: false,
})
</script>

<template>
  <NuxtLink to="/" class="inline-flex items-center gap-2.5 rounded-lg" aria-label="TaskFlow home">
    <span class="flex size-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm shadow-indigo-200">
      <Icon name="lucide:workflow" class="size-5" aria-hidden="true" />
    </span>
    <span class="text-lg font-bold tracking-tight" :class="light ? 'text-white' : 'text-brand-600'">
      TaskFlow
    </span>
  </NuxtLink>
</template>
