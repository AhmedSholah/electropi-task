<script setup lang="ts">
import type { TaskSort, TaskStatus } from '#shared/types/task'

defineProps<{
  searchQuery: string
  statusFilter: TaskStatus | 'all'
  sortBy: TaskSort
  hasActiveFilters: boolean
}>()

const emit = defineEmits<{
  'update:searchQuery': [value: string]
  'update:statusFilter': [value: TaskStatus | 'all']
  'update:sortBy': [value: TaskSort]
  'clear': []
}>()

const statusItems = [
  { label: 'All statuses', value: 'all', icon: 'i-lucide-layers-3' },
  { label: 'Pending', value: 'pending', icon: 'i-lucide-circle-dashed' },
  { label: 'In Progress', value: 'in_progress', icon: 'i-lucide-circle-play' },
  { label: 'Done', value: 'done', icon: 'i-lucide-circle-check-big' },
]

const sortItems = [
  { label: 'Active tasks first', value: 'active_due_asc', icon: 'i-lucide-list-checks' },
  { label: 'Nearest due', value: 'due_asc', icon: 'i-lucide-calendar-arrow-up' },
  { label: 'Latest due', value: 'due_desc', icon: 'i-lucide-calendar-arrow-down' },
  { label: 'Recently added', value: 'newest', icon: 'i-lucide-clock-arrow-down' },
]

</script>

<template>
  <UCard class="overflow-hidden shadow-sm" :ui="{ body: 'p-4 sm:p-5' }">
    <div
      class="grid gap-3 sm:grid-cols-2"
      :class="hasActiveFilters
        ? 'lg:grid-cols-[minmax(18rem,1fr)_13rem_14rem_auto]'
        : 'lg:grid-cols-[minmax(18rem,1fr)_13rem_14rem]'"
    >
      <div class="sm:col-span-2 lg:col-span-1">
        <label for="task-search" class="mb-1.5 block text-xs font-bold text-slate-600">Search</label>
        <UInput
          id="task-search"
          :model-value="searchQuery"
          type="search"
          maxlength="100"
          placeholder="Search by task title…"
          icon="i-lucide-search"
          size="lg"
          class="w-full"
          aria-label="Search tasks by title"
          @update:model-value="emit('update:searchQuery', String($event ?? ''))"
        >
          <template v-if="searchQuery" #trailing>
            <UButton
              type="button"
              color="neutral"
              variant="link"
              size="xs"
              icon="i-lucide-x"
              aria-label="Clear task search"
              class="p-0"
              @click="emit('update:searchQuery', '')"
            />
          </template>
        </UInput>
      </div>

      <div>
        <label for="task-status-filter" class="mb-1.5 block text-xs font-bold text-slate-600">Status</label>
        <USelect
          id="task-status-filter"
          :model-value="statusFilter"
          :items="statusItems"
          value-key="value"
          icon="i-lucide-list-filter"
          size="lg"
          class="w-full"
          aria-label="Filter by task status"
          @update:model-value="emit('update:statusFilter', $event as TaskStatus | 'all')"
        />
      </div>

      <div>
        <label for="task-sort" class="mb-1.5 block text-xs font-bold text-slate-600">Sort by</label>
        <USelect
          id="task-sort"
          :model-value="sortBy"
          :items="sortItems"
          value-key="value"
          icon="i-lucide-arrow-up-down"
          size="lg"
          class="w-full"
          aria-label="Sort tasks"
          @update:model-value="emit('update:sortBy', $event as TaskSort)"
        />
      </div>

      <div
        v-if="hasActiveFilters"
        class="flex items-end sm:col-span-2 sm:justify-end lg:col-span-1"
      >
        <UButton
          type="button"
          label="Clear filters"
          icon="i-lucide-filter-x"
          color="neutral"
          variant="soft"
          size="lg"
          class="w-full sm:w-auto"
          @click="emit('clear')"
        />
      </div>
    </div>
  </UCard>
</template>
