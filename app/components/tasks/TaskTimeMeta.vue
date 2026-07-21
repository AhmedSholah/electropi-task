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
  <dl
    class="grid gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3 shadow-sm shadow-slate-900/3 sm:grid-cols-2 sm:gap-0 sm:p-4"
    aria-label="Task timestamps"
  >
    <div class="flex min-w-0 items-center gap-3">
      <span class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 ring-1 ring-inset ring-slate-200">
        <Icon name="lucide:calendar-plus-2" class="size-4" aria-hidden="true" />
      </span>
      <div class="min-w-0">
        <dt class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Created</dt>
        <dd class="mt-0.5 text-sm font-semibold text-slate-700">
          <time :datetime="createdAt">{{ createdLabel }}</time>
        </dd>
      </div>
    </div>

    <div class="flex min-w-0 items-center gap-3 border-t border-slate-200 pt-3 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
      <span class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-100">
        <Icon name="lucide:clock-3" class="size-4" aria-hidden="true" />
      </span>
      <div class="min-w-0">
        <dt class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Last updated</dt>
        <dd class="mt-0.5 text-sm font-semibold text-slate-700">
          <time :datetime="updatedAt">{{ updatedLabel }}</time>
        </dd>
      </div>
    </div>
  </dl>
</template>
