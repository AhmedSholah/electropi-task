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

function handleOpenChange(open: boolean) {
  if (!open && !props.deleting) {
    emit('close')
  }
}
</script>

<template>
  <UModal
    :open="Boolean(task)"
    :dismissible="!deleting"
    title="Delete this task?"
    :description="task ? `“${task.title}” will be permanently removed. This action cannot be undone.` : ''"
    :ui="{ content: 'sm:max-w-md' }"
    @update:open="handleOpenChange"
  >
    <template #body>
      <div class="flex size-11 items-center justify-center rounded-full bg-error/10 text-error">
        <UIcon name="i-lucide-trash-2" class="size-5" />
      </div>
      <UAlert v-if="error" color="error" variant="subtle" icon="i-lucide-circle-alert" :description="error" class="mt-4" />
    </template>
    <template #footer>
      <div class="flex w-full justify-end gap-3">
        <UButton color="neutral" variant="outline" :disabled="deleting" label="Cancel" @click="emit('close')" />
        <UButton color="error" icon="i-lucide-trash-2" :loading="deleting" :label="deleting ? 'Deleting…' : 'Delete task'" @click="emit('confirm')" />
      </div>
    </template>
  </UModal>
</template>
