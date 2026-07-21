<script setup lang="ts">
import { DateFormatter, getLocalTimeZone, parseDate } from '@internationalized/date'
import type { DateValue } from '@internationalized/date'
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
const minimumCalendarDate = parseDate(minimumDueDate)
const dateFormatter = new DateFormatter('en-US', { dateStyle: 'medium' })
const timeZone = getLocalTimeZone()
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
const dueDatePopoverOpen = ref(false)
const selectedDueDate = computed(() => {
  if (!dueDate.value) {
    return undefined
  }

  try {
    return parseDate(dueDate.value)
  }
  catch {
    return undefined
  }
})
const dueDateLabel = computed(() => selectedDueDate.value
  ? dateFormatter.format(selectedDueDate.value.toDate(timeZone))
  : 'Select a due date')

function selectDueDate(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || 'start' in value) {
    return
  }

  dueDate.value = (value as DateValue).toString()
  dueDatePopoverOpen.value = false
}

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
            <UPopover v-model:open="dueDatePopoverOpen" :content="{ align: 'end' }">
              <UButton
                v-bind="dueDateProps"
                type="button"
                name="dueDate"
                :color="errors.dueDate ? 'error' : 'neutral'"
                variant="outline"
                size="lg"
                block
                icon="i-lucide-calendar-days"
                trailing-icon="i-lucide-chevron-down"
                :aria-label="dueDate ? `Due date ${dueDateLabel}` : 'Select a due date'"
                :aria-invalid="Boolean(errors.dueDate)"
                class="justify-start font-normal"
                :class="dueDate ? 'text-slate-900' : 'text-slate-500'"
              >
                <span class="flex-1 text-left">{{ dueDateLabel }}</span>
              </UButton>

              <template #content>
                <UCalendar
                  :model-value="selectedDueDate"
                  :min-value="minimumCalendarDate"
                  :default-placeholder="selectedDueDate ?? minimumCalendarDate"
                  prevent-deselect
                  class="p-2"
                  @update:model-value="selectDueDate"
                />
              </template>
            </UPopover>
          </UFormField>
        </div>
      </div>

      <div class="mt-8 flex flex-col gap-3 border-t border-default pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div v-if="$slots['footer-leading']" class="flex sm:mr-auto">
          <slot name="footer-leading" />
        </div>
        <div class="flex flex-col-reverse gap-3 sm:ml-auto sm:flex-row">
          <UButton type="button" color="neutral" variant="outline" size="lg" :disabled="submitting" label="Cancel" @click="emit('cancel')" />
          <UButton
            type="submit"
            size="lg"
            icon="i-lucide-check"
            :loading="submitting"
            :label="submitting ? 'Saving…' : submitLabel"
          />
        </div>
      </div>
    </form>
  </UCard>
</template>
