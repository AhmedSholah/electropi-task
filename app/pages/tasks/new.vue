<script setup lang="ts">
import type { TaskPayload } from '#shared/types/task'

useSeoMeta({ title: 'Create Task · TaskFlow' })

const taskStore = useTaskStore()
const { saving } = storeToRefs(taskStore)
const submitError = ref('')

async function handleCreate(payload: TaskPayload) {
  submitError.value = ''

  try {
    const task = await taskStore.addTask(payload)
    await navigateTo(`/tasks/${task.id}?created=1`)
  }
  catch (caughtError) {
    submitError.value = getErrorMessage(caughtError, 'Unable to create this task. Please try again.')
  }
}
</script>

<template>
  <div class="mx-auto max-w-3xl">
    <NuxtLink to="/" class="inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-slate-500 hover:text-slate-900">
      <Icon name="lucide:arrow-left" class="size-4" aria-hidden="true" />
      Back to tasks
    </NuxtLink>

    <header class="mb-6 mt-5">
      <p class="text-sm font-semibold text-brand-600">New task</p>
      <h1 class="mt-1 text-3xl font-bold tracking-tight text-slate-950">Create a new task</h1>
      <p class="mt-2 text-sm text-slate-500">Add the details below to keep your work clear and actionable.</p>
    </header>

    <TaskForm
      submit-label="Create task"
      :submitting="saving"
      :submit-error="submitError"
      @submit="handleCreate"
      @cancel="navigateTo('/')"
    />
  </div>
</template>
