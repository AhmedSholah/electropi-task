<template>
  <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="Loading tasks" aria-busy="true">
    <UCard v-for="item in 6" :key="item" class="h-64 overflow-hidden" :ui="{ body: 'p-0' }">
      <div class="p-4 sm:p-5">
        <div class="flex items-start gap-4">
          <USkeleton class="h-20 w-16 shrink-0 rounded-xl" />
          <div class="min-w-0 flex-1 pt-0.5">
            <USkeleton class="h-6 w-20 rounded-full" />
            <USkeleton class="mt-3 h-5 w-4/5" />
            <USkeleton class="mt-2 h-5 w-3/5" />
          </div>
        </div>
        <USkeleton class="mt-4 h-3 w-full" />
        <USkeleton class="mt-2 h-3 w-5/6" />
        <div class="mt-6 border-t border-slate-100 pt-3.5">
          <div class="flex items-center justify-between">
            <USkeleton class="h-4 w-28" />
            <USkeleton class="h-4 w-20" />
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>
