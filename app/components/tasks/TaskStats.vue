<script setup lang="ts">
interface SummaryStats {
  total: number
  pending: number
  inProgress: number
  done: number
}

const props = defineProps<{
  stats: SummaryStats
}>()

type StatKey = keyof SummaryStats

const statKeys: StatKey[] = ['total', 'pending', 'inProgress', 'done']
const displayedStats = reactive<SummaryStats>({
  total: 0,
  pending: 0,
  inProgress: 0,
  done: 0,
})
const displayedPercentages = reactive<SummaryStats>({
  total: 0,
  pending: 0,
  inProgress: 0,
  done: 0,
})
let animationFrame: number | undefined

const cards = [
  { key: 'total', label: 'Total Tasks', icon: 'lucide:clipboard-list', color: 'text-slate-500', iconBg: 'bg-slate-100' },
  { key: 'pending', label: 'Pending', icon: 'lucide:hourglass', color: 'text-amber-600', iconBg: 'bg-amber-50' },
  { key: 'inProgress', label: 'In Progress', icon: 'lucide:circle-play', color: 'text-indigo-600', iconBg: 'bg-indigo-50' },
  { key: 'done', label: 'Completed', icon: 'lucide:circle-check-big', color: 'text-emerald-600', iconBg: 'bg-emerald-50' },
] as const

function calculatePercentage(key: StatKey, stats: SummaryStats) {
  if (!stats.total) {
    return 0
  }

  return key === 'total' ? 100 : Math.round((stats[key] / stats.total) * 100)
}

function setDisplayedStats(stats: SummaryStats) {
  statKeys.forEach((key) => {
    displayedStats[key] = stats[key]
    displayedPercentages[key] = calculatePercentage(key, stats)
  })
}

function animateTo(target: SummaryStats) {
  if (animationFrame !== undefined) {
    cancelAnimationFrame(animationFrame)
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setDisplayedStats(target)
    return
  }

  const startValues = { ...displayedStats }
  const startPercentages = { ...displayedPercentages }
  const startTime = performance.now()
  const duration = 650

  function update(timestamp: number) {
    const progress = Math.min((timestamp - startTime) / duration, 1)
    const easedProgress = 1 - (1 - progress) ** 3

    statKeys.forEach((key) => {
      displayedStats[key] = Math.round(startValues[key] + (target[key] - startValues[key]) * easedProgress)
      const targetPercentage = calculatePercentage(key, target)
      displayedPercentages[key] = Math.round(startPercentages[key] + (targetPercentage - startPercentages[key]) * easedProgress)
    })

    if (progress < 1) {
      animationFrame = requestAnimationFrame(update)
    }
    else {
      animationFrame = undefined
    }
  }

  animationFrame = requestAnimationFrame(update)
}

function percentage(key: StatKey) {
  return calculatePercentage(key, props.stats)
}

onMounted(() => animateTo({ ...props.stats }))

watch(() => ({ ...props.stats }), stats => animateTo(stats))

onBeforeUnmount(() => {
  if (animationFrame !== undefined) {
    cancelAnimationFrame(animationFrame)
  }
})
</script>

<template>
  <section aria-label="Task summary">
    <UCard class="overflow-hidden shadow-sm" :ui="{ body: 'p-0 sm:p-0' }">
      <div class="grid grid-cols-2 lg:grid-cols-4">
        <article
          v-for="(card, index) in cards"
          :key="card.key"
          class="flex items-center gap-3 p-4 sm:p-5"
          :aria-label="card.key === 'total'
            ? `${stats[card.key]} ${card.label}`
            : `${stats[card.key]} ${card.label}, ${percentage(card.key)} percent of total`"
          :class="[
            index >= 2 ? 'border-t border-slate-200 lg:border-t-0' : '',
            index % 2 === 1 ? 'border-l border-slate-200' : '',
            index === 2 ? 'lg:border-l lg:border-slate-200' : '',
          ]"
        >
          <span class="flex size-10 shrink-0 items-center justify-center rounded-xl" :class="[card.iconBg, card.color]">
            <Icon :name="card.icon" class="size-5" aria-hidden="true" />
          </span>
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <p class="text-2xl font-bold tracking-tight text-slate-950" aria-hidden="true">{{ displayedStats[card.key] }}</p>
              <span
                v-if="card.key !== 'total'"
                class="rounded-full px-2 py-0.5 text-[10px] font-bold"
                :class="[card.iconBg, card.color]"
              >
                {{ displayedPercentages[card.key] }}%
              </span>
            </div>
            <p class="truncate text-xs font-medium text-slate-500">{{ card.label }}</p>
          </div>
        </article>
      </div>
    </UCard>
  </section>
</template>
