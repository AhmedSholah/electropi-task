<script setup lang="ts">
import type { TaskStatus } from '#shared/types/task'
import { taskStatusLabels } from '#shared/types/task'

defineProps<{
  status: TaskStatus
}>()

const colors: Record<TaskStatus, 'warning' | 'primary' | 'success'> = {
  pending: 'warning',
  in_progress: 'primary',
  done: 'success',
}
</script>

<template>
  <UBadge :color="colors[status]" variant="subtle" size="sm" :label="taskStatusLabels[status]" />
</template>
