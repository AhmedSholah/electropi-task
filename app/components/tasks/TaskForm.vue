<script setup lang="ts">
import { DateFormatter, getLocalTimeZone, parseDate } from '@internationalized/date'
import type { DateValue } from '@internationalized/date'
import { useForm } from 'vee-validate'
import { onBeforeRouteLeave } from 'vue-router'
import type { AuthUser } from '#shared/types/auth'
import type { TaskPayload } from '#shared/types/task'
import { TASK_STATUSES, taskStatusLabels } from '#shared/types/task'
import { getMinimumDueDate, validateTask } from '#shared/utils/taskValidation'
import {
  ONBOARDING_FIRST_ASSIGNEE,
  ONBOARDING_TASK_FIELD_EVENT,
  type OnboardingTaskFieldDetail,
} from '~/utils/onboardingTour'

const props = withDefaults(defineProps<{
  initialValues?: Partial<TaskPayload>
  submitLabel?: string
  submitting?: boolean
  submitError?: string
  assignableUsers?: AuthUser[]
  assigneeError?: string
  statusOnly?: boolean
  allowNavigation?: boolean
}>(), {
  initialValues: () => ({}),
  submitLabel: 'Save task',
  submitting: false,
  submitError: '',
  assignableUsers: () => [],
  assigneeError: '',
  statusOnly: false,
  allowNavigation: false,
})

const emit = defineEmits<{
  submit: [payload: TaskPayload]
  cancel: []
}>()

const minimumDueDate = getMinimumDueDate()
const minimumCalendarDate = parseDate(minimumDueDate)
const dateFormatter = new DateFormatter('en-US', { dateStyle: 'medium' })
const timeZone = getLocalTimeZone()
const UNASSIGNED_ID = '__unassigned__'
const statusItems = TASK_STATUSES.map(status => ({
  label: taskStatusLabels[status],
  value: status,
}))
const assigneeItems = computed(() => [
  {
    label: 'Unassigned',
    description: 'No user assigned',
    value: UNASSIGNED_ID,
  },
  ...props.assignableUsers.map(user => ({
    label: user.name,
    description: user.email,
    value: user.id,
  })),
])

function getInitialValues(values: Partial<TaskPayload>): TaskPayload {
  return {
    title: values.title ?? '',
    description: values.description ?? '',
    status: values.status ?? 'pending',
    dueDate: values.dueDate ?? '',
    assigneeId: values.assigneeId ?? null,
  }
}

function taskValuesMatch(left: TaskPayload, right: TaskPayload) {
  return left.title === right.title
    && left.description === right.description
    && left.status === right.status
    && left.dueDate === right.dueDate
    && left.assigneeId === right.assigneeId
}

const validSeed: TaskPayload = {
  title: 'Valid task',
  description: '',
  status: 'pending',
  dueDate: minimumDueDate,
  assigneeId: null,
}

function fieldRule(field: keyof TaskPayload) {
  return (value: unknown) => {
    const candidate = { ...validSeed, [field]: value } as TaskPayload
    const validationOptions = field === 'dueDate'
      ? { existingDueDate: props.initialValues.dueDate }
      : undefined

    return validateTask(candidate, validationOptions).errors[field] ?? true
  }
}

const {
  defineField,
  errors,
  handleSubmit,
  resetForm,
  values,
} = useForm<TaskPayload>({
  initialValues: getInitialValues(props.initialValues),
  validationSchema: {
    title: props.statusOnly ? () => true : fieldRule('title'),
    description: props.statusOnly ? () => true : fieldRule('description'),
    status: fieldRule('status'),
    dueDate: props.statusOnly ? () => true : fieldRule('dueDate'),
  },
})

const fieldOptions = { validateOnModelUpdate: false }
const [title, titleProps] = defineField('title', fieldOptions)
const [description, descriptionProps] = defineField('description', fieldOptions)
const [status, statusProps] = defineField('status', fieldOptions)
const [dueDate, dueDateProps] = defineField('dueDate', fieldOptions)
const [assigneeId] = defineField('assigneeId', fieldOptions)
const selectedAssigneeId = computed({
  get: () => assigneeId.value ?? UNASSIGNED_ID,
  set: (value: string) => {
    assigneeId.value = value === UNASSIGNED_ID ? null : value
  },
})
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
const savedValues = ref(getInitialValues(props.initialValues))
const hasUnsavedChanges = computed(() => !props.allowNavigation && !taskValuesMatch(values, savedValues.value))
const showUnsavedChangesDialog = ref(false)
let resolvePendingNavigation: ((shouldLeave: boolean) => void) | undefined

function selectDueDate(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || 'start' in value) {
    return
  }

  dueDate.value = (value as DateValue).toString()
  dueDatePopoverOpen.value = false
}

