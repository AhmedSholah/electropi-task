<script setup lang="ts">
defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  stay: []
  leave: []
}>()

function handleOpenChange(open: boolean) {
  if (!open) {
    emit('stay')
  }
}
</script>

<template>
  <UModal
    :open="open"
    title="Discard unsaved changes?"
    description="You have changes that haven’t been saved. If you leave this page, those changes will be lost."
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
  >
    <template #footer>
      <div class="flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <UButton
          color="neutral"
          variant="outline"
          label="Keep editing"
          class="justify-center"
          @click="emit('stay')"
        />
        <UButton
          color="error"
          icon="i-lucide-log-out"
          label="Discard and leave"
          class="justify-center"
          @click="emit('leave')"
        />
      </div>
    </template>
  </UModal>
</template>
