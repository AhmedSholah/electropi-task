<script setup lang="ts">
import type { Task, TaskPayload } from '#shared/types/task'

const route = useRoute()
const taskStore = useTaskStore()
const { loading, saving, deletingId } = storeToRefs(taskStore)
const task = ref<Task | null>(null)
const loadError = ref('')
const submitError = ref('')
const deleteError = ref('')
const showDeleteDialog = ref(false)
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

  try {
    task.value = await taskStore.updateTask(taskId.value, payload)
    await navigateTo(`/?updated=${taskId.value}`)
  }
  catch (caughtError) {
    submitError.value = getErrorMessage(caughtError, 'Unable to update this task. Please try again.')
  }
}

async function handleDelete() {
  deleteError.value = ''

  try {
    await taskStore.deleteTask(taskId.value)
    await navigateTo('/')
  }
  catch (caughtError) {
    deleteError.value = getErrorMessage(caughtError, 'Unable to delete this task. Please try again.')
  }
}
</script>

<template>
  <div class="mx-auto max-w-3xl">
    <NuxtLink to="/" class="inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-slate-500 hover:text-slate-900">
      <Icon name="lucide:arrow-left" class="size-4" aria-hidden="true" />
      Back to tasks
    </NuxtLink>

    <div v-if="loading && !task" class="mt-6 animate-pulse rounded-2xl border border-slate-200 bg-white p-7">
      <div class="h-4 w-24 rounded bg-slate-100" />
      <div class="mt-3 h-8 w-1/2 rounded bg-slate-100" />
      <div class="mt-8 h-80 rounded-xl bg-slate-50" />
    </div>

    <div v-else-if="loadError" class="mt-6">
      <BaseAlert variant="error" title="Task unavailable">{{ loadError }}</BaseAlert>
      <BaseButton variant="secondary" class="mt-4" @click="navigateTo('/')">Return to dashboard</BaseButton>
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
        <BaseButton variant="ghost" class="text-rose-600 hover:bg-rose-50" @click="showDeleteDialog = true">
          <Icon name="lucide:trash-2" class="size-4" /> Delete
        </BaseButton>
      </header>

      <BaseAlert v-if="route.query.created" variant="success" class="mb-5">
        Task created successfully. You can continue editing it here.
      </BaseAlert>

      <TaskForm
        :initial-values="task"
        submit-label="Update task"
        :submitting="saving"
        :submit-error="submitError"
        @submit="handleUpdate"
        @cancel="navigateTo('/')"
      />

      <TaskDeleteDialog
        :task="showDeleteDialog ? task : null"
        :deleting="deletingId === task.id"
        :error="deleteError"
        @close="showDeleteDialog = false"
        @confirm="handleDelete"
      />
    </template>
  </div>
</template>
