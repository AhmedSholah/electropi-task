<script setup lang="ts">
import type { Task } from '#shared/types/task'

const props = defineProps<{
  task: Task
}>()

defineEmits<{
  delete: [task: Task]
}>()

const due = computed(() => getTaskDueMeta(props.task.dueDate, props.task.status))
</script>

<template>
  <UCard
    as="article"
    class="group min-h-72 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/5"
    :class="due.overdue ? 'border-rose-200' : 'border-slate-200'"
    :ui="{ body: 'flex h-full min-h-72 flex-col p-5' }"
  >
    <div class="flex items-start justify-between gap-3">
      <TaskStatusBadge :status="task.status" />
      <div class="flex items-center gap-0.5 opacity-70 transition group-hover:opacity-100">
        <UButton
          :to="`/tasks/${task.id}`"
          icon="i-lucide-pencil"
          color="neutral"
          variant="ghost"
          size="sm"
          square
          :aria-label="`Edit ${task.title}`"
        />
        <UButton
          icon="i-lucide-trash-2"
          color="error"
          variant="ghost"
          size="sm"
          square
          :aria-label="`Delete ${task.title}`"
          @click="$emit('delete', task)"
        />
      </div>
    </div>

    <ULink :to="`/tasks/${task.id}`" class="mt-4 rounded-md">
      <h2 class="text-base font-bold text-slate-900 transition group-hover:text-brand-600">{{ task.title }}</h2>
    </ULink>
    <p class="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">{{ task.description || 'No description provided.' }}</p>

    <TaskTimeMeta :created-at="task.createdAt" :updated-at="task.updatedAt" class="mt-auto" />

    <div class="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4 text-xs font-semibold">
      <span class="inline-flex items-center gap-1.5" :class="due.overdue ? 'text-rose-600' : 'text-slate-500'">
        <Icon :name="due.overdue ? 'lucide:circle-alert' : 'lucide:calendar-days'" class="size-4" aria-hidden="true" />
        {{ due.label }}
      </span>
      <Icon name="lucide:arrow-up-right" class="size-4 text-slate-300 transition group-hover:text-brand-500" aria-hidden="true" />
    </div>
  </UCard>
</template>
