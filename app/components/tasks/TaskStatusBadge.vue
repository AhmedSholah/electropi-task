<script setup lang="ts">
import type { TaskStatus } from '#shared/types/task'
import { taskStatusLabels } from '#shared/types/task'

defineProps<{
  status: TaskStatus
}>()

const styles: Record<TaskStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 ring-amber-600/15',
  in_progress: 'bg-indigo-50 text-indigo-700 ring-indigo-600/15',
  done: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15',
}

const dots: Record<TaskStatus, string> = {
  pending: 'bg-amber-500',
  in_progress: 'bg-indigo-500',
  done: 'bg-emerald-500',
}
</script>

<template>
  <span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset" :class="styles[status]">
    <span class="size-1.5 rounded-full" :class="dots[status]" />
    {{ taskStatusLabels[status] }}
  </span>
</template>
