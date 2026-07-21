<script setup lang="ts">
import type { ButtonHTMLAttributes } from 'vue'

const props = withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  type?: ButtonHTMLAttributes['type']
  loading?: boolean
  disabled?: boolean
  block?: boolean
}>(), {
  variant: 'primary',
  type: 'button',
  loading: false,
  disabled: false,
  block: false,
})

const classes = computed(() => ({
  primary: 'bg-brand-600 text-white shadow-sm shadow-indigo-200 hover:bg-brand-700 disabled:bg-brand-300',
  secondary: 'border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 disabled:text-slate-400',
  danger: 'bg-rose-600 text-white shadow-sm hover:bg-rose-700 disabled:bg-rose-300',
  ghost: 'text-slate-600 hover:bg-slate-100 disabled:text-slate-400',
}[props.variant]))
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    class="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition disabled:opacity-70"
    :class="[classes, { 'w-full': block }]"
  >
    <Icon v-if="loading" name="lucide:loader-circle" class="size-4 animate-spin" aria-hidden="true" />
    <slot />
  </button>
</template>
