<script setup lang="ts">
import type { TaskPayload } from '#shared/types/task'
import { TASK_STATUSES, taskStatusLabels } from '#shared/types/task'
import { getMinimumDueDate, validateTask, type TaskValidationErrors } from '#shared/utils/taskValidation'

const props = withDefaults(defineProps<{
  initialValues?: Partial<TaskPayload>
  submitLabel?: string
  submitting?: boolean
  submitError?: string
}>(), {
  initialValues: () => ({}),
  submitLabel: 'Save task',
  submitting: false,
  submitError: '',
})

const emit = defineEmits<{
  submit: [payload: TaskPayload]
  cancel: []
}>()

const form = reactive<TaskPayload>({
  title: '',
  description: '',
  status: 'pending',
  dueDate: '',
})
const errors = ref<TaskValidationErrors>({})
const touched = reactive<Record<keyof TaskPayload, boolean>>({
  title: false,
  description: false,
  status: false,
  dueDate: false,
})
const minimumDueDate = getMinimumDueDate()

function applyInitialValues(values: Partial<TaskPayload>) {
  form.title = values.title ?? ''
  form.description = values.description ?? ''
  form.status = values.status ?? 'pending'
  form.dueDate = values.dueDate ?? ''
  errors.value = {}
  Object.keys(touched).forEach((key) => {
    touched[key as keyof TaskPayload] = false
  })
}

watch(() => props.initialValues, applyInitialValues, { immediate: true, deep: true })

function validateField(field: keyof TaskPayload) {
  touched[field] = true
  const result = validateTask(form)
  errors.value[field] = result.errors[field]
}

function handleSubmit() {
  Object.keys(touched).forEach((key) => {
    touched[key as keyof TaskPayload] = true
  })

  const result = validateTask(form)
  errors.value = result.errors

  if (!result.valid) {
    return
  }

  emit('submit', {
    title: form.title.trim(),
    description: form.description.trim(),
    status: form.status,
    dueDate: form.dueDate,
  })
}
</script>

<template>
  <form class="rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-7" novalidate @submit.prevent="handleSubmit">
    <BaseAlert v-if="submitError" variant="error" title="Unable to save task" class="mb-6">
      {{ submitError }}
    </BaseAlert>

    <div class="space-y-6">
      <BaseInput
        v-model="form.title"
        name="title"
        label="Task title"
        placeholder="e.g., Q3 Marketing Report"
        :maxlength="100"
        :error="touched.title ? errors.title : ''"
        required
        @blur="validateField('title')"
      />

      <div>
        <div class="mb-1.5 flex items-center justify-between gap-3">
          <label for="description" class="text-sm font-semibold text-slate-700">Description</label>
          <span class="text-xs text-slate-400">{{ form.description.length }} / 500</span>
        </div>
        <textarea
          id="description"
          v-model="form.description"
          name="description"
          rows="5"
          maxlength="500"
          placeholder="Add detailed instructions or context…"
          :aria-invalid="Boolean(touched.description && errors.description)"
          class="w-full resize-y rounded-lg border bg-white px-3 py-2.5 text-sm leading-6 text-slate-900 shadow-sm transition placeholder:text-slate-400"
          :class="touched.description && errors.description ? 'border-rose-400' : 'border-slate-200 hover:border-slate-300'"
          @blur="validateField('description')"
        />
        <p v-if="touched.description && errors.description" class="mt-1.5 text-xs font-medium text-rose-600">
          {{ errors.description }}
        </p>
      </div>

      <div class="grid gap-5 sm:grid-cols-2">
        <div>
          <label for="status" class="mb-1.5 block text-sm font-semibold text-slate-700">Status</label>
          <div class="relative">
            <select
              id="status"
              v-model="form.status"
              name="status"
              class="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-10 text-sm text-slate-900 shadow-sm hover:border-slate-300"
              @blur="validateField('status')"
            >
              <option v-for="status in TASK_STATUSES" :key="status" :value="status">
                {{ taskStatusLabels[status] }}
              </option>
            </select>
            <Icon name="lucide:chevron-down" class="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          </div>
          <p v-if="touched.status && errors.status" class="mt-1.5 text-xs font-medium text-rose-600">{{ errors.status }}</p>
        </div>

        <BaseInput
          v-model="form.dueDate"
          name="dueDate"
          label="Due date"
          type="date"
          :min="minimumDueDate"
          :error="touched.dueDate ? errors.dueDate : ''"
          required
          @blur="validateField('dueDate')"
        />
      </div>
    </div>

    <div class="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
      <BaseButton variant="secondary" :disabled="submitting" @click="emit('cancel')">Cancel</BaseButton>
      <BaseButton type="submit" :loading="submitting">
        <Icon v-if="!submitting" name="lucide:check" class="size-4" aria-hidden="true" />
        {{ submitting ? 'Saving…' : submitLabel }}
      </BaseButton>
    </div>
  </form>
</template>
