<script setup lang="ts">
defineProps<{
  filtered?: boolean
}>()

defineEmits<{
  clear: []
}>()
</script>

<template>
  <div class="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
    <span class="mx-auto flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
      <Icon :name="filtered ? 'lucide:search-x' : 'lucide:clipboard-list'" class="size-5" aria-hidden="true" />
    </span>
    <h2 class="mt-4 text-sm font-bold text-slate-900">{{ filtered ? 'No matching tasks' : 'No tasks yet' }}</h2>
    <p class="mx-auto mt-1 max-w-sm text-sm text-slate-500">
      {{ filtered ? 'No tasks match your current search and status filters.' : 'Create your first task to start organizing your work.' }}
    </p>
    <BaseButton v-if="filtered" variant="secondary" class="mt-5" @click="$emit('clear')">
      Clear filters
    </BaseButton>
    <BaseButton v-else class="mt-5" @click="navigateTo('/tasks/new')">
      <Icon name="lucide:plus" class="size-4" /> Create first task
    </BaseButton>
  </div>
</template>
