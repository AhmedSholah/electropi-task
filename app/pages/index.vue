<script setup lang="ts">
useSeoMeta({
  title: "Tasks · TaskFlow",
  description: "Manage and track your tasks.",
});

const taskStore = useTaskStore();
const {
  tasks,
  loading,
  error,
  searchQuery,
  statusFilter,
  sortBy,
  currentPage,
  pageSize,
  total,
  totalPages,
  stats,
} = storeToRefs(taskStore);

const hasActiveFilters = computed(
  () => Boolean(searchQuery.value.trim()) || statusFilter.value !== "all",
);
const firstVisibleTask = computed(() =>
  total.value ? (currentPage.value - 1) * pageSize.value + 1 : 0,
);
const lastVisibleTask = computed(() =>
  Math.min(currentPage.value * pageSize.value, total.value),
);
let searchTimer: ReturnType<typeof setTimeout> | undefined;

await taskStore.fetchTasks().catch(() => undefined);

async function refreshTasks() {
  await taskStore.fetchTasks(true).catch(() => undefined);
}

function resetPageOrRefresh() {
  if (currentPage.value !== 1) {
    currentPage.value = 1;
  } else {
    void refreshTasks();
  }
}

watch(searchQuery, () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(resetPageOrRefresh, 350);
});

watch([statusFilter, sortBy], () => {
  clearTimeout(searchTimer);
  resetPageOrRefresh();
});

watch(currentPage, () => {
  void refreshTasks();
});

onBeforeUnmount(() => clearTimeout(searchTimer));
</script>

<template>
  <div>
    <header
      class="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
    >
      <div>
        <h1 class="mt-1 text-3xl font-bold tracking-tight text-slate-950">
          Tasks
        </h1>
        <p class="mt-2 text-sm text-slate-500">
          Manage and track your work efficiently.
        </p>
      </div>
      <UButton
        icon="i-lucide-plus"
        size="lg"
        label="Create task"
        class="shrink-0"
        @click="navigateTo('/tasks/new')"
      />
    </header>

    <TaskStats class="mt-7" :stats="stats" />

    <div class="mt-7">
      <TaskFilters
        v-model:search-query="searchQuery"
        v-model:status-filter="statusFilter"
        v-model:sort-by="sortBy"
        :has-active-filters="hasActiveFilters"
        @clear="taskStore.clearFilters"
      />
    </div>

    <UAlert
      v-if="error && !loading"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      title="Unable to load tasks"
      :description="error"
      class="mt-6"
    >
      <template #actions>
        <UButton
          color="error"
          variant="link"
          label="Try again"
          @click="refreshTasks"
        />
      </template>
    </UAlert>

    <section class="mt-5" aria-label="Tasks">
      <TaskListSkeleton v-if="loading" />
      <div
        v-else-if="!error && tasks.length"
        class="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
      >
        <TaskCard v-for="task in tasks" :key="task.id" :task="task" />
      </div>
      <TaskEmptyState
        v-else-if="!error"
        :filtered="hasActiveFilters"
        @clear="taskStore.clearFilters"
      />
    </section>

    <footer
      v-if="total > 0 && !error"
      class="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between"
      aria-label="Task list pagination"
    >
      <p class="text-sm text-slate-500" aria-live="polite">
        Showing {{ firstVisibleTask }}–{{ lastVisibleTask }} of
        {{ total }} tasks
      </p>
      <UPagination
        v-if="totalPages > 1"
        v-model:page="currentPage"
        :total="total"
        :items-per-page="pageSize"
        :disabled="loading"
        show-edges
        aria-label="Task pages"
      />
    </footer>
  </div>
</template>