watch(() => props.initialValues, (values) => {
  const nextValues = getInitialValues(values)
  savedValues.value = nextValues
  resetForm({ values: nextValues })
}, { deep: true })

function handleBeforeUnload(event: BeforeUnloadEvent) {
  if (!hasUnsavedChanges.value) {
    return
  }

  event.preventDefault()
  event.returnValue = ''
}

function handleOnboardingTaskField(event: Event) {
  const { field, value } = (event as CustomEvent<OnboardingTaskFieldDetail>).detail

  if (field === 'title') {
    title.value = value ?? ''
  }
  else if (field === 'description') {
    description.value = value ?? ''
  }
  else if (field === 'status' && TASK_STATUSES.includes(value as TaskPayload['status'])) {
    status.value = value as TaskPayload['status']
  }
  else if (field === 'dueDate') {
    dueDate.value = value ?? ''
  }
  else if (field === 'assigneeId') {
    assigneeId.value = value === ONBOARDING_FIRST_ASSIGNEE
      ? props.assignableUsers[0]?.id ?? null
      : value
  }
}

onBeforeRouteLeave(() => {
  if (!hasUnsavedChanges.value) {
    return true
  }

  showUnsavedChangesDialog.value = true

  return new Promise<boolean>((resolve) => {
    resolvePendingNavigation?.(false)
    resolvePendingNavigation = resolve
  })
})

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload)
  window.addEventListener(ONBOARDING_TASK_FIELD_EVENT, handleOnboardingTaskField)
})
onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
  window.removeEventListener(ONBOARDING_TASK_FIELD_EVENT, handleOnboardingTaskField)
})

function resolveNavigation(shouldLeave: boolean) {
  showUnsavedChangesDialog.value = false
  const resolve = resolvePendingNavigation
  resolvePendingNavigation = undefined
  resolve?.(shouldLeave)
}

const onSubmit = handleSubmit((values) => {
  emit('submit', {
    title: values.title.trim(),
    description: values.description.trim(),
    status: values.status,
    dueDate: values.dueDate,
    assigneeId: values.assigneeId,
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

      <UAlert
        v-if="statusOnly"
        color="primary"
        variant="subtle"
        icon="i-lucide-user-check"
        title="This task was assigned to you"
        description="You can review its details and change its status. Only the owner can edit other information or delete it."
        class="mb-6"
      />

      <div class="space-y-6">
        <UFormField name="title" label="Task title" required :error="errors.title">
          <UInput
            v-model="title"
            v-bind="titleProps"
            data-tour="task-title"
            name="title"
            placeholder="e.g., Q3 Marketing Report"
            :maxlength="100"
            size="lg"
            class="w-full"
            leading-icon="i-lucide-list-todo"
            :disabled="statusOnly"
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
            data-tour="task-description"
            name="description"
            placeholder="Add detailed instructions or context…"
            :maxlength="500"
            :rows="5"
            autoresize
            size="lg"
            class="w-full"
            :disabled="statusOnly"
          />
        </UFormField>

        <div class="grid gap-5 sm:grid-cols-2">
          <UFormField name="status" label="Status" :error="errors.status">
            <USelect
              v-model="status"
              v-bind="statusProps"
              data-tour="task-status"
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
                data-tour="task-due-date"
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
                :disabled="statusOnly"
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

        <UFormField
          v-if="!statusOnly"
          name="assigneeId"
          label="Assign to"
          hint="The assignee can view this task and change only its status."
          :error="assigneeError || errors.assigneeId"
        >
          <USelectMenu
            v-model="selectedAssigneeId"
            data-tour="task-assignee"
            name="assigneeId"
            :items="assigneeItems"
            value-key="value"
            :filter-fields="['label', 'description']"
            :search-input="{ placeholder: 'Search users by name or email…' }"
            size="lg"
            class="w-full"
            icon="i-lucide-user-plus"
          />
        </UFormField>
      </div>

      <div class="mt-8 flex flex-col gap-3 border-t border-default pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div v-if="$slots['footer-leading']" class="flex sm:mr-auto">
          <slot name="footer-leading" />
        </div>
        <div class="flex flex-col-reverse gap-3 sm:ml-auto sm:flex-row">
          <UButton type="button" color="neutral" variant="outline" size="lg" :disabled="submitting" label="Cancel" @click="emit('cancel')" />
          <UButton
            data-tour="task-submit"
            type="submit"
            size="lg"
            icon="i-lucide-check"
            :loading="submitting"
            :label="submitting ? 'Saving…' : submitLabel"
          />
        </div>
      </div>
    </form>

    <TaskUnsavedChangesDialog
      :open="showUnsavedChangesDialog"
      @stay="resolveNavigation(false)"
      @leave="resolveNavigation(true)"
    />
  </UCard>
</template>
