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
  <article
    class="group flex min-h-56 flex-col rounded-xl border bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/5"
    :class="due.overdue ? 'border-rose-200' : 'border-slate-200'"
  >
    <div class="flex items-start justify-between gap-3">
      <TaskStatusBadge :status="task.status" />
      <div class="flex items-center gap-0.5 opacity-70 transition group-hover:opacity-100">
        <NuxtLink
          :to="`/tasks/${task.id}`"
          class="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          :aria-label="`Edit ${task.title}`"
        >
          <Icon name="lucide:pencil" class="size-4" aria-hidden="true" />
        </NuxtLink>
        <button
          type="button"
          class="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"
          :aria-label="`Delete ${task.title}`"
          @click="$emit('delete', task)"
        >
          <Icon name="lucide:trash-2" class="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>

    <NuxtLink :to="`/tasks/${task.id}`" class="mt-4 rounded-md">
      <h2 class="text-base font-bold text-slate-900 transition group-hover:text-brand-600">{{ task.title }}</h2>
    </NuxtLink>
    <p class="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">{{ task.description || 'No description provided.' }}</p>

    <div class="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4 text-xs font-semibold">
      <span class="inline-flex items-center gap-1.5" :class="due.overdue ? 'text-rose-600' : 'text-slate-500'">
        <Icon :name="due.overdue ? 'lucide:circle-alert' : 'lucide:calendar-days'" class="size-4" aria-hidden="true" />
        {{ due.label }}
      </span>
      <Icon name="lucide:arrow-up-right" class="size-4 text-slate-300 transition group-hover:text-brand-500" aria-hidden="true" />
    </div>
  </article>
</template>
