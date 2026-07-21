<script setup lang="ts">
defineProps<{
  filtered?: boolean
}>()

defineEmits<{
  clear: []
}>()
</script>

<template>
  <UEmpty
    :icon="filtered ? 'i-lucide-search-x' : 'i-lucide-clipboard-list'"
    :title="filtered ? 'No matching tasks' : 'No tasks yet'"
    :description="filtered ? 'No tasks match your current search and status filters.' : 'Create your first task to start organizing your work.'"
    variant="outline"
    class="py-16"
  >
    <template #actions>
      <UButton v-if="filtered" color="neutral" variant="outline" label="Clear filters" @click="$emit('clear')" />
      <UButton v-else icon="i-lucide-plus" label="Create first task" @click="navigateTo('/tasks/new')" />
    </template>
  </UEmpty>
</template>
