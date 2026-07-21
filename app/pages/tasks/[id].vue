<script setup lang="ts">
import { isNavigationFailure } from 'vue-router'
import type { Task, TaskPayload } from '#shared/types/task'

const route = useRoute()
const taskStore = useTaskStore()
const { loading } = storeToRefs(taskStore)
const task = ref<Task | null>(null)
const loadError = ref('')
const submitError = ref('')
const deleteError = ref('')
const showDeleteDialog = ref(false)
const updating = ref(false)
const deleting = ref(false)
const taskId = computed(() => String(route.params.id))

useSeoMeta({
  title: () => task.value ? `${task.value.title} · TaskFlow` : 'Task · TaskFlow',
})

try {
  task.value = await taskStore.fetchTask(taskId.value)
}
catch (caughtError) {
  loadError.value = getErrorMessage(caughtError, 'Unable to load this task.')
}

async function handleUpdate(payload: TaskPayload) {
  submitError.value = ''
  updating.value = true

  try {
    task.value = await taskStore.updateTask(taskId.value, payload)
    const navigationResult = await navigateTo(`/?updated=${taskId.value}`)

    if (navigationResult === false || isNavigationFailure(navigationResult)) {
      updating.value = false
    }
  }
  catch (caughtError) {
    updating.value = false
    submitError.value = getErrorMessage(caughtError, 'Unable to update this task. Please try again.')
  }
}

async function handleDelete() {
  deleteError.value = ''
  deleting.value = true

  try {
    await taskStore.deleteTask(taskId.value)
    const navigationResult = await navigateTo('/')

    if (navigationResult === false || isNavigationFailure(navigationResult)) {
      deleting.value = false
    }
  }
  catch (caughtError) {
    deleting.value = false
    deleteError.value = getErrorMessage(caughtError, 'Unable to delete this task. Please try again.')
  }
}

function openDeleteDialog() {
  deleteError.value = ''
  showDeleteDialog.value = true
}
</script>

<template>
  <div class="mx-auto max-w-3xl">
    <UButton to="/" color="neutral" variant="link" icon="i-lucide-arrow-left" label="Back to tasks" class="px-0" />

    <div v-if="loading && !task" class="mt-6 animate-pulse rounded-2xl border border-slate-200 bg-white p-7">
      <div class="h-4 w-24 rounded bg-slate-100" />
      <div class="mt-3 h-8 w-1/2 rounded bg-slate-100" />
      <div class="mt-8 h-80 rounded-xl bg-slate-50" />
    </div>

    <div v-else-if="loadError" class="mt-6">
      <UAlert color="error" variant="subtle" icon="i-lucide-circle-alert" title="Task unavailable" :description="loadError" />
      <UButton color="neutral" variant="outline" label="Return to dashboard" class="mt-4" @click="navigateTo('/')" />
    </div>

    <template v-else-if="task">
      <header class="mb-6 mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div class="flex items-center gap-2">
            <p class="text-sm font-semibold text-brand-600">Task details</p>
            <TaskStatusBadge :status="task.status" />
          </div>
          <h1 class="mt-1 text-3xl font-bold tracking-tight text-slate-950">Edit task</h1>
          <p class="mt-2 text-sm text-slate-500">Update the task details or change its progress.</p>
        </div>
        <UButton color="error" variant="ghost" icon="i-lucide-trash-2" label="Delete" @click="openDeleteDialog" />
      </header>

      <TaskTimeMeta :created-at="task.createdAt" :updated-at="task.updatedAt" class="mb-6 sm:max-w-md" />

      <TaskForm
        :initial-values="task"
        submit-label="Update task"
        :submitting="updating"
        :submit-error="submitError"
        @submit="handleUpdate"
        @cancel="navigateTo('/')"
      />

      <TaskDeleteDialog
        :task="showDeleteDialog ? task : null"
        :deleting="deleting"
        :error="deleteError"
        @close="showDeleteDialog = false"
        @confirm="handleDelete"
      />
    </template>
  </div>
</template>
