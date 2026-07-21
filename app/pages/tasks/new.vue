<script setup lang="ts">
import { isNavigationFailure } from 'vue-router'
import type { AuthUser } from '#shared/types/auth'
import type { TaskPayload } from '#shared/types/task'

useSeoMeta({ title: 'Create Task · TaskFlow' })

const taskStore = useTaskStore()
const toast = useToast()
const submitError = ref('')
const submitting = ref(false)
const assignableUsers = ref<AuthUser[]>([])
const assigneeError = ref('')

try {
  assignableUsers.value = await useRequestFetch()<AuthUser[]>('/api/users')
}
catch (caughtError) {
  assigneeError.value = getErrorMessage(caughtError, 'Unable to load users. You can still create an unassigned task.')
}

async function handleCreate(payload: TaskPayload) {
  submitError.value = ''
  submitting.value = true

  try {
    await taskStore.addTask(payload)
    toast.add({
      title: 'Task created',
      description: 'Your new task was added successfully.',
      color: 'success',
      icon: 'i-lucide-circle-check',
    })
    const navigationResult = await navigateTo('/')

    if (navigationResult === false || isNavigationFailure(navigationResult)) {
      submitting.value = false
    }
  }
  catch (caughtError) {
    submitting.value = false
    submitError.value = getErrorMessage(caughtError, 'Unable to create this task. Please try again.')
  }
}
</script>

<template>
  <div class="mx-auto max-w-4xl">
    <UCard class="shadow-sm" :ui="{ body: 'p-3 sm:p-4' }">
      <div class="flex items-center gap-3">
        <UButton
          to="/"
          color="neutral"
          variant="ghost"
          icon="i-lucide-arrow-left"
          square
          aria-label="Back to tasks"
        />
        <div class="min-w-0 flex-1">
          <h1 class="truncate font-bold text-slate-950">Create a new task</h1>
          <p class="text-xs text-slate-500">New task</p>
        </div>
      </div>
    </UCard>

    <TaskForm
      class="mt-4 shadow-sm"
      submit-label="Create task"
      :submitting="submitting"
      :submit-error="submitError"
      :assignable-users="assignableUsers"
      :assignee-error="assigneeError"
      @submit="handleCreate"
      @cancel="navigateTo('/')"
    />
  </div>
</template>
