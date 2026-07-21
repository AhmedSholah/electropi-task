<script setup lang="ts">
import { useForm } from 'vee-validate'
import type { TaskPayload } from '#shared/types/task'
import { TASK_STATUSES, taskStatusLabels } from '#shared/types/task'
import { getMinimumDueDate, validateTask } from '#shared/utils/taskValidation'

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

const minimumDueDate = getMinimumDueDate()
const statusItems = TASK_STATUSES.map(status => ({
  label: taskStatusLabels[status],
  value: status,
}))

function getInitialValues(values: Partial<TaskPayload>): TaskPayload {
  return {
    title: values.title ?? '',
    description: values.description ?? '',
    status: values.status ?? 'pending',
    dueDate: values.dueDate ?? '',
  }
}

const validSeed: TaskPayload = {
  title: 'Valid task',
  description: '',
  status: 'pending',
  dueDate: minimumDueDate,
}

function fieldRule(field: keyof TaskPayload) {
  return (value: unknown) => {
    const candidate = { ...validSeed, [field]: value } as TaskPayload
    return validateTask(candidate).errors[field] ?? true
  }
}

const {
  defineField,
  errors,
  handleSubmit,
  resetForm,
} = useForm<TaskPayload>({
  initialValues: getInitialValues(props.initialValues),
  validationSchema: {
    title: fieldRule('title'),
    description: fieldRule('description'),
    status: fieldRule('status'),
    dueDate: fieldRule('dueDate'),
  },
})

const fieldOptions = { validateOnModelUpdate: false }
const [title, titleProps] = defineField('title', fieldOptions)
const [description, descriptionProps] = defineField('description', fieldOptions)
const [status, statusProps] = defineField('status', fieldOptions)
const [dueDate, dueDateProps] = defineField('dueDate', fieldOptions)

watch(() => props.initialValues, (values) => {
  resetForm({ values: getInitialValues(values) })
}, { deep: true })

const onSubmit = handleSubmit((values) => {
  emit('submit', {
    title: values.title.trim(),
    description: values.description.trim(),
    status: values.status,
    dueDate: values.dueDate,
  })
})
</script>

<template>
  <UCard :ui="{ body: 'p-5 sm:p-7' }">
    <form novalidate @submit="onSubmit">
      <UAlert
        v-if="submitError"
        color="error"
        variant="subtle"
        icon="i-lucide-circle-alert"
        title="Unable to save task"
        :description="submitError"
        class="mb-6"
      />

      <div class="space-y-6">
        <UFormField name="title" label="Task title" required :error="errors.title">
          <UInput
            v-model="title"
            v-bind="titleProps"
            name="title"
            placeholder="e.g., Q3 Marketing Report"
            :maxlength="100"
            size="lg"
            class="w-full"
            leading-icon="i-lucide-list-todo"
          />
        </UFormField>

        <UFormField
          name="description"
          label="Description"
          :hint="`${description.length} / 500`"
          :error="errors.description"
        >
          <UTextarea
            v-model="description"
            v-bind="descriptionProps"
            name="description"
            placeholder="Add detailed instructions or context…"
            :maxlength="500"
            :rows="5"
            autoresize
            size="lg"
            class="w-full"
          />
        </UFormField>

        <div class="grid gap-5 sm:grid-cols-2">
          <UFormField name="status" label="Status" :error="errors.status">
            <USelect
              v-model="status"
              v-bind="statusProps"
              name="status"
              :items="statusItems"
              value-key="value"
              size="lg"
              class="w-full"
            />
          </UFormField>

          <UFormField name="dueDate" label="Due date" required :error="errors.dueDate">
            <UInput
              v-model="dueDate"
              v-bind="dueDateProps"
              name="dueDate"
              type="date"
              :min="minimumDueDate"
              size="lg"
              class="w-full"
              leading-icon="i-lucide-calendar-days"
            />
          </UFormField>
        </div>
      </div>

      <div class="mt-8 flex flex-col-reverse gap-3 border-t border-default pt-6 sm:flex-row sm:justify-end">
        <UButton type="button" color="neutral" variant="outline" size="lg" :disabled="submitting" label="Cancel" @click="emit('cancel')" />
        <UButton
          type="submit"
          size="lg"
          icon="i-lucide-check"
          :loading="submitting"
          :label="submitting ? 'Saving…' : submitLabel"
        />
      </div>
    </form>
  </UCard>
</template>
