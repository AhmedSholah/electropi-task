<script setup lang="ts">
import type { Task } from '#shared/types/task'

const props = defineProps<{
  task: Task | null
  deleting?: boolean
  error?: string
}>()

const emit = defineEmits<{
  close: []
  confirm: []
}>()

const displayedTask = shallowRef<Task | null>(props.task)

watch(() => props.task, (task) => {
  if (task) {
    displayedTask.value = task
  }
})

function handleOpenChange(open: boolean) {
  if (!open && !props.deleting) {
    emit('close')
  }
}

function handleConfirm() {
  if (!props.deleting) {
    emit('confirm')
  }
}

function handleAfterLeave() {
  if (!props.task) {
    displayedTask.value = null
  }
}
</script>

<template>
  <UModal
    :open="Boolean(task)"
    :dismissible="!deleting"
    :close="{ disabled: deleting }"
    title="Delete this task?"
    :description="displayedTask ? `“${displayedTask.title}” will be permanently removed. This action cannot be undone.` : ''"
    :ui="{
      content: 'sm:max-w-lg',
      header: 'items-start p-5 pe-16 sm:px-6 sm:pe-16',
      wrapper: 'min-w-0',
      title: 'text-lg font-bold text-slate-950',
      description: 'mt-1.5 text-sm leading-6 text-slate-500',
      close: 'top-4.5 end-4.5 rounded-lg ring-1 ring-slate-300 hover:bg-slate-50 sm:end-5.5',
      footer: 'bg-slate-50/70 p-4 sm:px-6',
    }"
    @update:open="handleOpenChange"
    @after:leave="handleAfterLeave"
  >
    <template #footer>
      <div class="w-full">
        <UAlert v-if="error" color="error" variant="subtle" icon="i-lucide-circle-alert" :description="error" class="mb-4" />
        <div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <UButton color="neutral" variant="outline" :disabled="deleting" label="Cancel" class="justify-center" @click="emit('close')" />
          <UButton
            color="error"
            icon="i-lucide-trash-2"
            :loading="deleting"
            :disabled="deleting"
            :label="deleting ? 'Deleting…' : 'Delete task'"
            class="justify-center"
            @click="handleConfirm"
          />
        </div>
      </div>
    </template>
  </UModal>
</template>
