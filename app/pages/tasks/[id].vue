<script setup lang="ts">
import { isNavigationFailure } from 'vue-router'
import type { AuthUser } from '#shared/types/auth'
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
const assignableUsers = ref<AuthUser[]>([])
const assigneeError = ref('')
const taskId = computed(() => String(route.params.id))

useSeoMeta({
  title: () => task.value ? `${task.value.title} · TaskFlow` : 'Task · TaskFlow',
})

try {
  task.value = await taskStore.fetchTask(taskId.value)

  if (task.value.access === 'owner') {
    try {
      assignableUsers.value = await useRequestFetch()<AuthUser[]>('/api/users')
    }
    catch (caughtError) {
      assigneeError.value = getErrorMessage(caughtError, 'Unable to load users. The current assignment will be kept unless changed.')
    }
  }
}
catch (caughtError) {
  loadError.value = getErrorMessage(caughtError, 'Unable to load this task.')
}

async function handleUpdate(payload: TaskPayload) {
  submitError.value = ''
  updating.value = true

  try {
    const updatePayload = task.value?.access === 'assignee'
      ? { status: payload.status }
      : payload
    task.value = await taskStore.updateTask(taskId.value, updatePayload)
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
  <div class="mx-auto max-w-4xl">
    <div v-if="loading && !task" class="animate-pulse space-y-4">
      <UCard :ui="{ body: 'p-3 sm:p-4' }">
        <div class="flex items-center gap-3">
          <div class="size-8 rounded-lg bg-slate-100" />
          <div class="min-w-0 flex-1">
            <div class="h-4 w-2/5 rounded bg-slate-100" />
            <div class="mt-2 h-3 w-20 rounded bg-slate-100" />
          </div>
        </div>
      </UCard>
      <div class="h-18 rounded-xl bg-slate-100" />
      <div class="rounded-2xl border border-slate-200 bg-white p-7">
        <div class="h-80 rounded-xl bg-slate-50" />
      </div>
    </div>

    <div v-else-if="loadError">
      <UButton to="/" color="neutral" variant="link" icon="i-lucide-arrow-left" label="Back to tasks" class="mb-5 px-0" />
      <UAlert color="error" variant="subtle" icon="i-lucide-circle-alert" title="Task unavailable" :description="loadError" />
      <UButton color="neutral" variant="outline" label="Return to dashboard" class="mt-4" @click="navigateTo('/')" />
    </div>

    <template v-else-if="task">
      <UCard class="shadow-sm" :ui="{ body: 'p-3 sm:p-4' }">
        <div class="flex flex-wrap items-center gap-3">
          <UButton
            to="/"
            color="neutral"
            variant="ghost"
            icon="i-lucide-arrow-left"
            square
            aria-label="Back to tasks"
          />
          <div class="min-w-32 flex-1">
            <h1 class="truncate font-bold text-slate-950">{{ task.title }}</h1>
            <p class="text-xs text-slate-500">
              {{ task.access === 'owner' ? 'Editing task' : `Assigned by ${task.owner.name}` }}
            </p>
          </div>
        </div>
      </UCard>

      <TaskTimeMeta :created-at="task.createdAt" :updated-at="task.updatedAt" class="mt-4" />

      <TaskForm
        class="mt-4 shadow-sm"
        :initial-values="task"
        :submit-label="task.access === 'owner' ? 'Update task' : 'Update status'"
        :submitting="updating"
        :submit-error="submitError"
        :assignable-users="assignableUsers"
        :assignee-error="assigneeError"
        :status-only="task.access === 'assignee'"
        @submit="handleUpdate"
        @cancel="navigateTo('/')"
      >
        <template #footer-leading>
          <UButton
            v-if="task.access === 'owner'"
            type="button"
            color="error"
            variant="ghost"
            size="lg"
            icon="i-lucide-trash-2"
            label="Delete task"
            :disabled="updating"
            @click="openDeleteDialog"
          />
        </template>
      </TaskForm>

      <TaskDeleteDialog
        v-if="task.access === 'owner'"
        :task="showDeleteDialog ? task : null"
        :deleting="deleting"
        :error="deleteError"
        @close="showDeleteDialog = false"
        @confirm="handleDelete"
      />
    </template>
  </div>
</template>
