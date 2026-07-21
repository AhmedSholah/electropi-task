<script setup lang="ts">
import type { Task } from "#shared/types/task";
import { taskStatusLabels } from "#shared/types/task";

const props = defineProps<{
  task: Task;
}>();

const due = computed(() =>
  getTaskDueMeta(props.task.dueDate, props.task.status),
);
const dueDate = computed(() => new Date(`${props.task.dueDate}T12:00:00Z`));
const dueDay = computed(() => dueDate.value.getUTCDate());
const dueMonth = computed(() =>
  new Intl.DateTimeFormat("en", {
    month: "short",
    timeZone: "UTC",
  }).format(dueDate.value),
);
const dateTileAppearance = computed(() => {
  if (due.value.overdue) {
    return {
      border: "border-rose-200",
      header: "bg-rose-500",
      date: "text-rose-700",
    };
  }

  if (props.task.status === "done") {
    return {
      border: "border-emerald-200",
      header: "bg-emerald-500",
      date: "text-emerald-700",
    };
  }

  if (props.task.status === "pending") {
    return {
      border: "border-amber-200",
      header: "bg-amber-500",
      date: "text-amber-700",
    };
  }

  return {
    border: "border-brand-200",
    header: "bg-brand-600",
    date: "text-brand-700",
  };
});
const dueLabelColor = computed(() => {
  if (due.value.overdue) {
    return "text-rose-600";
  }

  if (props.task.status === "done") {
    return "text-emerald-600";
  }

  if (due.value.label === "Due today" || due.value.label === "Due tomorrow") {
    return "text-amber-600";
  }

  return "text-brand-600";
});
</script>

<template>
  <UCard
    as="article"
    class="group min-h-64 bg-white transition duration-200 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl hover:shadow-slate-900/7"
    :class="due.overdue ? 'border-rose-200' : 'border-slate-200'"
    :ui="{ body: 'flex h-full min-h-64 flex-col p-4 sm:p-5' }"
  >
    <div class="flex items-center gap-4">
      <div
        class="flex w-20 shrink-0 flex-col items-center overflow-hidden rounded-xl border bg-white shadow-sm shadow-slate-900/5"
        :class="dateTileAppearance.border"
        :aria-label="`${taskStatusLabels[task.status]}, due ${formatDate(task.dueDate)}`"
      >
        <span
          class="w-full whitespace-nowrap py-1 text-center text-[9px] font-bold uppercase tracking-wider text-white"
          :class="dateTileAppearance.header"
        >
          {{ taskStatusLabels[task.status] }}
        </span>
        <span
          class="pt-2 text-2xl font-bold leading-none"
          :class="dateTileAppearance.date"
          >{{ dueDay }}</span
        >
        <span
          class="pb-2 pt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400"
          >{{ dueMonth }}</span
        >
      </div>

      <div class="min-w-0 flex-1 pt-0.5">
        <ULink
          :to="`/tasks/${task.id}`"
          class="block rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500"
        >
          <h2
            class="line-clamp-2 text-lg font-bold leading-6 tracking-tight transition"
            :class="task.status === 'done'
              ? 'text-slate-500 line-through decoration-2 decoration-slate-400 group-hover:text-slate-600'
              : 'text-slate-950 group-hover:text-brand-600'"
          >
            {{ task.title }}
          </h2>
        </ULink>
      </div>
    </div>

    <p class="mt-4 line-clamp-3 text-sm leading-6 text-slate-500">
      {{ task.description || "No description provided." }}
    </p>

    <div
      v-if="task.access === 'assignee' || task.assignee"
      class="mt-3 flex items-center gap-1.5 text-xs font-semibold text-slate-500"
    >
      <Icon name="lucide:user-round-check" class="size-3.5 shrink-0 text-brand-500" aria-hidden="true" />
      <span class="truncate">
        {{ task.access === 'assignee' ? `Assigned by ${task.owner.name}` : `Assigned to ${task.assignee?.name}` }}
      </span>
    </div>

    <ULink
      :to="`/tasks/${task.id}`"
      class="mt-auto flex items-center justify-between border-t border-slate-100 pt-3.5 text-sm font-semibold transition"
      :aria-label="task.access === 'owner' ? `View and edit ${task.title}` : `Update status for ${task.title}`"
    >
      <span
        class="inline-flex min-w-0 items-center gap-1.5"
        :class="dueLabelColor"
      >
        <Icon
          :name="
            due.overdue
              ? 'lucide:circle-alert'
              : task.status === 'done'
                ? 'lucide:calendar-check'
                : 'lucide:calendar-clock'
          "
          class="size-4 shrink-0"
          aria-hidden="true"
        />
        <span class="truncate">{{ due.label }}</span>
      </span>
      <span
        class="ml-3 inline-flex shrink-0 items-center gap-1.5 text-slate-600 transition group-hover:text-brand-600"
      >
        {{ task.access === 'owner' ? 'View & edit' : 'Update status' }}
        <Icon
          name="lucide:arrow-right"
          class="size-4 transition group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </span>
    </ULink>
  </UCard>
</template>
