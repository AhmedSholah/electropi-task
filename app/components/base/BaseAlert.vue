<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'error' | 'success' | 'info'
  title?: string
}>(), {
  variant: 'info',
  title: '',
})

const styles = {
  error: {
    wrapper: 'border-rose-200 bg-rose-50 text-rose-800',
    icon: 'lucide:circle-alert',
  },
  success: {
    wrapper: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    icon: 'lucide:circle-check',
  },
  info: {
    wrapper: 'border-blue-200 bg-blue-50 text-blue-800',
    icon: 'lucide:info',
  },
}
</script>

<template>
  <div class="flex gap-3 rounded-xl border p-4 text-sm" :class="styles[variant].wrapper" role="alert">
    <Icon :name="styles[variant].icon" class="mt-0.5 size-5 shrink-0" aria-hidden="true" />
    <div class="min-w-0 flex-1">
      <p v-if="title" class="font-semibold">{{ title }}</p>
      <div :class="{ 'mt-0.5': title }">
        <slot />
      </div>
    </div>
  </div>
</template>
