<template>
  <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="Loading tasks" aria-busy="true">
    <div v-for="item in 6" :key="item" class="h-56 animate-pulse rounded-xl border border-slate-200 bg-white p-5">
      <div class="flex justify-between">
        <div class="h-6 w-24 rounded-full bg-slate-100" />
        <div class="size-8 rounded-lg bg-slate-100" />
      </div>
      <div class="mt-5 h-5 w-2/3 rounded bg-slate-100" />
      <div class="mt-3 h-3 w-full rounded bg-slate-100" />
      <div class="mt-2 h-3 w-5/6 rounded bg-slate-100" />
      <div class="mt-10 h-px bg-slate-100" />
      <div class="mt-4 h-3 w-28 rounded bg-slate-100" />
    </div>
  </div>
</template>
