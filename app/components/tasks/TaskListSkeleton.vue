<template>
  <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="Loading tasks" aria-busy="true">
    <UCard v-for="item in 6" :key="item" class="h-72" :ui="{ body: 'p-5' }">
      <div class="flex justify-between">
        <USkeleton class="h-6 w-24 rounded-full" />
        <USkeleton class="size-8 rounded-lg" />
      </div>
      <USkeleton class="mt-5 h-5 w-2/3" />
      <USkeleton class="mt-3 h-3 w-full" />
      <USkeleton class="mt-2 h-3 w-5/6" />
      <div class="mt-7 grid grid-cols-2 gap-4 rounded-xl border border-slate-100 bg-slate-50 p-3">
        <USkeleton class="h-8 w-full" />
        <USkeleton class="h-8 w-full" />
      </div>
      <div class="mt-4 h-px bg-slate-100" />
      <USkeleton class="mt-4 h-3 w-28" />
    </UCard>
  </div>
</template>
