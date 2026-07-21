<script setup lang="ts">
import type { TaskStatus } from '#shared/types/task'
import type { TaskSort } from '~/stores/tasks'

defineProps<{
  searchQuery: string
  statusFilter: TaskStatus | 'all'
  sortBy: TaskSort
}>()

const emit = defineEmits<{
  'update:searchQuery': [value: string]
  'update:statusFilter': [value: TaskStatus | 'all']
  'update:sortBy': [value: TaskSort]
}>()

const statusItems = [
  { label: 'All statuses', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Done', value: 'done' },
]

const sortItems = [
  { label: 'Due date', value: 'due_asc' },
  { label: 'Latest due', value: 'due_desc' },
  { label: 'Recently added', value: 'newest' },
]
</script>

<template>
  <UCard :ui="{ body: 'p-3' }">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
      <UInput
        :model-value="searchQuery"
        type="search"
        placeholder="Search tasks by title…"
        icon="i-lucide-search"
        size="lg"
        class="min-w-0 flex-1 sm:max-w-sm"
        aria-label="Search tasks by title"
        @update:model-value="emit('update:searchQuery', String($event ?? ''))"
      />

      <div class="grid grid-cols-2 gap-2 sm:flex">
        <USelect
          :model-value="statusFilter"
          :items="statusItems"
          value-key="value"
          size="lg"
          aria-label="Filter by task status"
          @update:model-value="emit('update:statusFilter', $event as TaskStatus | 'all')"
        />
        <USelect
          :model-value="sortBy"
          :items="sortItems"
          value-key="value"
          icon="i-lucide-arrow-up-down"
          size="lg"
          aria-label="Sort tasks"
          @update:model-value="emit('update:sortBy', $event as TaskSort)"
        />
      </div>
    </div>
  </UCard>
</template>
