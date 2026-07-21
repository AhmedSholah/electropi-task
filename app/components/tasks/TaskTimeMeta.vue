<script setup lang="ts">
const props = defineProps<{
  createdAt: string
  updatedAt: string
}>()

const now = ref(Date.now())
const createdLabel = computed(() => formatTaskTimestamp(props.createdAt))
const updatedLabel = computed(() => formatRelativeTime(props.updatedAt, now.value))
let refreshTimer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  refreshTimer = setInterval(() => {
    now.value = Date.now()
  }, 60_000)
})

onBeforeUnmount(() => clearInterval(refreshTimer))
</script>

<template>
  <dl class="grid grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 shadow-sm shadow-slate-900/3" aria-label="Task timestamps">
    <div class="min-w-0">
      <dt class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Created</dt>
      <dd class="mt-0.5 truncate text-sm font-semibold text-slate-700">
        <time :datetime="createdAt">{{ createdLabel }}</time>
      </dd>
    </div>
    <div class="min-w-0">
      <dt class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Last updated</dt>
      <dd class="mt-0.5 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
        <Icon name="lucide:clock-3" class="size-3.5 shrink-0 text-brand-500" aria-hidden="true" />
        <time :datetime="updatedAt" class="truncate">{{ updatedLabel }}</time>
      </dd>
    </div>
  </dl>
</template>
