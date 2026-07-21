<script setup lang="ts">
import type { TaskPayload } from '#shared/types/task'

useSeoMeta({ title: 'Create Task · TaskFlow' })

const taskStore = useTaskStore()
const toast = useToast()
const { saving } = storeToRefs(taskStore)
const submitError = ref('')

async function handleCreate(payload: TaskPayload) {
  submitError.value = ''

  try {
    await taskStore.addTask(payload)
    toast.add({
      title: 'Task created',
      description: 'Your new task was added successfully.',
      color: 'success',
      icon: 'i-lucide-circle-check',
    })
    await navigateTo('/')
  }
  catch (caughtError) {
    submitError.value = getErrorMessage(caughtError, 'Unable to create this task. Please try again.')
  }
}
</script>

<template>
  <div class="mx-auto max-w-3xl">
    <UButton to="/" color="neutral" variant="link" icon="i-lucide-arrow-left" label="Back to tasks" class="px-0" />

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
