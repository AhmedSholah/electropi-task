<script setup lang="ts">
defineProps<{
  stats: {
    total: number
    pending: number
    inProgress: number
    done: number
  }
}>()

const cards = [
  { key: 'total', label: 'Total Tasks', icon: 'lucide:clipboard-list', color: 'text-slate-500', iconBg: 'bg-slate-100' },
  { key: 'pending', label: 'Pending', icon: 'lucide:hourglass', color: 'text-amber-600', iconBg: 'bg-amber-50' },
  { key: 'inProgress', label: 'In Progress', icon: 'lucide:circle-play', color: 'text-indigo-600', iconBg: 'bg-indigo-50' },
  { key: 'done', label: 'Completed', icon: 'lucide:circle-check-big', color: 'text-emerald-600', iconBg: 'bg-emerald-50' },
] as const
</script>

<template>
  <section class="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Task summary">
    <UCard
      v-for="card in cards"
      :key="card.key"
      as="article"
      :ui="{ body: 'p-4 sm:p-5' }"
    >
      <div class="flex items-start justify-between gap-3">
        <span class="flex size-9 items-center justify-center rounded-lg" :class="[card.iconBg, card.color]">
          <Icon :name="card.icon" class="size-4.5" aria-hidden="true" />
        </span>
        <UBadge color="neutral" variant="soft" size="sm" class="hidden uppercase sm:inline-flex">
          {{ card.key === 'inProgress' ? 'Active' : card.key === 'pending' ? 'To-do' : card.key === 'done' ? 'Done' : 'Total' }}
        </UBadge>
      </div>
      <p class="mt-4 text-2xl font-bold tracking-tight text-slate-900">{{ stats[card.key] }}</p>
      <p class="mt-0.5 text-xs font-medium text-slate-500">{{ card.label }}</p>
    </UCard>
  </section>
</template>
