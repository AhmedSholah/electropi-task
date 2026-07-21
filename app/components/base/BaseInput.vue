<script setup lang="ts">
withDefaults(defineProps<{
  modelValue: string
  label: string
  name: string
  type?: string
  placeholder?: string
  autocomplete?: string
  required?: boolean
  error?: string
  hint?: string
  min?: string
  maxlength?: number
}>(), {
  type: 'text',
  placeholder: '',
  autocomplete: 'off',
  required: false,
  error: '',
  hint: '',
  min: undefined,
  maxlength: undefined,
})

defineEmits<{
  'update:modelValue': [value: string]
  'blur': []
}>()
</script>

<template>
  <div>
    <label :for="name" class="mb-1.5 block text-sm font-semibold text-slate-700">
      {{ label }} <span v-if="required" class="text-rose-500">*</span>
    </label>
    <div class="relative">
      <slot name="leading" />
      <input
        :id="name"
        :name="name"
        :value="modelValue"
        :type="type"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :required="required"
        :min="min"
        :maxlength="maxlength"
        :aria-invalid="Boolean(error)"
        :aria-describedby="error ? `${name}-error` : hint ? `${name}-hint` : undefined"
        class="h-11 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400"
        :class="[
          error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500' : 'border-slate-200 hover:border-slate-300',
          { 'pl-10': $slots.leading },
        ]"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @blur="$emit('blur')"
      >
    </div>
    <p v-if="error" :id="`${name}-error`" class="mt-1.5 flex items-center gap-1 text-xs font-medium text-rose-600">
      <Icon name="lucide:circle-alert" class="size-3.5" aria-hidden="true" />
      {{ error }}
    </p>
    <p v-else-if="hint" :id="`${name}-hint`" class="mt-1.5 text-xs text-slate-500">{{ hint }}</p>
  </div>
</template>
