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
</script>

<template>
  <div class="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-card sm:flex-row sm:items-center">
    <label class="relative min-w-0 flex-1">
      <span class="sr-only">Search tasks by title</span>
      <Icon name="lucide:search" class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
      <input
        :value="searchQuery"
        type="search"
        placeholder="Search tasks by title…"
        class="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm transition placeholder:text-slate-400 hover:border-slate-300 focus:bg-white sm:max-w-sm"
        @input="emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
      >
    </label>

    <div class="grid grid-cols-2 gap-2 sm:flex">
      <label class="relative">
        <span class="sr-only">Filter by task status</span>
        <select
          :value="statusFilter"
          class="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-9 text-sm font-medium text-slate-700 hover:border-slate-300"
          @change="emit('update:statusFilter', ($event.target as HTMLSelectElement).value as TaskStatus | 'all')"
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <Icon name="lucide:chevron-down" class="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
      </label>

      <label class="relative">
        <span class="sr-only">Sort tasks</span>
        <Icon name="lucide:arrow-up-down" class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <select
          :value="sortBy"
          class="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white pl-9 pr-9 text-sm font-medium text-slate-700 hover:border-slate-300"
          @change="emit('update:sortBy', ($event.target as HTMLSelectElement).value as TaskSort)"
        >
          <option value="due_asc">Due date</option>
          <option value="due_desc">Latest due</option>
          <option value="newest">Recently added</option>
        </select>
        <Icon name="lucide:chevron-down" class="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
      </label>
    </div>
  </div>
</template>
