<script setup lang="ts">
import type { Task } from '#shared/types/task'

useSeoMeta({
  title: 'Tasks · TaskFlow',
  description: 'Manage and track your tasks.',
})

const taskStore = useTaskStore()
const {
  tasks,
  loading,
  error,
  filteredTasks,
  searchQuery,
  statusFilter,
  sortBy,
  stats,
  deletingId,
} = storeToRefs(taskStore)

const taskToDelete = ref<Task | null>(null)
const deleteError = ref('')
const hasActiveFilters = computed(() => Boolean(searchQuery.value.trim()) || statusFilter.value !== 'all')

await taskStore.fetchTasks().catch(() => undefined)

async function retryFetch() {
  await taskStore.fetchTasks(true).catch(() => undefined)
}

function openDeleteDialog(task: Task) {
  deleteError.value = ''
  taskToDelete.value = task
}

async function confirmDelete() {
  if (!taskToDelete.value) {
    return
  }

  try {
    await taskStore.deleteTask(taskToDelete.value.id)
    taskToDelete.value = null
  }
  catch (caughtError) {
    deleteError.value = getErrorMessage(caughtError, 'Unable to delete this task. Please try again.')
  }
}
</script>

<template>
  <div>
    <header class="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-sm font-semibold text-brand-600">Workspace overview</p>
        <h1 class="mt-1 text-3xl font-bold tracking-tight text-slate-950">Tasks</h1>
        <p class="mt-2 text-sm text-slate-500">Manage and track your work efficiently.</p>
      </div>
      <UButton icon="i-lucide-plus" size="lg" label="Create task" class="shrink-0" @click="navigateTo('/tasks/new')" />
    </header>

    <TaskStats class="mt-7" :stats="stats" />

    <div class="mt-7">
      <TaskFilters
        v-model:search-query="searchQuery"
        v-model:status-filter="statusFilter"
        v-model:sort-by="sortBy"
      />
    </div>

    <UAlert
      v-if="error && !loading"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      title="Unable to load tasks"
      :description="error"
      class="mt-6"
    >
      <template #actions>
        <UButton color="error" variant="link" label="Try again" @click="retryFetch" />
      </template>
    </UAlert>

    <section class="mt-5" aria-label="Tasks">
      <TaskListSkeleton v-if="loading && !tasks.length" />
      <div v-else-if="filteredTasks.length" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <TaskCard
          v-for="task in filteredTasks"
          :key="task.id"
          :task="task"
          @delete="openDeleteDialog"
        />
      </div>
      <TaskEmptyState
        v-else-if="!error"
        :filtered="hasActiveFilters"
        @clear="taskStore.clearFilters"
      />
    </section>

    <TaskDeleteDialog
      :task="taskToDelete"
      :deleting="deletingId === taskToDelete?.id"
      :error="deleteError"
      @close="taskToDelete = null"
      @confirm="confirmDelete"
    />
  </div>
</template>
