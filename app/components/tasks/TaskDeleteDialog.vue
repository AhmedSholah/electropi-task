<script setup lang="ts">
import type { Task } from '#shared/types/task'

defineProps<{
  task: Task | null
  deleting?: boolean
  error?: string
}>()

defineEmits<{
  close: []
  confirm: []
}>()

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-150"
      enter-from-class="opacity-0"
      leave-active-class="transition duration-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="task"
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
        role="presentation"
        @click.self="$emit('close')"
        @keydown="handleKeydown"
      >
        <section
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        >
          <span class="flex size-11 items-center justify-center rounded-full bg-rose-50 text-rose-600">
            <Icon name="lucide:trash-2" class="size-5" aria-hidden="true" />
          </span>
          <h2 id="delete-dialog-title" class="mt-4 text-lg font-bold text-slate-900">Delete this task?</h2>
          <p class="mt-2 text-sm leading-6 text-slate-500">
            “{{ task.title }}” will be permanently removed. This action cannot be undone.
          </p>
          <BaseAlert v-if="error" variant="error" class="mt-4">{{ error }}</BaseAlert>
          <div class="mt-6 flex justify-end gap-3">
            <BaseButton variant="secondary" :disabled="deleting" @click="$emit('close')">Cancel</BaseButton>
            <BaseButton variant="danger" :loading="deleting" @click="$emit('confirm')">
              {{ deleting ? 'Deleting…' : 'Delete task' }}
            </BaseButton>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>
